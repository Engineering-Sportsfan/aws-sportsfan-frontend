// "use client";
// // MainModules/Fanszone/page.tsx
// import { motion } from "framer-motion";
// import { useRouter } from "next/navigation";
// import { useState, useMemo, useEffect, useRef } from "react";
// import Link from "next/link";
// import Image from "next/image";
// // import { Trophy, ArrowUpRight } from "lucide-react";
// import { type ActivityItem, useActivity } from "@/context/ActivityContext";
// import { useLeaderboard } from "@/context/LeaderboardContext";
// import {
//   ChevronDown, Trophy, ArrowUpRight, Share2, CheckCircle2,
//   Award, TrendingUp, Play, ThumbsUp, FileText,
//   Gamepad2, UserPlus, LayoutGrid, Calendar,
//   X, Headphones,
//   Megaphone, MessagesSquare, Flame, Sparkles, Info, TrendingDown, Brain,
//   ArrowLeft,
// } from "lucide-react";

// // ─────────────────────────────────────────────────────────────────────────────
// // TYPES
// // ─────────────────────────────────────────────────────────────────────────────
// type ActivityKey =
//   | "audioDrop"
//   | "fanBattleWin"
//   | "fanBattlePlay"
//   | "trivia"
//   | "post"
//   | "register"
//   | "invite"
//   | "roarHotTake"
//   | "roarPrediction"
//   | "roarDebate"
//   | "roarMemory"
//   | "roarPost"
//   | "roarQuiz"
//   | "roarReaction"   // FIX 2: added for ROAR_RAW_REACTIONS
//   | "watchDrop"
//   | "like"
//   | "share"
//   | "other";

// type TrendPeriod    = "7D" | "30D" | "90D";
// type CategoryFilter =
//   | "All Activities" | "Content" | "Engagement"
//   | "Fantasy" | "Trivia" | "Referral" | "Registration" | "ROAR";
// type DateFilter = "All Time" | "This Month" | "Last 7 Days" | "Last 30 Days";

// interface HistoryItem {
//   id:         string;
//   key:        ActivityKey;
//   action:     string;
//   details:    string;
//   points:     number;
//   type:       string;
//   source:     string;
//   date:       string;
//   timestamp:  number;
//   time:       string;
//   icon:       React.ElementType;
//   color:      string;
//   hexColor:   string;
//   typeColor:  string;
// }

// interface CategoryBreakdown {
//   label:   string;
//   percent: number;
//   color:   string;
//   xp:      string;
//   xpValue: number;
// }

// interface LeaderboardContextType {
//   currentUserPoints: number;
//   currentUserRank:   number;
//   previousUserRank?: number;
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // FIX 1 + FIX 2 — CENTRALISED TYPE → ActivityKey MAP
// //
// // FIX 1: Added ROAR_RAW_REACTIONS → "roarReaction" so it no longer falls
// //         through to "other" with wrong icon/colour/category.
// // ─────────────────────────────────────────────────────────────────────────────
// const ACTIVITY_TYPE_MAP: Record<string, ActivityKey> = {
//   // Audio Drop — multiple aliases that appear in the wild
//   AUDIO_DROP:           "audioDrop",
//   LISTEN_COMPLETE:      "audioDrop",
//   LISTEN_AUDIO_DROP:    "audioDrop",

//   // Fan Battle
//   FAN_BATTLE_WIN:       "fanBattleWin",
//   FAN_BATTLE_PLAY:      "fanBattlePlay",
//   CREATE_BATTLE:        "fanBattlePlay",
//   PLAY_BATTLE:          "fanBattlePlay",

//   // Fan Zone Post
//   POST_CREATED:         "post",
//   CREATE_POST:          "post",

//   // Trivia
//   TRIVIA_CORRECT:       "trivia",

//   // Account / Referral
//   REGISTRATION:         "register",
//   INVITE_ACCEPTED:      "invite",

//   // ROAR
//   ROAR_HOT_TAKE:        "roarHotTake",
//   ROAR_PREDICTION:      "roarPrediction",
//   ROAR_DEBATE:          "roarDebate",
//   ROAR_MEMORY:          "roarMemory",
//   ROAR_POST:            "roarPost",
//   ROAR_QUIZ:            "roarQuiz",
//   ROAR_RAW_REACTIONS:   "roarReaction",  // FIX 2: was missing, now mapped
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // FIX 2 — EXPANDED ACTIVITY_META
// //
// // Added "roarReaction" entry for ROAR_RAW_REACTIONS so it gets the right
// // icon, colour, and "ROAR" category (instead of falling to "other" /
// // "Engagement" which broke the category filter).
// // ─────────────────────────────────────────────────────────────────────────────
// const ACTIVITY_META: Record<ActivityKey, {
//   action:    string;
//   type:      string;           // must match one of the CategoryFilter values
//   icon:      React.ElementType;
//   color:     string;           // Tailwind text class
//   hexColor:  string;           // literal hex for SVG / inline styles
//   typeColor: string;           // Tailwind badge classes
// }> = {
//   audioDrop: {
//     action: "Listened to Audio Drop", type: "Content", icon: Headphones,
//     color: "text-sky-400", hexColor: "#38bdf8",
//     typeColor: "text-sky-400 border-sky-400/30 bg-sky-400/5",
//   },
//   fanBattleWin: {
//     action: "Won a Fan Battle", type: "Fantasy", icon: Trophy,
//     color: "text-yellow-400", hexColor: "#facc15",
//     typeColor: "text-yellow-400 border-yellow-400/30 bg-yellow-400/5",
//   },
//   fanBattlePlay: {
//     action: "Played a Fan Battle", type: "Fantasy", icon: Gamepad2,
//     color: "text-yellow-500", hexColor: "#eab308",
//     typeColor: "text-yellow-500 border-yellow-500/30 bg-yellow-500/5",
//   },
//   trivia: {
//     action: "Answered Trivia Correctly", type: "Trivia", icon: CheckCircle2,
//     color: "text-violet-400", hexColor: "#a78bfa",
//     typeColor: "text-violet-400 border-violet-400/30 bg-violet-400/5",
//   },
//   post: {
//     action: "Created a Fan Zone Post", type: "Engagement", icon: FileText,
//     color: "text-rose-400", hexColor: "#fb7185",
//     typeColor: "text-rose-400 border-rose-400/30 bg-rose-400/5",
//   },
//   register: {
//     action: "Joined SportsFan360", type: "Registration", icon: UserPlus,
//     color: "text-emerald-500", hexColor: "#10b981",
//     typeColor: "text-emerald-500 border-emerald-500/30 bg-emerald-500/5",
//   },
//   invite: {
//     action: "Friend Joined Via Invite", type: "Referral", icon: UserPlus,
//     color: "text-teal-400", hexColor: "#2dd4bf",
//     typeColor: "text-teal-400 border-teal-400/30 bg-teal-400/5",
//   },

//   // ── ROAR activities — each with its own distinct icon, colour, category ──
//   roarHotTake: {
//     action: "Posted a ROAR Hot Take", type: "ROAR", icon: Flame,
//     color: "text-amber-500", hexColor: "#f59e0b",
//     typeColor: "text-amber-500 border-amber-500/30 bg-amber-500/5",
//   },
//   roarPrediction: {
//     action: "Made a ROAR Prediction", type: "ROAR", icon: TrendingUp,
//     color: "text-lime-400", hexColor: "#a3e635",
//     typeColor: "text-lime-400 border-lime-400/30 bg-lime-400/5",
//   },
//   roarDebate: {
//     action: "Started a ROAR Debate", type: "ROAR", icon: MessagesSquare,
//     color: "text-cyan-400", hexColor: "#22d3ee",
//     typeColor: "text-cyan-400 border-cyan-400/30 bg-cyan-400/5",
//   },
//   roarMemory: {
//     action: "Shared a ROAR Memory", type: "ROAR", icon: Sparkles,
//     color: "text-pink-400", hexColor: "#f472b6",
//     typeColor: "text-pink-400 border-pink-400/30 bg-pink-400/5",
//   },
//   roarPost: {
//     action: "Shared a ROAR Post", type: "ROAR", icon: Megaphone,
//     color: "text-orange-400", hexColor: "#fb923c",
//     typeColor: "text-orange-400 border-orange-400/30 bg-orange-400/5",
//   },
//   roarQuiz: {
//     action: "Answered a ROAR Quiz", type: "ROAR", icon: Brain,
//     color: "text-emerald-400", hexColor: "#34d399",
//     typeColor: "text-emerald-400 border-emerald-400/30 bg-emerald-400/5",
//   },
//   // FIX 2: new entry — was previously missing, causing ROAR_RAW_REACTIONS to
//   // render as "other" (grey trophy icon, Engagement category, wrong badge).
//   roarReaction: {
//     action: "Reacted on ROAR", type: "ROAR", icon: ThumbsUp,
//     color: "text-fuchsia-400", hexColor: "#e879f9",
//     typeColor: "text-fuchsia-400 border-fuchsia-400/30 bg-fuchsia-400/5",
//   },

//   // Legacy / less-used
//   watchDrop: {
//     action: "Watched a Drop", type: "Content", icon: Play,
//     color: "text-yellow-500", hexColor: "#eab308",
//     typeColor: "text-yellow-500 border-yellow-500/30 bg-yellow-500/5",
//   },
//   like: {
//     action: "Liked a Post", type: "Engagement", icon: ThumbsUp,
//     color: "text-rose-500", hexColor: "#f43f5e",
//     typeColor: "text-rose-500 border-rose-500/30 bg-rose-500/5",
//   },
//   share: {
//     action: "Shared a Post", type: "Engagement", icon: Share2,
//     color: "text-purple-500", hexColor: "#a855f7",
//     typeColor: "text-purple-500 border-purple-500/30 bg-purple-500/5",
//   },
//   other: {
//     action: "Activity", type: "Engagement", icon: Trophy,
//     color: "text-gray-300", hexColor: "#d4d4d8",
//     typeColor: "text-gray-300 border-gray-400/30 bg-white/5",
//   },
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // FIX 6 — CLEAN SOURCE BADGE LABELS
// //
// // Previously readableSource("ROAR_HOT_TAKE") → "Roar Hot Take", producing
// // inconsistent badge text in the Earning History table.  This map collapses
// // all ROAR variants to a single "ROAR" badge and normalises audio-drop aliases.
// // ─────────────────────────────────────────────────────────────────────────────
// const SOURCE_LABEL_MAP: Record<string, string> = {
//   ROAR_HOT_TAKE:        "ROAR",
//   ROAR_PREDICTION:      "ROAR",
//   ROAR_DEBATE:          "ROAR",
//   ROAR_MEMORY:          "ROAR",
//   ROAR_POST:            "ROAR",
//   ROAR_QUIZ:            "ROAR",
//   ROAR_RAW_REACTIONS:   "ROAR",
//   LISTEN_AUDIO_DROP:    "LISTEN AUDIO DROP",
//   LISTEN_COMPLETE:      "LISTEN AUDIO DROP",
//   AUDIO_DROP:           "LISTEN AUDIO DROP",
//   FAN_BATTLE_WIN:       "FAN BATTLE",
//   FAN_BATTLE_PLAY:      "FAN BATTLE",
//   CREATE_BATTLE:        "FAN BATTLE",
//   PLAY_BATTLE:          "FAN BATTLE",
//   TRIVIA_CORRECT:       "TRIVIA",
//   CREATE_POST:          "FAN ZONE POST",
//   POST_CREATED:         "FAN ZONE POST",
//   REGISTRATION:         "REGISTRATION",
//   INVITE_ACCEPTED:      "REFERRAL",
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // HELPERS
// // ─────────────────────────────────────────────────────────────────────────────

// function makeHistoryItem(
//   key:       ActivityKey,
//   details:   string,
//   points:    number,
//   atDate?:   Date,
//   id         = `hi_${Date.now()}`,
//   action?:   string,
//   source?:   string
// ): HistoryItem {
//   const d    = atDate ?? new Date();
//   const meta = ACTIVITY_META[key];
//   return {
//     id, key,
//     action:    action || meta.action,
//     details, points,
//     type:      meta.type,
//     source:    source || meta.type,
//     date:      d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
//     timestamp: d.getTime(),
//     time:      d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
//     icon:      meta.icon,
//     color:     meta.color,
//     hexColor:  meta.hexColor,
//     typeColor: meta.typeColor,
//   };
// }

// /**
//  * normalizeActivityKey
//  *
//  * Strategy (in priority order):
//  *   1. Direct lookup in ACTIVITY_TYPE_MAP using the raw `type` string.
//  *      This handles every known enum value precisely with zero ambiguity.
//  *   2. Fuzzy substring scan of the combined "type label" string.
//  *      Retained only as a safety net for unknown/legacy types.
//  */
// function normalizeActivityKey(type: string = "", label: string = ""): ActivityKey {
//   // Add a fallback so undefined types don't crash
//   const safeType = type || "";
  
//   // 1. Direct enum lookup — always preferred
//   const direct = ACTIVITY_TYPE_MAP[safeType.toUpperCase().replace(/-/g, "_")];
//   if (direct) return direct;

//   // 2. Fuzzy fallback — concatenate both fields, lowercase, normalise separators
//   const value = `${safeType} ${label}`.toLowerCase().replace(/[_-]+/g, " ");

//   if (value.includes("audio") || value.includes("listen"))              return "audioDrop";
//   if (value.includes("battle win"))                                      return "fanBattleWin";
//   if (value.includes("battle play") || value.includes("fan battle"))    return "fanBattlePlay";
//   if (value.includes("trivia") || value.includes("quiz"))               return "trivia";
//   if (value.includes("register") || value.includes("signup") ||
//       value.includes("sign up") || value.includes("joined"))            return "register";
//   if (value.includes("invite") || value.includes("referral"))           return "invite";
//   if (value.includes("hot take"))                                        return "roarHotTake";
//   if (value.includes("prediction"))                                      return "roarPrediction";
//   if (value.includes("debate"))                                          return "roarDebate";
//   if (value.includes("memory"))                                          return "roarMemory";
//   if (value.includes("roar post"))                                       return "roarPost";
//   if (value.includes("reaction") && value.includes("roar"))             return "roarReaction";
//   if (value.includes("watch") || value.includes("video"))               return "watchDrop";
//   if (value.includes("like"))                                            return "like";
//   if (value.includes("share") && !value.includes("roar"))               return "share";
//   if (value.includes("post") || value.includes("create"))               return "post";

//   return "other";
// }

// function normalizeTimestamp(createdAt: number): number {
//   if (!createdAt) return Date.now();
//   return createdAt < 1_000_000_000_000 ? createdAt * 1000 : createdAt;
// }

// function readableSource(source: string) {
//   return source
//     .replace(/[_-]+/g, " ")
//     .replace(/\s+/g, " ")
//     .trim()
//     .replace(/\b\w/g, (l) => l.toUpperCase());
// }

// // FIX 1 — metadataText now includes "sport" and "postId" so ROAR activities
// // (whose metadata is { postId, sport }) get a meaningful details string instead
// // of falling through to a blank / raw-type fallback.
// function metadataText(metadata: ActivityItem["metadata"]) {
//   const keys = [
//     "title", "postTitle", "audioTitle", "videoTitle", "battleTitle",
//     "matchName", "question", "resourceName", "name", "transactionId",
//     "sport",   // FIX 1: ROAR activities carry { postId, sport }
//   ];
//   // Primary textual field (title/postTitle/etc.)
//   let primary = "";
//   for (const key of keys) {
//     const value = metadata?.[key];
//     if (typeof value === "string" && value.trim()) {
//       primary = value.trim();
//       break;
//     }
//     if (typeof value === "number") {
//       primary = String(value);
//       break;
//     }
//   }

//   // Room-related fallbacks / suffix
//   const room = metadata?.roomName || metadata?.room || metadata?.room_label || metadata?.roomId;
//   if (primary && room) return `${primary} — ${room}`;
//   if (primary) return primary;
//   if (typeof room === "string") return room;
//   return "";
// }

