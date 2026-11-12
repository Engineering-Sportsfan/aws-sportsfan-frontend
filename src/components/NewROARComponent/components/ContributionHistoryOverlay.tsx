"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";

type TabKey = "all" | "predictions" | "reactions" | "debates";
type Kind = Exclude<TabKey, "all">;

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "predictions", label: "Predictions" },
  { key: "reactions", label: "Reactions" },
  { key: "debates", label: "Debates" },
];

const LIMIT = 5; // every tab shows only the latest 5

const KIND_STYLE: Record<Kind, { bg: string; icon: string }> = {
  predictions: { bg: "linear-gradient(135deg,#be123c,#e11d48)", icon: "🏆" },
  reactions: { bg: "linear-gradient(135deg,#ea580c,#f97316)", icon: "⚡" },
  debates: { bg: "linear-gradient(135deg,#7c3aed,#9333ea)", icon: "💬" },
};

interface HistoryItem {
  id: string;
  kind: Kind;
  title: string;
  points: number;
  createdAt: number;
  thumb?: string;
}

const typeOf = (a: any): string => String(a?.type || a?.metadata?.type || "").toUpperCase();

/**
 * True only for activity that belongs to a match / match-moment engagement.
 * ROAR room messages (they carry a roomId and no engagement/moment id) are excluded.
 */
function isMatchEngagement(a: any): boolean {
  const m = a?.metadata ?? {};
  if (String(m.predictionType ?? "").toLowerCase() === "live") return false;
  const strong = !!(
    m.momentId || a?.momentId ||
    m.engagementId || a?.engagementId ||
    m.source === "match_moment" || a?.source === "match_moment"
  );
  if (strong) return true;
  const matchId = m.matchId || a?.matchId;
  const roomId = m.roomId || a?.roomId;
  return !!matchId && matchId !== "GLOBAL" && !roomId;
}

function classify(a: any): Kind | null {
  if (!isMatchEngagement(a)) return null;
  const t = typeOf(a);
  if (t.includes("PREDICTION")) return "predictions";
  if (t.includes("DEBATE")) return "debates";
  if (t.includes("LIKE") || t.includes("COMMENT") || t.includes("REPLY") || t.includes("REPLIED")) return "reactions";
  return null;
}

function titleFor(a: any, kind: Kind): string {
  const m = a?.metadata ?? {};
  const t = typeOf(a);
  const text = String(m.statement || m.text || m.title || a?.label || "").trim();
  if (kind === "reactions") {
    const verb = t.includes("REPLY") ? "Replied to" : t.includes("COMMENT") ? "Commented on" : "Liked";
    return text ? `${verb} “${text}”` : `${verb} a post`;
  }
  return text || (kind === "predictions" ? "Made a prediction" : "Joined a debate");
}

