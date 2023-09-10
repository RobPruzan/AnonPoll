import { useSession } from '@/hooks/useSession';
import React from 'react';

type Props = {
  children: React.ReactNode;
};

const AuthProvider = ({ children }: Props) => {
  useSession();
  return <>{children}</>;
};

export default AuthProvider;