// function activityToHistoryItem(activity: ActivityItem): HistoryItem {
//   // Pass safe strings to prevent crashes
//   const safeType = activity.type || "";
//   const key      = normalizeActivityKey(safeType, activity.label);
//   const rawType  = (safeType || key).toUpperCase();

//   // FIX 6: Use the SOURCE_LABEL_MAP for a clean, consistent badge label.
//   const source   = SOURCE_LABEL_MAP[rawType] ?? readableSource(safeType || key);

//   // FIX 1: metadataText now picks up "sport", so ROAR details show the sport
//   const details  = metadataText(activity.metadata) || activity.label || source;

//   const meta     = ACTIVITY_META[key];
//   return makeHistoryItem(
//     key, details, Number(activity.points) || 0,
//     new Date(normalizeTimestamp(activity.createdAt)),
//     activity.id,
//     activity.label && activity.label !== activity.type
//       ? activity.label
//       : meta.action,
//     source
//   );
// }

// function calculateLevelData(totalXp: number) {
//   let level = 1, xpForNextLevel = 1000, xpAccumulated = 0;
//   while (totalXp >= xpAccumulated + xpForNextLevel) {
//     xpAccumulated += xpForNextLevel;
//     level++;
//     xpForNextLevel = level * 1000;
//   }
//   const currentLevelXp = totalXp - xpAccumulated;
//   return {
//     level, currentLevelXp, xpForNextLevel,
//     xpRemaining: xpForNextLevel - currentLevelXp,
//     progressPercentage: Math.min(100, Math.round((currentLevelXp / xpForNextLevel) * 100)),
//   };
// }

// // FIX 4: getEarningBreakdown now accepts the already-filtered (this-month)
// // history so the donut slices are consistent with the "This Month" centre label.
// function getEarningBreakdown(history: HistoryItem[]): CategoryBreakdown[] {
//   if (!history.length) return [];
//   const total = history.reduce((s, h) => s + h.points, 0);

//   // Group by ActivityKey so each distinct activity type gets its own slice
//   const grouped: Record<string, { label: string; xpValue: number; color: string }> = {};
//   history.forEach((h) => {
//     if (!grouped[h.key]) {
//       grouped[h.key] = { label: h.action, xpValue: 0, color: h.hexColor };
//     }
//     grouped[h.key].xpValue += h.points;
//   });

//   return Object.values(grouped)
//     .sort((a, b) => b.xpValue - a.xpValue)
//     .map((g) => ({
//       label:   g.label,
//       color:   g.color,
//       xpValue: g.xpValue,
//       percent: total > 0 ? Math.round((g.xpValue / total) * 100) : 0,
//       xp:      `+${g.xpValue.toLocaleString()} SXP`,
//     }));
// }

// // Streak data derived purely from activityLog timestamps — no extra DB call needed.
// function getDynamicStreakData(history: HistoryItem[]) {
//   const today      = new Date();
//   const todayMid   = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
//   const weekday    = today.getDay();
//   const adjustedDay = weekday === 0 ? 6 : weekday - 1; // Monday = 0
//   const days       = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

//   const historyDates = new Set(
//     history.map((h) => {
//       const d = new Date(h.timestamp);
//       return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
//     })
//   );

//   // Current streak (consecutive days with activity going back from today)
//   let currentStreak = 0;
//   let checkDate     = todayMid;
//   while (historyDates.has(checkDate)) {
//     currentStreak++;
//     checkDate -= 86400000;
//   }

//   // Longest streak from all history
//   const sortedDates = Array.from(historyDates).sort();
//   let longestStreak = 0, runStreak = 0, prevDate: number | null = null;
//   for (const d of sortedDates) {
//     if (prevDate !== null && d - prevDate === 86400000) {
//       runStreak++;
//     } else {
//       runStreak = 1;
//     }
//     longestStreak = Math.max(longestStreak, runStreak);
//     prevDate = d;
//   }

//   const streakMap = days.map((day, i) => {
//     const dayMid      = todayMid + (i - adjustedDay) * 86400000;
//     const hasActivity = historyDates.has(dayMid);
//     const isPast      = dayMid < todayMid;
//     return {
//       day,
//       isActive: hasActivity,
//       isMissed: !hasActivity && isPast,
//       isFuture: dayMid > todayMid,
//       isToday:  dayMid === todayMid,
//     };
//   });

//   return { streakMap, currentStreak, longestStreak };
// }

// function getTrendAnalytics(history: HistoryItem[], period: TrendPeriod) {
//   const now      = Date.now();
//   const daysMap: Record<TrendPeriod, number> = { "7D": 7, "30D": 30, "90D": 90 };
//   const days     = daysMap[period];
//   const msPerDay = 86400000;
//   const today = new Date();

//   const todayMidnight = new Date(
//     today.getFullYear(),
//     today.getMonth(),
//     today.getDate()
//   ).getTime();

//   const currentStart = todayMidnight - (days - 1) * msPerDay;
//   const previousStart = currentStart - days * msPerDay;

//   // Use a sensible number of chart buckets per period
//   const bucketCount =
//   period === "7D"
//     ? 7
//     : period === "30D"
//     ? 30
//     : 90;

//   const buckets = new Array(bucketCount).fill(0);
//   let currentPts   = 0;
//   let previousPts  = 0;

//   // ALL activity types contribute — no filtering by type
//   history.forEach((item) => {
//     const t = item.timestamp;
//     if (t >= currentStart && t <= now) {
//       currentPts += item.points;
//       const activityDate = new Date(t);
//       const activityDay = new Date(
//         activityDate.getFullYear(),
//         activityDate.getMonth(),
//         activityDate.getDate()
//       ).getTime();

//       const startDay = new Date(currentStart);
//       const startDayMidnight = new Date(
//         startDay.getFullYear(),
//         startDay.getMonth(),
//         startDay.getDate()
//       ).getTime();

//       const idx = Math.floor(
//         (activityDay - startDayMidnight) / msPerDay
//       );

//       if (idx >= 0 && idx < bucketCount) {
//         buckets[idx] += item.points;
//       }
//     } else if (t >= previousStart && t < currentStart) {
//       previousPts += item.points;
//     }
//   });

//   const percentChange =
//     previousPts > 0
//       ? Math.round(((currentPts - previousPts) / previousPts) * 100)
//       : currentPts > 0 ? 100 : 0;

//   const fmt = (d: Date, opts: Intl.DateTimeFormatOptions) =>
//     d.toLocaleDateString("en-US", opts);

//   const labels = buckets.map((_, index) => {
//   const d = new Date(currentStart + index * msPerDay);

//   if (period === "90D" && index % 15 !== 0) {
//     return "";
//   }

//   if (period === "30D" && index % 5 !== 0) {
//     return "";
//   }

//   return d.toLocaleDateString("en-US", {
//     month: "short",
//     day: "numeric",
//   });
// });

//   const vsMap: Record<TrendPeriod, string> = {
//     "7D": "vs prev week", "30D": "vs prev month", "90D": "vs prev 90d",
//   };

//   return {
//   chartData: buckets,
//   percentChange,
//   isPositive: percentChange >= 0,
//   labels,
//   vsText: vsMap[period],
//   currentPts,
// };
// }

// function applyFilters(
//   history:        HistoryItem[],
//   categoryFilter: CategoryFilter,
//   dateFilter:     DateFilter
// ): HistoryItem[] {
//   const now          = Date.now();
//   const msPerDay     = 86400000;
//   const thisMonthStart = new Date(
//     new Date().getFullYear(), new Date().getMonth(), 1
//   ).getTime();

//   return history.filter((item) => {
//     // Category
//     if (categoryFilter !== "All Activities" && item.type !== categoryFilter) return false;
//     // Date
//     if (dateFilter === "Last 7 Days"  && item.timestamp < now - 7  * msPerDay) return false;
//     if (dateFilter === "Last 30 Days" && item.timestamp < now - 30 * msPerDay) return false;
//     if (dateFilter === "This Month"   && item.timestamp < thisMonthStart)       return false;
//     return true;
//   });
// }

// function getCurrentMonthLabel() {
//   return new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
// }
// function getPreviousMonthLabel() {
//   const d = new Date();
//   d.setDate(1);
//   d.setMonth(d.getMonth() - 1);
//   return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // STATIC DATA
// // ─────────────────────────────────────────────────────────────────────────────
// const earnPointsActions = [
//   { icon: Megaphone,      title: "Post On ROAR",       xp: "+2 SXP", desc: "Per post on ROAR",      color: "text-orange-400", bg: "bg-orange-400/10" },
//   { icon: MessagesSquare, title: "Start a Debate",      xp: "+2 SXP", desc: "Per debate started",    color: "text-cyan-400",   bg: "bg-cyan-400/10"   },
//   { icon: Flame,          title: "Post Hot Take",        xp: "+2 SXP", desc: "Per hot take posted",   color: "text-amber-500",  bg: "bg-amber-500/10"  },
//   { icon: TrendingUp,     title: "Share Prediction",    xp: "+2 SXP", desc: "Per prediction shared", color: "text-lime-400",   bg: "bg-lime-400/10"   },
//   { icon: Sparkles,       title: "Share Memory",         xp: "+2 SXP", desc: "Per memory shared",     color: "text-pink-400",   bg: "bg-pink-400/10"   },
//   { icon: Headphones,     title: "Listen Audio Drops",  xp: "+2 SXP", desc: "Per drop (90%)",        color: "text-sky-400",    bg: "bg-sky-400/10"    },
// ];

// const buildFanZoneShareUrl = () => {
//   if (typeof window === "undefined") return "";
//   return `${window.location.origin}/MainModules/Fanszone`;
// };
// const buildFanZoneShareText = () => {
//   const shareUrl = buildFanZoneShareUrl();
//   return [
//     "Join me on Sportsfan Fan Zone",
//     "Earn SXP, track your fan activity, and climb the leaderboard.",
//     `Join here: ${shareUrl}`,
//   ].join("\n");
// };
// const copyToClipboard = async (text: string) => {
//   try {
//     await navigator.clipboard.writeText(text);
//     return true;
//   } catch {
//     try {
//       const input = document.createElement("textarea");
//       input.value = text;
//       input.style.position = "fixed";
//       input.style.opacity  = "0";
//       document.body.appendChild(input);
//       input.focus();
//       input.select();
//       const ok = document.execCommand("copy");
//       document.body.removeChild(input);
//       return ok;
//     } catch {
//       return false;
//     }
//   }
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // DONUT CHART
// // FIX 4: Slices now represent THIS MONTH's activity (caller passes
// // thisMonthHistory), so they are consistent with the "This Month" centre label.
// // ─────────────────────────────────────────────────────────────────────────────
// function DonutChart({
//   data,
//   centerPoints,
// }: {
//   data:          CategoryBreakdown[];
//   centerPoints:  string;
// }) {
//   const RADIUS        = 25.91549430918954;
//   const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
//   let offsetPercent   = 0;

//   const slices = data.map((slice) => {
//     const dashLength = (slice.percent / 100) * CIRCUMFERENCE;
//     const gapLength  = CIRCUMFERENCE - dashLength;
//     const rotation   = (offsetPercent / 100) * 360 - 90;
//     offsetPercent   += slice.percent;
//     return { ...slice, dashLength, gapLength, rotation };
//   });

//   const isEmpty = data.length === 0;

//   return (
//     <div className="relative w-44 h-44 shrink-0 mx-auto sm:mx-0">
//       <svg viewBox="0 0 100 100" className="w-full h-full -rotate-6">
//         {isEmpty ? (
//           <circle
//             cx="50" cy="50" r={RADIUS} fill="transparent"
//             stroke="#27272a" strokeWidth="8"
//           />
//         ) : (
//           slices.map((slice, i) => (
//             <circle
//               key={i} cx="50" cy="50" r={RADIUS} fill="transparent"
//               stroke={slice.color} strokeWidth="8"
//               strokeDasharray={`${slice.dashLength} ${slice.gapLength}`}
//               strokeDashoffset={0}
//               transform={`rotate(${slice.rotation} 50 50)`}
//               className="transition-all duration-1000 ease-out"
//             />
//           ))
//         )}
//       </svg>
//       <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
//         <span className="text-2xl font-black text-white">{isEmpty ? "0" : centerPoints}</span>
//         <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">SXP</span>
//         <span className="text-[9px] text-gray-600 font-medium mt-0.5">This Month</span>
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // BREAKDOWN LEGEND
// // ─────────────────────────────────────────────────────────────────────────────
// function BreakdownLegend({ data }: { data: CategoryBreakdown[] }) {
//   if (data.length === 0) {
//     return (
//       <div className="space-y-3 opacity-40 w-full">
//         {["Audio Drops", "Fan Battles", "Trivia", "ROAR Posts"].map((label, i) => (
//           <div key={i} className="flex items-center gap-3 text-sm">
//             <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-zinc-700" />
//             <span className="text-gray-600 flex-1">{label}</span>
//             <span className="text-gray-700">—</span>
//           </div>
//         ))}
//       </div>
//     );
//   }
//   return (
//     <div className="w-full space-y-3">
//       {data.map((item, i) => (
//         <div
//           key={i}
//           className="grid items-start text-sm w-full"
//           style={{ gridTemplateColumns: "10px 1fr auto", columnGap: "8px" }}
//         >
//           <span
//             className="w-2.5 h-2.5 rounded-full shrink-0 mt-0.5"
//             style={{ backgroundColor: item.color }}
//           />
//           <span className="text-gray-300 whitespace-normal break-words">{item.label}</span>
//           <span className="whitespace-nowrap flex items-start justify-end" style={{ paddingLeft: "8px" }}>
//             <span className="font-bold text-white">{item.percent}%</span>
//             <span className="text-gray-400 ml-1 text-xs">{item.xp}</span>
//           </span>
//         </div>
//       ))}
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // TREND BAR CHART
// // ─────────────────────────────────────────────────────────────────────────────
// function TrendLineChart({
//   data,
//   labels,
// }: {
//   data: number[];
//   labels: string[];
// }) {
//   const width = 100;
//   const height = 40;

//   const max = Math.max(...data, 1);

//   const points = data
//     .map((value, index) => {
//       const x = (index / (data.length - 1)) * width;
//       const y = height - (value / max) * height;
//       return `${x},${y}`;
//     })
//     .join(" ");

//   return (
//     <div className="w-full">
//       <svg
//         viewBox={`0 0 ${width} ${height}`}
//         className="w-full h-28 overflow-visible"
//         preserveAspectRatio="none"
//       >
//         <defs>
//           <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
//             <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.35" />
//             <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
//           </linearGradient>
//         </defs>

//         {/* Area Fill */}
//         <polygon
//           fill="url(#trendFill)"
//           points={`0,40 ${points} 100,40`}
//         />

//         {/* Line */}
//         <polyline
//           fill="none"
//           stroke="#f43f5e"
//           strokeWidth="2"
//           points={points}
//         />

//         {/* Dots */}
//         {data.map((value, index) => {
//           const x = (index / (data.length - 1)) * width;
//           const y = height - (value / max) * height;

//           return (
//             <circle
//               key={index}
//               cx={x}
//               cy={y}
//               r="1.5"
//               fill="#f43f5e"
//             />
//           );
//         })}
//       </svg>

