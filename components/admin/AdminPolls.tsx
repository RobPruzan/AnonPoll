'use client';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

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
import { Answer } from '@/shared/types';
import { RoomsActions } from '@/redux/slices/roomsSlice';
import { useMeta } from '@/hooks/useMeta';
import {
  ArrowRight,
  Circle,
  Fish,
  FishOff,
  Flag,
  Minus,
  Plus,
  Send,
} from 'lucide-react';
import { useUserContext } from '@/context/UserContext';
import { useSocketContext } from '@/context/SocketContext';
import { useSocketJoin } from '@/hooks/useSocketJoin';
import { useRoomID } from '@/hooks/useRoomID';
import { match } from 'ts-pattern';
import { Textarea } from '../ui/textarea';
import Create from './Create';
import { useBootstrap } from '@/hooks/useBootstrap';
import { useSocketLeave } from '@/hooks/useSocketLeave';
import { useRouter } from 'next/navigation';
import Poll from '../Poll';

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
  const socketRef = useSocketContext().socketRef;
  const router = useRouter();
  const lastJoinEmitRef = useRef<number | null>(null);

  useBootstrap();

  if (typeof window === 'undefined') {
    return <div>Joining room...</div>;
  }

  console.log('cock hfsdfofle', room);

  // if (!room) {
  //   if (lastJoinEmitRef.current === null) {
  //     join(roomID);
  //     console.log('emit join');
  //     lastJoinEmitRef.current = Date.now();
  //   } else if (Date.now() - lastJoinEmitRef.current > 1000) {
  //     join(roomID);
  //     console.log('emit join');
  //     lastJoinEmitRef.current = Date.now();
  //   }

  //   return <div>Joining room...</div>;
  // }
  if (!room) {
    join(roomID);

    return <div>Joining room...</div>;
  }

  if (socketRef.current.disconnected) {
    router.push('/');
  }

  return (
    <div className="flex flex-col h-full w-full">
      <div className="h-full  flex w-full">
        <div className="flex flex-col h-full w-full border-r  py-3 ">
          <div
            style={{
              height: 'calc(100%)',
            }}
            className="overflow-y-scroll flex flex-col items-center justify-start"
          >
            {room.polls.length === 0 && (
              <div className="w-full text-lg text-bold opacity-50 h-full justify-center items-center p-10">
                Nobody has made any polls, check back later
                <FishOff className=" animate-bounce mt-1" />
              </div>
            )}
            {room.polls.map((poll) => (
              <Poll poll={poll} key={poll.id} />
            ))}
          </div>
        </div>
      </div>
      {/* <div className="w-full border-t"> */}
      <Sheet>
        <SheetTrigger className="border absolute bottom-0 left-0 w-fit p-3 rounded-r rounded-b-0 hover:bg-slate-700 transition">
          Create
        </SheetTrigger>
        <SheetContent className="p-0">
          <Create />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdminPolls;
