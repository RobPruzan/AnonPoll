import { useEffect } from 'react';
import { useSocketConnect } from './useSocketConnect';
import { useSocketDisconnect } from './useSocketDisconnect';
import { useSocketLeave } from './useSocketLeave';
import { usePathname } from 'next/navigation';

export const useConnect = () => {
  const connect = useSocketConnect();
  const disconnect = useSocketDisconnect();

  useEffect(() => {
    connect();
    return () => {
      // disconnect();
    };
  });
};
