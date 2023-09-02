import { UserContext, useUserContext } from '@/context/UserContext';
import { User } from '@/shared/types';

import React, { useState } from 'react';

type Props = {
  children: React.ReactNode;
};

const UserProvider = ({ children }: Props) => {
  const [user, setUser] = useState<User>({
    id: crypto.randomUUID(),
    role: 'user',
  });
  return (
    <UserContext.Provider
      value={{
        setUser,
        user,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
