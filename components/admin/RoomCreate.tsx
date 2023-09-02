import React from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

type Props = {};

const RoomCreate = (props: Props) => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-1/4 h-1/4 flex flex-col items-center  border-2 rounded-md py-3 justify-evenly">
        <div className="flex w-full justify-evenly  p-3 items-center ">
          <label htmlFor="room name">Name:</label>
          <Input id="room name" className="w-3/5" />
        </div>
        <div className="w-full flex items-center justify-center">
          <Button className="w-4/5" variant={'outline'}>
            Create room
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoomCreate;
