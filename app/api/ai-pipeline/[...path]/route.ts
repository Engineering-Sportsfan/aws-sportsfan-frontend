// frontend/app/api/ai-pipeline/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const AWS_API_GATEWAY_BASE = "https://1a2uuat2d6.execute-api.us-east-1.amazonaws.com/prod";

async function forwardRequest(req: NextRequest, params: { path?: string[] }) {
  const subpath = Array.isArray(params?.path) ? params.path.join("/") : "";
  const url = new URL(req.url);
  const search = url.search;
  const targetUrl = `${AWS_API_GATEWAY_BASE}/${subpath}${search}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  const init: RequestInit = {
    method: req.method,
    headers,
    cache: "no-store",
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    const arrayBuffer = await req.arrayBuffer();
    init.body = Buffer.from(arrayBuffer);
    (init as any).duplex = "half";
    headers["Content-Type"] = req.headers.get("content-type") || "application/json";
  }

  try {
    const res = await fetch(targetUrl, init);
    const contentType = res.headers.get("content-type") || "application/json";
    const data = await res.arrayBuffer();

    return new NextResponse(data, {
      status: res.status,
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept",
      },
    });
  } catch (err: any) {
    console.error(`[AI Pipeline Proxy Error] Failed ${req.method} ${targetUrl}:`, err);
    return NextResponse.json(
      {
        status: "error",
        error: `Failed to connect to AI pipeline: ${err?.message || String(err)}`,
      },
      { status: 502 }
    );
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const resolvedParams = await params;
  return forwardRequest(req, resolvedParams);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const resolvedParams = await params;
  return forwardRequest(req, resolvedParams);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const resolvedParams = await params;
  return forwardRequest(req, resolvedParams);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept",
    },
  });
}
