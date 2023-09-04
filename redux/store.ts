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

import { SocketIO } from '@/socket-client/socket';
import {
  BaseSocketAction,
  FirstParameter,
  OnCB,
  SocketAction,
} from '@/lib/types';
import { P, match } from 'ts-pattern';
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
  (): Middleware<{}, any> =>
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
            console.log('emitting shared action', sharedAction);
            dispatch(sharedAction);
          } else {
            // this doesn't work because we need to join the room before receiving and shared actions
            // need to also send it to "connecting" rooms

            action.meta.pQueue.enqueue(
              new PNode({
                item: sharedAction,
                priority: sharedAction.meta.timeStamp,
                id: sharedAction.meta.actionID,
              })
            );
          }
        });
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

        const payloadParsed = payloadSchema.safeParse(action.meta);
        if (!payloadParsed.success) {
          console.error('join payload is wrong', payloadParsed.error);
          return;
        }
        dispatch(NetworkActions.setRoomState(LOADING));
        socket.emit(
          'join room',
          payloadParsed.data.roomID,
          payloadParsed.data.userID,
          // ack
          () => {
            fetch(process.env.NEXT_PUBLIC_API_URL + '/bootstrap', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                roomID: action.meta.roomID,
              }),
            }).then((data) =>
              data.json().then((actions: Array<BaseSocketAction>) => {
                const pQueue = action.meta?.pQueue;
                pQueue.log();
                actions.forEach((a) => {
                  if (
                    !pQueue.collection.some((n) => n.id === a.meta.actionID)
                  ) {
                    pQueue.enqueue(
                      new PNode({
                        item: a,
                        priority: a.meta.timeStamp,
                        id: a.meta.actionID,
                      })
                    );
                  }
                });
                pQueue.log();

                // const ids = new Set();
                // pQueue.collection = pQueue.collection.filter((n) => {
                //   if (ids.has(n.id)) {
                //     return false;
                //   } else {
                //     ids.add(n.id);
                //     return true;
                //   }
                // });
                dispatch(NetworkActions.setRoomState(INITIALIZED));
                console.log('before');
                // pQueue.log();
                // pQueue.deDuplicate();
                // console.log('after');
                pQueue.log();

                pQueue.collection.forEach((n) => {
                  pQueue.dispatched.add(n.id);
                  dispatch(n.item);
                });
                // pQueue.clear();
                action.meta?.socketMeta?.routeCB?.();
              })
            );
          }
        );

        // });
      })
      .with('disconnect', () => {
        const socket = action.meta.socketMeta?.socket;
        if (!socket) {
          throw new Error('Cannot disconnect without socket');
        }
        socket.removeAllListeners();
      })
      .with('leave', () => {
        console.log('incoming', action.payload);
        const { userID, roomID } = action.payload;
        const socket = action.meta.socketMeta?.socket;
        if (!socket) {
          throw new Error('Cannot disconnect without socket');
        }

        socket.emit('leave', roomID, userID);
      })
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
              actionID: crypto.randomUUID(),
              pQueue: action.meta.pQueue,
            },
          };
          console.log('client side emit ', serializableAction);
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
    }).concat(socketMiddleware()),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
