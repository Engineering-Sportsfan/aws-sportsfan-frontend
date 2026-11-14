"use client";

// Second ROAR match-moment room, different UI: no tabs, no rails.
// All cards (auction + match) are shown in ONE feed, one below another, grouped by IST date (oldest first).
// Rendered from NewROARComponent/index.tsx for this room only; MatchMomentRoom / DiscussionRoom are untouched.

import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ChevronLeft } from "lucide-react";
import { useUserProfile } from "@/context/UserProfileContext";
import EngagementCard from "@/components/Engagements/EngagementCard";
import { MATCH_INFO, cardTime, formatIST, hasAuctionId, cleanMatchId, matchInfoFor } from "./matchMomentRoomUtils";

// Set NEXT_PUBLIC_MATCH_FEED_ROOM_ID per environment (dev / release / prod). Falls back to the dev room.
export const MATCH_FEED_ROOM_ID =
  process.env.NEXT_PUBLIC_MATCH_FEED_ROOM_ID || "room_1794668464892_9yuf213";

interface Props {
  roomId: string;
  roomName?: string;
  onBack: () => void;
}

const PAGE_SIZE = 50;
const MAX_PAGES = 20; // safety cap (up to 1000 cards)

const C = { bg: "#05060b", stroke: "#25283a", muted: "#8d91a5", text: "#f5f5fa" };

const btn: React.CSSProperties = {
  border: "1px solid #2a2e42",
  background: "#111421",
  color: "#aaaabd",
  borderRadius: 20,
  padding: "6px 12px",
  fontSize: 11,
  fontWeight: 800,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

// Scoped CSS: flat replies, no countdown chip, stored IST timestamp in place of "now" (same approach as MatchMomentRoom).
const CSS = `
.mf-flat [class*="border-l-2"], .mf-flat [class*="border-l "] { margin-left: 0 !important; padding-left: 0 !important; border-left: 0 !important; }
.mf-flat span[class*="font-mono"][class*="text-amber-400"] { display: none !important; }
.mf-card span[style*="font-size: 8px"][style*="white-space: nowrap"] { font-size: 0 !important; }
.mf-card span[style*="font-size: 8px"][style*="white-space: nowrap"]::after { content: var(--ts); font-size: 9px; }
`;

const istDateKey = (ms: number) =>
  ms > 0
    ? new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(ms))
    : "undated";

const istDateLabel = (ms: number) =>
  ms > 0
    ? new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", weekday: "short", day: "numeric", month: "short", year: "numeric" }).format(new Date(ms))
    : "Undated";

