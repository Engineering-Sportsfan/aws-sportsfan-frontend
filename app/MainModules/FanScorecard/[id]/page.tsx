"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Target, MessageSquare, Swords, Flame, Share2, History, HelpCircle, Trophy } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { handleGoBack } from "@/utils/backButton";
import { getSharedMatches } from "@/utils/sharedMatches";
import { getMomentEngagements, type MomentEngagement } from "@/src/components/NewROARComponent/components/momentEngagements";
import { buildMatchStats, latestMatchId, resolveSharedMatchId, type Category } from "@/src/components/NewROARComponent/components/matchScorecard";

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
  // The user's followed "League / IPL Teams" (Step 2 of onboarding), shown under the profile image.
  const [leagueTeams, setLeagueTeams] = useState<{ id: string; label: string; image?: string }[]>([]);
  useEffect(() => {
    let off = false;
    Promise.all([
      axios.get("/api/roar/onboarding-config", { params: { type: "followEntities" } }),
      axios.get("/api/roar/onboarding", { withCredentials: true }),
    ])
      .then(([cfg, ob]) => {
        if (off) return;
        const followed = new Set<string>((ob.data?.followEntities ?? []).map(String));
        const items: any[] = cfg.data?.items ?? [];
        setLeagueTeams(
          items
            .filter((i) => String(i.category || i.title || "").trim().toLowerCase() === "league / ipl teams" && followed.has(String(i.id)))
            .map((i) => ({ id: String(i.id), label: String(i.label ?? ""), image: i.image || undefined }))
        );
      })
      .catch(() => {});
    return () => { off = true; };
  }, []);
  const [profileLoading, setProfileLoading] = useState(true);
  const myName = profileUser?.username || profileUser?.displayName || (user as any)?.username || (user as any)?.displayName || user?.email?.split("@")[0] || "You";
  const myAvatar = profileUser?.avatarUrl || profileUser?.avatar || (user as any)?.avatarUrl || (user as any)?.avatar || null;
  const profileId = user?.actualUserId || user?.userId?.replace(/[@.]/g, "_") || user?.email?.replace(/[@.]/g, "_") || userId;

  const norm = (v: unknown) => String(v ?? "").replace(/^USER#/, "").toLowerCase().trim();
  const mine = useMemo(() => {
    return new Set(
      [
        user?.actualUserId,
        user?.userId,
        user?.email,
        user?.email?.replace(/[@.]/g, "_"),
        user?.username,
        profileId,
        myName,
      ]
        .filter(Boolean)
        .map(norm)
    );
  }, [user, profileId, myName]);

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
  const [followedMatches, setFollowedMatches] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(`followed_matches_${userId || "guest"}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {}
    }
    return [];
  });
  const matchId = rawId === "latest" ? (resolvedId ?? "") : rawId;
  // "latest" -> real id. Own latest match when activity has loaded; otherwise (no activity, slow or failed
  // requests) the most recent finished match from /api/matches, so the URL always ends up with a match id.
  const [fallbackId, setFallbackId] = useState<string | null>(null);
  const [waited, setWaited] = useState(false);
  const [sharedId, setSharedId] = useState<string | null>(null);
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
    // Fetch followed matches with instant localStorage fallback
    try {
      const cached = localStorage.getItem(`followed_matches_${userId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0 && !off) setFollowedMatches(parsed);
      }
    } catch {}
    axios.get("/api/user/followed-matches", { params: { userId } })
      .then((r) => {
        if (!off && r.data?.success && Array.isArray(r.data.followedMatches)) {
          setFollowedMatches(r.data.followedMatches);
          try { localStorage.setItem(`followed_matches_${userId}`, JSON.stringify(r.data.followedMatches)); } catch {}
        }
      })
      .catch(() => {});

    axios.get(`/api/user-activity?userId=${encodeURIComponent(userId)}&limit=200`)
      .then((r) => { if (!off) setActivities(r.data?.activities || []); })
      .catch(() => { if (!off) setActivities([]); });
    getMomentEngagements().then((l) => { if (!off) setEngagements(l); }).catch(() => { if (!off) setEngagements([]); });
    getSharedMatches().then((rows) => {
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
      matchId, interactions: 0, predictionsTotal: 0, predictionsCorrect: 0, debates: 0, reactions: 0,
      triviaTotal: 0, triviaCorrect: 0, sxp: 0, last: 0,
      sxpByCategory: { predictions: 0, debates: 0, community: 0, athlete: 0 },
    };
  }, [activities, engagements, matchId]);

  const localMatchSxp = Number(stats?.sxp ?? 0);
  const kpiMatchSxp = kpis?.totalMatchSxp != null ? Number(kpis.totalMatchSxp) : null;
  const matchSxp = kpiMatchSxp != null ? Math.max(kpiMatchSxp, localMatchSxp) : localMatchSxp;

  const leaderboard: Row[] = useMemo(() => {
    // Deduplicate by canonical user key to guarantee one single consistent row per user
    const userMap = new Map<string, Row>();

    for (const r of board) {
      const isMe = Boolean(r.isMe || mine.has(norm(r.name)) || (myName && norm(r.name) === norm(myName)));
      const key = isMe ? "__me__" : norm(r.name);
      const existing = userMap.get(key);

      if (!existing) {
        userMap.set(key, {
          name: isMe ? myName : r.name,
          sxp: r.sxp,
          avatar: isMe ? (myAvatar || r.avatar) : r.avatar,
          isMe,
        });
      } else {
        // One point of consistency: keep highest match SXP
        if (r.sxp > existing.sxp) {
          existing.sxp = r.sxp;
        }
        if (isMe) {
          existing.isMe = true;
          existing.name = myName;
          if (myAvatar) existing.avatar = myAvatar;
        }
      }
    }

    // Ensure current user is in the leaderboard with consistent points
    const meRow = userMap.get("__me__");
    if (!meRow) {
      if (matchSxp > 0 || userMap.size === 0) {
        userMap.set("__me__", { name: myName, sxp: matchSxp, avatar: myAvatar, isMe: true });
      }
    } else {
      if (matchSxp > meRow.sxp) {
        meRow.sxp = matchSxp;
      }
    }

    return Array.from(userMap.values()).sort((a, b) => b.sxp - a.sxp);
  }, [board, mine, myName, myAvatar, matchSxp]);

  const eventTabs = useMemo(() => {
    const tabs: { id: string; label: string; sublabel?: string; isLive?: boolean }[] = [
      { id: "AUCTION", label: "AUCTION JOURNEY - 9–23 DEC" },
    ];
    const seen = new Set<string>(["AUCTION"]);
    followedMatches.forEach((fm) => {
      const mid = String(fm.matchId || "").replace(/^MATCH#/i, "").trim();
      if (mid && !seen.has(mid)) {
        seen.add(mid);
        tabs.push({
          id: mid,
          label: fm.matchTitle || (fm.teamA && fm.teamB ? `${fm.teamA} vs ${fm.teamB}` : `Match ${mid}`),
          sublabel: fm.date || "10 DEC",
          isLive: fm.status === "live",
        });
      }
    });
    return tabs;
  }, [followedMatches]);

  const title = match?.team1 && match?.team2
    ? `${match.team1} vs ${match.team2}`
    : (() => {
        const e: any = engagements?.find((x: any) => String(x.matchId) === matchId);
        return e?.followData?.team1Name ? `${e.followData.team1Name} vs ${e.followData.team2Name}` : "Match";
      })();
  const sub = [match?.tournament, match?.format, match?.venue].filter(Boolean).join(" · ");

  // ── Match summary card (below the "Match Summary" heading) ──
  const matchDate = match?.date || match?.start_date;
  const prettyDate = matchDate
    ? new Date(`${String(matchDate).slice(0, 10)}T00:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })
    : "";
  const winner = String(match?.winner ?? "").trim();
  const hasWinner = !!winner && winner.toUpperCase() !== "TBD";
  const statusText = String(match?.status ?? "").trim();
  const resultText = hasWinner ? `${winner.toUpperCase()} WON` : statusText ? statusText.toUpperCase() : "";
  const summaryCard = match ? (
    <div style={{ ...card, padding: "12px 10px", border: "1.5px solid #ff7a2f", boxShadow: "0 0 14px rgba(255,90,60,0.35)", background: "linear-gradient(135deg, rgba(255,90,60,0.18), rgba(18,18,26,0.9) 45%, rgba(124,58,237,0.2))" }}>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,2fr) minmax(0,1fr)", alignItems: "center", gap: 6 }}>
        <div style={{ fontSize: 18, fontWeight: 900, textAlign: "center", minWidth: 0 }}>{match.team1_short || match.team1}</div>
        <div style={{ textAlign: "center", minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 800 }}>{match.team1_short || match.team1} vs {match.team2_short || match.team2}{match.stage ? ` · ${match.stage}` : ""}</div>
          <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>{[prettyDate, match.city || match.venue].filter(Boolean).join(" · ")}</div>
        </div>
        <div style={{ fontSize: 18, fontWeight: 900, textAlign: "center", minWidth: 0 }}>{match.team2_short || match.team2}</div>
      </div>
      {resultText && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 10 }}>
          <span style={{ fontSize: 11.5, fontWeight: 800, padding: "4px 14px", borderRadius: 999, border: `1px solid ${hasWinner ? "#16a34a" : "rgba(255,255,255,0.25)"}`, background: hasWinner ? "rgba(22,163,74,0.35)" : "rgba(255,255,255,0.08)" }}>{resultText}</span>
        </div>
      )}
    </div>
  ) : null;

  const myLeaderboardIdx = leaderboard.findIndex((r) => r.isMe);
  const meLeaderboardRow = myLeaderboardIdx >= 0 ? leaderboard[myLeaderboardIdx] : null;
  // Fan Score = user's exact Match SXPs (1:1 consistent with Match Leaderboard)
  const effectiveMatchSxp = meLeaderboardRow ? meLeaderboardRow.sxp : matchSxp;
  const fanScore: number | null = (kpis || meLeaderboardRow || stats) ? effectiveMatchSxp : null;

  // Overall Impact strictly based on Match SXPs
  const impact = effectiveMatchSxp >= 50 ? "High" : effectiveMatchSxp >= 20 ? "Medium" : "Low";
  const impactColor = effectiveMatchSxp >= 50 ? "#16a34a" : effectiveMatchSxp >= 20 ? "#d97706" : "#475569";

  // DEBUG: compare with the [SXP-CARD] logs from MyScoreCards (Profile / FanScorecard list).
  useEffect(() => {
    if (!matchId) return;
    console.log("[SXP-DETAIL]", matchId, {
      shownFanScore: fanScore,
      leaderboardMeRowSxp: meLeaderboardRow?.sxp ?? null,
      kpiTotalMatchSxp: kpiMatchSxp,
      localActivitySxp: localMatchSxp,
      matchSxp,
    });
  }, [matchId, fanScore, meLeaderboardRow?.sxp, kpiMatchSxp, localMatchSxp, matchSxp]); // eslint-disable-line react-hooks/exhaustive-deps

  // Build Match Impact rows from SXP breakdown so percentages always sum to 100% (or 0% if 0 SXP)
  // and subfields always reflect SXP earned (+ Recognition SXP in the respective pillar)
  const impactRowsData = (() => {
    const kData = kpis?.kpis;
    const raw = IMPACT_ROWS.map((row) => {
      const item = kData?.[row.key];
      const baseSxp = Number(item?.baseSxp ?? item?.sxp ?? 0);
      const recognitionSxp = Number(item?.recognitionSxp ?? 0);
      return { ...row, baseSxp, recognitionSxp, apiMetric: item?.metric };
    });

    const sumFromApi = raw.reduce((s, r) => s + r.baseSxp + r.recognitionSxp, 0);
    if (effectiveMatchSxp > sumFromApi) {
      const partRow = raw.find((r) => r.key === "participation");
      if (partRow) partRow.baseSxp += effectiveMatchSxp - sumFromApi;
    }

    const totals = raw.map((r) => r.baseSxp + r.recognitionSxp);
    const grandTotal = totals.reduce((a, b) => a + b, 0);

    let pcts: number[];
    if (grandTotal <= 0) {
      pcts = totals.map(() => 0);
    } else {
      const exact = totals.map((v) => (v / grandTotal) * 100);
      const floored = exact.map((e) => Math.floor(e));
      const rem = 100 - floored.reduce((a, b) => a + b, 0);
      const order = exact
        .map((e, idx) => ({ idx, frac: e - floored[idx], val: totals[idx] }))
        .sort((a, b) => (b.frac !== a.frac ? b.frac - a.frac : b.val - a.val));
      for (let i = 0; i < rem && i < order.length; i++) floored[order[i].idx] += 1;
      pcts = floored;
    }

    return raw.map((r, i) => {
      const total = r.baseSxp + r.recognitionSxp;
      const metric =
        total <= 0
          ? "0 SXP"
          : r.recognitionSxp > 0 && r.baseSxp > 0
          ? `${total} SXP (${r.baseSxp} SXP + ${r.recognitionSxp} SXP Recognition)`
          : r.recognitionSxp > 0
          ? `${total} SXP (${r.recognitionSxp} SXP Recognition)`
          : `${total} SXP`;
      return { ...r, pct: pcts[i], totalSxp: total, metric };
    });
  })();

  // Badges (frontend only, not stored): one per Match Impact field, earned with at least 3 participations in it.
  const BADGE_MIN = 3;
  const k = kpis?.kpis;
  const badges = [
    { id: "knowledge", n: Number(k?.knowledge?.attempted || 0), label: "Cricket Scholar", color: "#facc15", icon: "🧠" },
    { id: "prediction", n: Number(k?.prediction?.attempted ?? k?.prediction?.resolved ?? 0), label: "Sharp Predictor", color: "#22c55e", icon: "🎯" },
    { id: "participation", n: Number(k?.participation?.cardsEngaged || 0), label: "Active Fan", color: "#38bdf8", icon: "🔥" },
    { id: "community", n: Number(k?.community?.debatesVoted || 0), label: "Debate Champion", color: "#a855f7", icon: "💬" },
    { id: "insight", n: (Number(k?.insight?.peerLikesReceived) || 0) + (Number(k?.insight?.peerRepliesReceived) || 0), label: "Insight Guru", color: "#ec4899", icon: "💡" },
  ].filter((b) => b.n >= BADGE_MIN);

  // Match Rank uses the exact same rank as the leaderboard below
  const myRank = (myLeaderboardIdx >= 0 ? myLeaderboardIdx + 1 : null) ?? rankInfo.rank ?? null;
  const totalFans = Math.max(rankInfo.total || 0, leaderboard.length, myRank || 0);
  const fmtFans = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K` : String(n));

  const shareText = `My Fan Score${fanScore != null ? ` is ${fanScore} SXP` : ""} for ${title}${myRank != null ? ` – Ranked #${myRank} of ${fmtFans(totalFans)} fans` : ""} on SportsFan360!`;
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
    <Shell onBack={() => handleGoBack(router, "/MainModules/Profile")} title={title} sub={sub} summary={summaryCard}>
      {/* Followed Matches Filter Tabs */}


      {!stats ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-[#e91e8c] animate-spin" style={{ margin: "0 auto" }} />
        </div>
      ) : (
        <>

      {/* Fan score */}
      <div style={{ ...card, padding: "14px 8px", border: "1.5px solid #ff7a2f", boxShadow: "0 0 16px rgba(255,90,60,0.4)", display: "grid", gridTemplateColumns: "minmax(0,1.1fr) minmax(0,1.1fr) minmax(0,0.9fr)", alignItems: "center", gap: 6 }}>
        <div style={{ textAlign: "center", minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>Your Fan Score</div>
          <div style={{ fontSize: "clamp(36px, 12vw, 60px)", fontWeight: 900, lineHeight: 1.05, background: "linear-gradient(90deg,#ff6b35,#ec4899)", WebkitBackgroundClip: "text", color: "transparent" }}>{fanScore ?? "–"}</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.65)", letterSpacing: 0.6 }}>SXPs</div>
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
          {leagueTeams.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 4, marginTop: 5 }}>
              {leagueTeams.map((t) => (
                <span key={t.id} style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 999, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}>
                  {t.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.image} alt="" style={{ width: 12, height: 12, borderRadius: "50%", objectFit: "cover" }} />
                  )}
                  {t.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top stat tabs: from the match-kpis API (falls back to local activity counts until it loads) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: 6 }}>
        {[
          {
            v: kpis?.kpis?.knowledge
              ? `${kpis.kpis.knowledge.correct ?? 0}/${kpis.kpis.knowledge.attempted ?? 0}`
              : `${stats.triviaCorrect ?? 0}/${stats.triviaTotal ?? 0}`,
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
            v: kpis?.kpis?.participation?.cardsEngaged != null
              ? String(kpis.kpis.participation.cardsEngaged)
              : String(stats.interactions),
            l: "Interact", ic: "inter",
          },
          {
            v: kpis?.kpis?.community?.debatesVoted != null
              ? String(kpis.kpis.community.debatesVoted)
              : String(stats.debates),
            l: "Debates", ic: "deb",
          },
          {
            v: String(kpis?.kpis?.insight?.recognitionsCount ?? kpis?.recognitionsCount ?? 0),
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
          <span style={{ fontSize: 12 }}>Overall Impact: <b style={{ background: impactColor, borderRadius: 8, padding: "2px 8px" }}>{impact}</b></span>
        </div>
        {impactRowsData.map((row) => {
          const pct = Math.max(0, Math.min(100, row.pct));
          return (
            <div key={row.key} style={{ margin: "8px 0", fontSize: 13 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 110 }}>{row.label}</span>
                <div style={{ flex: 1, height: 8, background: "rgba(255,255,255,0.12)", borderRadius: 6, overflow: "hidden" }}>
                  <div style={{ width: kpis ? `${pct}%` : 0, height: "100%", background: row.color, transition: "width .6s ease" }} />
                </div>
                <span style={{ width: 36, textAlign: "right" }}>{kpis ? `${pct}%` : "–"}</span>
              </div>
              {kpis && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginLeft: 120 }}>{row.metric}</div>}
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
          <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", rowGap: 12 }}>
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
          <button type="button" onClick={() => router.push(`/MainModules/FanScorecard/${encodeURIComponent(matchId || rawId)}/leaderboard`)}
            style={{ background: "none", border: "none", color: "#a78bfa", fontSize: 13, fontWeight: 600, cursor: "pointer", padding: 0, whiteSpace: "nowrap", flexShrink: 0 }}>
            View Full Leaderboard ›
          </button>
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
                <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.65)" }}>SXPs</div>
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
        </>
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

function Shell({ children, onBack, title, sub, summary }: { children: React.ReactNode; onBack: () => void; title: string; sub: string; summary?: React.ReactNode }) {
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

        {summary}
        {children}
      </div>
    </div>
  );
}
