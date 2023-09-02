import { SocketContext } from '@/context/SocketContext';
import { useUserContext } from '@/context/UserContext';
import { Meta } from '@/shared/types';

import { useRouter } from 'next/navigation';
import { useContext } from 'react';
import { useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { useMeta } from './useMeta';

export const useSocketConnect = () => {
  const router = useRouter();
  const userContext = useUserContext();
  const dispatch = useDispatch();
  const socketContext = useContext(SocketContext);

  const getMeta = useMeta();
  return (roomID: string) => {
    const meta = getMeta({
      socketMeta: {
        socket: socketContext?.socketRef?.current,
        routeCB: () => router.push(`/polls/${roomID}`),
      },
      roomID: null,
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
        roomID,
        userID: userContext.user.id,
      },
      meta,
    });
  };
};
