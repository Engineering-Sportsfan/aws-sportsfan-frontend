"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Poll } from "@/types/Polls";
import PollsSection from "@/src/components/Polls-component/PollsSection";
import PredictionCard from "@/src/components/Prediction-component/PredictionCard";
import ChallengesSection from "@/src/components/FanBattle-Component/Challengessection";
import FanBattleCard from "@/src/components/FanBattle-Component/Fanbattlearena";
import { ArrowLeft, Heart, Share2, Sparkles, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FlipArenaProps {
  selectedSport: string;
  activeTab?: "flipline" | "fliparena";
  setActiveTab?: (tab: "flipline" | "fliparena") => void;
  isPreview?: boolean;
}

export default function FlipArena({ selectedSport, activeTab = "fliparena", setActiveTab, isPreview = true }: FlipArenaProps) {
  const { user } = useAuth();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loadingPolls, setLoadingPolls] = useState(true);
  const [filter, setFilter] = useState<"all" | "quiz" | "poll" | "battle">("all");

  // Interaction States for Mock Cards
  const [fanBattleVote, setFanBattleVote] = useState<"left" | "right" | null>(null);
  const [quizSelected, setQuizSelected] = useState<string | null>(null);
  const [pollVote, setPollVote] = useState<string | null>(null);
  const [predictionVote, setPredictionVote] = useState<string | null>(null);
  const [contestEntered, setContestEntered] = useState(false);

  // Likes and Engagement states
  const [likes, setLikes] = useState({
    battle: 1524,
    quiz: 856,
    poll: 2185,
    pred: 781,
  });
  const [liked, setLiked] = useState({
    battle: false,
    quiz: false,
    poll: false,
    pred: false,
  });

  const handleLike = (card: keyof typeof likes) => {
    setLiked((prev) => {
      const newStatus = !prev[card];
      setLikes((l) => ({ ...l, [card]: newStatus ? l[card] + 1 : l[card] - 1 }));
      return { ...prev, [card]: newStatus };
    });
  };

  useEffect(() => {
    fetch("/api/polls")
      .then((res) => res.json())
      .then((json) => {
        setPolls(json.data ?? []);
        setLoadingPolls(false);
      })
      .catch((err) => {
        console.error("Failed to fetch polls in FlipArena:", err);
        setLoadingPolls(false);
      });
  }, []);

  const activePolls = polls.filter((p) => p.active);
  const matchGroups = activePolls.reduce<Record<string, Poll[]>>((acc, poll) => {
    const key = poll.matchId ?? "general";
    if (!acc[key]) acc[key] = [];
    acc[key].push(poll);
    return acc;
  }, {});

  const castVote = async (pollId: string, optionId: string, userId?: string) => {
    const res = await fetch(`/api/polls/${pollId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ optionId, userId }),
    });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.error ?? "Vote failed");
    }
  };

  return (
    <div className="w-full bg-[#070b14] min-h-screen text-white flex flex-col font-sans pb-12">
      {/* 1. Header Bar for Full Page */}
      {!isPreview && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07] bg-[#070b14]/90 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.location.href = "/MainModules/HomePage"}
              className="w-9 h-9 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/80 hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black tracking-tight">Flip Arena 🏟️</h1>
                <span className="text-[9px] font-black bg-gradient-to-r from-pink-500 to-orange-500 text-white px-2 py-0.5 rounded-full tracking-wider animate-pulse">
                  LIVE
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] font-bold text-white/40">🏏 Cricket</span>
                <span className="text-[9px] font-bold text-white/40">⚽ Football</span>
                <span className="text-[9px] font-bold text-white/40">🏃 Athletics</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Toggle Button Row for Full Page */}
      {!isPreview && (
        <div className="px-4 mb-4 mt-4">
          <div className="flex p-1 rounded-2xl bg-white/[0.04] border border-white/[0.08] shadow-inner">
            <button
              onClick={() => window.location.href = "/MainModules/FlipLine"}
              className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-black text-xs transition-all duration-300 active:scale-[0.98] cursor-pointer border-none"
              style={{
                background: "transparent",
                color: "rgba(255,255,255,0.4)",
              }}
            >
              <span className="text-sm">⚡</span> FlipLine
            </button>
            <button
              className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-black text-xs transition-all duration-300 active:scale-[0.98] cursor-pointer border-none"
              style={{
                background: "linear-gradient(90deg, #FF3D57, #FF7B02)",
                color: "#fff",
                boxShadow: "0 4px 15px rgba(255, 61, 87, 0.25)",
              }}
            >
              <span className="text-sm">🏟️</span> Flip Arena
            </button>
          </div>
        </div>
      )}

      {/* 4. Filter section "Today's Arena" */}
      <div className="px-4 py-3 flex items-center justify-between border-t border-white/[0.05] mt-2">
        <div>
          <h2 className="text-base font-black tracking-tight">Today's Arena</h2>
          <p className="text-[10px] text-white/35 mt-0.5">Official SF360 events · Earn FlipCoins</p>
        </div>
        <div className="flex gap-1.5 bg-white/[0.03] p-1 rounded-xl border border-white/[0.05]">
          {(["all", "quiz", "poll", "battle"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className="px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer"
              style={{
                backgroundColor: filter === tab ? "rgba(255,255,255,0.08)" : "transparent",
                color: filter === tab ? "#fff" : "rgba(255,255,255,0.45)",
              }}
            >
              {tab === "all" ? "All" : tab}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Content Cards Feed */}
      <div className="px-4 space-y-5 mt-2 flex flex-col items-center w-full">
        <AnimatePresence mode="popLayout">
          {/* MOCK CARD 1: FAN BATTLE (Visible in All or Battle) */}
          {(filter === "all" || filter === "battle") && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="w-full max-w-lg bg-[#0e111a] border-l-2 border-[#FF3D57] border-y border-r border-white/[0.06] rounded-2xl overflow-hidden p-4 shadow-xl"
            >
              <div className="flex items-center justify-between text-[9px] font-black text-white/40 mb-3 uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#FF3D57]">⚔️ FAN BATTLE</span>
                  <span>•</span>
                  <span className="text-[#FF7B02] flex items-center gap-0.5">
                    🔥 TRENDING
                  </span>
                </div>
                <span>10:00 AM</span>
              </div>

              <h3 className="text-sm font-black mb-4">Fan Battle - Who wins your vote?</h3>

              <div className="grid grid-cols-7 items-center gap-3 mb-4">
                <button
                  onClick={() => !fanBattleVote && setFanBattleVote("left")}
                  className={`col-span-3 rounded-xl p-3 border transition-all ${
                    fanBattleVote === "left"
                      ? "bg-[#FF3D57]/10 border-[#FF3D57] shadow-[0_0_15px_rgba(255,61,87,0.1)]"
                      : fanBattleVote === "right"
                      ? "opacity-40 border-white/[0.04]"
                      : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]"
                  }`}
                >
                  <span className="text-2xl font-black block">🇮🇳 IN</span>
                  <span className="text-xs font-black block mt-2 text-white">Virat Kohli</span>
                  <span className="text-[9px] text-white/40 block mt-1 font-semibold">Avg 89.8 in Tests</span>
                  {fanBattleVote && (
                    <span className="text-xs font-black block mt-2 text-[#FF3D57]">72% Voted</span>
                  )}
                </button>

                <div className="col-span-1 flex items-center justify-center">
                  <span className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.1] text-[10px] font-black text-white/50 flex items-center justify-center">
                    VS
                  </span>
                </div>

                <button
                  onClick={() => !fanBattleVote && setFanBattleVote("right")}
                  className={`col-span-3 rounded-xl p-3 border transition-all ${
                    fanBattleVote === "right"
                      ? "bg-[#FF7B02]/10 border-[#FF7B02] shadow-[0_0_15px_rgba(255,123,2,0.1)]"
                      : fanBattleVote === "left"
                      ? "opacity-40 border-white/[0.04]"
                      : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]"
                  }`}
                >
                  <span className="text-2xl font-black block">🇵🇰 PK</span>
                  <span className="text-xs font-black block mt-2 text-white">Babar Azam</span>
                  <span className="text-[9px] text-white/40 block mt-1 font-semibold">Avg 44.8 in Tests</span>
                  {fanBattleVote && (
                    <span className="text-xs font-black block mt-2 text-[#FF7B02]">28% Voted</span>
                  )}
                </button>
              </div>

              <button className="w-full py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] font-black text-xs flex items-center justify-center gap-2 active:scale-[0.99] transition-all cursor-pointer">
                <span>🫱🏼‍🫲🏾</span> Challenge a Friend
              </button>

              <div className="flex items-center justify-between text-[11px] text-white/45 mt-4 pt-3 border-t border-white/[0.04] font-bold">
                <div className="flex gap-4">
                  <button
                    onClick={() => handleLike("battle")}
                    className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                      liked.battle ? "text-[#FF3D57]" : "hover:text-white"
                    }`}
                  >
                    <Heart size={13} fill={liked.battle ? "currentColor" : "none"} />
                    <span>{likes.battle.toLocaleString()}</span>
                  </button>
                  <button className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
                    <Share2 size={13} />
                    <span>Share</span>
                  </button>
                </div>
                <span>2,852 engaged</span>
              </div>
            </motion.div>
          )}

          {/* MOCK CARD 2: QUIZ (Visible in All or Quiz) */}
          {(filter === "all" || filter === "quiz") && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="w-full max-w-lg bg-[#0e111a] border-l-2 border-purple-500 border-y border-r border-white/[0.06] rounded-2xl overflow-hidden p-4 shadow-xl"
            >
              <div className="flex items-center justify-between text-[9px] font-black text-white/40 mb-3 tracking-wider">
                <div className="flex items-center gap-1.5 uppercase">
                  <span className="text-purple-500">💬 QUIZ</span>
                  <span>•</span>
                  <span className="text-amber-400">⭐ 50 PTS</span>
                </div>
                <span>11:00 AM</span>
              </div>

              <h3 className="text-sm font-black mb-1">Quick Cricket Quiz</h3>
              <p className="text-xs font-semibold text-white/60 mb-4">
                How many Test centuries has Virat Kohli scored?
              </p>

              <div className="grid grid-cols-2 gap-3.5 mb-4">
                {["A 27", "B 29", "C 30", "D 32"].map((opt) => {
                  const letter = opt.charAt(0);
                  const isCorrect = letter === "C";
                  const isSelected = quizSelected === letter;
                  const isAnySelected = quizSelected !== null;

                  let cardStyle = "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]";
                  if (isAnySelected) {
                    if (isCorrect) {
                      cardStyle = "bg-emerald-500/10 border-emerald-500 text-emerald-400";
                    } else if (isSelected) {
                      cardStyle = "bg-red-500/10 border-red-500 text-red-400";
                    } else {
                      cardStyle = "opacity-40 border-white/[0.04]";
                    }
                  }

                  return (
                    <button
                      key={letter}
                      onClick={() => !isAnySelected && setQuizSelected(letter)}
                      className={`rounded-xl p-3 border font-extrabold text-xs text-left transition-all cursor-pointer ${cardStyle}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {quizSelected && (
                <div className="text-[11px] font-black text-center text-white/50">
                  {quizSelected === "C" ? (
                    <span className="text-emerald-400">🎉 Correct! You earned 50 PTS!</span>
                  ) : (
                    <span className="text-red-400">❌ Incorrect. Correct answer is C (30)</span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-white/45 mt-4 pt-3 border-t border-white/[0.04] font-bold">
                <div className="flex gap-4">
                  <button
                    onClick={() => handleLike("quiz")}
                    className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                      liked.quiz ? "text-[#FF3D57]" : "hover:text-white"
                    }`}
                  >
                    <Heart size={13} fill={liked.quiz ? "currentColor" : "none"} />
                    <span>{likes.quiz}</span>
                  </button>
                  <button className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
                    <Share2 size={13} />
                    <span>Share</span>
                  </button>
                </div>
                <span>2,180 engaged</span>
              </div>
            </motion.div>
          )}

          {/* MOCK CARD 3: POLL (Visible in All or Poll) */}
          {(filter === "all" || filter === "poll") && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="w-full max-w-lg bg-[#0e111a] border-l-2 border-blue-500 border-y border-r border-white/[0.06] rounded-2xl overflow-hidden p-4 shadow-xl"
            >
              <div className="flex items-center justify-between text-[9px] font-black text-white/40 mb-3 tracking-wider">
                <span className="text-blue-500 uppercase">🗳️ POLL</span>
                <span>11:30 AM</span>
              </div>

              <h3 className="text-sm font-black mb-4">Who takes more wickets in Galle?</h3>

              <div className="space-y-3 mb-4">
                {[
                  { id: "bumrah", label: "Jasprit Bumrah ☄️", percent: 64 },
                  { id: "theekshana", label: "Maheesh Theekshana 🌀", percent: 18 },
                  { id: "jadeja", label: "Ravindra Jadeja 🪙", percent: 18 },
                ].map((opt) => {
                  const isSelected = pollVote === opt.id;
                  const isAnySelected = pollVote !== null;

                  return (
                    <button
                      key={opt.id}
                      onClick={() => !isAnySelected && setPollVote(opt.id)}
                      className="w-full relative rounded-xl border border-white/[0.06] overflow-hidden p-3.5 flex items-center justify-between text-xs font-extrabold text-left transition-all bg-white/[0.01] hover:bg-white/[0.03] active:scale-[0.99] cursor-pointer"
                    >
                      {/* Percent Fill Bar */}
                      {isAnySelected && (
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${opt.percent}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          className={`absolute left-0 top-0 bottom-0 z-0 ${
                            isSelected ? "bg-blue-500/10" : "bg-white/[0.03]"
                          }`}
                        />
                      )}
                      <span className="relative z-10">{opt.label}</span>
                      {isAnySelected && (
                        <span className="relative z-10 text-[11px] font-black">
                          {opt.percent}% {isSelected && "✓"}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] text-white/45 mt-4 pt-3 border-t border-white/[0.04] font-bold">
                <div className="flex gap-4">
                  <button
                    onClick={() => handleLike("poll")}
                    className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                      liked.poll ? "text-[#FF3D57]" : "hover:text-white"
                    }`}
                  >
                    <Heart size={13} fill={liked.poll ? "currentColor" : "none"} />
                    <span>{likes.poll.toLocaleString()}</span>
                  </button>
                  <button className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
                    <Share2 size={13} />
                    <span>Share</span>
                  </button>
                </div>
                <span>8,268 engaged</span>
              </div>
            </motion.div>
          )}

          {/* MOCK CARD 4: PREDICTION (Visible in All or Poll) */}
          {(filter === "all" || filter === "poll") && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="w-full max-w-lg bg-[#0e111a] border-l-2 border-amber-500 border-y border-r border-white/[0.06] rounded-2xl overflow-hidden p-4 shadow-xl"
            >
              <div className="flex items-center justify-between text-[9px] font-black text-white/40 mb-3 tracking-wider">
                <div className="flex items-center gap-1.5 uppercase">
                  <span className="text-amber-500">🔮 PREDICTION</span>
                  <span>•</span>
                  <span className="text-indigo-400">🪙 POINTS</span>
                </div>
                <span>11:58 AM</span>
              </div>

              <h3 className="text-sm font-black mb-1">Predict the outcome!</h3>
              <p className="text-xs font-semibold text-white/60 mb-4">India win the 1st Galle Test?</p>

              <div className="grid grid-cols-2 gap-3.5 mb-4">
                {[
                  { id: "win", label: "Yes, India win", multi: "2X" },
                  { id: "sl_draw", label: "SL hold / win", multi: "5X" },
                ].map((opt) => {
                  const isSelected = predictionVote === opt.id;
                  const isAnySelected = predictionVote !== null;

                  return (
                    <button
                      key={opt.id}
                      onClick={() => !isAnySelected && setPredictionVote(opt.id)}
                      className={`rounded-xl p-4 border flex flex-col items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? "bg-amber-500/10 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)] text-amber-400"
                          : isAnySelected
                          ? "opacity-40 border-white/[0.04]"
                          : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]"
                      }`}
                    >
                      <span className="text-xs font-black">{opt.label}</span>
                      <span className="text-[10px] font-black mt-1 text-white/50">{opt.multi} multiplier</span>
                    </button>
                  );
                })}
              </div>

              {predictionVote && (
                <div className="text-[11px] font-black text-center text-amber-400">
                  ⚡ Prediction locked! Good luck!
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-white/45 mt-4 pt-3 border-t border-white/[0.04] font-bold">
                <div className="flex gap-4">
                  <button
                    onClick={() => handleLike("pred")}
                    className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                      liked.pred ? "text-[#FF3D57]" : "hover:text-white"
                    }`}
                  >
                    <Heart size={13} fill={liked.pred ? "currentColor" : "none"} />
                    <span>{likes.pred}</span>
                  </button>
                  <button className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
                    <Share2 size={13} />
                    <span>Share</span>
                  </button>
                </div>
                <span>1,920 engaged</span>
              </div>
            </motion.div>
          )}

          {/* MOCK CARD 5: CONTEST (Visible in All or Battle) */}
          {(filter === "all" || filter === "battle") && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="w-full max-w-lg bg-[#0e111a] border-l-2 border-emerald-500 border-y border-r border-white/[0.06] rounded-2xl overflow-hidden p-4 shadow-xl"
            >
              <div className="flex items-center justify-between text-[9px] font-black text-white/40 mb-3 tracking-wider">
                <div className="flex items-center gap-1.5 uppercase">
                  <span className="text-emerald-500">🏆 CONTEST</span>
                  <span>•</span>
                  <span className="text-yellow-400">🎁 WIN</span>
                </div>
                <span>12:00 PM</span>
              </div>

              <h3 className="text-sm font-black mb-4">SF360 Superfan Contest</h3>

              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.02] p-4 mb-4">
                <div className="flex items-center gap-2 text-xs font-black text-emerald-400">
                  <span>🏆</span> SF360 Jersey + 1000 FlipCoins
                </div>
                <p className="text-[11px] text-white/60 mt-2 font-medium leading-relaxed">
                  Caption the epic Kohli cover drive and win! Best caption wins a signed SF360 jersey + coins.
                </p>
                <div className="text-[9px] text-white/40 font-bold mt-3">
                  ⏳ Today 11 PM IST
                </div>
              </div>

              <button
                onClick={() => setContestEntered(true)}
                className={`w-full py-3 rounded-xl font-black text-xs active:scale-[0.99] transition-all cursor-pointer ${
                  contestEntered
                    ? "bg-emerald-500/20 border border-emerald-500 text-emerald-400"
                    : "bg-emerald-500 hover:bg-emerald-400 text-[#070b14] shadow-[0_4px_15px_rgba(16,185,129,0.2)]"
                }`}
              >
                {contestEntered ? "Entered! ✓" : "Enter Contest →"}
              </button>
            </motion.div>
          )}

          {/* 6. Active Interactive Components Integration Section */}
          {!isPreview && (
            <div className="w-full max-w-lg mt-8 pt-8 border-t border-white/[0.08] space-y-8 flex flex-col items-center">
              {/* Polls Components (Active in Polls filter) */}
              {(filter === "all" || filter === "poll") && (
                <div className="w-full space-y-4">
                  <div className="flex items-center gap-2 px-2">
                    <Trophy size={16} className="text-blue-400" />
                    <h3 className="text-sm font-black text-white/90">Live Polls</h3>
                  </div>
                  <div className="rounded-2xl border border-white/[0.06] bg-[#0c0d14] overflow-hidden p-4">
                    <PollsSection />
                  </div>

                  <div className="flex items-center gap-2 px-2 mt-6">
                    <Sparkles size={16} className="text-amber-400" />
                    <h3 className="text-sm font-black text-white/90">Match Predictions</h3>
                  </div>
                  <div className="w-full space-y-4">
                    {loadingPolls ? (
                      <div className="py-8 flex justify-center text-xs font-bold text-white/40 animate-pulse">
                        Loading prediction match data...
                      </div>
                    ) : Object.keys(matchGroups).length === 0 ? (
                      <div className="py-8 text-center text-xs font-bold text-white/30 border border-white/[0.06] rounded-2xl bg-[#0c0d14]">
                        No active predictions at the moment
                      </div>
                    ) : (
                      Object.entries(matchGroups).map(([matchId, matchPolls]) => (
                        <div key={matchId} className="w-full">
                          <PredictionCard
                            polls={matchPolls}
                            matchTitle={matchPolls[0]?.matchId ? `Predictions: ${matchPolls[0].matchId}` : "Predictions"}
                            matchSubtitle={`${matchPolls.length} prediction${matchPolls.length > 1 ? "s" : ""} available`}
                            isLive
                            userId={user?.userId}
                            onVote={castVote}
                          />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* FanBattle & Challenges Components (Active in Battle filter) */}
              {(filter === "all" || filter === "battle") && (
                <div className="w-full space-y-6">
                  <div className="flex items-center gap-2 px-2">
                    <span className="text-[#FF3D57]">⚔️</span>
                    <h3 className="text-sm font-black text-white/90">Fan Battle Arena</h3>
                  </div>
                  <div className="rounded-2xl border border-white/[0.06] bg-[#0c0d14] overflow-hidden p-4">
                    <FanBattleCard />
                  </div>

                  <div className="flex items-center gap-2 px-2 mt-6">
                    <Trophy size={16} className="text-emerald-400" />
                    <h3 className="text-sm font-black text-white/90">Active Challenges</h3>
                  </div>
                  <div className="rounded-2xl border border-white/[0.06] bg-[#0c0d14] overflow-hidden p-4">
                    <ChallengesSection />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* View Full Flip Arena button in Preview mode */}
          {isPreview && (
            <div className="w-full max-w-lg mt-4 px-2">
              <button
                onClick={() => window.location.href = "/MainModules/FlipArena"}
                className="w-full py-[11px] rounded-[14px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <span style={{ fontSize: 11.5, fontWeight: 800, color: 'rgba(255,255,255,0.55)' }}>View Full Flip Arena</span>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