//       <div className="flex justify-between text-[9px] text-gray-500 font-bold mt-2">
//         {labels.map((label, i) => (
//           <span key={i}>{label}</span>
//         ))}
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // INFO ICON
// // ─────────────────────────────────────────────────────────────────────────────
// function InfoIcon() {
//   return (
//     <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border border-gray-600 text-[9px] text-gray-500 cursor-help hover:text-gray-300 hover:border-gray-400 transition-colors">
//       i
//     </span>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // HISTORY TABLE
// // ─────────────────────────────────────────────────────────────────────────────
// function HistoryTable({
//   rows,
//   loading,
// }: {
//   rows:    HistoryItem[];
//   loading: boolean;
// }) {
//   return (
//     <div className="overflow-x-auto">
//       <table className="w-full text-left border-collapse">
//         <thead>
//           <tr className="border-b border-white/10">
//             <th className="py-4 px-2 text-[10px] font-black text-gray-500 uppercase tracking-widest w-40">Date</th>
//             <th className="py-4 px-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">Activity</th>
//             <th className="py-4 px-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">Details</th>
//             <th className="py-4 px-2 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Points</th>
//             <th className="py-4 px-2 pl-8 text-[10px] font-black text-gray-500 uppercase tracking-widest w-40">Source</th>
//           </tr>
//         </thead>
//         <tbody>
//           {loading ? (
//             <tr>
//               <td colSpan={5} className="text-center text-gray-500 py-8 text-sm">
//                 Loading activity...
//               </td>
//             </tr>
//           ) : rows.length === 0 ? (
//             <tr>
//               <td colSpan={5} className="text-center text-gray-500 py-8 text-sm">
//                 No activity recorded yet.
//               </td>
//             </tr>
//           ) : (
//             rows.map((row) => (
//               <tr
//                 key={row.id}
//                 className="border-b border-white/5 hover:bg-white/5 transition-colors group"
//               >
//                 <td className="py-3 px-2">
//                   <p className="text-xs text-gray-300 font-medium">{row.date}</p>
//                   <p className="text-[10px] text-gray-500">{row.time}</p>
//                 </td>
//                 <td className="py-3 px-2">
//                   <div className="flex items-center gap-3">
//                     <div className="w-8 h-8 rounded-lg bg-[#18181b] border border-white/10 flex items-center justify-center flex-shrink-0">
//                       <row.icon className={`w-4 h-4 ${row.color}`} />
//                     </div>
//                     <span className="text-xs font-bold text-white">{row.action}</span>
//                   </div>
//                 </td>
//                 <td className="py-3 px-2 text-xs text-gray-400 font-medium max-w-[180px] truncate">
//                   {row.details}
//                 </td>
//                 <td className="py-3 px-2 text-right">
//                   <span className="text-xs font-black text-emerald-500">+{row.points}</span>
//                 </td>
//                 <td className="py-3 px-2 pl-8">
//                   <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-[10px] font-bold border ${row.typeColor}`}>
//                     {row.source}
//                   </span>
//                 </td>
//               </tr>
//             ))
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // MAIN DASHBOARD
// // ─────────────────────────────────────────────────────────────────────────────
// export default function FanZoneDashboard() {
//   const [activeTab,       setActiveTab]       = useState("My Analytics");
//   const [trendPeriod,     setTrendPeriod]     = useState<TrendPeriod>("30D");
//   const [showShareDialog, setShowShareDialog] = useState(false);
//   const [copied,          setCopied]          = useState(false);
//   const [historyPage,     setHistoryPage]     = useState(1);
//   const [categoryFilter,  setCategoryFilter]  = useState<CategoryFilter>("All Activities");
//   const [dateFilter,      setDateFilter]      = useState<DateFilter>("All Time");
//   const earningHistoryRef = useRef<HTMLDivElement>(null);
//   const ITEMS_PER_PAGE = 20;

//   const contextData        = useLeaderboard() as LeaderboardContextType | null;
//   const currentUserPoints  = contextData?.currentUserPoints ?? 0;
//   const currentUserRank    = contextData?.currentUserRank   ?? 0;

//   // FIX 3: ActivityContext limit raised to 200 in ActivityContext.tsx.
//   // Here we simply consume whatever the context provides — no change needed
//   // in this file, but note the companion fix in ActivityContext.tsx.
//   const { activities, loading: activitiesLoading } = useActivity();

//   // Convert all ActivityItems to HistoryItems — no type filtering
//   const history = useMemo(
//     () => activities.map(activityToHistoryItem).sort((a, b) => b.timestamp - a.timestamp),
//     [activities]
//   );

//   // Track rank changes across renders for the rank delta widget
//   const [rankSnapshot, setRankSnapshot] = useState({ prev: 0, current: 0 });
//   useEffect(() => {
//     if (currentUserRank === 0) return;
//     if (rankSnapshot.current !== currentUserRank) {
//       setRankSnapshot({ prev: rankSnapshot.current, current: currentUserRank });
//     }
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [currentUserRank]);

//   const totalPoints  = currentUserPoints > 0
//     ? currentUserPoints
//     : history.reduce((s, h) => s + h.points, 0);
//   const displayPoints = totalPoints.toLocaleString();

//   const now            = new Date();
//   const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
//   const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();

//   // FIX 4: Filter history to this month BEFORE passing to getEarningBreakdown
//   // so donut slices match the "This Month" centre label.
//   const thisMonthHistory = useMemo(
//     () => history.filter((h) => h.timestamp >= thisMonthStart),
//     [history, thisMonthStart]
//   );

//   // All analytics derived from the full history — every activity type included
//   const earningBreakdown = useMemo(() => getEarningBreakdown(thisMonthHistory), [thisMonthHistory]);
//   const trendAnalytics   = useMemo(() => getTrendAnalytics(history, trendPeriod), [history, trendPeriod]);
//   const levelData        = useMemo(() => calculateLevelData(totalPoints), [totalPoints]);
//   const { streakMap, currentStreak, longestStreak } =
//     useMemo(() => getDynamicStreakData(history), [history]);

//   // Filtered history for Earning History tab
//   const filteredHistory = useMemo(
//     () => applyFilters(history, categoryFilter, dateFilter),
//     [history, categoryFilter, dateFilter]
//   );
//   const pagedHistory = useMemo(
//     () => filteredHistory.slice(0, historyPage * ITEMS_PER_PAGE),
//     [filteredHistory, historyPage]
//   );
//   const hasMore = pagedHistory.length < filteredHistory.length;

//   // Recent activities — ALL types, newest 5
//   const recentActivityList = useMemo(
//     () => history.slice(0, 5).map((h) => ({
//       icon:     h.icon,
//       action:   h.action,
//       detail:   h.details,
//       xp:       h.points,
//       time:     h.time,
//       color:    h.color,
//       hexColor: h.hexColor,
//     })),
//     [history]
//   );

//   // roomGroups removed: room activity will be surfaced inline in existing UI

//   const rankDiff = rankSnapshot.prev > 0 && rankSnapshot.current > 0
//     ? Math.abs(rankSnapshot.prev - rankSnapshot.current) : 0;
//   const isRankUp = rankSnapshot.prev > 0 && rankSnapshot.current > 0
//     && rankSnapshot.current < rankSnapshot.prev;

//   const currentMonthLabel  = getCurrentMonthLabel();
//   const previousMonthLabel = getPreviousMonthLabel();

//   const thisMonthPoints = useMemo(
//     () => thisMonthHistory.reduce((s, h) => s + h.points, 0),
//     [thisMonthHistory]
//   );
//   const lastMonthPoints = useMemo(
//     () => history.filter((h) => h.timestamp >= lastMonthStart && h.timestamp < thisMonthStart)
//       .reduce((s, h) => s + h.points, 0),
//     [history, lastMonthStart, thisMonthStart]
//   );
//   const monthDiff      = thisMonthPoints - lastMonthPoints;
//   const monthPctChange = lastMonthPoints > 0
//     ? Math.round((monthDiff / lastMonthPoints) * 100)
//     : thisMonthPoints > 0 ? 100 : 0;
//   const displayMonthlyPoints = thisMonthPoints.toLocaleString();

//   // ── Share helpers ──────────────────────────────────────────────────────────
//   const openShareDialog  = () => { setShowShareDialog(true);  setCopied(false); };
//   const closeShareDialog = () => { setShowShareDialog(false); setCopied(false); };

//   const handleShareToWhatsApp = () =>
//     window.open(`https://wa.me/?text=${encodeURIComponent(buildFanZoneShareText())}`, "_blank");
//   const handleShareToThreads = () =>
//     window.open(`https://www.threads.net/intent/post?text=${encodeURIComponent(buildFanZoneShareText())}`, "_blank");
//   const handleShareToInstagram = async () => {
//     await copyToClipboard(buildFanZoneShareText());
//     setCopied(true);
//     setTimeout(() => setCopied(false), 1600);
//     window.open("https://www.instagram.com/", "_blank");
//   };
//   const handleShareToLinkedIn = () =>
//     window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(buildFanZoneShareUrl())}`, "_blank");
//   const handleShareToX = () =>
//     window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(buildFanZoneShareText())}`, "_blank");
//   const handleCopyLink = async () => {
//     const ok = await copyToClipboard(buildFanZoneShareText());
//     if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1600); }
//   };

//   // ── Sub-components (defined inline so they close over the local state) ─────

//   const StreakWidget = () => (
//     <div className="bg-[#09090b] border border-white/10 rounded-2xl p-6">
//       <h3 className="text-xs font-black tracking-widest text-gray-400 uppercase mb-1 flex items-center gap-1.5">
//         Your Streak <InfoIcon />
//       </h3>
//       <div className="flex items-baseline gap-4 mb-4 mt-2">
//         <div>
//           <div className="flex items-baseline gap-2">
//             <h2 className="text-4xl font-black text-white">{currentStreak}</h2>
//             <span className="text-base font-medium text-gray-400">
//               day{currentStreak !== 1 ? "s" : ""}
//             </span>
//           </div>
//           <p className="text-[10px] text-gray-500 font-medium mt-0.5 uppercase tracking-widest">Current</p>
//         </div>
//         <div className="w-px h-10 bg-white/10 self-center" />
//         <div>
//           <div className="flex items-baseline gap-2">
//             <h2 className="text-2xl font-black text-amber-500">{longestStreak}</h2>
//             <span className="text-sm font-medium text-gray-400">
//               day{longestStreak !== 1 ? "s" : ""}
//             </span>
//           </div>
//           <p className="text-[10px] text-gray-500 font-medium mt-0.5 uppercase tracking-widest">Best</p>
//         </div>
//       </div>
//       <p className="text-xs text-gray-500 mb-5">
//         {currentStreak > 0
//           ? "Keep it going — don't break your streak!"
//           : "Engage today to start a new streak!"}
//       </p>
//       <div className="flex justify-between items-center">
//         {streakMap.map((data) => (
//           <div key={data.day} className="flex flex-col items-center gap-2">
//             <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
//               data.isActive
//                 ? "bg-rose-600 border-rose-500 text-white shadow-[0_0_10px_rgba(225,29,72,0.4)]"
//                 : data.isToday
//                   ? "bg-[#18181b] border-rose-500/50 text-rose-500"
//                   : data.isMissed
//                     ? "bg-[#0f0a0a] border-red-900/50 text-red-900"
//                     : "bg-[#18181b] border-white/10 text-gray-600"
//             }`}>
//               {data.isActive
//                 ? <CheckCircle2 className="w-4 h-4" />
//                 : data.isMissed
//                   ? <X className="w-3 h-3 opacity-50" />
//                   : null}
//             </div>
//             <span className={`text-[10px] font-bold ${
//               data.isToday ? "text-rose-400" : data.isActive ? "text-white" : "text-gray-600"
//             }`}>
//               {data.day}
//             </span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );

//   const InviteWidget = () => (
//     <div
//       className="bg-[#09090b] border border-rose-500/20 rounded-2xl p-6 flex items-center justify-between overflow-hidden relative group cursor-pointer hover:border-rose-500/50 transition-colors"
//       onClick={openShareDialog}
//     >
//       <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-20 group-hover:scale-110 transition-transform duration-500 translate-x-4">
//         <UserPlus className="w-32 h-32 text-rose-500" />
//       </div>
//       <div className="relative z-10">
//         <h3 className="text-lg font-black text-white mb-1">Invite Friends</h3>
//         <p className="text-sm text-gray-400 mb-4">Share Fan Zone and bring your crew in!</p>
//         <button
//           type="button"
//           onClick={(e) => { e.stopPropagation(); openShareDialog(); }}
//           className="bg-gradient-to-r from-rose-600 to-orange-500 text-white text-sm font-bold py-2.5 px-6 rounded-full hover:shadow-[0_0_15px_rgba(225,29,72,0.4)] transition-all"
//         >
//           Invite Now
//         </button>
//       </div>
//     </div>
//   );

//   const RecentActivityWidget = () => (
//     <div className="bg-[#09090b] border border-white/10 rounded-2xl p-6 flex flex-col">
//       <h3 className="text-xs font-black tracking-widest text-gray-400 uppercase mb-6">
//         Recent Activity
//       </h3>
//       <div className="flex-1 space-y-5">
//         {recentActivityList.length === 0 ? (
//           <p className="text-sm text-gray-500 text-center py-4">
//             No activity yet — start earning!
//           </p>
//         ) : (
//           recentActivityList.map((item, i) => (
//             <div key={i} className="flex items-center justify-between group">
//               <div className="flex items-center gap-4 min-w-0">
//                 <div className={`w-8 h-8 rounded-full bg-[#18181b] border border-white/5 flex items-center justify-center shrink-0 ${item.color}`}>
//                   <item.icon className="w-4 h-4" />
//                 </div>
//                 <p className="text-sm truncate min-w-0">
//                   <span className="font-bold text-white mr-1">{item.action}</span>
//                   {item.detail && (
//                     <span className="text-gray-400">{item.detail}</span>
//                   )}
//                 </p>
//               </div>
//               <div className="text-right shrink-0 ml-3">
//                 <p className="text-sm font-black" style={{ color: item.hexColor }}>
//                   +{item.xp} SXP
//                 </p>
//                 <p className="text-[10px] text-gray-500 font-medium">{item.time}</p>
//               </div>
//             </div>
//           ))
//         )}
//       </div>
//       <button
//         onClick={() => {
//           setActiveTab("Earning History");
//           setHistoryPage(1);
//           setTimeout(
//             () => earningHistoryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
//             50
//           );
//         }}
//         className="text-xs font-bold text-rose-500 hover:text-rose-400 text-center w-full mt-6 py-2 border border-rose-500/20 rounded-lg hover:bg-rose-500/5 transition-colors uppercase tracking-widest"
//       >
//         Show Full Earning History →
//       </button>
//     </div>
//   );

//   const shareButtons = (size: string) => (
//     <>
//       {[
//         { handler: handleShareToWhatsApp,  src: "/images/share_whatsapp.png", alt: "WhatsApp"  },
//         { handler: handleShareToThreads,   src: "/images/share_thread.png",   alt: "Threads"   },
//         { handler: handleShareToInstagram, src: "/images/share_insta.png",    alt: "Instagram" },
//         { handler: handleShareToLinkedIn,  src: "/images/Share_linkedin.png", alt: "LinkedIn"  },
//         { handler: handleShareToX,         src: "/images/Share_X.png",        alt: "X"         },
//         { handler: handleCopyLink,         src: "/images/share_copy_link.png",alt: "Copy"      },
//       ].map(({ handler, src, alt }) => (
//         <button
//           key={alt}
//           onClick={handler}
//           className={`${size} shrink-0 rounded-full overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center`}
//           type="button"
//         >
//           <Image
//             src={src} alt={alt} width={36} height={36}
//             className="w-full h-full object-cover rounded-full"
//           />
//         </button>
//       ))}
//     </>
//   );

//   // ─────────────────────────────────────────────────────────────────────────
//   // RENDER
//   // ─────────────────────────────────────────────────────────────────────────
//   function InfoHelp() {
//     const [open, setOpen] = useState(false);
//     const [hover, setHover] = useState(false);
//     const tooltipRef = useRef<HTMLDivElement>(null);
//     const buttonRef = useRef<HTMLButtonElement>(null);
//     const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });

//     useEffect(() => {
//       const handleClickOutside = (e: MouseEvent) => {
//         if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
//           setOpen(false);
//         }
//       };

//       const handleEscape = (e: KeyboardEvent) => {
//         if (e.key === 'Escape') setOpen(false);
//       };

//       if (open) {
//         document.addEventListener('mousedown', handleClickOutside);
//         document.addEventListener('keydown', handleEscape);
//       }

