import { NextResponse } from 'next/server';
import { getAuthHeaders } from '@/lib/getAuthHeaders';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://sportsfan360.vercel.app';
const API_BASE = `${BACKEND_URL}/api/watch-along`;

/** GET /api/watch-along/matches/[matchId] — fetch single match (public) */
export async function GET(req: Request, { params }: { params: Promise<{ matchId: string }> }) {
    try {
        const { matchId } = await params;
        const { searchParams } = new URL(req.url);
        const queryString = searchParams.toString();

        const response = await fetch(
            `${API_BASE}/matches/${matchId}${queryString ? '?' + queryString : ''}`,
            {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                cache: 'no-store',
            }
        );

        if (!response.ok) {
            console.warn(`[matches/${matchId} GET] Backend returned ${response.status}`);
            return NextResponse.json({ success: false, message: 'Match not found' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error(`[matches/[matchId] GET] Error:`, error);
        return NextResponse.json({ success: false, message: 'Failed to fetch match' }, { status: 500 });
    }
}

/** PUT /api/watch-along/matches/[matchId] — update match (admin only, requires auth) */
export async function PUT(req: Request, { params }: { params: Promise<{ matchId: string }> }) {
    try {
        const { matchId } = await params;
        const body = await req.json();
        const authHeaders = await getAuthHeaders();

        const response = await fetch(`${API_BASE}/matches/${matchId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...authHeaders },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.warn(`[matches/${matchId} PUT] Backend error:`, errText);
            return NextResponse.json(
                { success: false, message: `Backend error: ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error(`[matches/[matchId] PUT] Error:`, error);
        return NextResponse.json({ success: false, message: 'Failed to update match' }, { status: 500 });
    }
}

/** DELETE /api/watch-along/matches/[matchId] — delete match (admin only, requires auth) */
export async function DELETE(req: Request, { params }: { params: Promise<{ matchId: string }> }) {
    try {
        const { matchId } = await params;
        const authHeaders = await getAuthHeaders();

        const response = await fetch(`${API_BASE}/matches/${matchId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', ...authHeaders },
        });

        if (!response.ok) {
            console.warn(`[matches/${matchId} DELETE] Backend returned ${response.status}`);
            return NextResponse.json({ success: false, message: 'Delete failed' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error(`[matches/[matchId] DELETE] Error:`, error);
        return NextResponse.json({ success: false, message: 'Failed to delete match' }, { status: 500 });
    }
}
