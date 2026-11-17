"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { ChevronDown, Crown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { handleGoBack } from "@/utils/backButton";

type Tab = "match" | "series" | "app";
interface Row { uid: string; rank: number; name: string; points: number; avatar?: string; isMe: boolean }

const CROWN = ["#f5a623", "#cbd5e1", "#f97316"];

/** userHandle holds the display name when set; userName is often an id like "first_last_sportsfan360_com". */
function displayName(x: any): string {
  const handle = String(x?.userHandle || "").trim();
  if (handle) return handle;
  const raw = String(x?.userName || x?.userId || "").replace(/^USER#/, "").replace(/_sportsfan360_com$/i, "");
  return raw.replace(/[_.]+/g, " ").trim().replace(/\b\w/g, (c) => c.toUpperCase()) || "Fan";
}

function avatarOf(x: any): string | undefined {
  const v = x?.avatarUrl || x?.avatar || x?.userAvatar || x?.userAvatarUrl || x?.profileImage || x?.profileImageUrl || x?.profilePicture || x?.photoURL || x?.picture || x?.image || x?.user?.avatarUrl || x?.user?.avatar;
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

/** Shows the image; falls back to the initial if there is no URL or it fails to load. */
function AvatarImg({ src, name }: { src?: string; name: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (!src || failed) return <>{name.charAt(0).toUpperCase()}</>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" onError={() => setFailed(true)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />;
}

const Spinner = ({ size = 8 }: { size?: number }) => (
  <div style={{ textAlign: "center", padding: size === 8 ? 40 : 20 }}>
    <div className="rounded-full border-2 border-white/20 border-t-[#e91e8c] animate-spin" style={{ margin: "0 auto", width: size * 4, height: size * 4 }} />
  </div>
);

/** One match in the Series tab: tap to expand/collapse its leaderboard (loaded on first open). */
function SeriesMatch({ m, defaultOpen, load, renderRow }: {
  m: any; defaultOpen: boolean; load: (id: string) => Promise<Row[]>; renderRow: (r: Row) => React.ReactNode;
}) {
  const id = String(m.match_id ?? m.id);
  const [open, setOpen] = useState(defaultOpen);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    if (!open || rows) return;
    let off = false;
    setErr(false);
    load(id).then((r) => { if (!off) setRows(r); }).catch(() => { if (!off) { setErr(true); setRows([]); } });
    return () => { off = true; };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div style={{ borderRadius: 16, background: "rgba(18,18,26,0.8)", border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden" }}>
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: 12, background: "none", border: "none", color: "#fff", cursor: "pointer", textAlign: "left" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {m.team1} vs {m.team2}{m.format ? ` · ${m.format}` : ""}
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {[m.tournament, m.date ?? m.start_date].filter(Boolean).join(" · ")}
          </div>
        </div>
        <ChevronDown size={20} style={{ flexShrink: 0, transition: "transform .2s", transform: open ? "rotate(180deg)" : "none" }} />
      </button>
      {open && (
        <div style={{ padding: "0 8px 8px" }}>
          {rows === null ? <Spinner size={6} /> : rows.length === 0 ? (
            <div style={{ textAlign: "center", padding: 16, fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
              {err ? "Couldn't load this leaderboard." : "No leaderboard data yet."}
            </div>
          ) : rows.map(renderRow)}
        </div>
      )}
    </div>
  );
}

export default function FanLeaderboardPage() {
  const router = useRouter();
  const params = useParams();
  const matchId = decodeURIComponent(String(params?.id ?? ""));
  const { user } = useAuth();
  const userId = user?.actualUserId || user?.userId || user?.email || "";

  const [tab, setTab] = useState<Tab>("match");
  const [match, setMatch] = useState<any>(null);
  const [allMatches, setAllMatches] = useState<any[] | null>(null);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);
  // /api/users carries the profile images the overall leaderboard rows lack.
  const [avatarMap, setAvatarMap] = useState<Map<string, string>>(new Map());
  useEffect(() => {
    const clean = (v: unknown) => String(v ?? "").replace(/^USER#/, "").toLowerCase();
    axios.get("/api/users", { withCredentials: true }).then((r) => {
      const d = r.data;
      const list: any[] = d?.users || d?.data?.users || d?.data || d?.allUsers || (Array.isArray(d) ? d : []);
      const m = new Map<string, string>();
      for (const u of list) {
        const img = avatarOf(u);
        if (!img) continue;
        for (const k of [u.userId, u.actualUserId, u.id, u.email, u.userEmail, u.username]) {
          const c = clean(k);
          if (c) { m.set(c, img); m.set(c.replace(/[@.]/g, "_"), img); }
        }
      }
      setAvatarMap(m);
    }).catch(() => {});
  }, []);
  const [myAvatar, setMyAvatar] = useState<string | undefined>();
  useEffect(() => {
    if (!userId) return;
    const pid = user?.actualUserId || user?.userId?.replace(/[@.]/g, "_") || user?.email?.replace(/[@.]/g, "_") || userId;
    axios.get(`/api/roar/profile?userId=${encodeURIComponent(pid)}`, { withCredentials: true })
      .then((r) => { const u = r.data?.user; setMyAvatar(u?.avatarUrl || u?.avatar || undefined); })
      .catch(() => {});
  }, [userId, user]);

  useEffect(() => {
    axios.get("/api/matches").then((r) => {
      const d = r.data;
      const list: any[] = d?.data || d?.matches || (Array.isArray(d) ? d : []);
      setAllMatches(list);
      setMatch(list.find((m) => String(m?.match_id ?? m?.id) === matchId) || null);
    }).catch(() => setAllMatches([]));
  }, [matchId]);

  const norm = (v: unknown) => String(v ?? "").replace(/^USER#/, "").toLowerCase();
  const mapRows = (data: any, overall: boolean): Row[] => {
    const mine = new Set([user?.actualUserId, user?.userId, user?.email, user?.email?.replace(/[@.]/g, "_")].filter(Boolean).map(norm));
    const list: any[] = data?.leaderboard || data?.data?.leaderboard || data?.data || data?.entries || [];
    const pts = (x: any) => Number(overall ? (x.totalPoints ?? x.points ?? x.sxp ?? x.matchPoints) : (x.matchPoints ?? x.points)) || 0;
    return list
      .map((x) => ({ uid: norm(x.userId), name: displayName(x), points: pts(x), avatar: avatarOf(x), isMe: mine.has(norm(x.userId)), rank: 0 }))
      .sort((a, b) => b.points - a.points)
      .map((x, i) => ({ ...x, rank: i + 1 }));
  };
  const loadMatchBoard = (id: string) =>
    axios.get("/api/user-points", { params: { limit: 100, matchId: id, ...(userId ? { userId } : {}) } }).then((r) => mapRows(r.data, false));

  useEffect(() => {
    if (tab === "series") return; // the Series tab loads each match's board when it is expanded
    if (tab === "match" && !matchId) return;
    let off = false;
    setRows(null);
    setFailed(false);
    const q: Record<string, string | number> = { limit: 100 };
    if (userId) q.userId = userId;
    if (tab === "match") q.matchId = matchId;
    axios.get("/api/user-points", { params: q }).then((r) => {
      if (off) return;
      setRows(mapRows(r.data, tab === "app"));
      setTotal(Number(r.data?.totalUsers) || null);
    }).catch(() => { if (!off) { setRows([]); setFailed(true); } });
    return () => { off = true; };
  }, [tab, matchId, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const rowAvatar = (r: Row) => r.avatar || avatarMap.get(r.uid) || avatarMap.get(r.uid.replace(/[@.]/g, "_")) || (r.isMe ? myAvatar : undefined);

  const renderRow = (r: Row) => {
    const top = r.rank <= 3;
    return (
      <div key={`${r.rank}-${r.uid}`}
        style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", marginBottom: 6, borderRadius: 14,
          border: r.isMe ? "1.5px solid #c026d3" : "1px solid transparent",
          background: r.isMe ? "linear-gradient(90deg, rgba(192,38,211,0.3), rgba(124,58,237,0.2))" : "transparent",
          boxShadow: r.isMe ? "0 0 14px rgba(192,38,211,0.45)" : "none" }}>
        <div style={{ width: 28, display: "flex", justifyContent: "center", fontWeight: 800, color: "rgba(255,255,255,0.8)" }}>
          {top ? <Crown size={24} color={CROWN[r.rank - 1]} fill={CROWN[r.rank - 1]} /> : r.rank}
        </div>
        <div style={{ width: 44, height: 44, borderRadius: "50%", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, background: "linear-gradient(135deg,#9333ea,#4f46e5)", border: top ? `2px solid ${CROWN[r.rank - 1]}` : "2px solid rgba(255,255,255,0.2)" }}>
          <AvatarImg src={rowAvatar(r)} name={r.name} />
        </div>
        <span style={{ flex: 1, minWidth: 0, fontSize: 15, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}{r.isMe ? " (You)" : ""}</span>
        <span style={{ fontSize: 17, fontWeight: 800 }}>{r.points}</span>
      </div>
    );
  };

  const title = match?.team1 && match?.team2 ? `${match.team1} vs ${match.team2}` : "Match";
  const sub = tab === "match" ? `${title}${match?.format ? ` · ${match.format}` : ""}` : "SportsFan360";
  const heading = tab === "match" ? "Match Leaderboard" : "Overall Leaderboard";
  const fans = useMemo(() => (total ?? rows?.length ?? 0).toLocaleString(), [total, rows]);
  const sortedMatches = useMemo(
    () => [...(allMatches || [])].sort((a, b) => String(b.date ?? b.start_date ?? "").localeCompare(String(a.date ?? a.start_date ?? ""))),
    [allMatches]
  );

  return (
    <div style={{ minHeight: "100%", background: "#070b14", color: "#fff", padding: "14px 14px calc(var(--roar-bottom-nav-height, 72px) + 32px + env(safe-area-inset-bottom))" }}>
      <div style={{ maxWidth: 520, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button type="button" onClick={() => handleGoBack(router, `/MainModules/FanScorecard/${encodeURIComponent(matchId)}`)} aria-label="Back"
            style={{ background: "none", border: "none", color: "#fff", fontSize: 24, cursor: "pointer" }}>‹</button>
          <div style={{ flex: 1, textAlign: "center", marginRight: 24, fontSize: 20, fontWeight: 800 }}>Leaderboards</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", padding: 4, borderRadius: 999, border: "1px solid rgba(192,38,211,0.5)", background: "rgba(18,18,26,0.8)" }}>
          {([["match", "Match"], ["series", "Series"], ["app", "App"]] as [Tab, string][]).map(([k, l]) => (
            <button key={k} type="button" onClick={() => setTab(k)}
              style={{ padding: "9px 0", borderRadius: 999, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 14, color: "#fff", background: tab === k ? "linear-gradient(90deg,#c026d3,#7c3aed)" : "transparent" }}>{l}</button>
          ))}
        </div>

        {tab === "series" ? (
          allMatches === null ? <Spinner /> : sortedMatches.length === 0 ? (
            <div style={{ textAlign: "center", padding: 32, fontSize: 13, color: "rgba(255,255,255,0.6)" }}>No matches found.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {sortedMatches.map((m) => {
                const id = String(m.match_id ?? m.id);
                return <SeriesMatch key={id} m={m} defaultOpen={id === matchId} load={loadMatchBoard} renderRow={renderRow} />;
              })}
            </div>
          )
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, borderRadius: 16, background: "rgba(18,18,26,0.8)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sub}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>{heading} ({fans} fans)</div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {rows === null ? <Spinner /> : rows.length === 0 ? (
                <div style={{ textAlign: "center", padding: 32, fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                  {failed ? "Couldn't load the leaderboard. Please try again." : "No leaderboard data yet."}
                </div>
              ) : rows.map(renderRow)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
