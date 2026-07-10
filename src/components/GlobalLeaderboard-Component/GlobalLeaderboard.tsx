'use client';

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  memo,
  useTransition,
} from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLeaderboard } from '@/context/LeaderboardContext';
import { ChevronLeft, ChevronDown, Trophy, Star, Crown, ArrowUp, ArrowDown, Minus, Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LeaderboardUser {
  userId: string | number;
  rank: number;
  userName: string;
  totalPoints: number;
}

interface AnimatedUser extends LeaderboardUser {
  previousRank: number;
  rankDelta: number;
  animatingUp: boolean;
  animatingDown: boolean;
  flashGreen: boolean;
  flashRed: boolean;
}

// ─── Confetti ─────────────────────────────────────────────────────────────────
interface ConfettiPiece {
  id: number;
  left: number;
  color: string;
  w: number;
  h: number;
  borderRadius: string;
  duration: number;
  delay: number;
  drift: number;
  rotation: number;
}

const CONFETTI_COLORS = [
  '#FFD700', '#e11d48', '#10b981', '#f97316',
  '#a78bfa', '#38bdf8', '#fb7185', '#facc15', '#ffffff',
];

// memo: only re-renders when `active` flips
const Confetti = memo<{ active: boolean }>(({ active }) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (!active) { setPieces([]); return; }
    const generated: ConfettiPiece[] = Array.from({ length: 110 }, (_, i) => {
      const isRect = Math.random() > 0.38;
      const baseSize = 5 + Math.random() * 9;
      return {
        id: i,
        left: Math.random() * 100,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        w: isRect ? baseSize * 0.45 : baseSize,
        h: isRect ? baseSize * 2 : baseSize,
        borderRadius: isRect ? '2px' : '50%',
        duration: 1.8 + Math.random() * 2.2,
        delay: Math.random() * 0.9,
        drift: (Math.random() - 0.5) * 260,
        rotation: 120 + Math.random() * 600,
      };
    });
    setPieces(generated);
  }, [active]);

  if (!active || pieces.length === 0) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999, overflow: 'hidden' }}>
      {pieces.map((p) => (
        <div
          key={p.id}
          className="gl-confetti-piece"
          style={{
            left: `${p.left}%`,
            width: `${p.w}px`,
            height: `${p.h}px`,
            background: p.color,
            borderRadius: p.borderRadius,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            ['--drift' as string]: `${p.drift}px`,
            ['--rot' as string]: `${p.rotation}deg`,
          }}
        />
      ))}
    </div>
  );
});
Confetti.displayName = 'Confetti';

// ─── Rank Badge ───────────────────────────────────────────────────────────────
const RankBadge = memo<{ rank: number }>(({ rank }) => {
  if (rank === 1) {
    return (
      <div className="gl-rank-badge gl-rank-1">
        <Crown className="gl-crown-icon" />
        <span className="gl-rank-text">#1</span>
      </div>
    );
  }
  if (rank === 2) return <div className="gl-rank-badge gl-rank-2"><span className="gl-rank-text">#2</span></div>;
  if (rank === 3) return <div className="gl-rank-badge gl-rank-3"><span className="gl-rank-text">#3</span></div>;
  return <div className="gl-rank-badge gl-rank-default"><span className="gl-rank-text">#{rank}</span></div>;
});
RankBadge.displayName = 'RankBadge';

const sameUserId = (a: string | number | undefined, b: string | number | undefined) =>
  a !== undefined && b !== undefined && String(a) === String(b);

// ─── Delta Indicator ──────────────────────────────────────────────────────────
const DeltaIndicator = memo<{ delta: number }>(({ delta }) => {
  if (delta > 0) return <span className="gl-delta gl-delta-up"><ArrowUp size={10} />{delta}</span>;
  if (delta < 0) return <span className="gl-delta gl-delta-down"><ArrowDown size={10} />{Math.abs(delta)}</span>;
  return <span className="gl-delta gl-delta-same"><Minus size={10} /></span>;
});
DeltaIndicator.displayName = 'DeltaIndicator';

// ─── Podium Glow Bar ─────────────────────────────────────────────────────────
const PodiumGlow = memo<{ rank: number }>(({ rank }) => {
  const colors = ['#FFD700', '#C0C0C0', '#CD7F32'];
  if (rank > 3) return null;
  return (
    <div
      className="gl-podium-glow"
      style={{ background: `linear-gradient(90deg, ${colors[rank - 1]}33, transparent)` }}
    />
  );
});
PodiumGlow.displayName = 'PodiumGlow';

// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar = memo<{ initial: string; isCurrentUser: boolean; rank: number }>(
  ({ initial, isCurrentUser, rank }) => {
    const podiumColors: Record<number, string> = {
      1: 'linear-gradient(135deg, #FFD700, #FFA500)',
      2: 'linear-gradient(135deg, #C0C0C0, #808080)',
      3: 'linear-gradient(135deg, #CD7F32, #8B4513)',
    };
    const bg = isCurrentUser
      ? 'linear-gradient(135deg, #e11d48, #f97316)'
      : podiumColors[rank] ?? 'linear-gradient(135deg, #3f3f46, #27272a)';

    return (
      <div
        className={`gl-avatar${isCurrentUser ? ' gl-avatar-current' : ''}${rank <= 3 ? ' gl-avatar-podium' : ''}`}
        style={{ background: bg }}
      >
        {initial}
      </div>
    );
  }
);
Avatar.displayName = 'Avatar';

// ─── Main Component ───────────────────────────────────────────────────────────
const GlobalLeaderboard: React.FC = () => {
  const { user } = useAuth();
  const { leaderboard, currentUserRank, currentUserPoints, loading } = useLeaderboard();
  const router = useRouter();

  const [animatedList, setAnimatedList] = useState<AnimatedUser[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const prevRanksRef = useRef<Map<string | number, number>>(new Map());
  const mountSnapshotRef = useRef<Map<string | number, number> | null>(null);
  const hasInitializedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string | number, HTMLDivElement>>(new Map());

  // FIX: useTransition marks the heavy diff work as non-urgent so React can
  // paint the raw list first, then apply animations in the background.
  const [, startTransition] = useTransition();

  // FIX: useMemo prevents leaderboard ?? [] from producing a new array reference
  // on every render, which was causing the diff useEffect to re-run needlessly.
  const safeLeaderboard: LeaderboardUser[] = useMemo(
    () => leaderboard ?? [],
    [leaderboard]
  );
  const safeRank = currentUserRank ?? 0;
  const safePoints = currentUserPoints ?? 0;

  const RANK_SNAPSHOT_KEY = 'gl_rank_snapshot';

  // UI state: search, pagination/expand
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [visibleLimit, setVisibleLimit] = useState<number>(15);
  const [expanded, setExpanded] = useState<boolean>(false);
  const PAGE_INCREMENT = 15;

  // Confetti on open — identical to original
  useEffect(() => {
    setShowConfetti(true);
    const t = setTimeout(() => setShowConfetti(false), 3800);
    return () => clearTimeout(t);
  }, []);

  // FIX: useCallback gives getPrevRank a stable reference so it doesn't
  // appear in useEffect deps and cause spurious re-runs.
  const getPrevRank = useCallback(
    (userId: string | number, map: Map<string | number, number>): number | null => {
      if (map.has(userId)) return map.get(userId)!;
      if (map.has(String(userId))) return map.get(String(userId))!;
      const asNum = Number(userId);
      if (!isNaN(asNum) && map.has(asNum)) return map.get(asNum)!;
      return null;
    },
    []
  );

  useEffect(() => {
    if (safeLeaderboard.length === 0) return;

    // ── CLEANUP REF: must live outside startTransition so the useEffect
    // cleanup function can cancel it correctly on unmount/re-run.
    let saveTimer: ReturnType<typeof setTimeout>;

    startTransition(() => {
      // First-mount: load persisted snapshot — identical logic to original
      if (!hasInitializedRef.current) {
        hasInitializedRef.current = true;
        try {
          const raw = localStorage.getItem(RANK_SNAPSHOT_KEY);
          if (raw) {
            const parsed: Record<string, number> = JSON.parse(raw);
            mountSnapshotRef.current = new Map(
              Object.entries(parsed).map(([k, v]) => [k, Number(v)])
            );
          }
        } catch {
          // localStorage unavailable or corrupt — skip snapshot
        }
      }

      const prev: Map<string | number, number> =
        prevRanksRef.current.size > 0
          ? prevRanksRef.current
          : (mountSnapshotRef.current ?? new Map());

      // ── PRESERVED EXACTLY: animation flags match original's logic.
      // Original did NOT guard these with `changed` — delta > 0 / delta < 0
      // alone drives the flags, matching the original behavior precisely.
      const next: AnimatedUser[] = safeLeaderboard.map((u) => {
        const storedPrevRank = getPrevRank(u.userId, prev);
        const prevRank = storedPrevRank ?? u.rank;
        const delta = prevRank - u.rank;
        return {
          ...u,
          previousRank: prevRank,
          rankDelta: delta,
          animatingUp: delta > 0,       // exact original logic
          animatingDown: delta < 0,     // exact original logic
          flashGreen: delta > 0,        // exact original logic
          flashRed: delta < 0,          // exact original logic
        };
      });

      setAnimatedList(next);

      // Update live-update ref — identical timing to original (after building next[])
      const nextMap = new Map<string | number, number>();
      safeLeaderboard.forEach((u) => nextMap.set(u.userId, u.rank));
      prevRanksRef.current = nextMap;

      // Persist snapshot + reset animations after 1300ms — identical to original
      saveTimer = setTimeout(() => {
        try {
          const snapshot: Record<string, number> = {};
          safeLeaderboard.forEach((u) => { snapshot[String(u.userId)] = u.rank; });
          localStorage.setItem(RANK_SNAPSHOT_KEY, JSON.stringify(snapshot));
        } catch {
          // ignore write errors
        }

        setAnimatedList((cur) =>
          cur.map((u) => ({
            ...u,
            animatingUp: false,
            animatingDown: false,
            flashGreen: false,
            flashRed: false,
          }))
        );
      }, 1300);
    });

    // Cleanup runs correctly at the useEffect level — fixes the timer leak
    // that existed in the previous version where return was inside startTransition
    return () => clearTimeout(saveTimer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeLeaderboard, getPrevRank]);

  // FIX: useCallback prevents a new function reference on every render
  const setItemRef = useCallback((id: string | number, el: HTMLDivElement | null) => {
    if (el) itemRefs.current.set(id, el);
    else itemRefs.current.delete(id);
  }, []);

  // FIX: useMemo so the fallback mapping only runs when source data changes.
  // This is the key latency fix — user sees data immediately from safeLeaderboard
  // while animatedList is still being computed in the startTransition background.
  const displayList: AnimatedUser[] = useMemo(() => {
    if (animatedList.length > 0) return animatedList;
    return safeLeaderboard.map((u) => ({
      ...u,
      previousRank: u.rank,
      rankDelta: 0,
      animatingUp: false,
      animatingDown: false,
      flashGreen: false,
      flashRed: false,
    }));
  }, [animatedList, safeLeaderboard]);

  // Precompute sorted user list and visible slice (search + pagination + current-user visibility)
  const allUsers = useMemo(() => {
    return displayList.slice().sort((a, b) => a.rank - b.rank);
  }, [displayList]);

  const normalizedQuery = (searchQuery || "").trim().toLowerCase();

  const matchedUsers = useMemo(() => {
    if (!normalizedQuery) return allUsers;
    return allUsers.filter((u) => (u.userName || '').toLowerCase().includes(normalizedQuery));
  }, [allUsers, normalizedQuery]);

  const visibleList = useMemo(() => {
    // Searching: show matched users (paginated)
    if (normalizedQuery) {
      return matchedUsers.slice(0, visibleLimit);
    }

    // Not searching: show top N, but always ensure current user visible
    const total = allUsers.length;
    const limit = Math.max(1, visibleLimit);

    // If current user is outside the default window and we're not expanded,
    // show 1..(limit-1) then the current user's row as the final row.
    if (!expanded && user && user.userId && (userRank() > limit)) {
      const top = allUsers.slice(0, limit - 1);
      const current = allUsers.find((u) => sameUserId(u.userId, user.userId));
      if (current) {
        // Ensure we don't duplicate if current appears in top
        const inTop = top.some((t) => sameUserId(t.userId, current.userId));
        if (!inTop) return [...top, current];
      }
      return top;
    }

    // Default: show up to limit (expanded or not controls limit value)
    return allUsers.slice(0, Math.min(limit, total));
  }, [allUsers, matchedUsers, normalizedQuery, visibleLimit, expanded, user]);

  function userRank() {
    const r = (user && allUsers.find((u) => sameUserId(u.userId, user.userId))?.rank) ?? 0;
    return r;
  }

  // ── Loading — identical to original ───────────────────────────────────────
  if (loading && safeLeaderboard.length === 0) {
    return (
      <div className="gl-loading-wrap">
        <div className="gl-spinner" />
        <p className="gl-loading-text">Calculating Ranks...</p>
        <div className="gl-loading-bars">
          {[40, 70, 55, 85, 50].map((h, i) => (
            <div key={i} className="gl-loading-bar" style={{ height: `${h}%`, animationDelay: `${i * 0.12}s` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <Confetti active={showConfetti} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');

        :root {
          --gl-gold: #FFD700;
          --gl-silver: #C8C8C8;
          --gl-bronze: #CD7F32;
          --gl-rose: #e11d48;
          --gl-orange: #f97316;
          --gl-emerald: #10b981;
          --gl-bg: #07070a;
          --gl-card: #0f0f12;
          --gl-border: rgba(255,255,255,0.07);
          --gl-font-display: 'Barlow Condensed', sans-serif;
          --gl-font-body: 'DM Sans', sans-serif;
        }

        .gl-wrap {
          max-width: 860px;
          margin: 0 auto;
          padding: 10px 16px 48px;
          font-family: var(--gl-font-body);
          position: relative;
        }
        .gl-wrap::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
          z-index: 0;
        }
        .gl-header {
          display: flex;
          flex-wrap: wrap;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 28px;
          position: relative;
          z-index: 2;
          animation: glFadeUp 0.5s ease both;
        }
        .gl-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: rgba(255,255,255,0.45);
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          padding: 7px 16px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 14px;
          font-family: var(--gl-font-body);
        }
        .gl-back-btn:hover { color: #fff; background: rgba(255,255,255,0.09); border-color: rgba(255,255,255,0.18); }
        .gl-title-row { display: flex; align-items: center; gap: 16px; }
        .gl-title-icon {
          width: 56px; height: 56px; border-radius: 16px;
          background: linear-gradient(135deg, rgba(225,29,72,0.18), rgba(249,115,22,0.12));
          border: 1px solid rgba(225,29,72,0.3);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 24px rgba(225,29,72,0.15); flex-shrink: 0;
        }
        .gl-title {
          font-family: var(--gl-font-display); font-size: clamp(28px, 5vw, 42px);
          font-weight: 900; letter-spacing: -0.01em; color: #fff;
          line-height: 1; margin-bottom: 4px; text-transform: uppercase;
        }
        .gl-subtitle { font-size: 12px; color: rgba(255,255,255,0.38); font-weight: 500; letter-spacing: 0.03em; }
        .gl-stat-card {
          background: var(--gl-card); border: 1px solid var(--gl-border);
          border-radius: 18px; padding: 18px 24px;
          display: flex; align-items: center; gap: 24px;
          position: relative; overflow: hidden; transition: border-color 0.3s;
        }
        .gl-stat-card:hover { border-color: rgba(225,29,72,0.25); }
        .gl-stat-card::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(120deg, rgba(225,29,72,0.06), rgba(249,115,22,0.03));
          pointer-events: none;
        }
        .gl-stat-label { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; color: rgba(255,255,255,0.3); margin-bottom: 4px; font-family: var(--gl-font-display); }
        .gl-stat-value { font-family: var(--gl-font-display); font-size: 32px; font-weight: 900; color: #fff; line-height: 1; letter-spacing: -0.02em; }
        .gl-stat-value-points { font-family: var(--gl-font-display); font-size: 24px; font-weight: 900; color: var(--gl-emerald); line-height: 1; letter-spacing: -0.02em; }
        .gl-stat-unit { font-size: 11px; color: rgba(16,185,129,0.6); font-weight: 700; letter-spacing: 0.08em; margin-left: 3px; }
        .gl-divider { width: 1px; height: 40px; background: rgba(255,255,255,0.08); flex-shrink: 0; }
        .gl-live-pill {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 9px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase;
          color: var(--gl-emerald); background: rgba(16,185,129,0.1);
          border: 1px solid rgba(16,185,129,0.2); border-radius: 999px; padding: 4px 10px;
          margin-top: 10px; font-family: var(--gl-font-display);
        }
        .gl-live-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--gl-emerald); animation: glPulse 1.4s ease-in-out infinite; }
        .gl-table-wrap {
          background: var(--gl-card); border: 1px solid var(--gl-border);
          border-radius: 24px; overflow: hidden; position: relative; z-index: 2;
          animation: glFadeUp 0.5s 0.1s ease both;
        }
        .gl-col-headers { display: flex; align-items: center; padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .gl-col-header { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.14em; color: rgba(255,255,255,0.25); font-family: var(--gl-font-display); }
        .gl-col-rank  { width: 80px; }
        .gl-col-fan   { flex: 1; }
        .gl-col-delta { width: 60px; text-align: center; }
        .gl-col-pts   { width: 100px; text-align: right; }
        .gl-list { padding: 10px; display: flex; flex-direction: column; gap: 6px; }
        .gl-row {
          position: relative; display: flex; align-items: center;
          padding: 12px 14px; border-radius: 14px; border: 1px solid transparent;
          cursor: default; overflow: hidden;
          transition: transform 0.25s ease, border-color 0.25s ease, background 0.25s ease;
          will-change: transform;
        }
        .gl-row:hover { transform: translateX(4px); }
        .gl-row-normal { background: rgba(255,255,255,0.025); border-color: rgba(255,255,255,0.05); }
        .gl-row-normal:hover { background: rgba(255,255,255,0.045); border-color: rgba(255,255,255,0.1); }
        .gl-row-rank-1 { background: linear-gradient(105deg, rgba(255,215,0,0.08) 0%, rgba(255,215,0,0.02) 60%, transparent 100%); border-color: rgba(255,215,0,0.18); }
        .gl-row-rank-2 { background: linear-gradient(105deg, rgba(192,192,192,0.07) 0%, rgba(192,192,192,0.02) 60%, transparent 100%); border-color: rgba(192,192,192,0.14); }
        .gl-row-rank-3 { background: linear-gradient(105deg, rgba(205,127,50,0.07) 0%, rgba(205,127,50,0.02) 60%, transparent 100%); border-color: rgba(205,127,50,0.14); }
        .gl-row-current { background: linear-gradient(105deg, rgba(225,29,72,0.1) 0%, rgba(249,115,22,0.04) 60%, transparent 100%); border-color: rgba(225,29,72,0.35); box-shadow: 0 0 20px rgba(225,29,72,0.08); }
        .gl-row-moving-up   { animation: glSlideUp   0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        .gl-row-moving-down { animation: glSlideDown 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        .gl-row-flash-green { animation: glFlashGreen 1.1s ease both; }
        .gl-row-flash-red   { animation: glFlashRed   1.1s ease both; }
        .gl-podium-bar { position: absolute; left: 0; top: 0; bottom: 0; width: 3px; border-radius: 3px 0 0 3px; }
        .gl-podium-bar-1 { background: var(--gl-gold); box-shadow: 0 0 8px var(--gl-gold); }
        .gl-podium-bar-2 { background: var(--gl-silver); box-shadow: 0 0 6px var(--gl-silver); }
        .gl-podium-bar-3 { background: var(--gl-bronze); box-shadow: 0 0 6px var(--gl-bronze); }
        .gl-podium-bar-current { background: var(--gl-rose); box-shadow: 0 0 10px var(--gl-rose); }
        .gl-rank-col { width: 80px; display: flex; align-items: center; flex-shrink: 0; }
        .gl-rank-badge { display: flex; align-items: center; gap: 4px; font-family: var(--gl-font-display); font-weight: 900; letter-spacing: -0.01em; }
        .gl-rank-text { font-size: 22px; line-height: 1; }
        .gl-rank-1 .gl-rank-text { color: var(--gl-gold); text-shadow: 0 0 12px rgba(255,215,0,0.5); }
        .gl-rank-2 .gl-rank-text { color: var(--gl-silver); text-shadow: 0 0 8px rgba(192,192,192,0.4); }
        .gl-rank-3 .gl-rank-text { color: var(--gl-bronze); text-shadow: 0 0 8px rgba(205,127,50,0.4); }
        .gl-rank-default .gl-rank-text { color: rgba(255,255,255,0.45); font-size: 18px; }
        .gl-crown-icon { width: 16px; height: 16px; color: var(--gl-gold); flex-shrink: 0; margin-right: 2px; }
        .gl-fan-col { flex: 1; display: flex; align-items: center; gap: 12px; min-width: 0; }
        .gl-avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: var(--gl-font-display); font-size: 16px; font-weight: 900; color: #fff; flex-shrink: 0; position: relative; }
        .gl-avatar-podium { box-shadow: 0 0 14px rgba(255,255,255,0.15); }
        .gl-avatar-current { box-shadow: 0 0 18px rgba(225,29,72,0.4); }
        .gl-name { font-size: 14px; font-weight: 700; color: rgba(255,255,255,0.88); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; letter-spacing: 0.01em; }
        .gl-name-current { color: #fff; }
        .gl-you-badge { display: inline-block; font-size: 8px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; background: var(--gl-rose); color: #fff; padding: 2px 7px; border-radius: 999px; margin-left: 8px; vertical-align: middle; font-family: var(--gl-font-display); }
        .gl-delta-col { width: 60px; display: flex; justify-content: center; }
        .gl-delta { display: inline-flex; align-items: center; gap: 3px; font-size: 11px; font-weight: 800; letter-spacing: 0.04em; padding: 4px 7px; border-radius: 6px; font-family: var(--gl-font-display); line-height: 1; }
        .gl-delta-up   { color: var(--gl-emerald); background: rgba(16,185,129,0.13); border: 1px solid rgba(16,185,129,0.25); animation: glDeltaPopIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both; }
        .gl-delta-down { color: #f87171; background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.2); animation: glDeltaPopIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both; }
        .gl-delta-same { color: rgba(255,255,255,0.18); background: transparent; border: 1px solid rgba(255,255,255,0.06); }
        .gl-pts-col { width: 100px; text-align: right; }
        .gl-pts-value { font-family: var(--gl-font-display); font-size: 20px; font-weight: 900; color: var(--gl-emerald); line-height: 1; letter-spacing: -0.01em; display: flex; align-items: center; justify-content: flex-end; gap: 4px; }
        .gl-pts-star { flex-shrink: 0; }
        .gl-pts-unit { font-size: 9px; color: rgba(16,185,129,0.5); font-weight: 700; letter-spacing: 0.1em; font-family: var(--gl-font-display); margin-top: 2px; }
        .gl-podium-glow { position: absolute; inset: 0; pointer-events: none; border-radius: 14px; opacity: 0.8; }
        .gl-empty { text-align: center; padding: 64px 24px; display: flex; flex-direction: column; align-items: center; }
        .gl-empty-icon { width: 80px; height: 80px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
        .gl-empty-title { font-family: var(--gl-font-display); font-size: 22px; font-weight: 800; color: #fff; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px; }
        .gl-empty-sub { font-size: 13px; color: rgba(255,255,255,0.3); }
        .gl-loading-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; gap: 16px; }
        .gl-spinner { width: 36px; height: 36px; border: 3px solid rgba(225,29,72,0.2); border-top-color: #e11d48; border-radius: 50%; animation: glSpin 0.7s linear infinite; }
        .gl-loading-text { font-family: var(--gl-font-display); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: rgba(255,255,255,0.3); animation: glPulse 1.4s ease-in-out infinite; }
        .gl-loading-bars { display: flex; align-items: flex-end; gap: 4px; height: 32px; margin-top: 8px; }
        .gl-loading-bar { width: 6px; background: linear-gradient(180deg, rgba(225,29,72,0.7), rgba(249,115,22,0.3)); border-radius: 3px; animation: glBarPulse 0.9s ease-in-out infinite alternate; }
        .gl-confetti-piece { position: absolute; top: -12px; animation: glConfettiFall linear both; will-change: transform, opacity; }
        @keyframes glConfettiFall {
          0%   { transform: translateY(0) translateX(0) rotate(0deg); opacity: 1; }
          15%  { opacity: 1; }
          85%  { opacity: 0.85; }
          100% { transform: translateY(105vh) translateX(var(--drift)) rotate(var(--rot)); opacity: 0; }
        }
        @keyframes glDeltaPopIn { from { opacity: 0; transform: scale(0.6); } to { opacity: 1; transform: scale(1); } }
        @keyframes glFadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes glSlideUp   { 0% { transform: translateX(0) translateY(12px); opacity: 0.6; } 60% { transform: translateX(0) translateY(-4px); opacity: 1; } 100% { transform: translateX(0) translateY(0); opacity: 1; } }
        @keyframes glSlideDown { 0% { transform: translateX(0) translateY(-12px); opacity: 0.6; } 60% { transform: translateX(0) translateY(4px); opacity: 1; } 100% { transform: translateX(0) translateY(0); opacity: 1; } }
        @keyframes glFlashGreen { 0% { box-shadow: none; } 20% { box-shadow: 0 0 0 2px rgba(16,185,129,0.6), 0 0 20px rgba(16,185,129,0.2); border-color: rgba(16,185,129,0.5); } 80% { box-shadow: 0 0 0 1px rgba(16,185,129,0.3), 0 0 10px rgba(16,185,129,0.1); } 100% { box-shadow: none; } }
        @keyframes glFlashRed  { 0% { box-shadow: none; } 20% { box-shadow: 0 0 0 2px rgba(248,113,113,0.5), 0 0 20px rgba(248,113,113,0.15); border-color: rgba(248,113,113,0.4); } 80% { box-shadow: 0 0 0 1px rgba(248,113,113,0.2); } 100% { box-shadow: none; } }
        @keyframes glSpin    { to { transform: rotate(360deg); } }
        @keyframes glPulse   { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }
        @keyframes glBarPulse { from { opacity: 0.3; } to { opacity: 1; } }
        .gl-row-stagger { animation: glFadeUp 0.4s ease both; }
        ${Array.from({ length: 20 }, (_, i) => `.gl-row-stagger:nth-child(${i + 1}) { animation-delay: ${i * 0.04}s; }`).join('\n')}
        @media (max-width: 540px) {
          .gl-col-delta { display: none; }
          .gl-delta-col  { display: none; }
          .gl-pts-value  { font-size: 16px; }
          .gl-rank-text  { font-size: 18px; }
          .gl-name       { font-size: 13px; }
          .gl-pts-col    { width: 72px; }
          .gl-rank-col   { width: 60px; }
          .gl-col-rank   { width: 60px; }
        }
        .gl-search { width: 100%; max-width: 360px; padding: 10px 12px; padding-left: 40px; height: 40px; border-radius: 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); color: rgba(255,255,255,0.95); font-size: 13px; transition: box-shadow 0.18s, border-color 0.18s, transform 0.12s; }
        .gl-search:hover { transform: translateY(-1px); }
        .gl-search:focus { outline: none; box-shadow: 0 10px 30px rgba(225,29,72,0.07); border-color: rgba(225,29,72,0.22); backdrop-filter: blur(6px); }
        .gl-search::placeholder { color: rgba(255,255,255,0.45); font-style: italic; }
        .gl-search-wrap { position: relative; display: inline-flex; align-items: center; width: 520px; max-width: calc(100% - 40px); gap: 8px; padding: 10px 12px; border-radius: 22px; background: linear-gradient(180deg, rgba(6,6,8,0.86), rgba(10,10,12,0.78)); border: 1px solid rgba(225,29,72,0.12); box-shadow: inset 0 -6px 18px rgba(0,0,0,0.6), 0 8px 40px rgba(225,29,72,0.04); }
        .gl-search-wrap::after { content: ''; position: absolute; inset: -2px; border-radius: 24px; pointer-events: none; filter: blur(8px); opacity: 0.9; box-shadow: 0 0 32px rgba(225,29,72,0.12); }
        .gl-search-wrap:focus-within { border-color: rgba(225,29,72,0.28); box-shadow: inset 0 -6px 20px rgba(0,0,0,0.6), 0 18px 60px rgba(225,29,72,0.12); transform: translateY(-2px); }
        .gl-search-wrap:focus-within .gl-search-icon { color: #fff; transform: translateY(-50%) scale(1.06); }
        .gl-search-icon { margin-left: 8px; color: rgba(255,255,255,0.65); transition: color 0.14s, transform 0.14s; }
        .gl-search { width: 100%; max-width: 460px; padding: 8px 8px 8px 6px; height: 44px; border-radius: 12px; background: transparent; border: none; color: rgba(255,255,255,0.95); font-size: 15px; font-weight: 500; }
        .gl-clear-btn { margin-right: 6px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.03); color: rgba(255,255,255,0.65); cursor: pointer; padding: 6px; border-radius: 8px; transition: background 0.12s, color 0.12s; }
        .gl-clear-btn:hover { background: rgba(255,255,255,0.04); color: #fff; }
        .gl-match-count { font-family: var(--gl-font-display); font-weight: 800; font-size: 12px; color: rgba(255,255,255,0.9); background: rgba(0,0,0,0.18); padding: 6px 8px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.04); margin-left: 6px; }
        @media (max-width: 900px) { .gl-search-wrap { width: 380px; } }
        @media (max-width: 540px) { .gl-search-wrap { width: calc(100% - 32px); margin: 8px 16px 0 0; } .gl-search { max-width: 100%; } }
        .gl-load-more { display: inline-flex; align-items: center; gap: 8px; margin: 18px auto 0; padding: 10px 14px; border-radius: 12px; background: rgba(225,29,72,0.06); color: #e11d48; font-weight: 800; cursor: pointer; border: 1px solid rgba(225,29,72,0.12); }
        /* Responsive layout tweaks */
        @media (max-width: 1100px) {
          .gl-wrap { padding-left: 12px; padding-right: 12px; }
        }
        @media (max-width: 900px) {
          .gl-header { flex-direction: column; align-items: stretch; gap: 12px; }
          .gl-title-row { align-items: flex-start; }
          .gl-stat-card { align-self: stretch; width: 100%; display: flex; justify-content: space-between; padding: 14px 16px; }
          .gl-title { font-size: clamp(20px, 6vw, 34px); }
          .gl-subtitle { font-size: 12px; }
          .gl-search-wrap { width: 100%; margin: 6px 0 0 0; }
          .gl-table-wrap { margin-top: 8px; }
        }
        @media (max-width: 640px) {
          .gl-col-headers { padding: 10px 12px; }
          .gl-col-header { font-size: 8px; }
          .gl-row { padding: 10px 12px; }
          .gl-rank-text { font-size: 16px; }
          .gl-pts-value { font-size: 16px; }
          .gl-search-wrap { padding: 8px; border-radius: 12px; }
          .gl-title { font-size: 22px; }
          .gl-stat-card { padding: 12px; }
          .gl-live-pill { margin-top: 6px; }
          .gl-load-more { padding: 8px 12px; }
        }
      `}</style>

      <div className="gl-wrap">
        {/* ── HEADER ── */}
        <div className="gl-header">
          <div>
            <button onClick={() => router.push('/MainModules/Fanszone')} className="gl-back-btn">
              <ChevronLeft size={14} />
              Back
            </button>
            <div className="gl-title-row">
              <div className="gl-title-icon">
                <Trophy size={26} color="#e11d48" />
              </div>
              <div>
                <h1 className="gl-title">Global Leaderboard</h1>
                <p className="gl-subtitle">Compete in battles, earn SXP, and climb the ranks.</p>
                <div className="gl-live-pill">
                  <span className="gl-live-dot" />
                  Live Rankings
                </div>
              </div>
            </div>
          </div>

          <div className="gl-stat-card">
            <div>
              <p className="gl-stat-label">Your Rank</p>
              <p className="gl-stat-value">{safeRank > 0 ? `#${safeRank}` : '—'}</p>
            </div>
            <div className="gl-divider" />
            <div>
              <p className="gl-stat-label">Total Points</p>
              <p className="gl-stat-value-points">
                {safePoints > 0 ? safePoints.toLocaleString() : '0'}
                <span className="gl-stat-unit">SXP</span>
              </p>
            </div>
          </div>
        </div>

        {/* Insert search under the title (just below Live Rankings) */}
        <div style={{ marginTop: 8, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div className="gl-search-wrap" role="search">
              <Search className="gl-search-icon" size={18} />
              <input
                type="search"
                aria-label="Search fans"
                role="searchbox"
                autoComplete="off"
                className="gl-search"
                placeholder="Search fans by name..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setVisibleLimit(15); setExpanded(false); }}
              />
              {searchQuery ? (
                <button
                  aria-label="Clear search"
                  className="gl-clear-btn"
                  onClick={() => { setSearchQuery(''); setVisibleLimit(15); setExpanded(false); }}
                >
                  <X size={14} />
                </button>
              ) : null}
              {normalizedQuery ? <span className="gl-match-count">{matchedUsers.length}</span> : null}
            </div>
          </div>
        </div>

        {/* ── TABLE ── */}
        <div className="gl-table-wrap">
          <div className="gl-col-headers">
            <div className="gl-col-header gl-col-rank">Rank</div>
            <div className="gl-col-header gl-col-fan">Fan</div>
            <div className="gl-col-header gl-col-delta">Δ</div>
            <div className="gl-col-header gl-col-pts" style={{ textAlign: 'right' }}>Points</div>
          </div>

          <div className="gl-list" ref={containerRef}>
            {visibleList.length > 0 ? (
              visibleList.map((u) => {
                const isCurrentUser = sameUserId(u.userId, user?.userId);
                const rank = u.rank;
                const isMovingUp   = u.animatingUp;
                const isMovingDown = u.animatingDown;
                const flashGreen   = u.flashGreen;
                const flashRed     = u.flashRed;
                const isAnimating  = isMovingUp || isMovingDown || flashGreen || flashRed;

                // Identical class-building logic to original
                let rowClass = 'gl-row ';
                if (!isAnimating) rowClass += 'gl-row-stagger ';
                if (isCurrentUser)   rowClass += 'gl-row-current ';
                else if (rank === 1) rowClass += 'gl-row-rank-1 ';
                else if (rank === 2) rowClass += 'gl-row-rank-2 ';
                else if (rank === 3) rowClass += 'gl-row-rank-3 ';
                else                 rowClass += 'gl-row-normal ';

                if (isMovingUp)                  rowClass += 'gl-row-moving-up ';
                if (isMovingDown)                rowClass += 'gl-row-moving-down ';
                if (flashGreen && !isMovingUp)   rowClass += 'gl-row-flash-green ';
                if (flashRed   && !isMovingDown) rowClass += 'gl-row-flash-red ';

                const initial = (u.userName || '?').charAt(0).toUpperCase();

                return (
                  <div
                    key={u.userId}
                    ref={(el) => setItemRef(u.userId, el)}
                    className={rowClass}
                  >
                    {rank === 1 && <div className="gl-podium-bar gl-podium-bar-1" />}
                    {rank === 2 && <div className="gl-podium-bar gl-podium-bar-2" />}
                    {rank === 3 && <div className="gl-podium-bar gl-podium-bar-3" />}
                    {isCurrentUser && rank > 3 && <div className="gl-podium-bar gl-podium-bar-current" />}

                    {rank <= 3 && <PodiumGlow rank={rank} />}

                    <div className="gl-rank-col">
                      <RankBadge rank={rank} />
                    </div>

                    <div className="gl-fan-col">
                      <Avatar initial={initial} isCurrentUser={isCurrentUser} rank={rank} />
                      <div style={{ minWidth: 0 }}>
                        <p className={`gl-name${isCurrentUser ? ' gl-name-current' : ''}`}>
                          {u.userName || 'Unknown Fan'}
                          {isCurrentUser && <span className="gl-you-badge">You</span>}
                        </p>
                      </div>
                    </div>

                    <div className="gl-delta-col">
                      <DeltaIndicator delta={u.rankDelta} />
                    </div>

                    <div className="gl-pts-col">
                      <div className="gl-pts-value">
                        {rank <= 3 && (
                          <Star
                            className="gl-pts-star"
                            size={13}
                            fill="currentColor"
                            color={rank === 1 ? '#FFD700' : rank === 2 ? '#C8C8C8' : '#CD7F32'}
                          />
                        )}
                        {(u.totalPoints || 0).toLocaleString()}
                      </div>
                      <p className="gl-pts-unit">SXP</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="gl-empty">
                <div className="gl-empty-icon">
                  <Trophy size={36} color="rgba(255,255,255,0.2)" />
                </div>
                <p className="gl-empty-title">No Rankings Yet</p>
                <p className="gl-empty-sub">Play battles to earn SXP and claim the #1 spot!</p>
              </div>
            )}
          </div>
        </div>
        {/* Load more / Collapse control */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {((normalizedQuery ? matchedUsers.length : allUsers.length) > visibleList.length) || visibleLimit > 15 ? (
            <button
              className="gl-load-more"
              type="button"
              onClick={() => {
                const total = normalizedQuery ? matchedUsers.length : allUsers.length;
                if (visibleLimit >= total) {
                  // collapse
                  setVisibleLimit(15);
                  setExpanded(false);
                } else {
                  const next = Math.min(total, visibleLimit + PAGE_INCREMENT);
                  setVisibleLimit(next);
                  setExpanded(next >= total);
                }
              }}
            >
              {visibleLimit >= (normalizedQuery ? matchedUsers.length : allUsers.length) ? 'Collapse' : 'Load more'}
              <ChevronDown size={14} />
            </button>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default GlobalLeaderboard;
