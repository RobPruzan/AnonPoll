import { useUserContext } from '@/context/UserContext';
import { Meta } from '@/shared/types';
import { usePathname, useRouter } from 'next/navigation';
import { P } from 'ts-pattern';
import { useSocketConnect } from './useSocketConnect';
import { useSocketContext } from '@/context/SocketContext';

export const useMeta = () => {
  const userContext = useUserContext();
  const pathName = usePathname();
  const roomID = pathName.at(-1);
  const socketContext = useSocketContext();
  if (roomID === undefined) {
    console.error('Cannot useMeta here');
    return;
  }

  const meta: Meta = {
    roomID,
    userID: userContext.user.id,
    socketMeta: {
      socket: socketContext.socketRef?.current,
    },
  };
  return meta;
};
