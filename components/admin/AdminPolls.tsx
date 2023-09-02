'use client';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import React, { useState } from 'react';
import { useToast } from '../ui/use-toast';
import { useDispatch } from 'react-redux';
import { useSocketConnect } from '@/hooks/useSocketConnect';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Answer, Poll } from '@/shared/types';
import { RoomsActions } from '@/redux/slices/roomsSlice';
import { useMeta } from '@/hooks/useMeta';
import { Minus, Plus } from 'lucide-react';
import { useUserContext } from '@/context/UserContext';

type Props = {
  roomID: string;
};

const AdminPolls = ({ roomID }: Props) => {
  const [newPoll, setNewPoll] = useState<{
    id?: string;
    text: string;
    answers: Array<Answer>;
  }>({
    text: '',
    answers: [],
  });

  const dispatch = useAppDispatch();
  const room = useAppSelector((store) =>
    store.rooms.items.find((item) => item.roomID === roomID)
  );
  const connect = useSocketConnect();
  const getMeta = useMeta();
  const userContext = useUserContext();
  const polls = useAppSelector((store) =>
    store.rooms.items.find((r) => r.roomID === roomID)
  )?.polls;
  console.log('resulting polls', polls);
  if (room === undefined) {
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
      <div className="border-2 flex flex-col items-center justify-center w-fit p-4 transition">
        {newPoll.answers.map((ans) => (
          <div className="transition" key={ans.id}>
            <div className="w-full flex">
              <Input
                onChange={(e) => {
                  setNewPoll((old) => ({
                    ...old,
                    answers: old.answers.map((oAns) => {
                      if (oAns.id === ans.id) {
                        return {
                          ...oAns,
                          text: e.target.value,
                        };
                      }
                      return oAns;
                    }),
                  }));
                }}
                value={ans.text}
                className="w-full"
              />

              <Button
                onClick={() => {
                  setNewPoll((old) => ({
                    ...old,
                    answers: old.answers.filter((oAns) => oAns.id !== ans.id),
                  }));
                }}
              >
                <Minus />
              </Button>
            </div>
          </div>
        ))}
        <Button
          onClick={() => {
            setNewPoll((old) => ({
              ...old,
              answers: [
                ...old.answers,
                {
                  id: crypto.randomUUID(),
                  text: '',
                },
              ],
            }));
          }}
        >
          <Plus />
        </Button>
      </div>
      <Button
        onClick={() => {
          if (newPoll) {
            dispatch(
              RoomsActions.addPoll(
                {
                  poll: {
                    id: crypto.randomUUID(),
                    votes: [],
                    question: {
                      // defaults here need to fill in
                      text: newPoll.text,
                      answers: newPoll.answers,
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
              answers: [],
            });
          }
        }}
        variant={'outline'}
      >
        Add poll
      </Button>

      {room.polls.map((poll) => (
        <div key={poll.id} className="border w-1/4 my-5">
          <div className="border w-full">{poll.question.text}</div>
          {poll.votes.length}
          {poll.question.answers.map((answer) => (
            <div key={answer.id}>
              <div>{answer.text}</div>

              <Button
                variant={'outline'}
                className=""
                onClick={() => {
                  console.log('cleek!');
                  dispatch(
                    RoomsActions.vote(
                      {
                        vote: {
                          ansID: answer.id,
                          userID: userContext.userID,
                        },
                        id: poll.id,
                        roomID,
                      },
                      getMeta()
                    )
                  );
                }}
              ></Button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default AdminPolls;
