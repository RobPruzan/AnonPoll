'use client';
import { Input } from '@/components/ui/input';
import React, { useState } from 'react';

const CodeInput = () => {
  const [code, setCode] = useState('');
  return (
    <>
      <div className="h-52 w-20 dark bg-primary">dsaf</div>
      <Input
        className="w-96  "
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
    </>
  );
};

export default CodeInput;
