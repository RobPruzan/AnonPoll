import { useAppSelector } from '@/redux/store';
import { useEffect } from 'react';
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

  const pQueue = useTransactionQueueContext().pQueueRef.current;
  const room = useAppSelector((store) =>
    store.rooms.items.find((item) => item.roomID === roomID)
  );
  const dispatch = useDispatch();

  useEffect(() => {
    console.log('trying to run');
    if (room) {
      console.log('running fetch', pQueue.collection);
      run(async () => {
        const res = await fetch(
          process.env.NEXT_PUBLIC_API_URL + '/bootstrap?amount=50',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              roomID,
            }),
          }
        );

        const actions: Array<BaseSocketAction> = await res.json();
        console.log('before enq', pQueue.ids);
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
        console.log('dispatching for a second time', pQueue.ids);
        pQueue.collection.forEach((n) => {
          !pQueue.dispatched.has(n.id) && dispatch(n.item);
        });

        pQueue.clear();
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room !== undefined]);
};
