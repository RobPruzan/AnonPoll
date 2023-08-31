import {
  AnyAction,
  Middleware,
  PayloadAction,
  configureStore,
} from '@reduxjs/toolkit';

import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook,
} from 'react-redux';

import { SocketIO, socketManager } from '@/socket-client/socket';
import { Meta, SocketAction } from '@/lib/types';

// export function withMeta<TPayload, TState>(
//   reducer: (
//     state: TState,
//     action: PayloadAction<TPayload, string, Meta | undefined>
//   ) => void
// ) {
//   return {
//     reducer,
//     prepare: (payload: TPayload, meta?: Meta) => ({ payload, meta }),
//   };z algo
// }

// export const socketMiddleware =
//   (socketManager: SocketIO): Middleware<{}, any> =>
//   ({
//     dispatch,
//     getState,
//   }: {
//     dispatch: typeof store.dispatch;
//     getState: typeof store.getState;
//   }) =>
//   (next) =>
//   (action: SocketAction & { meta: Meta | undefined }) => {
//     const isSharedAction =
//       action.type.startsWith('canvas/') ||
//       action.type.startsWith('collaborationState/');

//     switch (action.type) {
//     }

//     return next(action);
//   };

// export const store = configureStore({
//   reducer: {},

//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware().concat(socketMiddleware(socketManager)),
// });

// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;

// export const useAppDispatch: () => AppDispatch = useDispatch;
// export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
