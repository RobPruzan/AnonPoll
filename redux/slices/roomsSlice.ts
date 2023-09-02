import { createSlice } from '@reduxjs/toolkit';
import { withMeta } from '../store';
import { FirstParameter } from '@/lib/types';
import { Poll, Room } from '@/shared/types';

type State = {
  items: Array<Room>;
};

const initialState: State = {
  items: [],
};

export type MetaParams<TPayload> = FirstParameter<
  typeof withMeta<TPayload, State>
>;
const withPollMeta = <TPayload>(args: MetaParams<TPayload>) =>
  withMeta<TPayload, State>(args);

export const roomsSlice = createSlice({
  initialState,
  name: 'rooms',
  reducers: {
    addRoom: withPollMeta<Room>((state, action) => {
      state.items.push(action.payload);
    }),
  },
});

export const RoomsActions = roomsSlice.actions;
