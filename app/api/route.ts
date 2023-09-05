import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
const authCookieProperty = 'anon-pol-auth';
const adminPassword = process.env.ADMIN_PASSWORD;
const AUTHENTICATED = 'authenticated';
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.AUTH_SECRET;

export const POST = async (req: NextRequest) => {
  console.log('recieved');
  const auth = req.cookies.get(authCookieProperty);
  if (auth && jwt.verify(auth.value, jwtSecret)) {
    return NextResponse.json(
      {
        authenticated: true,
      },
      { status: 200 }
    );
  }
  console.log('oyyy');
  const json = await req.json();
  console.log('got emm', json);

  const jsonSchema = z.object({
    password: z.string().optional(),
  });
  const { password } = jsonSchema.parse(json);
  if (!password) {
    return NextResponse.json(
      {
        authenticated: false,
      },
      { status: 403 }
    );
  }

  if (password === adminPassword) {
    const res = NextResponse.json(
      {
        authenticated: true,
      },
      { status: 200 }
    );
    const jwtToken = jwt.sign({}, jwtSecret);
    console.log('cookie!!', jwtToken);
    res.cookies.set(authCookieProperty, jwtToken);

    return res;
  } else {
    return NextResponse.json(
      {
        authenticated: false,
      },
      { status: 403 }
    );
  }
};
