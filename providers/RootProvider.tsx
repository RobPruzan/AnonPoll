'use client';
import React from 'react';
import ReduxProvider from './ReduxProvider';
import SocketProvider from './SocketProvider';
import UserProvider from './UserProvider';
import TransactionQueueProvider from './TransactionQueueProvider';

type Props = {
  children: React.ReactNode;
};

const RootProvider = ({ children }: Props) => {
  return (
    <TransactionQueueProvider>
      <UserProvider>
        <ReduxProvider>
          <SocketProvider>{children}</SocketProvider>
        </ReduxProvider>
      </UserProvider>
    </TransactionQueueProvider>
  );
};

export default RootProvider;
