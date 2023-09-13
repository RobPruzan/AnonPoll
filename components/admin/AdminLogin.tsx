import { UserContext } from '@/context/UserContext';
import React, { useContext, useEffect, useState } from 'react';
import { match } from 'ts-pattern';
import { Input } from '../ui/input';
import { z } from 'zod';
import { twMerge } from 'tailwind-merge';
import { Button } from '../ui/button';
import { run } from '@/lib/utils';
import { authenticateRawJsonRes, useSession } from '@/hooks/useSession';

type Props = {};

const tailwindDoNotTreeShakeOrIWillLoseMyGodDamnMind = ['bg-red-500'];

const AdminLogin = (props: Props) => {
  const userContext = useContext(UserContext);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  // asserted
  const apiEndpointURL =
    typeof window !== 'undefined' ? window.location.origin : '' + '/api';

  useSession();

  return match(userContext?.user.role)
    .with('user', () => (
      <div className="w-full h-full items-center justify-center flex">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const requestOptions = {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ password }),
            };
            const response = await fetch(apiEndpointURL, requestOptions);
            const json = await response.json();
            // const jsonSchema = z.object({
            //   authenticated: z.boolean(),
            // });
            // const parsedJson = jsonSchema.parse(json);
            // if (parsedJson.authenticated) {
            //   userContext?.setUser((user) => ({ ...user, role: 'admin' }));
            // } else {
            //   setError('Could not authenticate');
            // }
            authenticateRawJsonRes(json, {
              successCB: () => {
                userContext?.setUser((user) => ({ ...user, role: 'admin' }));
              },
              failCB: () => {
                setError('Could not authenticate');
              },
            });
          }}
          className="h-2/5 w-1/4 flex flex-col items-center justify-evenly"
        >
          <label htmlFor="password"></label>
          <Input
            className={twMerge([error ? 'bg-red-500' : undefined])}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
          />
          {error}
          <Button className="w-full" variant={'outline'} type="submit">
            Submit
          </Button>
        </form>
      </div>
    ))
    .with('admin', () => <>admin</>)
    .with(undefined, () => <></>)
    .exhaustive();
};

export default AdminLogin;
