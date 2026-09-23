// "use client";

// import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   Trophy,
//   Crown,
//   Search,
//   X,
//   Flame,
//   GraduationCap,
//   Sparkles,
//   Brain,
//   CheckCircle2,
//   RotateCw,
//   ChevronDown,
//   ChevronUp,
//   Users,
// } from "lucide-react";
// import { useAuth } from "@/context/AuthContext";
// import { useLeaderboard } from "@/context/LeaderboardContext";
// import {
//   BADGE_LABELS,
//   CURRENT_USER as ROAR_CURRENT_USER,
// } from "@/src/components/NewROARComponent/constants";
// import axios from "axios";

// export type LeaderboardTab = "global" | "fliparena" | "roar" | "campus";

// interface LeaderboardOverlayModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   initialTab?: LeaderboardTab;
// }

// export const TABS: {
//   id: LeaderboardTab;
//   label: string;
//   icon: React.ElementType;
//   color: string;
//   activeBg: string;
//   dotColor: string;
// }[] = [
//     { id: "global", label: "Global", icon: Sparkles, color: "text-rose-400", activeBg: "bg-rose-500", dotColor: "bg-rose-500" },
//     { id: "fliparena", label: "FlipARENA", icon: Brain, color: "text-amber-400", activeBg: "bg-amber-500", dotColor: "bg-amber-500" },
//     { id: "roar", label: "RoAR", icon: Flame, color: "text-orange-400", activeBg: "bg-orange-500", dotColor: "bg-orange-500" },
//     { id: "campus", label: "Campus", icon: GraduationCap, color: "text-emerald-400", activeBg: "bg-emerald-500", dotColor: "bg-emerald-500" },
//   ];

// // ─── Level Calculation ─────────────────────────────────────────────────────
// function calculateLevelData(totalXp: number) {
//   let level = 1;
//   let xpForNextLevel = 1000;
//   let xpAccumulated = 0;
//   while (totalXp >= xpAccumulated + xpForNextLevel) {
//     xpAccumulated += xpForNextLevel;
//     level++;
//     xpForNextLevel = level * 1000;
//   }
//   const currentLevelXp = totalXp - xpAccumulated;
//   return {
//     level,
//     currentLevelXp,
//     xpForNextLevel,
//     xpRemaining: xpForNextLevel - currentLevelXp,
//     progressPercentage: Math.min(100, Math.round((currentLevelXp / xpForNextLevel) * 100)),
//   };
// }

// // ─── Quiz & Campus Interfaces ───────────────────────────────────────────────
// export interface QuizLeaderboardUser {
//   userId: string;
//   username: string;
//   points: number;
//   rank: number;
//   accuracy: number;
//   correctCount: number;
//   totalCount: number;
//   avatar?: string;
// }

// export interface CampusParticipant {
//   userId: string;
//   userName: string;
//   userEmail: string;
//   points: number;
//   rank?: number;
// }

// export interface CampusEntry {
//   rank: number;
//   campusName: string;
//   shortName: string;
//   tagline: string;
//   points: number;
//   fansCount: number;
//   topFan: string;
//   badgeColor: string;
//   logoIcon: string;
//   isSymbiosis?: boolean;
// }

// export default function LeaderboardOverlayModal({
//   isOpen,
//   onClose,
//   initialTab = "global",
// }: LeaderboardOverlayModalProps) {
//   const { user } = useAuth();
//   const { leaderboard: globalLeaderboard, currentUserRank, currentUserPoints, loading: globalLoading } = useLeaderboard();

//   const [activeTab, setActiveTab] = useState<LeaderboardTab>(initialTab);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [roarPeriod, setRoarPeriod] = useState<"all_time" | "month" | "week">("all_time");

//   // Quiz leaderboard state (Real data only)
//   const [quizList, setQuizList] = useState<QuizLeaderboardUser[]>([]);
//   const [quizLoading, setQuizLoading] = useState(false);

//   // ROAR leaderboard state (Real data only — NO MOCK FALLBACKS)
//   const [roarList, setRoarList] = useState<any[]>([]);
//   const [roarLoading, setRoarLoading] = useState(false);

//   // Campus interaction state
//   const [campusJoinedToast, setCampusJoinedToast] = useState<string | null>(null);
//   const [representedCampus, setRepresentedCampus] = useState<string | null>("Symbiosis");
//   const [expandedCampus, setExpandedCampus] = useState<string | null>("Symbiosis");
//   const [allUsersList, setAllUsersList] = useState<any[]>([]);
//   const [usersLoading, setUsersLoading] = useState(false);

//   // Fetch real registered users and point records to locate all accounts with @ssss.edu.in
//   useEffect(() => {
//     if (!isOpen) return;
//     setUsersLoading(true);

//     const fetchAllData = async () => {
//       const combinedUsers: any[] = [];
//       const seen = new Set<string>();

//       const addUsers = (arr: any[]) => {
//         if (!Array.isArray(arr)) return;
//         arr.forEach((u) => {
//           if (!u) return;
//           const key = String(u.userId || u.actualUserId || u.id || u.email || u.userEmail || u.username || "");
//           if (key && !seen.has(key)) {
//             seen.add(key);
//             combinedUsers.push(u);
//           }
//         });
//       };

//       // 1. Fetch from /api/users
//       try {
//         const res = await axios.get("/api/users", { withCredentials: true });
//         const list =
//           res.data?.users ||
//           res.data?.data?.users ||
//           res.data?.data ||
//           res.data?.allUsers ||
//           res.data?.userList ||
//           (Array.isArray(res.data) ? res.data : []);
//         addUsers(list);
//       } catch {
//         try {
//           const fRes = await fetch("/api/users", { credentials: "include" });
//           if (fRes.ok) {
//             const j = await fRes.json();
//             const list = j?.users || j?.data?.users || j?.data || (Array.isArray(j) ? j : []);
//             addUsers(list);
//           }
//         } catch { }
//       }

//       // 2. Fetch from /api/user-points?limit=1000
//       try {
//         const pRes = await axios.get("/api/user-points?limit=1000", { withCredentials: true });
//         const pList =
//           pRes.data?.leaderboard ||
//           pRes.data?.data?.leaderboard ||
//           pRes.data?.data ||
//           pRes.data?.entries ||
//           (Array.isArray(pRes.data) ? pRes.data : []);
//         addUsers(pList);
//       } catch {
//         try {
//           const fRes = await fetch("/api/user-points?limit=1000", { credentials: "include" });
//           if (fRes.ok) {
//             const j = await fRes.json();
//             const pList = j?.leaderboard || j?.data?.leaderboard || j?.data || (Array.isArray(j) ? j : []);
//             addUsers(pList);
//           }
//         } catch { }
//       }

//       // 3. Include auth user from localStorage if available
//       try {
//         const rawAuth = localStorage.getItem("auth_user");
//         if (rawAuth) {
//           const parsed = JSON.parse(rawAuth);
//           if (parsed) addUsers([parsed]);
//         }
//       } catch { }

//       setAllUsersList(combinedUsers);
//       setUsersLoading(false);
//     };

//     fetchAllData();
//   }, [isOpen]);

//   // Swipe & tab navigation state & refs
//   const [slideDirection, setSlideDirection] = useState<number>(0);
//   const tabRefs = useRef<{ [key in LeaderboardTab]?: HTMLButtonElement | null }>({});
//   const touchStartRef = useRef<{ x: number; y: number } | null>(null);

//   // Auto-scroll active tab into view in the horizontal tabs bar
//   useEffect(() => {
//     if (tabRefs.current[activeTab]) {
//       tabRefs.current[activeTab]?.scrollIntoView({
//         behavior: "smooth",
//         inline: "center",
//         block: "nearest",
//       });
//     }
//   }, [activeTab]);

//   const handleTouchStart = (e: React.TouchEvent) => {
//     touchStartRef.current = {
//       x: e.touches[0].clientX,
//       y: e.touches[0].clientY,
//     };
//   };

//   const handleTouchEnd = (e: React.TouchEvent) => {
//     if (!touchStartRef.current) return;
//     const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
//     const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
//     touchStartRef.current = null;

//     if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.25) {
//       const currentIdx = TABS.findIndex((t) => t.id === activeTab);
//       if (deltaX < 0 && currentIdx < TABS.length - 1) {
//         setSlideDirection(1);
//         setActiveTab(TABS[currentIdx + 1].id);
//         setSearchQuery("");
//       } else if (deltaX > 0 && currentIdx > 0) {
//         setSlideDirection(-1);
//         setActiveTab(TABS[currentIdx - 1].id);
//         setSearchQuery("");
//       }
//     }
//   };

//   // Keyboard Escape listener
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === "Escape") onClose();
//     };
//     if (isOpen) {
//       document.addEventListener("keydown", handleKeyDown);
//       document.body.style.overflow = "hidden";
//     }
//     return () => {
//       document.removeEventListener("keydown", handleKeyDown);
//       document.body.style.overflow = "";
//     };
//   }, [isOpen, onClose]);

//   // Sync initial tab when opening
//   useEffect(() => {
//     if (isOpen) {
//       setActiveTab(initialTab);
//       setSearchQuery("");
//     }
//   }, [isOpen, initialTab]);

//   // Fetch Quiz Leaderboard from backend (Real data only)
//   const fetchQuizLeaderboard = useCallback(async () => {
//     setQuizLoading(true);
//     try {
//       const res = await axios.get("/api/engagements/quiz/leaderboard");
//       const resData = res?.data;
//       let rawList: any[] = [];
//       if (Array.isArray(resData)) rawList = resData;
//       else if (Array.isArray(resData?.leaderboard)) rawList = resData.leaderboard;
//       else if (Array.isArray(resData?.data?.entries)) rawList = resData.data.entries;
//       else if (Array.isArray(resData?.data?.leaderboard)) rawList = resData.data.leaderboard;
//       else if (Array.isArray(resData?.data)) rawList = resData.data;
//       else if (Array.isArray(resData?.entries)) rawList = resData.entries;

//       if (rawList.length > 0) {
//         const normalized = rawList.map((entry: any, index: number) => {
//           const username =
//             entry.userName ||
//             entry.username ||
//             entry.name ||
//             entry.displayName ||
//             entry.user?.userName ||
//             (entry.userEmail ? entry.userEmail.split("@")[0] : `Fan ${index + 1}`);
//           const points = Number(entry.totalPoints ?? entry.points ?? entry.score ?? 0);
//           const userId = entry.userId || entry.id || String(index);
//           const correctCount = Number(entry.correctCount ?? entry.correctAnswers ?? 0);
//           const totalCount = Number(entry.totalAnswered ?? entry.totalQuestions ?? 0);
//           const accuracy = entry.accuracy ?? (totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0);
//           return {
//             userId,
//             username,
//             points,
//             rank: Number(entry.rank || index + 1),
//             accuracy,
//             correctCount,
//             totalCount,
//             avatar: entry.userAvatar || entry.avatar || "",
//           };
//         });
//         normalized.sort((a, b) => b.points - a.points);
//         normalized.forEach((item, idx) => {
//           item.rank = idx + 1;
//         });
//         setQuizList(normalized);
//       } else {
//         setQuizList([]);
//       }
//     } catch {
//       setQuizList([]);
//     } finally {
//       setQuizLoading(false);
//     }
//   }, []);

//   // Fetch ROAR Leaderboard (Real data only - NO MOCK DATA)
//   const fetchRoarLeaderboard = useCallback(async () => {
//     setRoarLoading(true);
//     try {
//       const res = await axios.get(`/api/roar/leaderboard?period=${roarPeriod}`);
//       const data = res.data;

//       if (res.status === 200 && data?.success && Array.isArray(data?.leaderboard) && data.leaderboard.length > 0) {
//         // Map real backend records
//         const normalized = data.leaderboard.map((item: any, idx: number) => ({
//           userId: item.userId || item.uid || String(idx),
//           username: item.username || item.userName || item.name || "Fan",
//           badge: item.badge || "Fan",
//           team: item.team || "Sports Fan",
//           accuracy: Number(item.accuracy ?? 0),
//           predictions: Number(item.predictions ?? item.predictionCount ?? 0),
//           reputationScore: Number(item.reputationScore ?? item.totalPoints ?? item.points ?? 0),
//           rank: Number(item.rank || idx + 1),
//         }));
//         setRoarList(normalized);
//       } else if (Array.isArray(globalLeaderboard) && globalLeaderboard.length > 0) {
//         // Derive ROAR standings from real active platform users
//         const derived = globalLeaderboard.map((u: any, idx: number) => ({
//           userId: u.userId || String(idx),
//           username: u.userName || (u.userEmail ? u.userEmail.split("@")[0] : `Fan ${idx + 1}`),
//           badge: u.badge || "Fan",
//           team: u.team || "Sports Fan",
//           accuracy: Number(u.accuracy ?? 0),
//           predictions: Number(u.predictions ?? u.predictionCount ?? 0),
//           reputationScore: Number(u.totalPoints ?? u.points ?? 0),
//           rank: idx + 1,
//         }));
//         setRoarList(derived);
//       } else {
//         setRoarList([]);
//       }
//     } catch {
//       // If API route fails, use real platform leaderboard users (never fake mock data)
//       if (Array.isArray(globalLeaderboard) && globalLeaderboard.length > 0) {
//         const derived = globalLeaderboard.map((u: any, idx: number) => ({
//           userId: u.userId || String(idx),
//           username: u.userName || (u.userEmail ? u.userEmail.split("@")[0] : `Fan ${idx + 1}`),
//           badge: u.badge || "Fan",
//           team: u.team || "Sports Fan",
//           accuracy: Number(u.accuracy ?? 0),
//           predictions: Number(u.predictions ?? u.predictionCount ?? 0),
//           reputationScore: Number(u.totalPoints ?? u.points ?? 0),
//           rank: idx + 1,
//         }));
//         setRoarList(derived);
//       } else {
//         setRoarList([]);
//       }
//     } finally {
//       setRoarLoading(false);
//     }
//   }, [roarPeriod, globalLeaderboard]);

//   useEffect(() => {
//     if (isOpen) {
//       if (activeTab === "fliparena") fetchQuizLeaderboard();
//       if (activeTab === "roar") fetchRoarLeaderboard();
//     }
//   }, [isOpen, activeTab, fetchQuizLeaderboard, fetchRoarLeaderboard]);

//   // Current user info
//   const activeUserId = user?.userId || (user as any)?.actualUserId || user?.email;
//   const currentUserName = user?.name || (user as any)?.userName || "";
//   const currentPoints = currentUserPoints ?? 0;
//   const currentRank = currentUserRank ?? 0;
//   const levelInfo = useMemo(() => calculateLevelData(currentPoints), [currentPoints]);

