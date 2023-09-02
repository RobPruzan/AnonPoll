import { Role, User } from '@/shared/types';
import {
  createContext,
  useContext,
  MutableRefObject,
  useState,
  SetStateAction,
  Dispatch,
} from 'react';

type UserContextType = {
  user: User;
  setUser: Dispatch<SetStateAction<User>>;
};

export const UserContext = createContext<UserContextType | null>(null);

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
};
