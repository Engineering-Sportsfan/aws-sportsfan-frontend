import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_ADMIN_URL ||
  "http://localhost:3001";

export const dynamic = "force-dynamic";

async function forwardRequest(req: NextRequest, subpath = "") {
  const url = new URL(req.url);
  const search = url.search;
  const targetUrl = `${BACKEND_URL}/api/cricket-articles${subpath ? `/${subpath}` : ""}${search}`;

  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    if (key.toLowerCase() !== "host" && key.toLowerCase() !== "content-length") {
      headers[key] = value;
    }
  });

  const init: RequestInit = {
    method: req.method,
    headers,
    cache: "no-store",
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    const arrayBuffer = await req.arrayBuffer();
    init.body = Buffer.from(arrayBuffer);
    (init as any).duplex = "half";
  }

  try {
    const res = await fetch(targetUrl, init);
    const contentType = res.headers.get("content-type") || "application/json";
    const data = await res.arrayBuffer();

    return new NextResponse(data, {
      status: res.status,
      headers: {
        "Content-Type": contentType,
      },
    });
  } catch (err: any) {
    console.error(`[Cricket Articles Proxy Error] Failed ${req.method} ${targetUrl}:`, err);
    return NextResponse.json(
      {
        success: false,
        error: `Failed to connect to backend: ${err?.message || String(err)}`,
      },
      { status: 502 }
    );
  }
}

export async function GET(req: NextRequest) {
  return forwardRequest(req);
}

export async function POST(req: NextRequest) {
  return forwardRequest(req);
}

export async function PUT(req: NextRequest) {
  return forwardRequest(req);
}

export async function PATCH(req: NextRequest) {
  return forwardRequest(req);
}

export async function DELETE(req: NextRequest) {
  return forwardRequest(req);
}
