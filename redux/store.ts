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
import { FirstParameter, Meta, SocketAction } from '@/lib/types';
import { match } from 'ts-pattern';
import { io } from 'socket.io-client';
import { pollSlice } from './slices/pollSlice';
import { z } from 'zod';
import { NetworkActions, networkSlice } from './slices/networkSlice';

export function withMeta<TPayload, TState>(
  reducer: (
    state: TState,
    action: PayloadAction<TPayload, string, Meta | undefined>
  ) => void
) {
  return {
    reducer,
    prepare: (payload: TPayload, meta?: Meta) => ({ payload, meta }),
  };
}

export const socketMiddleware =
  (socketManager: SocketIO): Middleware<{}, any> =>
  ({
    dispatch,
    getState,
  }: {
    dispatch: typeof store.dispatch;
    getState: typeof store.getState;
  }) =>
  (next) =>
  (action: SocketAction & { meta: Meta | undefined }) => {
    // switch (action.type) {
    //   case 'connect':
    //     throw Error
    //   default
    // }
    match(action.type)
      .with('connect', () => {
        const payloadSchema = z.object({
          userID: z.string(),
          roomID: z.string(),
        });
        // expect socket io instance
        if (!action.meta) {
          console.error('not sending any meta on redux connect');
        }
        if (!action.meta.socket) {
          console.error('not sending socket instance in connect dispatch');
          return;
        }
        const payloadParsed = payloadSchema.safeParse(action.payload);
        if (!payloadParsed.success) {
          console.error('connect payload is wrong');
          return;
        }

        const socket = action.meta.socket;
        new Promise((resolve, reject) => {
          dispatch(
            NetworkActions.setRoomState({
              isError: false,
              isLoading: true,
              isSuccess: false,
            })
          );

          socket.emit(
            'join room',
            payloadParsed.data.roomID,
            payloadParsed.data.userID,
            (roomID: string) => {
              resolve(roomID);
              // dispatch({

              //   })
              console.log('user joined the room:', roomID, '!');
            }
          );
        }).then((roomID) => {
          if (typeof roomID === 'string') {
            // set the roomID ...
            console.log('got the room ID!->', roomID);
            dispatch(
              NetworkActions.setRoomState({
                isError: false,
                isLoading: false,
                isSuccess: true,
              })
            );
            setTimeout(() => {
              dispatch(
                NetworkActions.setRoomState({
                  isError: false,
                  isLoading: false,
                  isSuccess: false,
                })
              );
            }, 3000);
          }
        });
      })
      .with('disconnect', () => {})
      .otherwise(() => {
        // just a normal payload
        if (action.meta && !action.meta.fromServer) {
          // socket emit (action)
        }
      });

    return next(action);
  };

export const store = configureStore({
  reducer: {
    poll: pollSlice.reducer,
    network: networkSlice.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['connect'],
      },
    }).concat(socketMiddleware(socketManager)),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
