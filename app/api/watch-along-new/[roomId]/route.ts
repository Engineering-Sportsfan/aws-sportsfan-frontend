import { NextResponse } from 'next/server';
import { getAuthHeaders } from '@/lib/getAuthHeaders';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://sportsfan360.vercel.app';
const API_BASE = `${BACKEND_URL}/api/watch-along`;

// GET /api/watch-along/[roomId] — fetch a single room by ID
export async function GET(req: Request, { params }: { params: Promise<{ roomId: string }> }) {
    try {
        const { roomId } = await params;

        const response = await fetch(`${API_BASE}/${roomId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            console.warn(`[watch-along/${roomId} GET] Backend returned ${response.status}`);
            return NextResponse.json({ success: false, message: 'Room not found' }, { status: 404 });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error(`[watch-along/[roomId] GET] Error:`, error);
        return NextResponse.json({ success: false, message: 'Failed to fetch room' }, { status: 500 });
    }
}

// PUT /api/watch-along/[roomId] — update a room
export async function PUT(req: Request, { params }: { params: Promise<{ roomId: string }> }) {
    try {
        const { roomId } = await params;
        const formData = await req.formData();
        const authHeaders = await getAuthHeaders();

        const response = await fetch(`${API_BASE}/${roomId}`, {
            method: 'PUT',
            body: formData,
            headers: { ...authHeaders },
        });

        if (!response.ok) {
            return NextResponse.json({ success: false, message: 'Update failed' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error(`[watch-along/[roomId] PUT] Error:`, error);
        return NextResponse.json({ success: false, message: 'Update failed' }, { status: 500 });
    }
}

// DELETE /api/watch-along/[roomId] — delete a room
export async function DELETE(req: Request, { params }: { params: Promise<{ roomId: string }> }) {
    try {
        const { roomId } = await params;

        const authHeaders = await getAuthHeaders();
        const response = await fetch(`${API_BASE}/${roomId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', ...authHeaders },
        });

        if (!response.ok) {
            return NextResponse.json({ success: false, message: 'Delete failed' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error(`[watch-along/[roomId] DELETE] Error:`, error);
        return NextResponse.json({ success: false, message: 'Delete failed' }, { status: 500 });
    }
}
