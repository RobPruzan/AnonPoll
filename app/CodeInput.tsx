'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import React, { useState } from 'react';

const CodeInput = () => {
  const [code, setCode] = useState('');
  return (
    <div className="flex flex-col h-1/6 justify-evenly">
      <Input
        className="w-96 border-2 text-lg p-6 "
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <Button className="border-2" variant={'outline'}>
        Join Up
      </Button>
    </div>
  );
};

export default CodeInput;
