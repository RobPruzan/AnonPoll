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
    <div className="flex w-full border-b h-2/5">
      <div className="w-1/4  h-full border-r flex flex-col justify-evenly p-1 items-center">
        <Button
          onClick={() => setSelectType(SendType.Poll)}
          variant={'outline'}
          className=" w-full"
        >
          Poll
        </Button>
        <Button
          onClick={() => setSelectType(SendType.Question)}
          variant={'outline'}
          className=" w-full"
        >
          Question
        </Button>
        <Button
          onClick={() => setSelectType(SendType.Post)}
          variant={'outline'}
          className=" w-full"
        >
          Post
        </Button>
      </div>
      <div
        style={{
          height: 'calc(100%)',
        }}
        className="w-3/4 flex "
      >
        <div className="h-full overflow-scroll w-4/5">
          {match(selectedType)
            .with(SendType.Poll, () => (
              <>
                <Textarea
                  onChange={(e) => {
                    setNewPoll((prev) => ({
                      ...prev,
                      text: e.target.value,
                    }));
                  }}
                  value={newPoll.text}
                  className="w-3/4"
                />
                <div
                  style={{
                    height: 'calc(100%)',
                  }}
                  className="h-full overflow-scroll flex flex-col items-center justify-start w-fit p-4 transition"
                >
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
