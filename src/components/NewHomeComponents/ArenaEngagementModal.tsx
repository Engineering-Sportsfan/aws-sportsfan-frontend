"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  HelpCircle,
  Swords,
  BarChart2,
  Target,
  Flame,
  Image as ImageIcon,
  UploadCloud,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  X,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { engagementService } from "@/services/engagement.service";
import { EngagementItem, EngagementType } from "@/types/engagements";

export interface SportOption {
  id: string;
  name: string;
  slug: string;
  icon: string;
  isActive?: boolean;
}

const DEFAULT_SPORTS: SportOption[] = [
  { id: "cricket", name: "Cricket", slug: "cricket", icon: "🏏" },
  { id: "football", name: "Football", slug: "football", icon: "⚽" },
  { id: "basketball", name: "Basketball", slug: "basketball", icon: "🏀" },
  { id: "tennis", name: "Tennis", slug: "tennis", icon: "🎾" },
  { id: "f1", name: "Formula 1", slug: "f1", icon: "🏎️" },
  { id: "athletics", name: "Athletics", slug: "athletics", icon: "🏃" },
  { id: "general", name: "General", slug: "general", icon: "🌐" },
];

function formatSportItem(rawName?: string, rawSlug?: string): { name: string; slug: string; icon: string } {
  const slug = (rawSlug || "").toLowerCase().trim();
  let name = (rawName || "").trim();

  const looksLikeHash = !name || /^[a-zA-Z0-9_-]{12,}$/.test(name);
  if (looksLikeHash) {
    if (slug && !/^[a-zA-Z0-9_-]{12,}$/.test(slug)) {
      name = slug.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    } else {
      name = "Sport";
    }
  }

  const cleanSlug = slug || name.toLowerCase().replace(/\s+/g, "-");
  const icon = cleanSlug.includes("cricket")
    ? "🏏"
    : cleanSlug.includes("foot") || cleanSlug.includes("soccer")
      ? "⚽"
      : cleanSlug.includes("athletic") || cleanSlug.includes("running")
        ? "🏃"
        : cleanSlug.includes("multi") || cleanSlug.includes("olympic")
          ? "🏆"
          : cleanSlug.includes("basket")
            ? "🏀"
            : cleanSlug.includes("tennis")
              ? "🎾"
              : cleanSlug.includes("f1") || cleanSlug.includes("formula") || cleanSlug.includes("racing") || cleanSlug.includes("motorsport")
                ? "🏎️"
                : "🌐";
  return { name, slug: cleanSlug, icon };
}

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

// ─── Dynamic Points Hook (Synced with Admin Gamification Rules) ─────────────
let cachedPointRules = {
  battle: 2,
  poll: 2,
  quiz: 2,
  prediction: 2,
  meme: 2,
  quizBonus: 10,
  pollBonus: 10,
  predictionBonus: 10,
  create: 2,
};

