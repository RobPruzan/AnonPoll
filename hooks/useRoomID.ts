import { usePathname } from 'next/navigation';

export const useRoomID = () => {
  const roomID = usePathname().split('/').at(-1);
  if (!roomID) {
    throw Error('Not in a room, cannot get room id here');
  }
  return roomID;
};
