import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from "@/lib/auth.config";

const publicRoutes = [
    '/',
    '/auth/login',
    '/auth/register',
    '/auth/error',
    '/api/auth',
    '/api/logout',
    '/api/auth/set-password',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/send-otp',
    '/api/auth/verify-otp',
    '/api/watch-along',
    '/images',
    '/ingest', // Allow PostHog tracking events to bypass login
];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isPublicRoute = publicRoutes.some(route => {
        if (route === '/') return pathname === '/';
        return pathname.startsWith(route);
    });

    const session = await auth();
    const manualToken = request.cookies.get("token")?.value;
    const isLoggedIn = !!session?.user || !!manualToken;

    if (!isLoggedIn && !isPublicRoute) {
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    const authPages = ['/auth/login', '/auth/register'];
    if (isLoggedIn && authPages.some(p => pathname.startsWith(p))) {
        return NextResponse.redirect(new URL('/MainModules/ROAR', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|public).*)',
    ],
};
