import { useUserContext } from '@/context/UserContext';
import { Meta } from '@/shared/types';
import { usePathname, useRouter } from 'next/navigation';
import { P } from 'ts-pattern';
import { useSocketConnect } from './useSocketConnect';
import { useSocketContext } from '@/context/SocketContext';
import { useTransactionQueueContext } from '@/context/TransactionQueueContext';

export const useMeta = () => {
  const userContext = useUserContext();
  const pathName = usePathname();
  const roomID = pathName.split('/').at(-1);
  const socketContext = useSocketContext();
  const pQueueContext = useTransactionQueueContext();
  if (roomID === undefined) {
    console.error('this may cause a problem in the future');
    throw new Error('Cannot useMeta here');
  }

  if (roomID === undefined) {
    console.error('this may cause a problem in the future');
    throw new Error('Cannot useMeta here');
  }

  const getMeta: (partialMeta?: Partial<Meta>) => Meta = (partialMeta) => ({
    roomID,
    userID: userContext.user.id,
    timeStamp: Date.now(),
    actionID: crypto.randomUUID(),
    pQueue: pQueueContext.pQueueRef.current,
    socketMeta: {
      socket: socketContext.socketRef.current,
    },
    ...partialMeta,
  });
  return getMeta;
};