//   // Filtered lists
//   const filteredGlobal = useMemo(() => {
//     const list = globalLeaderboard || [];
//     if (!searchQuery.trim()) return list;
//     return list.filter((u) => u.userName?.toLowerCase().includes(searchQuery.toLowerCase()));
//   }, [globalLeaderboard, searchQuery]);

//   const filteredQuiz = useMemo(() => {
//     if (!searchQuery.trim()) return quizList;
//     return quizList.filter((u) => u.username?.toLowerCase().includes(searchQuery.toLowerCase()));
//   }, [quizList, searchQuery]);

//   const filteredRoar = useMemo(() => {
//     if (!searchQuery.trim()) return roarList;
//     return roarList.filter((u) => u.username?.toLowerCase().includes(searchQuery.toLowerCase()));
//   }, [roarList, searchQuery]);

//   // Filter real users with @ssss.edu.in email domain for Symbiosis (No mock data)
//   const symbiosisParticipants = useMemo(() => {
//     const participantsMap = new Map<string, CampusParticipant>();

//     const pointsByEmail = new Map<string, number>();
//     const pointsById = new Map<string, number>();
//     const pointsByName = new Map<string, number>();

//     if (Array.isArray(globalLeaderboard)) {
//       globalLeaderboard.forEach((entry) => {
//         const pts = Number(entry.totalPoints) || 0;
//         const email = String(entry.userEmail || "").toLowerCase().trim();
//         const id = String(entry.userId || "").toLowerCase().trim();
//         const name = String(entry.userName || "").toLowerCase().trim();
//         if (email) pointsByEmail.set(email, pts);
//         if (id) pointsById.set(id, pts);
//         if (name) pointsByName.set(name, pts);
//       });
//     }

//     const checkIsSymbiosis = (u: any): { isMatch: boolean; email: string; name: string; id: string; points: number } => {
//       if (!u) return { isMatch: false, email: "", name: "", id: "", points: 0 };

//       const emailCandidates = [
//         u.email,
//         u.userEmail,
//         u.user_email,
//         u.mail,
//         u.emailId,
//         u.contactEmail,
//         typeof u.username === "string" && u.username.includes("@") ? u.username : undefined,
//         typeof u.userName === "string" && u.userName.includes("@") ? u.userName : undefined,
//         typeof u.userId === "string" && u.userId.includes("@") ? u.userId : undefined,
//         typeof u.actualUserId === "string" && u.actualUserId.includes("@") ? u.actualUserId : undefined,
//         typeof u.id === "string" && u.id.includes("@") ? u.id : undefined,
//       ];

//       let resolvedEmail = "";
//       for (const candidate of emailCandidates) {
//         if (typeof candidate === "string" && candidate.trim()) {
//           const lower = candidate.toLowerCase().trim();
//           if (lower.includes("ssss.edu.in")) {
//             resolvedEmail = lower.includes("@") ? lower : `${lower}@ssss.edu.in`;
//             break;
//           }
//         }
//       }

//       const rawId = String(u.userId || u.actualUserId || u.id || u.username || "");
//       if (!resolvedEmail && (rawId.toLowerCase().includes("ssss_edu_in") || rawId.toLowerCase().includes("ssss.edu.in"))) {
//         resolvedEmail = rawId.toLowerCase().replace(/_ssss_edu_in/g, "@ssss.edu.in").replace(/_at_/g, "@");
//         if (!resolvedEmail.includes("@")) {
//           resolvedEmail = `${resolvedEmail}@ssss.edu.in`;
//         }
//       }

//       if (!resolvedEmail) {
//         for (const key of Object.keys(u)) {
//           const val = u[key];
//           if (typeof val === "string") {
//             const lower = val.toLowerCase().trim();
//             if (lower.includes("ssss.edu.in")) {
//               resolvedEmail = lower.includes("@") ? lower : `${lower}@ssss.edu.in`;
//               break;
//             }
//           }
//         }
//       }

//       if (!resolvedEmail) {
//         return { isMatch: false, email: "", name: "", id: "", points: 0 };
//       }

//       const nameCandidates = [
//         u.name,
//         u.userName,
//         u.username,
//         u.displayName,
//         [u.firstName, u.lastName].filter(Boolean).join(" ").trim(),
//         u.firstName,
//       ];
//       let resolvedName = "";
//       for (const n of nameCandidates) {
//         if (typeof n === "string" && n.trim() && !n.includes("@ssss.edu.in") && !n.includes("ssss_edu_in")) {
//           resolvedName = n.trim();
//           break;
//         }
//       }
//       if (!resolvedName) {
//         const localPart = resolvedEmail.split("@")[0] || "Student";
//         resolvedName = localPart
//           .replace(/[._-]/g, " ")
//           .replace(/\b\w/g, (c) => c.toUpperCase())
//           .trim();
//       }

//       const pts =
//         u.totalPoints ??
//         u.points ??
//         u.score ??
//         u.reputationScore ??
//         u.quizPoints ??
//         u.userPoints;

//       const resolvedId = String(u.userId || u.actualUserId || u.id || resolvedEmail);

//       return {
//         isMatch: true,
//         email: resolvedEmail,
//         name: resolvedName,
//         id: resolvedId,
//         points: pts !== undefined && pts !== null && !isNaN(Number(pts)) ? Number(pts) : 0,
//       };
//     };

//     const processRecord = (u: any, fallbackPoints?: number) => {
//       const match = checkIsSymbiosis(u);
//       if (!match.isMatch) return;

//       const key = match.email.toLowerCase();
//       let resolvedPoints = match.points;

//       if (resolvedPoints === 0 && fallbackPoints !== undefined && fallbackPoints > 0) {
//         resolvedPoints = fallbackPoints;
//       }

//       if (resolvedPoints === 0) {
//         if (pointsByEmail.has(key)) {
//           resolvedPoints = pointsByEmail.get(key) || 0;
//         } else if (pointsById.has(match.id.toLowerCase())) {
//           resolvedPoints = pointsById.get(match.id.toLowerCase()) || 0;
//         } else if (pointsByName.has(match.name.toLowerCase())) {
//           resolvedPoints = pointsByName.get(match.name.toLowerCase()) || 0;
//         } else if (user?.email && key === user.email.toLowerCase()) {
//           resolvedPoints = currentUserPoints ?? 0;
//         }
//       }

//       const existing = participantsMap.get(key);
//       if (!existing) {
//         participantsMap.set(key, {
//           userId: match.id,
//           userName: match.name,
//           userEmail: match.email,
//           points: resolvedPoints,
//         });
//       } else {
//         if (resolvedPoints > existing.points) {
//           existing.points = resolvedPoints;
//         }
//         if (
//           match.name &&
//           match.name !== "Student" &&
//           (existing.userName === "Student" || existing.userName === existing.userEmail.split("@")[0])
//         ) {
//           existing.userName = match.name;
//         }
//       }
//     };

//     if (user) processRecord(user, currentUserPoints ?? 0);
//     if (Array.isArray(allUsersList)) allUsersList.forEach((u) => processRecord(u));
//     if (Array.isArray(globalLeaderboard)) globalLeaderboard.forEach((entry) => processRecord(entry, Number(entry.totalPoints) || 0));

//     const list = Array.from(participantsMap.values());
//     list.sort((a, b) => b.points - a.points);
//     return list.map((p, idx) => ({ ...p, rank: idx + 1 }));
//   }, [allUsersList, globalLeaderboard, user, currentUserPoints]);

//   const symbiosisTotalPoints = useMemo(() => {
//     return symbiosisParticipants.reduce((sum, p) => sum + (p.points || 0), 0);
//   }, [symbiosisParticipants]);

//   const symbiosisTotalParticipants = symbiosisParticipants.length;

//   const allCampuses = useMemo(() => {
//     const symbiosisEntry: CampusEntry = {
//       rank: 1,
//       campusName: "Symbiosis",
//       shortName: "Symbiosis SSSS",
//       tagline: "Symbiosis School of Sports Sciences • @ssss.edu.in",
//       points: symbiosisTotalPoints,
//       fansCount: symbiosisTotalParticipants,
//       topFan:
//         symbiosisParticipants[0]?.userName ||
//         (symbiosisParticipants.length > 0 ? "Symbiosis Fan" : "Awaiting participants"),
//       badgeColor: "#F59E0B",
//       logoIcon: "🏛️",
//       isSymbiosis: true,
//     };

//     return [symbiosisEntry];
//   }, [symbiosisTotalPoints, symbiosisTotalParticipants, symbiosisParticipants]);

//   const filteredCampus = useMemo(() => {
//     if (!searchQuery.trim()) return allCampuses;
//     const q = searchQuery.toLowerCase();
//     return allCampuses.filter(
//       (c) =>
//         c.campusName.toLowerCase().includes(q) ||
//         c.shortName.toLowerCase().includes(q) ||
//         c.tagline.toLowerCase().includes(q) ||
//         (c.isSymbiosis &&
//           symbiosisParticipants.some(
//             (p) =>
//               p.userName.toLowerCase().includes(q) ||
//               p.userEmail.toLowerCase().includes(q)
//           ))
//     );
//   }, [allCampuses, searchQuery, symbiosisParticipants]);

//   const handleJoinCampus = (campusName: string) => {
//     setRepresentedCampus(campusName);
//     setCampusJoinedToast(`Representing ${campusName}! Early registration confirmed 🎓`);
//     setTimeout(() => setCampusJoinedToast(null), 3500);
//   };

//   if (!isOpen) return null;

//   return (
//     <AnimatePresence>
//       <div
//         className="fixed inset-0 z-[2000] flex items-center justify-center p-2.5 sm:p-5 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-black/85 backdrop-blur-md overflow-hidden"
//         onClick={(e) => {
//           if (e.target === e.currentTarget) onClose();
//         }}
//       >
//         <motion.div
//           initial={{ opacity: 0, scale: 0.95, y: 15 }}
//           animate={{ opacity: 1, scale: 1, y: 0 }}
//           exit={{ opacity: 0, scale: 0.95, y: 15 }}
//           transition={{ duration: 0.2, ease: "easeOut" }}
//           className="w-full max-w-xl bg-[#0b0e17] border border-white/10 rounded-2xl sm:rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden max-h-[88dvh] sm:max-h-[85vh] relative my-auto"
//         >
//           {/* Top Accent Line */}
//           <div className="w-full h-1 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 shrink-0" />

//           {/* Toast Notification */}
//           <AnimatePresence>
//             {campusJoinedToast && (
//               <motion.div
//                 initial={{ opacity: 0, y: -15 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -15 }}
//                 className="absolute top-14 left-1/2 -translate-x-1/2 z-50 bg-[#172033] border border-emerald-500/40 text-emerald-400 text-xs font-bold px-4 py-2 rounded-full shadow-xl flex items-center gap-2"
//               >
//                 <CheckCircle2 size={14} />
//                 <span>{campusJoinedToast}</span>
//               </motion.div>
//             )}
//           </AnimatePresence>

//           {/* Modal Header */}
//           <div className="px-5 py-4 flex items-center justify-between border-b border-white/[0.08] bg-[#0e1220]/90">
//             <div className="flex items-center gap-3">
//               <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
//                 <Trophy size={18} />
//               </div>
//               <div>
//                 <div className="flex items-center gap-2">
//                   <h2 className="text-base font-black tracking-tight text-white">Leaderboards</h2>
//                 </div>
//                 <p className="text-[11px] text-white/40 font-medium">Rankings across Global, FlipARENA, RoAR & Campus</p>
//               </div>
//             </div>

//             <button
//               onClick={onClose}
//               className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/[0.06]"
//               title="Close"
//             >
//               <X size={16} />
//             </button>
//           </div>

//           {/* Tabs Navigation */}
//           <div
//             className="px-3 sm:px-4 pt-3 pb-2 border-b border-white/[0.06] bg-[#0a0d16] flex items-center gap-1.5 overflow-x-auto overflow-y-hidden scrollbar-none flex-nowrap shrink-0 select-none touch-pan-x"
//             style={{ touchAction: "pan-x" }}
//           >
//             {TABS.map((tab, idx) => {
//               const Icon = tab.icon;
//               const isActive = activeTab === tab.id;
//               return (
//                 <button
//                   key={tab.id}
//                   ref={(el) => {
//                     tabRefs.current[tab.id] = el;
//                   }}
//                   onClick={() => {
//                     const currentIdx = TABS.findIndex((t) => t.id === activeTab);
//                     setSlideDirection(idx > currentIdx ? 1 : -1);
//                     setActiveTab(tab.id);
//                     setSearchQuery("");
//                   }}
//                   className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 h-9 ${isActive
//                       ? "bg-white/[0.08] text-white shadow-sm border border-white/15"
//                       : "text-white/45 hover:text-white/80 hover:bg-white/[0.03] border border-transparent"
//                     }`}
//                 >
//                   <Icon size={14} className={isActive ? tab.color : "text-white/40"} />
//                   <span>{tab.label}</span>
//                 </button>
//               );
//             })}
//           </div>

//           {/* Dots Indicator */}
//           <div className="py-2.5 bg-[#080b13] border-b border-white/[0.04] flex items-center justify-center shrink-0 select-none">
//             <div className="flex items-center gap-2">
//               {TABS.map((tab, idx) => {
//                 const isActive = activeTab === tab.id;
//                 return (
//                   <button
//                     key={tab.id}
//                     onClick={() => {
//                       const currentIdx = TABS.findIndex((t) => t.id === activeTab);
//                       setSlideDirection(idx > currentIdx ? 1 : -1);
//                       setActiveTab(tab.id);
//                       setSearchQuery("");
//                     }}
//                     className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${isActive
//                         ? `w-7 ${tab.dotColor} shadow-[0_0_10px_currentColor]`
//                         : "w-2 bg-white/20 hover:bg-white/40"
//                       }`}
//                     title={`Switch to ${tab.label}`}
//                     aria-label={`Tab ${idx + 1}: ${tab.label}`}
//                   />
//                 );
//               })}
//             </div>
//           </div>