//       return () => {
//         document.removeEventListener('mousedown', handleClickOutside);
//         document.removeEventListener('keydown', handleEscape);
//       };
//     }, [open]);

//     useEffect(() => {
//       if (buttonRef.current && (open || hover)) {
//         const rect = buttonRef.current.getBoundingClientRect();
//         setTooltipPos({
//           top: rect.bottom + 12,
//           left: rect.left + rect.width / 2 - 140,
//         });
//       }
//     }, [open, hover]);

//     return (
//       <div
//         ref={tooltipRef}
//         style={{ position: 'relative', display: 'inline-block', overflow: 'visible', zIndex: 999 }}
//         onMouseEnter={() => setHover(true)}
//         onMouseLeave={() => setHover(false)}
//       >
//         <button
//           ref={buttonRef}
//           aria-label="Fan Zone info"
//           aria-expanded={open}
//           onClick={() => setOpen((v) => !v)}
//           style={{
//             width: 24,
//             height: 24,
//             borderRadius: 50,
//             border: '1.5px solid rgba(244, 63, 94, 0.6)',
//             background: 'transparent',
//             display: 'flex', alignItems: 'center', justifyContent: 'center',
//             color: '#f472b6', cursor: 'pointer', padding: 0,
//             transition: 'all 0.2s ease',
//             flexShrink: 0,
//           }}
//         >
//           <span style={{ 
//             fontWeight: 700, 
//             fontSize: 14,
//             color: '#f472b6',
//             transition: 'all 0.2s ease'
//           }}>i</span>
//         </button>

//         {(open || hover) && (
//           <div
//             ref={tooltipRef}
//             role="dialog"
//             aria-label="Fan Zone information"
//             style={{
//               position: 'fixed',
//               top: `${tooltipPos.top}px`,
//               left: `${Math.max(12, tooltipPos.left)}px`,
//               minWidth: '280px',
//               maxWidth: 'calc(100vw - 24px)',
//               background: 'rgba(15, 15, 20, 0.98)',
//               backdropFilter: 'blur(12px)',
//               border: '1px solid rgba(244, 63, 94, 0.4)',
//               borderRadius: 12,
//               padding: '16px 18px',
//               boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 1px rgba(244, 63, 94, 0.5)',
//               zIndex: 999999,
//               animation: 'fadeInScale 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
//               transformOrigin: 'top center',
//               pointerEvents: 'auto',
//               overflow: 'visible',
//             }}
//           >
//             <style>{`
//               @keyframes fadeInScale {
//                 from {
//                   opacity: 0;
//                   transform: scale(0.95) translateY(-6px);
//                 }
//                 to {
//                   opacity: 1;
//                   transform: scale(1) translateY(0);
//                 }
//               }
//             `}</style>
            
//             <p style={{ margin: '0 0 10px 0', color: 'rgba(255,255,255,0.9)', lineHeight: 1.5, fontSize: '13px' }}>
//               <strong style={{ color: '#f472b6', fontWeight: 600 }}>SXP</strong> stands for <span style={{ color: '#f472b6', fontWeight: 600 }}>SportsFan360 XP</span>. Earn points by engaging with the community and climb the ranks.
//             </p>
//             <div style={{ height: 10 }} />
//             <div style={{ fontWeight: 600, color: '#f472b6', marginBottom: 8, fontSize: '12px', letterSpacing: '0.01em' }}>Benefits of earning SXP:</div>
//             <ul style={{ margin: 0, paddingLeft: 18, color: 'rgba(255,255,255,0.85)', fontSize: '12px', lineHeight: 1.5 }}>
//               <li style={{ marginBottom: 5 }}>Climb the global leaderboard</li>
//               <li style={{ marginBottom: 5 }}>Unlock exclusive rewards</li>
//               <li>Level up your fan experience</li>
//             </ul>
//           </div>
//         )}
//       </div>
//     );
//   }
//   return (
//     <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-rose-500/30 pb-20">
//       <main className="max-w-[1400px] mx-auto px-3 py-3 sm:p-6 space-y-4 sm:space-y-6">

//       <style>{`
//   .fanzone-bar {
//     left: 0;
//   }
//   @media (min-width: 1024px) {
//     .fanzone-bar {
//       left: var(--sidebar-width, 84px);
//     }
//   }
// `}</style>

// <div
//     className="fanzone-bar"
//     style={{
//         position: "fixed",
//         top: 0,
//         right: 0,
//         zIndex: 200,
//         display: "flex",
//         alignItems: "center",
//         gap: 10,
//         padding: "14px 16px 12px",
//         background: "rgba(0,0,0,0.95)",
//         backdropFilter: "blur(20px)",
//         borderBottom: "1px solid rgba(255,255,255,0.06)",
//         transition: "left 0.3s ease-out",
//     }}
// >
//             <Link href="/MainModules/ROAR" style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: 12,
//                 textDecoration: "none",
//                 color: "white",
//                 flex: 1,
//                 maxWidth: '280px'
//             }}>
//                 <button
//                     style={{
//                         background: "none",
//                         border: "none",
//                         cursor: "pointer",
//                         color: "white",
//                         padding: "4px 2px",
//                         display: "flex",
//                         alignItems: "center",
//                         transition: 'opacity 0.2s ease'
//                     }}
//                     onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
//                     onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
//                 >
//                     <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
//         <path d="M15 18l-6-6 6-6" />
//       </svg>
//                 </button>
//                 <h3 style={{
//                   color: "white",
//                   margin: 0,
//                   fontSize: '16px',
//                   fontWeight: 700,
//                   letterSpacing: "0.01em"
//                 }}>
//                   FanZone
//                 </h3>
//             </Link>
//         </div>

//          <div style={{ height: 56 }} />


//         {/* ── HERO ── */}
//         <div className="relative rounded-xl overflow-visible border border-white/10 bg-[#09090b] flex items-center min-h-[90px]">
//           <div
//             className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-screen"
//             style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=1200&auto=format&fit=crop')" }}
//           />
//           <div className="absolute inset-0 bg-gradient-to-r from-black via-rose-950/70 to-transparent" />
//           <div className="relative z-10 px-5 py-4 w-full flex flex-row items-center justify-between gap-3">
//             <div className="flex items-center gap-3">
//               <div>
//                 <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-white drop-shadow-lg leading-none">
//                   FAN ZONE
//                 </h1>
//                 <p className="text-xs sm:text-sm font-medium text-gray-300 mt-1">Earn SXP. Rule the Fan Zone.</p>
//               </div>
//               <InfoHelp />
//             </div>
//           </div>
//         </div>

//         {/* ── STATS ROW ── */}
//         <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
//           {/* Level progress */}
//           <div className="col-span-2 md:col-span-2 bg-[#09090b] border border-white/10 rounded-2xl p-4 sm:p-5 flex items-center gap-4 sm:gap-5">
//             <div className="w-14 h-14 rounded-xl border-2 border-rose-500 flex items-center justify-center font-black text-2xl text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
//               {levelData.level}
//             </div>
//             <div className="flex-1">
//               <h3 className="text-base font-bold text-white mb-1">You&apos;re doing great!</h3>
//               <div className="flex justify-between items-end mb-2">
//                 <p className="text-xs text-gray-400">
//                   {levelData.xpRemaining.toLocaleString()} SXP to Level {levelData.level + 1}
//                 </p>
//                 <p className="text-xs font-bold text-gray-400">
//                   {levelData.currentLevelXp.toLocaleString()} / {levelData.xpForNextLevel.toLocaleString()}
//                 </p>
//               </div>
//               <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
//                 <div
//                   className="h-full bg-gradient-to-r from-rose-600 to-orange-500 rounded-full relative transition-all duration-1000 ease-in-out"
//                   style={{ width: `${levelData.progressPercentage}%` }}
//                 >
//                   <div className="absolute right-0 top-0 bottom-0 w-2 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,1)]" />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Rank */}
//          {/* Rank */}
// <div className="relative overflow-hidden rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-[#0f0c00] via-[#09090b] to-[#09090b] p-5">
//   <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(234,179,8,0.12),transparent_60%)]" />

//   <div className="relative flex items-center gap-5">
//     <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
//       <Trophy className="w-8 h-8 text-yellow-500" />
//     </div>

//     <div className="flex-1">
//       <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-yellow-500/70">
//         Your Rank
//       </p>

//       <div className="flex items-end gap-3 mt-1">
//         <h3 className="text-5xl font-black text-white leading-none">
//           {rankSnapshot.current > 0 ? rankSnapshot.current : "—"}
//         </h3>
//       </div>
//     </div>
//   </div>
// </div>

//           {/* Total SXP */}
//           {/* Total SXP */}
// <div className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-[#0b0715] via-[#09090b] to-[#09090b] p-5">
//   <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.12),transparent_60%)]" />

//   <div className="relative flex items-center gap-5">
//     <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
//       <Award className="w-8 h-8 text-purple-500" />
//     </div>

//     <div className="flex-1">
//       <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-purple-400/70">
//         Total SXP
//       </p>

//       <h3 className="text-5xl font-black text-white leading-none mt-1">
//         {displayPoints}
//       </h3>

//       <p className="text-xs text-gray-500 font-medium mt-2 uppercase tracking-wider">
//         All Time
//       </p>
//     </div>
//   </div>
// </div>

//           {/* Leaderboard link */}
//          <Link
//   href="/MainModules/Leaderboard"
//   className="bg-[#09090b] border border-rose-500/30 hover:border-rose-500 rounded-2xl p-5 flex flex-col items-center justify-center group hover:scale-[1.02] transition-all cursor-pointer relative overflow-hidden"
// >
//   <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

//   <div className="absolute top-3 right-3">
//     <ArrowUpRight className="w-4 h-4 text-rose-400 opacity-70 group-hover:opacity-100" />
//   </div>

//   <Trophy className="w-7 h-7 text-rose-500 mb-1.5 group-hover:scale-110 transition-all duration-300 relative z-10" />

//   <h3 className="text-sm font-black text-white text-center leading-tight tracking-wide relative z-10">
//     Global
//     <br />
//     Leaderboard
//   </h3>

//   <span className="mt-2 text-[10px] font-bold uppercase tracking-widest text-rose-400 relative z-10">
//     Climb The Ranks →
//   </span>
// </Link>
//         </div>

//         {/* ── TABS ── */}
//         <div className="border-b border-white/10 flex gap-8 px-2 overflow-x-auto">
//           {["My Analytics", "Earning History"].map((tab) => (
//             <button
//               key={tab}
//               onClick={() => setActiveTab(tab)}
//               className={`pb-4 text-sm font-bold whitespace-nowrap transition-all relative ${
//                 activeTab === tab ? "text-rose-500" : "text-gray-400 hover:text-gray-200"
//               }`}
//             >
//               {tab}
//               {activeTab === tab && (
//                 <div className="absolute bottom-0 left-0 w-full h-0.5 bg-rose-500 rounded-t-full shadow-[0_-2px_10px_rgba(244,63,94,0.5)]" />
//               )}
//             </button>
//           ))}
//         </div>

//         {/* ════════════════════════════════════════
//             TAB: MY ANALYTICS
//         ════════════════════════════════════════ */}
//         {activeTab === "My Analytics" && (
//           <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

//             {/* OVERVIEW CARD */}
//             <div className="bg-[#09090b] border border-white/10 rounded-2xl p-6 md:p-8">
//               <h3 className="text-[10px] font-black tracking-widest text-gray-500 uppercase mb-8 flex items-center gap-1.5">
//                 Overview <InfoIcon />
//               </h3>
//               <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12 items-start">

//                 {/* Left: month stats */}
//                 <div className="xl:col-span-3 w-full">
//                   <div className="inline-block bg-[#18181b] border border-white/10 text-sm font-bold rounded-xl px-4 py-2 text-white mb-6">
//                     {currentMonthLabel}
//                   </div>
                  
//                   <div className="space-y-6">
//                     <div>
//                       <p className="text-xs text-gray-400 font-medium mb-1">This Month</p>
//                       <div className="flex items-end gap-3 flex-wrap">
//                         <h4 className="text-3xl font-black text-white leading-none">
//                           {thisMonthPoints.toLocaleString()} SXP
//                         </h4>
//                         <span
//                           className="text-xs font-bold mb-0.5 flex items-center gap-0.5"
//                           style={{ color: monthPctChange >= 0 ? "#10b981" : "#f43f5e" }}
//                         >
//                           {monthPctChange >= 0 ? "↑" : "↓"} {Math.abs(monthPctChange)}%
//                           <span className="text-gray-500 font-medium ml-1">vs {previousMonthLabel}</span>
//                         </span>
//                       </div>
//                     </div>
//                     <div>
//                       <p className="text-xs text-gray-400 font-medium mb-1">All Time</p>
//                       <h4 className="text-3xl font-black text-white leading-none">{displayPoints} SXP</h4>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Middle: donut + legend — THIS MONTH's activity (FIX 4) */}
//                 <div className="xl:col-span-5 border-t border-white/10 xl:border-t-0 xl:border-l pt-8 xl:pt-0 xl:pl-6 overflow-hidden">
//                   <p className="text-[10px] font-black tracking-widest text-gray-500 uppercase mb-4 flex items-center gap-1.5">
//                     Points by Activity (This Month) <InfoIcon />
//                   </p>
//                   <div className="flex flex-col items-center xl:flex-row xl:items-center gap-4">
//                     <div className="shrink-0 mx-auto xl:mx-0">
//                       <DonutChart data={earningBreakdown} centerPoints={displayMonthlyPoints} />
//                     </div>
//                     <div className="w-full xl:flex-1 min-w-0 xl:pl-2">
//                       <BreakdownLegend data={earningBreakdown} />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Right: Trend graph — ALL activity types across all time ranges */}
//                 <div className="xl:col-span-4 border-t xl:border-t-0 xl:border-l border-white/10 pt-8 xl:pt-0 xl:pl-6 flex flex-col justify-start w-full">
//                   <div className="flex justify-between items-start mb-4">
//                     <h3 className="text-[10px] font-black tracking-widest text-gray-500 uppercase flex items-center gap-1.5">
//                       Points Trend <InfoIcon />
//                     </h3>
//                     <div className="flex gap-1 bg-[#18181b] p-1 rounded-lg border border-white/5">
//                       {(["7D", "30D", "90D"] as TrendPeriod[]).map((range) => (
//                         <button
//                           key={range}
//                           onClick={() => setTrendPeriod(range)}
//                           className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${
//                             trendPeriod === range
//                               ? "bg-[#27272a] text-white shadow-sm"
//                               : "text-gray-500 hover:text-white"
//                           }`}
//                         >
//                           {range}
//                         </button>
//                       ))}
//                     </div>
//                   </div>
//                   <div className="mb-4">
//                     <h4 className="text-2xl font-black text-white">
//                       +{trendAnalytics.currentPts.toLocaleString()} SXP
//                     </h4>
//                     <p className={`text-xs font-bold mt-0.5 flex items-center gap-1 ${trendAnalytics.isPositive ? "text-emerald-500" : "text-red-500"}`}>
//                       {trendAnalytics.isPositive
//                         ? <TrendingUp className="w-3 h-3" />
//                         : <TrendingDown className="w-3 h-3" />}
//                       {trendAnalytics.isPositive ? "+" : ""}{trendAnalytics.percentChange}%
//                       <span className="text-gray-500 font-medium ml-1">{trendAnalytics.vsText}</span>
//                     </p>
//                   </div>
//                   <TrendLineChart
//                     data={trendAnalytics.chartData}
//                     labels={trendAnalytics.labels}
//                   />
//                 </div>

//               </div>
//             </div>

