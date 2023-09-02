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
import { FirstParameter, OnCB, SocketAction } from '@/lib/types';
import { match } from 'ts-pattern';
import { io } from 'socket.io-client';
import { RoomsActions, roomsSlice } from './slices/roomsSlice';
import { z } from 'zod';
import {
  INITIALIZED,
  LOADING,
  NetworkActions,
  networkSlice,
} from './slices/networkSlice';
import { ConnectAck, Meta, Room } from '@/shared/types';

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
  (action: SocketAction) => {
    match(action.type)
      .with('connect', () => {
        const socket = action.meta?.socketMeta?.socket;

        if (!socket) {
          throw new Error('Well... i need the socket to connect');
        }
        // if (!action.meta?.roomID) {
        //   throw new Error('I need a room to connect...');
        // }

        socket.on('shared action', (action: SocketAction) => {
          dispatch(action);
        });

        socket.on('send user data', () => {
          const room = getState().rooms.items.find(
            (item) => item.roomID === action.meta?.roomID
          );
          if (!room) {
            console.error('sending user undefined data...');
            return;
          }
          socket.emit('transfer over data', room);
        });

        socket.on('sync with master', (room: Room) => {
          dispatch(RoomsActions.replaceRoom(room));
        });
        const payloadSchema = z.object({
          userID: z.string(),
          roomID: z.string(),
        });
        // expect socket io instance
        if (!action.meta) {
          console.error('not sending any meta on redux connect');
        }
        if (!action.meta?.socketMeta?.socket) {
          console.error('not sending socket instance in connect dispatch');
          return;
        }
        const payloadParsed = payloadSchema.safeParse(action.payload);
        if (!payloadParsed.success) {
          console.error('connect payload is wrong');
          return;
        }

        new Promise<Room>((resolve, reject) => {
          dispatch(NetworkActions.setRoomState(LOADING));
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
          dispatch(RoomsActions.addRoom(room));
          dispatch(NetworkActions.setRoomState(INITIALIZED));
          action.meta?.socketMeta?.routeCB?.();
        });
      })
      .with('disconnect', () => {})
      .otherwise(() => {
        // just a normal payloada
        if (action.meta?.socketMeta) {
          const socket = action.meta.socketMeta.socket;
          const serializableAction: SocketAction = {
            ...action,
            meta: {
              roomID: action.meta.roomID,
              userID: action.meta.userID,
              fromServer: action.meta.fromServer,
              timeStamp: Date.now(),
              pQueue: action.meta.pQueue,
            },
          };
          socket.emit('action', serializableAction);
        } else {
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
        ignoredActionPaths: ['meta.socketMeta.socket'],
      },
    }).concat(socketMiddleware(socketManager)),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
