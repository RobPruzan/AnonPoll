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
import {
  BaseSocketAction,
  FirstParameter,
  OnCB,
  SocketAction,
} from '@/lib/types';
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
import { PNode } from '@/context/TransactionQueueContext';

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

        socket.on('shared action', (sharedAction: SocketAction) => {
          const isInitialized = getState().network.roomConnect.isInitialized;
          if (!action.meta?.pQueue) {
            throw new Error(
              'Cannot share actions without a priority queue of transactions'
            );
          }
          if (isInitialized) {
            dispatch(sharedAction);
          } else {
            action.meta.pQueue.enqueue(
              new PNode({
                item: sharedAction,
                priority: action.meta.timeStamp,
              })
            );
          }
        });

        // if (!action.meta) {
        //   console.error('not sending any meta on redux connect');
        // }
        // if (!action.meta?.socketMeta?.socket) {
        //   console.error('not sending socket instance in connect dispatch');
        //   return;
        // }
      })
      .with('join', () => {
        const socket = action.meta?.socketMeta?.socket;

        if (!socket) {
          throw new Error('Well... i need the socket to join the room');
        }
        const payloadSchema = z.object({
          userID: z.string(),
          roomID: z.string(),
        });
        console.log('actual payload (join)', action.meta);
        const payloadParsed = payloadSchema.safeParse(action.meta);
        if (!payloadParsed.success) {
          console.error('join payload is wrong', payloadParsed.error);
          return;
        }
        new Promise<Array<BaseSocketAction>>((resolve, reject) => {
          dispatch(NetworkActions.setRoomState(LOADING));
          const ack: ConnectAck = (room) => {
            if (room === 'error') {
              reject('Room  is not active');
              return;
            }

            resolve(room);
          };
          console.log('EMITTING ROOM JOIN');
          socket.emit(
            'join room',
            payloadParsed.data.roomID,
            payloadParsed.data.userID,
            ack
          );
        }).then((actions) => {
          console.log('resolved room join', actions);
          actions.forEach((a) => {
            action.meta?.pQueue.enqueue(
              new PNode({
                item: a,
                priority: a.meta.timeStamp,
              })
            );
          });

          dispatch(NetworkActions.setRoomState(INITIALIZED));

          action.meta?.pQueue.dequeueAll((node) => {
            dispatch(node.item);
          });
          action.meta?.socketMeta?.routeCB?.();
        });
      })
      .with('disconnect', () => {})
      .otherwise(() => {
        if (action.meta?.fromServer) {
          return;
        }
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
        ignoredActions: ['connect', 'join'],
        ignoredActionPaths: ['meta.socketMeta.socket', 'meta.pQueue'],
      },
    }).concat(socketMiddleware(socketManager)),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
