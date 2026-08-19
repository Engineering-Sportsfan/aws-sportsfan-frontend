"use client";

import Image from "next/image";

export interface Contributor {
    rank: number;
    initials: string;
    name: string;
    points: string;
    color?: string;
}

export interface RoomHighlight {
    emoji: string;
    label: string;
}

export interface EngagedPost {
    author: string;
    verified?: boolean;
    time?: string;
    quote: string;
    likes: number;
    comments?: number;
}

export interface PredictionPollOption {
    label: string;
    percent: number;
}

const RANK_COLORS: Record<number, string> = {
    1: "#F2B705",
    2: "#9CA3AF",
    3: "#F97316",
};
const rankColor = (rank: number) => RANK_COLORS[rank] ?? "rgba(255,255,255,0.18)";

export interface MatchRoomRecapProps {
    teamA: { name: string; code: string; score: string; overs: string };
    teamB: { name: string; code: string; score: string; overs: string };
    matchSubtitle: string;
    result: string;
    resultDetail: string;

    // Real timing, sourced from matchStartAt/matchEndAt or first/last message
    roomStart: string;
    roomEnd: string;
    date: string;
    duration: string;

    // MVP — predictionAccuracy is optional; omit it until real vote-accuracy
    // tracking exists (see /areas/match-room-recap.md open item)
    mvp: {
        name: string;
        initials: string;
        verified?: boolean;
        xp?: string;
        predictionAccuracy?: string;
        reactions: number;
        replies: number;
        tags?: string[];
    } | null;

    stats: {
        users: number;
        posts: number;
        predictions: number;
        debates: number;
    };
    hypeMeter: { label: string; value: number };

    // Most-liked post / debate / prediction — each independently nullable
    topPost: EngagedPost | null;
    topDebate: EngagedPost | null;
    topPrediction: EngagedPost | null;

    // Prediction poll: percent split across options (e.g. IND vs PAK)
    predictionPoll: {
        question: string;
        options: PredictionPollOption[];
        participantsCount: number;
    } | null;

    roomHighlights: RoomHighlight[];

    // Top 5 contributors leaderboard
    topContributors: Contributor[];

    cta: {
        line1: string;
        line2: string;
        buttonLabel: string;
        buttonSubLabel: string;
    };
}

// Fallback data used only when a prop isn't supplied — lets the component
// render sensibly while real per-room data is being wired up.
const DEFAULTS: MatchRoomRecapProps = {
    teamA: { name: "India", code: "IND", score: "186/4", overs: "19.4 Overs" },
    teamB: { name: "England", code: "ENG", score: "184/7", overs: "20 Overs" },
    matchSubtitle: "5th T20I · Decider",
    result: "India Won",
    resultDetail: "by 6 wickets",
    roomStart: "7:30 PM",
    roomEnd: "11:42 PM",
    date: "Jul 17, 2026",
    duration: "4h 12m",
    mvp: {
        name: "RohitMania7",
        initials: "RM",
        verified: true,
        xp: "+4,850",
        predictionAccuracy: "92%",
        reactions: 326,
        replies: 54,
        tags: ["Top Predictor", "Most Reactions", "Debate Champion"],
    },
    stats: {
        users: 1284,
        posts: 4382,
        predictions: 928,
        debates: 41,
    },
    hypeMeter: { label: "Insane", value: 94 },

    topPost: {
        author: "CricCraze",
        verified: true,
        time: "10:46 PM",
        quote: "\"I told everyone Bumrah would finish it! What a spell! IN 🔥\"",
        likes: 542,
        comments: 138,
    },
    topDebate: {
        author: "DebateKing",
        time: "9:12 PM",
        quote: "\"SKY has to bat at 3 — the numbers don't lie.\"",
        likes: 234,
        comments: 89,
    },
    topPrediction: {
        author: "FanLegend18",
        time: "7:35 PM",
        quote: "\"India by 6+ wickets, calling it now.\"",
        likes: 189,
        comments: 0,
    },

    predictionPoll: {
        question: "Who will win today's match?",
        options: [
            { label: "IND", percent: 64 },
            { label: "ENG", percent: 36 },
        ],
        participantsCount: 928,
    },

    roomHighlights: [
        { emoji: "😂", label: "Most Funny" },
        { emoji: "🔥", label: "Most Controversial" },
        { emoji: "⚡", label: "Fastest Prediction" },
        { emoji: "📈", label: "Biggest Comeback" },
        { emoji: "🤝", label: "Most Helpful Fan" },
    ],

    topContributors: [
        { rank: 1, initials: "FL", name: "FanLegend18", points: "4,850" },
        { rank: 2, initials: "CC", name: "CricCraze", points: "3,420" },
        { rank: 3, initials: "DK", name: "DebateKing", points: "2,980" },
        { rank: 4, initials: "HM", name: "HitManiac", points: "2,650" },
        { rank: 5, initials: "PP", name: "PitchPerfect", points: "2,210" },
    ],

    cta: {
        line1: "The next match. The next debate.",
        line2: "The next big moment. Don't miss it!",
        buttonLabel: "JOIN ROOM NOW",
        buttonSubLabel: "Be part of the action →",
    },
};

