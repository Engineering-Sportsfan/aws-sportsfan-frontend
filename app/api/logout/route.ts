import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });

  const cookiesToClear = [
    "token",
    "authjs.session-token",
    "authjs.csrf-token",
    "authjs.callback-url",
    "__Secure-authjs.session-token",
    "__Secure-authjs.csrf-token",
    "next-auth.session-token",
    "next-auth.csrf-token",
    "next-auth.callback-url",
    "__Secure-next-auth.session-token",
    "__Secure-next-auth.csrf-token",
  ];

  cookiesToClear.forEach((name) => {
    response.cookies.set(name, "", {
      expires: new Date(0),
      path: "/",
      httpOnly: true,
    });
  });

  return response;
}