//             {/* HOW YOU EARN */}
//             <div className="bg-[#09090b] border border-white/10 rounded-2xl p-6">
//               <h3 className="text-xs font-black tracking-widest text-gray-400 uppercase mb-6 flex items-center gap-1.5">
//                 How You Earn Points <InfoIcon />
//               </h3>
//               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
//                 {earnPointsActions.map((action, i) => (
//                   <div
//                     key={i}
//                     className="bg-[#18181b] border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:bg-white/5 transition-colors cursor-pointer group"
//                   >
//                     <div className={`w-10 h-10 rounded-full ${action.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
//                       <action.icon className={`w-4 h-4 ${action.color}`} />
//                     </div>
//                     <h4 className="text-xs font-bold text-gray-300 mb-1">{action.title}</h4>
//                     <p className={`text-sm font-black ${action.color} mb-1`}>{action.xp}</p>
//                     <p className="text-[10px] text-gray-500">{action.desc}</p>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* RECENT ACTIVITY + STREAK + INVITE */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               <RecentActivityWidget />
//               <div className="space-y-6">
//                 <StreakWidget />
//                 <InviteWidget />
//               </div>
//             </div>
//           </div>
//         )}

//         {/* ════════════════════════════════════════
//             TAB: EARNING HISTORY
//         ════════════════════════════════════════ */}
//         {activeTab === "Earning History" && (
//           <div
//             ref={earningHistoryRef}
//             className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
//           >
//             <div className="bg-[#09090b] border border-white/10 rounded-2xl p-6">
//               <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
//                 <div>
//                   <h3 className="text-lg font-black text-white mb-1">Earning History</h3>
//                   <p className="text-xs text-gray-400 font-medium">
//                     Track how you earn points across all activities.
//                   </p>
//                 </div>
//                 <div className="text-right">
//                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
//                     Total Points Earned
//                   </p>
//                   <h3 className="text-2xl font-black text-emerald-500">{displayPoints} SXP</h3>
//                 </div>
//               </div>

//               {/* Filters — "ROAR" category covers all ROAR activity types */}
//               <div className="flex flex-wrap gap-3 mb-6">
//                 <div className="relative w-48">
//                   <LayoutGrid className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
//                   <select
//                     value={categoryFilter}
//                     onChange={(e) => {
//                       setCategoryFilter(e.target.value as CategoryFilter);
//                       setHistoryPage(1);
//                     }}
//                     className="w-full bg-[#18181b] border border-white/10 text-xs font-bold rounded-xl pl-10 pr-8 py-3 text-white focus:outline-none focus:border-rose-500 appearance-none cursor-pointer"
//                   >
//                     {(
//                       [
//                         "All Activities", "Content", "Engagement",
//                         "Fantasy", "Trivia", "ROAR", "Referral", "Registration",
//                       ] as CategoryFilter[]
//                     ).map((v) => (
//                       <option key={v}>{v}</option>
//                     ))}
//                   </select>
//                   <ChevronDown className="w-4 h-4 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
//                 </div>

//                 <div className="relative w-44">
//                   <Calendar className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
//                   <select
//                     value={dateFilter}
//                     onChange={(e) => {
//                       setDateFilter(e.target.value as DateFilter);
//                       setHistoryPage(1);
//                     }}
//                     className="w-full bg-[#18181b] border border-white/10 text-xs font-bold rounded-xl pl-10 pr-8 py-3 text-white focus:outline-none focus:border-rose-500 appearance-none cursor-pointer"
//                   >
//                     {(["All Time", "This Month", "Last 7 Days", "Last 30 Days"] as DateFilter[]).map(
//                       (v) => <option key={v}>{v}</option>
//                     )}
//                   </select>
//                   <ChevronDown className="w-4 h-4 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
//                 </div>

//                 {(categoryFilter !== "All Activities" || dateFilter !== "All Time") && (
//                   <button
//                     onClick={() => {
//                       setCategoryFilter("All Activities");
//                       setDateFilter("All Time");
//                       setHistoryPage(1);
//                     }}
//                     className="flex items-center gap-1.5 px-4 py-2.5 border border-white/10 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors bg-[#18181b]"
//                   >
//                     <X className="w-3 h-3" /> Clear
//                   </button>
//                 )}

//                 <p className="text-xs text-gray-500 self-center ml-auto">
//                   {filteredHistory.length} result{filteredHistory.length !== 1 ? "s" : ""}
//                 </p>
//               </div>

//               <HistoryTable rows={pagedHistory} loading={activitiesLoading} />

//               {hasMore && (
//                 <div className="mt-6 text-center">
//                   <button
//                     onClick={() => setHistoryPage((p) => p + 1)}
//                     className="bg-[#18181b] border border-white/10 text-xs font-bold text-white px-6 py-2.5 rounded-full hover:bg-white/10 transition-colors inline-flex items-center gap-2"
//                   >
//                     Load More <ChevronDown className="w-4 h-4" />
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* ── Share Dialog ── */}
//         {showShareDialog && (
//           <>
//             <button
//               type="button"
//               className="fixed inset-0 z-40 bg-black/70 lg:hidden"
//               onClick={closeShareDialog}
//             />
//             <div
//               className="fixed bottom-16 inset-x-4 z-50 mx-auto w-full max-w-[280px] rounded-2xl border border-white/10 bg-[#1a1a1e] p-3 shadow-2xl lg:hidden"
//               onClick={(e) => e.stopPropagation()}
//             >
//               <div className="flex items-center justify-between mb-2">
//                 <p className="text-white text-sm font-semibold">Share</p>
//                 <button
//                   type="button"
//                   onClick={closeShareDialog}
//                   className="text-gray-400 hover:text-white"
//                 >
//                   <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
//                     <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
//                   </svg>
//                 </button>
//               </div>
//               <div className="flex flex-row flex-nowrap items-center gap-1.5 mb-2 overflow-x-auto">
//                 {shareButtons("w-8 h-8")}
//               </div>
//               {copied && <p className="text-xs text-emerald-400">Copied to clipboard</p>}
//             </div>

//             <div
//               className="hidden lg:flex fixed inset-0 z-50 items-center justify-center bg-black/60"
//               onClick={closeShareDialog}
//             >
//               <div
//                 className="bg-[#1a1a1e] rounded-2xl border border-white/10 p-4 w-[300px] shadow-2xl"
//                 onClick={(e) => e.stopPropagation()}
//               >
//                 <div className="flex items-center justify-between mb-3">
//                   <p className="text-white text-sm font-semibold">Invite Friends</p>
//                   <button
//                     type="button"
//                     onClick={closeShareDialog}
//                     className="text-gray-400 hover:text-white"
//                   >
//                     <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
//                       <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
//                     </svg>
//                   </button>
//                 </div>
//                 <div className="rounded-xl border border-white/10 bg-[#111114] p-3 mb-3">
//                   <p className="text-white text-sm font-semibold">Invite Friends & Earn</p>
//                   <p className="text-white/45 text-[11px] mt-2 break-all">{buildFanZoneShareUrl()}</p>
//                 </div>
//                 <div className="flex flex-row flex-nowrap items-center gap-2 mb-2">
//                   {shareButtons("w-9 h-9")}
//                 </div>
//                 {copied && <p className="text-xs text-emerald-400">Copied to clipboard</p>}
//               </div>
//             </div>
//           </>
//         )}

//       </main>
//     </div>
//   );
// }





