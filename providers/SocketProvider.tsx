'use client';
import { SocketContext } from '@/context/SocketContext';
import { useUserContext } from '@/context/UserContext';
import { useSocketDisconnect } from '@/hooks/useSocketDisconnect';
import { usePathname } from 'next/navigation';
import React, { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

type Props = {
  children: React.ReactNode;
};

const SocketProvider = ({ children }: Props) => {
  const envURL = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL;
  const pathname = usePathname();
  const userContext = useUserContext();
  const slugs = pathname.split('/');
  // const disconnect = useSocketDisconnect();
  const roomID = slugs.at(-1);

  if (!envURL) {
    throw new Error('No socket URL...');
  }
  const socketRef = useRef<ReturnType<typeof io>>(
    roomID
      ? io(envURL, {
          query: {
            pendingRoomID: roomID,
            userID: userContext.userID,
          },
        })
      : io(envURL, {
          query: {
            userID: userContext.userID,
          },
        })
  );

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
