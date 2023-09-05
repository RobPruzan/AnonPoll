import { RoomsActions } from '@/redux/slices/roomsSlice';
import { Minus, Plus, ArrowRight } from 'lucide-react';

import React, { useState } from 'react';
import { match } from 'ts-pattern';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { useUserContext } from '@/context/UserContext';
import { useMeta } from '@/hooks/useMeta';
import { useSocketJoin } from '@/hooks/useSocketJoin';
import { useAppDispatch } from '@/redux/store';
import { Answer } from '@/shared/types';
import { Input } from '../ui/input';
import { useRoomID } from '@/hooks/useRoomID';

const SendType = {
  Post: 'Post',
  Question: 'Question',
  Poll: 'Poll',
} as const;
type SendType = typeof SendType;
const Create = () => {
  const dispatch = useAppDispatch();
  const getMeta = useMeta();
  const roomID = useRoomID();
  const userContext = useUserContext();
  const join = useSocketJoin();
  const [selectedType, setSelectType] = useState<keyof SendType>(SendType.Poll);
  const [newPoll, setNewPoll] = useState<{
    id?: string;
    text: string;
    answers: Array<Answer>;
  }>({
    text: '',
    answers: [],
  });

  return (
    <div className="flex flex-col w-full  h-full">
      <div className="w-full    ">
        <div className="p-2 flex  justify-evenly  items-center h-full w-full">
          <Button
            onClick={() => setSelectType(SendType.Poll)}
            variant={'outline'}
            className=" w-1/4"
          >
            Poll
          </Button>
          <Button
            onClick={() => setSelectType(SendType.Question)}
            variant={'outline'}
            className=" w-1/4"
          >
            Question
          </Button>
          <Button
            onClick={() => setSelectType(SendType.Post)}
            variant={'outline'}
            className=" w-1/4"
          >
            Post
          </Button>
        </div>
      </div>
      <div
        style={{
          height: 'calc(100%)',
        }}
        className="w-full flex p-3 "
      >
        <div
          style={{
            height: 'calc(100%)',
          }}
          className="h-full overflow-scroll w-full "
        >
          {match(selectedType)
            .with(SendType.Poll, () => (
              <>
                <textarea
                  onChange={(e) => {
                    setNewPoll((prev) => ({
                      ...prev,
                      text: e.target.value,
                    }));
                  }}
                  value={newPoll.text}
                  className="w-full ring-0 outline-none rounded-md bg-background shadow-md border border-secondary focus:border-gray-500 p-2"
                />
                <div
                  // style={{
                  //   height: 'calc(100%)',
                  // }}
                  className=" flex flex-col items-center justify-start w-fit p-4 transition"
                >
                  {newPoll.answers.map((ans) => (
                    <div className="transition" key={ans.id}>
                      <div className="w-full flex">
                        <textarea
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
                          className="w-full ring-0 outline-none rounded-md bg-background shadow-md border border-secondary focus:border-gray-500 p-2"
                        />

                        <Button
                          onClick={() => {
                            setNewPoll((old) => ({
                              ...old,
                              answers: old.answers.filter(
                                (oAns) => oAns.id !== ans.id
                              ),
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
              </>
            ))
            .with(SendType.Post, () => <></>)
            .with(SendType.Question, () => <></>)
            .exhaustive()}
        </div>
        <div className="w-1/5 flex items-end justify-end">
          <Button
            onClick={() => {
              if (newPoll) {
                const newID = crypto.randomUUID();

                dispatch(
                  RoomsActions.addPoll(
                    {
                      poll: {
                        createdAt: Date.now(),
                        id: crypto.randomUUID(),
                        votes: [],
                        question: {
                          // defaults here need to fill in
                          text: newPoll.text,
                          answers: newPoll.answers,
                          correct_answer: {
                            id: crypto.randomUUID(),
                            text: '',
                          },
                          id: newID,
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
            <ArrowRight />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Create;