"use client";
// MainModules/Fanszone/page.tsx
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { type ActivityItem, useActivity } from "@/context/ActivityContext";
import { useLeaderboard } from "@/context/LeaderboardContext";
import {
  ChevronDown, Trophy, ArrowUpRight, Share2, CheckCircle2,
  Award, TrendingUp, Play, ThumbsUp, FileText,
  Gamepad2, UserPlus, LayoutGrid, Calendar,
  X, Headphones,
  Megaphone, MessagesSquare, Flame, Sparkles, Info, TrendingDown, Brain,
  ArrowLeft,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
type ActivityKey =
  | "audioDrop"
  | "fanBattleWin"
  | "fanBattlePlay"
  | "trivia"
  | "post"
  | "register"
  | "invite"
  | "roarHotTake"
  | "roarPrediction"
  | "roarDebate"
  | "roarMemory"
  | "roarPost"
  | "roarQuiz"
  | "roarReaction"
  | "watchDrop"
  | "like"
  | "share"
  | "other";

type TrendPeriod    = "7D" | "30D" | "90D";
type CategoryFilter =
  | "All Activities" | "Content" | "Engagement"
  | "Fantasy" | "Trivia" | "Referral" | "Registration" | "ROAR";
type DateFilter = "All Time" | "This Month" | "Last 7 Days" | "Last 30 Days";

interface HistoryItem {
  id:         string;
  key:        ActivityKey;
  action:     string;
  details:    string;
  points:     number;
  type:       string;
  source:     string;
  date:       string;
  timestamp:  number;
  time:       string;
  icon:       React.ElementType;
  color:      string;
  hexColor:   string;
  typeColor:  string;
}

interface CategoryBreakdown {
  label:   string;
  percent: number;
  color:   string;
  xp:      string;
  xpValue: number;
}

interface LeaderboardContextType {
  currentUserPoints: number;
  currentUserRank:   number;
  previousUserRank?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// CENTRALISED TYPE → ActivityKey MAP
// ─────────────────────────────────────────────────────────────────────────────
const ACTIVITY_TYPE_MAP: Record<string, ActivityKey> = {
  AUDIO_DROP:           "audioDrop",
  LISTEN_COMPLETE:      "audioDrop",
  LISTEN_AUDIO_DROP:    "audioDrop",
  FAN_BATTLE_WIN:       "fanBattleWin",
  FAN_BATTLE_PLAY:      "fanBattlePlay",
  CREATE_BATTLE:        "fanBattlePlay",
  PLAY_BATTLE:          "fanBattlePlay",
  POST_CREATED:         "post",
  CREATE_POST:          "post",
  TRIVIA_CORRECT:       "trivia",
  REGISTRATION:         "register",
  INVITE_ACCEPTED:      "invite",
  ROAR_HOT_TAKE:        "roarHotTake",
  ROAR_PREDICTION:      "roarPrediction",
  ROAR_DEBATE:          "roarDebate",
  ROAR_MEMORY:          "roarMemory",
  ROAR_POST:            "roarPost",
  ROAR_QUIZ:            "roarQuiz",
  ROAR_RAW_REACTIONS:   "roarReaction",
  // participation types — map to their parent category for display
  ROAR_PREDICTION_PARTICIPATE: "roarPrediction",
  ROAR_PREDICTION_CORRECT:     "roarPrediction",
  ROAR_DEBATE_PARTICIPATE:     "roarDebate",
};

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVITY META
// ─────────────────────────────────────────────────────────────────────────────
const ACTIVITY_META: Record<ActivityKey, {
  action:    string;
  type:      string;
  icon:      React.ElementType;
  color:     string;
  hexColor:  string;
  typeColor: string;
}> = {
  audioDrop: {
    action: "Listened to Audio Drop", type: "Content", icon: Headphones,
    color: "text-sky-400", hexColor: "#38bdf8",
    typeColor: "text-sky-400 border-sky-400/30 bg-sky-400/5",
  },
  fanBattleWin: {
    action: "Won a Fan Battle", type: "Fantasy", icon: Trophy,
    color: "text-yellow-400", hexColor: "#facc15",
    typeColor: "text-yellow-400 border-yellow-400/30 bg-yellow-400/5",
  },
  fanBattlePlay: {
    action: "Played a Fan Battle", type: "Fantasy", icon: Gamepad2,
    color: "text-yellow-500", hexColor: "#eab308",
    typeColor: "text-yellow-500 border-yellow-500/30 bg-yellow-500/5",
  },
  trivia: {
    action: "Answered Trivia Correctly", type: "Trivia", icon: CheckCircle2,
    color: "text-violet-400", hexColor: "#a78bfa",
    typeColor: "text-violet-400 border-violet-400/30 bg-violet-400/5",
  },
  post: {
    action: "Created a Fan Zone Post", type: "Engagement", icon: FileText,
    color: "text-rose-400", hexColor: "#fb7185",
    typeColor: "text-rose-400 border-rose-400/30 bg-rose-400/5",
  },
  register: {
    action: "Joined SportsFan360", type: "Registration", icon: UserPlus,
    color: "text-emerald-500", hexColor: "#10b981",
    typeColor: "text-emerald-500 border-emerald-500/30 bg-emerald-500/5",
  },
  invite: {
    action: "Friend Joined Via Invite", type: "Referral", icon: UserPlus,
    color: "text-teal-400", hexColor: "#2dd4bf",
    typeColor: "text-teal-400 border-teal-400/30 bg-teal-400/5",
  },
  roarHotTake: {
    action: "Posted a ROAR Hot Take", type: "ROAR", icon: Flame,
    color: "text-amber-500", hexColor: "#f59e0b",
    typeColor: "text-amber-500 border-amber-500/30 bg-amber-500/5",
  },
  roarPrediction: {
    action: "Made a ROAR Prediction", type: "ROAR", icon: TrendingUp,
    color: "text-lime-400", hexColor: "#a3e635",
    typeColor: "text-lime-400 border-lime-400/30 bg-lime-400/5",
  },
  roarDebate: {
    action: "Started a ROAR Debate", type: "ROAR", icon: MessagesSquare,
    color: "text-cyan-400", hexColor: "#22d3ee",
    typeColor: "text-cyan-400 border-cyan-400/30 bg-cyan-400/5",
  },
  roarMemory: {
    action: "Shared a ROAR Memory", type: "ROAR", icon: Sparkles,
    color: "text-pink-400", hexColor: "#f472b6",
    typeColor: "text-pink-400 border-pink-400/30 bg-pink-400/5",
  },
  roarPost: {
    action: "Shared a ROAR Post", type: "ROAR", icon: Megaphone,
    color: "text-orange-400", hexColor: "#fb923c",
    typeColor: "text-orange-400 border-orange-400/30 bg-orange-400/5",
  },
  roarQuiz: {
    action: "Answered a ROAR Quiz", type: "ROAR", icon: Brain,
    color: "text-emerald-400", hexColor: "#34d399",
    typeColor: "text-emerald-400 border-emerald-400/30 bg-emerald-400/5",
  },
  roarReaction: {
    action: "Reacted on ROAR", type: "ROAR", icon: ThumbsUp,
    color: "text-fuchsia-400", hexColor: "#e879f9",
    typeColor: "text-fuchsia-400 border-fuchsia-400/30 bg-fuchsia-400/5",
  },
  watchDrop: {
    action: "Watched a Drop", type: "Content", icon: Play,
    color: "text-yellow-500", hexColor: "#eab308",
    typeColor: "text-yellow-500 border-yellow-500/30 bg-yellow-500/5",
  },
  like: {
    action: "Liked a Post", type: "Engagement", icon: ThumbsUp,
    color: "text-rose-500", hexColor: "#f43f5e",
    typeColor: "text-rose-500 border-rose-500/30 bg-rose-500/5",
  },
  share: {
    action: "Shared a Post", type: "Engagement", icon: Share2,
    color: "text-purple-500", hexColor: "#a855f7",
    typeColor: "text-purple-500 border-purple-500/30 bg-purple-500/5",
  },
  other: {
    action: "Activity", type: "Engagement", icon: Trophy,
    color: "text-gray-300", hexColor: "#d4d4d8",
    typeColor: "text-gray-300 border-gray-400/30 bg-white/5",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SOURCE BADGE LABELS
// ─────────────────────────────────────────────────────────────────────────────
const SOURCE_LABEL_MAP: Record<string, string> = {
  ROAR_HOT_TAKE:               "ROAR",
  ROAR_PREDICTION:             "ROAR",
  ROAR_DEBATE:                 "ROAR",
  ROAR_MEMORY:                 "ROAR",
  ROAR_POST:                   "ROAR",
  ROAR_QUIZ:                   "ROAR",
  ROAR_RAW_REACTIONS:          "ROAR",
  ROAR_PREDICTION_PARTICIPATE: "ROAR",
  ROAR_PREDICTION_CORRECT:     "ROAR",
  ROAR_DEBATE_PARTICIPATE:     "ROAR",
  LISTEN_AUDIO_DROP:           "LISTEN AUDIO DROP",
  LISTEN_COMPLETE:             "LISTEN AUDIO DROP",
  AUDIO_DROP:                  "LISTEN AUDIO DROP",
  FAN_BATTLE_WIN:              "FAN BATTLE",
  FAN_BATTLE_PLAY:             "FAN BATTLE",
  CREATE_BATTLE:               "FAN BATTLE",
  PLAY_BATTLE:                 "FAN BATTLE",
  TRIVIA_CORRECT:              "TRIVIA",
  CREATE_POST:                 "FAN ZONE POST",
  POST_CREATED:                "FAN ZONE POST",
  REGISTRATION:                "REGISTRATION",
  INVITE_ACCEPTED:             "REFERRAL",
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function makeHistoryItem(
  key:       ActivityKey,
  details:   string,
  points:    number,
  atDate?:   Date,
  id         = `hi_${Date.now()}`,
  action?:   string,
  source?:   string
): HistoryItem {
  const d    = atDate ?? new Date();
  const meta = ACTIVITY_META[key];
  return {
    id, key,
    action:    action || meta.action,
    details, points,
    type:      meta.type,
    source:    source || meta.type,
    date:      d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    timestamp: d.getTime(),
    time:      d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    icon:      meta.icon,
    color:     meta.color,
    hexColor:  meta.hexColor,
    typeColor: meta.typeColor,
  };
}

function normalizeActivityKey(type: string = "", label: string = ""): ActivityKey {
  const safeType = type || "";

  const direct = ACTIVITY_TYPE_MAP[safeType.toUpperCase().replace(/-/g, "_")];
  if (direct) return direct;

  const value = `${safeType} ${label}`.toLowerCase().replace(/[_-]+/g, " ");

  if (value.includes("audio") || value.includes("listen"))              return "audioDrop";
  if (value.includes("battle win"))                                      return "fanBattleWin";
  if (value.includes("battle play") || value.includes("fan battle"))    return "fanBattlePlay";
  if (value.includes("trivia") || value.includes("quiz"))               return "trivia";
  if (value.includes("register") || value.includes("signup") ||
      value.includes("sign up") || value.includes("joined"))            return "register";
  if (value.includes("invite") || value.includes("referral"))           return "invite";
  if (value.includes("hot take"))                                        return "roarHotTake";
  if (value.includes("prediction"))                                      return "roarPrediction";
  if (value.includes("debate"))                                          return "roarDebate";
  if (value.includes("memory"))                                          return "roarMemory";
  if (value.includes("roar post"))                                       return "roarPost";
  if (value.includes("reaction") && value.includes("roar"))             return "roarReaction";
  if (value.includes("watch") || value.includes("video"))               return "watchDrop";
  if (value.includes("like"))                                            return "like";
  if (value.includes("share") && !value.includes("roar"))               return "share";
  if (value.includes("post") || value.includes("create"))               return "post";

  return "other";
}

function normalizeTimestamp(createdAt: number): number {
  if (!createdAt) return Date.now();
  return createdAt < 1_000_000_000_000 ? createdAt * 1000 : createdAt;
}

function readableSource(source: string) {
  return source
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

function metadataText(metadata: ActivityItem["metadata"]) {
  const keys = [
    "title", "postTitle", "audioTitle", "videoTitle", "battleTitle",
    "matchName", "question", "resourceName", "name", "transactionId",
    "sport",
  ];
  let primary = "";
  for (const key of keys) {
    const value = metadata?.[key];
    if (typeof value === "string" && value.trim()) {
      primary = value.trim();
      break;
    }
    if (typeof value === "number") {
      primary = String(value);
      break;
    }
  }

  const room = metadata?.roomName || metadata?.room || metadata?.room_label || metadata?.roomId;
  if (primary && room) return `${primary} — ${room}`;
  if (primary) return primary;
  if (typeof room === "string") return room;
  return "";
}

function activityToHistoryItem(activity: ActivityItem): HistoryItem {
  const safeType = activity.type || "";
  const key      = normalizeActivityKey(safeType, activity.label);
  const rawType  = (safeType || key).toUpperCase();
  const source   = SOURCE_LABEL_MAP[rawType] ?? readableSource(safeType || key);
  const details  = metadataText(activity.metadata) || activity.label || source;
  const meta     = ACTIVITY_META[key];
  return makeHistoryItem(
    key, details, Number(activity.points) || 0,
    new Date(normalizeTimestamp(activity.createdAt)),
    activity.id,
    activity.label && activity.label !== activity.type
      ? activity.label
      : meta.action,
    source
  );
}

function calculateLevelData(totalXp: number) {
  let level = 1, xpForNextLevel = 1000, xpAccumulated = 0;
  while (totalXp >= xpAccumulated + xpForNextLevel) {
    xpAccumulated += xpForNextLevel;
    level++;
    xpForNextLevel = level * 1000;
  }
  const currentLevelXp = totalXp - xpAccumulated;
  return {
    level, currentLevelXp, xpForNextLevel,
    xpRemaining: xpForNextLevel - currentLevelXp,
    progressPercentage: Math.min(100, Math.round((currentLevelXp / xpForNextLevel) * 100)),
  };
}

function getEarningBreakdown(history: HistoryItem[]): CategoryBreakdown[] {
  if (!history.length) return [];
  const total = history.reduce((s, h) => s + h.points, 0);

  const grouped: Record<string, { label: string; xpValue: number; color: string }> = {};
  history.forEach((h) => {
    if (!grouped[h.key]) {
      grouped[h.key] = { label: h.action, xpValue: 0, color: h.hexColor };
    }
    grouped[h.key].xpValue += h.points;
  });

  return Object.values(grouped)
    .sort((a, b) => b.xpValue - a.xpValue)
    .map((g) => ({
      label:   g.label,
      color:   g.color,
      xpValue: g.xpValue,
      percent: total > 0 ? Math.round((g.xpValue / total) * 100) : 0,
      xp:      `+${g.xpValue.toLocaleString()} SXP`,
    }));
}

function getDynamicStreakData(history: HistoryItem[]) {
  const today      = new Date();
  const todayMid   = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const weekday    = today.getDay();
  const adjustedDay = weekday === 0 ? 6 : weekday - 1;
  const days       = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const historyDates = new Set(
    history.map((h) => {
      const d = new Date(h.timestamp);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    })
  );

  let currentStreak = 0;
  let checkDate     = todayMid;
  while (historyDates.has(checkDate)) {
    currentStreak++;
    checkDate -= 86400000;
  }

  const sortedDates = Array.from(historyDates).sort();
  let longestStreak = 0, runStreak = 0, prevDate: number | null = null;
  for (const d of sortedDates) {
    if (prevDate !== null && d - prevDate === 86400000) {
      runStreak++;
    } else {
      runStreak = 1;
    }
    longestStreak = Math.max(longestStreak, runStreak);
    prevDate = d;
  }

  const streakMap = days.map((day, i) => {
    const dayMid      = todayMid + (i - adjustedDay) * 86400000;
    const hasActivity = historyDates.has(dayMid);
    const isPast      = dayMid < todayMid;
    return {
      day,
      isActive: hasActivity,
      isMissed: !hasActivity && isPast,
      isFuture: dayMid > todayMid,
      isToday:  dayMid === todayMid,
    };
  });

  return { streakMap, currentStreak, longestStreak };
}

function getTrendAnalytics(history: HistoryItem[], period: TrendPeriod) {
  const now      = Date.now();
  const daysMap: Record<TrendPeriod, number> = { "7D": 7, "30D": 30, "90D": 90 };
  const days     = daysMap[period];
  const msPerDay = 86400000;
  const today = new Date();

  const todayMidnight = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  ).getTime();

  const currentStart = todayMidnight - (days - 1) * msPerDay;
  const previousStart = currentStart - days * msPerDay;

  const bucketCount =
    period === "7D" ? 7 : period === "30D" ? 30 : 90;

  const buckets = new Array(bucketCount).fill(0);
  let currentPts   = 0;
  let previousPts  = 0;

  history.forEach((item) => {
    const t = item.timestamp;
    if (t >= currentStart && t <= now) {
      currentPts += item.points;
      const activityDate = new Date(t);
      const activityDay = new Date(
        activityDate.getFullYear(),
        activityDate.getMonth(),
        activityDate.getDate()
      ).getTime();

      const startDay = new Date(currentStart);
      const startDayMidnight = new Date(
        startDay.getFullYear(),
        startDay.getMonth(),
        startDay.getDate()
      ).getTime();

      const idx = Math.floor((activityDay - startDayMidnight) / msPerDay);
      if (idx >= 0 && idx < bucketCount) {
        buckets[idx] += item.points;
      }
    } else if (t >= previousStart && t < currentStart) {
      previousPts += item.points;
    }
  });

  const percentChange =
    previousPts > 0
      ? Math.round(((currentPts - previousPts) / previousPts) * 100)
      : currentPts > 0 ? 100 : 0;

  const labels = buckets.map((_, index) => {
    const d = new Date(currentStart + index * msPerDay);
    if (period === "90D" && index % 15 !== 0) return "";
    if (period === "30D" && index % 5 !== 0) return "";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  });

  const vsMap: Record<TrendPeriod, string> = {
    "7D": "vs prev week", "30D": "vs prev month", "90D": "vs prev 90d",
  };

  return { chartData: buckets, percentChange, isPositive: percentChange >= 0, labels, vsText: vsMap[period], currentPts };
}

function applyFilters(
  history:        HistoryItem[],
  categoryFilter: CategoryFilter,
  dateFilter:     DateFilter
): HistoryItem[] {
  const now          = Date.now();
  const msPerDay     = 86400000;
  const thisMonthStart = new Date(
    new Date().getFullYear(), new Date().getMonth(), 1
  ).getTime();

  return history.filter((item) => {
    if (categoryFilter !== "All Activities" && item.type !== categoryFilter) return false;
    if (dateFilter === "Last 7 Days"  && item.timestamp < now - 7  * msPerDay) return false;
    if (dateFilter === "Last 30 Days" && item.timestamp < now - 30 * msPerDay) return false;
    if (dateFilter === "This Month"   && item.timestamp < thisMonthStart)       return false;
    return true;
  });
}

function getCurrentMonthLabel() {
  return new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
}
function getPreviousMonthLabel() {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - 1);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

// ─────────────────────────────────────────────────────────────────────────────
// STATIC DATA
// ─────────────────────────────────────────────────────────────────────────────
const earnPointsActions = [
  { icon: Megaphone,      title: "Post On ROAR",       xp: "+2 SXP", desc: "Per post on ROAR",      color: "text-orange-400", bg: "bg-orange-400/10" },
  { icon: MessagesSquare, title: "Start a Debate",      xp: "+2 SXP", desc: "Per debate started",    color: "text-cyan-400",   bg: "bg-cyan-400/10"   },
  { icon: Flame,          title: "Post Hot Take",        xp: "+2 SXP", desc: "Per hot take posted",   color: "text-amber-500",  bg: "bg-amber-500/10"  },
  { icon: TrendingUp,     title: "Share Prediction",    xp: "+2 SXP", desc: "Per prediction shared", color: "text-lime-400",   bg: "bg-lime-400/10"   },
  { icon: Sparkles,       title: "Share Memory",         xp: "+2 SXP", desc: "Per memory shared",     color: "text-pink-400",   bg: "bg-pink-400/10"   },
  { icon: Headphones,     title: "Listen Audio Drops",  xp: "+2 SXP", desc: "Per drop (90%)",        color: "text-sky-400",    bg: "bg-sky-400/10"    },
];

const buildFanZoneShareUrl = () => {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/MainModules/Fanszone`;
};
const buildFanZoneShareText = () => {
  const shareUrl = buildFanZoneShareUrl();
  return [
    "Join me on Sportsfan Fan Zone",
    "Earn SXP, track your fan activity, and climb the leaderboard.",
    `Join here: ${shareUrl}`,
  ].join("\n");
};
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const input = document.createElement("textarea");
      input.value = text;
      input.style.position = "fixed";
      input.style.opacity  = "0";
      document.body.appendChild(input);
      input.focus();
      input.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(input);
      return ok;
    } catch {
      return false;
    }
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DONUT CHART
// ─────────────────────────────────────────────────────────────────────────────
function DonutChart({ data, centerPoints }: { data: CategoryBreakdown[]; centerPoints: string }) {
  const RADIUS        = 25.91549430918954;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  let offsetPercent   = 0;

  const slices = data.map((slice) => {
    const dashLength = (slice.percent / 100) * CIRCUMFERENCE;
    const gapLength  = CIRCUMFERENCE - dashLength;
    const rotation   = (offsetPercent / 100) * 360 - 90;
    offsetPercent   += slice.percent;
    return { ...slice, dashLength, gapLength, rotation };
  });

  const isEmpty = data.length === 0;

  return (
    <div className="relative w-44 h-44 shrink-0 mx-auto sm:mx-0">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-6">
        {isEmpty ? (
          <circle cx="50" cy="50" r={RADIUS} fill="transparent" stroke="#27272a" strokeWidth="8" />
        ) : (
          slices.map((slice, i) => (
            <circle
              key={i} cx="50" cy="50" r={RADIUS} fill="transparent"
              stroke={slice.color} strokeWidth="8"
              strokeDasharray={`${slice.dashLength} ${slice.gapLength}`}
              strokeDashoffset={0}
              transform={`rotate(${slice.rotation} 50 50)`}
              className="transition-all duration-1000 ease-out"
            />
          ))
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-black text-white">{isEmpty ? "0" : centerPoints}</span>
        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">SXP</span>
        <span className="text-[9px] text-gray-600 font-medium mt-0.5">This Month</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BREAKDOWN LEGEND
// ─────────────────────────────────────────────────────────────────────────────
function BreakdownLegend({ data }: { data: CategoryBreakdown[] }) {
  if (data.length === 0) {
    return (
      <div className="space-y-3 opacity-40 w-full">
        {["Audio Drops", "Fan Battles", "Trivia", "ROAR Posts"].map((label, i) => (
          <div key={i} className="flex items-center gap-3 text-sm">
            <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-zinc-700" />
            <span className="text-gray-600 flex-1">{label}</span>
            <span className="text-gray-700">—</span>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="w-full space-y-3">
      {data.map((item, i) => (
        <div
          key={i}
          className="grid items-start text-sm w-full"
          style={{ gridTemplateColumns: "10px 1fr auto", columnGap: "8px" }}
        >
          <span className="w-2.5 h-2.5 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: item.color }} />
          <span className="text-gray-300 whitespace-normal break-words">{item.label}</span>
          <span className="whitespace-nowrap flex items-start justify-end" style={{ paddingLeft: "8px" }}>
            <span className="font-bold text-white">{item.percent}%</span>
            <span className="text-gray-400 ml-1 text-xs">{item.xp}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TREND LINE CHART
// ─────────────────────────────────────────────────────────────────────────────
function TrendLineChart({ data, labels }: { data: number[]; labels: string[] }) {
  const width = 100;
  const height = 40;
  const max = Math.max(...data, 1);

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - (value / max) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-28 overflow-visible" preserveAspectRatio="none">
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon fill="url(#trendFill)" points={`0,40 ${points} 100,40`} />
        <polyline fill="none" stroke="#f43f5e" strokeWidth="2" points={points} />
        {data.map((value, index) => {
          const x = (index / (data.length - 1)) * width;
          const y = height - (value / max) * height;
          return <circle key={index} cx={x} cy={y} r="1.5" fill="#f43f5e" />;
        })}
      </svg>
      <div className="flex justify-between text-[9px] text-gray-500 font-bold mt-2">
        {labels.map((label, i) => <span key={i}>{label}</span>)}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INFO ICON
// ─────────────────────────────────────────────────────────────────────────────
function InfoIcon() {
  return (
    <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border border-gray-600 text-[9px] text-gray-500 cursor-help hover:text-gray-300 hover:border-gray-400 transition-colors">
      i
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HISTORY TABLE
// ─────────────────────────────────────────────────────────────────────────────
function HistoryTable({ rows, loading }: { rows: HistoryItem[]; loading: boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/10">
            <th className="py-4 px-2 text-[10px] font-black text-gray-500 uppercase tracking-widest w-40">Date</th>
            <th className="py-4 px-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">Activity</th>
            <th className="py-4 px-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">Details</th>
            <th className="py-4 px-2 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Points</th>
            <th className="py-4 px-2 pl-8 text-[10px] font-black text-gray-500 uppercase tracking-widest w-40">Source</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={5} className="text-center text-gray-500 py-8 text-sm">Loading activity...</td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center text-gray-500 py-8 text-sm">No activity recorded yet.</td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                <td className="py-3 px-2">
                  <p className="text-xs text-gray-300 font-medium">{row.date}</p>
                  <p className="text-[10px] text-gray-500">{row.time}</p>
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#18181b] border border-white/10 flex items-center justify-center flex-shrink-0">
                      <row.icon className={`w-4 h-4 ${row.color}`} />
                    </div>
                    <span className="text-xs font-bold text-white">{row.action}</span>
                  </div>
                </td>
                <td className="py-3 px-2 text-xs text-gray-400 font-medium max-w-[180px] truncate">{row.details}</td>
                <td className="py-3 px-2 text-right">
                  <span className="text-xs font-black text-emerald-500">+{row.points}</span>
                </td>
                <td className="py-3 px-2 pl-8">
                  <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-[10px] font-bold border ${row.typeColor}`}>
                    {row.source}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
export default function FanZoneDashboard() {
  const [activeTab,       setActiveTab]       = useState("My Analytics");
  const [trendPeriod,     setTrendPeriod]     = useState<TrendPeriod>("30D");
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [copied,          setCopied]          = useState(false);
  const [historyPage,     setHistoryPage]     = useState(1);
  const [categoryFilter,  setCategoryFilter]  = useState<CategoryFilter>("All Activities");
  const [dateFilter,      setDateFilter]      = useState<DateFilter>("All Time");
  const earningHistoryRef = useRef<HTMLDivElement>(null);
  const ITEMS_PER_PAGE = 20;

  const contextData        = useLeaderboard() as LeaderboardContextType | null;
  const currentUserPoints  = contextData?.currentUserPoints ?? 0;
  const currentUserRank    = contextData?.currentUserRank   ?? 0;

  // ── Activity data with fallback ───────────────────────────────────────────
  // Some accounts have empty ActivityContext (wrong userId format in context).
  // When context returns empty after loading, we fetch directly from the API
  // using credentials (same endpoint that Profile.tsx uses successfully).
  const { activities: contextActivities, loading: contextLoading } = useActivity();

  const [fallbackActivities, setFallbackActivities] = useState<ActivityItem[]>([]);
  const [fallbackLoading,    setFallbackLoading]    = useState(false);
  const [fallbackAttempted,  setFallbackAttempted]  = useState(false);

  useEffect(() => {
    // Only trigger fallback once context has finished loading AND returned empty
    if (contextLoading) return;
    if (contextActivities.length > 0) return;
    if (fallbackAttempted) return;

    setFallbackAttempted(true);
    setFallbackLoading(true);

    // Step 1: fetch profile to get the correct uid
    // For Google-auth users: uid = email (e.g. "princechandu357@gmail.com")
    // For custom users: uid = custom ID (e.g. "chandu_srikakulam_sportsfan360_com")
    // ActivityContext uses userId (formatted string) which doesn't match activity records
    // We must use uid which is what /api/user-activity actually indexes by
    fetch("/api/roar/profile", { credentials: "include" })
      .then((r) => r.json())
      .then(async (profileData) => {
        const user = profileData?.user;
        // uid is the actual lookup key used by /api/user-activity
        const uid = user?.uid || user?.actualUserId || user?.userId;
        if (!uid) {
          // last resort: try without userId param
          return fetch("/api/user-activity?limit=200", { credentials: "include" })
            .then((r) => r.json());
        }
        return fetch(
          `/api/user-activity?userId=${encodeURIComponent(uid)}&limit=200`,
          { credentials: "include" }
        ).then((r) => r.json());
      })
      .then((data) => {
        if (data?.success && Array.isArray(data.activities)) {
          setFallbackActivities(data.activities);
        }
      })
      .catch(() => {
        // silently ignore — UI will show "No activity yet"
      })
      .finally(() => {
        setFallbackLoading(false);
      });
  }, [contextLoading, contextActivities.length, fallbackAttempted]);

  // Use context activities if available, otherwise use fallback
  const activities      = contextActivities.length > 0 ? contextActivities : fallbackActivities;
  const activitiesLoading = contextLoading || fallbackLoading;
  // ─────────────────────────────────────────────────────────────────────────

  const history = useMemo(
    () => activities.map(activityToHistoryItem).sort((a, b) => b.timestamp - a.timestamp),
    [activities]
  );

  const [rankSnapshot, setRankSnapshot] = useState({ prev: 0, current: 0 });
  useEffect(() => {
    if (currentUserRank === 0) return;
    if (rankSnapshot.current !== currentUserRank) {
      setRankSnapshot({ prev: rankSnapshot.current, current: currentUserRank });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserRank]);

  const totalPoints  = currentUserPoints > 0
    ? currentUserPoints
    : history.reduce((s, h) => s + h.points, 0);
  const displayPoints = totalPoints.toLocaleString();

  const now            = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();

  const thisMonthHistory = useMemo(
    () => history.filter((h) => h.timestamp >= thisMonthStart),
    [history, thisMonthStart]
  );

  const earningBreakdown = useMemo(() => getEarningBreakdown(thisMonthHistory), [thisMonthHistory]);
  const trendAnalytics   = useMemo(() => getTrendAnalytics(history, trendPeriod), [history, trendPeriod]);
  const levelData        = useMemo(() => calculateLevelData(totalPoints), [totalPoints]);
  const { streakMap, currentStreak, longestStreak } =
    useMemo(() => getDynamicStreakData(history), [history]);

  const filteredHistory = useMemo(
    () => applyFilters(history, categoryFilter, dateFilter),
    [history, categoryFilter, dateFilter]
  );
  const pagedHistory = useMemo(
    () => filteredHistory.slice(0, historyPage * ITEMS_PER_PAGE),
    [filteredHistory, historyPage]
  );
  const hasMore = pagedHistory.length < filteredHistory.length;

  const recentActivityList = useMemo(
    () => history.slice(0, 5).map((h) => ({
      icon:     h.icon,
      action:   h.action,
      detail:   h.details,
      xp:       h.points,
      time:     h.time,
      color:    h.color,
      hexColor: h.hexColor,
    })),
    [history]
  );

  const rankDiff = rankSnapshot.prev > 0 && rankSnapshot.current > 0
    ? Math.abs(rankSnapshot.prev - rankSnapshot.current) : 0;
  const isRankUp = rankSnapshot.prev > 0 && rankSnapshot.current > 0
    && rankSnapshot.current < rankSnapshot.prev;

  const currentMonthLabel  = getCurrentMonthLabel();
  const previousMonthLabel = getPreviousMonthLabel();

  const thisMonthPoints = useMemo(
    () => thisMonthHistory.reduce((s, h) => s + h.points, 0),
    [thisMonthHistory]
  );
  const lastMonthPoints = useMemo(
    () => history.filter((h) => h.timestamp >= lastMonthStart && h.timestamp < thisMonthStart)
      .reduce((s, h) => s + h.points, 0),
    [history, lastMonthStart, thisMonthStart]
  );
  const monthDiff      = thisMonthPoints - lastMonthPoints;
  const monthPctChange = lastMonthPoints > 0
    ? Math.round((monthDiff / lastMonthPoints) * 100)
    : thisMonthPoints > 0 ? 100 : 0;
  const displayMonthlyPoints = thisMonthPoints.toLocaleString();

  // ── Share helpers ──────────────────────────────────────────────────────────
  const openShareDialog  = () => { setShowShareDialog(true);  setCopied(false); };
  const closeShareDialog = () => { setShowShareDialog(false); setCopied(false); };

  const handleShareToWhatsApp  = () => window.open(`https://wa.me/?text=${encodeURIComponent(buildFanZoneShareText())}`, "_blank");
  const handleShareToThreads   = () => window.open(`https://www.threads.net/intent/post?text=${encodeURIComponent(buildFanZoneShareText())}`, "_blank");
  const handleShareToInstagram = async () => {
    await copyToClipboard(buildFanZoneShareText());
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
    window.open("https://www.instagram.com/", "_blank");
  };
  const handleShareToLinkedIn  = () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(buildFanZoneShareUrl())}`, "_blank");
  const handleShareToX         = () => window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(buildFanZoneShareText())}`, "_blank");
  const handleCopyLink         = async () => {
    const ok = await copyToClipboard(buildFanZoneShareText());
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1600); }
  };

  // ── Sub-components ─────────────────────────────────────────────────────────

  const StreakWidget = () => (
    <div className="bg-[#09090b] border border-white/10 rounded-2xl p-6">
      <h3 className="text-xs font-black tracking-widest text-gray-400 uppercase mb-1 flex items-center gap-1.5">
        Your Streak <InfoIcon />
      </h3>
      <div className="flex items-baseline gap-4 mb-4 mt-2">
        <div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-black text-white">{currentStreak}</h2>
            <span className="text-base font-medium text-gray-400">day{currentStreak !== 1 ? "s" : ""}</span>
          </div>
          <p className="text-[10px] text-gray-500 font-medium mt-0.5 uppercase tracking-widest">Current</p>
        </div>
        <div className="w-px h-10 bg-white/10 self-center" />
        <div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-2xl font-black text-amber-500">{longestStreak}</h2>
            <span className="text-sm font-medium text-gray-400">day{longestStreak !== 1 ? "s" : ""}</span>
          </div>
          <p className="text-[10px] text-gray-500 font-medium mt-0.5 uppercase tracking-widest">Best</p>
        </div>
      </div>
      <p className="text-xs text-gray-500 mb-5">
        {currentStreak > 0 ? "Keep it going — don't break your streak!" : "Engage today to start a new streak!"}
      </p>
      <div className="flex justify-between items-center">
        {streakMap.map((data) => (
          <div key={data.day} className="flex flex-col items-center gap-2">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
              data.isActive
                ? "bg-rose-600 border-rose-500 text-white shadow-[0_0_10px_rgba(225,29,72,0.4)]"
                : data.isToday
                  ? "bg-[#18181b] border-rose-500/50 text-rose-500"
                  : data.isMissed
                    ? "bg-[#0f0a0a] border-red-900/50 text-red-900"
                    : "bg-[#18181b] border-white/10 text-gray-600"
            }`}>
              {data.isActive ? <CheckCircle2 className="w-4 h-4" /> : data.isMissed ? <X className="w-3 h-3 opacity-50" /> : null}
            </div>
            <span className={`text-[10px] font-bold ${data.isToday ? "text-rose-400" : data.isActive ? "text-white" : "text-gray-600"}`}>
              {data.day}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const InviteWidget = () => (
    <div
      className="bg-[#09090b] border border-rose-500/20 rounded-2xl p-6 flex items-center justify-between overflow-hidden relative group cursor-pointer hover:border-rose-500/50 transition-colors"
      onClick={openShareDialog}
    >
      <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-20 group-hover:scale-110 transition-transform duration-500 translate-x-4">
        <UserPlus className="w-32 h-32 text-rose-500" />
      </div>
      <div className="relative z-10">
        <h3 className="text-lg font-black text-white mb-1">Invite Friends</h3>
        <p className="text-sm text-gray-400 mb-4">Share Fan Zone and bring your crew in!</p>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); openShareDialog(); }}
          className="bg-gradient-to-r from-rose-600 to-orange-500 text-white text-sm font-bold py-2.5 px-6 rounded-full hover:shadow-[0_0_15px_rgba(225,29,72,0.4)] transition-all"
        >
          Invite Now
        </button>
      </div>
    </div>
  );

  const RecentActivityWidget = () => (
    <div className="bg-[#09090b] border border-white/10 rounded-2xl p-6 flex flex-col">
      <h3 className="text-xs font-black tracking-widest text-gray-400 uppercase mb-6">Recent Activity</h3>
      <div className="flex-1 space-y-5">
        {activitiesLoading ? (
          <p className="text-sm text-gray-500 text-center py-4">Loading activity...</p>
        ) : recentActivityList.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No activity yet — start earning!</p>
        ) : (
          recentActivityList.map((item, i) => (
            <div key={i} className="flex items-center justify-between group">
              <div className="flex items-center gap-4 min-w-0">
                <div className={`w-8 h-8 rounded-full bg-[#18181b] border border-white/5 flex items-center justify-center shrink-0 ${item.color}`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <p className="text-sm truncate min-w-0">
                  <span className="font-bold text-white mr-1">{item.action}</span>
                  {item.detail && <span className="text-gray-400">{item.detail}</span>}
                </p>
              </div>
              <div className="text-right shrink-0 ml-3">
                <p className="text-sm font-black" style={{ color: item.hexColor }}>+{item.xp} SXP</p>
                <p className="text-[10px] text-gray-500 font-medium">{item.time}</p>
              </div>
            </div>
          ))
        )}
      </div>
      <button
        onClick={() => {
          setActiveTab("Earning History");
          setHistoryPage(1);
          setTimeout(() => earningHistoryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
        }}
        className="text-xs font-bold text-rose-500 hover:text-rose-400 text-center w-full mt-6 py-2 border border-rose-500/20 rounded-lg hover:bg-rose-500/5 transition-colors uppercase tracking-widest"
      >
        Show Full Earning History →
      </button>
    </div>
  );

  const shareButtons = (size: string) => (
    <>
      {[
        { handler: handleShareToWhatsApp,  src: "/images/share_whatsapp.png", alt: "WhatsApp"  },
        { handler: handleShareToThreads,   src: "/images/share_thread.png",   alt: "Threads"   },
        { handler: handleShareToInstagram, src: "/images/share_insta.png",    alt: "Instagram" },
        { handler: handleShareToLinkedIn,  src: "/images/Share_linkedin.png", alt: "LinkedIn"  },
        { handler: handleShareToX,         src: "/images/Share_X.png",        alt: "X"         },
        { handler: handleCopyLink,         src: "/images/share_copy_link.png", alt: "Copy"     },
      ].map(({ handler, src, alt }) => (
        <button
          key={alt} onClick={handler} type="button"
          className={`${size} shrink-0 rounded-full overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center`}
        >
          <Image src={src} alt={alt} width={36} height={36} className="w-full h-full object-cover rounded-full" />
        </button>
      ))}
    </>
  );

  // ── InfoHelp ───────────────────────────────────────────────────────────────
  function InfoHelp() {
    const [open, setOpen] = useState(false);
    const [hover, setHover] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const buttonRef  = useRef<HTMLButtonElement>(null);
    const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) setOpen(false);
      };
      const handleEscape = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
      if (open) {
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);
      }
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
      };
    }, [open]);

    useEffect(() => {
      if (buttonRef.current && (open || hover)) {
        const rect = buttonRef.current.getBoundingClientRect();
        setTooltipPos({ top: rect.bottom + 12, left: rect.left + rect.width / 2 - 140 });
      }
    }, [open, hover]);

    return (
      <div
        ref={tooltipRef}
        style={{ position: "relative", display: "inline-block", overflow: "visible", zIndex: 999 }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <button
          ref={buttonRef}
          aria-label="Fan Zone info"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          style={{
            width: 24, height: 24, borderRadius: 50,
            border: "1.5px solid rgba(244, 63, 94, 0.6)",
            background: "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#f472b6", cursor: "pointer", padding: 0,
            transition: "all 0.2s ease", flexShrink: 0,
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 14, color: "#f472b6", transition: "all 0.2s ease" }}>i</span>
        </button>

        {(open || hover) && (
          <div
            role="dialog"
            aria-label="Fan Zone information"
            style={{
              position: "fixed",
              top: `${tooltipPos.top}px`,
              left: `${Math.max(12, tooltipPos.left)}px`,
              minWidth: "280px",
              maxWidth: "calc(100vw - 24px)",
              background: "rgba(15, 15, 20, 0.98)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(244, 63, 94, 0.4)",
              borderRadius: 12,
              padding: "16px 18px",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.8), 0 0 1px rgba(244, 63, 94, 0.5)",
              zIndex: 999999,
              animation: "fadeInScale 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              transformOrigin: "top center",
              pointerEvents: "auto",
              overflow: "visible",
            }}
          >
            <style>{`
              @keyframes fadeInScale {
                from { opacity: 0; transform: scale(0.95) translateY(-6px); }
                to   { opacity: 1; transform: scale(1) translateY(0); }
              }
            `}</style>
            <p style={{ margin: "0 0 10px 0", color: "rgba(255,255,255,0.9)", lineHeight: 1.5, fontSize: "13px" }}>
              <strong style={{ color: "#f472b6", fontWeight: 600 }}>SXP</strong> stands for{" "}
              <span style={{ color: "#f472b6", fontWeight: 600 }}>SportsFan360 XP</span>.
              Earn points by engaging with the community and climb the ranks.
            </p>
            <div style={{ height: 10 }} />
            <div style={{ fontWeight: 600, color: "#f472b6", marginBottom: 8, fontSize: "12px", letterSpacing: "0.01em" }}>
              Benefits of earning SXP:
            </div>
            <ul style={{ margin: 0, paddingLeft: 18, color: "rgba(255,255,255,0.85)", fontSize: "12px", lineHeight: 1.5 }}>
              <li style={{ marginBottom: 5 }}>Climb the global leaderboard</li>
              <li style={{ marginBottom: 5 }}>Unlock exclusive rewards</li>
              <li>Level up your fan experience</li>
            </ul>
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-rose-500/30 pb-20">
      <main className="max-w-[1400px] mx-auto px-3 py-3 sm:p-6 space-y-4 sm:space-y-6">

        <style>{`
          .fanzone-bar { left: 0; }
          @media (min-width: 1024px) {
            .fanzone-bar { left: var(--sidebar-width, 84px); }
          }
        `}</style>

        <div
          className="fanzone-bar"
          style={{
            position: "fixed", top: 0, right: 0, zIndex: 200,
            display: "flex", alignItems: "center", gap: 10,
            padding: "14px 16px 12px",
            background: "rgba(0,0,0,0.95)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            transition: "left 0.3s ease-out",
          }}
        >
          <Link href="/MainModules/ROAR" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", color: "white", flex: 1, maxWidth: "280px" }}>
            <button
              style={{ background: "none", border: "none", cursor: "pointer", color: "white", padding: "4px 2px", display: "flex", alignItems: "center", transition: "opacity 0.2s ease" }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <h3 style={{ color: "white", margin: 0, fontSize: "16px", fontWeight: 700, letterSpacing: "0.01em" }}>FanZone</h3>
          </Link>
        </div>

        <div style={{ height: 56 }} />

        {/* ── HERO ── */}
        <div className="relative rounded-xl overflow-visible border border-white/10 bg-[#09090b] flex items-center min-h-[90px]">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-screen"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=1200&auto=format&fit=crop')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-rose-950/70 to-transparent" />
          <div className="relative z-10 px-5 py-4 w-full flex flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-white drop-shadow-lg leading-none">FAN ZONE</h1>
                <p className="text-xs sm:text-sm font-medium text-gray-300 mt-1">Earn SXP. Rule the Fan Zone.</p>
              </div>
              <InfoHelp />
            </div>
          </div>
        </div>

        {/* ── STATS ROW ── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
          {/* Level progress */}
          <div className="col-span-2 md:col-span-2 bg-[#09090b] border border-white/10 rounded-2xl p-4 sm:p-5 flex items-center gap-4 sm:gap-5">
            <div className="w-14 h-14 rounded-xl border-2 border-rose-500 flex items-center justify-center font-black text-2xl text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
              {levelData.level}
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-white mb-1">You&apos;re doing great!</h3>
              <div className="flex justify-between items-end mb-2">
                <p className="text-xs text-gray-400">{levelData.xpRemaining.toLocaleString()} SXP to Level {levelData.level + 1}</p>
                <p className="text-xs font-bold text-gray-400">{levelData.currentLevelXp.toLocaleString()} / {levelData.xpForNextLevel.toLocaleString()}</p>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-600 to-orange-500 rounded-full relative transition-all duration-1000 ease-in-out"
                  style={{ width: `${levelData.progressPercentage}%` }}
                >
                  <div className="absolute right-0 top-0 bottom-0 w-2 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,1)]" />
                </div>
              </div>
            </div>
          </div>

          {/* Rank */}
          <div className="relative overflow-hidden rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-[#0f0c00] via-[#09090b] to-[#09090b] p-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(234,179,8,0.12),transparent_60%)]" />
            <div className="relative flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                <Trophy className="w-8 h-8 text-yellow-500" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-yellow-500/70">Your Rank</p>
                <div className="flex items-end gap-3 mt-1">
                  <h3 className="text-5xl font-black text-white leading-none">
                    {rankSnapshot.current > 0 ? rankSnapshot.current : "—"}
                  </h3>
                </div>
              </div>
            </div>
          </div>

          {/* Total SXP */}
          <div className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-[#0b0715] via-[#09090b] to-[#09090b] p-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.12),transparent_60%)]" />
            <div className="relative flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <Award className="w-8 h-8 text-purple-500" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-purple-400/70">Total SXP</p>
                <h3 className="text-5xl font-black text-white leading-none mt-1">{displayPoints}</h3>
                <p className="text-xs text-gray-500 font-medium mt-2 uppercase tracking-wider">All Time</p>
              </div>
            </div>
          </div>

          {/* Leaderboard link */}
          <Link
            href="/MainModules/Leaderboard"
            className="bg-[#09090b] border border-rose-500/30 hover:border-rose-500 rounded-2xl p-5 flex flex-col items-center justify-center group hover:scale-[1.02] transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute top-3 right-3">
              <ArrowUpRight className="w-4 h-4 text-rose-400 opacity-70 group-hover:opacity-100" />
            </div>
            <Trophy className="w-7 h-7 text-rose-500 mb-1.5 group-hover:scale-110 transition-all duration-300 relative z-10" />
            <h3 className="text-sm font-black text-white text-center leading-tight tracking-wide relative z-10">Global<br />Leaderboard</h3>
            <span className="mt-2 text-[10px] font-bold uppercase tracking-widest text-rose-400 relative z-10">Climb The Ranks →</span>
          </Link>
        </div>

        {/* ── TABS ── */}
        <div className="border-b border-white/10 flex gap-8 px-2 overflow-x-auto">
          {["My Analytics", "Earning History"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-bold whitespace-nowrap transition-all relative ${
                activeTab === tab ? "text-rose-500" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-rose-500 rounded-t-full shadow-[0_-2px_10px_rgba(244,63,94,0.5)]" />
              )}
            </button>
          ))}
        </div>

        {/* ════════════════════════════════════════
            TAB: MY ANALYTICS
        ════════════════════════════════════════ */}
        {activeTab === "My Analytics" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* OVERVIEW CARD */}
            <div className="bg-[#09090b] border border-white/10 rounded-2xl p-6 md:p-8">
              <h3 className="text-[10px] font-black tracking-widest text-gray-500 uppercase mb-8 flex items-center gap-1.5">
                Overview <InfoIcon />
              </h3>
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12 items-start">

                {/* Left: month stats */}
                <div className="xl:col-span-3 w-full">
                  <div className="inline-block bg-[#18181b] border border-white/10 text-sm font-bold rounded-xl px-4 py-2 text-white mb-6">
                    {currentMonthLabel}
                  </div>
                  <div className="space-y-6">
                    <div>
                      <p className="text-xs text-gray-400 font-medium mb-1">This Month</p>
                      <div className="flex items-end gap-3 flex-wrap">
                        <h4 className="text-3xl font-black text-white leading-none">{thisMonthPoints.toLocaleString()} SXP</h4>
                        <span
                          className="text-xs font-bold mb-0.5 flex items-center gap-0.5"
                          style={{ color: monthPctChange >= 0 ? "#10b981" : "#f43f5e" }}
                        >
                          {monthPctChange >= 0 ? "↑" : "↓"} {Math.abs(monthPctChange)}%
                          <span className="text-gray-500 font-medium ml-1">vs {previousMonthLabel}</span>
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium mb-1">All Time</p>
                      <h4 className="text-3xl font-black text-white leading-none">{displayPoints} SXP</h4>
                    </div>
                  </div>
                </div>

                {/* Middle: donut + legend */}
                <div className="xl:col-span-5 border-t border-white/10 xl:border-t-0 xl:border-l pt-8 xl:pt-0 xl:pl-6 overflow-hidden">
                  <p className="text-[10px] font-black tracking-widest text-gray-500 uppercase mb-4 flex items-center gap-1.5">
                    Points by Activity (This Month) <InfoIcon />
                  </p>
                  <div className="flex flex-col items-center xl:flex-row xl:items-center gap-4">
                    <div className="shrink-0 mx-auto xl:mx-0">
                      <DonutChart data={earningBreakdown} centerPoints={displayMonthlyPoints} />
                    </div>
                    <div className="w-full xl:flex-1 min-w-0 xl:pl-2">
                      <BreakdownLegend data={earningBreakdown} />
                    </div>
                  </div>
                </div>

                {/* Right: Trend graph */}
                <div className="xl:col-span-4 border-t xl:border-t-0 xl:border-l border-white/10 pt-8 xl:pt-0 xl:pl-6 flex flex-col justify-start w-full">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-[10px] font-black tracking-widest text-gray-500 uppercase flex items-center gap-1.5">
                      Points Trend <InfoIcon />
                    </h3>
                    <div className="flex gap-1 bg-[#18181b] p-1 rounded-lg border border-white/5">
                      {(["7D", "30D", "90D"] as TrendPeriod[]).map((range) => (
                        <button
                          key={range}
                          onClick={() => setTrendPeriod(range)}
                          className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${
                            trendPeriod === range ? "bg-[#27272a] text-white shadow-sm" : "text-gray-500 hover:text-white"
                          }`}
                        >
                          {range}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <h4 className="text-2xl font-black text-white">+{trendAnalytics.currentPts.toLocaleString()} SXP</h4>
                    <p className={`text-xs font-bold mt-0.5 flex items-center gap-1 ${trendAnalytics.isPositive ? "text-emerald-500" : "text-red-500"}`}>
                      {trendAnalytics.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {trendAnalytics.isPositive ? "+" : ""}{trendAnalytics.percentChange}%
                      <span className="text-gray-500 font-medium ml-1">{trendAnalytics.vsText}</span>
                    </p>
                  </div>
                  <TrendLineChart data={trendAnalytics.chartData} labels={trendAnalytics.labels} />
                </div>

              </div>
            </div>

            {/* HOW YOU EARN */}
            <div className="bg-[#09090b] border border-white/10 rounded-2xl p-6">
              <h3 className="text-xs font-black tracking-widest text-gray-400 uppercase mb-6 flex items-center gap-1.5">
                How You Earn Points <InfoIcon />
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {earnPointsActions.map((action, i) => (
                  <div
                    key={i}
                    className="bg-[#18181b] border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:bg-white/5 transition-colors cursor-pointer group"
                  >
                    <div className={`w-10 h-10 rounded-full ${action.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <action.icon className={`w-4 h-4 ${action.color}`} />
                    </div>
                    <h4 className="text-xs font-bold text-gray-300 mb-1">{action.title}</h4>
                    <p className={`text-sm font-black ${action.color} mb-1`}>{action.xp}</p>
                    <p className="text-[10px] text-gray-500">{action.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* RECENT ACTIVITY + STREAK + INVITE */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecentActivityWidget />
              <div className="space-y-6">
                <StreakWidget />
                <InviteWidget />
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            TAB: EARNING HISTORY
        ════════════════════════════════════════ */}
        {activeTab === "Earning History" && (
          <div ref={earningHistoryRef} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-[#09090b] border border-white/10 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                  <h3 className="text-lg font-black text-white mb-1">Earning History</h3>
                  <p className="text-xs text-gray-400 font-medium">Track how you earn points across all activities.</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Total Points Earned</p>
                  <h3 className="text-2xl font-black text-emerald-500">{displayPoints} SXP</h3>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3 mb-6">
                <div className="relative w-48">
                  <LayoutGrid className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
                  <select
                    value={categoryFilter}
                    onChange={(e) => { setCategoryFilter(e.target.value as CategoryFilter); setHistoryPage(1); }}
                    className="w-full bg-[#18181b] border border-white/10 text-xs font-bold rounded-xl pl-10 pr-8 py-3 text-white focus:outline-none focus:border-rose-500 appearance-none cursor-pointer"
                  >
                    {(["All Activities", "Content", "Engagement", "Fantasy", "Trivia", "ROAR", "Referral", "Registration"] as CategoryFilter[]).map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <div className="relative w-44">
                  <Calendar className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none" />
                  <select
                    value={dateFilter}
                    onChange={(e) => { setDateFilter(e.target.value as DateFilter); setHistoryPage(1); }}
                    className="w-full bg-[#18181b] border border-white/10 text-xs font-bold rounded-xl pl-10 pr-8 py-3 text-white focus:outline-none focus:border-rose-500 appearance-none cursor-pointer"
                  >
                    {(["All Time", "This Month", "Last 7 Days", "Last 30 Days"] as DateFilter[]).map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {(categoryFilter !== "All Activities" || dateFilter !== "All Time") && (
                  <button
                    onClick={() => { setCategoryFilter("All Activities"); setDateFilter("All Time"); setHistoryPage(1); }}
                    className="flex items-center gap-1.5 px-4 py-2.5 border border-white/10 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors bg-[#18181b]"
                  >
                    <X className="w-3 h-3" /> Clear
                  </button>
                )}

                <p className="text-xs text-gray-500 self-center ml-auto">
                  {filteredHistory.length} result{filteredHistory.length !== 1 ? "s" : ""}
                </p>
              </div>

              <HistoryTable rows={pagedHistory} loading={activitiesLoading} />

              {hasMore && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setHistoryPage((p) => p + 1)}
                    className="bg-[#18181b] border border-white/10 text-xs font-bold text-white px-6 py-2.5 rounded-full hover:bg-white/10 transition-colors inline-flex items-center gap-2"
                  >
                    Load More <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Share Dialog ── */}
        {showShareDialog && (
          <>
            <button type="button" className="fixed inset-0 z-40 bg-black/70 lg:hidden" onClick={closeShareDialog} />
            <div
              className="fixed bottom-16 inset-x-4 z-50 mx-auto w-full max-w-[280px] rounded-2xl border border-white/10 bg-[#1a1a1e] p-3 shadow-2xl lg:hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-white text-sm font-semibold">Share</p>
                <button type="button" onClick={closeShareDialog} className="text-gray-400 hover:text-white">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <div className="flex flex-row flex-nowrap items-center gap-1.5 mb-2 overflow-x-auto">{shareButtons("w-8 h-8")}</div>
              {copied && <p className="text-xs text-emerald-400">Copied to clipboard</p>}
            </div>

            <div className="hidden lg:flex fixed inset-0 z-50 items-center justify-center bg-black/60" onClick={closeShareDialog}>
              <div className="bg-[#1a1a1e] rounded-2xl border border-white/10 p-4 w-[300px] shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white text-sm font-semibold">Invite Friends</p>
                  <button type="button" onClick={closeShareDialog} className="text-gray-400 hover:text-white">
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                      <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#111114] p-3 mb-3">
                  <p className="text-white text-sm font-semibold">Invite Friends & Earn</p>
                  <p className="text-white/45 text-[11px] mt-2 break-all">{buildFanZoneShareUrl()}</p>
                </div>
                <div className="flex flex-row flex-nowrap items-center gap-2 mb-2">{shareButtons("w-9 h-9")}</div>
                {copied && <p className="text-xs text-emerald-400">Copied to clipboard</p>}
              </div>
            </div>
          </>
        )}

      </main>
    </div>
  );
}