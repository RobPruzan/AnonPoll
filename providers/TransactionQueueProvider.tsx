import {
  PriorityQueue,
  TransactionQueueContext,
} from '@/context/TransactionQueueContext';
import { SocketAction } from '@/lib/types';
import React, { useRef } from 'react';

type Props = {
  children: React.ReactNode;
};

const TransactionQueueProvider = ({ children }: Props) => {
  const pQueueRef = useRef(
    new PriorityQueue<SocketAction>({
      items: [],
      priorityFN: (item) => {
        console.log('poopy', item.meta.timeStamp);
        return {
          priority: item.meta.timeStamp ?? -1,
          item,
          id: item.meta.actionID,
        };
      },
    })
  );
  return (
    <TransactionQueueContext.Provider
      value={{
        pQueueRef,
      }}
    >
      {children}
    </TransactionQueueContext.Provider>
  );
};

export default TransactionQueueProvider;
