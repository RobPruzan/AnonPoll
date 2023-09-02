import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { io } from 'socket.io-client';
const DEFAULT_LOADING_STATES = {
  isInitialized: false,
  isLoading: false,
  isError: false,
};

export const LOADING: LoadingStates = {
  isInitialized: false,
  isLoading: true,
  isError: false,
};

export const INITIALIZED: LoadingStates = {
  isInitialized: false,
  isLoading: true,
  isError: false,
};

export const ERROR: LoadingStates = {
  isInitialized: false,
  isLoading: true,
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
