'use client';
import React, { useContext, useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useSocketConnect } from '@/hooks/useSocketConnect';
import { SocketContext, useSocketContext } from '@/context/SocketContext';
import { useMeta } from '@/hooks/useMeta';
import { Check } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useAppDispatch } from '@/redux/store';
import { RoomsActions } from '@/redux/slices/roomsSlice';
import { useUserContext } from '@/context/UserContext';

type Props = {};

const RoomCreate = ({}: Props) => {
  const [roomCode, setRoomCode] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const socketContext = useContext(SocketContext);
  const dispatch = useAppDispatch();
  const userContext = useUserContext();
  const getMeta = useMeta();
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-3/5 md:w-2/5 lg:w-1/4 h-1/4 flex flex-col items-center  border-2 rounded-md py-3 justify-evenly">
        <div className="flex w-full justify-evenly  p-3 items-center ">
          <label htmlFor="room name">Name:</label>
          <Input
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            id="room name"
            className="w-3/5"
          />
        </div>
        <div className="w-full flex items-center justify-center">
          <Button
            onClick={() => {
              // socketContext.socketRef?.current
              socketContext?.socketRef?.current.emit(
                'create room',
                roomCode,
                () => {
                  setShowSuccess(true);
                  setTimeout(() => {
                    setShowSuccess(false);
                  }, 3000);
                }
              );

              dispatch(
                RoomsActions.addRoom(
                  {
                    polls: [],
                    roomID: roomCode,
                    user_ids: userContext.user.id ? [userContext.user.id] : [],
                    createdAt: Date.now(),
                  },
                  getMeta({
                    roomID: roomCode,
                  })
                )
              );
            }}
            className="w-4/5"
            variant={'outline'}
          >
            Create room
            {showSuccess && <Check />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoomCreate;
