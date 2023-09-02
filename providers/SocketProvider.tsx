'use client';
import { SocketContext } from '@/context/SocketContext';
import React, { useRef } from 'react';
import { io } from 'socket.io-client';

type Props = {
  children: React.ReactNode;
};

const SocketProvider = ({ children }: Props) => {
  const envURL = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL;

  if (!envURL) {
    throw new Error('No socket URL...');
  }
  const socketRef = useRef<ReturnType<typeof io> | null>(io(envURL));
  return (
    <SocketContext.Provider
      value={{
        socketRef,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
