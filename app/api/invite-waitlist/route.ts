import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_ADMIN_URL ||
  "http://localhost:3001";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Try primary backend URL
    const targets = [
      `${BACKEND_URL}/api/invite-waitlist`,
      `http://127.0.0.1:3001/api/invite-waitlist`,
      `http://localhost:3001/api/invite-waitlist`,
    ];

    let lastError: any = null;

    for (const targetUrl of targets) {
      try {
        const backendRes = await fetch(targetUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          cache: "no-store",
        });

        const data = await backendRes.text();
        return new NextResponse(data, {
          status: backendRes.status,
          headers: { "Content-Type": "application/json" },
        });
      } catch (e) {
        lastError = e;
      }
    }

    console.error("[Invite Waitlist Proxy] Failed to reach backend:", lastError);
    return NextResponse.json(
      { success: false, error: "Backend server unreachable. Please verify backend is running on port 3001." },
      { status: 502 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const search = req.nextUrl.search || "";
  const targetUrl = `${BACKEND_URL}/api/invite-waitlist${search}`;

  try {
    const backendRes = await fetch(targetUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    const data = await backendRes.text();
    return new NextResponse(data, {
      status: backendRes.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[Invite Waitlist Proxy GET] Failed to reach backend:", err);
    return NextResponse.json(
      { success: false, error: "Backend unreachable" },
      { status: 502 }
    );
  }
}
