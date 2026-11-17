"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Target, MessageSquare, Swords, Flame, Share2, History, HelpCircle, Trophy } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { handleGoBack } from "@/utils/backButton";
import { getMomentEngagements, type MomentEngagement } from "@/src/components/NewROARComponent/components/momentEngagements";
import { buildMatchStats, badgesForMatch, latestMatchId, type Category } from "@/src/components/NewROARComponent/components/matchScorecard";

interface Row { name: string; sxp: number; avatar?: string; isMe?: boolean }

const TAB_STYLE: Record<string, { Icon: typeof Target; color: string; bg: string; border: string }> = {
  know: { Icon: HelpCircle, color: "#facc15", bg: "linear-gradient(135deg, rgba(250,204,21,0.18), rgba(18,18,26,0.85))", border: "rgba(250,204,21,0.35)" },
  pred: { Icon: Target, color: "#22c55e", bg: "linear-gradient(135deg, rgba(34,197,94,0.18), rgba(18,18,26,0.85))", border: "rgba(34,197,94,0.35)" },
  inter: { Icon: MessageSquare, color: "#38bdf8", bg: "linear-gradient(135deg, rgba(56,189,248,0.14), rgba(18,18,26,0.85))", border: "rgba(56,189,248,0.3)" },
  deb: { Icon: Swords, color: "#c084fc", bg: "linear-gradient(135deg, rgba(168,85,247,0.22), rgba(18,18,26,0.85))", border: "rgba(168,85,247,0.4)" },
  react: { Icon: Flame, color: "#ec4899", bg: "linear-gradient(135deg, rgba(236,72,153,0.16), rgba(18,18,26,0.85))", border: "rgba(236,72,153,0.32)" },
};

const IMPACT_ROWS = [
  { key: "knowledge", label: "Knowledge", color: "#facc15" },
  { key: "prediction", label: "Prediction", color: "#22c55e" },
  { key: "participation", label: "Participation", color: "#38bdf8" },
  { key: "community", label: "Community", color: "#a855f7" },
  { key: "insight", label: "Insights", color: "#ec4899" },
];

const BAR: Record<Category, { label: string; color: string }> = {
  predictions: { label: "Predictions", color: "#22c55e" },
  debates: { label: "Debates & Takes", color: "#a855f7" },
  community: { label: "Community Contributions", color: "#38bdf8" },
  athlete: { label: "Athlete Support", color: "#ec4899" },
};

