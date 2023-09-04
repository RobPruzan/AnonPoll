import { useSocketContext } from '@/context/SocketContext';
import { useDispatch } from 'react-redux';

export const useSocketDisconnect = () => {
  const dispatch = useDispatch();
  const socketContext = useSocketContext();
  return () =>
    dispatch({
      type: 'disconnect',
      meta: {
        socketMeta: {
          socket: socketContext.socketRef.current,
        },
      },
    });
};
