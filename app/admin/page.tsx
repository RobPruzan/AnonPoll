import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import React from 'react';

const page = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-1/4 h-1/4 flex flex-col items-center  border-2 rounded-md py-3 justify-evenly">
        <div className="flex w-full justify-evenly border-2  p-3 items-center border-x-0">
          <label htmlFor="room name">Name:</label>
          <Input id="room name" className="w-2/4" />
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

export default page;