/** userHandle holds the display name when set; userName is often an id like "first_last_sportsfan360_com". */
function displayName(x: any): string {
  const handle = String(x?.userHandle || "").trim();
  if (handle) return handle;
  const raw = String(x?.userName || x?.userId || "").replace(/^USER#/, "").replace(/_sportsfan360_com$/i, "");
  const pretty = raw.replace(/[_.]+/g, " ").trim().replace(/\b\w/g, (c) => c.toUpperCase());
  return pretty || "Fan";
}

const card: React.CSSProperties = {
  background: "rgba(18,18,26,0.8)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 14,
};

export default function FanScorecardPage() {
  const router = useRouter();
  const params = useParams();
  const rawId = decodeURIComponent(String(params?.id ?? ""));
  const { user } = useAuth();
  const userId = user?.actualUserId || user?.userId || user?.email || "";
  const [profileUser, setProfileUser] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const myName = profileUser?.username || profileUser?.displayName || (user as any)?.username || (user as any)?.displayName || user?.email?.split("@")[0] || "You";
  const myAvatar = profileUser?.avatarUrl || profileUser?.avatar || (user as any)?.avatarUrl || (user as any)?.avatar || null;

  const [activities, setActivities] = useState<any[] | null>(null);
  const [engagements, setEngagements] = useState<MomentEngagement[] | null>(null);
  const [match, setMatch] = useState<any>(null);
  const [matchesList, setMatchesList] = useState<any[]>([]);
  const [showAllBoard, setShowAllBoard] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [kpis, setKpis] = useState<any>(null);
  const [board, setBoard] = useState<Row[]>([]);
  const [rankInfo, setRankInfo] = useState<{ rank: number | null; total: number | null }>({ rank: null, total: null });
  const [resolvedId, setResolvedId] = useState<string | null>(null);
  const matchId = rawId === "latest" ? (resolvedId ?? "") : rawId;
  useEffect(() => {
    if (rawId !== "latest") return;
    let id: string | null = null;
    if (activities && engagements) {
      id = latestMatchId(buildMatchStats(activities, engagements));
    }
    if (!id && matchesList.length > 0) {
      id = String(matchesList[0]?.match_id ?? matchesList[0]?.id ?? "");
    }
    if (id) {
      setResolvedId(id);
      router.replace(`/MainModules/FanScorecard/${encodeURIComponent(id)}`);
    }
  }, [rawId, activities, engagements, matchesList, router]);

  useEffect(() => {
    if (matchesList.length > 0 && matchId) {
      setMatch(matchesList.find((m) => String(m?.match_id ?? m?.id) === matchId) || null);
    }
  }, [matchesList, matchId]);

  useEffect(() => {
    if (!userId) return;
    let off = false;
    // Same source the Profile page uses for the username and profile image.
    const profileId = user?.actualUserId || user?.userId?.replace(/[@.]/g, "_") || user?.email?.replace(/[@.]/g, "_") || userId;
    axios.get(`/api/roar/profile?userId=${encodeURIComponent(profileId)}`, { withCredentials: true })
      .then((r) => { if (!off && r.data?.success) setProfileUser(r.data.user); })
      .catch(() => {})
      .finally(() => { if (!off) setProfileLoading(false); });
    axios.get(`/api/user-activity?userId=${encodeURIComponent(userId)}&limit=200`)
      .then((r) => { if (!off) setActivities(r.data?.activities || []); })
      .catch(() => { if (!off) setActivities([]); });
    getMomentEngagements().then((l) => { if (!off) setEngagements(l); }).catch(() => { if (!off) setEngagements([]); });
    axios.get("/api/matches").then((r) => {
      const d = r.data;
      const rows: any[] = d?.data || d?.matches || (Array.isArray(d) ? d : []);
      if (!off) {
        setMatchesList(rows);
        setMatch(rows.find((m) => String(m?.match_id ?? m?.id) === matchId) || null);
      }
    }).catch(() => {});
    // GET /api/user-points?matchId= returns { totalUsers, userRank, userMatchPoints, leaderboard[{ userId, userName, userHandle, avatarUrl, matchPoints, rank }] }.
    // The backend rejects an empty matchId (400), so wait until "latest" has been resolved.
    if (matchId) {
      axios.get("/api/user/match-kpis", { params: { matchId, userId: profileId, recompute: "true" } })
        .then((r) => { if (!off && r.data?.success) setKpis(r.data); })
        .catch(() => {});
      const norm = (v: unknown) => String(v ?? "").replace(/^USER#/, "").toLowerCase();
      const mine = new Set([user?.actualUserId, user?.userId, user?.email, user?.email?.replace(/[@.]/g, "_"), profileId].filter(Boolean).map(norm));
      axios.get("/api/user-points", { params: { limit: 100, matchId, userId: profileId || userId } }).then((r) => {
        const apiRank = Number(r.data?.userRank) || null;
        const total = Number(r.data?.totalUsers) || null;
        if (!off) setRankInfo({ rank: apiRank, total });
        const rows: any[] = r.data?.leaderboard || [];
        const mapped: Row[] = rows
          .filter((x) => x?.matchPoints != null)
          .map((x) => ({
            name: displayName(x),
            sxp: Number(x.matchPoints) || 0,
            avatar: x.avatarUrl || undefined,
            isMe: mine.has(norm(x.userId)),
          }));
        if (!off) setBoard(mapped);
      }).catch(() => {});
    }
    return () => { off = true; };
  }, [userId, matchId]);

  const stats = useMemo(() => {
    if (!activities || !engagements) return null;
    const all = buildMatchStats(activities, engagements);
    // No activity in this match: show the full scorecard with zeros instead of an empty message.
    return all.get(matchId) ?? {
      matchId, interactions: 0, predictionsTotal: 0, predictionsCorrect: 0, debates: 0, reactions: 0, sxp: 0, last: 0,
      sxpByCategory: { predictions: 0, debates: 0, community: 0, athlete: 0 },
    };
  }, [activities, engagements, matchId]);

  const title = match?.team1 && match?.team2
    ? `${match.team1} vs ${match.team2}`
    : (() => {
        const e: any = engagements?.find((x: any) => String(x.matchId) === matchId);
        return e?.followData?.team1Name ? `${e.followData.team1Name} vs ${e.followData.team2Name}` : "Match";
      })();
  const sub = [match?.tournament, match?.format, match?.venue].filter(Boolean).join(" · ");

  if (!stats) {
    return (
      <Shell onBack={() => handleGoBack(router, "/MainModules/Profile")} title={title} sub={sub}>
        <div style={{ textAlign: "center", padding: 40 }}>
          <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-[#e91e8c] animate-spin" style={{ margin: "0 auto" }} />
        </div>
      </Shell>
    );
  }

  const accuracy = stats.predictionsTotal ? Math.round((stats.predictionsCorrect / stats.predictionsTotal) * 100) : 0;
  const overallKpi = Number(kpis?.overallScore);
  const fanScore: number | null = Number.isFinite(overallKpi)
    ? Math.round(overallKpi)
    : kpis?.kpis
    ? Math.round(
        IMPACT_ROWS.reduce((sum, r) => sum + (Number(kpis.kpis[r.key]?.score) || 0), 0) / IMPACT_ROWS.length
      )
    : null;
  const overall = fanScore ?? Number(kpis?.overallScore);
  const impact = Number.isFinite(overall) ? (overall >= 70 ? "High" : overall >= 40 ? "Medium" : "Low") : (stats.sxp >= 50 ? "High" : stats.sxp >= 20 ? "Medium" : "Low");
  const badges = (() => {
    const list = [...badgesForMatch(stats)];
    const existingIds = new Set(list.map((b) => b.id));

    const triviaCorrect = Number(kpis?.kpis?.knowledge?.correct || 0);
    const triviaAttempted = Number(kpis?.kpis?.knowledge?.attempted || 0);
    if (!existingIds.has("trivia_scholar") && (triviaCorrect >= 2 || (triviaAttempted >= 2 && triviaCorrect / triviaAttempted >= 0.5))) {
      list.push({ id: "trivia_scholar", label: "Cricket Scholar", color: "#facc15", icon: "🧠" });
    }

    const predCorrect = Number(kpis?.kpis?.prediction?.correct || 0);
    if (!existingIds.has("sharp") && predCorrect >= 2) {
      list.push({ id: "sharp", label: "Sharp Predictor", color: "#22c55e", icon: "🎯" });
    }

    const debatesVoted = Number(kpis?.kpis?.community?.debatesVoted || 0);
    if (!existingIds.has("debate") && debatesVoted >= 2) {
      list.push({ id: "debate", label: "Debate Star", color: "#a855f7", icon: "💬" });
    }

    if (!existingIds.has("fan_champ") && Number(kpis?.overallScore) >= 75) {
      list.push({ id: "fan_champ", label: "Super Fan", color: "#ff6b35", icon: "⭐" });
    }

    return list;
  })();

  const leaderboard: Row[] = (() => {
    const rows = board.map((r) => (r.isMe ? { ...r, name: myName, avatar: myAvatar || r.avatar } : r));
    if (!rows.some((r) => r.isMe) && (stats.sxp > 0 || rows.length === 0)) rows.push({ name: myName, sxp: stats.sxp, avatar: myAvatar, isMe: true });
    return rows.sort((a, b) => b.sxp - a.sxp);
  })();
  const myLeaderboardIdx = leaderboard.findIndex((r) => r.isMe);
  // Match Rank uses the exact same rank as the leaderboard below
  const myRank = (myLeaderboardIdx >= 0 ? myLeaderboardIdx + 1 : null) ?? rankInfo.rank ?? null;
  const totalFans = Math.max(rankInfo.total || 0, leaderboard.length, myRank || 0);
  const fmtFans = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K` : String(n));

  const shareText = `My Fan Score${fanScore != null ? ` is ${fanScore}` : ""} for ${title}${myRank != null ? ` – Ranked #${myRank} of ${fmtFans(totalFans)} fans` : ""} on SportsFan360!`;
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const nativeShare = async () => {
    try {
      if (navigator.share) { await navigator.share({ title: "My Match Scorecard", text: shareText, url: shareUrl }); return; }
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* user cancelled */ }
  };
  const openShare = (url: string) => window.open(url, "_blank", "noopener,noreferrer");
  const enc = encodeURIComponent(`${shareText} ${shareUrl}`);

  return (
    <Shell onBack={() => handleGoBack(router, "/MainModules/Profile")} title={title} sub={sub}>
      {/* Multi-Match Switcher */}
      {matchesList.length > 1 && (
        <div style={{ ...card, padding: "10px 12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: 0.5 }}>
              Select Match Scorecard
            </span>
            <span style={{ fontSize: 11, color: "#ec4899", fontWeight: 600 }}>
              {matchesList.length} matches
            </span>
          </div>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
            {matchesList.map((m) => {
              const mId = String(m?.match_id ?? m?.id ?? "");
              const isSelected = mId === matchId;
              const name = m?.team1 && m?.team2 ? `${m.team1} vs ${m.team2}` : (m?.title || m?.name || "Match");
              const isLive = String(m?.status || "").toLowerCase() === "live";

              return (
                <button
                  key={mId}
                  type="button"
                  onClick={() => router.push(`/MainModules/FanScorecard/${encodeURIComponent(mId)}`)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: isSelected ? 800 : 600,
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                    border: isSelected ? "1.5px solid #ff7a2f" : "1px solid rgba(255,255,255,0.15)",
                    background: isSelected
                      ? "linear-gradient(135deg, rgba(255,106,53,0.35), rgba(236,72,153,0.25))"
                      : "rgba(255,255,255,0.05)",
                    color: isSelected ? "#fff" : "rgba(255,255,255,0.75)",
                    boxShadow: isSelected ? "0 0 10px rgba(255,122,47,0.35)" : "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    flexShrink: 0,
                    transition: "all 0.2s ease",
                  }}
                >
                  {isLive && (
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block", boxShadow: "0 0 6px #22c55e" }} />
                  )}
                  <span>{name}</span>
                  {m?.format && <span style={{ fontSize: 10, opacity: 0.6 }}>· {m.format}</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Fan score */}
      <div style={{ ...card, padding: "14px 8px", border: "1.5px solid #ff7a2f", boxShadow: "0 0 16px rgba(255,90,60,0.4)", display: "grid", gridTemplateColumns: "minmax(0,1.1fr) minmax(0,1.1fr) minmax(0,0.9fr)", alignItems: "center", gap: 6 }}>
        <div style={{ textAlign: "center", minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>Your Fan Score</div>
          <div style={{ fontSize: "clamp(36px, 12vw, 60px)", fontWeight: 900, lineHeight: 1.05, background: "linear-gradient(90deg,#ff6b35,#ec4899)", WebkitBackgroundClip: "text", color: "transparent" }}>{fanScore ?? "–"}</div>
        </div>
        <div style={{ textAlign: "center", minWidth: 0, borderLeft: "1px solid rgba(255,255,255,0.12)", borderRight: "1px solid rgba(255,255,255,0.12)", padding: "0 4px" }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>Match Rank</div>
          {myRank != null ? (
            <>
              <div style={{ fontSize: 20, lineHeight: 1.1, marginTop: 2 }}>🏆</div>
              <div style={{ fontSize: "clamp(20px, 6vw, 26px)", fontWeight: 900, color: "#f5a623", whiteSpace: "nowrap" }}>#{myRank}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>of {fmtFans(totalFans)} fans</div>
            </>
          ) : (
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 8 }}>Not ranked yet</div>
          )}
        </div>
        <div style={{ textAlign: "center", minWidth: 0 }}>
          <Avatar src={myAvatar} name={myName} size={46} loading={profileLoading} />
          {profileLoading
            ? <div style={{ width: 50, height: 12, borderRadius: 6, background: "rgba(255,255,255,0.12)", margin: "8px auto 0" }} />
            : <div style={{ fontSize: 12, fontWeight: 700, marginTop: 4, wordBreak: "break-word", lineHeight: 1.2 }}>{myName}</div>}
        </div>
      </div>

      {/* Top stat tabs: from the match-kpis API (falls back to local activity counts until it loads) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: 6 }}>
        {[
          {
            v: kpis?.kpis?.knowledge
              ? `${kpis.kpis.knowledge.correct ?? 0}/${kpis.kpis.knowledge.attempted ?? 0}`
              : "0/0",
            l: "Trivia", ic: "know",
          },
          {
            v: (() => {
              const pCorrect = kpis?.kpis?.prediction?.correct ?? kpis?.kpis?.prediction?.won ?? stats.predictionsCorrect ?? 0;
              const pTotal = kpis?.kpis?.prediction?.attempted ?? kpis?.kpis?.prediction?.resolved ?? stats.predictionsTotal ?? 0;
              return `${pCorrect}/${pTotal}`;
            })(),
            l: "Prediction", ic: "pred",
          },
          {
            v: kpis?.kpis?.participation?.cardsEngaged != null && kpis.kpis.participation.cardsEngaged > 0
              ? String(kpis.kpis.participation.cardsEngaged)
              : String(stats.interactions),
            l: "Interact", ic: "inter",
          },
          {
            v: kpis?.kpis?.community
              ? String((kpis.kpis.community.debatesVoted ?? 0) + (kpis.kpis.community.pollsVoted ?? 0))
              : String(stats.debates),
            l: "Debates", ic: "deb",
          },
          {
            v: kpis?.kpis?.insight?.recognitionsCount != null
              ? String(kpis.kpis.insight.recognitionsCount)
              : String(kpis?.recognitionsCount ?? stats.reactions),
            l: "Recognised", ic: "react",
          },
        ].map((t) => {
          const sty = TAB_STYLE[t.ic] || TAB_STYLE.inter;
          const Icon = sty.Icon;
          return (
            <div key={t.l} style={{ ...card, padding: "8px 2px", minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: sty.bg, border: `1px solid ${sty.border}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
                <Icon size={16} color={sty.color} strokeWidth={2.2} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 15, fontWeight: 800, lineHeight: 1 }}>{t.v}</span>
              </div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.7)", lineHeight: 1.1, textAlign: "center", wordBreak: "break-word" }}>{t.l}</div>
            </div>
          );
        })}
      </div>

      {/* Impact */}
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontWeight: 800 }}>Your Match Impact</span>
          <span style={{ fontSize: 12 }}>Overall Impact: <b style={{ background: "#16a34a", borderRadius: 8, padding: "2px 8px" }}>{impact}</b></span>
        </div>
        {IMPACT_ROWS.map((row) => {
          const k = kpis?.kpis?.[row.key];
          const pct = Math.max(0, Math.min(100, Math.round(Number(k?.score) || 0)));
          return (
            <div key={row.key} style={{ margin: "8px 0", fontSize: 13 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 110 }}>{row.label}</span>
                <div style={{ flex: 1, height: 8, background: "rgba(255,255,255,0.12)", borderRadius: 6, overflow: "hidden" }}>
                  <div style={{ width: kpis ? `${pct}%` : 0, height: "100%", background: row.color, transition: "width .6s ease" }} />
                </div>
                <span style={{ width: 36, textAlign: "right" }}>{kpis ? `${pct}%` : "–"}</span>
              </div>
              {k?.metric && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginLeft: 120 }}>{k.metric}</div>}
            </div>
          );
        })}
      </div>

      {/* Badges */}
      <div style={card}>
        <div style={{ fontWeight: 800, marginBottom: 10 }}>Badges Earned in this Match</div>
        {badges.length === 0 ? (
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>No badges earned in this match yet.</div>
        ) : (
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            {badges.map((b) => (
              <div key={b.id} style={{ textAlign: "center", width: 90 }}>
                <div style={{ width: 70, height: 78, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, border: `2px solid ${b.color}`, boxShadow: `0 0 14px ${b.color}`, clipPath: "polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)", background: "rgba(0,0,0,0.4)" }}>{b.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, marginTop: 6 }}>{b.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Leaderboard by match SXP: top 3, "View All" expands to a list */}
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ fontWeight: 800, minWidth: 0 }}>Match Leaderboard{showAllBoard ? "" : " (Top 3)"}</span>
          {leaderboard.length > 3 && (
            <button type="button" onClick={() => setShowAllBoard((v) => !v)}
              style={{ background: "none", border: "none", color: "#a78bfa", fontSize: 13, fontWeight: 600, cursor: "pointer", padding: 0, whiteSpace: "nowrap", flexShrink: 0 }}>
              {showAllBoard ? "Show less" : "View All ›"}
            </button>
          )}
        </div>
        {showAllBoard ? (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {leaderboard.map((r, i) => (
              <div key={`${r.name}-${i}`} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderTop: i ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
                <span style={{ width: 24, textAlign: "center", fontWeight: 800, color: r.isMe ? "#f5a623" : "rgba(255,255,255,0.7)" }}>{i + 1}</span>
                <div style={{ width: 36 }}><Avatar src={r.avatar} name={r.name} size={36} ring={r.isMe ? "#f5a623" : undefined} loading={!!r.isMe && profileLoading} /></div>
                <span style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: r.isMe ? "#f5a623" : "#fff" }}>{r.name}{r.isMe ? " (You)" : ""}</span>
                <span style={{ fontWeight: 800, color: r.isMe ? "#f5a623" : "#fff" }}>{r.sxp} <span style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.55)" }}>SXP</span></span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            {leaderboard.slice(0, 3).map((r, i) => (
              <div key={`${r.name}-${i}`} style={{ textAlign: "center", minWidth: 0, flex: 1 }}>
                <Avatar src={r.avatar} name={r.name} size={50} ring={r.isMe ? "#f5a623" : undefined} loading={!!r.isMe && profileLoading} />
                <div style={{ fontSize: 12, fontWeight: 600, marginTop: 4, color: r.isMe ? "#f5a623" : "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", padding: "0 4px" }}>{i + 1}. {r.name}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: r.isMe ? "#f5a623" : "#fff" }}>{r.sxp}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Share / history buttons */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 10 }}>
        <button type="button" onClick={() => setShareOpen(true)}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "12px 6px", borderRadius: 14, border: "none", cursor: "pointer", color: "#fff", fontWeight: 700, fontSize: 13, lineHeight: 1.2, textAlign: "center", minWidth: 0, background: "linear-gradient(90deg,#ff6b35,#c026d3,#7c3aed)" }}>
          <Share2 size={16} style={{ flexShrink: 0 }} /> Share Scorecard
        </button>
        <button type="button" onClick={() => router.push("/MainModules/ROAR")}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "12px 6px", borderRadius: 14, cursor: "pointer", color: "#fff", fontWeight: 700, fontSize: 13, lineHeight: 1.2, textAlign: "center", minWidth: 0, background: "rgba(30,10,50,0.9)", border: "1.5px solid #c026d3" }}>
          <History size={16} style={{ flexShrink: 0 }} /> View Full Match History
        </button>
      </div>

      {shareOpen && (
        <div onClick={() => setShareOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}
            style={{ position: "relative", width: "100%", maxWidth: 360, maxHeight: "90vh", overflowY: "auto", borderRadius: 24, padding: 16, background: "linear-gradient(160deg,#1a0b33,#0b0716)", border: "1.5px solid #c026d3", boxShadow: "0 0 24px rgba(192,38,211,0.5)" }}>
            <button type="button" onClick={() => setShareOpen(false)} aria-label="Close"
              style={{ position: "absolute", top: 8, right: 12, background: "none", border: "none", color: "#fff", fontSize: 22, cursor: "pointer" }}>×</button>
            <div style={{ textAlign: "center", fontSize: 12, fontWeight: 800, letterSpacing: 1, color: "#ff6b35" }}>SPORTSFAN 360</div>
            <div style={{ textAlign: "center", fontSize: 20, fontWeight: 800, marginTop: 2 }}>My Match Scorecard</div>
            <div style={{ textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.8)", margin: "8px 0 12px" }}>
              {title}{match?.format ? ` · ${match.format}` : ""}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.1fr) minmax(0,1fr)", gap: 8 }}>
              <div style={{ ...card, textAlign: "center", padding: 10 }}>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>Fan Score</div>
                <div style={{ fontSize: 40, fontWeight: 900, lineHeight: 1.1 }}>{fanScore ?? "–"}</div>
              </div>
              <div style={{ ...card, textAlign: "center", padding: 10, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                {myRank != null ? (
                  <>
                    <div style={{ fontSize: 24, fontWeight: 900, color: "#f5a623" }}>#{myRank}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>of {fmtFans(totalFans)} fans</div>
                  </>
                ) : <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>Not ranked yet</div>}
              </div>
            </div>
            {badges.length > 0 && (
              <div style={{ display: "flex", justifyContent: "space-around", margin: "14px 0 4px" }}>
                {badges.map((b) => (
                  <div key={b.id} style={{ textAlign: "center", minWidth: 0 }}>
                    <div style={{ width: 52, height: 58, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, border: `2px solid ${b.color}`, boxShadow: `0 0 10px ${b.color}`, clipPath: "polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)", background: "rgba(0,0,0,0.4)" }}>{b.icon}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, marginTop: 4 }}>{b.label}</div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "14px 0", padding: "10px 12px", borderRadius: 14, border: "1.5px solid #c026d3", background: "rgba(0,0,0,0.3)" }}>
              <span style={{ fontWeight: 700, fontSize: 14, flex: 1 }}>Share on</span>
              <button type="button" aria-label="Share on WhatsApp" onClick={() => openShare(`https://wa.me/?text=${enc}`)}
                style={{ width: 36, height: 36, borderRadius: 10, border: "none", cursor: "pointer", background: "#25d366", color: "#fff", fontWeight: 800 }}>W</button>
              <button type="button" aria-label="Share on Instagram" onClick={nativeShare}
                style={{ width: 36, height: 36, borderRadius: 10, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#f58529,#dd2a7b,#8134af)", color: "#fff", fontWeight: 800 }}>IG</button>
              <button type="button" aria-label="Share on X" onClick={() => openShare(`https://twitter.com/intent/tweet?text=${enc}`)}
                style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid rgba(255,255,255,0.3)", cursor: "pointer", background: "#000", color: "#fff", fontWeight: 800 }}>X</button>
              <button type="button" aria-label="More" onClick={nativeShare}
                style={{ width: 28, background: "none", border: "none", color: "#fff", fontSize: 20, cursor: "pointer" }}>⋯</button>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}

function Avatar({ src, name, size, ring, loading }: { src?: string | null; name: string; size: number; ring?: string; loading?: boolean }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const showImg = !!src && !failed;
  // Neutral placeholder while the profile (or the image itself) is still loading; initial only when there is no image.
  const placeholder = loading || (showImg && !imgLoaded);
  return (
    <div style={{ position: "relative", width: size, height: size, borderRadius: "50%", overflow: "hidden", margin: "0 auto", border: `2px solid ${ring || "rgba(255,255,255,0.3)"}`, background: placeholder ? "rgba(255,255,255,0.12)" : "linear-gradient(135deg,#9333ea,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>
      {loading ? null : showImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src!} alt="" onLoad={() => setImgLoaded(true)} onError={() => setFailed(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover", opacity: imgLoaded ? 1 : 0 }} />
      ) : name.charAt(0).toUpperCase()}
    </div>
  );
}

function Shell({ children, onBack, title, sub }: { children: React.ReactNode; onBack: () => void; title: string; sub: string }) {
  return (
    <div style={{ minHeight: "100%", background: "#070b14", color: "#fff", padding: "14px 14px calc(var(--roar-bottom-nav-height, 72px) + 32px + env(safe-area-inset-bottom))" }}>
      <div style={{ maxWidth: 520, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button type="button" onClick={onBack} aria-label="Back" style={{ background: "none", border: "none", color: "#fff", fontSize: 24, cursor: "pointer" }}>‹</button>
          <div style={{ flex: 1, textAlign: "center", marginRight: 24 }}>
            <div style={{ fontSize: 20, fontWeight: 800 }}>My Fan Scorecard</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>Match Summary</div>
          </div>
        </div>
        {/* <div style={{ ...card, textAlign: "center" }}>
          <div style={{ fontSize: 17, fontWeight: 800 }}>{title}</div>
          {sub && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>{sub}</div>}
        </div> */}
        {children}
      </div>
    </div>
  );
}
