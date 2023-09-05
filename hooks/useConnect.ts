import { useEffect } from 'react';
import { useSocketConnect } from './useSocketConnect';
import { useSocketDisconnect } from './useSocketDisconnect';
import { useSocketLeave } from './useSocketLeave';
import { usePathname } from 'next/navigation';
import { useSocketContext } from '@/context/SocketContext';

export const useConnect = () => {
  const connect = useSocketConnect();
  const socket = useSocketContext();
  const disconnect = useSocketDisconnect();

  useEffect(() => {
    if (!socket.socketRef.current.connected) {
      // fdsfdsfsdfdad
      connect();
    }

    return () => {
      if (socket.socketRef.current.disconnected) {
        disconnect();
      }
    };
  });
};
