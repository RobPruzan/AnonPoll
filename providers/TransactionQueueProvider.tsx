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
      priorityFN: (item) => ({ priority: item.meta?.timeStamp ?? -1, item }),
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