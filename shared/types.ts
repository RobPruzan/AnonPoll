import { PriorityQueue } from '@/context/TransactionQueueContext';
import { BaseSocketAction } from '@/lib/types';
import { withMeta } from '@/redux/store';
import { type io } from 'socket.io-client';

export type Meta = {
  actionID: string;
  userID: string | null;
  roomID: string | null;
  timeStamp: number;
  fromServer?: boolean;
  socketMeta?: {
    socket: ReturnType<typeof io>;
    routeCB?: () => void;
  };
  pQueue: PriorityQueue<BaseSocketAction>;
};
export type SocketAction = { type: string; payload: any; meta: Meta };

export type FirstParameter<T> = T extends (arg: infer R) => any ? R : never;
export type SecondParameter<T> = T extends (arg1: any, arg: infer R) => any
  ? R
  : never;

export type Answer = {
  id: string;
  text: string;
};
export type Question = {
  id: string;
  text: string;
  answers: Array<Answer>;
  correct_answer: Answer;
};

export type Vote = {
  ansID: string;
  userID: string;
};

export type Poll = {
  id: string;
  question: Question;
  votes: Array<Vote>;
  createdAt: number;
};

export type Room = {
  roomID: string;
  user_ids: Array<string>;
  polls: Array<Poll>;
  createdAt: number;
};

export type ConnectAck = (value: Array<BaseSocketAction> | 'error') => void;
export type Role = 'admin' | 'user';
export type User = { id: string | null; role: Role };

export type VotePayload = { vote: Vote } & Pick<Room, 'roomID'> & {
    poll: Pick<Poll, 'id'>;
  };
