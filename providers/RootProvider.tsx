'use client';
import React from 'react';
import ReduxProvider from './ReduxProvider';
import SocketProvider from './SocketProvider';
import UserProvider from './UserProvider';
import TransactionQueueProvider from './TransactionQueueProvider';
import { useConnect } from '@/hooks/useConnect';
import ConnectProvider from './ConnectProvider';

type Props = {
  children: React.ReactNode;
};

const RootProvider = ({ children }: Props) => {
  return (
    <TransactionQueueProvider>
      <UserProvider>
        <ReduxProvider>
          <SocketProvider>
            <ConnectProvider>{children}</ConnectProvider>
          </SocketProvider>
        </ReduxProvider>
      </UserProvider>
    </TransactionQueueProvider>
  );
};

export default RootProvider;
