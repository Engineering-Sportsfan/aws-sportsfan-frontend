"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  ChevronRight,
  HelpCircle,
  Mic,
  Trophy,
  Gift,
  X,
  Award,
  TrendingUp,
  Flame,
  Users,
} from "lucide-react";
import axios from "axios";

interface TonightScheduleWidgetProps {
  roomId?: string;
  matchId?: string;
  userId?: string;
  onViewScorecard?: () => void;
  onScheduleClick?: () => void;
}

export default function TonightScheduleWidget({
  roomId,
  matchId = "ind-vs-nz-2026-t20-m1",
  userId,
  onViewScorecard,
  onScheduleClick,
}: TonightScheduleWidgetProps) {
  const [showScorecardModal, setShowScorecardModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"recap" | "kpis" | "leaderboard">("kpis");
  const [kpiData, setKpiData] = useState<any>(null);
  const [loadingKpis, setLoadingKpis] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  // Fetch match KPIs when modal opens
  useEffect(() => {
    if (!showScorecardModal) return;
    const fetchKpis = async () => {
      setLoadingKpis(true);
      try {
        const uParam = userId ? `&userId=${encodeURIComponent(userId)}` : "";
        const mParam = matchId ? `matchId=${encodeURIComponent(matchId)}` : "matchId=ind-vs-nz-2026-t20-m1";
        const res = await axios.get(`/api/user/match-kpis?${mParam}${uParam}`);
        if (res.data?.success) {
          setKpiData(res.data);
        }
      } catch (err) {
        console.warn("Could not fetch user match KPIs:", err);
      } finally {
        setLoadingKpis(false);
      }
    };
    fetchKpis();
  }, [showScorecardModal, matchId, userId]);

  const handleOpenScorecard = () => {
    if (onViewScorecard) {
      onViewScorecard();
    } else {
      setShowScorecardModal(true);
    }
  };

  // Radar chart SVG points calculation (5-axis pentagon)
  const renderPentagonChart = () => {
    const kpis = kpiData?.kpis || {
      knowledge: { score: 90 },
      prediction: { score: 80 },
      participation: { score: 88 },
      community: { score: 82 },
      insight: { score: 84 },
    };

    const overall = kpiData?.overallScore ?? 86;

    // Angles for 5 vertices: Top, Top-Right, Bottom-Right, Bottom-Left, Top-Left
    // -90deg is Top (Knowledge), -18deg (Prediction), 54deg (Participation), 126deg (Community), 198deg (Insight)
    const angles = [-90, -18, 54, 126, 198];
    const maxR = 64;
    const cx = 110;
    const cy = 100;

    const scores = [
      kpis.knowledge?.score ?? 90,
      kpis.prediction?.score ?? 80,
      kpis.participation?.score ?? 88,
      kpis.community?.score ?? 82,
      kpis.insight?.score ?? 84,
    ];

    const polyPoints = angles
      .map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const r = ((scores[i] || 75) / 100) * maxR;
        return `${cx + r * Math.cos(rad)},${cy + r * Math.sin(rad)}`;
      })
      .join(" ");

    return (
      <div className="relative flex flex-col items-center justify-center my-1 select-none">
        <svg width="220" height="200" viewBox="0 0 220 200" className="overflow-visible">
          <defs>
            <linearGradient id="pentagonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#ec4899" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.45" />
            </linearGradient>
            <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Concentric pentagon guide rings */}
          {[0.25, 0.5, 0.75, 1.0].map((scale, sIdx) => {
            const ringPts = angles
              .map((deg) => {
                const rad = (deg * Math.PI) / 180;
                const r = scale * maxR;
                return `${cx + r * Math.cos(rad)},${cy + r * Math.sin(rad)}`;
              })
              .join(" ");
            return (
              <polygon
                key={sIdx}
                points={ringPts}
                fill="none"
                stroke="rgba(255, 255, 255, 0.12)"
                strokeWidth={sIdx === 3 ? "1.5" : "0.75"}
              />
            );
          })}

          {/* Radial axis lines */}
          {angles.map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={cx + maxR * Math.cos(rad)}
                y2={cy + maxR * Math.sin(rad)}
                stroke="rgba(255, 255, 255, 0.15)"
                strokeWidth="1"
              />
            );
          })}

          {/* Filled KPI polygon */}
          <polygon
            points={polyPoints}
            fill="url(#pentagonGrad)"
            stroke="#a855f7"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Data point dots */}
          {angles.map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            const r = ((scores[i] || 75) / 100) * maxR;
            return (
              <circle
                key={i}
                cx={cx + r * Math.cos(rad)}
                cy={cy + r * Math.sin(rad)}
                r="3.5"
                fill="#ec4899"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
            );
          })}

          {/* Center glow & score */}
          <circle cx={cx} cy={cy} r="28" fill="url(#centerGlow)" />
          <text
            x={cx}
            y={cy + 8}
            textAnchor="middle"
            fill="#facc15"
            fontSize="24"
            fontWeight="900"
            fontFamily="system-ui, sans-serif"
          >
            {overall}
          </text>
        </svg>

        {/* Labels & Scores positioned around Pentagon */}
        {/* Top: Knowledge */}
        <div className="absolute -top-1 flex flex-col items-center">
          <span className="text-[11px] font-bold text-gray-300">Knowledge</span>
          <span className="text-[12px] font-black text-emerald-400">{scores[0]}</span>
        </div>

        {/* Top Right: Prediction */}
        <div className="absolute top-12 -right-4 flex flex-col items-center">
          <span className="text-[11px] font-bold text-gray-300">Prediction</span>
          <span className="text-[12px] font-black text-emerald-400">{scores[1]}</span>
        </div>

        {/* Bottom Right: Participation */}
        <div className="absolute bottom-1 right-2 flex flex-col items-center">
          <span className="text-[11px] font-bold text-gray-300">Participation</span>
          <span className="text-[12px] font-black text-emerald-400">{scores[2]}</span>
        </div>

        {/* Bottom Left: Community */}
        <div className="absolute bottom-1 left-2 flex flex-col items-center">
          <span className="text-[11px] font-bold text-gray-300">Community</span>
          <span className="text-[12px] font-black text-emerald-400">{scores[3]}</span>
        </div>

        {/* Top Left: Insight */}
        <div className="absolute top-12 -left-3 flex flex-col items-center">
          <span className="text-[11px] font-bold text-gray-300">Insight</span>
          <span className="text-[12px] font-black text-emerald-400">{scores[4]}</span>
        </div>
      </div>
    );
  };

  return (
    <>
      <div
        className="w-full text-white font-sans select-none"
        style={{
          background: "linear-gradient(180deg, rgba(12, 13, 20, 0.98) 0%, rgba(7, 8, 14, 1) 100%)",
          padding: "10px 12px 10px",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        {/* Header row: "For you tonight" + "View schedule >" */}
        <div className="flex items-center justify-between mb-2 px-0.5">
          <div className="flex items-center gap-1.5">
            <div
              className="w-5 h-5 rounded-[6px] flex items-center justify-center shadow-sm"
              style={{
                background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)",
                boxShadow: "0 0 8px rgba(168, 85, 247, 0.4)",
              }}
            >
              <Calendar size={12} className="text-white" />
            </div>
            <span className="font-bold text-[13.5px] text-white tracking-tight">For you tonight</span>
          </div>

          <button
            type="button"
            onClick={() => {
              if (onScheduleClick) onScheduleClick();
              else showToast("Tonight's schedule: Weekly Quiz (8 PM), Notty at Ten (10 PM)");
            }}
            className="flex items-center gap-0.5 text-[11.5px] font-semibold text-[#c084fc] hover:text-purple-300 transition-colors bg-transparent border-none cursor-pointer p-0"
          >
            <span>View schedule</span>
            <ChevronRight size={13} />
          </button>
        </div>

        {/* Horizontal scroll cards row */}
        <div
          className="flex items-stretch gap-2 overflow-x-auto pb-1 mb-2.5"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {/* Card 1: Weekly Quiz */}
          <div
            onClick={() => showToast("Weekly Quiz opens at 8 PM! Get ready to test your knowledge.")}
            className="flex-1 min-w-[118px] max-w-[145px] rounded-[13px] p-2 flex flex-col items-center text-center cursor-pointer transition-all duration-200 hover:scale-[1.02]"
            style={{
              background: "linear-gradient(180deg, #37144d 0%, #170924 100%)",
              border: "1.5px solid #a855f7",
              boxShadow: "0 0 10px rgba(168, 85, 247, 0.3)",
            }}
          >
            <div className="w-7 h-7 rounded-full flex items-center justify-center mb-1">
              <HelpCircle size={22} className="text-[#d8b4fe]" />
            </div>
            <div className="font-bold text-[11px] text-white leading-tight">Weekly Quiz</div>
            <div className="text-[9.5px] font-medium text-[#d8b4fe] mt-0.5 flex items-center justify-center gap-0.5">
              <span>Play & Win</span>
              <ChevronRight size={9} />
            </div>
          </div>

          {/* Card 2: Notty at Ten */}
          <div
            onClick={() => showToast("Notty at Ten goes LIVE tonight at 10 PM!")}
            className="flex-1 min-w-[124px] max-w-[155px] rounded-[13px] p-2 flex flex-col items-center text-center cursor-pointer transition-all duration-200 hover:scale-[1.02]"
            style={{
              background: "linear-gradient(180deg, #4f1030 0%, #1e0613 100%)",
              border: "1.5px solid #ec4899",
              boxShadow: "0 0 10px rgba(236, 72, 153, 0.3)",
            }}
          >
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Mic size={17} className="text-[#f472b6]" />
              <img
                src="/images/notty-host.png"
                alt="Notty Host"
                className="w-6 h-6 rounded-full object-cover border border-pink-400/50 shadow"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
            <div className="font-bold text-[11px] text-white leading-tight">Notty at Ten</div>
            <div className="text-[9.5px] font-medium text-[#fbcfe8] mt-0.5 flex items-center justify-center gap-0.5">
              <span>Tonight, 10 PM</span>
              <ChevronRight size={9} />
            </div>
          </div>

          {/* Card 3: Leaderboards */}
          <div
            onClick={() => showToast("Opening Leaderboards...")}
            className="flex-1 min-w-[118px] max-w-[145px] rounded-[13px] p-2 flex flex-col items-center text-center cursor-pointer transition-all duration-200 hover:scale-[1.02]"
            style={{
              background: "linear-gradient(180deg, #0f3050 0%, #071526 100%)",
              border: "1.5px solid #0284c7",
              boxShadow: "0 0 10px rgba(2, 132, 199, 0.3)",
            }}
          >
            <div className="w-7 h-7 rounded-full flex items-center justify-center mb-1">
              <Trophy size={20} className="text-[#fbbf24]" />
            </div>
            <div className="font-bold text-[11px] text-white leading-tight">Leaderboards</div>
            <div className="text-[9px] font-medium text-[#bae6fd] mt-0.5 whitespace-nowrap">
              Match • Series • App
            </div>
          </div>

          {/* Card 4: Rewards & Win */}
          <div
            onClick={() => showToast("Rewards & Contests: 1200 SXP Prize Pool Active!")}
            className="flex-1 min-w-[120px] max-w-[145px] rounded-[13px] p-2 flex flex-col items-center text-center cursor-pointer transition-all duration-200 hover:scale-[1.02]"
            style={{
              background: "linear-gradient(180deg, #4a310c 0%, #1e1303 100%)",
              border: "1.5px solid #f59e0b",
              boxShadow: "0 0 10px rgba(245, 158, 11, 0.3)",
            }}
          >
            <div className="w-7 h-7 rounded-full flex items-center justify-center mb-1">
              <Gift size={20} className="text-[#fbbf24]" />
            </div>
            <div className="font-bold text-[11px] text-white leading-tight">Rewards & Win</div>
            <div className="text-[9px] font-medium text-[#fde68a] mt-0.5 whitespace-nowrap">
              Winners • New Contests
            </div>
          </div>
        </div>

        {/* Bottom Banner: "My Fan Scorecard" */}
        <div
          onClick={handleOpenScorecard}
          className="cursor-pointer transition-transform duration-150 active:scale-[0.99]"
          style={{
            background: "linear-gradient(90deg, #f97316 0%, #ec4899 50%, #a855f7 100%)",
            padding: "1.5px",
            borderRadius: "18px",
            boxShadow: "0 0 16px rgba(249, 115, 22, 0.25)",
          }}
        >
          <div
            className="flex items-center justify-between px-3.5 py-2.5 rounded-[16.5px]"
            style={{
              background: "#0f1019",
            }}
          >
            {/* Left: Trophy + Title/Subtitle */}
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: "rgba(245, 158, 11, 0.15)",
                  boxShadow: "0 0 10px rgba(245, 158, 11, 0.3)",
                }}
              >
                <Trophy size={18} className="text-[#facc15]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-[13px] text-white leading-snug truncate">
                  My Fan Scorecard
                </span>
                <span className="text-[10px] text-gray-400 font-normal leading-tight truncate">
                  Last match recap ready • Top 5%
                </span>
              </div>
            </div>

            {/* Right: "View Scorecard >" Pill */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenScorecard();
              }}
              className="shrink-0 flex items-center gap-0.5 px-3 py-1.5 rounded-full text-[11px] font-bold text-[#e9d5ff] transition-all hover:bg-purple-600/30"
              style={{
                background: "rgba(168, 85, 247, 0.16)",
                border: "1px solid rgba(168, 85, 247, 0.45)",
                cursor: "pointer",
              }}
            >
              <span>View Scorecard</span>
              <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notice */}
      {toastMsg && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#1e1e2d] border border-white/20 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-2xl animate-fade-in">
          {toastMsg}
        </div>
      )}

      {/* Fan Scorecard Modal (Pentagon Radar & KPIs) */}
      {showScorecardModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3"
          onClick={() => setShowScorecardModal(false)}
        >
          <div
            className="w-full max-w-[360px] rounded-2xl overflow-hidden flex flex-col"
            style={{
              background: "#0c0d16",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.8)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Tabs: Recap | KPIs | Leaderboard */}
            <div className="flex items-center justify-between border-b border-white/10 px-4 pt-3 pb-0 bg-[#12131f]">
              <div className="flex items-center gap-5">
                {(["recap", "kpis", "leaderboard"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setActiveTab(t)}
                    className={`pb-2.5 text-xs font-bold capitalize transition-colors relative bg-transparent border-none cursor-pointer ${
                      activeTab === t ? "text-[#f97316]" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {t === "kpis" ? "KPIs" : t}
                    {activeTab === t && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#f97316] rounded-full" />
                    )}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShowScorecardModal(false)}
                className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center border-none cursor-pointer mb-2"
              >
                <X size={14} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 flex-1 overflow-y-auto max-h-[460px]">
              {activeTab === "kpis" && (
                <div className="flex flex-col items-center">
                  <div className="font-extrabold text-[15px] text-white mb-2 self-start">
                    Your Fan KPIs
                  </div>

                  {loadingKpis ? (
                    <div className="py-16 text-xs text-gray-400">Loading your match KPIs...</div>
                  ) : (
                    <>
                      {/* Pentagon Radar Chart */}
                      {renderPentagonChart()}

                      {/* KPI Breakdown Tiles */}
                      <div className="w-full grid grid-cols-2 gap-2 mt-4">
                        <div className="p-2 rounded-xl bg-white/[0.04] border border-white/10">
                          <div className="text-[10px] text-gray-400">Trivia Accuracy</div>
                          <div className="text-xs font-bold text-white mt-0.5">
                            {kpiData?.kpis?.knowledge?.metric || "9/10 Correct (90%)"}
                          </div>
                        </div>
                        <div className="p-2 rounded-xl bg-white/[0.04] border border-white/10">
                          <div className="text-[10px] text-gray-400">Predictions Accuracy</div>
                          <div className="text-xs font-bold text-white mt-0.5">
                            {kpiData?.kpis?.prediction?.metric || "4/5 Correct (80%)"}
                          </div>
                        </div>
                        <div className="p-2 rounded-xl bg-white/[0.04] border border-white/10">
                          <div className="text-[10px] text-gray-400">Match Presence</div>
                          <div className="text-xs font-bold text-white mt-0.5">
                            {kpiData?.kpis?.participation?.metric || "7/8 Cards Engaged (88%)"}
                          </div>
                        </div>
                        <div className="p-2 rounded-xl bg-white/[0.04] border border-white/10">
                          <div className="text-[10px] text-gray-400">Community Voice</div>
                          <div className="text-xs font-bold text-white mt-0.5">
                            {kpiData?.kpis?.community?.metric || "3 Votes, 2 Comments"}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === "recap" && (
                <div className="flex flex-col gap-3 py-2">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500/10 to-pink-500/10 border border-orange-500/20">
                    <div className="text-xs font-bold text-orange-400">Match Recap Ready</div>
                    <div className="text-[11px] text-gray-300 mt-1">
                      IND vs NZ T20 Match 1 completed. You earned <strong>+42 SXP</strong> and ranked in the top 5% of active fans!
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-gray-300 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Interactions:</span>
                      <span className="font-bold text-white">14</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total SXP Earned:</span>
                      <span className="font-bold text-amber-400">+42 SXP</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Leaderboard Percentile:</span>
                      <span className="font-bold text-emerald-400">Top 5%</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "leaderboard" && (
                <div className="flex flex-col gap-2 py-2">
                  <div className="text-xs font-bold text-white mb-1">Series Fan Standings</div>
                  {[
                    { rank: 1, name: "ViratFan_18", points: 2840, badge: "ELITE_FAN" },
                    { rank: 2, name: "RohitRoar_45", points: 2610, badge: "SUPER_FAN" },
                    { rank: 3, name: "BumrahBoom", points: 2450, badge: "SUPER_FAN" },
                    { rank: 4, name: "You", points: 2120, badge: "PRO_FAN", isMe: true },
                  ].map((u) => (
                    <div
                      key={u.rank}
                      className={`flex items-center justify-between p-2 rounded-xl text-xs ${
                        u.isMe
                          ? "bg-purple-950/40 border border-purple-500/40 font-bold"
                          : "bg-white/[0.03] border border-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 text-center text-gray-400 font-extrabold">{u.rank}</span>
                        <span className={u.isMe ? "text-purple-300" : "text-white"}>{u.name}</span>
                      </div>
                      <span className="text-amber-400 font-bold">{u.points} XP</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
