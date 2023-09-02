'use client';
import { useUserContext } from '@/context/UserContext';
import { match } from 'ts-pattern';
import React, { useContext } from 'react';
import AdminLogin from './AdminLogin';
import AdminPolls from './AdminPolls';
import { usePathname } from 'next/navigation';
import RoomCreate from './RoomCreate';

const AdminRouter = () => {
  const roomID = usePathname;
  const userContext = useUserContext();
  return match(userContext.user.role)
    .with('admin', () => <RoomCreate />)
    .with('user', () => <AdminLogin />)
    .exhaustive();
};

export default AdminRouter;