//           {/* Search Bar + Controls */}
//           <div className="px-4 py-2.5 bg-[#0e1220]/50 border-b border-white/[0.04] flex items-center gap-2">
//             <div className="relative flex-1">
//               <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
//               <input
//                 type="text"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 placeholder={
//                   activeTab === "global"
//                     ? "Search fans across global ranks..."
//                     : activeTab === "fliparena"
//                       ? "Search FlipARENA champions..."
//                       : activeTab === "roar"
//                         ? "Search RoAR predictors..."
//                         : "Search colleges & universities..."
//                 }
//                 className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-all"
//               />
//               {searchQuery && (
//                 <button
//                   onClick={() => setSearchQuery("")}
//                   className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs"
//                 >
//                   ✕
//                 </button>
//               )}
//             </div>

//             {/* ROAR Period Filter */}
//             {activeTab === "roar" && (
//               <div className="flex gap-1 bg-white/[0.04] p-0.5 rounded-lg border border-white/[0.06]">
//                 {(["all_time", "month", "week"] as const).map((p) => (
//                   <button
//                     key={p}
//                     onClick={() => setRoarPeriod(p)}
//                     className={`px-2 py-1 rounded-md text-[10px] font-black uppercase transition-all cursor-pointer ${roarPeriod === p ? "bg-amber-500/20 text-amber-400" : "text-white/40 hover:text-white/70"
//                       }`}
//                   >
//                     {p === "all_time" ? "All" : p}
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Tab Content Body with Horizontal Swipe Support */}
//           <div
//             className="p-3 sm:p-4 pb-12 sm:pb-16 flex-1 min-h-0 overflow-y-auto space-y-4 overscroll-contain"
//             onTouchStart={handleTouchStart}
//             onTouchEnd={handleTouchEnd}
//           >
//             <AnimatePresence mode="wait">
//               <motion.div
//                 key={activeTab}
//                 initial={{ opacity: 0, x: slideDirection > 0 ? 16 : slideDirection < 0 ? -16 : 0 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 exit={{ opacity: 0, x: slideDirection > 0 ? -16 : slideDirection < 0 ? 16 : 0 }}
//                 transition={{ duration: 0.16, ease: "easeOut" }}
//                 className="space-y-4"
//               >
//                 {/* ══════════════════ TAB 1: GLOBAL LEADERBOARD ══════════════════ */}
//                 {activeTab === "global" && (
//                   <div className="space-y-4">
//                     {/* User Current Standing Card */}
//                     <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-rose-950/40 via-[#141824] to-purple-950/40 border border-rose-500/25 flex flex-col gap-2.5 shadow-lg">
//                       <div className="flex items-center justify-between gap-2">
//                         <div className="flex items-center gap-2.5 min-w-0 flex-1">
//                           <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-orange-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20 shrink-0">
//                             <Trophy size={18} />
//                           </div>
//                           <div className="min-w-0 flex-1">
//                             <div className="flex items-center gap-1.5 flex-wrap">
//                               <span className="text-xs sm:text-sm font-black text-white whitespace-normal max-w-[140px] xs:max-w-[190px] sm:max-w-none">
//                                 {currentUserName || "Your Profile"}
//                               </span>
//                               <span className="text-[9px] font-black text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20 shrink-0 whitespace-nowrap">
//                                 LVL {levelInfo.level}
//                               </span>
//                             </div>
//                             <p className="text-[10px] text-white/40 mt-0.5 whitespace-nowrap">Global Fan Standing</p>
//                           </div>
//                         </div>

//                         <div className="text-right shrink-0 bg-white/[0.03] px-2.5 py-1.5 rounded-xl border border-white/[0.05]">
//                           <span className="text-[9px] font-bold text-white/40 block leading-none">Next Level in</span>
//                           <span className="text-xs font-black text-amber-400 whitespace-nowrap leading-tight mt-0.5 block">
//                             +{levelInfo.xpRemaining.toLocaleString()} SXP
//                           </span>
//                         </div>
//                       </div>

//                       <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.06]">
//                         <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
//                           <span className="text-[10px] font-bold text-white/40 uppercase">Rank</span>
//                           <span className="text-xs font-black text-white whitespace-nowrap">
//                             #{currentRank > 0 ? currentRank : "—"}
//                           </span>
//                         </div>

//                         <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-rose-500/[0.08] border border-rose-500/20">
//                           <span className="text-[10px] font-bold text-rose-300/70 uppercase">Total SXP</span>
//                           <span className="text-xs font-black text-rose-400 whitespace-nowrap">
//                             {currentPoints.toLocaleString()}
//                           </span>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Top 3 Podium (Global) */}
//                     {!searchQuery && filteredGlobal.length >= 3 && (
//                       <div className="grid grid-cols-3 gap-2 pt-1">
//                         <div className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-gradient-to-b from-slate-400/10 via-slate-500/5 to-transparent border border-slate-300/20 text-center relative min-w-0">
//                           <span className="text-base sm:text-lg mb-0.5 sm:mb-1">🥈</span>
//                           <span className="text-[10px] sm:text-[11px] font-black text-white break-words line-clamp-1 text-center w-full leading-tight">
//                             {filteredGlobal[1]?.userName}
//                           </span>
//                           <span className="text-[10px] sm:text-[11px] font-bold text-slate-300 mt-1 shrink-0 whitespace-nowrap">
//                             {filteredGlobal[1]?.totalPoints?.toLocaleString()} <span className="text-[8px] sm:text-[9px] text-white/40">SXP</span>
//                           </span>
//                         </div>

//                         <div className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-gradient-to-b from-amber-500/20 via-yellow-500/10 to-transparent border border-amber-500/40 text-center relative -mt-2 shadow-[0_0_20px_rgba(245,158,11,0.15)] min-w-0">
//                           <div className="flex items-center gap-1 text-lg sm:text-xl mb-0.5 sm:mb-1">
//                             <Crown size={15} className="text-amber-400" />
//                             <span>🥇</span>
//                           </div>
//                           <span className="text-[11px] sm:text-xs font-black text-amber-300 break-words line-clamp-1 text-center w-full leading-tight">
//                             {filteredGlobal[0]?.userName}
//                           </span>
//                           <span className="text-[11px] sm:text-xs font-black text-amber-400 mt-1 shrink-0 whitespace-nowrap">
//                             {filteredGlobal[0]?.totalPoints?.toLocaleString()} <span className="text-[8px] sm:text-[9px] text-amber-500">SXP</span>
//                           </span>
//                         </div>

//                         <div className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-gradient-to-b from-amber-700/10 via-amber-800/5 to-transparent border border-amber-700/30 text-center relative min-w-0">
//                           <span className="text-base sm:text-lg mb-0.5 sm:mb-1">🥉</span>
//                           <span className="text-[10px] sm:text-[11px] font-black text-white break-words line-clamp-1 text-center w-full leading-tight">
//                             {filteredGlobal[2]?.userName}
//                           </span>
//                           <span className="text-[10px] sm:text-[11px] font-bold text-amber-300/80 mt-1 shrink-0 whitespace-nowrap">
//                             {filteredGlobal[2]?.totalPoints?.toLocaleString()} <span className="text-[8px] sm:text-[9px] text-white/40">SXP</span>
//                           </span>
//                         </div>
//                       </div>
//                     )}

//                     {/* Ranked List */}
//                     <div className="space-y-1.5">
//                       <div className="flex items-center justify-between text-[10px] font-black uppercase text-white/40 px-2">
//                         <span>Rank & Fan</span>
//                         <span>Total SXP</span>
//                       </div>

//                       {globalLoading && filteredGlobal.length === 0 ? (
//                         <div className="py-8 flex flex-col items-center justify-center gap-2 text-white/40 text-xs">
//                           <RotateCw size={18} className="animate-spin text-rose-500" />
//                           <span>Loading Global Rankings...</span>
//                         </div>
//                       ) : filteredGlobal.length === 0 ? (
//                         <div className="py-8 text-center text-xs text-white/40 border border-white/5 rounded-2xl p-4">
//                           No fans matched your search query.
//                         </div>
//                       ) : (
//                         filteredGlobal.map((fan, idx) => {
//                           const rank = fan.rank || idx + 1;
//                           const isMe =
//                             (activeUserId && (fan.userId === activeUserId || fan.userEmail === activeUserId)) ||
//                             (fan.userName && currentUserName && fan.userName.toLowerCase() === currentUserName.toLowerCase());

//                           return (
//                             <div
//                               key={fan.userId || idx}
//                               className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border transition-all ${isMe
//                                   ? "bg-rose-500/10 border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.2)]"
//                                   : "bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]"
//                                 }`}
//                             >
//                               <div className="flex items-center gap-3 min-w-0 flex-1">
//                                 <span
//                                   className={`text-xs font-black w-6 text-center shrink-0 ${rank === 1
//                                       ? "text-amber-400"
//                                       : rank === 2
//                                         ? "text-slate-300"
//                                         : rank === 3
//                                           ? "text-amber-600"
//                                           : "text-white/40"
//                                     }`}
//                                 >
//                                   #{rank}
//                                 </span>
//                                 <div className="min-w-0 flex-1 pr-2">
//                                   <p className="text-xs font-black text-white flex items-center gap-1.5 flex-wrap leading-tight">
//                                     <span className="break-words">{fan.userName || "Fan"}</span>
//                                     {isMe && (
//                                       <span className="text-[8px] font-black bg-rose-500 text-white px-1.5 py-0.5 rounded uppercase shrink-0">
//                                         YOU
//                                       </span>
//                                     )}
//                                   </p>
//                                   <p className="text-[10px] text-white/40 mt-0.5">Rank #{rank}</p>
//                                 </div>
//                               </div>

//                               <div className="text-right shrink-0">
//                                 <span className="text-xs font-black text-rose-400">
//                                   {fan.totalPoints?.toLocaleString()}
//                                 </span>
//                                 <span className="text-[10px] font-bold text-white/40 ml-1">SXP</span>
//                               </div>
//                             </div>
//                           );
//                         })
//                       )}
//                     </div>
//                   </div>
//                 )}

//                 {/* ══════════════════ TAB 2: QUIZ LEADERBOARD ══════════════════ */}
//                 {activeTab === "fliparena" && (
//                   <div className="space-y-4">
//                     <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#161a29] to-yellow-500/10 border border-amber-500/30 flex items-center justify-between">
//                       <div className="flex items-center gap-2.5">
//                         <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
//                           <Brain size={20} />
//                         </div>
//                         <div>
//                           <h4 className="text-xs font-black text-white">FlipARENA Masters Ranking</h4>
//                           <p className="text-[10px] text-white/50">Combined stats from Watchalong rooms & Flip Arena</p>
//                         </div>
//                       </div>
//                       <button
//                         onClick={fetchQuizLeaderboard}
//                         disabled={quizLoading}
//                         className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-amber-400 border border-white/10 transition-colors cursor-pointer"
//                         title="Refresh FlipARENA Rankings"
//                       >
//                         <RotateCw size={14} className={quizLoading ? "animate-spin" : ""} />
//                       </button>
//                     </div>

//                     {/* Top 3 Podium (Quiz) */}
//                     {!searchQuery && filteredQuiz.length >= 3 && (
//                       <div className="grid grid-cols-3 gap-2 pt-1">
//                         <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-b from-slate-400/10 via-slate-500/5 to-transparent border border-slate-300/20 text-center relative min-w-0">
//                           <span className="text-lg mb-1">🥈</span>
//                           <span className="text-[11px] font-black text-white break-words text-center w-full leading-tight">
//                             {filteredQuiz[1]?.username}
//                           </span>
//                           <span className="text-[10px] font-bold text-amber-400/90 mt-1 shrink-0">
//                             {filteredQuiz[1]?.accuracy} acc
//                           </span>
//                           <span className="text-xs font-black text-slate-200 mt-0.5 shrink-0">
//                             {filteredQuiz[1]?.points?.toLocaleString()} <span className="text-[9px] text-white/40">PTS</span>
//                           </span>
//                         </div>

//                         <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-b from-amber-500/20 via-yellow-500/10 to-transparent border border-amber-500/40 text-center relative -mt-2 shadow-[0_0_20px_rgba(245,158,11,0.15)] min-w-0">
//                           <div className="flex items-center gap-1 text-xl mb-1">
//                             <Crown size={16} className="text-amber-400" />
//                             <span>🥇</span>
//                           </div>
//                           <span className="text-xs font-black text-amber-300 break-words text-center w-full leading-tight">
//                             {filteredQuiz[0]?.username}
//                           </span>
//                           <span className="text-[10px] font-black text-emerald-400 mt-1 shrink-0">
//                             {filteredQuiz[0]?.accuracy} acc
//                           </span>
//                           <span className="text-xs font-black text-amber-400 mt-0.5 shrink-0">
//                             {filteredQuiz[0]?.points?.toLocaleString()} <span className="text-[9px] text-amber-500">PTS</span>
//                           </span>
//                         </div>

//                         <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-b from-amber-700/10 via-amber-800/5 to-transparent border border-amber-700/30 text-center relative min-w-0">
//                           <span className="text-lg mb-1">🥉</span>
//                           <span className="text-[11px] font-black text-white break-words text-center w-full leading-tight">
//                             {filteredQuiz[2]?.username}
//                           </span>
//                           <span className="text-[10px] font-bold text-amber-400/90 mt-1 shrink-0">
//                             {filteredQuiz[2]?.accuracy} acc
//                           </span>
//                           <span className="text-xs font-black text-amber-300/80 mt-0.5 shrink-0">
//                             {filteredQuiz[2]?.points?.toLocaleString()} <span className="text-[9px] text-white/40">PTS</span>
//                           </span>
//                         </div>
//                       </div>
//                     )}

//                     {/* Quiz Ranked List */}
//                     <div className="space-y-1.5">
//                       <div className="flex items-center justify-between text-[10px] font-black uppercase text-white/40 px-2">
//                         <span>Rank & Quizzer</span>
//                         <span>Accuracy & Score</span>
//                       </div>

//                       {quizLoading && filteredQuiz.length === 0 ? (
//                         <div className="py-8 flex flex-col items-center justify-center gap-2 text-white/40 text-xs">
//                           <RotateCw size={18} className="animate-spin text-amber-500" />
//                           <span>Loading FlipARENA Rankings...</span>
//                         </div>
//                       ) : filteredQuiz.length === 0 ? (
//                         <div className="py-8 text-center text-xs text-white/40 border border-white/5 rounded-2xl p-4">
//                           {searchQuery
//                             ? `No quizzers matched "${searchQuery}".`
//                             : "No FlipARENA participants recorded yet. Play Watchalong or FlipArena to rank up!"}
//                         </div>
//                       ) : (
//                         filteredQuiz.map((quizzer, idx) => {
//                           const isMe =
//                             (activeUserId && quizzer.userId === activeUserId) ||
//                             (quizzer.username && currentUserName && quizzer.username.toLowerCase() === currentUserName.toLowerCase());

