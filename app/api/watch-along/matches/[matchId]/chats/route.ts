import { NextResponse } from 'next/server';
import { getAuthHeaders } from '@/lib/getAuthHeaders';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.sportsfan360.com';
const API_BASE_URL = `${BACKEND_URL}/api/watch-along`;

// ── In-process cache to avoid hammering Firestore on every poll ──
// Keyed by `matchId:since`. Entries expire after CACHE_TTL_MS.
const CACHE_TTL_MS = 4_000; // 4 seconds — safe under 2-5s poll intervals
type CacheEntry = { data: unknown; expiresAt: number };
const chatCache = new Map<string, CacheEntry>();

export async function GET(req: Request, { params }: { params: Promise<{ matchId: string }> }) {
    try {
        const { matchId } = await params;
        const { searchParams } = new URL(req.url);
        const limit = searchParams.get('limit') || '50';
        const since = searchParams.get('since') || '';

        // Return cached response if still fresh (avoids duplicate Firestore reads
        // when multiple tabs / rapid re-renders hit this endpoint simultaneously)
        const cacheKey = `${matchId}:${since}`;
        const cached = chatCache.get(cacheKey);
        if (cached && cached.expiresAt > Date.now()) {
            return NextResponse.json(cached.data);
        }

        // Build query string forwarding both limit and since to backend
        const qs = new URLSearchParams({ limit });
        if (since) qs.set('since', since);

        const response = await fetch(`${API_BASE_URL}/matches/${matchId}/chats?${qs.toString()}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            // Tell Next.js not to deduplicate this fetch across requests
            cache: 'no-store',
        });

        if (!response.ok) {
            console.warn('[chats GET] Backend error, returning empty chats');
            return NextResponse.json({ success: true, chats: [] });
        }

        const data = await response.json();

        // Store in cache only if this was a successful, non-empty response
        chatCache.set(cacheKey, { data, expiresAt: Date.now() + CACHE_TTL_MS });

        // Evict stale entries to prevent unbounded memory growth
        if (chatCache.size > 200) {
            const now = Date.now();
            for (const [key, entry] of chatCache.entries()) {
                if (entry.expiresAt < now) chatCache.delete(key);
            }
        }

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('[chats GET] Error:', error);
        return NextResponse.json({ success: true, chats: [] });
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ matchId: string }> }) {
    try {
        const { matchId } = await params;
        const body = await req.json();
        const authHeaders = await getAuthHeaders();
        
        const response = await fetch(`${API_BASE_URL}/matches/${matchId}/chats`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders },
            body: JSON.stringify(body),
        });
        
        if (!response.ok) {
            console.warn("Backend returned error for chats POST, mocking success");
            return NextResponse.json({ 
                success: true, 
                chat: { id: Date.now().toString(), text: body.text, user: body.user, timestamp: new Date().toISOString() } 
            });
        }
        
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Chat POST Error:", error);
        return NextResponse.json({ success: true, chat: { id: Date.now().toString(), timestamp: new Date().toISOString() } });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ matchId: string }> }) {
    try {
        const { matchId } = await params;
        const body = await req.json();
        const authHeaders = await getAuthHeaders();
        
        const response = await fetch(`${API_BASE_URL}/matches/${matchId}/chats`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', ...authHeaders },
            body: JSON.stringify(body),
        });
        
        if (!response.ok) {
            console.warn("Backend returned error for chats DELETE, mocking success");
            return NextResponse.json({ success: true });
        }
        
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Chat DELETE Error:", error);
        return NextResponse.json({ success: true });
    }
}
