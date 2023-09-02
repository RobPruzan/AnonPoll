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
import { RoomsActions, roomsSlice } from './slices/roomsSlice';
import { z } from 'zod';
import { NetworkActions, networkSlice } from './slices/networkSlice';
import { ConnectAck, Room } from '@/shared/types';

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
        if (!action.meta.socketMeta?.socket) {
          console.error('not sending socket instance in connect dispatch');
          return;
        }
        const payloadParsed = payloadSchema.safeParse(action.payload);
        if (!payloadParsed.success) {
          console.error('connect payload is wrong');
          return;
        }

        const socket = action.meta.socketMeta?.socket;

        new Promise<Room>((resolve, reject) => {
          dispatch(
            NetworkActions.setRoomState({
              isError: false,
              isLoading: true,
              isSuccess: false,
            })
          );
          const ack: ConnectAck = (room) => {
            console.log('user joined the room:', room, '!');
            resolve(room);
          };
          socket.emit(
            'join room',
            payloadParsed.data.roomID,
            payloadParsed.data.userID,
            ack
          );
        }).then((room) => {
          // set the roomID ...
          console.log('got the room ID!->', room);
          dispatch(RoomsActions.addRoom(room));
          dispatch(
            NetworkActions.setRoomState({
              isError: false,
              isLoading: false,
              isSuccess: true,
            })
          );
          console.log('googa', action.meta.socketMeta?.routeCB);
          action.meta.socketMeta?.routeCB();
          setTimeout(() => {
            dispatch(
              NetworkActions.setRoomState({
                isError: false,
                isLoading: false,
                isSuccess: false,
              })
            );
          }, 3000);
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
    rooms: roomsSlice.reducer,
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