//                           return (
//                             <div
//                               key={quizzer.userId || idx}
//                               className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border transition-all ${isMe
//                                   ? "bg-amber-500/10 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
//                                   : "bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]"
//                                 }`}
//                             >
//                               <div className="flex items-center gap-3 min-w-0 flex-1">
//                                 <span
//                                   className={`text-xs font-black w-6 text-center shrink-0 ${quizzer.rank === 1
//                                       ? "text-amber-400"
//                                       : quizzer.rank === 2
//                                         ? "text-slate-300"
//                                         : quizzer.rank === 3
//                                           ? "text-amber-600"
//                                           : "text-white/40"
//                                     }`}
//                                 >
//                                   #{quizzer.rank}
//                                 </span>
//                                 <div className="min-w-0 flex-1 pr-2">
//                                   <p className="text-xs font-black text-white flex items-center gap-1.5 flex-wrap leading-tight">
//                                     <span className="break-words">{quizzer.username}</span>
//                                     {isMe && (
//                                       <span className="text-[8px] font-black bg-amber-500 text-black px-1.5 py-0.5 rounded uppercase shrink-0">
//                                         YOU
//                                       </span>
//                                     )}
//                                   </p>
//                                   <p className="text-[10px] text-white/40 mt-0.5">
//                                     {quizzer.correctCount}/{quizzer.totalCount} correct
//                                   </p>
//                                 </div>
//                               </div>

//                               <div className="text-right shrink-0">
//                                 <span className="text-xs font-black text-amber-400">
//                                   {quizzer.points?.toLocaleString()} PTS
//                                 </span>
//                                 <div className="text-[10px] font-bold text-emerald-400">{quizzer.accuracy} acc</div>
//                               </div>
//                             </div>
//                           );
//                         })
//                       )}
//                     </div>
//                   </div>
//                 )}

//                 {/* ══════════════════ TAB 3: ROAR LEADERBOARD (100% REAL DATA) ══════════════════ */}
//                 {activeTab === "roar" && (
//                   <div className="space-y-4">
//                     {/* ROAR Prediction Banner */}
//                     <div className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-500/10 via-[#161a29] to-red-500/10 border border-orange-500/30 flex items-center justify-between">
//                       <div className="flex items-center gap-2.5">
//                         <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
//                           <Flame size={20} />
//                         </div>
//                         <div>
//                           <h4 className="text-xs font-black text-white">RoAR Prediction Ranks</h4>
//                           <p className="text-[10px] text-white/50">Top call accuracy & community reputation</p>
//                         </div>
//                       </div>
//                       <button
//                         onClick={fetchRoarLeaderboard}
//                         disabled={roarLoading}
//                         className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-orange-400 border border-white/10 transition-colors cursor-pointer"
//                         title="Refresh RoAR Rankings"
//                       >
//                         <RotateCw size={14} className={roarLoading ? "animate-spin" : ""} />
//                       </button>
//                     </div>

//                     {/* ROAR Ranked List */}
//                     <div className="space-y-2">
//                       <div className="flex items-center justify-between text-[10px] font-black uppercase text-white/40 px-2">
//                         <span>Rank & Predictor</span>
//                         <span>Accuracy & Rep</span>
//                       </div>

//                       {roarLoading && filteredRoar.length === 0 ? (
//                         <div className="py-8 flex flex-col items-center justify-center gap-2 text-white/40 text-xs">
//                           <RotateCw size={18} className="animate-spin text-orange-500" />
//                           <span>Loading RoAR Rankings...</span>
//                         </div>
//                       ) : filteredRoar.length === 0 ? (
//                         <div className="py-8 text-center text-xs text-white/40 border border-white/5 rounded-2xl p-4">
//                           {searchQuery
//                             ? `No fans matched "${searchQuery}".`
//                             : "No RoAR rankings found for this timeframe. Create posts & earn upvotes to appear here!"}
//                         </div>
//                       ) : (
//                         filteredRoar.map((fan, idx) => {
//                           const isYou =
//                             (activeUserId && (fan.userId === activeUserId || fan.userEmail === activeUserId)) ||
//                             (fan.username && currentUserName && fan.username.toLowerCase() === currentUserName.toLowerCase()) ||
//                             (fan.username === ROAR_CURRENT_USER.username);
//                           const badgeLabel = BADGE_LABELS[fan.badge] || fan.badge || "Fan";
//                           const accColor =
//                             fan.accuracy >= 75
//                               ? "text-emerald-400"
//                               : fan.accuracy >= 65
//                                 ? "text-amber-400"
//                                 : "text-white/60";

//                           return (
//                             <div
//                               key={fan.userId || fan.username || idx}
//                               className={`flex items-center justify-between px-3.5 py-3 rounded-2xl border transition-all ${isYou
//                                   ? "bg-gradient-to-r from-orange-500/15 to-pink-500/15 border-orange-500/60 shadow-[0_0_15px_rgba(249,115,22,0.2)]"
//                                   : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]"
//                                 }`}
//                             >
//                               <div className="flex items-center gap-3 min-w-0 flex-1">
//                                 <span
//                                   className={`text-sm font-black w-6 text-center shrink-0 ${fan.rank === 1
//                                       ? "text-amber-400"
//                                       : fan.rank === 2
//                                         ? "text-slate-300"
//                                         : fan.rank === 3
//                                           ? "text-amber-600"
//                                           : "text-white/40"
//                                     }`}
//                                 >
//                                   #{fan.rank}
//                                 </span>
//                                 <div className="min-w-0 flex-1 pr-2">
//                                   <div className="flex items-center gap-1.5 flex-wrap">
//                                     <span className="text-xs font-black text-white break-words">{fan.username}</span>
//                                     {isYou && (
//                                       <span className="text-[8px] font-black bg-orange-500 text-white px-1.5 py-0.5 rounded uppercase shrink-0">
//                                         YOU
//                                       </span>
//                                     )}
//                                     <span className="text-[9px] font-black text-orange-400/90 bg-orange-400/10 px-1.5 py-0.5 rounded-full border border-orange-400/20 shrink-0">
//                                       {badgeLabel}
//                                     </span>
//                                   </div>
//                                   <p className="text-[10px] text-white/40 mt-0.5">
//                                     {fan.team} • {fan.predictions} calls
//                                   </p>
//                                 </div>
//                               </div>

//                               <div className="text-right shrink-0">
//                                 <span className={`text-sm font-black ${accColor}`}>{fan.accuracy}%</span>
//                                 <p className="text-[10px] font-bold text-white/40 mt-0.5">
//                                   {fan.reputationScore?.toLocaleString()} Rep
//                                 </p>
//                               </div>
//                             </div>
//                           );
//                         })
//                       )}
//                     </div>
//                   </div>
//                 )}

//                 {/* ══════════════════ TAB 4: CAMPUS CLASH ══════════════════ */}
//                 {activeTab === "campus" && (
//                   <div className="space-y-4">
//                     <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-[#111624] to-blue-950/30 border border-emerald-500/30 relative overflow-hidden">
//                       <div className="relative z-10">
//                         <div className="flex items-center gap-2 mb-1.5">
//                           <span className="text-[9px] font-black bg-emerald-500 text-black px-2 py-0.5 rounded-full tracking-wider uppercase">
//                             SEASON 1 BETA
//                           </span>
//                           <span className="text-xs font-bold text-white/60">Inter-College Fandom League</span>
//                         </div>
//                         <h3 className="text-base font-black text-white">Campus Clash 🎓</h3>
//                         <p className="text-xs text-white/60 mt-1 leading-relaxed">
//                           Represent your university, score points for your campus in Arena & Watchalong, and claim the #1 collegiate trophy!
//                         </p>
//                       </div>
//                     </div>

//                     <div className="space-y-2">
//                       <div className="flex items-center justify-between text-[10px] font-black uppercase text-white/40 px-2">
//                         <span>Rank & University</span>
//                         <span>Fans & Score</span>
//                       </div>

//                       {filteredCampus.length === 0 ? (
//                         <div className="py-8 text-center text-xs text-white/40 border border-white/5 rounded-2xl p-4">
//                           {searchQuery
//                             ? `No campuses or participants matched "${searchQuery}".`
//                             : "No campus entries found."}
//                         </div>
//                       ) : (
//                         filteredCampus.map((campus) => {
//                           const isRepresented = representedCampus === campus.campusName;
//                           const isSymbiosis = !!campus.isSymbiosis;
//                           const isExpanded = expandedCampus === campus.campusName;

//                           return (
//                             <div
//                               key={campus.campusName}
//                               onClick={() => {
//                                 if (isSymbiosis) {
//                                   setExpandedCampus(isExpanded ? null : campus.campusName);
//                                 }
//                               }}
//                               className={`p-3 sm:p-3.5 rounded-2xl border transition-all flex flex-col gap-2 group ${isSymbiosis
//                                   ? isExpanded
//                                     ? "bg-gradient-to-br from-amber-950/20 via-[#0e1322] to-emerald-950/20 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.12)] cursor-pointer"
//                                     : "bg-gradient-to-br from-amber-950/10 via-[#0b0f1a] to-emerald-950/10 border-amber-500/25 hover:border-amber-500/40 cursor-pointer"
//                                   : isRepresented
//                                     ? "bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
//                                     : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]"
//                                 }`}
//                             >
//                               <div className="flex items-center justify-between gap-2">
//                                 <div className="flex items-center gap-2.5 min-w-0 flex-1">
//                                   <span
//                                     className={`text-xs sm:text-sm font-black w-6 text-center shrink-0 ${campus.rank === 1
//                                         ? "text-amber-400"
//                                         : campus.rank === 2
//                                           ? "text-slate-300"
//                                           : campus.rank === 3
//                                             ? "text-amber-600"
//                                             : "text-white/40"
//                                       }`}
//                                   >
//                                     #{campus.rank}
//                                   </span>

//                                   <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-base shrink-0 group-hover:scale-105 transition-transform ${isSymbiosis
//                                       ? "bg-amber-500/15 border border-amber-500/30 text-amber-300"
//                                       : "bg-white/[0.04] border border-white/10"
//                                     }`}>
//                                     {campus.logoIcon}
//                                   </div>

//                                   <div className="min-w-0 flex-1">
//                                     <div className="flex items-center gap-1.5 flex-wrap">
//                                       <h4 className="text-xs sm:text-sm font-black text-white break-words">
//                                         {campus.campusName}
//                                       </h4>
//                                       <span className="text-[9px] font-extrabold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 shrink-0">
//                                         {campus.shortName}
//                                       </span>
//                                       {isSymbiosis && (
//                                         <span className="text-[8px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono shrink-0">
//                                           @ssss.edu.in
//                                         </span>
//                                       )}
//                                       {isRepresented && (
//                                         <span className="text-[8px] font-black bg-emerald-500 text-black px-1.5 py-0.5 rounded uppercase shrink-0 font-mono">
//                                           YOUR CAMPUS
//                                         </span>
//                                       )}
//                                     </div>
//                                   </div>
//                                 </div>

//                                 <div className="text-right shrink-0 pl-2">
//                                   <span className="text-xs sm:text-sm font-black text-emerald-400">
//                                     {campus.points.toLocaleString()}
//                                   </span>
//                                   <span className="text-[9px] font-bold text-white/40 ml-1">PTS</span>
//                                 </div>
//                               </div>

//                               <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/[0.04] text-[10px] text-white/50">
//                                 <div className="flex items-center gap-2 flex-wrap min-w-0 flex-1">
//                                   <span className="text-white/20">•</span>
//                                   <span className="text-emerald-400 font-bold">{campus.fansCount} Participants</span>
//                                   <span className="text-white/20 hidden xs:inline">•</span>
//                                   <span className="truncate text-white/40">
//                                     Top: <strong className="text-white/70">@{campus.topFan}</strong>
//                                   </span>
//                                 </div>

//                                 <div className="flex items-center gap-1.5 shrink-0">
//                                   {isSymbiosis && (
//                                     <button
//                                       onClick={(e) => {
//                                         e.stopPropagation();
//                                         setExpandedCampus(isExpanded ? null : campus.campusName);
//                                       }}
//                                       className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95"
//                                       title={isExpanded ? "Hide Symbiosis participants" : "View Symbiosis participants"}
//                                     >
//                                       <Users size={11} className="text-amber-400" />
//                                       <span className="hidden xs:inline">{isExpanded ? "Hide Roster" : `Roster (${symbiosisTotalParticipants})`}</span>
//                                       {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
//                                     </button>
//                                   )}

//                                   <button
//                                     onClick={(e) => {
//                                       e.stopPropagation();
//                                       handleJoinCampus(campus.campusName);
//                                     }}
//                                     className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95 shrink-0 ${isRepresented
//                                         ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
//                                         : "bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400"
//                                       }`}
//                                     title="Represent this campus"
//                                   >
//                                     {isRepresented ? "✓ Representing" : "Represent"}
//                                   </button>
//                                 </div>
//                               </div>

//                               {/* Accordion Content */}
//                               <AnimatePresence>
//                                 {isSymbiosis && isExpanded && (
//                                   <motion.div
//                                     initial={{ opacity: 0, height: 0 }}
//                                     animate={{ opacity: 1, height: "auto" }}
//                                     exit={{ opacity: 0, height: 0 }}
//                                     transition={{ duration: 0.22, ease: "easeOut" }}
//                                     className="overflow-hidden pt-2.5 mt-1 border-t border-white/[0.08]"
//                                     onClick={(e) => e.stopPropagation()}
//                                   >
//                                     <div className="bg-[#080d1a] p-3 rounded-xl border border-amber-500/25 space-y-2.5 shadow-inner">
//                                       <div className="flex items-center justify-between text-[11px] pb-2 border-b border-white/[0.06]">
//                                         <div className="flex items-center gap-1.5">
//                                           <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
//                                           <span className="font-black text-amber-300">@ssss.edu.in</span>
//                                           <span className="text-white/40">Verified Participants ({symbiosisTotalParticipants})</span>
//                                         </div>
//                                         <div className="text-[10px] font-bold text-emerald-400">
//                                           {symbiosisTotalPoints.toLocaleString()} Total Symbiosis PTS
//                                         </div>
//                                       </div>

