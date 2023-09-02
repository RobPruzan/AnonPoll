import { withMeta } from '@/redux/store';
import { type io } from 'socket.io-client';

export type Meta = {
  userID: string | null;
  pollID: string | null;
  fromServer?: boolean;
  socketMeta?: {
    socket: ReturnType<typeof io>;
    routeCB: () => void;
  };
};
export type SocketAction = { type: string; payload: any; meta: Meta };

export type FirstParameter<T> = T extends (arg: infer R) => any ? R : never;
export type SecondParameter<T> = T extends (arg1: any, arg: infer R) => any
  ? R
  : never;
