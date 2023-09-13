import { UserContext, useUserContext } from '@/context/UserContext';
import { run } from '@/lib/utils';
import { useContext, useEffect } from 'react';
import { z } from 'zod';

// export const useSession = () => {
//   const userContext = useUserContext()
//   useEffect(() => {
//     run(async () => {
//       await fetch({
//         json: {
//           username: userContext.
//         }
//       })
//     })
//   }, [])
// }

export const authenticateRawJsonRes = (
  json: unknown,
  options?: {
    successCB?: (...args: any[]) => void;
    failCB?: (...args: any[]) => void;
  }
) => {
  const jsonSchema = z.object({
    authenticated: z.boolean(),
  });
  const parsedJson = jsonSchema.parse(json);
  if (parsedJson.authenticated) {
    //
    options?.successCB?.();
  } else {
    options?.failCB?.();
  }
};
export const useSession = () => {
  const userContext = useContext(UserContext);
  const apiURL =
    typeof window !== 'undefined' ? window.location.origin : '' + '/api';
  useEffect(() => {
    run(async () => {
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      };
      const response = await fetch(apiURL, requestOptions);
      const json = await response.json();
      authenticateRawJsonRes(json, {
        successCB: () => {
          console.log('authing as admin');
          userContext?.setUser((user) => ({ ...user, role: 'admin' }));
        },
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
