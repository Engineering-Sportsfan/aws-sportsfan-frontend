"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { handleGoBack } from "@/utils/backButton";
import { getMomentEngagements, type MomentEngagement } from "@/src/components/NewROARComponent/components/momentEngagements";
import { buildMatchStats, badgesForMatch, latestMatchId, type Category } from "@/src/components/NewROARComponent/components/matchScorecard";

interface Row { name: string; sxp: number; avatar?: string; isMe?: boolean }

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
  const [board, setBoard] = useState<Row[]>([]);
  const [rankInfo, setRankInfo] = useState<{ rank: number | null; total: number | null }>({ rank: null, total: null });
  const [resolvedId, setResolvedId] = useState<string | null>(null);
  const matchId = rawId === "latest" ? (resolvedId ?? "") : rawId;
  useEffect(() => {
    if (rawId !== "latest" || !activities || !engagements) return;
    setResolvedId(latestMatchId(buildMatchStats(activities, engagements)) ?? "");
  }, [rawId, activities, engagements]);

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
      if (!off) setMatch(rows.find((m) => String(m?.match_id ?? m?.id) === matchId) || null);
    }).catch(() => {});
    // GET /api/user-points?matchId= returns { totalUsers, userRank, userMatchPoints, leaderboard[{ userId, userName, userHandle, avatarUrl, matchPoints, rank }] }.
    // The backend rejects an empty matchId (400), so wait until "latest" has been resolved.
    if (matchId) {
      const norm = (v: unknown) => String(v ?? "").replace(/^USER#/, "").toLowerCase();
      const mine = new Set([user?.actualUserId, user?.userId, user?.email, user?.email?.replace(/[@.]/g, "_")].filter(Boolean).map(norm));
      axios.get("/api/user-points", { params: { limit: 5, matchId, userId } }).then((r) => {
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
    return all.get(matchId) ?? null;
  }, [activities, engagements, matchId]);

  const title = match?.team1 && match?.team2
    ? `${match.team1} vs ${match.team2}`
    : (() => {
        const e: any = engagements?.find((x: any) => String(x.matchId) === matchId);
        return e?.followData?.team1Name ? `${e.followData.team1Name} vs ${e.followData.team2Name}` : "Match";
      })();
  const sub = [match?.tournament, match?.format, match?.venue].filter(Boolean).join(" · ");

  if (!stats && activities && engagements) {
    return (
      <Shell onBack={() => handleGoBack(router, "/MainModules/Profile")} title={title} sub={sub}>
        <div style={{ ...card, textAlign: "center", color: "rgba(255,255,255,0.7)" }}>
          You have no activity in this match yet.
        </div>
      </Shell>
    );
  }
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
  const fanScore = Math.min(100, Math.round(accuracy * 0.5 + Math.min(100, stats.interactions * 10) * 0.5));
  const impact = stats.sxp >= 50 ? "High" : stats.sxp >= 20 ? "Medium" : "Low";
  const badges = badgesForMatch(stats);

  const leaderboard: Row[] = (() => {
    const rows = board.map((r) => (r.isMe ? { ...r, name: myName, avatar: myAvatar || r.avatar } : r));
    if (!rows.some((r) => r.isMe)) rows.push({ name: myName, sxp: stats.sxp, avatar: myAvatar, isMe: true });
    return rows.sort((a, b) => b.sxp - a.sxp).slice(0, 5);
  })();
  const myRowIdx = board.findIndex((r) => r.isMe);
  // userRank is null when the user is outside the ranking; if they appear in the top rows use that position.
  const myRank = rankInfo.rank ?? (myRowIdx >= 0 ? myRowIdx + 1 : null);
  const topPct = myRank && rankInfo.total ? Math.max(1, Math.ceil((myRank / rankInfo.total) * 100)) : null;
  const fmtFans = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K` : String(n));

  return (
    <Shell onBack={() => handleGoBack(router, "/MainModules/Profile")} title={title} sub={sub}>
      {/* Fan score */}
      <div style={{ ...card, border: "1.5px solid #ff7a2f", boxShadow: "0 0 16px rgba(255,90,60,0.4)", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Your Fan Score</div>
          <div style={{ fontSize: 64, fontWeight: 900, lineHeight: 1, background: "linear-gradient(90deg,#ff6b35,#ec4899)", WebkitBackgroundClip: "text", color: "transparent" }}>{fanScore}</div>
        </div>
        <div style={{ flex: 1, textAlign: "center", borderLeft: "1px solid rgba(255,255,255,0.12)", borderRight: "1px solid rgba(255,255,255,0.12)", padding: "0 6px" }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>Match Rank</div>
          {topPct != null ? (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                <span style={{ fontSize: 22 }}>🏆</span>
                <span style={{ fontSize: 24, fontWeight: 900, color: "#f5a623" }}>Top {topPct}%</span>
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>of {fmtFans(rankInfo.total!)} fans</div>
            </>
          ) : (
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 8 }}>Not ranked yet</div>
          )}
        </div>
        <div style={{ flex: 1, textAlign: "center" }}>
          <Avatar src={myAvatar} name={myName} size={52} loading={profileLoading} />
          {profileLoading
            ? <div style={{ width: 60, height: 12, borderRadius: 6, background: "rgba(255,255,255,0.12)", margin: "8px auto 0" }} />
            : <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>{myName}</div>}
        </div>
      </div>

      {/* Top stat tabs (this match only) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
        {[
          { v: `${stats.predictionsCorrect}/${stats.predictionsTotal}`, l: "Predictions Correct" },
          { v: String(stats.interactions), l: "Interactions" },
          { v: String(stats.debates), l: "Debates" },
          { v: String(stats.reactions), l: "Recognised Reactions" },
        ].map((t) => (
          <div key={t.l} style={{ ...card, padding: "10px 4px", textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{t.v}</div>
            <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>{t.l}</div>
          </div>
        ))}
      </div>

      {/* Impact */}
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontWeight: 800 }}>Your Match Impact</span>
          <span style={{ fontSize: 12 }}>Overall Impact: <b style={{ background: "#16a34a", borderRadius: 8, padding: "2px 8px" }}>{impact}</b></span>
        </div>
        {(Object.keys(BAR) as Category[]).filter((k) => k !== "athlete").map((k) => {
          const pct = k === "predictions" && stats.predictionsTotal
            ? accuracy
            : stats.sxp ? Math.round((stats.sxpByCategory[k] / stats.sxp) * 100) : 0;
          return (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 10, margin: "8px 0", fontSize: 13 }}>
              <span style={{ width: 150 }}>{BAR[k].label}</span>
              <div style={{ flex: 1, height: 8, background: "rgba(255,255,255,0.12)", borderRadius: 6, overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: BAR[k].color }} />
              </div>
              <span style={{ width: 36, textAlign: "right" }}>{pct}%</span>
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

      {/* Leaderboard by match SXP */}
      <div style={card}>
        <div style={{ fontWeight: 800, marginBottom: 10 }}>Match Leaderboard (Top 5)</div>
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          {leaderboard.map((r, i) => (
            <div key={`${r.name}-${i}`} style={{ textAlign: "center", minWidth: 56 }}>
              <Avatar src={r.avatar} name={r.name} size={46} ring={r.isMe ? "#f5a623" : undefined} loading={!!r.isMe && profileLoading} />
              <div style={{ fontSize: 12, fontWeight: 600, marginTop: 4, color: r.isMe ? "#f5a623" : "#fff" }}>{i + 1}. {r.name}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: r.isMe ? "#f5a623" : "#fff" }}>{r.sxp}</div>
            </div>
          ))}
        </div>
      </div>
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
        <div style={{ ...card, textAlign: "center" }}>
          <div style={{ fontSize: 17, fontWeight: 800 }}>{title}</div>
          {sub && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>{sub}</div>}
        </div>
        {children}
      </div>
    </div>
  );
}
