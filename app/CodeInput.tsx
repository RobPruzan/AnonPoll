'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUserContext } from '@/context/UserContext';
import { useInterval } from '@/hooks/useInterval';
import { useSocketConnect } from '@/hooks/useSocketConnect';
import { useSocketJoin } from '@/hooks/useSocketJoin';

import { useAppSelector } from '@/redux/store';
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
        'flex flex-col h-1/6 w-3/5 sm:w-2/5 md:w-2/6 lg:w-1/4 justify-evenly',

        // roomConnectState.isSuccess ? 'bg-green-500 animate-pulse' : undefined,
      ])}
    >
      <Input
        onBlur={() => {
          router.prefetch(`/${roomID}`);
        }}
        // className="w-full border-2 text-lg p-6"
        className={twMerge([
          'w-full border-2 text-lg p-6',
          // roomConnectState.isSuccess
          //   ? 'border-2 border-green-500 animate-pulse'
          //   : undefined,
        ])}
        type="text"
        value={roomID}
        onChange={(e) => setRoomID(e.target.value)}
      />
      <Button
        onClick={() => {
          if (!(typeof envURL === 'string')) {
            return;
          }
          join(roomID);
        }}
        // className="border-2 w-full"
        className={twMerge([
          'border-2 w-full',
          // roomConnectState.isSuccess ? ' border-green-500 ' : undefined,
        ])}
        variant={'outline'}
      >
        Join Up
      </Button>
    </div>
  );
};

export default CodeInput;
