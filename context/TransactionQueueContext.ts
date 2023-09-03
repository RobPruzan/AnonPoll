import { BaseSocketAction, SocketAction } from '@/lib/types';
import { Item } from '@radix-ui/react-dropdown-menu';
import assert, { doesNotMatch } from 'assert';
import { MutableRefObject, createContext, useContext } from 'react';

export class PNode<T> {
  item: T;
  priority: number;
  id: string;

  constructor(n: { item: T; priority: number; id: string }) {
    this.item = n.item;
    this.priority = n.priority;
    this.id = n.id;
  }
}

export class PriorityQueue<T> {
  public collection: Array<PNode<T>>;

  constructor(collection?: {
    items: Array<T>;
    priorityFN: (item: T) => { priority: number; item: T; id: string };
  }) {
    const newCollection =
      collection?.items
        .map((item) => collection.priorityFN(item))
        .sort((a, b) => a.priority - b.priority)
        .map((item) => new PNode(item)) ?? [];

    this.collection = newCollection;
  }

  public dequeue(apply: (item: PNode<T>) => unknown): T | null {
    const popped = this.collection.pop();
    if (popped) {
      apply(popped);
    }
    console.log('called');
    return this.collection.pop()?.item ?? null;
  }

  public enqueue(item: PNode<T>) {
    // assert(!!item.id);
    // sorted here
    const index = this.collection.findIndex(
      (cItem) => item.priority < cItem.priority
    );

    if (index === -1) {
      this.collection = this.collection.concat([item]);
      return;
    }
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

  public dequeueAll(apply: (item: PNode<T>) => unknown) {
    while (this.collection.length > 0) {
      this.dequeue(apply);
    }
    this.collection = [];
  }

  public clear() {
    this.collection = [];
  }

  public deDuplicate() {
    const seenIDs = new Set();
    this.collection = this.collection.filter((node) => {
      // console.log('vhat', !seenIDs.has(node.id));
      console.log(
        'iterating through the following node for dedeup with id:',
        node.id
      );
      if (!seenIDs.has(node.id)) {
        // console.log('keeping', node.id);
        seenIDs.add(node.id);
        return true;
      }
      // console.log('getting rid of', node.id);
      return false;
    });
  }

  public log() {
    console.log(this.collection.map((c) => c.item));
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
