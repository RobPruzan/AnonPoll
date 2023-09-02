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
        console.log('action that is type connect', action);
        const socket = action.meta?.socketMeta?.socket;

        if (!socket) {
          throw new Error('Well... i need the socket to connect');
        }
        // if (!action.meta?.roomID) {
        //   throw new Error('I need a room to connect...');
        // }

        socket.on('shared action', (sharedAction: SocketAction) => {
          console.log('received action', sharedAction);
          const isInitialized = getState().network.roomConnect.isInitialized;
          if (!action.meta?.pQueue) {
            throw new Error(
              'Cannot share actions without a priority queue of transactions'
            );
          }
          if (isInitialized) {
            if (sharedAction.type === 'connect') {
              console.log('fucker 3', sharedAction);
              // this is a problem even if it temp fixes it
              return;
            }
            dispatch(sharedAction);
          } else {
            console.log('just enqueuing');
            action.meta.pQueue.enqueue(
              new PNode({
                item: sharedAction,
                priority: action.meta.timeStamp,
              })
            );
          }
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

        new Promise<Array<BaseSocketAction>>((resolve, reject) => {
          dispatch(NetworkActions.setRoomState(LOADING));
          const ack: ConnectAck = (room) => {
            if (room === 'error') {
              reject('Room  is not active');
              return;
            }

            resolve(room);
          };
          socket.emit(
            'join room',
            payloadParsed.data.roomID,
            payloadParsed.data.userID,
            ack
          );
        }).then((actions) => {
          console.log('ACK FUNC ON JOIN', actions);
          // dispatch(RoomsActions.addRoom(room));
          // grabs db data, then applys all pending transactions
          actions.forEach((a) => {
            if (a.type === 'connect') {
              console.log('fucker 1');
            }
            dispatch(a);
          });

          dispatch(NetworkActions.setRoomState(INITIALIZED));

          action.meta?.pQueue.dequeueAll((node) => {
            if (action.type === 'connect') {
              console.log('fucker 2');
            }
            dispatch(node.item);
          });
          action.meta?.socketMeta?.routeCB?.();
        });
      })
      .with('disconnect', () => {})
      .otherwise(() => {
        if (action.meta?.fromServer) {
          console.log('not dispatching an action from server');
          return;
        }
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
