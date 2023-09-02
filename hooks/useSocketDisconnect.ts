import { useDispatch } from 'react-redux';

export const useSocketDisconnect = () => {
  const dispatch = useDispatch();
  return () => dispatch({ type: 'disconnect' });
};
