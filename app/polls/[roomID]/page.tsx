import AdminPolls from '@/components/admin/AdminPolls';
import { useAppSelector } from '@/redux/store';
import { Role } from '@/shared/types';

import React from 'react';
import { match } from 'ts-pattern';

const page = ({ params: { roomID } }: { params: { roomID: string } }) => {
  const userRole: Role = 'admin' as Role;
  return match(userRole)
    .with('admin', () => <AdminPolls roomID={roomID} />)
    .with('user', () => <></>)
    .exhaustive();
};

export default page;
