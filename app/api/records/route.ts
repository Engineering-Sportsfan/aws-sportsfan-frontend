import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_ADMIN_URL ||
  "http://localhost:3001";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const targets = [
      `${BACKEND_URL}/api/records`,
      `http://127.0.0.1:3001/api/records`,
      `http://localhost:3001/api/records`,
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

    console.error("[Records Proxy POST] Failed to reach backend:", lastError);
    return NextResponse.json(
      { success: false, error: "Backend server unreachable. Please verify backend is running." },
      { status: 502 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const search = req.nextUrl.search || "";
  const targets = [
    `${BACKEND_URL}/api/records${search}`,
    `http://127.0.0.1:3001/api/records${search}`,
    `http://localhost:3001/api/records${search}`,
  ];

  let lastError: any = null;

  for (const targetUrl of targets) {
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
    } catch (e) {
      lastError = e;
    }
  }

  console.error("[Records Proxy GET] Failed to reach backend:", lastError);
  return NextResponse.json(
    { success: false, error: "Backend unreachable" },
    { status: 502 }
  );
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();

    const targets = [
      `${BACKEND_URL}/api/records`,
      `http://127.0.0.1:3001/api/records`,
      `http://localhost:3001/api/records`,
    ];

    let lastError: any = null;

    for (const targetUrl of targets) {
      try {
        const backendRes = await fetch(targetUrl, {
          method: "PATCH",
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

    console.error("[Records Proxy PATCH] Failed to reach backend:", lastError);
    return NextResponse.json(
      { success: false, error: "Backend server unreachable." },
      { status: 502 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const search = req.nextUrl.search || "";
  const targets = [
    `${BACKEND_URL}/api/records${search}`,
    `http://127.0.0.1:3001/api/records${search}`,
    `http://localhost:3001/api/records${search}`,
  ];

  let lastError: any = null;

  for (const targetUrl of targets) {
    try {
      const backendRes = await fetch(targetUrl, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
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

  console.error("[Records Proxy DELETE] Failed to reach backend:", lastError);
  return NextResponse.json(
    { success: false, error: "Backend unreachable" },
    { status: 502 }
  );
}
