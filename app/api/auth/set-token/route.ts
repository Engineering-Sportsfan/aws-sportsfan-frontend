// app/api/auth/set-token/route.ts  — FRONTEND
// Called by AuthContext after Google sign-in to set the same httpOnly
// "token" cookie that email/password users get, but on the frontend domain.

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth.config";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const u = session?.user as {
      email?: string; userId?: string; name?: string; role?: string;
    } | undefined;

    if (!u?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    let dbUserId = u.userId;
    let dbRole = u.role ?? "user";

    if (!dbUserId) {
      try {
        const apiTarget = process.env.NEXT_PUBLIC_BACKEND_URL || "https://sportsfan360.vercel.app";
        const signupRes = await fetch(`${apiTarget}/api/auth/google-signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: u.email,
            name: u.name ?? "",
            avatar: "",
          }),
        });
        if (signupRes.ok) {
          const signupData = await signupRes.json();
          if (signupData.success && signupData.userId) {
            dbUserId = signupData.userId;
            if (signupData.role) dbRole = signupData.role;
          }
        }
      } catch (e) {
        console.error("Failed to fetch userId from google-signup backend during set-token:", e);
      }
    }

    if (!dbUserId) {
      dbUserId = u.email.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
    }

    const token = jwt.sign(
      {
        email:  u.email,
        userId: dbUserId,
        name:   u.name  ?? "",
        role:   dbRole,
      },
      secret,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({ success: true });

    // Set on the FRONTEND domain — browser will send it automatically
    // to all proxied /api/* requests including /api/chats → backend
    response.cookies.set("token", token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge:   60 * 60 * 24 * 7,  // 7 days
      path:     "/",
    });

    return response;
  } catch (error) {
    console.error("set-token error:", error);
    return NextResponse.json({ error: "Failed to set token" }, { status: 500 });
  }
}