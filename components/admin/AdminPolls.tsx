'use client';
import { useAppSelector } from '@/redux/store';
import React from 'react';
import { useToast } from '../ui/use-toast';
import { useDispatch } from 'react-redux';
import { useSocketConnect } from '@/hooks/useSocketConnect';

type Props = {
  roomID: string;
};

const AdminPolls = ({ roomID }: Props) => {
  const room = useAppSelector((store) =>
    store.rooms.items.find((item) => item.code === roomID)
  );
  const connect = useSocketConnect();
  if (room === undefined) {
    connect(roomID);
    return <>Loading...</>;
  }
  return (
    <div>
      {roomID}
      {room.polls.map((poll) => (
        <>
          {poll.id}
          {poll.question.answers.map((answer) => (
            <>{answer.text}</>
          ))}
        </>
      ))}
    </div>
  );
};

export default AdminPolls;
