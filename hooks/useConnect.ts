import { useEffect } from 'react';
import { useSocketConnect } from './useSocketConnect';
import { useSocketDisconnect } from './useSocketDisconnect';

export const useConnect = () => {
  const connect = useSocketConnect();
  const disconnect = useSocketDisconnect();
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  });
};
