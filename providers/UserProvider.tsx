import { UserContext, useUserContext } from '@/context/UserContext';
import React, { useState } from 'react';

type Props = {
  children: React.ReactNode;
};

const UserProvider = ({ children }: Props) => {
  const [userID] = useState(crypto.randomUUID());
  return (
    <UserContext.Provider
      value={{
        id: userID,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
