import { NextResponse } from 'next/server';
import { getAuthHeaders } from '@/lib/getAuthHeaders';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.sportsfan360.com';
const API_BASE = `${BACKEND_URL}/api/watch-along`;

/**
 * GET /api/watch-along/matches/[matchId]/quiz
 * Supports ?active=true and ?leaderboard=true query params
 */
export async function GET(req: Request, { params }: { params: Promise<{ matchId: string }> }) {
    try {
        const { matchId } = await params;
        const { searchParams } = new URL(req.url);
        const queryString = searchParams.toString();
        const authHeaders = await getAuthHeaders();

        const response = await fetch(
            `${API_BASE}/matches/${matchId}/quiz${queryString ? '?' + queryString : ''}`,
            {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', ...authHeaders },
                cache: 'no-store',
            }
        );

        if (!response.ok) {
            console.warn(`[quiz GET] Backend returned ${response.status}`);
            return NextResponse.json({ success: true, questions: [], leaderboard: [] });
        }

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('[quiz GET] Error:', error);
        return NextResponse.json({ success: true, questions: [], leaderboard: [] });
    }
}

/**
 * POST /api/watch-along/matches/[matchId]/quiz
 * action: "create"  — host creates a new question (requires auth)
 * action: "answer"  — viewer submits an answer (public)
 */
export async function POST(req: Request, { params }: { params: Promise<{ matchId: string }> }) {
    try {
        const { matchId } = await params;
        const body = await req.json();
        const authHeaders = await getAuthHeaders();

        const response = await fetch(`${API_BASE}/matches/${matchId}/quiz`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.warn(`[quiz POST] Backend error ${response.status}:`, errText);
            return NextResponse.json(
                { success: false, message: `Backend error: ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('[quiz POST] Error:', error);
        return NextResponse.json({ success: false, message: 'Failed to process quiz request' }, { status: 500 });
    }
}

/**
 * PATCH /api/watch-along/matches/[matchId]/quiz
 * Toggle a quiz question open/closed (host only)
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ matchId: string }> }) {
    try {
        const { matchId } = await params;
        const body = await req.json();
        const authHeaders = await getAuthHeaders();

        const response = await fetch(`${API_BASE}/matches/${matchId}/quiz`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', ...authHeaders },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.warn(`[quiz PATCH] Backend error ${response.status}:`, errText);
            return NextResponse.json(
                { success: false, message: `Backend error: ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('[quiz PATCH] Error:', error);
        return NextResponse.json({ success: false, message: 'Failed to update quiz question' }, { status: 500 });
    }
}

/**
 * DELETE /api/watch-along/matches/[matchId]/quiz
 * Delete a quiz question (host only)
 */
export async function DELETE(req: Request, { params }: { params: Promise<{ matchId: string }> }) {
    try {
        const { matchId } = await params;
        const body = await req.json();
        const authHeaders = await getAuthHeaders();

        const response = await fetch(`${API_BASE}/matches/${matchId}/quiz`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', ...authHeaders },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            console.warn(`[quiz DELETE] Backend error ${response.status}`);
            return NextResponse.json({ success: true }); // graceful fallback
        }

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('[quiz DELETE] Error:', error);
        return NextResponse.json({ success: false, message: 'Failed to delete quiz question' }, { status: 500 });
    }
}
