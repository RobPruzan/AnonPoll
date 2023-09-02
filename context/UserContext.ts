import { createContext, useContext, MutableRefObject, useState } from 'react';

type UserContextType = {
  id: string | null;
};

export const UserContext = createContext<UserContextType | null>(null);

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
};
