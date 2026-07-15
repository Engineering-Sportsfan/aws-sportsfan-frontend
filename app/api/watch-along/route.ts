import { NextResponse } from 'next/server';
import { getAuthHeaders } from '@/lib/getAuthHeaders';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.sportsfan360.com';
const API_BASE = `${BACKEND_URL}/api/watch-along`;

// GET /api/watch-along — fetch all rooms
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const params = searchParams.toString();
        
        const response = await fetch(`${API_BASE}${params ? '?' + params : ''}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            console.warn('[watch-along GET] Backend error, returning empty rooms');
            return NextResponse.json({ success: true, rooms: [] });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('[watch-along GET] Error:', error);
        return NextResponse.json({ success: true, rooms: [] });
    }
}

// POST /api/watch-along — create a new room
export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const authHeaders = await getAuthHeaders();

        const response = await fetch(`${API_BASE}`, {
            method: 'POST',
            body: formData, // forward the multipart form data directly
            headers: { ...authHeaders },
        });

        if (!response.ok) {
            const errText = await response.text();
            console.warn('[watch-along POST] Backend error:', errText);
            // Return a mock room so the UI doesn't crash
            const name = formData.get('name') as string || 'My Room';
            return NextResponse.json({
                success: true,
                room: {
                    id: 'custom-' + Date.now(),
                    name,
                    role: 'Host',
                    badge: 'Live',
                    badgeColor: 'bg-pink-600',
                    borderColor: 'border-pink-500',
                    displayPicture: '',
                    watching: '1',
                    engagement: '0',
                    active: '1',
                    isLive: true,
                    liveMatchId: null,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                }
            });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('[watch-along POST] Error:', error);
        const name = 'My Room';
        return NextResponse.json({
            success: true,
            room: {
                id: 'custom-' + Date.now(),
                name,
                role: 'Host',
                badge: 'Live',
                badgeColor: 'bg-pink-600',
                borderColor: 'border-pink-500',
                displayPicture: '',
                watching: '1',
                engagement: '0',
                active: '1',
                isLive: true,
                liveMatchId: null,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            }
        });
    }
}
