'use client';
import React from 'react';
import ReduxProvider from './ReduxProvider';
import SocketProvider from './SocketProvider';
import UserProvider from './UserProvider';

type Props = {
  children: React.ReactNode;
};

const RootProvider = ({ children }: Props) => {
  return (
    <UserProvider>
      <ReduxProvider>
        <SocketProvider>{children}</SocketProvider>
      </ReduxProvider>
    </UserProvider>
  );
};

export default RootProvider;