function useDynamicArenaPoints() {
  const [points, setPoints] = useState(cachedPointRules);
  useEffect(() => {
    axios
      .get("/api/admin/gamification/rules")
      .then((res) => {
        const raw = res.data;
        const rules = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.rules)
            ? raw.rules
            : Array.isArray(raw?.data)
              ? raw.data
              : Array.isArray(raw?.items)
                ? raw.items
                : [];
        if (Array.isArray(rules) && rules.length > 0) {
          const findPts = (ids: string[], fallback: number) => {
            for (const id of ids) {
              const r = rules.find((item: any) =>
                String(item.id || item.actionId || "").toUpperCase() === id.toUpperCase()
              );
              if (r) {
                const rawVal = r.points !== undefined ? r.points : (r.value !== undefined ? r.value : r.amount);
                const parsed = Number(rawVal);
                if (!isNaN(parsed) && parsed > 0) return parsed;
              }
            }
            return fallback;
          };
          const updated = {
            battle: findPts(["ENGAGEMENT_PARTICIPATE_FAN_BATTLE", "ENGAGEMENT_PARTICIPATE_BATTLE"], 2),
            poll: findPts(["ENGAGEMENT_PARTICIPATE_POLL"], 2),
            quiz: findPts(["ENGAGEMENT_PARTICIPATE_QUIZ"], 2),
            prediction: findPts(["ENGAGEMENT_PARTICIPATE_PREDICTION"], 2),
            meme: findPts(["ENGAGEMENT_PARTICIPATE_MEME"], 2),
            quizBonus: findPts(["ENGAGEMENT_ACCURACY_BONUS_QUIZ"], 10),
            pollBonus: findPts(["ENGAGEMENT_ACCURACY_BONUS_POLL", "ENGAGEMENT_WINNING_POLL_BONUS"], 10),
            predictionBonus: findPts(["ENGAGEMENT_ACCURACY_BONUS_PREDICTION", "PREDICTION_ACCURATE"], 10),
            create: findPts(["ENGAGEMENT_CREATE_EVENT", "ENGAGEMENT_CREATE_QUIZ", "ENGAGEMENT_CREATE_POLL", "ENGAGEMENT_CREATE_MEME"], 2),
          };
          cachedPointRules = updated;
          setPoints(updated);
        }
      })
      .catch(() => {});
  }, []);
  return points;
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
  const points = useDynamicArenaPoints();
  const { user } = useAuth();

  // Dynamically resolve authenticated user ID, email, name, and avatar without any hardcoded values
  const resolveCurrentUser = () => {
    let u: any = user;
    if (!u && typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("auth_user");
        if (stored) u = JSON.parse(stored);
      } catch { }
    }
    const resolvedId =
      u?.userId ||
      u?.actualUserId ||
      u?.uid ||
      u?.id ||
      u?.email ||
      "";
    const resolvedEmail = u?.email || u?.userEmail || "";
    const resolvedName =
      u?.name ||
      u?.displayName ||
      u?.userName ||
      (resolvedEmail ? resolvedEmail.split("@")[0] : "SportsFan");
    const resolvedAvatar =
      u?.avatar ||
      u?.photoURL ||
      u?.picture ||
      u?.image ||
      "";

    return {
      userId: resolvedId,
      userEmail: resolvedEmail,
      userName: resolvedName,
      userAvatar: resolvedAvatar,
    };
  };

  const currentUser = resolveCurrentUser();
  const activeUserId = currentUser.userId;
  const userEmail = currentUser.userEmail;
  const userName = currentUser.userName;
  const userAvatar = currentUser.userAvatar;

  const [mounted, setMounted] = useState(false);
  const [activeType, setActiveType] = useState<EngagementType>(initialType);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdSuccess, setCreatedSuccess] = useState<{
    title: string;
    subtitle: string;
    points: number;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Dynamic Sports from Admin API
  const [availableSports, setAvailableSports] = useState<SportOption[]>(DEFAULT_SPORTS);

  useEffect(() => {
    let isSubscribed = true;
    const fetchAdminSports = async () => {
      try {
        const res = await axios.get(`/api/admin/sports`, { timeout: 10000 });
        const rawList: any[] =
          res.data?.sports ??
          res.data?.channels ??
          res.data?.data ??
          (Array.isArray(res.data) ? res.data : []);

        if (Array.isArray(rawList) && rawList.length > 0) {
          const parsed: SportOption[] = rawList
            .map((item: any) => {
              const id = String(item.id || item.channelId || item.sport || item.slug || "")
                .replace(/^SPORT#|^CHANNEL#/, "")
                .toLowerCase();
              const { name, slug, icon } = formatSportItem(
                item.name || item.title || item.sport,
                item.slug || item.id
              );
              return {
                id: id || slug,
                name: item.name || name,
                slug,
                icon: item.icon || icon,
                isActive: item.isActive !== false && item.status !== "inactive",
              };
            })
            .filter((s: SportOption) => s.isActive !== false && Boolean(s.id));

          if (isSubscribed && parsed.length > 0) {
            setAvailableSports(parsed);
          }
        }
      } catch (err) {
        console.error("Failed to fetch admin sports for arena modal:", err);
      }
    };

    fetchAdminSports();
    return () => {
      isSubscribed = false;
    };
  }, []);

  // Common Fields
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [sport, setSport] = useState("cricket");

  // Meme Fields
  const [memeMode, setMemeMode] = useState<"single" | "dual">("single");
  const [memeImageUrl, setMemeImageUrl] = useState("");
  const [memeImageUrlB, setMemeImageUrlB] = useState("");
  const [memeLabelA, setMemeLabelA] = useState("");
  const [memeLabelB, setMemeLabelB] = useState("");

  // ── Image Upload States & Helper ──
  const [uploadingImgA, setUploadingImgA] = useState(false);
  const [uploadingImgB, setUploadingImgB] = useState(false);
  const handleUploadFile = async (file: File, side: "A" | "B" | "single") => {
    if (side === "B") setUploadingImgB(true);
    else setUploadingImgA(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data?.success && data?.url) {
        if (side === "B") {
          setMemeImageUrlB(data.url);
        } else {
          setMemeImageUrl(data.url);
        }
      } else {
        // Fallback to local base64 reader if /api/upload is unavailable
        const reader = new FileReader();
        reader.onload = () => {
          if (side === "B") setMemeImageUrlB(reader.result as string);
          else setMemeImageUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        if (side === "B") setMemeImageUrlB(reader.result as string);
        else setMemeImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      if (side === "B") setUploadingImgB(false);
      else setUploadingImgA(false);
    }
  };

  // Fan Battle Fields
  const [fbLeftCode, setFbLeftCode] = useState("");
  const [fbLeftName, setFbLeftName] = useState("");
  const [fbLeftStat, setFbLeftStat] = useState("");
  const [fbRightCode, setFbRightCode] = useState("");
  const [fbRightName, setFbRightName] = useState("");
  const [fbRightStat, setFbRightStat] = useState("");

  // Quiz Fields
  const [quizStartTime, setQuizStartTime] = useState("");
  const [quizFrequencyMinutes, setQuizFrequencyMinutes] = useState(0);
  const [quizQuestions, setQuizQuestions] = useState<UserQuizQuestion[]>([
    {
      id: "q_1",
      question: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctOptionId: "A",
      pointsReward: points.quizBonus || 10,
      explanation: "",
    },
  ]);

  // Poll Fields
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [pollAnswer, setPollAnswer] = useState("");
  const [pollTimerMinutes, setPollTimerMinutes] = useState(10);

  // Prediction Fields 
  const [predQuestion, setPredQuestion] = useState("");
  const [predLeftText, setPredLeftText] = useState("");
  const [predLeftCode, setPredLeftCode] = useState("");
  const [predRightText, setPredRightText] = useState("");
  const [predRightCode, setPredRightCode] = useState("");
  const [predCoinStake, setPredCoinStake] = useState(25);
  const [predAnswer, setPredAnswer] = useState("");
  const [predTimerMinutes, setPredTimerMinutes] = useState(30);

  // Initialize or prefill state
  const prevIsOpenRef = useRef(false);
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setCreatedSuccess(null);
    }
    prevIsOpenRef.current = isOpen;
    if (!isOpen) {
      setCreatedSuccess(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (editingItem) {
      setActiveType(editingItem.type);
      setTitle(editingItem.title || "");
      setSubtitle(editingItem.subtitle || "");
      setSport(editingItem.sport || "cricket");

      if (editingItem.type === "meme" && editingItem.memeData) {
        const isDual = editingItem.memeData.memeType === "dual" || editingItem.memeData.isDual || Boolean(editingItem.memeData.imageUrlB || (editingItem.memeData as any).memeA);
        setMemeMode(isDual ? "dual" : "single");
        setMemeImageUrl(editingItem.memeData.imageUrlA || editingItem.memeData.imageUrl || "");
        setMemeImageUrlB(editingItem.memeData.imageUrlB || (editingItem.memeData as any).memeB?.imageUrl || "");
        setMemeLabelA((editingItem.memeData as any).memeA?.label || editingItem.memeData.labelA || "Meme A");
        setMemeLabelB((editingItem.memeData as any).memeB?.label || editingItem.memeData.labelB || "Meme B");
        setSubtitle(editingItem.subtitle || editingItem.memeData.caption || "");
      } else if (editingItem.type === "fan_battle" && editingItem.fanBattleData) {
        setFbLeftCode(editingItem.fanBattleData.leftCompetitor?.code || "");
        setFbLeftName(editingItem.fanBattleData.leftCompetitor?.name || "");
        setFbLeftStat(editingItem.fanBattleData.leftCompetitor?.stat || "");
        setFbRightCode(editingItem.fanBattleData.rightCompetitor?.code || "");
        setFbRightName(editingItem.fanBattleData.rightCompetitor?.name || "");
        setFbRightStat(editingItem.fanBattleData.rightCompetitor?.stat || "");
      } else if (editingItem.type === "quiz" && editingItem.quizData) {
        const rawStartTime =
          editingItem.quizData.startTime ||
          editingItem.quizData.scheduledStartTime ||
          (editingItem.quizData as any).postingTime ||
          editingItem.postingTime ||
          editingItem.startTime ||
          editingItem.scheduledStartTime;
        if (rawStartTime) {
          try {
            const d = new Date(Number(rawStartTime));
            const pad = (n: number) => String(n).padStart(2, "0");
            setQuizStartTime(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
          } catch {
            setQuizStartTime("");
          }
        }
        setQuizFrequencyMinutes(
          editingItem.quizData.frequencyMinutes !== undefined && editingItem.quizData.frequencyMinutes !== null
            ? Number(editingItem.quizData.frequencyMinutes)
            : 0
        );
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
              pointsReward: q.pointsReward || points.quizBonus || 10,
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
              pointsReward: points.quizBonus || 10,
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
        setPollAnswer(editingItem.pollData.correctAnswer || editingItem.pollData.answer || "");
        setPollTimerMinutes(editingItem.pollData.durationMinutes || editingItem.pollData.timerMinutes || 10);
      } else if (editingItem.type === "prediction" && editingItem.predictionData) {
        setPredQuestion(editingItem.predictionData.question || editingItem.title || "");
        setPredLeftText(editingItem.predictionData.leftChoice?.text || "");
        setPredLeftCode(editingItem.predictionData.leftChoice?.code || "");
        setPredRightText(editingItem.predictionData.rightChoice?.text || "");
        setPredRightCode(editingItem.predictionData.rightChoice?.code || "");
        setPredCoinStake(editingItem.predictionData.coinStake || 25);
        setPredAnswer(editingItem.predictionData.correctAnswer || editingItem.predictionData.answer || editingItem.predictionData.winningChoiceId || "");
        setPredTimerMinutes(editingItem.predictionData.durationMinutes || editingItem.predictionData.timerMinutes || 30);
      }
    } else {
      setErrorMessage(null);
      setActiveType(initialType);
      setTitle("");
      setSubtitle("");
      setSport("cricket");
      setMemeMode("single");
      setMemeImageUrl("");
      setMemeImageUrlB("");
      setMemeLabelA("");
      setMemeLabelB("");
      setFbLeftName("");
      setFbLeftStat("");
      setFbRightName("");
      setFbRightStat("");
      setQuizStartTime("");
      setQuizFrequencyMinutes(0);
      setQuizQuestions([
        {
          id: "q_1",
          question: "",
          optionA: "",
          optionB: "",
          optionC: "",
          optionD: "",
          correctOptionId: "A",
          pointsReward: points.quizBonus || 10,
          explanation: "",
        },
      ]);
      setPollQuestion("");
      setPollOptions(["", ""]);
      setPollAnswer("");
      setPollTimerMinutes(10);
      setPredQuestion("");
      setPredLeftText("");
      setPredLeftCode("");
      setPredRightText("");
      setPredRightCode("");
      setPredCoinStake(25);
      setPredAnswer("");
      setPredTimerMinutes(30);
    }
  }, [editingItem, initialType, isOpen, points.quizBonus]);

  const handleAddQuestion = () => {
    setQuizQuestions((prev) => [
      ...prev,
      {
        id: `q_${prev.length + 1}`,
        question: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctOptionId: "A",
        pointsReward: points.quizBonus || 10,
        explanation: "",
      },
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuizQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateQuestion = (
    index: number,
    field: keyof UserQuizQuestion,
    val: any
  ) => {
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
    setErrorMessage(null);
    setSubmitting(true);

    try {
      let finalTitle = title.trim();
      if (!finalTitle) {
        if (activeType === "quiz") {
          const firstValid = quizQuestions.find((q) => q.question.trim());
          finalTitle = firstValid?.question.trim() || "Live Sports Quiz";
        } else if (activeType === "fan_battle") {
          finalTitle = `${fbLeftName || "Player 1"} vs ${fbRightName || "Player 2"}`;
        } else if (activeType === "poll") {
          finalTitle = pollQuestion.trim() || "Live Fan Poll";
        } else if (activeType === "prediction") {
          finalTitle = predQuestion.trim() || "Live Match Prediction";
        } else if (activeType === "meme") {
          finalTitle =
            subtitle.trim() ||
            (memeMode === "dual"
              ? `${memeLabelA.trim() || "Meme A"} vs ${memeLabelB.trim() || "Meme B"}`
              : "Matchday Meme Energy");
        }
      }

      const now = Date.now();
      const freshUser = resolveCurrentUser();
      const creatorUid = freshUser.userId || activeUserId;
      const creatorEmail = freshUser.userEmail || userEmail;
      const creatorName = freshUser.userName || userName;
      const creatorAvatar = freshUser.userAvatar || userAvatar;

      let payload: any = {
        type: activeType,
        title: finalTitle,
        subtitle: subtitle.trim(),
        sport: sport.toLowerCase(),
        status: "active",
        userId: creatorUid,
        userEmail: creatorEmail,
        userName: creatorName,
        userAvatar: creatorAvatar,
        creatorId: creatorUid,
        creatorEmail: creatorEmail,
        creatorName: creatorName,
        creatorAvatar: creatorAvatar,
        postingTime: now,
        startTime: now,
        scheduledStartTime: now,
      };

      if (activeType === "fan_battle") {
        if (!title.trim()) {
          const err = "Please enter an event title for the Fan Battle.";
          setErrorMessage(err);
          notifyUser(err);
          setSubmitting(false);
          return;
        }
        if (!fbLeftName.trim() || !fbRightName.trim()) {
          const err = "Please provide names for both competitors.";
          setErrorMessage(err);
          notifyUser(err);
          setSubmitting(false);
          return;
        }
        payload.tags = ["⚔️ FAN BATTLE", "🔥 TRENDING"];
        const codeA = editingItem?.fanBattleData?.leftCompetitor?.code || fbLeftName.trim().slice(0, 3).toUpperCase() || "A";
        const codeB = editingItem?.fanBattleData?.rightCompetitor?.code || fbRightName.trim().slice(0, 3).toUpperCase() || "B";
        payload.fanBattleData = {
          leftCompetitor: {
            code: codeA,
            name: fbLeftName.trim(),
            stat: fbLeftStat.trim() || "",
            votes: editingItem?.fanBattleData?.leftCompetitor?.votes || 0,
          },
          rightCompetitor: {
            code: codeB,
            name: fbRightName.trim(),
            stat: fbRightStat.trim() || "",
            votes: editingItem?.fanBattleData?.rightCompetitor?.votes || 0,
          },
          totalVotes: editingItem?.fanBattleData?.totalVotes || 0,
        };
      } else if (activeType === "quiz") {
        const validQuestions = quizQuestions.filter((q) => q.question.trim());
        if (validQuestions.length === 0) {
          const err = "Please add at least one question with text.";
          setErrorMessage(err);
          notifyUser(err);
          setSubmitting(false);
          return;
        }

        const startMs = quizStartTime ? new Date(quizStartTime).getTime() : now;
        payload.startTime = startMs;
        payload.scheduledStartTime = startMs;
        payload.postingTime = startMs;

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
          pointsReward: points.quizBonus || 10,
          explanation: q.explanation.trim(),
        }));

        const freqMins = Number(quizFrequencyMinutes) >= 0 ? Number(quizFrequencyMinutes) : 0;

        payload.tags = [
          "🧠 QUIZ",
          `⭐ ${points.quizBonus || 10} SXPs/Q`,
          freqMins === 0 ? "⚡ Instant" : `⏱️ ${freqMins}m`,
        ];

        payload.quizData = {
          startTime: startMs,
          scheduledStartTime: startMs,
          postingTime: startMs,
          frequencyMinutes: freqMins,
          questions: formattedQuestions,
          question: formattedQuestions[0]?.question || finalTitle,
          options: formattedQuestions[0]?.options || [],
          correctOptionId: formattedQuestions[0]?.correctOptionId || "A",
          pointsReward: points.quizBonus || 10,
          explanation: formattedQuestions[0]?.explanation || "",
        };
      } else if (activeType === "poll") {
        const validOptions = pollOptions.filter((o) => o.trim());
        if (!pollQuestion.trim()) {
          const err = "Please enter a poll question.";
          setErrorMessage(err);
          notifyUser(err);
          setSubmitting(false);
          return;
        }
        if (validOptions.length < 2) {
          const err = "Please provide at least 2 options.";
          setErrorMessage(err);
          notifyUser(err);
          setSubmitting(false);
          return;
        }
        const durationMins = Number(pollTimerMinutes) || 10;
        const expiresAt = now + durationMins * 60 * 1000;
        payload.tags = [
          "📊 POLL",
          `⏱️ ${durationMins < 60 ? `${durationMins}m` : `${durationMins / 60}h`}`,
        ];
        payload.expiresAt = expiresAt;
        payload.pollData = {
          question: pollQuestion.trim(),
          options: validOptions.map((optText, idx) => ({
            id: String(idx + 1),
            text: optText.trim(),
            votes: editingItem?.pollData?.options?.[idx]?.votes || 0,
          })),
          totalVotes: editingItem?.pollData?.totalVotes || 0,
          answer: pollAnswer.trim(),
          correctAnswer: pollAnswer.trim(),
          durationMinutes: durationMins,
          timerMinutes: durationMins,
          expiresAt,
        };
      } else if (activeType === "prediction") {
        if (!predQuestion.trim() || !predLeftText.trim() || !predRightText.trim()) {
          const err = "Please fill in the question and both prediction choices.";
          setErrorMessage(err);
          notifyUser(err);
          setSubmitting(false);
          return;
        }
        const durationMins = Number(predTimerMinutes) || 30;
        const expiresAt = now + durationMins * 60 * 1000;
        payload.tags = [
          "🎯 PREDICTION",
          `💎 ${points.predictionBonus || 10} SXPs`,
          `⏱️ ${durationMins < 60 ? `${durationMins}m` : `${durationMins / 60}h`}`,
        ];
        payload.expiresAt = expiresAt;
        const choiceId =
          predAnswer.trim().toLowerCase() === predLeftText.trim().toLowerCase() || predAnswer === "left"
            ? "left"
            : predAnswer.trim().toLowerCase() === predRightText.trim().toLowerCase() || predAnswer === "right"
              ? "right"
              : predAnswer.trim() || null;

        const predCodeA = editingItem?.predictionData?.leftChoice?.code || predLeftText.trim().slice(0, 3).toUpperCase() || "A";
        const predCodeB = editingItem?.predictionData?.rightChoice?.code || predRightText.trim().slice(0, 3).toUpperCase() || "B";

        payload.predictionData = {
          question: predQuestion.trim(),
          leftChoice: {
            id: "left",
            text: predLeftText.trim(),
            code: predCodeA,
            votes: editingItem?.predictionData?.leftChoice?.votes || 0,
          },
          rightChoice: {
            id: "right",
            text: predRightText.trim(),
            code: predCodeB,
            votes: editingItem?.predictionData?.rightChoice?.votes || 0,
          },
          coinStake: Number(predCoinStake) || 25,
          totalVotes: editingItem?.predictionData?.totalVotes || 0,
          status: "open",
          answer: predAnswer.trim(),
          correctAnswer: predAnswer.trim(),
          winningChoiceId: choiceId,
          durationMinutes: durationMins,
          timerMinutes: durationMins,
          expiresAt,
        };
      } else if (activeType === "meme") {
        if (!memeImageUrl.trim()) {
          const err = "Please upload or select an image for your meme.";
          setErrorMessage(err);
          notifyUser(err);
          setSubmitting(false);
          return;
        }
        if (memeMode === "dual" && !memeImageUrlB.trim()) {
          const err = "Please upload both Meme A and Meme B images for a Dual Meme.";
          setErrorMessage(err);
          notifyUser(err);
          setSubmitting(false);
          return;
        }
        const resolvedAuthorName =
          creatorName ||
          (creatorEmail ? creatorEmail.split("@")[0] : "SportsFan");
        const resolvedAuthorAvatar =
          creatorAvatar ||
          user?.avatar ||
          (user as any)?.photoURL ||
          (user as any)?.picture ||
          `https://api.dicebear.com/7.x/bottts/svg?seed=${creatorUid || "sportsfan"}`;
        const resolvedAuthorHandle = creatorEmail
          ? `@${creatorEmail.split("@")[0]}`
          : `@${resolvedAuthorName.toLowerCase().replace(/\s+/g, "")}`;

        if (memeMode === "dual") {
          payload.tags = ["🔥 DUAL MEME", "⚔️ MEME BATTLE"];
          payload.memeType = "dual";
          payload.isDual = true;
          payload.imageUrlA = memeImageUrl.trim();
          payload.imageUrlB = memeImageUrlB.trim();
          payload.labelA = memeLabelA.trim() || "Meme A";
          payload.labelB = memeLabelB.trim() || "Meme B";
          payload.options = [
            {
              id: "meme_a",
              text: memeLabelA.trim() || "Meme A",
              label: memeLabelA.trim() || "Meme A",
              imageUrl: memeImageUrl.trim(),
              votes: editingItem?.memeData?.options?.[0]?.votes || 0,
            },
            {
              id: "meme_b",
              text: memeLabelB.trim() || "Meme B",
              label: memeLabelB.trim() || "Meme B",
              imageUrl: memeImageUrlB.trim(),
              votes: editingItem?.memeData?.options?.[1]?.votes || 0,
            },
          ];
          payload.memeData = {
            imageUrl: memeImageUrl.trim(),
            imageUrlA: memeImageUrl.trim(),
            imageUrlB: memeImageUrlB.trim(),
            labelA: memeLabelA.trim() || "Meme A",
            labelB: memeLabelB.trim() || "Meme B",
            memeType: "dual",
            isDual: true,
            options: payload.options,
            caption: subtitle.trim() || finalTitle,
            authorName: editingItem?.memeData?.authorName || resolvedAuthorName,
            authorHandle: editingItem?.memeData?.authorHandle || resolvedAuthorHandle,
            authorAvatar: editingItem?.memeData?.authorAvatar || resolvedAuthorAvatar,
            heatPercentage: editingItem?.memeData?.heatPercentage !== undefined ? editingItem.memeData.heatPercentage : 0,
            totalVotes: editingItem?.memeData?.totalVotes !== undefined ? editingItem.memeData.totalVotes : 0,
            reactions: editingItem?.memeData?.reactions || {
              mild: 0,
              funny: 0,
              hot: 0,
              fire: 0,
              nuclear: 0,
            },
            commentsCount: editingItem?.memeData?.commentsCount !== undefined ? editingItem.memeData.commentsCount : 0,
            sharesCount: editingItem?.memeData?.sharesCount !== undefined ? editingItem.memeData.sharesCount : 0,
            createdAt: editingItem?.memeData?.createdAt || editingItem?.createdAt || now,
          };
        } else {
          payload.tags = ["🔥 MEME ARENA", "😂 VIRAL"];
          payload.memeType = "single";
          payload.isDual = false;
          payload.memeData = {
            imageUrl: memeImageUrl.trim(),
            memeType: "single",
            isDual: false,
            caption: subtitle.trim() || finalTitle,
            authorName: editingItem?.memeData?.authorName || resolvedAuthorName,
            authorHandle: editingItem?.memeData?.authorHandle || resolvedAuthorHandle,
            authorAvatar: editingItem?.memeData?.authorAvatar || resolvedAuthorAvatar,
            heatPercentage: editingItem?.memeData?.heatPercentage !== undefined ? editingItem.memeData.heatPercentage : 0,
            totalVotes: editingItem?.memeData?.totalVotes !== undefined ? editingItem.memeData.totalVotes : 0,
            reactions: editingItem?.memeData?.reactions || {
              mild: 0,
              funny: 0,
              hot: 0,
              fire: 0,
              nuclear: 0,
            },
            commentsCount: editingItem?.memeData?.commentsCount !== undefined ? editingItem.memeData.commentsCount : 0,
            sharesCount: editingItem?.memeData?.sharesCount !== undefined ? editingItem.memeData.sharesCount : 0,
            createdAt: editingItem?.memeData?.createdAt || editingItem?.createdAt || now,
          };
        }
      }

      if (editingItem) {
        const res = await engagementService.updateEngagement(editingItem.id, payload);
        const updatedItem = res.engagement || { ...editingItem, ...payload };
        if (onSaved) onSaved(updatedItem, true);
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("arena-engagement-created", {
              detail: { item: updatedItem, isEdit: true },
            })
          );
        }
        setCreatedSuccess({
          title: "Updated Successfully! ✨",
          subtitle: "Your changes have been saved to FlipARENA.",
          points: 0,
        });
        notifyUser("Arena Event updated successfully! ✨");
        setTimeout(() => {
          setCreatedSuccess(null);
          onClose();
        }, 1300);
      } else {
        const res = await engagementService.createEngagement(payload);
        const returnedItem = (res as any).engagement || (res as any).data || res;
        const ptsGranted = Number((res as any)?.pointsAwarded ?? (res as any)?.points ?? 2);
        const createdItem = {
          ...payload,
          ...(typeof returnedItem === "object" ? returnedItem : {}),
          id: returnedItem?.id || payload?.id || `eng_${Date.now()}`,
          createdAt: returnedItem?.createdAt || now,
          postingTime: returnedItem?.postingTime || now,
          startTime: returnedItem?.startTime || now,
          sport: payload.sport || sport.toLowerCase(),
          type: payload.type || activeType,
          title: payload.title || finalTitle,
          pointsAwarded: ptsGranted,
        };
        if (onSaved) onSaved(createdItem, false);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("sf360:points-updated", { detail: { points: ptsGranted } }));
          window.dispatchEvent(
            new CustomEvent("arena-engagement-created", {
              detail: { item: createdItem, isEdit: false },
            })
          );
        }

        const typeLabel =
          activeType === "quiz"
            ? "Quiz Question"
            : activeType === "poll"
              ? "Poll"
              : activeType === "prediction"
                ? "Prediction"
                : activeType === "fan_battle"
                  ? "Fan Battle"
                  : "Meme";

        const successTitle = `${typeLabel} Created Successfully! 🚀`;
        const successSub = `Your ${typeLabel.toLowerCase()} has been published live to FlipARENA.`;

        setCreatedSuccess({
          title: successTitle,
          subtitle: successSub,
          points: ptsGranted,
        });
        notifyUser(`${successTitle} (+${ptsGranted} SXPs earned)`);

        // Automatically close modal after displaying confirmation
        setTimeout(() => {
          setCreatedSuccess(null);
          onClose();
        }, 2200);
      }
    } catch (err: any) {
      console.error("ArenaEngagementModal submission error:", err);
      const errorMessageText =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        (activeType === "meme"
          ? "Failed to create meme. Please check image size / format and try again."
          : "Failed to save event. Please check inputs.");
      setErrorMessage(errorMessageText);
      notifyUser(errorMessageText);
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
        className="fixed inset-0 z-[9999999] flex items-center justify-center p-2.5 sm:p-4 pt-[max(0.625rem,env(safe-area-inset-top))] pb-[max(0.625rem,env(safe-area-inset-bottom))] bg-black/85 backdrop-blur-md overflow-hidden"
        onClick={(e) => {
          if (e.target === e.currentTarget && !createdSuccess) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          className="w-full max-w-xl bg-[#0d111a] border border-white/10 rounded-2xl sm:rounded-3xl shadow-[0_10px_50px_rgba(0,0,0,0.85)] h-[90dvh] max-h-[760px] flex flex-col text-white overflow-hidden my-auto"
        >
          {createdSuccess ? (
            /* Success confirmation screen */
            <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-4 my-auto h-full">
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 12, stiffness: 200 }}
                className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-black shadow-[0_0_35px_rgba(16,185,129,0.4)]"
              >
                <CheckCircle2 size={44} className="text-black stroke-[2.5]" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="space-y-2"
              >
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {createdSuccess.title}
                </h3>
                <p className="text-xs sm:text-sm text-white/70 max-w-sm mx-auto font-medium">
                  {createdSuccess.subtitle}
                </p>
                {createdSuccess.points > 0 && (
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                      <Sparkles size={14} className="text-amber-400 animate-pulse" />
                      <span>+{createdSuccess.points} SXPs Earned</span>
                    </span>
                  </div>
                )}
              </motion.div>
              <button
                type="button"
                onClick={() => {
                  setCreatedSuccess(null);
                  onClose();
                }}
                className="mt-4 px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Modal Header & Tabs */}
              <div className="p-3.5 sm:p-5 pb-3 border-b border-white/[0.08] shrink-0 bg-[#0d111a]">
                <div className="flex items-center justify-between mb-2.5 sm:mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`p-1.5 sm:p-2 rounded-xl border shrink-0 transition-colors ${activeType === "quiz"
                        ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                        : activeType === "fan_battle"
                          ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                          : activeType === "poll"
                            ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                            : activeType === "prediction"
                              ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                              : "bg-orange-500/20 text-orange-400 border-orange-500/30"
                        }`}
                    >
                      {activeType === "quiz" ? (
                        <HelpCircle size={16} className="sm:w-[18px] sm:h-[18px]" />
                      ) : activeType === "fan_battle" ? (
                        <Swords size={16} className="sm:w-[18px] sm:h-[18px]" />
                      ) : activeType === "poll" ? (
                        <BarChart2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                      ) : activeType === "meme" ? (
                        <Flame size={16} className="sm:w-[18px] sm:h-[18px] text-orange-400" />
                      ) : (
                        <Target size={16} className="sm:w-[18px] sm:h-[18px]" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <h2 className="text-sm sm:text-base font-black tracking-tight truncate">
                        {editingItem
                          ? activeType === "quiz"
                            ? "Edit Arena Quiz"
                            : activeType === "fan_battle"
                              ? "Edit Fan Battle"
                              : activeType === "poll"
                                ? "Edit Sports Poll"
                                : activeType === "prediction"
                                  ? "Edit Prediction"
                                  : "Edit Meme Arena"
                          : activeType === "quiz"
                            ? "Create Live Quiz"
                            : activeType === "fan_battle"
                              ? "Create Fan Battle"
                              : activeType === "poll"
                                ? "Create Sports Poll"
                                : activeType === "prediction"
                                  ? "Create Match Prediction"
                                  : "Create Meme"}
                      </h2>
                      <p className="text-[10px] text-white/40 truncate">
                        {activeType === "quiz"
                          ? editingItem
                            ? "Update quiz questions, interval timer, and answers"
                            : `Challenge fans with sports trivia questions · Earn +${points.create} SXPs`
                          : activeType === "fan_battle"
                            ? editingItem
                              ? "Update competitor names and battle stats"
                              : `Pit players or teams head-to-head in a live battle · Earn +${points.create} SXPs`
                            : activeType === "poll"
                              ? editingItem
                                ? "Update poll question, duration, and voting options"
                                : `Ask fans a question & get instant community votes · Earn +${points.create} SXPs`
                              : activeType === "prediction"
                                ? editingItem
                                  ? "Update prediction choices, timer, and expected outcome"
                                  : `Set up match predictions and let fans predict outcomes · Earn +${points.create} SXPs`
                                : editingItem
                                  ? "Update your sports meme caption and image"
                                  : `Drop your funniest sports meme into the Arena · Earn +${points.create} SXPs`}
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

                {!editingItem && (
                  <div className="grid grid-cols-5 gap-1 sm:gap-1.5 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl sm:rounded-2xl">
                    {[
                      { type: "quiz", label: "Quiz", icon: "🧠" },
                      { type: "fan_battle", label: "Battle", icon: "⚔️" },
                      { type: "poll", label: "Poll", icon: "📊" },
                      { type: "prediction", label: "Prediction", icon: "🎯" },
                      { type: "meme", label: "Meme", icon: "🔥" },
                    ].map((tab) => {
                      const isActive = activeType === tab.type;
                      return (
                        <button
                          key={tab.type}
                          type="button"
                          onClick={() => {
                            const nextType = tab.type as EngagementType;
                            setActiveType(nextType);
                            setErrorMessage(null);
                          }}
                          className={`py-1.5 sm:py-2 px-1 rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer ${isActive
                            ? tab.type === "meme"
                              ? "bg-gradient-to-r from-[#FF3D57] to-[#FF7B02] text-white shadow-md shadow-orange-500/25"
                              : tab.type === "poll"
                                ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-500/20"
                                : tab.type === "fan_battle"
                                  ? "bg-gradient-to-r from-rose-600 to-orange-600 text-white shadow-md shadow-rose-500/20"
                                  : tab.type === "prediction"
                                    ? "bg-gradient-to-r from-amber-600 to-yellow-500 text-white shadow-md shadow-amber-500/20"
                                    : "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/20"
                            : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                            }`}
                        >
                          <span>{tab.icon}</span>
                          <span className="whitespace-normal hidden xs:inline">{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col overflow-hidden">
                <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs overscroll-contain">
                  {/* In-Modal Error Notification Banner */}
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="p-3 sm:p-3.5 rounded-xl bg-red-500/15 border border-red-500/40 flex items-start gap-2.5 text-red-200 text-xs shadow-lg shadow-red-500/10"
                    >
                      <div className="w-5 h-5 rounded-lg bg-red-500/25 text-red-400 flex items-center justify-center shrink-0 mt-0.5">
                        <AlertCircle size={14} className="stroke-[2.5]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-extrabold text-red-100 text-[11px] uppercase tracking-wider mb-0.5">
                          Submission Error
                        </p>
                        <p className="text-xs text-red-200/90 break-words leading-relaxed font-medium">
                          {errorMessage}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setErrorMessage(null)}
                        className="p-1 rounded-md text-red-400 hover:text-red-100 hover:bg-red-500/20 transition-all cursor-pointer shrink-0"
                        title="Dismiss error"
                      >
                        <X size={14} />
                      </button>
                    </motion.div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                    <div className="sm:col-span-2">
                      <label className={labelStyle}>
                        Event Title / Headline{" "}
                        {activeType === "fan_battle" ? (
                          <span className="text-red-400 font-bold">*</span>
                        ) : (
                          <span className="text-white/40 font-normal lowercase tracking-normal text-[10px]">
                            (optional)
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={
                          activeType === "quiz"
                            ? "e.g. Test Cricket Century Masters (optional)"
                            : activeType === "fan_battle"
                              ? "e.g. Virat Kohli vs Babar Azam"
                              : activeType === "poll"
                                ? "e.g. Best Spinner in Galle? (optional)"
                                : activeType === "meme"
                                  ? "e.g. Matchday Meme / When the third umpire checks ultra-edge (optional)"
                                  : "e.g. Match Winner Prediction (optional)"
                        }
                        className={inputStyle}
                        required={activeType === "fan_battle"}
                      />
                    </div>

                    <div>
                      <label className={labelStyle}>Sport</label>
                      <select
                        value={sport}
                        onChange={(e) => setSport(e.target.value)}
                        className={`${inputStyle} cursor-pointer`}
                      >
                        {availableSports.map((sp) => (
                          <option key={sp.id} value={sp.id} className="bg-[#121622]">
                            {sp.icon} {sp.name}
                          </option>
                        ))}
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
                            <option value={0} className="bg-[#121622]">⚡ Every 0 mins (Instant)</option>
                            <option value={5} className="bg-[#121622]">⏱️ Every 5 mins</option>
                            <option value={10} className="bg-[#121622]">⏱️ Every 10 mins</option>
                            <option value={15} className="bg-[#121622]">🕐 Every 15 mins</option>
                            <option value={30} className="bg-[#121622]">⏳ Every 30 mins</option>
                            <option value={60} className="bg-[#121622]">🕒 Every 1 hour</option>
                          </select>
                        </div>
                      </div>

                      {/* Question builder list */}
                      <div className="space-y-3.5 pt-2">
                        <div className="flex items-center justify-between">
                          <label className={labelStyle}>
                            Questions ({quizQuestions.length})
                          </label>
                          <button
                            type="button"
                            onClick={handleAddQuestion}
                            className="text-[10px] font-extrabold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                          >
                            <Plus size={12} /> Add Question
                          </button>
                        </div>

                        {quizQuestions.map((q, idx) => (
                          <div
                            key={q.id || idx}
                            className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-3 relative group"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-black text-purple-400 uppercase tracking-wider">
                                Question #{idx + 1}
                              </span>
                              {quizQuestions.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveQuestion(idx)}
                                  className="text-red-400/60 hover:text-red-400 text-[10px] flex items-center gap-1 cursor-pointer"
                                >
                                  <Trash2 size={12} /> Remove
                                </button>
                              )}
                            </div>

                            <input
                              type="text"
                              value={q.question}
                              onChange={(e) =>
                                handleUpdateQuestion(idx, "question", e.target.value)
                              }
                              placeholder="e.g. Who scored the highest individual score in Test Cricket?"
                              className={inputStyle}
                              required
                            />

                            {/* 4 Options */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {(["A", "B", "C", "D"] as const).map((optKey) => {
                                const fieldKey = `option${optKey}` as keyof UserQuizQuestion;
                                const isCorrect = q.correctOptionId === optKey;
                                return (
                                  <div
                                    key={optKey}
                                    className={`flex items-center gap-2 p-1.5 rounded-xl border transition-all ${isCorrect
                                      ? "bg-purple-500/10 border-purple-500/50 text-white"
                                      : "bg-[#121622] border-white/5"
                                      }`}
                                  >
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleUpdateQuestion(idx, "correctOptionId", optKey)
                                      }
                                      className={`w-6 h-6 rounded-lg text-[10px] font-black flex items-center justify-center transition-all cursor-pointer ${isCorrect
                                        ? "bg-purple-500 text-white shadow-md shadow-purple-500/30"
                                        : "bg-white/5 text-white/40 hover:bg-white/10"
                                        }`}
                                      title="Mark as correct option"
                                    >
                                      {optKey}
                                    </button>
                                    <input
                                      type="text"
                                      value={String(q[fieldKey] || "")}
                                      onChange={(e) =>
                                        handleUpdateQuestion(idx, fieldKey, e.target.value)
                                      }
                                      placeholder={`Option ${optKey}`}
                                      className="bg-transparent text-xs text-white placeholder-white/20 outline-none flex-1"
                                      required
                                    />
                                    {isCorrect && (
                                      <span className="text-[9px] font-black text-purple-400 pr-1 shrink-0">
                                        ✓ Correct
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            <input
                              type="text"
                              value={q.explanation}
                              onChange={(e) =>
                                handleUpdateQuestion(idx, "explanation", e.target.value)
                              }
                              placeholder="Explanation (Optional)"
                              className={`${inputStyle} text-[11px]`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ─── FAN BATTLE FORM TAB ─── */}
                  {activeType === "fan_battle" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {/* Competitor Left */}
                        <div className="p-3.5 rounded-2xl bg-rose-500/[0.03] border border-rose-500/20 space-y-2.5">
                          <span className="text-[11px] font-black text-[#FF3D57] uppercase tracking-wider block">
                            Left Competitor (Side A)
                          </span>
                          <div>
                            <label className={labelStyle}>
                              Competitor Name <span className="text-red-400 font-bold">*</span>
                            </label>
                            <input
                              type="text"
                              value={fbLeftName}
                              onChange={(e) => setFbLeftName(e.target.value)}
                              placeholder="e.g. Rohit Sharma"
                              className={inputStyle}
                              required
                            />
                          </div>
                          <div>
                            <label className={labelStyle}>Key Stat / Tag</label>
                            <input
                              type="text"
                              value={fbLeftStat}
                              onChange={(e) => setFbLeftStat(e.target.value)}
                              placeholder="e.g. 3 Double 100s"
                              className={inputStyle}
                            />
                          </div>
                        </div>

                        {/* Competitor Right */}
                        <div className="p-3.5 rounded-2xl bg-orange-500/[0.03] border border-orange-500/20 space-y-2.5">
                          <span className="text-[11px] font-black text-[#FF7B02] uppercase tracking-wider block">
                            Right Competitor (Side B)
                          </span>
                          <div>
                            <label className={labelStyle}>
                              Competitor Name <span className="text-red-400 font-bold">*</span>
                            </label>
                            <input
                              type="text"
                              value={fbRightName}
                              onChange={(e) => setFbRightName(e.target.value)}
                              placeholder="e.g. David Warner"
                              className={inputStyle}
                              required
                            />
                          </div>
                          <div>
                            <label className={labelStyle}>Key Stat / Tag</label>
                            <input
                              type="text"
                              value={fbRightStat}
                              onChange={(e) => setFbRightStat(e.target.value)}
                              placeholder="e.g. 335* High Score"
                              className={inputStyle}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ─── POLL FORM TAB (With Answer & Timer) ─── */}
                  {activeType === "poll" && (
                    <div className="space-y-3.5">
                      <div>
                        <label className={labelStyle}>
                          Poll Question <span className="text-red-400 font-bold">*</span>
                        </label>
                        <input
                          type="text"
                          value={pollQuestion}
                          onChange={(e) => setPollQuestion(e.target.value)}
                          placeholder="e.g. Who will take the most wickets in today's match?"
                          className={inputStyle}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                        <div>
                          <label className={labelStyle}>Correct Answer / Outcome (+{points.pollBonus} SXPs Bonus)</label>
                          <input
                            type="text"
                            value={pollAnswer}
                            onChange={(e) => setPollAnswer(e.target.value)}
                            placeholder="Optional: mark correct option below"
                            className={inputStyle}
                          />
                        </div>

                        <div>
                          <label className={labelStyle}>Duration / Timer</label>
                          <select
                            value={pollTimerMinutes}
                            onChange={(e) => setPollTimerMinutes(Number(e.target.value))}
                            className={`${inputStyle} cursor-pointer`}
                          >
                            <option value={5} className="bg-[#121622]">⚡ 5 mins</option>
                            <option value={10} className="bg-[#121622]">⏱️ 10 mins</option>
                            <option value={30} className="bg-[#121622]">⏳ 30 mins</option>
                            <option value={60} className="bg-[#121622]">🕒 1 hr</option>
                            <option value={120} className="bg-[#121622]">⏰ 2 hr</option>
                            <option value={1440} className="bg-[#121622]">📅 24 hr</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2 pt-1">
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

                        {pollOptions.map((opt, idx) => {
                          const isSelectedAnswer =
                            pollAnswer && opt && pollAnswer.trim().toLowerCase() === opt.trim().toLowerCase();
                          return (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="text-[10px] font-black text-white/40 w-4 text-center">
                                {idx + 1}.
                              </span>
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (isSelectedAnswer) setPollAnswer(val);
                                  setPollOptions((prev) => prev.map((o, i) => (i === idx ? val : o)));
                                }}
                                placeholder={`Option ${idx + 1}`}
                                className={`${inputStyle} ${isSelectedAnswer ? "border-emerald-500/80 bg-emerald-500/[0.05]" : ""}`}
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setPollAnswer(opt)}
                                title="Set this option as the correct outcome"
                                className={`text-[10px] px-2.5 py-2 rounded-xl font-bold transition-all cursor-pointer shrink-0 border ${isSelectedAnswer
                                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                                  : "bg-white/[0.04] text-white/40 hover:text-white border-white/5"
                                  }`}
                              >
                                {isSelectedAnswer ? "✓ Winner" : "Mark"}
                              </button>
                              {pollOptions.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (isSelectedAnswer) setPollAnswer("");
                                    setPollOptions((prev) => prev.filter((_, i) => i !== idx));
                                  }}
                                  className="text-red-400/60 hover:text-red-400 p-1.5 cursor-pointer"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ─── PREDICTION FORM TAB (With Answer & Timer) ─── */}
                  {activeType === "prediction" && (
                    <div className="space-y-3.5">
                      <div>
                        <label className={labelStyle}>
                          Prediction Question <span className="text-red-400 font-bold">*</span>
                        </label>
                        <input
                          type="text"
                          value={predQuestion}
                          onChange={(e) => setPredQuestion(e.target.value)}
                          placeholder="e.g. Will India score 350+ in the first innings?"
                          className={inputStyle}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                        <div>
                          <label className={labelStyle}>Correct / Winning Outcome (+{points.predictionBonus} SXPs)</label>
                          <input
                            type="text"
                            value={predAnswer}
                            onChange={(e) => setPredAnswer(e.target.value)}
                            placeholder="Click 'Mark' below or type expected answer"
                            className={inputStyle}
                          />
                        </div>

                        <div>
                          <label className={labelStyle}>Timer / Duration (+{points.predictionBonus} SXPs on Expiry)</label>
                          <select
                            value={predTimerMinutes}
                            onChange={(e) => setPredTimerMinutes(Number(e.target.value))}
                            className={`${inputStyle} cursor-pointer`}
                          >
                            <option value={5} className="bg-[#121622]">⚡ 5 mins</option>
                            <option value={10} className="bg-[#121622]">⏱️ 10 mins</option>
                            <option value={30} className="bg-[#121622]">⏳ 30 mins</option>
                            <option value={60} className="bg-[#121622]">🕒 1 hr</option>
                            <option value={90} className="bg-[#121622]">⌛ 1 hr 30 mins</option>
                            <option value={120} className="bg-[#121622]">⏰ 2 hr</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div
                          className={`p-3 rounded-xl border space-y-2 transition-all ${predAnswer &&
                            (predAnswer === predLeftText || predAnswer === "Option A" || predAnswer === "left")
                            ? "bg-emerald-500/[0.06] border-emerald-500/40"
                            : "bg-amber-500/[0.03] border-amber-500/20"
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-amber-400 block uppercase">
                              Option A (Left Choice)
                            </span>
                            <button
                              type="button"
                              onClick={() => setPredAnswer(predLeftText || "Option A")}
                              className={`text-[9px] px-1.5 py-0.5 rounded font-black transition-all cursor-pointer ${predAnswer &&
                                (predAnswer === predLeftText || predAnswer === "Option A" || predAnswer === "left")
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                                : "text-white/40 hover:text-white"
                                }`}
                            >
                              {predAnswer &&
                                (predAnswer === predLeftText || predAnswer === "Option A" || predAnswer === "left")
                                ? "✓ Winner"
                                : "Mark"}
                            </button>
                          </div>
                          <input
                            type="text"
                            value={predLeftText}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (predAnswer === predLeftText) setPredAnswer(val);
                              setPredLeftText(val);
                            }}
                            placeholder="e.g. Yes, India win"
                            className={inputStyle}
                            required
                          />
                        </div>

                        <div
                          className={`p-3 rounded-xl border space-y-2 transition-all ${predAnswer &&
                            (predAnswer === predRightText || predAnswer === "Option B" || predAnswer === "right")
                            ? "bg-emerald-500/[0.06] border-emerald-500/40"
                            : "bg-amber-500/[0.03] border-amber-500/20"
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-amber-400 block uppercase">
                              Option B (Right Choice)
                            </span>
                            <button
                              type="button"
                              onClick={() => setPredAnswer(predRightText || "Option B")}
                              className={`text-[9px] px-1.5 py-0.5 rounded font-black transition-all cursor-pointer ${predAnswer &&
                                (predAnswer === predRightText || predAnswer === "Option B" || predAnswer === "right")
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                                : "text-white/40 hover:text-white"
                                }`}
                            >
                              {predAnswer &&
                                (predAnswer === predRightText || predAnswer === "Option B" || predAnswer === "right")
                                ? "✓ Winner"
                                : "Mark"}
                            </button>
                          </div>
                          <input
                            type="text"
                            value={predRightText}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (predAnswer === predRightText) setPredAnswer(val);
                              setPredRightText(val);
                            }}
                            placeholder="e.g. SL hold / win"
                            className={inputStyle}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ─── MEME FORM TAB ─── */}
                  {activeType === "meme" && (
                    <div className="space-y-4">
                      {/* Single vs Dual Format Toggle */}
                      <div>
                        <label className={labelStyle}>Meme Format</label>
                        <div className="grid grid-cols-2 gap-2 bg-white/[0.03] p-1 rounded-xl border border-white/10">
                          <button
                            type="button"
                            onClick={() => setMemeMode("single")}
                            className={`py-2 px-3 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                              memeMode === "single"
                                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                                : "text-white/60 hover:text-white hover:bg-white/5"
                            }`}
                          >
                            <span>🔥 Single Meme</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setMemeMode("dual")}
                            className={`py-2 px-3 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                              memeMode === "dual"
                                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                                : "text-white/60 hover:text-white hover:bg-white/5"
                            }`}
                          >
                            <span>⚔️ Dual Meme (A vs B)</span>
                          </button>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className={labelStyle}>Description (Optional)</label>
                          <span className="text-[10px] text-white/40">
                            {subtitle.length}/200
                          </span>
                        </div>
                        <textarea
                          rows={2}
                          value={subtitle}
                          maxLength={200}
                          onChange={(e) => setSubtitle(e.target.value)}
                          placeholder="Add a little context for the meme..."
                          className={`${inputStyle} resize-none`}
                        />
                      </div>

                      {memeMode === "single" ? (
                        <div>
                          <label className={labelStyle}>Upload Meme</label>

                          {/* Upload Box */}
                          <div className="border-2 border-dashed border-white/15 hover:border-orange-500/50 rounded-2xl p-4 sm:p-5 bg-white/[0.02] text-center transition-all relative overflow-hidden group">
                            {uploadingImgA ? (
                              <div className="flex flex-col items-center justify-center py-6 space-y-2">
                                <Loader2 size={24} className="animate-spin text-orange-400" />
                                <span className="text-xs text-orange-300 font-bold">Uploading meme image...</span>
                              </div>
                            ) : memeImageUrl ? (
                              <div className="flex flex-col items-center gap-3">
                                <div className="relative w-full max-h-[220px] rounded-xl overflow-hidden border border-white/10 bg-black/40 flex items-center justify-center">
                                  <img
                                    src={memeImageUrl}
                                    alt="Meme preview"
                                    className="max-h-[200px] w-auto object-contain rounded-lg"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setMemeImageUrl("")}
                                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-black text-white/80 hover:text-white transition-all cursor-pointer"
                                    title="Remove image"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>

                                <div className="flex items-center gap-2">
                                  <label className="px-3 py-1.5 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/40 text-[11px] font-extrabold cursor-pointer transition-all flex items-center gap-1.5">
                                    <UploadCloud size={13} />
                                    <span>Replace Image</span>
                                    <input
                                      type="file"
                                      accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleUploadFile(file, "single");
                                      }}
                                    />
                                  </label>
                                </div>
                              </div>
                            ) : (
                              <label className="flex flex-col items-center justify-center py-4 cursor-pointer space-y-2">
                                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                  <ImageIcon size={24} />
                                </div>
                                <div className="space-y-0.5">
                                  <p className="text-xs font-black text-white">Upload meme image</p>
                                  <p className="text-[10px] text-white/40">JPG, PNG • Max 10 MB</p>
                                </div>
                                <input
                                  type="file"
                                  accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleUploadFile(file, "single");
                                  }}
                                />
                              </label>
                            )}
                          </div>
                        </div>
                      ) : (
                        /* Dual Meme Uploads (A vs B) */
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Meme A */}
                          <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02] space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-black text-orange-400 uppercase">Meme A</span>
                            </div>
                            <input
                              type="text"
                              value={memeLabelA}
                              onChange={(e) => setMemeLabelA(e.target.value)}
                              placeholder="Label (e.g. Meme A)"
                              className={inputStyle}
                            />
                            <div className="border-2 border-dashed border-white/15 hover:border-orange-500/50 rounded-xl p-3 bg-black/30 text-center transition-all relative overflow-hidden">
                              {uploadingImgA ? (
                                <div className="flex flex-col items-center justify-center py-6 space-y-2">
                                  <Loader2 size={20} className="animate-spin text-orange-400" />
                                  <span className="text-[11px] text-orange-300 font-bold">Uploading Meme A...</span>
                                </div>
                              ) : memeImageUrl ? (
                                <div className="relative w-full h-32 rounded-lg overflow-hidden bg-black/40 flex items-center justify-center">
                                  <img
                                    src={memeImageUrl}
                                    alt="Meme A preview"
                                    className="w-full h-full object-cover"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setMemeImageUrl("")}
                                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 hover:bg-black text-white/80 hover:text-white transition-all cursor-pointer"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              ) : (
                                <label className="flex flex-col items-center justify-center py-3 cursor-pointer space-y-1">
                                  <ImageIcon size={20} className="text-orange-400" />
                                  <p className="text-[11px] font-bold text-white">Upload Meme A</p>
                                  <input
                                    type="file"
                                    accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleUploadFile(file, "A");
                                    }}
                                  />
                                </label>
                              )}
                            </div>
                          </div>

                          {/* Meme B */}
                          <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02] space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-black text-rose-400 uppercase">Meme B</span>
                            </div>
                            <input
                              type="text"
                              value={memeLabelB}
                              onChange={(e) => setMemeLabelB(e.target.value)}
                              placeholder="Label (e.g. Meme B)"
                              className={inputStyle}
                            />
                            <div className="border-2 border-dashed border-white/15 hover:border-rose-500/50 rounded-xl p-3 bg-black/30 text-center transition-all relative overflow-hidden">
                              {uploadingImgB ? (
                                <div className="flex flex-col items-center justify-center py-6 space-y-2">
                                  <Loader2 size={20} className="animate-spin text-rose-400" />
                                  <span className="text-[11px] text-rose-300 font-bold">Uploading Meme B...</span>
                                </div>
                              ) : memeImageUrlB ? (
                                <div className="relative w-full h-32 rounded-lg overflow-hidden bg-black/40 flex items-center justify-center">
                                  <img
                                    src={memeImageUrlB}
                                    alt="Meme B preview"
                                    className="w-full h-full object-cover"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setMemeImageUrlB("")}
                                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 hover:bg-black text-white/80 hover:text-white transition-all cursor-pointer"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              ) : (
                                <label className="flex flex-col items-center justify-center py-3 cursor-pointer space-y-1">
                                  <ImageIcon size={20} className="text-rose-400" />
                                  <p className="text-[11px] font-bold text-white">Upload Meme B</p>
                                  <input
                                    type="file"
                                    accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleUploadFile(file, "B");
                                    }}
                                  />
                                </label>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

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
                        <span>
                          {editingItem
                            ? activeType === "fan_battle"
                              ? "Update Battle"
                              : activeType === "quiz"
                                ? "Update Quiz"
                                : activeType === "poll"
                                  ? "Update Poll"
                                  : activeType === "prediction"
                                    ? "Update Prediction"
                                    : "Update Meme"
                            : activeType === "fan_battle"
                              ? "Publish Battle"
                              : activeType === "quiz"
                                ? "Publish Quiz"
                                : activeType === "poll"
                                  ? "Publish Poll"
                                  : activeType === "prediction"
                                    ? "Publish Prediction"
                                    : "Publish Meme"}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
