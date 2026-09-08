import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_ADMIN_URL ||
  "http://localhost:3001";

export const dynamic = "force-dynamic";

async function forwardRequest(req: NextRequest, params?: { path?: string[] }) {
  const url = new URL(req.url);
  const search = url.search;
  const subpath = params?.path?.join("/") || "";
  const targetUrl = `${BACKEND_URL}/api/flipline${subpath ? `/${subpath}` : ""}${search}`;

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
    console.error(`[FlipLine API Proxy Error] Failed ${req.method} ${targetUrl}:`, err);
    return NextResponse.json(
      {
        success: false,
        error: `Failed to connect to backend: ${err?.message || String(err)}`,
      },
      { status: 502 }
    );
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const p = await params;
  return forwardRequest(req, p);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const p = await params;
  return forwardRequest(req, p);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const p = await params;
  return forwardRequest(req, p);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const p = await params;
  return forwardRequest(req, p);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const p = await params;
  return forwardRequest(req, p);
}