function timeAgo(ts: number): string {
  if (!ts) return "just now";
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export interface ContributionHistoryOverlayProps {
  open: boolean;
  onClose: () => void;
  loading?: boolean;
  /** Raw activity-log entries ({ id, type, points, label, metadata, createdAt }). */
  activities: any[];
  /** Current user's id/email. Reactions (likes/comments/replies) are only loaded for the own profile. */
  userId?: string | null;
}

const REACTIONS_URL = "/api/engagements/my-reactions";
const LIST_URL = "/api/engagements?excludeFlipArena=true&source=match_moment&limit=50";

const engagementText = (e: any): string =>
  String(e?.title || e?.question || e?.statement || e?.text || e?.prompt || "").trim();

/**
 * "My reactions" on match-moment engagements: things I liked, commented on or replied to.
 * 1) Preferred: GET /api/engagements/my-reactions?userId=&limit=5  (backend endpoint, see reply notes)
 *    -> { reactions: [{ id, action: "like"|"comment"|"reply", title, text?, createdAt, points?, imageUrl? }] }
 * 2) Fallback (endpoint missing): likes only, from the match-moment list's per-user `userLiked` flag.
 */
async function loadMyReactions(userId: string): Promise<HistoryItem[]> {
  const uid = encodeURIComponent(userId);
  try {
    // No userId param: the backend uses the logged-in user (it 403s if the id doesn't match exactly).
    const res = await axios.get(`${REACTIONS_URL}?limit=${LIMIT}`, { timeout: 12000, withCredentials: true });
    const list: any[] = res.data?.reactions || res.data?.data || (Array.isArray(res.data) ? res.data : []);
    // Empty = index/backfill not ready yet -> use the likes-only fallback below.
    if (list.length === 0) throw new Error("no reactions from endpoint");
    return list.map((r) => {
      const action = String(r.action || r.type || "like").toLowerCase();
      const verb = action.includes("repl") ? "Replied to" : action.includes("comment") ? "Commented on" : "Liked";
      const title = String(r.title || r.engagementTitle || "").trim();
      return {
        id: String(r.id ?? `${action}-${r.engagementId}-${r.createdAt}`),
        kind: "reactions" as const,
        title: title ? `${verb} “${title}”` : `${verb} a post`,
        points: Number(r.points) || 0,
        createdAt: Number(r.createdAt) || 0,
        thumb: r.imageUrl || r.thumbnail,
      };
    });
  } catch {
    const res = await axios.get(`${LIST_URL}&userId=${uid}`, { timeout: 12000 });
    const d = res.data;
    const list: any[] = d?.engagements || d?.data || (Array.isArray(d) ? d : []);
    return list
      .filter((e) => e?.userLiked === true)
      .map((e) => {
        const title = engagementText(e);
        return {
          id: `like-${e.id}`,
          kind: "reactions" as const,
          title: title ? `Liked “${title}”` : "Liked a post",
          points: 0,
          createdAt: Number(e.createdAt) || 0,
        };
      });
  }
}

export function ContributionHistoryOverlay({ open, onClose, loading, activities, userId }: ContributionHistoryOverlayProps) {
  const [tab, setTab] = useState<TabKey>("all");
  const [reactionItems, setReactionItems] = useState<HistoryItem[]>([]);
  const [reactionsLoading, setReactionsLoading] = useState(false);

  // Fetch once each time the screen is opened (not polled).
  useEffect(() => {
    if (!open || !userId) return;
    let cancelled = false;
    setReactionsLoading(true);
    loadMyReactions(userId)
      .then((r) => { if (!cancelled) setReactionItems(r); })
      .catch(() => { if (!cancelled) setReactionItems([]); })
      .finally(() => { if (!cancelled) setReactionsLoading(false); });
    return () => { cancelled = true; };
  }, [open, userId]);

  const items = useMemo<HistoryItem[]>(() => {
    const out: HistoryItem[] = [...reactionItems];
    for (const a of activities || []) {
      const kind = classify(a);
      // Reactions come from loadMyReactions, not the activity log.
      if (!kind || kind === "reactions") continue;
      out.push({
        id: String(a.id ?? `${typeOf(a)}-${a.createdAt}`),
        kind,
        title: titleFor(a, kind),
        points: Number(a.points) || 0,
        createdAt: Number(a.createdAt) || 0,
        thumb: a?.metadata?.imageUrl || a?.metadata?.thumbnail || a?.metadata?.image,
      });
    }
    return out.sort((x, y) => y.createdAt - x.createdAt);
  }, [activities, reactionItems]);

  if (!open) return null;

  const visible = (tab === "all" ? items : items.filter((i) => i.kind === tab)).slice(0, LIMIT);

  return (
    <div
      style={{
        position: "absolute", inset: 0, zIndex: 60, background: "#070b14", color: "#fff",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}
    >
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 10, padding: "14px 16px" }}>
        <button
          type="button" onClick={onClose} aria-label="Back" data-nav="back"
          style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: "4px 2px", display: "flex" }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, flex: 1, textAlign: "center", paddingRight: 28 }}>
          Contribution History
        </h3>
      </div>

      <div style={{ display: "flex", gap: 6, padding: "0 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", overflowX: "auto" }}>
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key} type="button" onClick={() => setTab(t.key)}
              style={{
                padding: "10px 12px", background: "none", border: "none", cursor: "pointer", whiteSpace: "nowrap",
                fontSize: 13, fontWeight: active ? 700 : 500,
                color: active ? "#fff" : "rgba(255,255,255,0.6)",
                borderBottom: `2px solid ${active ? "#ff8a1f" : "transparent"}`,
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", overscrollBehavior: "contain", padding: "14px 14px 40px" }}>
        {(loading || reactionsLoading) && visible.length === 0 ? (
          <p style={{ textAlign: "center", padding: "24px 0", color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Loading...</p>
        ) : visible.length === 0 ? (
          <p style={{ textAlign: "center", padding: "24px 0", color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
            Nothing here yet.
          </p>
        ) : (
          <div style={{ background: "rgba(18,18,26,0.7)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16 }}>
            {visible.map((it, idx) => (
              <div
                key={it.id}
                style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                  borderTop: idx === 0 ? "none" : "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <div
                  style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0, display: "flex",
                    alignItems: "center", justifyContent: "center", fontSize: 18, background: KIND_STYLE[it.kind].bg,
                  }}
                >
                  {KIND_STYLE[it.kind].icon}
                </div>
                {it.thumb && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.thumb} alt="" width={48} height={48} style={{ borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                    {it.title}
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 4, fontSize: 12 }}>
                    {it.points > 0 && <span style={{ color: "#22d3ee", fontWeight: 700 }}>+{it.points} pts</span>}
                    <span style={{ color: "rgba(255,255,255,0.45)" }}>{timeAgo(it.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
