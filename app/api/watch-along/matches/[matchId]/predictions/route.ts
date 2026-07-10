import { NextResponse } from 'next/server';
import { getAuthHeaders } from '@/lib/getAuthHeaders';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://sportsfan360.vercel.app';
const API_BASE = `${BACKEND_URL}/api/watch-along`;

type Prediction = {
    id: string;
    question: string;
    options: string[];
    votes: Record<string, number>;
    votedBy?: Record<string, string>;
    totalVotes: number;
    closesAt: number | null;
    isOpen: boolean;
    createdAt: number;
    updatedAt: number;
};

type PredictionStore = Record<string, Prediction[]>;

const globalForPredictions = globalThis as typeof globalThis & {
    __watchAlongPredictions?: PredictionStore;
};

const predictionStore = globalForPredictions.__watchAlongPredictions ?? {};
globalForPredictions.__watchAlongPredictions = predictionStore;

function normalizePrediction(raw: unknown): Prediction | null {
    if (!raw || typeof raw !== 'object') return null;

    const item = raw as Partial<Prediction>;
    if (!item.id || !item.question || !Array.isArray(item.options)) return null;

    return {
        id: String(item.id),
        question: String(item.question),
        options: item.options.map(String),
        votes: item.votes ?? {},
        votedBy: item.votedBy ?? {},
        totalVotes: item.totalVotes ?? 0,
        closesAt: item.closesAt ?? null,
        isOpen: item.isOpen ?? true,
        createdAt: item.createdAt ?? Date.now(),
        updatedAt: item.updatedAt ?? Date.now(),
    };
}

function getLocalPredictions(matchId: string) {
    const now = Date.now();
    return (predictionStore[matchId] ?? []).map((prediction) => ({
        ...prediction,
        isOpen: prediction.isOpen && (!prediction.closesAt || prediction.closesAt > now),
    }));
}

function saveLocalPrediction(matchId: string, prediction: Prediction) {
    const current = predictionStore[matchId] ?? [];
    predictionStore[matchId] = [
        prediction,
        ...current.filter((item) => item.id !== prediction.id),
    ];
}

function mergePredictions(remote: Prediction[], local: Prediction[]) {
    const byId = new Map<string, Prediction>();
    [...remote, ...local].forEach((prediction) => byId.set(prediction.id, prediction));
    return Array.from(byId.values()).sort((a, b) => b.createdAt - a.createdAt);
}

async function readBackendJson(response: Response) {
    try {
        return await response.json();
    } catch {
        return null;
    }
}

