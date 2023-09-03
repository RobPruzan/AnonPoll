import { withMeta } from '@/redux/store';
import { Meta } from '@/shared/types';
import { type io } from 'socket.io-client';

export type SocketAction = BaseSocketAction & { meta?: Meta };
export type BaseSocketAction = {
  type: string;
  payload: any;
  meta: Pick<Meta, 'timeStamp'>;
};
export type FirstParameter<T> = T extends (arg: infer R) => any ? R : never;
export type SecondParameter<T> = T extends (arg1: any, arg: infer R) => any
  ? R
  : never;
export type OnCB = SecondParameter<ReturnType<typeof io>['on']>;
