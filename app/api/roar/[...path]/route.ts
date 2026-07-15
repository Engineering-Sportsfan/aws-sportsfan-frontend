/**
 * ROAR API Proxy — frontend/app/api/roar/[...path]/route.ts
 *
 * WHY THIS EXISTS:
 * Next.js "rewrites" are server-to-server fetches and do NOT forward the
 * browser's httpOnly cookies. So the backend's getUser() received no "token"
 * cookie and returned 401 for all users.
 *
 * FIX: We intercept /api/roar/* here. We read the "token" cookie — which IS
 * available since it was set on this domain — and forward it as an
 * Authorization: Bearer header. The backend's getUser() already handles Bearer.
 */

import { NextRequest, NextResponse } from "next/server";

// Use the exact same backend URL that next.config.ts uses
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_ADMIN_URL ||
  "https://api.sportsfan360.com";

async function proxyRoar(
  req: NextRequest,
  path: string[]
): Promise<NextResponse> {
  const token =
    req.cookies.get("token")?.value ||
    req.cookies.get("admin_token")?.value;

  // Build the destination URL preserving query string
  const search = req.nextUrl.search || "";
  const targetUrl = `${BACKEND_URL}/api/roar/${path.join("/")}${search}`;

  const headers: Record<string, string> = {};

  // Forward content-type so JSON bodies are parsed correctly
  const ct = req.headers.get("content-type");
  if (ct) headers["Content-Type"] = ct;

  // THE KEY FIX: attach the JWT as a Bearer token
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Also forward all original cookies so NextAuth fallback can work
  const cookieHeader = req.headers.get("cookie");
  if (cookieHeader) headers["Cookie"] = cookieHeader;

  // Forward the user's real IP for any rate-limiting on the backend
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) headers["X-Forwarded-For"] = forwarded;

  let body: string | ArrayBuffer | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    try {
      body = ct?.includes("multipart/form-data")
        ? await req.arrayBuffer()
        : await req.text();
    } catch {
      body = undefined;
    }
  }

  try {
    const backendRes = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      // Do not follow redirects automatically
      redirect: "manual",
    });

    const responseText = await backendRes.text();
    const responseCT =
      backendRes.headers.get("content-type") || "application/json";

    return new NextResponse(responseText, {
      status: backendRes.status,
      headers: {
        "Content-Type": responseCT,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error(`[ROAR Proxy] Failed to reach backend at ${targetUrl}:`, err);
    return NextResponse.json(
      { error: "Backend unreachable", details: String(err) },
      { status: 502 }
    );
  }
}

// Export all HTTP methods
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRoar(req, path);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRoar(req, path);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRoar(req, path);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRoar(req, path);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRoar(req, path);
}

export async function OPTIONS(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
