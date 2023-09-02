import { useConnect } from '@/hooks/useConnect';
import React from 'react';

type Props = {
  children: React.ReactNode;
};

const ConnectProvider = ({ children }: Props) => {
  useConnect();
  return <>{children}</>;
};

export default ConnectProvider;
