import { withMeta } from '@/redux/store';
import { type io } from 'socket.io-client';

export type Meta = {
  userID: string | null;
  pollID: string | null;
  fromServer?: boolean;
  socket?: ReturnType<typeof io>;
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
export type Poll = {
  id: string;
  question: Question;
};

export type Room = {
  code: string;
  user_ids: Array<string>;
  polls: Array<Poll>;
};

export type ConnectAck = (value: Room) => void;
