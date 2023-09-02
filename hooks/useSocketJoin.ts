import { useSocketContext } from '@/context/SocketContext';
import { useMeta } from './useMeta';
import { useRoomID } from './useRoomID';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';

export const useSocketJoin = () => {
  const getMeta = useMeta();
  const socketContext = useSocketContext();

  const router = useRouter();
  const dispatch = useDispatch();
  return (roomID: string) => {
    const meta = getMeta({
      socketMeta: {
        routeCB: () => router.push(`/polls/${roomID}`),
        socket: socketContext.socketRef.current,
      },
    });

    console.log('sending this meta (join)', meta);

    dispatch({
      type: 'join',
      meta,
    });
  };
};
