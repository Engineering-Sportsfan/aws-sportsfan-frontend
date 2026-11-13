"use client";

// Separate room view for the ROAR "match moment" room (hardcoded roomId, see MATCH_MOMENT_ROOM_ID).
// Rendered from NewROARComponent/index.tsx instead of DiscussionRoom for that one room only,
// so the existing DiscussionRoom flow is untouched.
//
// Data is loaded lazily: one auction day at a time (default D01), one match at a time.

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useUserProfile } from "@/context/UserProfileContext";
import EngagementCard from "@/components/Engagements/EngagementCard";
import {
  type RoomTab,
  auctionDay,
  cardTime,
  formatIST,
  getActiveMatchSet,
  getDemoNow,
  groupByAuctionDay,
  groupByMoment,
  hasAuctionId,
  matchInfoFor,
} from "./matchMomentRoomUtils";
import { ChevronLeft } from "lucide-react";

interface Props {
  roomId: string;
  roomName?: string;
  onBack: () => void;
}

const PAGE_SIZE = 50;
const MAX_PAGES = 6; // safety cap per day / per match
const DAY_MS = 24 * 60 * 60 * 1000;

const DEMO_A = "2026-12-11T10:00:00+05:30";
const DEMO_B = "2026-12-13T09:00:00+05:30";

// Auction journey: D01 = 9 Dec ... D15 = 23 Dec 2026 (IST)
const AUCTION_DAYS: { day: number; title: string; phase: "PRE-AUCTION" | "AUCTION DAY" | "POST-AUCTION" }[] = [
  { day: 1, title: "Countdown begins", phase: "PRE-AUCTION" },
  { day: 2, title: "Franchise needs debate", phase: "PRE-AUCTION" },
  { day: 3, title: "Player watch day", phase: "PRE-AUCTION" },
  { day: 4, title: "Mock auction challenge", phase: "PRE-AUCTION" },
  { day: 5, title: "Rumours versus verified news", phase: "PRE-AUCTION" },
  { day: 6, title: "Biggest buy versus best value", phase: "PRE-AUCTION" },
  { day: 7, title: "Final countdown", phase: "PRE-AUCTION" },
  { day: 8, title: "The auction is LIVE!", phase: "AUCTION DAY" },
  { day: 9, title: "First verdicts", phase: "POST-AUCTION" },
  { day: 10, title: "Biggest buy versus best value", phase: "POST-AUCTION" },
  { day: 11, title: "The unsold player conversation", phase: "POST-AUCTION" },
  { day: 12, title: "Build your franchise's best XI", phase: "POST-AUCTION" },
  { day: 13, title: "Prediction report cards", phase: "POST-AUCTION" },
  { day: 14, title: "Follow your favourite players", phase: "POST-AUCTION" },
  { day: 15, title: "Community verdict and season bridge", phase: "POST-AUCTION" },
];

const dayStartMs = (day: number) =>
  new Date(`2026-12-${String(8 + day).padStart(2, "0")}T00:00:00+05:30`).getTime();
const dayDateLabel = (day: number) => `${8 + day} Dec`;

const C = {
  bg: "#05060b",
  surface: "#0b0d16",
  stroke: "#25283a",
  muted: "#8d91a5",
  text: "#f5f5fa",
};

const chipStyle = (active: boolean): React.CSSProperties => ({
  border: `1px solid ${active ? "#f33379" : "#2a2e42"}`,
  background: active ? "linear-gradient(100deg,#45142c,#25133e)" : "#111421",
  color: active ? "#fff" : "#aaaabd",
  borderRadius: 20,
  padding: "6px 12px",
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: 0.4,
  cursor: "pointer",
  whiteSpace: "nowrap",
});

// Replies shown as a flat list: neutralise the nested-reply indent/guide line inside this room only.
// (Scoped to .mm-flat so the shared comment thread looks unchanged everywhere else.)
const FLAT_REPLIES_CSS = `
.mm-flat [class*="border-l-2"], .mm-flat [class*="border-l "] { margin-left: 0 !important; padding-left: 0 !important; border-left: 0 !important; }
.mm-rail::-webkit-scrollbar { display: none; }
/* Demo: no running countdown chip on cards; the stored IST timestamp above each card is shown instead. */
.mm-flat span[class*="font-mono"][class*="text-amber-400"] { display: none !important; }
/* Header "now / 5m" text -> the stored IST timestamp (set per card via --ts). */
.mm-card span[style*="font-size: 8px"][style*="white-space: nowrap"] { font-size: 0 !important; }
.mm-card span[style*="font-size: 8px"][style*="white-space: nowrap"]::after { content: var(--ts); font-size: 9px; }
`;