//                                       <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
//                                         {usersLoading && symbiosisParticipants.length === 0 ? (
//                                           <div className="py-6 text-center text-xs text-white/40 flex items-center justify-center gap-2">
//                                             <RotateCw size={14} className="animate-spin text-amber-400" />
//                                             <span>Loading @ssss.edu.in participants...</span>
//                                           </div>
//                                         ) : symbiosisParticipants.length === 0 ? (
//                                           <div className="py-5 text-center text-xs text-white/40">
//                                             No registered participants with @ssss.edu.in found in system yet.
//                                           </div>
//                                         ) : (
//                                           symbiosisParticipants.map((p) => {
//                                             const isCurrentUser =
//                                               (activeUserId && p.userId === activeUserId) ||
//                                               (user?.email && p.userEmail.toLowerCase() === user.email.toLowerCase());

//                                             return (
//                                               <div
//                                                 key={p.userId}
//                                                 className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border transition-all ${isCurrentUser
//                                                     ? "bg-amber-500/15 border-amber-500/50 shadow-sm"
//                                                     : "bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]"
//                                                   }`}
//                                               >
//                                                 <div className="flex items-center gap-2.5 min-w-0 flex-1">
//                                                   <span
//                                                     className={`text-[11px] font-black w-5 text-center shrink-0 ${p.rank === 1
//                                                         ? "text-amber-400"
//                                                         : p.rank === 2
//                                                           ? "text-slate-300"
//                                                           : p.rank === 3
//                                                             ? "text-amber-600"
//                                                             : "text-white/40"
//                                                       }`}
//                                                   >
//                                                     #{p.rank}
//                                                   </span>

//                                                   <div className="min-w-0 flex-1">
//                                                     <div className="flex items-center gap-1.5 flex-wrap">
//                                                       <span className="text-xs font-black text-white break-words">{p.userName}</span>
//                                                       {isCurrentUser && (
//                                                         <span className="text-[8px] font-black bg-amber-500 text-black px-1.5 py-0.5 rounded uppercase font-mono">
//                                                           YOU
//                                                         </span>
//                                                       )}
//                                                     </div>
//                                                     <p className="text-[9px] text-white/40 font-mono break-all">{p.userEmail}</p>
//                                                   </div>
//                                                 </div>

//                                                 <div className="text-right shrink-0 pl-2">
//                                                   <span className="text-xs font-black text-emerald-400 whitespace-nowrap">
//                                                     {p.points.toLocaleString()}
//                                                   </span>
//                                                   <span className="text-[9px] font-bold text-white/40 ml-1">PTS</span>
//                                                 </div>
//                                               </div>
//                                             );
//                                           })
//                                         )}
//                                       </div>

//                                       <div className="flex items-center justify-between pt-1 text-[9px] text-white/40">
//                                         <span>Domain filter: Verified students with email ending in @ssss.edu.in</span>
//                                         <span className="text-amber-400/80 font-bold">Symbiosis SSSS</span>
//                                       </div>
//                                     </div>
//                                   </motion.div>
//                                 )}
//                               </AnimatePresence>
//                             </div>
//                           );
//                         })
//                       )}
//                     </div>
//                   </div>
//                 )}

//                 {/* Bottom spacer to prevent last user row and points from being cut off */}
//                 <div className="h-8 sm:h-12 shrink-0" aria-hidden="true" />
//               </motion.div>
//             </AnimatePresence>
//           </div>
//         </motion.div>
//       </div>
//     </AnimatePresence>
//   );
// }












"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Crown,
  Search,
  X,
  Flame,
  GraduationCap,
  Sparkles,
  Brain,
  CheckCircle2,
  RotateCw,
  ChevronDown,
  ChevronUp,
  Users,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLeaderboard } from "@/context/LeaderboardContext";
import { useRouter } from "next/navigation";
import {
  BADGE_LABELS,
  CURRENT_USER as ROAR_CURRENT_USER,
} from "@/src/components/NewROARComponent/constants";
import axios from "axios";

export type LeaderboardTab = "global" | "fliparena" | "roar" | "campus";

interface LeaderboardOverlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: LeaderboardTab;
}

export const TABS: {
  id: LeaderboardTab;
  label: string;
  icon: React.ElementType;
  color: string;
  activeBg: string;
  dotColor: string;
}[] = [
    { id: "global", label: "Global", icon: Sparkles, color: "text-rose-400", activeBg: "bg-rose-500", dotColor: "bg-rose-500" },
    { id: "fliparena", label: "FlipARENA", icon: Brain, color: "text-amber-400", activeBg: "bg-amber-500", dotColor: "bg-amber-500" },
    { id: "roar", label: "RoAR", icon: Flame, color: "text-orange-400", activeBg: "bg-orange-500", dotColor: "bg-orange-500" },
    { id: "campus", label: "Campus", icon: GraduationCap, color: "text-emerald-400", activeBg: "bg-emerald-500", dotColor: "bg-emerald-500" },
  ];

// ─── Level Calculation ─────────────────────────────────────────────────────
function calculateLevelData(totalXp: number) {
  let level = 1;
  let xpForNextLevel = 1000;
  let xpAccumulated = 0;
  while (totalXp >= xpAccumulated + xpForNextLevel) {
    xpAccumulated += xpForNextLevel;
    level++;
    xpForNextLevel = level * 1000;
  }
  const currentLevelXp = totalXp - xpAccumulated;
  return {
    level,
    currentLevelXp,
    xpForNextLevel,
    xpRemaining: xpForNextLevel - currentLevelXp,
    progressPercentage: Math.min(100, Math.round((currentLevelXp / xpForNextLevel) * 100)),
  };
}

// ─── Format Accuracy Helper ────────────────────────────────────────────────
function formatAccuracy(acc: any): string {
  if (acc === undefined || acc === null || acc === "") return "0%";
  const str = String(acc).trim();
  return str.endsWith("%") ? str : `${str}%`;
}

// ─── Quiz & Campus Interfaces ───────────────────────────────────────────────
export interface QuizLeaderboardUser {
  userId: string;
  username: string;
  points: number;
  rank: number;
  accuracy: string | number;
  correctCount: number;
  totalCount: number;
  avatar?: string;
}

export interface CampusParticipant {
  userId: string;
  userName: string;
  userEmail: string;
  points: number;
  rank?: number;
}

export interface CampusEntry {
  rank: number;
  campusName: string;
  shortName: string;
  tagline: string;
  points: number;
  fansCount: number;
  topFan: string;
  badgeColor: string;
  logoIcon: string;
  isSymbiosis?: boolean;
}

