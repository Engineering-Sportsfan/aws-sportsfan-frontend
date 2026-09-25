import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from "@/lib/auth.config";

const publicRoutes = [
    '/',
    '/auth/login',
    '/auth/register',
    '/auth/error',
    '/auth/forgot-password',
    '/api',
    '/images',
    '/ingest', // Allow PostHog tracking events to bypass login
];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isPublicRoute = publicRoutes.some(route => {
        if (route === '/') return pathname === '/';
        return pathname.startsWith(route);
    });

    // Safely check NextAuth session without letting Edge runtime errors crash middleware
    let session = null;
    try {
        session = await auth();
    } catch {
        session = null;
    }

    const sessionToken =
        request.cookies.get("__Secure-authjs.session-token")?.value ||
        request.cookies.get("authjs.session-token")?.value ||
        request.cookies.get("__Secure-next-auth.session-token")?.value ||
        request.cookies.get("next-auth.session-token")?.value;

    const manualToken = request.cookies.get("token")?.value;
    const hasValidManualToken =
        Boolean(manualToken && manualToken !== "undefined" && manualToken !== "null" && manualToken.trim().length > 10);

    const isLoggedIn = !!session?.user || !!sessionToken || hasValidManualToken;

    // 1. Unauthenticated users trying to access protected routes -> redirect to login (/)
    if (!isLoggedIn && !isPublicRoute) {
        const loginUrl = new URL('/', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // 2. Already logged in users trying to access login pages -> redirect to HomePage
    if (isLoggedIn && (pathname === '/' || pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register'))) {
        return NextResponse.redirect(new URL('/MainModules/HomePage', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|public).*)',
    ],
};
