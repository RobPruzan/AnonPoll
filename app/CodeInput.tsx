'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Meta } from '@/lib/types';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { io } from 'socket.io-client';

const CodeInput = () => {
  const [roomID, setRoomID] = useState('');
  const dispatch = useDispatch();
  return (
    <div className="flex flex-col h-1/6 justify-evenly">
      <Input
        className="w-96 border-2 text-lg p-6 "
        type="text"
        value={roomID}
        onChange={(e) => setRoomID(e.target.value)}
      />
      <Button
        onClick={() => {
          const envURL = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL;
          if (!(typeof envURL === 'string')) {
            return;
          }
          const userID = crypto.randomUUID();
          const meta: Meta = {
            socket: io(envURL),
            userID,
            pollID: null,
          };
          dispatch({
            type: 'connect',
            payload: {
              roomID,
              userID,
            },
            meta,
          });
        }}
        className="border-2"
        variant={'outline'}
      >
        Join Up
      </Button>
    </div>
  );
};

export default CodeInput;
