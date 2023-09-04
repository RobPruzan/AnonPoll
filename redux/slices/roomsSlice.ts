import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { withMeta } from '../store';
import { FirstParameter } from '@/lib/types';
import { Poll, Room, Vote, VotePayload } from '@/shared/types';

type State = {
  items: Array<Room>;
};

const initialState: State = {
  items: [],
};

export type MetaParams<TPayload> = FirstParameter<
  typeof withMeta<TPayload, State>
>;
const withRoomsMeta = <TPayload>(args: MetaParams<TPayload>) =>
  withMeta<TPayload, State>(args);

export const roomsSlice = createSlice({
  initialState,
  name: 'rooms',
  reducers: {
    addRoom: withRoomsMeta<Room>((state, action) => {
      state.items.push(action.payload);
    }),
    addPoll: withRoomsMeta<{ roomID: string; poll: Poll }>((state, action) => {
      const room = state.items.find(
        (item) => item.roomID === action.payload.roomID
      );
      if (!room) {
        console.error('Trying to add poll to non existent room?');
        return;
      }

      room.polls.push(action.payload.poll);
      room.polls.sort((a, b) => b.createdAt - a.createdAt);
    }),

    replaceRoom: (state, action: PayloadAction<Room>) => {
      const mutIndex = state.items.findIndex(
        (item) => item.roomID === action.payload.roomID
      );
      if (mutIndex === -1) {
        state.items.push(action.payload);
      } else {
        state.items[mutIndex] = action.payload;
      }
    },

    vote: withRoomsMeta<VotePayload>((state, action) => {
      const room = state.items.find((i) => i.roomID === action.payload.roomID);

      if (!room) {
        console.error(
          'trying to vote on a room that does not exist, something went wrong'
        );
        return;
      }

      const poll = room.polls.find((p) => p.id === action.payload.poll.id);

      // console.log('just voted:', action.payload.vote);

      poll?.votes.push(action.payload.vote);
    }),
  },
});

export const RoomsActions = roomsSlice.actions;