function mergeArray<T>(base: T[], override?: T[]) {
    return override && override.length > 0 ? override : base;
}

// Distinguishes "prop not passed at all" (→ fall back to demo default) from
// "prop explicitly passed as null" (→ real fetch resolved with no data, show
// the empty state instead of a stale demo name).
function mergeNullable<T>(base: T | null, override: T | null | undefined): T | null {
    return override === undefined ? base : override;
}

function EmptyCard({ label }: { label: string }) {
    return (
        <div className="rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.02] p-4 flex items-center justify-center min-h-[92px]">
            <p className="text-white/25 text-[11px] font-semibold text-center">{label}</p>
        </div>
    );
}

function EngagedPostCard({ post, badge, badgeColor, emoji }: {
    post: EngagedPost;
    badge: string;
    badgeColor: string;
    emoji: string;
}) {
    return (
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 relative">
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-full border border-[#60A5FA]/50 flex items-center justify-center shrink-0">
                        <span className="text-[#60A5FA] text-[10px] font-extrabold">
                            {post.author.slice(0, 2).toUpperCase()}
                        </span>
                    </div>
                    <div className="min-w-0">
                        <p className="text-white text-[12px] font-extrabold truncate flex items-center gap-1">
                            {post.author}
                            {post.verified && <span className="text-[#60A5FA]">✓</span>}
                        </p>
                        {post.time && <p className="text-white/35 text-[9px] font-semibold">{post.time}</p>}
                    </div>
                </div>
                <span
                    className="shrink-0 text-[8px] font-extrabold uppercase tracking-wide rounded-full px-2 py-1 border"
                    style={{ color: badgeColor, borderColor: `${badgeColor}66` }}
                >
                    {emoji} {badge}
                </span>
            </div>

            <p className="text-white/85 text-[12px] leading-snug mb-3">{post.quote}</p>

            <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 text-white/50 text-[10px] font-bold">
                    ❤️ {post.likes}
                </span>
                {typeof post.comments === "number" && post.comments > 0 && (
                    <span className="flex items-center gap-1 text-white/50 text-[10px] font-bold">
                        💬 {post.comments}
                    </span>
                )}
            </div>
        </div>
    );
}

export default function MatchRoomRecap(props: Partial<MatchRoomRecapProps>) {
    const d: MatchRoomRecapProps = {
        ...DEFAULTS,
        ...props,
        teamA: { ...DEFAULTS.teamA, ...props.teamA },
        teamB: { ...DEFAULTS.teamB, ...props.teamB },
        mvp: props.mvp === null
            ? null
            : {
                ...(DEFAULTS.mvp as NonNullable<MatchRoomRecapProps["mvp"]>),
                ...(props.mvp ?? {}),
            },
        stats: { ...DEFAULTS.stats, ...props.stats },
        hypeMeter: { ...DEFAULTS.hypeMeter, ...props.hypeMeter },
        topPost: mergeNullable(DEFAULTS.topPost, props.topPost),
        topDebate: mergeNullable(DEFAULTS.topDebate, props.topDebate),
        topPrediction: mergeNullable(DEFAULTS.topPrediction, props.topPrediction),
        predictionPoll: mergeNullable(DEFAULTS.predictionPoll, props.predictionPoll),
        roomHighlights: mergeArray(DEFAULTS.roomHighlights, props.roomHighlights),
        topContributors: mergeArray(DEFAULTS.topContributors, props.topContributors),
        cta: { ...DEFAULTS.cta, ...props.cta },
    };

    return (
        <div className="w-full max-w-[691px] mx-auto rounded-2xl border border-white/[0.08] bg-[#0e0e14] overflow-hidden">
            {/* Header */}
            <div className="px-5 pt-15 pb-4">
                {/* <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-black">
                            <Image src="/images/Logo.png" alt="SportsFan360 logo" width={24} height={28} className="shrink-0" />
                        </div>
                        <div>
                            <p className="text-white text-[15px] font-extrabold leading-tight">
                                SportsFan<span className="text-[#FF6B35]">360</span>
                            </p>
                            <p className="text-white/40 text-[10px] font-medium leading-tight">
                                Where fans play...
                            </p>
                        </div>
                    </div>
                    <div className="w-9 h-9" />
                </div> */}

                <div className="flex justify-center mt-3">
                    <span className="text-[11px] font-bold text-white/60 tracking-wide uppercase">
                        Match Room <span className="text-[#FF6B35]">Recap</span>
                    </span>
                </div>
            </div>

            {/* Scoreboard */}
            <div className="flex items-center justify-between px-5 pb-4">
                <div className="flex flex-col items-center gap-1.5 w-20">
                    <div className="w-14 h-14 rounded-full border-2 border-[#3B82F6] flex items-center justify-center">
                        <span className="text-[#3B82F6] text-[11px] font-extrabold">{d.teamA.code}</span>
                    </div>
                    <p className="text-white text-2xl font-black leading-none">{d.teamA.score}</p>
                    <p className="text-white/35 text-[9px] font-semibold">({d.teamA.overs})</p>
                </div>

                <div className="flex-1 flex flex-col items-center gap-1 px-2">
                    <p className="text-[15px] font-extrabold text-white text-center leading-tight">
                        <span className="text-[#60A5FA]">{d.teamA.name}</span>{" "}
                        <span className="text-white/85">vs</span>{" "}
                        <span className="text-[#F87171]">{d.teamB.name}</span>
                    </p>
                    <p className="text-white/35 text-[9px] font-bold tracking-wide uppercase">{d.matchSubtitle}</p>
                    <p className="text-white text-[11px] font-extrabold mt-1">{d.result}</p>
                    <p className="text-[#F97316] text-[10px] font-bold uppercase tracking-wide">{d.resultDetail}</p>
                </div>

                <div className="flex flex-col items-center gap-1.5 w-20">
                    <div className="w-14 h-14 rounded-full border-2 border-[#F87171] flex items-center justify-center">
                        <span className="text-[#F87171] text-[11px] font-extrabold">{d.teamB.code}</span>
                    </div>
                    <p className="text-white text-2xl font-black leading-none">{d.teamB.score}</p>
                    <p className="text-white/35 text-[9px] font-semibold">({d.teamB.overs})</p>
                </div>
            </div>

            {/* Meta row — real room start/end/date/duration */}
            <div className="grid grid-cols-4 gap-2 px-5 py-4 border-t border-white/[0.06]">
                {[
                    { label: "Room Start", value: d.roomStart },
                    { label: "Room End", value: d.roomEnd },
                    { label: "Date", value: d.date },
                    { label: "Duration", value: d.duration },
                ].map(({ label, value }) => (
                    <div key={label} className="flex flex-col items-center gap-0.5 text-center">
                        <span className="text-white/35 text-[9px] font-semibold uppercase whitespace-normal">{label}</span>
                        <span className="text-white text-[11px] font-bold">{value}</span>
                    </div>
                ))}
            </div>

            {/* MVP card — accuracy stat only renders if provided */}
            {/* {d.mvp ? (
                <div className="mx-5 mt-2 rounded-2xl border border-[#F97316]/30 bg-gradient-to-br from-[#2a0f1f] to-[#1a0e10] p-4 relative">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-col items-center gap-3 min-w-0">
                            <div className="relative shrink-0">
                                <div className="w-14 h-14 rounded-full border-2 border-[#F97316] bg-[#1a0e10] flex items-center justify-center">
                                    <span className="text-white text-sm font-extrabold">{d.mvp.initials}</span>
                                </div>
                                <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-[#F2B705] text-[7px] font-extrabold text-black px-1.5 py-0.5 rounded-full uppercase">
                                    MVP
                                </span>
                            </div>
                            <div className="min-w-0">
                                <p className="text-[#F97316] text-[9px] font-extrabold uppercase tracking-wide mb-0.5">
                                    Room MVP
                                </p>
                                <p className="text-white text-[14px] font-extrabold whitespace-nowrap">
                                    {d.mvp.name} {d.mvp.verified && <span className="text-[#60A5FA]">✓</span>}
                                </p>
                                {d.mvp.xp && (
                                    <p className="text-[#FF6B9D] text-[13px] font-extrabold mt-0.5">{d.mvp.xp} SXP</p>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0">
                            {d.mvp.predictionAccuracy && (
                                <div className="text-right">
                                    <p className="text-white text-[13px] font-extrabold leading-none">
                                        {d.mvp.predictionAccuracy}
                                    </p>
                                    <p className="text-white/40 text-[8px] font-semibold">Prediction Accuracy</p>
                                </div>
                            )}
                            <div className="text-right">
                                <p className="text-white text-[13px] font-extrabold leading-none">{d.mvp.reactions}</p>
                                <p className="text-white/40 text-[8px] font-semibold">Reactions</p>
                            </div>
                            <div className="text-right">
                                <p className="text-white text-[13px] font-extrabold leading-none">{d.mvp.replies}</p>
                                <p className="text-white/40 text-[8px] font-semibold">Replies</p>
                            </div>
                        </div>
                    </div>

                    {d.mvp.tags && d.mvp.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                            {d.mvp.tags.map((tag) => (
                                <span key={tag} className="text-[9px] font-bold text-white/70 border border-white/15 rounded-full px-2.5 py-1">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="mx-5 mt-2">
                    <EmptyCard label="MVP not available yet" />
                </div>
            )} */}

        {d.mvp ? (
    <div className="mx-5 mt-2 rounded-2xl border border-[#F97316]/30 bg-gradient-to-br from-[#2a0f1f] to-[#1a0e10] p-4 relative">
        <div className="flex items-start justify-between gap-3">
            {/* Left side: Avatar on top, Name + SXP below */}
            <div className="flex flex-col items-start min-w-0 flex-1">
                {/* Avatar */}
                <div className="relative shrink-0">
                    <div className="w-14 h-14 rounded-full border-2 border-[#F97316] bg-[#1a0e10] flex items-center justify-center">
                        <span className="text-white text-sm font-extrabold">{d.mvp.initials}</span>
                    </div>
                    <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-[#F2B705] text-[7px] font-extrabold text-black px-1.5 py-0.5 rounded-full uppercase whitespace-nowrap">
                        MVP
                    </span>
                </div>
                
                {/* Name + SXP below avatar */}
                <div className="min-w-0 mt-2">
                    <p className="text-[#F97316] text-[9px] font-extrabold uppercase tracking-wide mb-0.5">
                        Room MVP
                    </p>
                    <p className="text-white text-[14px] font-extrabold break-words whitespace-normal">
                        {d.mvp.name} {d.mvp.verified}
                    </p>
                    {d.mvp.xp && (
                        <p className="text-[#FF6B9D] text-[13px] font-extrabold mt-0.5">{d.mvp.xp} SXP</p>
                    )}
                </div>
            </div>

            {/* Stats - Right aligned */}
            <div className="flex flex-col items-end gap-1 shrink-0">
                {d.mvp.predictionAccuracy && (
                    <div className="text-right">
                        <p className="text-white text-[13px] font-extrabold leading-none">
                            {d.mvp.predictionAccuracy}
                        </p>
                        <p className="text-white/40 text-[8px] font-semibold">Prediction Accuracy</p>
                    </div>
                )}
                <div className="text-right">
                    <p className="text-white text-[13px] font-extrabold leading-none">{d.mvp.reactions}</p>
                    <p className="text-white/40 text-[8px] font-semibold">Reactions</p>
                </div>
                <div className="text-right">
                    <p className="text-white text-[13px] font-extrabold leading-none">{d.mvp.replies}</p>
                    <p className="text-white/40 text-[8px] font-semibold">Replies</p>
                </div>
            </div>
        </div>

        {d.mvp.tags && d.mvp.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
                {d.mvp.tags.map((tag) => (
                    <span key={tag} className="text-[9px] font-bold text-white/70 border border-white/15 rounded-full px-2.5 py-1">
                        {tag}
                    </span>
                ))}
            </div>
        )}
    </div>
) : (
    <div className="mx-5 mt-2">
        <EmptyCard label="MVP not available yet" />
    </div>
)}

            {/* Activity snapshot */}
            <div className="px-5 pt-4">
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-wide mb-2">Room Activity Snapshot</p>
                <div className="grid grid-cols-4 gap-2">
                    {[
                        { label: "Fans", value: d.stats.users.toLocaleString() },
                        { label: "Posts", value: d.stats.posts.toLocaleString() },
                        { label: "Predictions", value: d.stats.predictions.toLocaleString() },
                        { label: "Debates", value: d.stats.debates.toLocaleString() },
                    ].map(({ label, value }) => (
                        <div key={label} className="rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 flex flex-col items-center gap-1">
                            <span className="text-white text-[17px] font-extrabold leading-none">{value}</span>
                            <span className="text-white/35 text-[8px] font-semibold uppercase tracking-wide">{label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Hype meter */}
            <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-white/50 text-[10px] font-bold uppercase tracking-wide">Hype Meter</span>
                    <span className="text-[#F97316] text-[11px] font-extrabold">
                        {d.hypeMeter.label} {d.hypeMeter.value}%
                    </span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-[#E91E8C] via-[#F97316] to-[#FCD34D]"
                        style={{ width: `${d.hypeMeter.value}%` }}
                    />
                </div>
            </div>

            {/* Most-liked Post / Debate / Prediction */}
            <div className="mx-5 mb-4 flex flex-col gap-3">
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-wide">Most Liked</p>

                {d.topPost ? (
                    <EngagedPostCard post={d.topPost} badge="POST" badgeColor="#F87171" emoji="✏️" />
                ) : (
                    <EmptyCard label="No standout post yet" />
                )}

                {d.topDebate ? (
                    <EngagedPostCard post={d.topDebate} badge="DEBATE" badgeColor="#60A5FA" emoji="⚔️" />
                ) : (
                    <EmptyCard label="No standout debate yet" />
                )}

                {d.topPrediction ? (
                    <EngagedPostCard post={d.topPrediction} badge="PREDICTION" badgeColor="#FCD34D" emoji="🎯" />
                ) : (
                    <EmptyCard label="No standout prediction yet" />
                )}
            </div>

            {/* Prediction poll — percent split across options */}
            <div className="mx-5 mb-4">
                {d.predictionPoll ? (
                    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
                        <p className="text-white text-[12px] font-extrabold mb-3 flex items-center gap-1.5">
                            🎯 {d.predictionPoll.question}
                        </p>
                        <div className="flex flex-col gap-2.5">
                            {d.predictionPoll.options.map((opt) => (
                                <div key={opt.label}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-white text-[11px] font-bold">{opt.label}</span>
                                        <span className="text-[#F97316] text-[11px] font-extrabold">{opt.percent}%</span>
                                    </div>
                                    <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-[#E91E8C] to-[#F97316]"
                                            style={{ width: `${opt.percent}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-white/40 text-[9px] font-semibold mt-3">
                            {d.predictionPoll.participantsCount.toLocaleString()} fans participated
                        </p>
                    </div>
                ) : (
                    <EmptyCard label="No prediction poll for this room yet" />
                )}
            </div>

            {/* Room highlights */}
            <div className="px-5 pt-2 pb-4 border-t border-white/[0.06]">
                <p className="text-[#FCD34D] text-[10px] font-bold uppercase tracking-wide mb-3 flex items-center gap-1.5 mt-3">
                    ⭐ Room Highlights
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {d.roomHighlights.map((h) => (
                        <div key={h.label} className="flex flex-col items-center gap-1.5 text-center">
                            <div className="w-11 h-11 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-[18px]">
                                {h.emoji}
                            </div>
                            <span className="text-white/50 text-[8px] font-semibold leading-tight">{h.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top 5 community contributors */}
            <div className="px-5 pb-4 border-t border-white/[0.06]">
                <p className="text-white/50 text-[10px] font-bold uppercase tracking-wide mb-3 flex items-center gap-1.5 mt-3">
                    🥉 Top Community Contributors
                </p>
                {d.topContributors.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                        {d.topContributors.slice(0, 5).map((c) => {
                            const color = c.color ?? rankColor(c.rank);
                            return (
                                <div key={c.rank} className="flex flex-col items-center gap-1.5 text-center">
                                    <div className="w-14 h-14 rounded-full flex items-center justify-center relative border-2" style={{ borderColor: color }}>
                                        <span className="text-white text-[13px] font-extrabold">{c.initials}</span>
                                        <span
                                            className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-extrabold text-black"
                                            style={{ background: color }}
                                        >
                                            {c.rank}
                                        </span>
                                    </div>
                                    <span className="text-white text-[9px] font-bold truncate max-w-full">{c.name}</span>
                                    <span className="text-[#F97316] text-[9px] font-extrabold">{c.points}</span>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <EmptyCard label="No contributors yet" />
                )}
            </div>

            {/* CTA */}
            <div className="mx-5 mb-4 rounded-2xl border border-[#F97316]/30 bg-white/[0.02] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <p className="text-white/85 text-[11px] font-semibold leading-snug">
                    {d.cta.line1}
                    <br />
                    {d.cta.line2}
                </p>
                <div
                    className="shrink-0 rounded-full px-4 py-2.5 text-center cursor-pointer"
                    style={{ background: "linear-gradient(135deg,#E91E8C,#FF6B35)" }}
                >
                    <p className="text-white text-[11px] font-extrabold leading-tight">{d.cta.buttonLabel}</p>
                    <p className="text-white/80 text-[8px] font-semibold leading-tight">{d.cta.buttonSubLabel}</p>
                </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-white/[0.06] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-black">
                        <Image src="/images/Logo.png" alt="SportsFan360 logo" width={24} height={28} className="shrink-0" />
                    </div>
                    <div>
                        <p className="text-white text-[11px] font-extrabold leading-tight">
                            SportsFan<span className="text-[#FF6B35]">360</span>
                        </p>
                        <p className="text-white/35 text-[8px] font-medium leading-tight">Where fans play...</p>
                    </div>
                </div>
                {/* <div className="flex items-center gap-2">
                    {["📷", "💬", "𝕏", "f"].map((icon, i) => (
                        <span key={i} className="w-6 h-6 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/60 text-[9px] font-bold">
                            {icon}
                        </span>
                    ))}
                </div> */}
            </div>

            <p className="text-white/25 text-[8px] font-semibold tracking-wide uppercase text-center pb-4 px-5">
                Powered by SportsFan360 | Where fans play | Earn SXP. Win rewards. Be legendary.
            </p>
        </div>
    );
}