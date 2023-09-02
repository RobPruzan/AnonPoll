'use client';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import React, { useState } from 'react';
import { useToast } from '../ui/use-toast';
import { useDispatch } from 'react-redux';
import { useSocketConnect } from '@/hooks/useSocketConnect';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Poll } from '@/shared/types';
import { RoomsActions } from '@/redux/slices/roomsSlice';
import { useMeta } from '@/hooks/useMeta';

type Props = {
  roomID: string;
};

const AdminPolls = ({ roomID }: Props) => {
  const [newPoll, setNewPoll] = useState<{ id?: string; text: string }>({
    text: '',
  });
  const dispatch = useAppDispatch();
  const room = useAppSelector((store) =>
    store.rooms.items.find((item) => item.roomID === roomID)
  );
  const connect = useSocketConnect();
  const getMeta = useMeta();

  if (room === undefined) {
    console.log('room connecting undefined');
    connect(roomID);
    return <>Loading...</>;
  }

  return (
    <div>
      {roomID}
      <div>Add poll</div>
      <Input
        onChange={(e) => {
          setNewPoll((prev) => ({ ...prev, text: e.target.value }));
        }}
        value={newPoll.text}
        className="w-1/4"
      />
      <Button
        onClick={() => {
          if (newPoll) {
            dispatch(
              RoomsActions.addPoll(
                {
                  poll: {
                    id: crypto.randomUUID(),
                    question: {
                      // defaults here need to fill in
                      text: newPoll.text,
                      answers: [],
                      correct_answer: { id: crypto.randomUUID(), text: '' },
                      id: crypto.randomUUID(),
                    },
                  },
                  roomID,
                },
                getMeta()
              )
            );
            setNewPoll({
              text: '',
            });
          }
        }}
        variant={'outline'}
      >
        Add poll
      </Button>

      {room.polls.map((poll) => (
        <>
          {poll.id}
          {poll.question.answers.map((answer) => (
            <div key={answer.id}>{answer.text}</div>
          ))}
        </>
      ))}
    </div>
  );
};

export default AdminPolls;
