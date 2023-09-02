import AdminPolls from '@/components/admin/AdminPolls';
import { useAppSelector } from '@/redux/store';

import React from 'react';
import { match } from 'ts-pattern';
type Role = 'admin' | 'user';
const page = ({ params: { roomID } }: { params: { roomID: string } }) => {
  console.log('heyaa', roomID);
  const userRole: Role = 'admin' as Role;
  return match(userRole)
    .with('admin', () => <AdminPolls roomID={roomID} />)
    .with('user', () => <></>)
    .exhaustive();
};

export default page;
