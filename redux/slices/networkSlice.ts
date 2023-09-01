import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { io } from 'socket.io-client';
const DEFAULT_LOADING_STATES = {
  isLoading: false,
  isSuccess: false,
  isError: false,
};
type LoadingStates = typeof DEFAULT_LOADING_STATES;

type State = {
  roomConnect: LoadingStates;
};

const initialState: State = {
  roomConnect: DEFAULT_LOADING_STATES,
};

export const networkSlice = createSlice({
  name: 'network',
  initialState,
  reducers: {
    setRoomState: (state, action: PayloadAction<LoadingStates>) => {
      state.roomConnect = action.payload;
    },
  },
});

export const NetworkActions = networkSlice.actions;
