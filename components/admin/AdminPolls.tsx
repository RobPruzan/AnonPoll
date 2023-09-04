'use client';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

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
import Create from './Create';
import { useBootstrap } from '@/hooks/useBootstrap';

type Props = {
  roomID: string;
};

const AdminPolls = ({ roomID }: Props) => {
  const room = useAppSelector((store) =>
    store.rooms.items.find((item) => item.roomID === roomID)
  );

  const dispatch = useAppDispatch();
  const getMeta = useMeta();
  const userContext = useUserContext();
  const join = useSocketJoin();
  useBootstrap();

  if (typeof window === 'undefined') {
    return <div>Joining room...</div>;
  }

  if (!room) {
    join(roomID);

    return <div>Joining room...</div>;
  }

  console.log(room.polls);
  return (
    <div className="flex flex-col h-full w-full">
      <div className="h-full  flex w-full">
        <div
          style={{
            height: 'calc(100%)',
          }}
          className="w-1/2 overflow-y-scroll flex flex-col border-r p-3 items-center justify-start"
        >
          <div className="text-lg text-bold fadsf">Polls</div>
          {room.polls.map((poll) => (
            <div key={poll.id} className="border w-3/4 my-5 rounded-md p-3">
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
      {/* <div className="w-full border-t"> */}
      <Sheet>
        <SheetTrigger className="border absolute bottom-0 left-0 w-fit p-3 rounded-r rounded-b-0 hover:bg-slate-700 transition">
          Create
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <Create />
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdminPolls;
