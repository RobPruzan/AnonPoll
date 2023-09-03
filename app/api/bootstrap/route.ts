import { prisma } from '@/shared/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';

export const POST = async (req: Request) => {
  const json = await req.json();

  const jsonSchema = z.object({
    roomID: z.string(),
  });
  const { roomID } = jsonSchema.parse(json);

  console.log(`looking for roomID data: ->${roomID}<-`);

  const actions = await prisma.action.findMany({
    where: {
      roomID,
    },
  });

  const mapped = actions.map((data) => JSON.parse(data.serializedJSON));
  console.log('returned actions');
  return NextResponse.json(mapped, { status: 200 });
};
