import { prisma } from '@/shared/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';

export const POST = async (req: Request) => {
  const json = await req.json();

  const jsonSchema = z.object({
    roomID: z.string(),
  });
  const { roomID } = jsonSchema.parse(json);

  const actions = await prisma.action.findMany({
    where: {
      roomID,
    },
  });

  const mapped = actions.map((data) => JSON.parse(data.serializedJSON));

  return NextResponse.json(mapped, { status: 200 });
};
