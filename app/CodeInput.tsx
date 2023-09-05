'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUserContext } from '@/context/UserContext';
import { useInterval } from '@/hooks/useInterval';
import { useSocketConnect } from '@/hooks/useSocketConnect';
import { useSocketJoin } from '@/hooks/useSocketJoin';

import { useAppSelector } from '@/redux/store';
import { EnterIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { twMerge } from 'tailwind-merge';
const doNotTreeShakeMePls = ['bg-green-500', 'animate-pulse'];
const envURL = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL;
const CodeInput = () => {
  const [roomID, setRoomID] = useState('');
  const join = useSocketJoin();
  const router = useRouter();
  // useInterval(() => {}, );
  return (
    <div
      className={twMerge([
        'flex  items-center  w-4/5 sm:w4/5 md:w-3/6 lg:w-2/4 justify-evenly',

        // roomConnectState.isSuccess ? 'bg-green-500 animate-pulse' : undefined,
      ])}
    >
      <Input
        onBlur={() => {
          router.prefetch(`/${roomID}`);
        }}
        // className="w-full border-2 text-lg p-6"
        className={twMerge([
          'w-3/5 sm:w-4/5 border-2 text-lg p-6 transition shadow-sm shadow-primary',
          // roomConnectState.isSuccess
          //   ? 'border-2 border-green-500 animate-pulse'
          //   : undefined,
        ])}
        type="text"
        placeholder="Enter room code"
        value={roomID}
        onChange={(e) => setRoomID(e.target.value)}
      />
      <Button
        onClick={() => {
          console.log('clicked');
          if (!(typeof envURL === 'string')) {
            return;
          }
          console.log();
          join(roomID);
        }}
        // className="border-2 w-full"
        className={twMerge([
          'h-[52px] border-2 shadow-sm shadow-primary animate-pulse',
          // 'h-10 w-1/5 bg-opacity-40',
          // roomConnectState.isSuccess ? ' border-green-500 ' : undefined,
        ])}
        variant={'outline'}
      >
        {/* Join Up */}
        <EnterIcon />
      </Button>
    </div>
  );
};

export default CodeInput;
