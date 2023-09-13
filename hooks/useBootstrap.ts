import { useAppSelector } from '@/redux/store';
import { useEffect, useState } from 'react';
import { useRoomID } from './useRoomID';
import { run } from '@/lib/utils';
import {
  PNode,
  useTransactionQueueContext,
} from '@/context/TransactionQueueContext';
import { BaseSocketAction } from '@/lib/types';
import { useDispatch } from 'react-redux';

export const useBootstrap = () => {
  const roomID = useRoomID();
  const apiURL =
    typeof window !== 'undefined' ? window.location.origin : '' + '/api';

  const pQueue = useTransactionQueueContext().pQueueRef.current;
  const room = useAppSelector((store) =>
    store.rooms.items.find((item) => item.roomID === roomID)
  );
  const dispatch = useDispatch();
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (room && !fetched) {
      run(async () => {
        setFetched(true);
        // weird requirment which will change, but this is complimentary bootstrap, if the original bootstrap never fired (/never dispatched anything)
        const res = await fetch(apiURL + '/bootstrap?amount=50', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomID,
          }),
        });

        const actions: Array<BaseSocketAction> = await res.json();

        actions.forEach((a) => {
          if (!pQueue.collection.some((n) => n.id === a.meta.actionID)) {
            pQueue.enqueue(
              new PNode({
                item: a,
                priority: a.meta.timeStamp,
                id: a.meta.actionID,
              })
            );
          }
        });

        pQueue.collection.forEach((n) => {
          if (!pQueue.dispatched.has(n.id)) {
            dispatch(n.item);
            pQueue.dispatched.add(n.id);
          }
        });

        pQueue.clear();
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room !== undefined]);
};
