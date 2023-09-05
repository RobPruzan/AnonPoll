import { SocketContext, useSocketContext } from '@/context/SocketContext';
import { useUserContext } from '@/context/UserContext';
import { Meta } from '@/shared/types';

import { useRouter } from 'next/navigation';
import { useContext } from 'react';
import { useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { useMeta } from './useMeta';
import { useRoomID } from './useRoomID';

export const useSocketConnect = () => {
  const router = useRouter();
  const userContext = useUserContext();
  const dispatch = useDispatch();
  const socketContext = useSocketContext();

  const getMeta = useMeta();
  return () => {
    if (socketContext.socketRef.current.connected) {
      return;
    }
    const meta = getMeta({
      socketMeta: {
        socket: socketContext?.socketRef?.current,
      },
    });

    // const meta: Meta = {
    //   socketMeta: {
    //     socket: socketContext?.socketRef?.current,
    //     routeCB: () => router.push(`/polls/${roomID}`),
    //   },
    //   userID: userContext.user.id,
    //   roomID: null,
    // };

    dispatch({
      type: 'connect',
      payload: {
        userID: userContext.user.id,
      },
      meta,
    });
  };
};
