"use client";
import { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from "react";
import axios from "axios";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ScriptMatchInfo {
    team1?: string;
    team2?: string;
    type?: string;
    speaker?: string;
    date?: string;
}

export interface ScriptFile {
    id: string;
    title: string;
    fileName: string;
    url: string;
    size: number;
    sizeFormatted: string;
    format: string;
    createdAt: string;
    createdAtFormatted: string;
    folder: string;
    matchInfo?: ScriptMatchInfo;
}

interface ScriptsContextValue {
    scripts: ScriptFile[];
    loading: boolean;
    error: string | null;
    /** Find the best-matching script for a given audio's matchInfo */
    findScript: (matchInfo?: ScriptMatchInfo) => ScriptFile | null;
    /** Fetch + cache the raw HTML content of a script URL */
    fetchScriptContent: (url: string) => Promise<string | null>;
    refresh: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ScriptsContext = createContext<ScriptsContextValue | null>(null);

// ─── Match scoring ────────────────────────────────────────────────────────────

/**
 * Normalise a string for loose comparison:
 * lower-case, collapse whitespace, strip underscores.
 */
const norm = (s?: string) =>
    (s ?? "").toLowerCase().replace(/_/g, " ").replace(/\s+/g, " ").trim();

/**
 * Normalise a type string to a canonical set of keywords.
 * e.g. "toss report" → ["toss", "report"]
 *      "pre match"   → ["pre", "match"]
 */
const typeTokens = (t?: string) => norm(t).split(" ").filter(Boolean);

/**
 * Score how well a script matches an audio's matchInfo.
 * Higher = better match. Returns -1 if the match is impossible.
 */
function scoreMatch(script: ScriptMatchInfo, audio: ScriptMatchInfo): number {
    let score = 0;

    // Teams must match (order-agnostic) — hard requirement
    const st1 = norm(script.team1);
    const st2 = norm(script.team2);
    const at1 = norm(audio.team1);
    const at2 = norm(audio.team2);

    const teamsMatch =
        (st1 === at1 && st2 === at2) || (st1 === at2 && st2 === at1);

    if (!teamsMatch) return -1;
    score += 10;

    // Date match (strong signal)
    if (script.date && audio.date && norm(script.date) === norm(audio.date)) {
        score += 8;
    }

    // Type match — check token overlap
    const scriptTokens = typeTokens(script.type);
    const audioTokens = typeTokens(audio.type);
    const overlap = scriptTokens.filter((t) => audioTokens.includes(t)).length;
    if (overlap > 0) {
        score += overlap * 3;
    }

    // Speaker match (bonus, not required)
    if (script.speaker && audio.speaker && norm(script.speaker) === norm(audio.speaker)) {
        score += 2;
    }

    return score;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ScriptsProvider({ children }: { children: ReactNode }) {
    const [scripts, setScripts] = useState<ScriptFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // In-memory HTML content cache  { url → htmlString }
    const contentCache = useRef<Map<string, string>>(new Map());
    // In-flight fetch promises so we don't double-fetch
    const inFlight = useRef<Map<string, Promise<string | null>>>(new Map());

    const fetchScripts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            // const res = await axios.get<{ success: boolean; scriptFiles: ScriptFile[] }>(
            //     "/api/cloudinary/scripts?limit=50"
            // );
             const res = await axios.get<{ success: boolean; scriptFiles: ScriptFile[] }>(
                "/"
            );
            if (res.data.success) {
                setScripts(res.data.scriptFiles);
            } else {
                setError("Failed to load scripts.");
            }
        } catch (err) {
            console.error("[ScriptsContext] fetch error:", err);
            setError("Failed to load scripts.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchScripts();
    }, [fetchScripts]);

    // ── findScript ────────────────────────────────────────────────────────────

    const findScript = useCallback(
        (matchInfo?: ScriptMatchInfo): ScriptFile | null => {
            if (!matchInfo || scripts.length === 0) return null;

            let best: ScriptFile | null = null;
            let bestScore = -1;

            for (const script of scripts) {
                const s = scoreMatch(script.matchInfo ?? {}, matchInfo);
                if (s > bestScore) {
                    bestScore = s;
                    best = script;
                }
            }

            // Require at least a team match (score ≥ 10)
            return bestScore >= 10 ? best : null;
        },
        [scripts]
    );

    // ── fetchScriptContent ────────────────────────────────────────────────────

    const fetchScriptContent = useCallback(async (url: string): Promise<string | null> => {
        // Return cached
        if (contentCache.current.has(url)) {
            return contentCache.current.get(url)!;
        }

        // Return in-flight promise
        if (inFlight.current.has(url)) {
            return inFlight.current.get(url)!;
        }

        const promise = (async (): Promise<string | null> => {
            try {
                const res = await fetch(url);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const html = await res.text();
                contentCache.current.set(url, html);
                return html;
            } catch (err) {
                console.error("[ScriptsContext] content fetch error:", err);
                return null;
            } finally {
                inFlight.current.delete(url);
            }
        })();

        inFlight.current.set(url, promise);
        return promise;
    }, []);

    return (
        <ScriptsContext.Provider
            value={{
                scripts,
                loading,
                error,
                findScript,
                fetchScriptContent,
                refresh: fetchScripts,
            }}
        >
            {children}
        </ScriptsContext.Provider>
    );
}

// ─── Hook 

export function useScripts() {
    const ctx = useContext(ScriptsContext);
    if (!ctx) throw new Error("useScripts must be used inside <ScriptsProvider>");
    return ctx;
}