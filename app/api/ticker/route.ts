/**
 * Ticker API Proxy — frontend/app/api/ticker/route.ts
 *
 * Forwards /api/ticker requests from the frontend to the backend,
 * preserving all query parameters (sports, types, limit, matchId).
 * No auth required — ticker data is public.
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_ADMIN_URL ||
  "https://sportsfan360.vercel.app";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const search = req.nextUrl.search || "";
  const targetUrl = `${BACKEND_URL}/api/ticker${search}`;

  try {
    const backendRes = await fetch(targetUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 0 },
    });

    const data = await backendRes.text();
    return new NextResponse(data, {
      status: backendRes.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[Ticker Proxy] Failed to reach backend:", err);
    return NextResponse.json(
      { success: false, error: "Backend unreachable" },
      { status: 502 }
    );
  }
}
