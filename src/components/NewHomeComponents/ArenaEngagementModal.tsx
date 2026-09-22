"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  HelpCircle,
  Swords,
  BarChart2,
  Target,
  Plus,
  Trash2,
  Sparkles,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { engagementService } from "@/services/engagement.service";
import { EngagementItem, EngagementType } from "@/types/engagements";

export interface UserQuizQuestion {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOptionId: "A" | "B" | "C" | "D";
  pointsReward: number;
  explanation: string;
}

export interface ArenaEngagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: EngagementType;
  editingItem?: EngagementItem | null;
  onSaved?: (item: EngagementItem, isEdit: boolean) => void;
  onToast?: (msg: string) => void;
}

export default function ArenaEngagementModal({
  isOpen,
  onClose,
  initialType = "quiz",
  editingItem = null,
  onSaved,
  onToast,
}: ArenaEngagementModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeType, setActiveType] = useState<EngagementType>(initialType);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Common Fields
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [sport, setSport] = useState("cricket");

  // Fan Battle Fields
  const [fbLeftCode, setFbLeftCode] = useState("IN");
  const [fbLeftName, setFbLeftName] = useState("");
  const [fbLeftStat, setFbLeftStat] = useState("");
  const [fbRightCode, setFbRightCode] = useState("PK");
  const [fbRightName, setFbRightName] = useState("");
  const [fbRightStat, setFbRightStat] = useState("");

  // Quiz Fields
  const [quizStartTime, setQuizStartTime] = useState("");
  const [quizFrequencyMinutes, setQuizFrequencyMinutes] = useState(10);
  const [quizQuestions, setQuizQuestions] = useState<UserQuizQuestion[]>([
    {
      id: "q_1",
      question: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctOptionId: "A",
      pointsReward: 50,
      explanation: "",
    },
  ]);

  // Poll Fields
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);

  // Prediction Fields (Commented out)
  // const [predQuestion, setPredQuestion] = useState("");
  // const [predLeftText, setPredLeftText] = useState("");
  // const [predLeftCode, setPredLeftCode] = useState("IN");
  // const [predRightText, setPredRightText] = useState("");
  // const [predRightCode, setPredRightCode] = useState("PK");
  // const [predCoinStake, setPredCoinStake] = useState(25);

  // Initialize or prefill state
  useEffect(() => {
    if (editingItem) {
      setActiveType(editingItem.type);
      setTitle(editingItem.title || "");
      setSubtitle(editingItem.subtitle || "");
      setSport(editingItem.sport || "cricket");

      if (editingItem.type === "fan_battle" && editingItem.fanBattleData) {
        setFbLeftCode(editingItem.fanBattleData.leftCompetitor.code || "IN");
        setFbLeftName(editingItem.fanBattleData.leftCompetitor.name || "");
        setFbLeftStat(editingItem.fanBattleData.leftCompetitor.stat || "");
        setFbRightCode(editingItem.fanBattleData.rightCompetitor.code || "PK");
        setFbRightName(editingItem.fanBattleData.rightCompetitor.name || "");
        setFbRightStat(editingItem.fanBattleData.rightCompetitor.stat || "");
      } else if (editingItem.type === "quiz" && editingItem.quizData) {
        if (editingItem.quizData.startTime || editingItem.quizData.scheduledStartTime) {
          try {
            const d = new Date(Number(editingItem.quizData.startTime || editingItem.quizData.scheduledStartTime));
            const pad = (n: number) => String(n).padStart(2, "0");
            setQuizStartTime(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
          } catch {
            setQuizStartTime("");
          }
        }
        setQuizFrequencyMinutes(editingItem.quizData.frequencyMinutes || 10);
        if (editingItem.quizData.questions && editingItem.quizData.questions.length > 0) {
          setQuizQuestions(
            editingItem.quizData.questions.map((q, idx) => ({
              id: q.id || `q_${idx + 1}`,
              question: q.question || "",
              optionA: q.options?.[0]?.text || "",
              optionB: q.options?.[1]?.text || "",
              optionC: q.options?.[2]?.text || "",
              optionD: q.options?.[3]?.text || "",
              correctOptionId: (q.correctOptionId as any) || "A",
              pointsReward: q.pointsReward || 50,
              explanation: q.explanation || "",
            }))
          );
        } else {
          setQuizQuestions([
            {
              id: "q_1",
              question: editingItem.quizData.question || editingItem.title || "",
              optionA: editingItem.quizData.options?.[0]?.text || "",
              optionB: editingItem.quizData.options?.[1]?.text || "",
              optionC: editingItem.quizData.options?.[2]?.text || "",
              optionD: editingItem.quizData.options?.[3]?.text || "",
              correctOptionId: (editingItem.quizData.correctOptionId as any) || "A",
              pointsReward: editingItem.quizData.pointsReward || 50,
              explanation: editingItem.quizData.explanation || "",
            },
          ]);
        }
      } else if (editingItem.type === "poll" && editingItem.pollData) {
        setPollQuestion(editingItem.pollData.question || editingItem.title || "");
        setPollOptions(
          editingItem.pollData.options?.length
            ? editingItem.pollData.options.map((o) => o.text)
            : ["", ""]
        );
      // } else if (editingItem.type === "prediction" && editingItem.predictionData) {
      //   setPredQuestion(editingItem.predictionData.question || editingItem.title || "");
      //   setPredLeftText(editingItem.predictionData.leftChoice?.text || "");
      //   setPredLeftCode(editingItem.predictionData.leftChoice?.code || "IN");
      //   setPredRightText(editingItem.predictionData.rightChoice?.text || "");
      //   setPredRightCode(editingItem.predictionData.rightChoice?.code || "PK");
      //   setPredCoinStake(editingItem.predictionData.coinStake || 25);
      }
    } else {
      setActiveType(initialType);
      setTitle("");
      setSubtitle("");
      setSport("cricket");
      setFbLeftName("");
      setFbLeftStat("");
      setFbRightName("");
      setFbRightStat("");
      setQuizStartTime("");
      setQuizFrequencyMinutes(10);
      setQuizQuestions([
        {
          id: "q_1",
          question: "",
          optionA: "",
          optionB: "",
          optionC: "",
          optionD: "",
          correctOptionId: "A",
          pointsReward: 50,
          explanation: "",
        },
      ]);
      setPollQuestion("");
      setPollOptions(["", ""]);
      // setPredQuestion("");
      // setPredLeftText("");
      // setPredRightText("");
      // setPredCoinStake(25);
    }
  }, [editingItem, initialType, isOpen]);

  // Quiz helper functions
  const handleAddQuizQuestion = () => {
    setQuizQuestions((prev) => [
      ...prev,
      {
        id: `q_${Date.now()}_${prev.length + 1}`,
        question: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctOptionId: "A",
        pointsReward: 50,
        explanation: "",
      },
    ]);
  };

  const handleRemoveQuizQuestion = (index: number) => {
    if (quizQuestions.length <= 1) {
      if (onToast) onToast("At least one quiz question is required.");
      return;
    }
    setQuizQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateQuizQuestion = (index: number, field: keyof UserQuizQuestion, val: any) => {
    setQuizQuestions((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const notifyUser = (msg: string) => {
    if (onToast) {
      onToast(msg);
    } else if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("sf360:new-notification", {
          detail: { title: msg },
        })
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let finalTitle = title.trim();
      if (!finalTitle) {
        if (activeType === "quiz") finalTitle = quizQuestions[0]?.question.trim() || "Live Cricket Quiz";
        else if (activeType === "fan_battle") finalTitle = `${fbLeftName || "Player 1"} vs ${fbRightName || "Player 2"} · Vote Now!`;
        else if (activeType === "poll") finalTitle = pollQuestion.trim() || "Live Fan Poll";
        // else if (activeType === "prediction") finalTitle = predQuestion.trim() || "Live Match Prediction";
      }

      let payload: any = {
        type: activeType,
        title: finalTitle,
        subtitle: subtitle.trim(),
        sport: sport.toLowerCase(),
        status: "active",
      };

      if (activeType === "fan_battle") {
        if (!fbLeftName.trim() || !fbRightName.trim()) {
          notifyUser("Please provide names for both competitors.");
          setSubmitting(false);
          return;
        }
        payload.tags = ["⚔️ FAN BATTLE", "🔥 TRENDING"];
        payload.fanBattleData = {
          leftCompetitor: {
            code: fbLeftCode.trim() || "IN",
            name: fbLeftName.trim(),
            stat: fbLeftStat.trim() || "Top Contender",
            votes: editingItem?.fanBattleData?.leftCompetitor?.votes || 0,
          },
          rightCompetitor: {
            code: fbRightCode.trim() || "PK",
            name: fbRightName.trim(),
            stat: fbRightStat.trim() || "Top Contender",
            votes: editingItem?.fanBattleData?.rightCompetitor?.votes || 0,
          },
          totalVotes: editingItem?.fanBattleData?.totalVotes || 0,
        };
      } else if (activeType === "quiz") {
        const validQuestions = quizQuestions.filter((q) => q.question.trim());
        if (validQuestions.length === 0) {
          notifyUser("Please add at least one question with text.");
          setSubmitting(false);
          return;
        }

        const startMs = quizStartTime ? new Date(quizStartTime).getTime() : Date.now();
        const formattedQuestions = validQuestions.map((q, idx) => ({
          id: q.id || `q_${idx + 1}`,
          question: q.question.trim(),
          options: [
            { id: "A", text: q.optionA.trim() || "Option A" },
            { id: "B", text: q.optionB.trim() || "Option B" },
            { id: "C", text: q.optionC.trim() || "Option C" },
            { id: "D", text: q.optionD.trim() || "Option D" },
          ],
          correctOptionId: q.correctOptionId || "A",
          pointsReward: Number(q.pointsReward) || 50,
          explanation: q.explanation.trim(),
        }));

        payload.tags = [
          "🧠 QUIZ",
          `⭐ ${formattedQuestions[0]?.pointsReward || 50} PTS/Q`,
          `⏱️ ${quizFrequencyMinutes}m`,
        ];

        payload.quizData = {
          startTime: startMs,
          scheduledStartTime: startMs,
          frequencyMinutes: Number(quizFrequencyMinutes) || 10,
          questions: formattedQuestions,
          question: formattedQuestions[0]?.question || finalTitle,
          options: formattedQuestions[0]?.options || [],
          correctOptionId: formattedQuestions[0]?.correctOptionId || "A",
          pointsReward: Number(formattedQuestions[0]?.pointsReward) || 50,
          explanation: formattedQuestions[0]?.explanation || "",
        };
      } else if (activeType === "poll") {
        const validOptions = pollOptions.filter((o) => o.trim());
        if (!pollQuestion.trim()) {
          notifyUser("Please enter a poll question.");
          setSubmitting(false);
          return;
        }
        if (validOptions.length < 2) {
          notifyUser("Please provide at least 2 options.");
          setSubmitting(false);
          return;
        }
        payload.tags = ["📊 POLL"];
        payload.pollData = {
          question: pollQuestion.trim(),
          options: validOptions.map((optText, idx) => ({
            id: String(idx + 1),
            text: optText.trim(),
            votes: editingItem?.pollData?.options?.[idx]?.votes || 0,
          })),
          totalVotes: editingItem?.pollData?.totalVotes || 0,
        };
      // } else if (activeType === "prediction") {
      //   if (!predQuestion.trim() || !predLeftText.trim() || !predRightText.trim()) {
      //     notifyUser("Please fill in the question and both prediction choices.");
      //     setSubmitting(false);
      //     return;
      //   }
      //   payload.tags = ["🎯 PREDICTION", "💎 POINTS"];
      //   payload.predictionData = {
      //     question: predQuestion.trim(),
      //     leftChoice: {
      //       id: "left",
      //       text: predLeftText.trim(),
      //       code: predLeftCode.trim() || "IN",
      //       votes: editingItem?.predictionData?.leftChoice?.votes || 0,
      //     },
      //     rightChoice: {
      //       id: "right",
      //       text: predRightText.trim(),
      //       code: predRightCode.trim() || "PK",
      //       votes: editingItem?.predictionData?.rightChoice?.votes || 0,
      //     },
      //     coinStake: Number(predCoinStake) || 25,
      //     totalVotes: editingItem?.predictionData?.totalVotes || 0,
      //     status: "open",
      //   };
      }

      if (editingItem) {
        const res = await engagementService.updateEngagement(editingItem.id, payload);
        const updatedItem = res.engagement || { ...editingItem, ...payload };
        if (onSaved) onSaved(updatedItem, true);
        notifyUser("Arena Event updated successfully! ✨");
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("arena-engagement-created", {
              detail: { item: updatedItem, isEdit: true },
            })
          );
        }
      } else {
        const res = await engagementService.createEngagement(payload);
        const createdItem = res.engagement;
        if (onSaved) onSaved(createdItem, false);
        notifyUser("Event published to Flip Arena! 🚀");
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("arena-engagement-created", {
              detail: { item: createdItem, isEdit: false },
            })
          );
        }
      }
      onClose();
    } catch (err: any) {
      notifyUser(err.message || "Failed to save event. Please check inputs.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !mounted) return null;

  const inputStyle =
    "w-full bg-[#121622] border border-white/10 focus:border-purple-500/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 outline-none transition-all";
  const labelStyle = "block text-[11px] font-bold text-white/70 mb-1.5 uppercase tracking-wider";

  return createPortal(
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[100000] flex items-center justify-center p-2.5 sm:p-4 pt-[max(0.625rem,env(safe-area-inset-top))] pb-[max(0.625rem,env(safe-area-inset-bottom))] bg-black/85 backdrop-blur-md overflow-hidden"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          className="w-full max-w-xl bg-[#0d111a] border border-white/10 rounded-2xl sm:rounded-3xl shadow-[0_10px_50px_rgba(0,0,0,0.85)] h-[90dvh] max-h-[760px] flex flex-col text-white overflow-hidden my-auto"
        >
          {/* Modal Header & Tabs - Pinned at top, never cut off */}
          <div className="p-3.5 sm:p-5 pb-3 border-b border-white/[0.08] shrink-0 bg-[#0d111a]">
            <div className="flex items-center justify-between mb-2.5 sm:mb-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="p-1.5 sm:p-2 rounded-xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-400 border border-pink-500/30 shrink-0">
                  {activeType === "quiz" ? (
                    <HelpCircle size={16} className="sm:w-[18px] sm:h-[18px]" />
                  ) : activeType === "fan_battle" ? (
                    <Swords size={16} className="sm:w-[18px] sm:h-[18px]" />
                  ) : (
                    <BarChart2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                  )}
                </span>
                <div className="min-w-0">
                  <h2 className="text-sm sm:text-base font-black tracking-tight truncate">
                    {editingItem ? "Edit Arena Event" : "Create Arena Event"}
                  </h2>
                  <p className="text-[10px] text-white/40 truncate">
                    {editingItem ? "Update quiz questions, battles or polls" : "Engage fans with live quizzes, battles & polls"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0 ml-2"
              >
                <X size={16} />
              </button>
            </div>

            {/* Type Selector Tabs (Disabled if editing existing item) */}
            {!editingItem && (
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl sm:rounded-2xl">
                {[
                  { type: "quiz", label: "Quiz", icon: "🧠" },
                  { type: "fan_battle", label: "Battle", icon: "⚔️" },
                  { type: "poll", label: "Poll", icon: "📊" },
                ].map((tab) => (
                  <button
                    key={tab.type}
                    type="button"
                    onClick={() => setActiveType(tab.type as EngagementType)}
                    className={`py-1.5 sm:py-2 px-1 rounded-lg sm:rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      activeType === tab.type
                        ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/20"
                        : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Form with scrollable body & pinned footer */}
          <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col overflow-hidden">
            {/* Scrollable Form Body */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs overscroll-contain">
            {/* Common Header Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
              <div className="sm:col-span-2">
                <label className={labelStyle}>Event Title / Headline</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    activeType === "quiz"
                      ? "e.g. Test Cricket Century Masters"
                      : activeType === "fan_battle"
                      ? "e.g. Virat Kohli vs Babar Azam"
                      : "e.g. Best Spinner in Galle?"
                  }
                  className={inputStyle}
                  required
                />
              </div>

              <div>
                <label className={labelStyle}>Sport</label>
                <select
                  value={sport}
                  onChange={(e) => setSport(e.target.value)}
                  className={`${inputStyle} cursor-pointer`}
                >
                  <option value="cricket" className="bg-[#121622]">🏏 Cricket</option>
                  <option value="football" className="bg-[#121622]">⚽ Football</option>
                  <option value="basketball" className="bg-[#121622]">🏀 Basketball</option>
                  <option value="tennis" className="bg-[#121622]">🎾 Tennis</option>
                  <option value="f1" className="bg-[#121622]">🏎️ Formula 1</option>
                  <option value="athletics" className="bg-[#121622]">🏃 Athletics</option>
                  <option value="general" className="bg-[#121622]">🌐 General</option>
                </select>
              </div>
            </div>

            {/* ─── QUIZ FORM TAB ─── */}
            {activeType === "quiz" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  <div>
                    <label className={labelStyle}>Schedule Start Time (Optional)</label>
                    <input
                      type="datetime-local"
                      value={quizStartTime}
                      onChange={(e) => setQuizStartTime(e.target.value)}
                      className={inputStyle}
                    />
                  </div>

                  <div>
                    <label className={labelStyle}>Frequency / Interval</label>
                    <select
                      value={quizFrequencyMinutes}
                      onChange={(e) => setQuizFrequencyMinutes(Number(e.target.value))}
                      className={`${inputStyle} cursor-pointer`}
                    >
                      <option value={5} className="bg-[#121622]">⚡ Every 5 mins</option>
                      <option value={10} className="bg-[#121622]">⏱️ Every 10 mins</option>
                      <option value={15} className="bg-[#121622]">🕐 Every 15 mins</option>
                      <option value={30} className="bg-[#121622]">⏳ Every 30 mins</option>
                      <option value={60} className="bg-[#121622]">🕒 Every 1 hour</option>
                    </select>
                  </div>
                </div>

                {/* Questions List */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span>🧠</span> Quiz Questions ({quizQuestions.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleAddQuizQuestion}
                      className="px-2.5 py-1 rounded-lg bg-purple-500/20 border border-purple-500/30 hover:bg-purple-500/30 text-purple-300 font-extrabold text-[10px] flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <Plus size={11} /> Add Question
                    </button>
                  </div>

                  {quizQuestions.map((q, qIndex) => (
                    <div
                      key={q.id || qIndex}
                      className="p-3 sm:p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-md">
                          Question #{qIndex + 1}
                        </span>

                        {quizQuestions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveQuizQuestion(qIndex)}
                            className="text-red-400/70 hover:text-red-400 p-1 transition-colors cursor-pointer"
                            title="Remove Question"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>

                      <div>
                        <input
                          type="text"
                          value={q.question}
                          onChange={(e) => handleUpdateQuizQuestion(qIndex, "question", e.target.value)}
                          placeholder="e.g. Who holds the record for the highest individual score in Test cricket?"
                          className={inputStyle}
                          required
                        />
                      </div>

                      {/* 4 Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(["A", "B", "C", "D"] as const).map((letter) => {
                          const optionKey = `option${letter}` as keyof UserQuizQuestion;
                          const isCorrect = q.correctOptionId === letter;
                          return (
                            <div key={letter} className="relative">
                              <span className="absolute left-2.5 top-2.5 text-[10px] font-black text-white/40">
                                {letter}.
                              </span>
                              <input
                                type="text"
                                value={q[optionKey] as string}
                                onChange={(e) => handleUpdateQuizQuestion(qIndex, optionKey, e.target.value)}
                                placeholder={`Option ${letter}`}
                                className={`${inputStyle} pl-7 pr-8 ${
                                  isCorrect ? "border-emerald-500/80 bg-emerald-500/[0.05]" : ""
                                }`}
                                required
                              />
                              <button
                                type="button"
                                onClick={() => handleUpdateQuizQuestion(qIndex, "correctOptionId", letter)}
                                title={`Set ${letter} as correct answer`}
                                className={`absolute right-2 top-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black transition-all cursor-pointer ${
                                  isCorrect
                                    ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/40"
                                    : "bg-white/[0.08] text-white/40 hover:text-white"
                                }`}
                              >
                                {isCorrect ? "✓" : letter}
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-2 items-center">
                        <div className="sm:col-span-1">
                          <label className="text-[9px] font-bold text-white/50 uppercase block mb-1">
                            Reward Points
                          </label>
                          <input
                            type="number"
                            value={q.pointsReward}
                            onChange={(e) => handleUpdateQuizQuestion(qIndex, "pointsReward", Number(e.target.value))}
                            className={inputStyle}
                            min={10}
                            step={10}
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-[9px] font-bold text-white/50 uppercase block mb-1">
                            Explanation / Fun Fact (Optional)
                          </label>
                          <input
                            type="text"
                            value={q.explanation}
                            onChange={(e) => handleUpdateQuizQuestion(qIndex, "explanation", e.target.value)}
                            placeholder="e.g. Brian Lara scored 400* vs England in 2004."
                            className={inputStyle}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── FAN BATTLE FORM TAB ─── */}
            {activeType === "fan_battle" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Left Competitor */}
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-rose-500/[0.03] border border-rose-500/20 space-y-2.5">
                    <span className="text-[10px] font-black text-rose-400 uppercase tracking-wider block">
                      🔴 Competitor 1 (Left)
                    </span>
                    <div>
                      <label className="text-[9px] font-bold text-white/50 block mb-1">Name</label>
                      <input
                        type="text"
                        value={fbLeftName}
                        onChange={(e) => setFbLeftName(e.target.value)}
                        placeholder="e.g. Virat Kohli"
                        className={inputStyle}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-1">
                        <label className="text-[9px] font-bold text-white/50 block mb-1">Code</label>
                        <input
                          type="text"
                          value={fbLeftCode}
                          onChange={(e) => setFbLeftCode(e.target.value.toUpperCase())}
                          placeholder="IN"
                          className={inputStyle}
                          maxLength={5}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[9px] font-bold text-white/50 block mb-1">Key Stat</label>
                        <input
                          type="text"
                          value={fbLeftStat}
                          onChange={(e) => setFbLeftStat(e.target.value)}
                          placeholder="Avg 58.6 in Tests"
                          className={inputStyle}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Competitor */}
                  <div className="p-3 sm:p-3.5 rounded-2xl bg-orange-500/[0.03] border border-orange-500/20 space-y-2.5">
                    <span className="text-[10px] font-black text-orange-400 uppercase tracking-wider block">
                      🟠 Competitor 2 (Right)
                    </span>
                    <div>
                      <label className="text-[9px] font-bold text-white/50 block mb-1">Name</label>
                      <input
                        type="text"
                        value={fbRightName}
                        onChange={(e) => setFbRightName(e.target.value)}
                        placeholder="e.g. Babar Azam"
                        className={inputStyle}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-1">
                        <label className="text-[9px] font-bold text-white/50 block mb-1">Code</label>
                        <input
                          type="text"
                          value={fbRightCode}
                          onChange={(e) => setFbRightCode(e.target.value.toUpperCase())}
                          placeholder="PK"
                          className={inputStyle}
                          maxLength={5}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[9px] font-bold text-white/50 block mb-1">Key Stat</label>
                        <input
                          type="text"
                          value={fbRightStat}
                          onChange={(e) => setFbRightStat(e.target.value)}
                          placeholder="Avg 44.8 in Tests"
                          className={inputStyle}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── POLL FORM TAB ─── */}
            {activeType === "poll" && (
              <div className="space-y-3.5">
                <div>
                  <label className={labelStyle}>Poll Question</label>
                  <input
                    type="text"
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    placeholder="e.g. Which bowler takes the most wickets in this match?"
                    className={inputStyle}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className={labelStyle}>Poll Options ({pollOptions.length})</label>
                    <button
                      type="button"
                      onClick={() => setPollOptions((prev) => [...prev, ""])}
                      className="text-[10px] font-extrabold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={11} /> Add Option
                    </button>
                  </div>

                  {pollOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-white/40 w-4 text-center">
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPollOptions((prev) => prev.map((o, i) => (i === idx ? val : o)));
                        }}
                        placeholder={`Option ${idx + 1}`}
                        className={inputStyle}
                        required
                      />
                      {pollOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => setPollOptions((prev) => prev.filter((_, i) => i !== idx))}
                          className="text-red-400/60 hover:text-red-400 p-1.5 cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── PREDICTION FORM TAB (COMMENTED OUT) ─── */}
            {/* {activeType === "prediction" && (
              <div className="space-y-3.5">
                <div>
                  <label className={labelStyle}>Prediction Question</label>
                  <input
                    type="text"
                    value={predQuestion}
                    onChange={(e) => setPredQuestion(e.target.value)}
                    placeholder="e.g. Will India score 350+ in the first innings?"
                    className={inputStyle}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-amber-500/[0.03] border border-amber-500/20 space-y-2">
                    <span className="text-[10px] font-black text-amber-400 block uppercase">
                      Option A (Left Choice)
                    </span>
                    <input
                      type="text"
                      value={predLeftText}
                      onChange={(e) => setPredLeftText(e.target.value)}
                      placeholder="e.g. Yes, India win"
                      className={inputStyle}
                      required
                    />
                    <input
                      type="text"
                      value={predLeftCode}
                      onChange={(e) => setPredLeftCode(e.target.value.toUpperCase())}
                      placeholder="Code (e.g. IN)"
                      className={inputStyle}
                      maxLength={5}
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-amber-500/[0.03] border border-amber-500/20 space-y-2">
                    <span className="text-[10px] font-black text-amber-400 block uppercase">
                      Option B (Right Choice)
                    </span>
                    <input
                      type="text"
                      value={predRightText}
                      onChange={(e) => setPredRightText(e.target.value)}
                      placeholder="e.g. SL hold / win"
                      className={inputStyle}
                      required
                    />
                    <input
                      type="text"
                      value={predRightCode}
                      onChange={(e) => setPredRightCode(e.target.value.toUpperCase())}
                      placeholder="Code (e.g. LK)"
                      className={inputStyle}
                      maxLength={5}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelStyle}>FlipCoins Stake</label>
                  <div className="flex gap-2">
                    {[10, 25, 50, 100].map((stake) => (
                      <button
                        key={stake}
                        type="button"
                        onClick={() => setPredCoinStake(stake)}
                        className={`flex-1 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                          predCoinStake === stake
                            ? "bg-amber-500/20 border-amber-500 text-amber-400"
                            : "bg-white/[0.02] border-white/10 text-white/60 hover:text-white"
                        }`}
                      >
                        💎 {stake}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )} */}

            </div>

            {/* Pinned Modal Footer / Action Buttons - Always visible at bottom */}
            <div className="p-3 sm:p-4 border-t border-white/[0.08] bg-[#0d111a] shrink-0 flex items-center justify-end gap-2 sm:gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-white/70 hover:text-white font-extrabold text-xs transition-all cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 sm:flex-initial px-5 sm:px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-[#FF7B02] to-purple-600 hover:opacity-95 text-white font-black text-xs transition-all shadow-lg shadow-pink-500/25 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {submitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>{editingItem ? "Update Event" : "Publish to Arena"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
