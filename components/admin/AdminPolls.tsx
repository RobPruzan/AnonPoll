'use client';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import React, { useEffect, useRef, useState } from 'react';
import { useToast } from '../ui/use-toast';
import { useDispatch } from 'react-redux';
import { useSocketConnect } from '@/hooks/useSocketConnect';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Answer, Poll } from '@/shared/types';
import { RoomsActions } from '@/redux/slices/roomsSlice';
import { useMeta } from '@/hooks/useMeta';
import { ArrowRight, Minus, Plus, Send } from 'lucide-react';
import { useUserContext } from '@/context/UserContext';
import { useSocketContext } from '@/context/SocketContext';
import { useSocketJoin } from '@/hooks/useSocketJoin';
import { useRoomID } from '@/hooks/useRoomID';
import { match } from 'ts-pattern';
import { Textarea } from '../ui/textarea';

type Props = {
  roomID: string;
};

const SendType = {
  Post: 'Post',
  Question: 'Question',
  Poll: 'Poll',
} as const;
type SendType = typeof SendType;
const AdminPolls = ({ roomID }: Props) => {
  const [newPoll, setNewPoll] = useState<{
    id?: string;
    text: string;
    answers: Array<Answer>;
  }>({
    text: '',
    answers: [],
  });

  const [selectedType, setSelectType] = useState<keyof SendType>(SendType.Poll);
  const room = useAppSelector((store) =>
    store.rooms.items.find((item) => item.roomID === roomID)
  );

  const resizeRef = useRef<HTMLDivElement | null>();

  const dispatch = useAppDispatch();
  const getMeta = useMeta();
  const userContext = useUserContext();
  const join = useSocketJoin();

  if (typeof window === 'undefined') {
    return <div>Joining room...</div>;
  }

  if (!room) {
    join(roomID);

    return <div>Joining room...</div>;
  }
  // return (
  //   <div className="w-full h-full flex flex-col">
  //     <div className="flex h-2/5 w-1/4 border-r"></div>
  //     <div className="flex flex-col h-2/5 w-3/4">
  //       <div className="w-full h-full flex flex-col border border-b items-center justify-center">
  //         <div className="h-3/5 w-full">
  // <Input
  //   onChange={(e) => {
  //     setNewPoll((prev) => ({ ...prev, text: e.target.value }));
  //   }}
  //   value={newPoll.text}
  //   className="w-1/4"
  // />
  //         </div>
  //         <div className="h-2/5  w-full flex justify-end items-end">
  //           <Button variant={'outline'}>
  //             <ArrowRight />
  //           </Button>
  //         </div>
  //       </div>
  //     </div>
  //     <div className="w-full h-3/5">poll stuff</div>
  //   </div>
  // );

  return (
    <div className="flex flex-col h-full w-full">
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
      <div className="h-3/5  flex w-full">
        <div
          style={{
            height: 'calc(100%)',
          }}
          className="w-1/2 overflow-y-scroll flex flex-col border-r p-3 items-center justify-start"
        >
          <div className="text-lg text-bold">Polls</div>
          {room.polls.map((poll) => (
            <div key={poll.id} className="border w-1/2 my-5 rounded-md p-3">
              <div className=" w-full  border-b">{poll.question.text}</div>

              {poll.question.answers.map((answer) => (
                <div className="w-1/2" key={answer.id}>
                  <div>{answer.text}</div>
                  <div>
                    {
                      poll.votes.filter((vote) => vote.ansID === answer.id)
                        .length
                    }
                  </div>

                  <Button
                    variant={'outline'}
                    className=""
                    onClick={() => {
                      dispatch(
                        RoomsActions.vote(
                          {
                            vote: {
                              ansID: answer.id,
                              userID: userContext.userID,
                            },
                            poll: { id: poll.id },
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
        <div
          style={{
            height: 'calc(100%)',
          }}
          className="w-1/2 flex flex-col overflow-y-scroll"
        >
          <div className="text-lg text-bold">Other</div>
        </div>
      </div>
    </div>
  );
  // return (
  //   <div>
  //     {roomID}
  //     <div>Add poll</div>
  // <Input
  //   onChange={(e) => {
  //     setNewPoll((prev) => ({ ...prev, text: e.target.value }));
  //   }}
  //   value={newPoll.text}
  //   className="w-1/4"
  // />
  //     <div className="border-2 flex flex-col items-center justify-center w-fit p-4 transition">
  //   {newPoll.answers.map((ans) => (
  //     <div className="transition" key={ans.id}>
  //       <div className="w-full flex">
  //         <Input
  //           onChange={(e) => {
  //             setNewPoll((old) => ({
  //               ...old,
  //               answers: old.answers.map((oAns) => {
  //                 if (oAns.id === ans.id) {
  //                   return {
  //                     ...oAns,
  //                     text: e.target.value,
  //                   };
  //                 }
  //                 return oAns;
  //               }),
  //             }));
  //           }}
  //           value={ans.text}
  //           className="w-full"
  //         />

  //         <Button
  //           onClick={() => {
  //             setNewPoll((old) => ({
  //               ...old,
  //               answers: old.answers.filter((oAns) => oAns.id !== ans.id),
  //             }));
  //           }}
  //         >
  //           <Minus />
  //         </Button>
  //       </div>
  //     </div>
  //   ))}
  //   <Button
  //     onClick={() => {
  //       setNewPoll((old) => ({
  //         ...old,
  //         answers: [
  //           ...old.answers,
  //           {
  //             id: crypto.randomUUID(),
  //             text: '',
  //           },
  //         ],
  //       }));
  //     }}
  //   >
  //     <Plus />
  //   </Button>
  // </div>
  // <Button
  //   onClick={() => {
  //     if (newPoll) {
  //       const newID = crypto.randomUUID();

  //       dispatch(
  //         RoomsActions.addPoll(
  //           {
  //             poll: {
  //               id: crypto.randomUUID(),
  //               votes: [],
  //               question: {
  //                 // defaults here need to fill in
  //                 text: newPoll.text,
  //                 answers: newPoll.answers,
  //                 correct_answer: { id: crypto.randomUUID(), text: '' },
  //                 id: newID,
  //               },
  //             },
  //             roomID,
  //           },
  //           getMeta()
  //         )
  //       );
  //       setNewPoll({
  //         text: '',
  //         answers: [],
  //       });
  //     }
  //   }}
  //   variant={'outline'}
  // >
  //   Add poll
  // </Button>

  // {room.polls.map((poll) => (
  //   <div key={poll.id} className="border w-1/4 my-5">
  //     <div className="border w-full">{poll.question.text}</div>
  //     {poll.votes.length}
  //     {poll.question.answers.map((answer) => (
  //       <div key={answer.id}>
  //         <div>{answer.text}</div>

  //         <Button
  //           variant={'outline'}
  //           className=""
  //           onClick={() => {
  //             dispatch(
  //               RoomsActions.vote(
  //                 {
  //                   vote: {
  //                     ansID: answer.id,
  //                     userID: userContext.userID,
  //                   },
  //                   poll: { id: poll.id },
  //                   roomID,
  //                 },
  //                 getMeta()
  //               )
  //             );
  //           }}
  //         ></Button>
  //       </div>
  //     ))}
  //   </div>
  // ))}
  //   </div>
  // );
};

export default AdminPolls;
