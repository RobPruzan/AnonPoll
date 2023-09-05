import { createContext, useContext, MutableRefObject } from 'react';
import { io } from 'socket.io-client';

type SocketContextType = {
  socketRef: MutableRefObject<ReturnType<typeof io>> | null;
};

export const SocketContext = createContext<SocketContextType | null>(null);

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context || !context.socketRef?.current) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }

  return { socketRef: context.socketRef };
};
