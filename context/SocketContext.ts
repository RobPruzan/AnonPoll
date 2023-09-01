import { createContext, useContext, MutableRefObject } from 'react';

type SocketContextType = {
  socketRef: MutableRefObject<any> | null;
};

export const SocketContext = createContext<SocketContextType | null>(null);

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
};