export async function GET(req: Request, { params }: { params: Promise<{ matchId: string }> }) {
    const { matchId } = await params;
    const { searchParams } = new URL(req.url);
    const openOnly = searchParams.get('open') === 'true' || searchParams.get('openOnly') === 'true';
    const localPredictions = getLocalPredictions(matchId);

    try {
        const authHeaders = await getAuthHeaders();
        const response = await fetch(`${API_BASE}/matches/${matchId}/predictions`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', ...authHeaders },
            cache: 'no-store',
        });

        if (!response.ok) {
            console.warn('[watch-along predictions GET] Backend error, using local predictions');
            const predictions = openOnly ? localPredictions.filter((item) => item.isOpen) : localPredictions;
            return NextResponse.json({ success: true, predictions });
        }

        const data = await readBackendJson(response);
        if (data?.success === false) {
            console.warn('[watch-along predictions GET] Backend returned unsuccessful payload, using local predictions');
            const predictions = openOnly ? localPredictions.filter((item) => item.isOpen) : localPredictions;
            return NextResponse.json({ success: true, predictions });
        }

        const remotePredictions = Array.isArray(data?.predictions)
            ? data.predictions.map(normalizePrediction).filter(Boolean) as Prediction[]
            : [];
        const predictions = mergePredictions(remotePredictions, localPredictions);

        return NextResponse.json({
            success: true,
            predictions: openOnly ? predictions.filter((item) => item.isOpen) : predictions,
        });
    } catch (error) {
        console.error('[watch-along predictions GET] Error:', error);
        const predictions = openOnly ? localPredictions.filter((item) => item.isOpen) : localPredictions;
        return NextResponse.json({ success: true, predictions });
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ matchId: string }> }) {
    const { matchId } = await params;
    const body = await req.json();

    try {
        const authHeaders = await getAuthHeaders();
        const response = await fetch(`${API_BASE}/matches/${matchId}/predictions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders },
            body: JSON.stringify(body),
        });

        if (response.ok) {
            const data = await readBackendJson(response);
            if (data?.success === false) {
                console.warn('[watch-along predictions POST] Backend returned unsuccessful payload, using local fallback:', data?.message);
                throw new Error(data?.message || 'Backend prediction request failed');
            }

            const prediction = normalizePrediction(data?.prediction);
            if (prediction) saveLocalPrediction(matchId, prediction);
            return NextResponse.json(data ?? { success: true }, { status: response.status });
        }

        const errText = await response.text();
        console.warn('[watch-along predictions POST] Backend error, using local fallback:', errText);
    } catch (error) {
        console.error('[watch-along predictions POST] Error, using local fallback:', error);
    }

    if (body.action === 'vote') {
        const predictions = predictionStore[matchId] ?? [];
        const prediction = predictions.find((item) => item.id === body.predictionId);

        if (!prediction) {
            return NextResponse.json({ success: false, message: 'Prediction not found' }, { status: 404 });
        }

        const userId = String(body.userId || 'anonymous');
        prediction.votedBy = prediction.votedBy ?? {};

        if (prediction.votedBy[userId]) {
            return NextResponse.json({ success: false, alreadyVoted: true }, { status: 409 });
        }

        const option = String(body.option || '');
        prediction.votes[option] = (prediction.votes[option] ?? 0) + 1;
        prediction.votedBy[userId] = option;
        prediction.totalVotes += 1;
        prediction.updatedAt = Date.now();

        return NextResponse.json({ success: true, prediction });
    }

    const options = Array.isArray(body.options)
        ? body.options.map((option: unknown) => String(option).trim()).filter(Boolean)
        : [];

    if (!body.question || options.length < 2) {
        return NextResponse.json({ success: false, message: 'Question and at least two options are required' }, { status: 400 });
    }

    const now = Date.now();
    const prediction: Prediction = {
        id: `local-prediction-${now}-${Math.random().toString(36).slice(2, 8)}`,
        question: String(body.question).trim(),
        options,
        votes: Object.fromEntries(options.map((option: string) => [option, 0])),
        votedBy: {},
        totalVotes: 0,
        closesAt: typeof body.closesAt === 'number' ? body.closesAt : null,
        isOpen: true,
        createdAt: now,
        updatedAt: now,
    };

    saveLocalPrediction(matchId, prediction);

    return NextResponse.json({ success: true, prediction });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ matchId: string }> }) {
    const { matchId } = await params;
    const body = await req.json();

    try {
        const authHeaders = await getAuthHeaders();
        const response = await fetch(`${API_BASE}/matches/${matchId}/predictions`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', ...authHeaders },
            body: JSON.stringify(body),
        });

        if (response.ok) {
            const data = await readBackendJson(response);
            return NextResponse.json(data ?? { success: true }, { status: response.status });
        }

        console.warn('[watch-along predictions PATCH] Backend error, using local fallback');
    } catch (error) {
        console.error('[watch-along predictions PATCH] Error, using local fallback:', error);
    }

    const predictions = predictionStore[matchId] ?? [];
    const prediction = predictions.find((item) => item.id === body.predictionId);

    if (!prediction) {
        return NextResponse.json({ success: false, message: 'Prediction not found' }, { status: 404 });
    }

    prediction.isOpen = Boolean(body.isOpen);
    prediction.updatedAt = Date.now();

    return NextResponse.json({ success: true, prediction });
}
