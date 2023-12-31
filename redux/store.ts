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
  INITIATED_FETCH,
  INITIATED_FETCH_AND_INITIALIZED,
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
            sharedAction.meta;
            //            ^?

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
            console.log('got run');
            if (getState().network.roomConnect.hasInitiatedFetch) {
              console.log('psyc');
              return;
            }
            console.log('fetching');
            dispatch(NetworkActions.setRoomState(INITIATED_FETCH));
            const apiURL =
              typeof window !== 'undefined'
                ? window.location.origin
                : '' + '/api';

            fetch(apiURL + '/bootstrap', {
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
                  if (!pQueue.ids.has(a.meta.actionID)) {
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

                dispatch(
                  NetworkActions.setRoomState(INITIATED_FETCH_AND_INITIALIZED)
                );
                pQueue.log();

                pQueue.collection.forEach((n) => {
                  if (!pQueue.dispatched.has(n.id)) {
                    pQueue.dispatched.add(n.id);
                    dispatch(n.item);
                  }
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
        socket.disconnect();
        socket.removeAllListeners();
      })
      .with('leave', () => {
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
          const serializableAction = {
            ...action,
            meta: {
              roomID: action.meta.roomID,
              userID: action.meta.userID,
              fromServer: action.meta.fromServer,
              timeStamp: Date.now(),
              actionID: crypto.randomUUID(),
              // pQueue: action.meta.pQueue,
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
    }).concat(socketMiddleware()),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
