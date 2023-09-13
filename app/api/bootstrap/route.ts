import { prisma } from '@/shared/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';

export const POST = async (req: Request) => {
  const json = await req.json();

  const jsonSchema = z.object({
    roomID: z.string(),
  });
  const { roomID } = jsonSchema.parse(json);
  const url = new URL(req.url);
  const params = new URLSearchParams(url.search);
  const amount = params.get('amount');
  const actions = await prisma.action.findMany({
    where: {
      roomID,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: amount ? Number(amount) : undefined,
  });

  const mapped = actions.map((data: any) => JSON.parse(data.serializedJSON));

  return NextResponse.json(mapped, { status: 200 });
};