const tabLabel = (matchId: string | undefined, fallback: string) =>
  matchId ? matchInfoFor(matchId).short || fallback : fallback;

export default function MatchMomentRoom({ roomId, roomName, onBack }: Props) {
  const { userProfile } = useUserProfile();
  const userId = userProfile?.actualUserId || userProfile?.email || "";

  const [tab, setTab] = useState<RoomTab>("auction");
  const [selectedDay, setSelectedDay] = useState(1); // default: first day
  const [selectedMoment, setSelectedMoment] = useState<string | null>(null); // match tabs: null = first moment

  // Lazy caches keyed by day number / matchId
  const [dayCache, setDayCache] = useState<Record<number, any[]>>({});
  const [matchCache, setMatchCache] = useState<Record<string, any[]>>({});
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Demo clock: only honoured when ?demoNow= is present.
  const [demoNow, setDemoNow] = useState<Date | null>(null);
  useEffect(() => setDemoNow(getDemoNow()), []);

  const railRef = useRef<HTMLDivElement>(null);

  const baseUrl = useCallback(
    (extra: string) => {
      const userParam = userId ? `&userId=${encodeURIComponent(userId)}` : "";
      return `/api/engagements?excludeFlipArena=true&source=match_moment&limit=${PAGE_SIZE}&roomId=${encodeURIComponent(roomId)}${extra}${userParam}&t=${Date.now()}`;
    },
    [roomId, userId]
  );

  const extract = (d: any): any[] => d?.engagements || d?.data || (Array.isArray(d) ? d : []);

  // ── Fetch ONE auction day (pages back from the end of that day until we pass its start) ──
  const fetchDay = useCallback(
    async (day: number, force = false) => {
      if (!force && dayCache[day]) return;
      setLoadingKey(`day-${day}`);
      setError(null);
      try {
        const start = dayStartMs(day);
        let before: number = start + DAY_MS;
        const found: any[] = [];
        const seen = new Set<string>();
        for (let page = 0; page < MAX_PAGES; page++) {
          const r = await axios.get(baseUrl(`&before=${before}`), {
            timeout: 20000,
            headers: { "Cache-Control": "no-cache" },
          });
          const list = extract(r.data);
          for (const e of list) {
            if (e?.id && !seen.has(e.id) && hasAuctionId(e) && auctionDay(e) === day) {
              seen.add(e.id);
              found.push(e);
            }
          }
          const times = list.map(cardTime).filter((t) => t > 0);
          const oldest = times.length ? Math.min(...times) : 0;
          const hasMore = r.data?.pagination?.hasMore ?? list.length >= PAGE_SIZE;
          if (!hasMore || list.length === 0 || !oldest || oldest < start || oldest >= before) break;
          before = oldest;
        }
        setDayCache((c) => ({ ...c, [day]: found }));
      } catch (e) {
        console.warn("MatchMomentRoom day fetch:", e);
        setError("Couldn't load posts. Please try again.");
      } finally {
        setLoadingKey(null);
      }
    },
    [baseUrl, dayCache]
  );

  // ── Fetch ONE match's cards ──
  const fetchMatch = useCallback(
    async (matchId: string, force = false) => {
      if (!force && matchCache[matchId]) return;
      setLoadingKey(`match-${matchId}`);
      setError(null);
      try {
        const found: any[] = [];
        const seen = new Set<string>();
        let before: number | null = null;
        for (let page = 0; page < MAX_PAGES; page++) {
          const r = await axios.get(
            baseUrl(`&matchId=${encodeURIComponent(matchId)}${before ? `&before=${before}` : ""}`),
            { timeout: 20000, headers: { "Cache-Control": "no-cache" } }
          );
          const list = extract(r.data);
          for (const e of list) {
            if (e?.id && !seen.has(e.id) && !hasAuctionId(e)) {
              seen.add(e.id);
              found.push(e);
            }
          }
          const times = list.map(cardTime).filter((t) => t > 0);
          const oldest = times.length ? Math.min(...times) : 0;
          const hasMore = r.data?.pagination?.hasMore ?? list.length >= PAGE_SIZE;
          if (!hasMore || list.length === 0 || !oldest || (before !== null && oldest >= before)) break;
          before = oldest;
        }
        setMatchCache((c) => ({ ...c, [matchId]: found }));
      } catch (e) {
        console.warn("MatchMomentRoom match fetch:", e);
        setError("Couldn't load posts. Please try again.");
      } finally {
        setLoadingKey(null);
      }
    },
    [baseUrl, matchCache]
  );

  // ── Derived ──
  const activeIds = useMemo(() => getActiveMatchSet(demoNow ?? new Date()), [demoNow]);
  const activeMatches = useMemo(() => activeIds.map((id) => matchInfoFor(id)), [activeIds]);

  // Each match tab shows ONE match: tab 2 = 1st match of the set, tab 3 = 2nd match of the set.
  const viewMatchId = tab === "live" ? activeIds[0] : tab === "matches" ? activeIds[1] : undefined;

  // Load only what's on screen
  useEffect(() => {
    if (tab === "auction") fetchDay(selectedDay);
    else if (viewMatchId) fetchMatch(viewMatchId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, selectedDay, viewMatchId]);

  // Keep the selected day chip visible in the swipe rail
  const selectedKey = tab === "auction" ? String(selectedDay) : (selectedMoment ?? "");
  useEffect(() => {
    const el = railRef.current?.querySelector<HTMLElement>(`[data-key="${selectedKey}"]`);
    el?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [selectedKey, tab]);

  const switchTab = (t: RoomTab) => {
    setTab(t);
    setSelectedMoment(null);
  };

  const refresh = () => {
    if (tab === "auction") fetchDay(selectedDay, true);
    else if (viewMatchId) fetchMatch(viewMatchId, true);
  };

  // ── Render helpers ──
  const renderCard = (e: any) => (
    <div key={e.id} className="mm-card" style={{ marginBottom: 12, ["--ts" as any]: JSON.stringify(formatIST(cardTime(e))) }}>
      <EngagementCard
        item={{
          ...e,
          creatorName: "SportsFan360",
          creatorAvatar: "/images/sportsfan360logo.png",
        }}
        variant="post"
      />
    </div>
  );

  const note = (msg: string) => (
    <div style={{ textAlign: "center", color: C.muted, fontSize: 13, padding: "40px 16px" }}>{msg}</div>
  );

  const errorBox = (
    <div style={{ textAlign: "center", padding: "40px 16px" }}>
      <div style={{ color: C.muted, fontSize: 13, marginBottom: 10 }}>{error}</div>
      <button onClick={refresh} style={chipStyle(true)}>Retry</button>
    </div>
  );

  // ── Shared rail: left sidebar on web / swipe strip on top on mobile ──
  type RailItem = { key: string; date?: string; title: string; phase?: string };
  const renderRail = (heading: string, items: RailItem[], selected: string, onSelect: (k: string) => void) => (
    <aside
      className="md:w-60 md:shrink-0 md:overflow-y-auto md:rounded-2xl md:border md:p-2"
      style={{ borderColor: C.stroke, background: "transparent" }}
    >
      <div className="hidden md:block" style={{ fontSize: 10, color: "#858ba0", letterSpacing: 1.5, fontWeight: 900, padding: "6px 8px 8px" }}>
        {heading}
      </div>
      <div
        ref={railRef}
        className="mm-rail flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-1 md:pb-0"
        style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}
      >
        {items.map((d, i) => {
          const active = d.key === selected;
          const showPhase = !!d.phase && (i === 0 || items[i - 1].phase !== d.phase);
          return (
            <React.Fragment key={d.key}>
              {showPhase && (
                <div
                  className="hidden md:block"
                  style={{ fontSize: 9, fontWeight: 900, letterSpacing: 1.3, color: "#ff9a43", border: "1px solid #6c3c32", borderRadius: 20, padding: "5px 10px", margin: "6px 0 2px" }}
                >
                  {d.phase}
                </div>
              )}
              <button
                data-key={d.key}
                onClick={() => onSelect(d.key)}
                className="shrink-0 md:shrink text-left"
                style={{
                  scrollSnapAlign: "center",
                  minWidth: 112,
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  border: `1px solid ${active ? "#9e285c" : "#2a2e42"}`,
                  background: active ? "linear-gradient(100deg,#321326,#1b1230)" : "#0b0d16",
                  borderRadius: 10,
                  padding: "8px 10px",
                  color: "#d8d9e4",
                  cursor: "pointer",
                }}
              >
                <span style={{ color: "#ff8a39", fontWeight: 900, fontSize: 11, whiteSpace: "nowrap" }}>
                  {d.date ?? String(i + 1).padStart(2, "0")}
                </span>
                <span className="hidden md:inline" style={{ fontSize: 11, lineHeight: 1.25 }}>{d.title}</span>
                <span className="md:hidden" style={{ fontSize: 10, lineHeight: 1.2, maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.title}</span>
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </aside>
  );

  const phaseBadge = (text: string) =>
    text ? (
      <span style={{ marginLeft: "auto", fontSize: 9, fontWeight: 900, letterSpacing: 1, color: "#bb8cff", border: "1px solid #594184", borderRadius: 20, padding: "4px 9px", whiteSpace: "nowrap" }}>
        {text}
      </span>
    ) : null;

  // ── Auction tab: day rail + selected day's cards ──
  const renderAuction = () => {
    const meta = AUCTION_DAYS.find((d) => d.day === selectedDay)!;
    const all = dayCache[selectedDay];
    const cards = groupByAuctionDay(all ?? [])[0]?.cards ?? [];

    return (
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 flex-1 min-h-0">
        {renderRail(
          "YOUR 15-DAY AUCTION JOURNEY",
          AUCTION_DAYS.map((d) => ({ key: String(d.day), date: dayDateLabel(d.day), title: d.title, phase: d.phase })),
          String(selectedDay),
          (k) => setSelectedDay(Number(k))
        )}
        <div className="flex-1 min-w-0 md:overflow-y-auto">
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 4px 10px" }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>{meta.title}</h2>
            {phaseBadge(meta.phase)}
          </div>
          {error && !all ? errorBox : (
            <>
              {!all ? note("Loading…") : cards.length === 0 ? note("No posts for this day yet.") : cards.map(renderCard)}
            </>
          )}
        </div>
      </div>
    );
  };

  // ── Match tabs (2 & 3): ONE match each, with a match-moments rail ──
  const renderMatchTab = (matchId: string | undefined) => {
    if (!matchId) return note("No match available.");
    const info = matchInfoFor(matchId);
    const all = matchCache[matchId];
    const moments = groupByMoment(all ?? []);
    const activeKey = moments.find((m) => m.key === selectedMoment)?.key ?? moments[0]?.key ?? "";
    const current = moments.find((m) => m.key === activeKey);
    const cards = current?.cards ?? [];

    return (
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 flex-1 min-h-0">
        {renderRail(
          "MATCH MOMENTS",
          moments.map((m, i) => ({ key: m.key, date: String(i + 1).padStart(2, "0"), title: m.label })),
          activeKey,
          (k) => setSelectedMoment(k)
        )}
        <div className="flex-1 min-w-0 md:overflow-y-auto">
          <div style={{ padding: "4px 4px 10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>{info.title}</h2>
              {phaseBadge(current?.phase ?? "")}
            </div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
              {[info.format, info.stage, formatIST(info.startsAt)].filter(Boolean).join(" · ")}
            </div>
            {current && <div style={{ fontSize: 12, color: "#d78bff", fontWeight: 700, marginTop: 6 }}>{current.label}</div>}
          </div>
          {error && !all ? errorBox : (
            <>
              {!all ? note("Loading…") : cards.length === 0 ? note("No posts for this moment yet.") : cards.map(renderCard)}
            </>
          )}
        </div>
      </div>
    );
  };

  const demoActive = demoNow !== null;

  return (
    <div className="mm-flat" style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", background: C.bg, color: C.text }}>
      <style dangerouslySetInnerHTML={{ __html: FLAT_REPLIES_CSS }} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderBottom: `1px solid ${C.stroke}` }}>
        <button onClick={onBack} aria-label="Back" style={{ ...chipStyle(false), padding: "6px 10px" }}><ChevronLeft /></button>
        <div style={{ fontWeight: 900, fontSize: 16 }}>{roomName || "ROAR"} ⚡</div>
        <button onClick={refresh} style={{ ...chipStyle(false), marginLeft: "auto" }}>Refresh</button>
      </div>

      {/* Tabs: always visible */}
      <div style={{ display: "flex", gap: 8, padding: "10px 14px 0" }}>
        {([
          ["auction", "Auction"],
          ["live", tabLabel(activeIds[0], "Live Match")],
          ["matches", tabLabel(activeIds[1], "Match 2")],
        ] as [RoomTab, string][]).map(([k, label]) => (
          <button
            key={k}
            onClick={() => switchTab(k)}
            style={{ ...chipStyle(tab === k), flex: 1, padding: "10px 6px", fontSize: 12, borderRadius: 10 }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Dev demo toggle: only when ?demoNow= is in the URL */}
      {demoActive && (
        <div style={{ display: "flex", gap: 8, padding: "8px 14px 0", alignItems: "center" }}>
          <span style={{ fontSize: 10, color: "#ffb36b", fontWeight: 800 }}>DEMO</span>
          <button style={chipStyle(activeIds.length === 2)} onClick={() => setDemoNow(new Date(DEMO_A))}>Set A · 11 Dec</button>
          <button style={chipStyle(activeIds.length === 1)} onClick={() => setDemoNow(new Date(DEMO_B))}>Set B · 13 Dec</button>
        </div>
      )}

      {/* Body */}
      <div
        className="flex flex-col overflow-y-auto md:overflow-hidden"
        style={{ flex: 1, minHeight: 0, padding: "12px 14px 24px" }}
      >
        {tab === "auction" ? renderAuction() : renderMatchTab(viewMatchId)}
      </div>
    </div>
  );
}
