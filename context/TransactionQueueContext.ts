import { BaseSocketAction, SocketAction } from '@/lib/types';
import { MutableRefObject, createContext, useContext } from 'react';

export class PNode<T> {
  item: T;
  priority: number;

  constructor(n: { item: T; priority: number }) {
    this.item = n.item;
    this.priority = n.priority;
  }
}

export class PriorityQueue<T> {
  private collection: Array<PNode<T>>;

  constructor(collection?: {
    items: Array<T>;
    priorityFN: (item: T) => { priority: number; item: T };
  }) {
    const newCollection =
      collection?.items
        .map((item) => collection.priorityFN(item))
        .sort((a, b) => a.priority - b.priority)
        .map((item) => new PNode(item)) ?? [];

    this.collection = newCollection;
  }

  public dequeue(): T | null {
    return this.collection.pop()?.item ?? null;
  }

  public enqueue(item: PNode<T>) {
    const index = this.collection.findIndex(
      (cItem) => item.priority < cItem.priority
    );

    const LHS = this.collection.filter((_, cIndex) => cIndex < index);
    const RHS = this.collection.filter((_, cIndex) => cIndex >= index);

    const merged = LHS.concat([item]).concat(RHS);

    this.collection = merged;
  }

  public peek() {
    return this.collection.at(-1) ?? null;
  }

  public applyOnAll(applyFN: (n: PNode<T>) => unknown) {
    this.collection.forEach(applyFN);
  }
}

type TransactionQueueContextType = {
  pQueueRef: MutableRefObject<PriorityQueue<BaseSocketAction>>;
  // heap: heap;
};

export const TransactionQueueContext =
  createContext<TransactionQueueContextType | null>(null);

export const useTransactionQueueContext = () => {
  const context = useContext(TransactionQueueContext);
  if (!context || !context.pQueueRef) {
    throw new Error(
      'useTransactionQueueContext must be used within a Transaction Queue Provider'
    );
  }
  return context;
};
