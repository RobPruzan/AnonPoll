'use client';
import { SocketContext } from '@/context/SocketContext';
import React, { useRef } from 'react';
import { io } from 'socket.io-client';

type Props = {
  children: React.ReactNode;
};

const SocketProvider = ({ children }: Props) => {
  const socket = useRef<ReturnType<typeof io> | null>(null);
  return (
    <SocketContext.Provider value={null}>{children}</SocketContext.Provider>
  );
};

export default SocketProvider;