export default function MatchFeedRoom({ roomId, roomName, onBack }: Props) {
  const { userProfile } = useUserProfile();
  const userId = userProfile?.actualUserId || userProfile?.email || "";

  const [cards, setCards] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const userParam = userId ? `&userId=${encodeURIComponent(userId)}` : "";
      const found: any[] = [];
      const seen = new Set<string>();

      // Pages back through the room's cards; `extra` narrows the query (e.g. &matchId=...).
      const pull = async (extra: string, critical: boolean) => {
        let before: number | null = null;
        for (let page = 0; page < MAX_PAGES; page++) {
          const url = `/api/engagements?excludeFlipArena=true&source=match_moment&limit=${PAGE_SIZE}&roomId=${encodeURIComponent(roomId)}${extra}${before ? `&before=${before}` : ""}${userParam}&t=${Date.now()}`;
          let r;
          try {
            r = await axios.get(url, { timeout: 30000, headers: { "Cache-Control": "no-cache" } });
          } catch (err: any) {
            console.warn("MatchFeedRoom page failed:", page, err?.response?.status, err?.response?.data || err?.message, url);
            if (critical && page === 0) throw err;
            break;
          }
          const d = r.data;
          const list: any[] = d?.engagements || d?.data || (Array.isArray(d) ? d : []);
          for (const e of list) {
            if (e?.id && !seen.has(e.id)) {
              seen.add(e.id);
              found.push(e);
            }
          }
          const times = list.map(cardTime).filter((t) => t > 0);
          const oldest = times.length ? Math.min(...times) : 0;
          const hasMore = d?.pagination?.hasMore ?? list.length >= PAGE_SIZE;
          if (!hasMore || list.length === 0 || !oldest || (before !== null && oldest >= before)) break;
          before = oldest;
        }
      };

      // 1) everything the room returns by default (auction cards)
      await pull("", true);
      // 2) match cards: the API returns them per matchId, so ask for each known match and merge by id
      await Promise.all(Object.keys(MATCH_INFO).map((id) => pull(`&matchId=${encodeURIComponent(id)}`, false)));
      setCards(found);
    } catch (e: any) {
      console.warn("MatchFeedRoom fetch:", e?.response?.status, e?.response?.data || e?.message);
      const status = e?.response?.status;
      setError(`Couldn't load posts. Please try again.${status ? ` (error ${status})` : e?.code === "ECONNABORTED" ? " (timed out)" : ""}`);
    }
  }, [roomId, userId]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  // Group by IST date, oldest date first; cards inside a date oldest first.
  const groups = useMemo(() => {
    const map = new Map<string, { label: string; ms: number; cards: any[] }>();
    for (const e of cards ?? []) {
      const t = cardTime(e);
      const key = istDateKey(t);
      if (!map.has(key)) map.set(key, { label: istDateLabel(t), ms: t, cards: [] });
      map.get(key)!.cards.push(e);
    }
    const out = [...map.entries()].map(([key, g]) => {
      g.cards.sort((a, b) => cardTime(a) - cardTime(b));
      return { key, ...g };
    });
    out.sort((a, b) => (a.key === "undated" ? 1 : b.key === "undated" ? -1 : a.key.localeCompare(b.key)));
    return out;
  }, [cards]);

  // Small context line above a card: auction vs which match
  const tag = (e: any) => {
    if (hasAuctionId(e)) return "AUCTION";
    const id = cleanMatchId(e);
    return id ? matchInfoFor(id).short || id : "MATCH";
  };

  return (
    <div className="mf-flat" style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", background: C.bg, color: C.text }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderBottom: `1px solid ${C.stroke}` }}>
        <button onClick={onBack} aria-label="Back" style={{ ...btn, padding: "6px 10px" }}><ChevronLeft /></button>
        <div style={{ fontWeight: 900, fontSize: 16 }}>{roomName || "ROAR"} ⚡</div>
        <button onClick={() => { setCards(null); load(); }} style={{ ...btn, marginLeft: "auto" }}>Refresh</button>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "12px 14px 24px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          {error && !cards ? (
            <div style={{ textAlign: "center", padding: "40px 16px" }}>
              <div style={{ color: C.muted, fontSize: 13, marginBottom: 10 }}>{error}</div>
              <button onClick={() => { setError(null); load(); }} style={btn}>Retry</button>
            </div>
          ) : !cards ? (
            <div style={{ textAlign: "center", color: C.muted, fontSize: 13, padding: "40px 16px" }}>Loading…</div>
          ) : groups.length === 0 ? (
            <div style={{ textAlign: "center", color: C.muted, fontSize: 13, padding: "40px 16px" }}>No posts yet.</div>
          ) : (
            groups.map((g) => (
              <section key={g.key} style={{ marginBottom: 8 }}>
                <div
                  style={{
                    position: "sticky", top: 0, zIndex: 2, background: C.bg,
                    display: "flex", alignItems: "center", gap: 10, padding: "10px 2px",
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 900, letterSpacing: 1, color: "#ff9a43" }}>{g.label.toUpperCase()}</span>
                  <span style={{ flex: 1, height: 1, background: C.stroke }} />
                  <span style={{ fontSize: 10, color: C.muted }}>{g.cards.length} post{g.cards.length === 1 ? "" : "s"}</span>
                </div>
                {g.cards.map((e) => (
                  <div key={e.id} className="mf-card" style={{ marginBottom: 12, ["--ts" as any]: JSON.stringify(formatIST(cardTime(e))) }}>
                    <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: 1.2, color: "#bb8cff", margin: "0 2px 4px" }}>{tag(e)}</div>
                    <EngagementCard
                      item={{ ...e, creatorName: "SportsFan360", creatorAvatar: "/images/sportsfan360logo.png" }}
                      variant="post"
                    />
                  </div>
                ))}
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
