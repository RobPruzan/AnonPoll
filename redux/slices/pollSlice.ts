import { createSlice } from '@reduxjs/toolkit';
import { withMeta } from '../store';
import { FirstParameter } from '@/lib/types';
type Answer = {
  id: string;
  text: string;
};
type Question = {
  id: string;
  text: string;
  answers: Array<Answer>;
  correct_answer: Answer;
};
type Poll = {
  id: string;
  questions: Array<Question>;
};
type State = {
  polls: Array<Poll>;
};
const initialState: State = {
  polls: [],
};
export type MetaParams<TPayload> = FirstParameter<
  typeof withMeta<TPayload, State>
>;
const withPollMeta = <TPayload>(args: MetaParams<TPayload>) =>
  withMeta<TPayload, State>(args);

export const pollSlice = createSlice({
  initialState,
  name: 'poll',
  reducers: {
    addPoll: withPollMeta<Poll>((state, action) => {
      state.polls.push(action.payload);
    }),
  },
});
