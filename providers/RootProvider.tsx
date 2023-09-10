'use client';
import React from 'react';
import ReduxProvider from './ReduxProvider';
import SocketProvider from './SocketProvider';
import UserProvider from './UserProvider';
import TransactionQueueProvider from './TransactionQueueProvider';
import { useConnect } from '@/hooks/useConnect';
import ConnectProvider from './ConnectProvider';
import AuthProvider from './AuthProvider';

type Props = {
  children: React.ReactNode;
};

const RootProvider = ({ children }: Props) => {
  return (
    <UserProvider>
      <TransactionQueueProvider>
        <AuthProvider>
          <ReduxProvider>
            <SocketProvider>
              <ConnectProvider>{children}</ConnectProvider>
            </SocketProvider>
          </ReduxProvider>
        </AuthProvider>
      </TransactionQueueProvider>
    </UserProvider>
  );
};

export default RootProvider;
