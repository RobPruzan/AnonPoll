import { useUserContext } from '@/context/UserContext';
import { Meta } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { io } from 'socket.io-client';

export const useSocketConnect = () => {
  const router = useRouter();
  const userContext = useUserContext();
  const dispatch = useDispatch();
  const envURL = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL;

  if (!envURL) {
    throw new Error('No socket URL...');
  }
  return (roomID: string) => {
    const meta: Meta = {
      socketMeta: {
        socket: io(envURL),
        routeCB: () => router.push(`/polls/${roomID}`),
      },
      userID: userContext.id,
      pollID: null,
    };

    dispatch({
      type: 'connect',
      payload: {
        roomID,
        userID: userContext.id,
      },
      meta,
    });
  };
};
