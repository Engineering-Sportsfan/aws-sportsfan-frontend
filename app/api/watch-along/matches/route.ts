import { NextResponse } from 'next/server';
import { getAuthHeaders } from '@/lib/getAuthHeaders';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://sportsfan360.vercel.app';
const API_BASE = `${BACKEND_URL}/api/watch-along`;

/** GET /api/watch-along/matches — list all matches (public) */
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const queryString = searchParams.toString();

        const response = await fetch(
            `${API_BASE}/matches${queryString ? '?' + queryString : ''}`,
            {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                cache: 'no-store',
            }
        );

        if (!response.ok) {
            console.warn('[matches GET] Backend error, returning empty list');
            return NextResponse.json({ success: true, matches: [] });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('[matches GET] Error:', error);
        return NextResponse.json({ success: true, matches: [] });
    }
}

/** POST /api/watch-along/matches — create match (admin only, requires auth) */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const authHeaders = await getAuthHeaders();

        const response = await fetch(`${API_BASE}/matches`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.warn('[matches POST] Backend error:', errText);
            return NextResponse.json(
                { success: false, message: `Backend error: ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('[matches POST] Error:', error);
        return NextResponse.json({ success: false, message: 'Failed to create match' }, { status: 500 });
    }
}
