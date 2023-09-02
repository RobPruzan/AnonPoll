import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
const authCookieProperty = 'anon-pol-auth';
const adminPassword = process.env.ADMIN_PASSWORD;
const AUTHENTICATED = 'authenticated';
export const POST = async (req: NextRequest) => {
  if (req.cookies.get(authCookieProperty)?.value === AUTHENTICATED) {
    return NextResponse.json(
      {
        authenticated: true,
      },
      { status: 200 }
    );
  }

  const json = await req.json();

  const jsonSchema = z.object({
    password: z.string(),
  });
  const { password } = jsonSchema.parse(json);

  if (password === adminPassword) {
    const res = NextResponse.json(
      {
        authenticated: true,
      },
      { status: 200 }
    );
    res.cookies.set(authCookieProperty, AUTHENTICATED);

    return res;
  } else {
    return NextResponse.json(
      {
        authenticated: true,
      },
      { status: 403 }
    );
  }
};
