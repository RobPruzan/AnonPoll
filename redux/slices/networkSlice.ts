import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { io } from 'socket.io-client';
const DEFAULT_LOADING_STATES = {
  isInitialized: false,
  isLoading: false,
  isError: false,
  hasInitiatedFetch: false,
};

export const LOADING: LoadingStates = {
  isInitialized: false,
  isLoading: true,
  isError: false,
  hasInitiatedFetch: false,
};

export const INITIALIZED: LoadingStates = {
  isInitialized: true,
  isLoading: false,
  isError: false,
  hasInitiatedFetch: false,
};

export const ERROR: LoadingStates = {
  isInitialized: false,
  isLoading: false,
  isError: true,
  hasInitiatedFetch: false,
};

export const INITIATED_FETCH: LoadingStates = {
  isInitialized: false,
  isLoading: false,
  isError: true,
  hasInitiatedFetch: false,
};

export const INITIATED_FETCH_AND_INITIALIZED: LoadingStates = {
  isInitialized: true,
  isLoading: false,
  isError: false,
  hasInitiatedFetch: true,
};

type LoadingStates = typeof DEFAULT_LOADING_STATES;

type State = {
  roomConnect: LoadingStates;
  dispatched: Array<string>;
};

const initialState: State = {
  roomConnect: DEFAULT_LOADING_STATES,
  dispatched: [],
};

export const networkSlice = createSlice({
  name: 'network',
  initialState,
  reducers: {
    setRoomState: (state, action: PayloadAction<LoadingStates>) => {
      state.roomConnect = action.payload;
    },
    addDispatched: (state, action: PayloadAction<string>) => {
      state.dispatched.push(action.payload);
    },
  },
});

export const NetworkActions = networkSlice.actions;
