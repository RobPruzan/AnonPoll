import { useUserContext } from '@/context/UserContext';
import { useDispatch } from 'react-redux';
import { useRoomID } from './useRoomID';
import { useMeta } from './useMeta';

export const useSocketLeave = () => {
  const dispatch = useDispatch();
  const userID = useUserContext().userID;
  const getMeta = useMeta();

  return (roomID: string) => {
    dispatch({
      type: 'leave',
      payload: {
        userID,
        roomID,
      },
      meta: getMeta(),
    });
  };
};