export default function LeaderboardOverlayModal({
  isOpen,
  onClose,
  initialTab = "global",
}: LeaderboardOverlayModalProps) {
  const { user } = useAuth();
  const router = useRouter();

  const handleOpenUserProfile = (targetUserId?: string, targetHandle?: string, targetName?: string) => {
    const targetUser =
      targetUserId ||
      (targetHandle && targetHandle !== "@fan" && targetHandle !== "@you" ? targetHandle.replace(/^@/, "") : null) ||
      (targetName && targetName !== "Fan" && targetName !== "You" ? targetName : null) ||
      (activeUserId as string | undefined);

    if (targetUser) {
      router.push(`/MainModules/ROAR?profileUserId=${encodeURIComponent(targetUser)}`);
    } else {
      router.push("/MainModules/ROAR");
    }
  };
  const { leaderboard: globalLeaderboard, currentUserRank, currentUserPoints, loading: globalLoading, refreshLeaderboard } = useLeaderboard();

  const [activeTab, setActiveTab] = useState<LeaderboardTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [roarPeriod, setRoarPeriod] = useState<"all_time" | "month" | "week">("all_time");

  // FlipARENA leaderboard state (Real data only)
  const [quizList, setQuizList] = useState<QuizLeaderboardUser[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);

  // ROAR leaderboard state (Real data only)
  const [roarList, setRoarList] = useState<any[]>([]);
  const [roarLoading, setRoarLoading] = useState(false);

  // Campus interaction state
  const [campusJoinedToast, setCampusJoinedToast] = useState<string | null>(null);
  const [representedCampus, setRepresentedCampus] = useState<string | null>("Symbiosis");
  const [expandedCampus, setExpandedCampus] = useState<string | null>("Symbiosis");
  const [allUsersList, setAllUsersList] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Auto-refresh when engagement participation happens
  useEffect(() => {
    const handlePointsUpdate = () => {
      if (refreshLeaderboard) refreshLeaderboard();
      fetchQuizLeaderboard();
      fetchRoarLeaderboard();
    };
    if (typeof window !== "undefined") {
      window.addEventListener("sf360:points-updated", handlePointsUpdate);
      window.addEventListener("arena-engagement-created", handlePointsUpdate);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("sf360:points-updated", handlePointsUpdate);
        window.removeEventListener("arena-engagement-created", handlePointsUpdate);
      }
    };
  }, [refreshLeaderboard]);

  // Fetch real registered users and point records for Campus clash
  useEffect(() => {
    if (!isOpen) return;
    setUsersLoading(true);

    const fetchAllData = async () => {
      const combinedUsers: any[] = [];
      const seen = new Set<string>();

      const addUsers = (arr: any[]) => {
        if (!Array.isArray(arr)) return;
        arr.forEach((u) => {
          if (!u) return;
          const key = String(u.userId || u.actualUserId || u.id || u.email || u.userEmail || u.username || "");
          if (key && !seen.has(key)) {
            seen.add(key);
            combinedUsers.push(u);
          }
        });
      };

      try {
        const res = await axios.get("/api/users", { withCredentials: true });
        const list =
          res.data?.users ||
          res.data?.data?.users ||
          res.data?.data ||
          res.data?.allUsers ||
          res.data?.userList ||
          (Array.isArray(res.data) ? res.data : []);
        addUsers(list);
      } catch {
        try {
          const fRes = await fetch("/api/users", { credentials: "include" });
          if (fRes.ok) {
            const j = await fRes.json();
            const list = j?.users || j?.data?.users || j?.data || (Array.isArray(j) ? j : []);
            addUsers(list);
          }
        } catch { }
      }

      try {
        const pRes = await axios.get("/api/user-points?limit=1000", { withCredentials: true });
        const pList =
          pRes.data?.leaderboard ||
          pRes.data?.data?.leaderboard ||
          pRes.data?.data ||
          pRes.data?.entries ||
          (Array.isArray(pRes.data) ? pRes.data : []);
        addUsers(pList);
      } catch {
        try {
          const fRes = await fetch("/api/user-points?limit=1000", { credentials: "include" });
          if (fRes.ok) {
            const j = await fRes.json();
            const pList = j?.leaderboard || j?.data?.leaderboard || j?.data || (Array.isArray(j) ? j : []);
            addUsers(pList);
          }
        } catch { }
      }

      try {
        const rawAuth = localStorage.getItem("auth_user");
        if (rawAuth) {
          const parsed = JSON.parse(rawAuth);
          if (parsed) addUsers([parsed]);
        }
      } catch { }

      setAllUsersList(combinedUsers);
      setUsersLoading(false);
    };

    fetchAllData();
  }, [isOpen]);

  // Swipe & tab navigation state & refs
  const [slideDirection, setSlideDirection] = useState<number>(0);
  const tabRefs = useRef<{ [key in LeaderboardTab]?: HTMLButtonElement | null }>({});
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Auto-scroll active tab into view
  useEffect(() => {
    if (tabRefs.current[activeTab]) {
      tabRefs.current[activeTab]?.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [activeTab]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.25) {
      const currentIdx = TABS.findIndex((t) => t.id === activeTab);
      if (deltaX < 0 && currentIdx < TABS.length - 1) {
        setSlideDirection(1);
        setActiveTab(TABS[currentIdx + 1].id);
        setSearchQuery("");
      } else if (deltaX > 0 && currentIdx > 0) {
        setSlideDirection(-1);
        setActiveTab(TABS[currentIdx - 1].id);
        setSearchQuery("");
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setSearchQuery("");
    }
  }, [isOpen, initialTab]);

  // Fetch FlipARENA Leaderboard (Real data only)
  const fetchQuizLeaderboard = useCallback(async () => {
    setQuizLoading(true);
    try {
      const res = await axios.get("/api/engagements/quiz/leaderboard");
      const resData = res?.data;
      let rawList: any[] = [];
      if (Array.isArray(resData)) rawList = resData;
      else if (Array.isArray(resData?.leaderboard)) rawList = resData.leaderboard;
      else if (Array.isArray(resData?.data?.entries)) rawList = resData.data.entries;
      else if (Array.isArray(resData?.data?.leaderboard)) rawList = resData.data.leaderboard;
      else if (Array.isArray(resData?.data)) rawList = resData.data;
      else if (Array.isArray(resData?.entries)) rawList = resData.entries;

      if (rawList.length > 0) {
        const normalized = rawList.map((entry: any, index: number) => {
          const username =
            entry.userName ||
            entry.username ||
            entry.name ||
            entry.displayName ||
            entry.user?.userName ||
            (entry.userEmail ? entry.userEmail.split("@")[0] : `Fan ${index + 1}`);
          const points = Number(entry.totalPoints ?? entry.points ?? entry.score ?? 0);
          const userId = entry.userId || entry.id || String(index);
          const correctCount = Number(entry.correctCount ?? entry.correctAnswers ?? 0);
          const totalCount = Number(entry.totalAnswered ?? entry.totalQuestions ?? 0);
          const rawAcc = entry.accuracy ?? (totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0);
          return {
            userId,
            username,
            points,
            rank: Number(entry.rank || index + 1),
            accuracy: formatAccuracy(rawAcc),
            correctCount,
            totalCount,
            avatar: entry.userAvatar || entry.avatar || "",
          };
        });
        normalized.sort((a, b) => b.points - a.points);
        normalized.forEach((item, idx) => {
          item.rank = idx + 1;
        });
        setQuizList(normalized);
      } else {
        setQuizList([]);
      }
    } catch {
      setQuizList([]);
    } finally {
      setQuizLoading(false);
    }
  }, []);

  // Fetch ROAR Leaderboard (Real data only)
  const fetchRoarLeaderboard = useCallback(async () => {
    setRoarLoading(true);
    try {
      const res = await axios.get(`/api/roar/leaderboard?period=${roarPeriod}`);
      const data = res.data;

      if (res.status === 200 && data?.success && Array.isArray(data?.leaderboard) && data.leaderboard.length > 0) {
        const normalized = data.leaderboard.map((item: any, idx: number) => ({
          userId: item.userId || item.uid || String(idx),
          username: item.username || item.userName || item.name || "Fan",
          badge: item.badge || "Fan",
          team: item.team || "Sports Fan",
          accuracy: Number(item.accuracy ?? 0),
          predictions: Number(item.predictions ?? item.predictionCount ?? 0),
          reputationScore: Number(item.reputationScore ?? item.totalPoints ?? item.points ?? 0),
          rank: Number(item.rank || idx + 1),
        }));
        setRoarList(normalized);
      } else if (Array.isArray(globalLeaderboard) && globalLeaderboard.length > 0) {
        const derived = globalLeaderboard.map((u: any, idx: number) => ({
          userId: u.userId || String(idx),
          username: u.userName || (u.userEmail ? u.userEmail.split("@")[0] : `Fan ${idx + 1}`),
          badge: u.badge || "Fan",
          team: u.team || "Sports Fan",
          accuracy: Number(u.accuracy ?? 0),
          predictions: Number(u.predictions ?? u.predictionCount ?? 0),
          reputationScore: Number(u.totalPoints ?? u.points ?? 0),
          rank: idx + 1,
        }));
        setRoarList(derived);
      } else {
        setRoarList([]);
      }
    } catch {
      if (Array.isArray(globalLeaderboard) && globalLeaderboard.length > 0) {
        const derived = globalLeaderboard.map((u: any, idx: number) => ({
          userId: u.userId || String(idx),
          username: u.userName || (u.userEmail ? u.userEmail.split("@")[0] : `Fan ${idx + 1}`),
          badge: u.badge || "Fan",
          team: u.team || "Sports Fan",
          accuracy: Number(u.accuracy ?? 0),
          predictions: Number(u.predictions ?? u.predictionCount ?? 0),
          reputationScore: Number(u.totalPoints ?? u.points ?? 0),
          rank: idx + 1,
        }));
        setRoarList(derived);
      } else {
        setRoarList([]);
      }
    } finally {
      setRoarLoading(false);
    }
  }, [roarPeriod, globalLeaderboard]);

  useEffect(() => {
    if (isOpen) {
      if (activeTab === "fliparena") fetchQuizLeaderboard();
      if (activeTab === "roar") fetchRoarLeaderboard();
    }
  }, [isOpen, activeTab, fetchQuizLeaderboard, fetchRoarLeaderboard]);

  // Current user info
  const activeUserId = user?.userId || (user as any)?.actualUserId || user?.email;
  const currentUserName = user?.name || (user as any)?.userName || "";
  const currentPoints = currentUserPoints ?? 0;
  const currentRank = currentUserRank ?? 0;
  const levelInfo = useMemo(() => calculateLevelData(currentPoints), [currentPoints]);

  // Find user's standing in FlipARENA
  const currentQuizUser = useMemo(() => {
    return quizList.find((q) =>
      (activeUserId && q.userId === activeUserId) ||
      (q.username && currentUserName && q.username.toLowerCase() === currentUserName.toLowerCase())
    );
  }, [quizList, activeUserId, currentUserName]);

  // Filtered lists
  const filteredGlobal = useMemo(() => {
    const list = globalLeaderboard || [];
    if (!searchQuery.trim()) return list;
    return list.filter((u) => u.userName?.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [globalLeaderboard, searchQuery]);

  const filteredQuiz = useMemo(() => {
    if (!searchQuery.trim()) return quizList;
    return quizList.filter((u) => u.username?.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [quizList, searchQuery]);

  const filteredRoar = useMemo(() => {
    if (!searchQuery.trim()) return roarList;
    return roarList.filter((u) => u.username?.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [roarList, searchQuery]);

  // Filter real users with @ssss.edu.in email domain for Symbiosis
  const symbiosisParticipants = useMemo(() => {
    const participantsMap = new Map<string, CampusParticipant>();
    const pointsByEmail = new Map<string, number>();
    const pointsById = new Map<string, number>();
    const pointsByName = new Map<string, number>();

    if (Array.isArray(globalLeaderboard)) {
      globalLeaderboard.forEach((entry) => {
        const pts = Number(entry.totalPoints) || 0;
        const email = String(entry.userEmail || "").toLowerCase().trim();
        const id = String(entry.userId || "").toLowerCase().trim();
        const name = String(entry.userName || "").toLowerCase().trim();
        if (email) pointsByEmail.set(email, pts);
        if (id) pointsById.set(id, pts);
        if (name) pointsByName.set(name, pts);
      });
    }

    const checkIsSymbiosis = (u: any): { isMatch: boolean; email: string; name: string; id: string; points: number } => {
      if (!u) return { isMatch: false, email: "", name: "", id: "", points: 0 };

      const emailCandidates = [
        u.email,
        u.userEmail,
        u.user_email,
        u.mail,
        u.emailId,
        u.contactEmail,
        typeof u.username === "string" && u.username.includes("@") ? u.username : undefined,
        typeof u.userName === "string" && u.userName.includes("@") ? u.userName : undefined,
        typeof u.userId === "string" && u.userId.includes("@") ? u.userId : undefined,
        typeof u.actualUserId === "string" && u.actualUserId.includes("@") ? u.actualUserId : undefined,
        typeof u.id === "string" && u.id.includes("@") ? u.id : undefined,
      ];

      let resolvedEmail = "";
      for (const candidate of emailCandidates) {
        if (typeof candidate === "string" && candidate.trim()) {
          const lower = candidate.toLowerCase().trim();
          if (lower.includes("ssss.edu.in")) {
            resolvedEmail = lower.includes("@") ? lower : `${lower}@ssss.edu.in`;
            break;
          }
        }
      }

      const rawId = String(u.userId || u.actualUserId || u.id || u.username || "");
      if (!resolvedEmail && (rawId.toLowerCase().includes("ssss_edu_in") || rawId.toLowerCase().includes("ssss.edu.in"))) {
        resolvedEmail = rawId.toLowerCase().replace(/_ssss_edu_in/g, "@ssss.edu.in").replace(/_at_/g, "@");
        if (!resolvedEmail.includes("@")) {
          resolvedEmail = `${resolvedEmail}@ssss.edu.in`;
        }
      }

      if (!resolvedEmail) {
        for (const key of Object.keys(u)) {
          const val = u[key];
          if (typeof val === "string") {
            const lower = val.toLowerCase().trim();
            if (lower.includes("ssss.edu.in")) {
              resolvedEmail = lower.includes("@") ? lower : `${lower}@ssss.edu.in`;
              break;
            }
          }
        }
      }

      if (!resolvedEmail) {
        return { isMatch: false, email: "", name: "", id: "", points: 0 };
      }

      const nameCandidates = [
        u.name,
        u.userName,
        u.username,
        u.displayName,
        [u.firstName, u.lastName].filter(Boolean).join(" ").trim(),
        u.firstName,
      ];
      let resolvedName = "";
      for (const n of nameCandidates) {
        if (typeof n === "string" && n.trim() && !n.includes("@ssss.edu.in") && !n.includes("ssss_edu_in")) {
          resolvedName = n.trim();
          break;
        }
      }
      if (!resolvedName) {
        const localPart = resolvedEmail.split("@")[0] || "Student";
        resolvedName = localPart
          .replace(/[._-]/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase())
          .trim();
      }

      const pts =
        u.totalPoints ??
        u.points ??
        u.score ??
        u.reputationScore ??
        u.quizPoints ??
        u.userPoints;

      const resolvedId = String(u.userId || u.actualUserId || u.id || resolvedEmail);

      return {
        isMatch: true,
        email: resolvedEmail,
        name: resolvedName,
        id: resolvedId,
        points: pts !== undefined && pts !== null && !isNaN(Number(pts)) ? Number(pts) : 0,
      };
    };

    const processRecord = (u: any, fallbackPoints?: number) => {
      const match = checkIsSymbiosis(u);
      if (!match.isMatch) return;

      const key = match.email.toLowerCase();
      let resolvedPoints = match.points;

      if (resolvedPoints === 0 && fallbackPoints !== undefined && fallbackPoints > 0) {
        resolvedPoints = fallbackPoints;
      }

      if (resolvedPoints === 0) {
        if (pointsByEmail.has(key)) {
          resolvedPoints = pointsByEmail.get(key) || 0;
        } else if (pointsById.has(match.id.toLowerCase())) {
          resolvedPoints = pointsById.get(match.id.toLowerCase()) || 0;
        } else if (pointsByName.has(match.name.toLowerCase())) {
          resolvedPoints = pointsByName.get(match.name.toLowerCase()) || 0;
        } else if (user?.email && key === user.email.toLowerCase()) {
          resolvedPoints = currentUserPoints ?? 0;
        }
      }

      const existing = participantsMap.get(key);
      if (!existing) {
        participantsMap.set(key, {
          userId: match.id,
          userName: match.name,
          userEmail: match.email,
          points: resolvedPoints,
        });
      } else {
        if (resolvedPoints > existing.points) {
          existing.points = resolvedPoints;
        }
        if (
          match.name &&
          match.name !== "Student" &&
          (existing.userName === "Student" || existing.userName === existing.userEmail.split("@")[0])
        ) {
          existing.userName = match.name;
        }
      }
    };

    if (user) processRecord(user, currentUserPoints ?? 0);
    if (Array.isArray(allUsersList)) allUsersList.forEach((u) => processRecord(u));
    if (Array.isArray(globalLeaderboard)) globalLeaderboard.forEach((entry) => processRecord(entry, Number(entry.totalPoints) || 0));

    const list = Array.from(participantsMap.values());
    list.sort((a, b) => b.points - a.points);
    return list.map((p, idx) => ({ ...p, rank: idx + 1 }));
  }, [allUsersList, globalLeaderboard, user, currentUserPoints]);

  const symbiosisTotalPoints = useMemo(() => {
    return symbiosisParticipants.reduce((sum, p) => sum + (p.points || 0), 0);
  }, [symbiosisParticipants]);

  const symbiosisTotalParticipants = symbiosisParticipants.length;

  const allCampuses = useMemo(() => {
    const symbiosisEntry: CampusEntry = {
      rank: 1,
      campusName: "Symbiosis",
      shortName: "Symbiosis SSSS",
      tagline: "Symbiosis School of Sports Sciences • @ssss.edu.in",
      points: symbiosisTotalPoints,
      fansCount: symbiosisTotalParticipants,
      topFan:
        symbiosisParticipants[0]?.userName ||
        (symbiosisParticipants.length > 0 ? "Symbiosis Fan" : "Awaiting participants"),
      badgeColor: "#F59E0B",
      logoIcon: "🏛️",
      isSymbiosis: true,
    };

    return [symbiosisEntry];
  }, [symbiosisTotalPoints, symbiosisTotalParticipants, symbiosisParticipants]);

  const filteredCampus = useMemo(() => {
    if (!searchQuery.trim()) return allCampuses;
    const q = searchQuery.toLowerCase();
    return allCampuses.filter(
      (c) =>
        c.campusName.toLowerCase().includes(q) ||
        c.shortName.toLowerCase().includes(q) ||
        c.tagline.toLowerCase().includes(q) ||
        (c.isSymbiosis &&
          symbiosisParticipants.some(
            (p) =>
              p.userName.toLowerCase().includes(q) ||
              p.userEmail.toLowerCase().includes(q)
          ))
    );
  }, [allCampuses, searchQuery, symbiosisParticipants]);

  const handleJoinCampus = (campusName: string) => {
    setRepresentedCampus(campusName);
    setCampusJoinedToast(`Representing ${campusName}! Early registration confirmed 🎓`);
    setTimeout(() => setCampusJoinedToast(null), 3500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[2000] flex items-center justify-center p-2.5 sm:p-5 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-black/85 backdrop-blur-md overflow-hidden"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-full max-w-xl bg-[#0b0e17] border border-white/10 rounded-2xl sm:rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden max-h-[88dvh] sm:max-h-[85vh] relative my-auto"
        >
          {/* Top Accent Line */}
          <div className="w-full h-1 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 shrink-0" />

          {/* Toast Notification */}
          <AnimatePresence>
            {campusJoinedToast && (
              <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="absolute top-14 left-1/2 -translate-x-1/2 z-50 bg-[#172033] border border-emerald-500/40 text-emerald-400 text-xs font-bold px-4 py-2 rounded-full shadow-xl flex items-center gap-2"
              >
                <CheckCircle2 size={14} />
                <span>{campusJoinedToast}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Modal Header */}
          <div className="px-5 py-4 flex items-center justify-between border-b border-white/[0.08] bg-[#0e1220]/90">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                <Trophy size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black tracking-tight text-white">Leaderboards</h2>
                </div>
                <p className="text-[11px] text-white/40 font-medium">Rankings across Global, FlipARENA, RoAR & Campus</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/[0.06]"
              title="Close"
            >
              <X size={16} />
            </button>
          </div>

          {/* Tabs Navigation */}
          <div
            className="px-3 sm:px-4 pt-3 pb-2 border-b border-white/[0.06] bg-[#0a0d16] flex items-center gap-1.5 overflow-x-auto overflow-y-hidden scrollbar-none flex-nowrap shrink-0 select-none touch-pan-x"
            style={{ touchAction: "pan-x" }}
          >
            {TABS.map((tab, idx) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  ref={(el) => {
                    tabRefs.current[tab.id] = el;
                  }}
                  onClick={() => {
                    const currentIdx = TABS.findIndex((t) => t.id === activeTab);
                    setSlideDirection(idx > currentIdx ? 1 : -1);
                    setActiveTab(tab.id);
                    setSearchQuery("");
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 h-9 ${isActive
                    ? "bg-white/[0.08] text-white shadow-sm border border-white/15"
                    : "text-white/45 hover:text-white/80 hover:bg-white/[0.03] border border-transparent"
                    }`}
                >
                  <Icon size={14} className={isActive ? tab.color : "text-white/40"} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Dots Indicator */}
          <div className="py-2.5 bg-[#080b13] border-b border-white/[0.04] flex items-center justify-center shrink-0 select-none">
            <div className="flex items-center gap-2">
              {TABS.map((tab, idx) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      const currentIdx = TABS.findIndex((t) => t.id === activeTab);
                      setSlideDirection(idx > currentIdx ? 1 : -1);
                      setActiveTab(tab.id);
                      setSearchQuery("");
                    }}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${isActive
                      ? `w-7 ${tab.dotColor} shadow-[0_0_10px_currentColor]`
                      : "w-2 bg-white/20 hover:bg-white/40"
                      }`}
                    title={`Switch to ${tab.label}`}
                    aria-label={`Tab ${idx + 1}: ${tab.label}`}
                  />
                );
              })}
            </div>
          </div>

          {/* Search Bar + Controls */}
          <div className="px-4 py-2.5 bg-[#0e1220]/50 border-b border-white/[0.04] flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === "global"
                    ? "Search fans across global ranks..."
                    : activeTab === "fliparena"
                      ? "Search FlipARENA champions..."
                      : activeTab === "roar"
                        ? "Search RoAR predictors..."
                        : "Search colleges & universities..."
                }
                className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* ROAR Period Filter */}
            {activeTab === "roar" && (
              <div className="flex gap-1 bg-white/[0.04] p-0.5 rounded-lg border border-white/[0.06]">
                {(["all_time", "month", "week"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setRoarPeriod(p)}
                    className={`px-2 py-1 rounded-md text-[10px] font-black uppercase transition-all cursor-pointer ${roarPeriod === p ? "bg-amber-500/20 text-amber-400" : "text-white/40 hover:text-white/70"
                      }`}
                  >
                    {p === "all_time" ? "All" : p}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tab Content Body with Horizontal Swipe Support */}
          <div
            className="p-3 sm:p-4 pb-12 sm:pb-16 flex-1 min-h-0 overflow-y-auto space-y-4 overscroll-contain"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: slideDirection > 0 ? 16 : slideDirection < 0 ? -16 : 0 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: slideDirection > 0 ? -16 : slideDirection < 0 ? 16 : 0 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                className="space-y-4"
              >
                {/* ══════════════════ TAB 1: GLOBAL LEADERBOARD ══════════════════ */}
                {activeTab === "global" && (
                  <div className="space-y-4">
                    {/* User Current Standing Card */}
                    <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-rose-950/40 via-[#141824] to-purple-950/40 border border-rose-500/25 flex flex-col gap-2.5 shadow-lg">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-orange-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20 shrink-0">
                            <Trophy size={18} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs sm:text-sm font-black text-white whitespace-normal max-w-[140px] xs:max-w-[190px] sm:max-w-none">
                                {currentUserName || "Your Profile"}
                              </span>
                              <span className="text-[9px] font-black text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20 shrink-0 whitespace-nowrap">
                                LVL {levelInfo.level}
                              </span>
                            </div>
                            <p className="text-[10px] text-white/40 mt-0.5 whitespace-nowrap">Global Fan Standing</p>
                          </div>
                        </div>

                        <div className="text-right shrink-0 bg-white/[0.03] px-2.5 py-1.5 rounded-xl border border-white/[0.05]">
                          <span className="text-[9px] font-bold text-white/40 block leading-none">Next Level in</span>
                          <span className="text-xs font-black text-amber-400 whitespace-nowrap leading-tight mt-0.5 block">
                            +{levelInfo.xpRemaining.toLocaleString()} SXP
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.06]">
                        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                          <span className="text-[10px] font-bold text-white/40 uppercase">Rank</span>
                          <span className="text-xs font-black text-white whitespace-nowrap">
                            #{currentRank > 0 ? currentRank : "—"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-rose-500/[0.08] border border-rose-500/20">
                          <span className="text-[10px] font-bold text-rose-300/70 uppercase">Total SXP</span>
                          <span className="text-xs font-black text-rose-400 whitespace-nowrap">
                            {currentPoints.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Top 3 Podium (Global) */}
                    {!searchQuery && filteredGlobal.length >= 3 && (
                      <div className="grid grid-cols-3 gap-2 pt-1">
                        <div className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-gradient-to-b from-slate-400/10 via-slate-500/5 to-transparent border border-slate-300/20 text-center relative min-w-0">
                          <span className="text-base sm:text-lg mb-0.5 sm:mb-1">🥈</span>
                          <span className="text-[10px] sm:text-[11px] font-black text-white break-words line-clamp-1 text-center w-full leading-tight">
                            {filteredGlobal[1]?.userName}
                          </span>
                          <span className="text-[10px] sm:text-[11px] font-bold text-slate-300 mt-1 shrink-0 whitespace-nowrap">
                            {filteredGlobal[1]?.totalPoints?.toLocaleString()} <span className="text-[8px] sm:text-[9px] text-white/40">SXP</span>
                          </span>
                        </div>

                        <div className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-gradient-to-b from-amber-500/20 via-yellow-500/10 to-transparent border border-amber-500/40 text-center relative -mt-2 shadow-[0_0_20px_rgba(245,158,11,0.15)] min-w-0">
                          <div className="flex items-center gap-1 text-lg sm:text-xl mb-0.5 sm:mb-1">
                            <Crown size={15} className="text-amber-400" />
                            <span>🥇</span>
                          </div>
                          <span className="text-[11px] sm:text-xs font-black text-amber-300 break-words line-clamp-1 text-center w-full leading-tight">
                            {filteredGlobal[0]?.userName}
                          </span>
                          <span className="text-[11px] sm:text-xs font-black text-amber-400 mt-1 shrink-0 whitespace-nowrap">
                            {filteredGlobal[0]?.totalPoints?.toLocaleString()} <span className="text-[8px] sm:text-[9px] text-amber-500">SXP</span>
                          </span>
                        </div>

                        <div className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-gradient-to-b from-amber-700/10 via-amber-800/5 to-transparent border border-amber-700/30 text-center relative min-w-0">
                          <span className="text-base sm:text-lg mb-0.5 sm:mb-1">🥉</span>
                          <span className="text-[10px] sm:text-[11px] font-black text-white break-words line-clamp-1 text-center w-full leading-tight">
                            {filteredGlobal[2]?.userName}
                          </span>
                          <span className="text-[10px] sm:text-[11px] font-bold text-amber-300/80 mt-1 shrink-0 whitespace-nowrap">
                            {filteredGlobal[2]?.totalPoints?.toLocaleString()} <span className="text-[8px] sm:text-[9px] text-white/40">SXP</span>
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Ranked List */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase text-white/40 px-2">
                        <span>Rank & Fan</span>
                        <span>Total SXP</span>
                      </div>

                      {globalLoading && filteredGlobal.length === 0 ? (
                        <div className="py-8 flex flex-col items-center justify-center gap-2 text-white/40 text-xs">
                          <RotateCw size={18} className="animate-spin text-rose-500" />
                          <span>Loading Global Rankings...</span>
                        </div>
                      ) : filteredGlobal.length === 0 ? (
                        <div className="py-8 text-center text-xs text-white/40 border border-white/5 rounded-2xl p-4">
                          No fans matched your search query.
                        </div>
                      ) : (
                        filteredGlobal.map((fan, idx) => {
                          const rank = fan.rank || idx + 1;
                          const isMe =
                            (activeUserId && (fan.userId === activeUserId || fan.userEmail === activeUserId)) ||
                            (fan.userName && currentUserName && fan.userName.toLowerCase() === currentUserName.toLowerCase());

                          return (
                            <div
                              key={fan.userId || idx}
                              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border transition-all ${isMe
                                ? "bg-rose-500/10 border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.2)]"
                                : "bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]"
                                }`}
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <span
                                  className={`text-xs font-black w-6 text-center shrink-0 ${rank === 1
                                    ? "text-amber-400"
                                    : rank === 2
                                      ? "text-slate-300"
                                      : rank === 3
                                        ? "text-amber-600"
                                        : "text-white/40"
                                    }`}
                                >
                                  #{rank}
                                </span>
                                <div className="min-w-0 flex-1 pr-2">
                                  {/* <p className="text-xs font-black text-white flex items-center gap-1.5 flex-wrap leading-tight">
                                    <span className="break-words">{fan.userName || "Fan"}</span> */}
                                  <p className="text-xs font-black text-white flex items-center gap-1.5 flex-wrap leading-tight">
                                    <span
                                      onClick={() => handleOpenUserProfile(fan.userId, fan.userHandle, fan.userName)}
                                      className="break-words cursor-pointer hover:text-rose-300 hover:underline transition-colors"
                                    >
                                      {fan.userName || "Fan"}
                                    </span>
                                    {isMe && (
                                      <span className="text-[8px] font-black bg-rose-500 text-white px-1.5 py-0.5 rounded uppercase shrink-0">
                                        YOU
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-[10px] text-white/40 mt-0.5">Rank #{rank}</p>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="text-xs font-black text-rose-400">
                                  {fan.totalPoints?.toLocaleString()}
                                </span>
                                <span className="text-[10px] font-bold text-white/40 ml-1">SXP</span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* ══════════════════ TAB 2: FLIPARENA LEADERBOARD ══════════════════ */}
                {activeTab === "fliparena" && (
                  <div className="space-y-4">
                    {/* User Standing in FlipARENA */}
                    {/* <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-[#161a29] to-yellow-950/30 border border-amber-500/25 flex flex-col gap-2.5 shadow-lg"> */}
                    {/* <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20 shrink-0">
                            <Brain size={18} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs sm:text-sm font-black text-white whitespace-normal max-w-[140px] xs:max-w-[190px] sm:max-w-none">
                                {currentUserName || "Your Profile"}
                              </span>
                              <span className="text-[9px] font-black text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30 shrink-0 whitespace-nowrap">
                                +2 PTS / PARTICIPATION
                              </span>
                            </div>
                            <p className="text-[10px] text-white/40 mt-0.5 whitespace-nowrap">
                              FlipARENA Standing · Quizzes, Polls, Predictions & Battles
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0 bg-white/[0.03] px-2.5 py-1.5 rounded-xl border border-white/[0.05]">
                          <span className="text-[9px] font-bold text-white/40 block leading-none">Your Rank</span>
                          <span className="text-xs font-black text-amber-400 whitespace-nowrap leading-tight mt-0.5 block">
                            #{currentQuizUser?.rank || currentRank || "—"}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.06]">
                        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                          <span className="text-[10px] font-bold text-white/40 uppercase">Accuracy</span>
                          <span className="text-xs font-black text-emerald-400 whitespace-nowrap">
                            {formatAccuracy(currentQuizUser?.accuracy)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-amber-500/[0.08] border border-amber-500/20">
                          <span className="text-[10px] font-bold text-amber-300/70 uppercase">Arena PTS</span>
                          <span className="text-xs font-black text-amber-400 whitespace-nowrap">
                            {(currentQuizUser?.points ?? currentPoints).toLocaleString()} PTS
                          </span>
                        </div>
                      </div>
                    </div> */}

                    {/* FlipARENA Banner with Refresh */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#161a29] to-yellow-500/10 border border-amber-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                          <Crown size={20} />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-white">FlipARENA Masters Ranking</h4>
                          <p className="text-[10px] text-white/50">Combined stats from Watchalong rooms & Flip Arena</p>
                        </div>
                      </div>
                      <button
                        onClick={fetchQuizLeaderboard}
                        disabled={quizLoading}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-amber-400 border border-white/10 transition-colors cursor-pointer"
                        title="Refresh FlipARENA Rankings"
                      >
                        <RotateCw size={14} className={quizLoading ? "animate-spin" : ""} />
                      </button>
                    </div>

                    {/* Top 3 Podium (Quiz / FlipArena) */}
                    {!searchQuery && filteredQuiz.length >= 3 && (
                      <div className="grid grid-cols-3 gap-2 pt-1">
                        <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-b from-slate-400/10 via-slate-500/5 to-transparent border border-slate-300/20 text-center relative min-w-0">
                          <span className="text-lg mb-1">🥈</span>
                          <span className="text-[11px] font-black text-white break-words text-center w-full leading-tight">
                            {filteredQuiz[1]?.username}
                          </span>
                          <span className="text-[10px] font-bold text-amber-400/90 mt-1 shrink-0">
                            {formatAccuracy(filteredQuiz[1]?.accuracy)} acc
                          </span>
                          <span className="text-xs font-black text-slate-200 mt-0.5 shrink-0">
                            {filteredQuiz[1]?.points?.toLocaleString()} <span className="text-[9px] text-white/40">PTS</span>
                          </span>
                        </div>

                        <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-b from-amber-500/20 via-yellow-500/10 to-transparent border border-amber-500/40 text-center relative -mt-2 shadow-[0_0_20px_rgba(245,158,11,0.15)] min-w-0">
                          <div className="flex items-center gap-1 text-xl mb-1">
                            <Crown size={16} className="text-amber-400" />
                            <span>🥇</span>
                          </div>
                          <span className="text-xs font-black text-amber-300 break-words text-center w-full leading-tight">
                            {filteredQuiz[0]?.username}
                          </span>
                          <span className="text-[10px] font-black text-emerald-400 mt-1 shrink-0">
                            {formatAccuracy(filteredQuiz[0]?.accuracy)} acc
                          </span>
                          <span className="text-xs font-black text-amber-400 mt-0.5 shrink-0">
                            {filteredQuiz[0]?.points?.toLocaleString()} <span className="text-[9px] text-amber-500">PTS</span>
                          </span>
                        </div>

                        <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-b from-amber-700/10 via-amber-800/5 to-transparent border border-amber-700/30 text-center relative min-w-0">
                          <span className="text-lg mb-1">🥉</span>
                          <span className="text-[11px] font-black text-white break-words text-center w-full leading-tight">
                            {filteredQuiz[2]?.username}
                          </span>
                          <span className="text-[10px] font-bold text-amber-400/90 mt-1 shrink-0">
                            {formatAccuracy(filteredQuiz[2]?.accuracy)} acc
                          </span>
                          <span className="text-xs font-black text-amber-300/80 mt-0.5 shrink-0">
                            {filteredQuiz[2]?.points?.toLocaleString()} <span className="text-[9px] text-white/40">PTS</span>
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Quiz / FlipArena Ranked List */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase text-white/40 px-2">
                        <span>Rank & Player</span>
                        <span>Accuracy & Score</span>
                      </div>

                      {quizLoading && filteredQuiz.length === 0 ? (
                        <div className="py-8 flex flex-col items-center justify-center gap-2 text-white/40 text-xs">
                          <RotateCw size={18} className="animate-spin text-amber-500" />
                          <span>Loading FlipARENA Rankings...</span>
                        </div>
                      ) : filteredQuiz.length === 0 ? (
                        <div className="py-8 text-center text-xs text-white/40 border border-white/5 rounded-2xl p-4">
                          {searchQuery
                            ? `No players matched "${searchQuery}".`
                            : "No FlipARENA participants recorded yet. Play Watchalong or FlipArena to rank up!"}
                        </div>
                      ) : (
                        filteredQuiz.map((quizzer, idx) => {
                          const isMe =
                            (activeUserId && quizzer.userId === activeUserId) ||
                            (quizzer.username && currentUserName && quizzer.username.toLowerCase() === currentUserName.toLowerCase());

                          return (
                            <div
                              key={quizzer.userId || idx}
                              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border transition-all ${isMe
                                ? "bg-amber-500/10 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                                : "bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]"
                                }`}
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <span
                                  className={`text-xs font-black w-6 text-center shrink-0 ${quizzer.rank === 1
                                    ? "text-amber-400"
                                    : quizzer.rank === 2
                                      ? "text-slate-300"
                                      : quizzer.rank === 3
                                        ? "text-amber-600"
                                        : "text-white/40"
                                    }`}
                                >
                                  #{quizzer.rank}
                                </span>
                                <div className="min-w-0 flex-1 pr-2">
                                  {/* <p className="text-xs font-black text-white flex items-center gap-1.5 flex-wrap leading-tight">
                                    <span className="break-words">{quizzer.username}</span> */}
                                  <p className="text-xs font-black text-white flex items-center gap-1.5 flex-wrap leading-tight">
                                    <span
                                      onClick={() => handleOpenUserProfile(quizzer.userId, undefined, quizzer.username)}
                                      className="break-words cursor-pointer hover:text-amber-300 hover:underline transition-colors"
                                    >
                                      {quizzer.username}
                                    </span>
                                    {isMe && (
                                      <span className="text-[8px] font-black bg-amber-500 text-black px-1.5 py-0.5 rounded uppercase shrink-0">
                                        YOU
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-[10px] text-white/40 mt-0.5">
                                    {quizzer.correctCount}/{quizzer.totalCount} correct
                                  </p>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="text-xs font-black text-amber-400">
                                  {quizzer.points?.toLocaleString()} PTS
                                </span>
                                <div className="text-[10px] font-bold text-emerald-400">
                                  {formatAccuracy(quizzer.accuracy)} acc
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* ══════════════════ TAB 3: ROAR LEADERBOARD ══════════════════ */}
                {activeTab === "roar" && (
                  <div className="space-y-4">
                    {/* ROAR Prediction Banner */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-500/10 via-[#161a29] to-red-500/10 border border-orange-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
                          <Flame size={20} />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-white">RoAR Prediction Ranks</h4>
                          <p className="text-[10px] text-white/50">Top call accuracy & community reputation</p>
                        </div>
                      </div>
                      <button
                        onClick={fetchRoarLeaderboard}
                        disabled={roarLoading}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-orange-400 border border-white/10 transition-colors cursor-pointer"
                        title="Refresh RoAR Rankings"
                      >
                        <RotateCw size={14} className={roarLoading ? "animate-spin" : ""} />
                      </button>
                    </div>

                    {/* ROAR Ranked List */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase text-white/40 px-2">
                        <span>Rank & Predictor</span>
                        <span>Accuracy & Rep</span>
                      </div>

                      {roarLoading && filteredRoar.length === 0 ? (
                        <div className="py-8 flex flex-col items-center justify-center gap-2 text-white/40 text-xs">
                          <RotateCw size={18} className="animate-spin text-orange-500" />
                          <span>Loading RoAR Rankings...</span>
                        </div>
                      ) : filteredRoar.length === 0 ? (
                        <div className="py-8 text-center text-xs text-white/40 border border-white/5 rounded-2xl p-4">
                          {searchQuery
                            ? `No fans matched "${searchQuery}".`
                            : "No RoAR rankings found for this timeframe. Create posts & earn upvotes to appear here!"}
                        </div>
                      ) : (
                        filteredRoar.map((fan, idx) => {
                          const isYou =
                            (activeUserId && (fan.userId === activeUserId || fan.userEmail === activeUserId)) ||
                            (fan.username && currentUserName && fan.username.toLowerCase() === currentUserName.toLowerCase()) ||
                            (fan.username === ROAR_CURRENT_USER.username);
                          const badgeLabel = BADGE_LABELS[fan.badge] || fan.badge || "Fan";
                          const accColor =
                            fan.accuracy >= 75
                              ? "text-emerald-400"
                              : fan.accuracy >= 65
                                ? "text-amber-400"
                                : "text-white/60";

                          return (
                            <div
                              key={fan.userId || fan.username || idx}
                              className={`flex items-center justify-between px-3.5 py-3 rounded-2xl border transition-all ${isYou
                                ? "bg-gradient-to-r from-orange-500/15 to-pink-500/15 border-orange-500/60 shadow-[0_0_15px_rgba(249,115,22,0.2)]"
                                : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]"
                                }`}
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <span
                                  className={`text-sm font-black w-6 text-center shrink-0 ${fan.rank === 1
                                    ? "text-amber-400"
                                    : fan.rank === 2
                                      ? "text-slate-300"
                                      : fan.rank === 3
                                        ? "text-amber-600"
                                        : "text-white/40"
                                    }`}
                                >
                                  #{fan.rank}
                                </span>
                                <div className="min-w-0 flex-1 pr-2">
                                  {/* <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-xs font-black text-white break-words">{fan.username}</span> */}
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span
                                      onClick={() => handleOpenUserProfile(fan.userId, undefined, fan.username)}
                                      className="text-xs font-black text-white break-words cursor-pointer hover:text-orange-300 hover:underline transition-colors"
                                    >
                                      {fan.username}
                                    </span>
                                    {isYou && (
                                      <span className="text-[8px] font-black bg-orange-500 text-white px-1.5 py-0.5 rounded uppercase shrink-0">
                                        YOU
                                      </span>
                                    )}
                                    <span className="text-[9px] font-black text-orange-400/90 bg-orange-400/10 px-1.5 py-0.5 rounded-full border border-orange-400/20 shrink-0">
                                      {badgeLabel}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-white/40 mt-0.5">
                                    {fan.team} • {fan.predictions} calls
                                  </p>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span className={`text-sm font-black ${accColor}`}>{fan.accuracy}%</span>
                                <p className="text-[10px] font-bold text-white/40 mt-0.5">
                                  {fan.reputationScore?.toLocaleString()} Rep
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* ══════════════════ TAB 4: CAMPUS CLASH ══════════════════ */}
                {activeTab === "campus" && (
                  <div className="space-y-4">
                    {/* <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-[#111624] to-blue-950/30 border border-emerald-500/30 relative overflow-hidden">
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[9px] font-black bg-emerald-500 text-black px-2 py-0.5 rounded-full tracking-wider uppercase">
                            SEASON 1 BETA
                          </span>
                          <span className="text-xs font-bold text-white/60">Inter-College Fandom League</span>
                        </div>
                        <h3 className="text-base font-black text-white">Campus Clash 🎓</h3>
                        <p className="text-xs text-white/60 mt-1 leading-relaxed">
                          Represent your university, score points for your campus in Arena & Watchalong, and claim the #1 collegiate trophy!
                        </p>
                      </div>
                    </div> */}

                    <div className="space-y-2">
                      {/* <div className="flex items-center justify-between text-[10px] font-black uppercase text-white/40 px-2">
                        <span>Rank & University</span>
                        <span>Fans & Score</span>
                      </div> */}

                      {filteredCampus.length === 0 ? (
                        <div className="py-8 text-center text-xs text-white/40 border border-white/5 rounded-2xl p-4">
                          {searchQuery
                            ? `No campuses or participants matched "${searchQuery}".`
                            : "No campus entries found."}
                        </div>
                      ) : (
                        filteredCampus.map((campus) => {
                          const isRepresented = representedCampus === campus.campusName;
                          const isSymbiosis = !!campus.isSymbiosis;
                          const isExpanded = expandedCampus === campus.campusName;

                          return (
                            <div
                              key={campus.campusName}
                              onClick={() => {
                                if (isSymbiosis) {
                                  setExpandedCampus(isExpanded ? null : campus.campusName);
                                }
                              }}
                              className={`p-3 sm:p-3.5 rounded-2xl border transition-all flex flex-col gap-2 group ${isSymbiosis
                                ? isExpanded
                                  ? "bg-gradient-to-br from-amber-950/20 via-[#0e1322] to-emerald-950/20 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.12)] cursor-pointer"
                                  : "bg-gradient-to-br from-amber-950/10 via-[#0b0f1a] to-emerald-950/10 border-amber-500/25 hover:border-amber-500/40 cursor-pointer"
                                : isRepresented
                                  ? "bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                                  : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]"
                                }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                  <span
                                    className={`text-xs sm:text-sm font-black w-6 text-center shrink-0 ${campus.rank === 1
                                      ? "text-amber-400"
                                      : campus.rank === 2
                                        ? "text-slate-300"
                                        : campus.rank === 3
                                          ? "text-amber-600"
                                          : "text-white/40"
                                      }`}
                                  >
                                    #{campus.rank}
                                  </span>

                                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-base shrink-0 group-hover:scale-105 transition-transform ${isSymbiosis
                                    ? "bg-amber-500/15 border border-amber-500/30 text-amber-300"
                                    : "bg-white/[0.04] border border-white/10"
                                    }`}>
                                    {campus.logoIcon}
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <h4 className="text-xs sm:text-sm font-black text-white break-words">
                                        {campus.campusName}
                                      </h4>
                                      {/* <span className="text-[9px] font-extrabold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 shrink-0">
                                        {campus.shortName}
                                      </span> */}
                                      {isSymbiosis && (
                                        <span className="text-[8px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono shrink-0">
                                          @ssss.edu.in
                                        </span>
                                      )}

                                    </div>
                                  </div>
                                </div>

                                <div className="text-right shrink-0 pl-2">
                                  <span className="text-xs sm:text-sm font-black text-emerald-400">
                                    {campus.points.toLocaleString()}
                                  </span>
                                  <span className="text-[9px] font-bold text-white/40 ml-1">PTS</span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/[0.04] text-[10px] text-white/50">
                                <div className="flex items-center gap-2 flex-wrap min-w-0 flex-1">
                                  <span className="text-white/20">•</span>
                                  <span className="text-emerald-400 font-bold">{campus.fansCount} Participants</span>
                                  <span className="text-white/20 hidden xs:inline">•</span>
                                  <span className="whitespace-nowrap text-white/40">
                                    Top: <strong className="text-white/70">@{campus.topFan}</strong>
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  {isSymbiosis && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setExpandedCampus(isExpanded ? null : campus.campusName);
                                      }}
                                      className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95"
                                      title={isExpanded ? "Hide Symbiosis participants" : "View Symbiosis participants"}
                                    >
                                      <Users size={11} className="text-amber-400" />
                                      <span className="hidden xs:inline">{isExpanded ? "Hide Roster" : `Roster (${symbiosisTotalParticipants})`}</span>
                                      {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                    </button>
                                  )}

                                  {/* <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleJoinCampus(campus.campusName);
                                    }}
                                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95 shrink-0 ${isRepresented
                                      ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                                      : "bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400"
                                      }`}
                                    title="Represent this campus"
                                  >
                                    {isRepresented ? "✓ Representing" : "Represent"}
                                  </button> */}
                                </div>
                              </div>

                              {/* Accordion Content */}
                              <AnimatePresence>
                                {isSymbiosis && isExpanded && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.22, ease: "easeOut" }}
                                    className="overflow-hidden pt-2.5 mt-1 border-t border-white/[0.08]"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="bg-[#080d1a] p-3 rounded-xl border border-amber-500/25 space-y-2.5 shadow-inner">
                                      <div className="flex items-center justify-between text-[11px] pb-2 border-b border-white/[0.06]">
                                        <div className="flex items-center gap-1.5">
                                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                          <span className="font-black text-amber-300">@ssss.edu.in</span>
                                          <span className="text-white/40">Verified Participants ({symbiosisTotalParticipants})</span>
                                        </div>
                                        <div className="text-[10px] font-bold text-emerald-400">
                                          {symbiosisTotalPoints.toLocaleString()} Total Symbiosis PTS
                                        </div>
                                      </div>

                                      <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                                        {usersLoading && symbiosisParticipants.length === 0 ? (
                                          <div className="py-6 text-center text-xs text-white/40 flex items-center justify-center gap-2">
                                            <RotateCw size={14} className="animate-spin text-amber-400" />
                                            <span>Loading @ssss.edu.in participants...</span>
                                          </div>
                                        ) : symbiosisParticipants.length === 0 ? (
                                          <div className="py-5 text-center text-xs text-white/40">
                                            No registered participants with @ssss.edu.in found in system yet.
                                          </div>
                                        ) : (
                                          symbiosisParticipants.map((p) => {
                                            const isCurrentUser =
                                              (activeUserId && p.userId === activeUserId) ||
                                              (user?.email && p.userEmail.toLowerCase() === user.email.toLowerCase());

                                            return (
                                              <div
                                                key={p.userId}
                                                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border transition-all ${isCurrentUser
                                                  ? "bg-amber-500/15 border-amber-500/50 shadow-sm"
                                                  : "bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]"
                                                  }`}
                                              >
                                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                                  <span
                                                    className={`text-[11px] font-black w-5 text-center shrink-0 ${p.rank === 1
                                                      ? "text-amber-400"
                                                      : p.rank === 2
                                                        ? "text-slate-300"
                                                        : p.rank === 3
                                                          ? "text-amber-600"
                                                          : "text-white/40"
                                                      }`}
                                                  >
                                                    #{p.rank}
                                                  </span>

                                                  <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                      {/* <span className="text-xs font-black text-white break-words">{p.userName}</span> */}
                                                      <span
                                                        onClick={() => handleOpenUserProfile(p.userId, undefined, p.userName)}
                                                        className="text-xs font-black text-white break-words cursor-pointer hover:text-amber-300 hover:underline transition-colors"
                                                      >
                                                        {p.userName}
                                                      </span>
                                                      {isCurrentUser && (
                                                        <span className="text-[8px] font-black bg-amber-500 text-black px-1.5 py-0.5 rounded uppercase font-mono">
                                                          YOU
                                                        </span>
                                                      )}
                                                    </div>
                                                    <p className="text-[9px] text-white/40 font-mono break-all">{p.userEmail}</p>
                                                  </div>
                                                </div>

                                                <div className="text-right shrink-0 pl-2">
                                                  <span className="text-xs font-black text-emerald-400 whitespace-nowrap">
                                                    {p.points.toLocaleString()}
                                                  </span>
                                                  <span className="text-[9px] font-bold text-white/40 ml-1">PTS</span>
                                                </div>
                                              </div>
                                            );
                                          })
                                        )}
                                      </div>

                                      <div className="flex items-center justify-between pt-1 text-[9px] text-white/40">
                                        <span>Domain filter: Verified students with email ending in @ssss.edu.in</span>
                                        <span className="text-amber-400/80 font-bold">Symbiosis SSSS</span>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* Bottom spacer to prevent last user row and points from being cut off */}
                <div className="h-8 sm:h-12 shrink-0" aria-hidden="true" />
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
