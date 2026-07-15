import { NextResponse } from 'next/server';
import { getAuthHeaders } from '@/lib/getAuthHeaders';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.sportsfan360.com';
const API_BASE_URL = `${BACKEND_URL}/api/watch-along`;

export async function GET(req: Request, { params }: { params: Promise<{ matchId: string }> }) {
    try {
        const { matchId } = await params;
        const response = await fetch(`${API_BASE_URL}/matches/${matchId}/emoji-storm`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        
        if (!response.ok) {
            console.warn("Backend returned error for emojis GET, using mock data");
            return NextResponse.json({ success: true, reactions: {} });
        }
        
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Emoji GET Error:", error);
        return NextResponse.json({ success: true, reactions: {} });
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ matchId: string }> }) {
    try {
        const { matchId } = await params;
        const body = await req.json();
        const authHeaders = await getAuthHeaders();
        
        const response = await fetch(`${API_BASE_URL}/matches/${matchId}/emoji-storm`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders },
            body: JSON.stringify(body),
        });
        
        if (!response.ok) {
            console.warn("Backend returned error for emojis POST, mocking success");
            return NextResponse.json({ success: true, reactions: { "👍": 1 } });
        }
        
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Emoji POST Error:", error);
        return NextResponse.json({ success: true, reactions: {} });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ matchId: string }> }) {
    try {
        const { matchId } = await params;
        const authHeaders = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/matches/${matchId}/emoji-storm`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', ...authHeaders },
        });
        
        if (!response.ok) {
            console.warn("Backend returned error for emojis DELETE, mocking success");
            return NextResponse.json({ success: true });
        }
        
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Emoji DELETE Error:", error);
        return NextResponse.json({ success: true });
    }
}
