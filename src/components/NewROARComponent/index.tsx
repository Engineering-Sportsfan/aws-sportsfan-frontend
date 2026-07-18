


// // Home tab now shows RoomsHome (rooms list).
// // Entering a room shows DiscussionRoom with icon-pill composer.

// import { useState, useEffect, useRef, useCallback } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useSearchParams } from "next/navigation";
// import axios from "axios";
// import { emitSxpActivityRefresh } from "@/lib/sxpEvents";

// import { GLOBAL_CSS } from "./constants/styles";
// import { NOTIFICATIONS_DATA } from "./constants";
// import { Toast } from "./components/shared";
// import ComposeModal from "./components/ComposeModal";
// import CreateFlashQuizModal from "./components/CreateFlashQuizModal";
// import PostDetailsOverlay from "./components/PostDetailsOverlay";
// import Onboarding from "./screens/Onboarding";
// import RoomsHome from "./screens/RoomsHome";
// import HomeFeed from "./screens/HomeFeed";             // SF360 Infinity Room = posts feed
// import DiscussionRoom from "./screens/DiscussionRoom";
// import Notifications from "./screens/Notifications";
// import Leaderboard from "./screens/Leaderboard";
// import Profile from "./screens/Profile";
// import type { Notification, Room } from "./types";
// import { useRoarNotifications } from "@/context/RoarNotificationsContext";
// import { RoarProfileProvider, useRoarProfileContext } from "@/context/RoarProfileContext";
// import RoomPostDetailsOverlay from "./components/RoomPostDetailsOverlay";
// import { useRouter } from "next/navigation";


// const useVisibilityInterval = (callback: () => void, delay: number) => {
//   const savedCallback = useRef(callback);
//   useEffect(() => { savedCallback.current = callback; }, [callback]);

//   useEffect(() => {
//     if (delay === null) return;
//     let id: NodeJS.Timeout;

//     const start = () => { id = setInterval(() => {
//       if (!document.hidden) savedCallback.current();
//     }, delay); };

//     const handleVisibility = () => {
//       clearInterval(id);
//       if (!document.hidden) { savedCallback.current(); start(); }
//     };

//     start();
//     document.addEventListener("visibilitychange", handleVisibility);
//     return () => { clearInterval(id); document.removeEventListener("visibilitychange", handleVisibility); };
//   }, [delay]);
// };


// export default function ROARApp() {
//   const containerRef = useRef<HTMLDivElement>(null);
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const [likingPosts, setLikingPosts] = useState<Set<string>>(new Set());
//   const roomRefreshRef = useRef<(() => void) | null>(null);
//   const roomReplyUpdateRef = useRef<((postId: string, count: number) => void) | null>(null);

//   // ── Bootstrap ──────────────────────────────────────────────────────────────
//   const [mounted, setMounted]             = useState(false);
//   const [checkingProfile, setChecking]    = useState(true);
//   const [onboarded, setOnboarded]         = useState(false);
//   const [userBadge, setUserBadge]         = useState("RISING_FAN");
//   const [userSports, setUserSports]       = useState<string[]>([]);
//   const [currentUsername, setCurrentUsername] = useState("RoarUser");
//   const [currentUserId, setCurrentUserId] = useState<string | undefined>();
//   const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | undefined>();



//   useEffect(() => {
//     setMounted(true);
//     const checkProfile = async () => {
//       try {
//         const res = await axios.get("/api/roar/profile");
//         if (res.data?.success) {
//           setOnboarded(true);
//           setUserBadge(res.data.user.badge || "RISING_FAN");
//           setUserSports(res.data.user.sports ?? []);
//           setCurrentUsername(res.data.user.username || "RoarUser");
//            setCurrentUserId(res.data.user.actualUserId);
//           setCurrentAvatarUrl(res.data.user.avatarUrl || undefined);
//           try {
//             localStorage.setItem("roar_v2_complete", "1");
//             localStorage.setItem("roar_badge",    res.data.user.badge    || "RISING_FAN");
//             localStorage.setItem("roar_username", res.data.user.username || "RoarUser");
//             if (res.data.user.avatarUrl) localStorage.setItem("roar_avatar_url", res.data.user.avatarUrl);
//           } catch {}
//         } else { setOnboarded(false); }
//       } catch (err: any) {
//         const status = err.response?.status;
//         if (status === 404 || status === 401) { setOnboarded(false); }
//         else {
//           let hasLocal = false; let badge = "RISING_FAN";
//           try { hasLocal = !!localStorage.getItem("roar_v2_complete"); badge = localStorage.getItem("roar_badge") || "RISING_FAN"; } catch {}
//           setOnboarded(hasLocal); setUserBadge(badge);
//         }
//       } finally { setChecking(false); }
//     };
//     checkProfile();
//   }, []);

//   // ── Navigation ─────────────────────────────────────────────────────────────
//   const [activeTab, setActiveTab]       = useState("home");
//   const [overlay, setOverlay]           = useState<string | null>(null);
//   const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
//   const [selectedPost, setSelectedPost] = useState<any | null>(null);

//   const { viewingUserId, profileData, openProfile, closeProfile } = useRoarProfileContext();



// //  const handleFanProfileClick = useCallback((fan: any) => {
// //   if (fan.authorUid && fan.authorUid === currentUserId) {
// //     setActiveTab("profile"); setOverlay(null); setSelectedPost(null);
// //   } else {
// //     openProfile(fan.authorUid);
// //   }
// // }, [currentUserId, openProfile]);

// // const handleFanProfileClick = useCallback((fan: any) => {
// //   if (fan.authorUid && fan.authorUid === currentUserId) {
// //     router.push("/MainModules/Profile");
// //   } else {
// //     setOverlay(null); setSelectedPost(null);
// //     openProfile(fan.authorUid);
// //   }
// // }, [currentUserId, openProfile, router]);

// const handleFanProfileClick = useCallback((fan: any) => {
//   if (fan.authorUid && fan.authorUid === currentUserId) {
//     router.push("/MainModules/Profile");
//   } else {
//     openProfile(fan.authorUid);
//   }
// }, [currentUserId, openProfile, router]);

//   // ── Compose ────────────────────────────────────────────────────────────────
//   const [composeOpen, setComposeOpen]   = useState(false);
//   const [composeType, setComposeType]   = useState<string | null>(null);
//   const [quizOpen, setQuizOpen]         = useState(false);

//   const openCompose = (type: string | null = null) => {
//     if (type === "quiz") { setQuizOpen(true); return; }
//     setComposeType(type); setComposeOpen(true);
//   };

//   // ── Toast ──────────────────────────────────────────────────────────────────
//   const [toast, setToast] = useState({ visible: false, message: "" });
//   const showToast = useCallback((msg: string) => {
//     setToast({ visible: true, message: msg });
//     setTimeout(() => setToast(t => ({ ...t, visible: false })), 3200);
//     setTimeout(() => setToast({ visible: false, message: "" }), 3700);
//   }, []);

//   // ── Notifications ──────────────────────────────────────────────────────────
//   const { roarNotifications: notifications, setRoarNotifications: setNotifications, markRoarRead, markAllRoarRead } = useRoarNotifications();
//   const [notifSeeded, setNotifSeeded] = useState(false);
//   useEffect(() => {
//     if (!notifSeeded) { setNotifications(NOTIFICATIONS_DATA.map(n => ({ ...n }))); setNotifSeeded(true); }
//   }, [notifSeeded, setNotifications]);

//   // ── Remote data ────────────────────────────────────────────────────────────
//   const [rooms, setRooms]     = useState<Room[]>([]);
//   const [dbPosts, setDbPosts] = useState<any[]>([]);

//   // const fetchPosts = useCallback(async () => {
//   //   try {
//   //     // const res = await axios.get(`/api/roar/posts?t=${Date.now()}`);
//   //      const res = await axios.get(`/api/roar/posts?t=${Date.now()}&limit=15`);
//   //     if (res.data?.success) setDbPosts(res.data.posts);
//   //   } catch (err) { console.error("Failed to fetch posts:", err); }
//   // }, []);

//   const fetchPosts = useCallback(async () => {
//     try {
//       const res = await axios.get(`/api/roar/posts?t=${Date.now()}&limit=15`);
//       if (res.data?.success) setDbPosts(res.data.posts);
//     } catch (err) { console.error("Failed to fetch posts:", err); }
//   }, []);

//   const fetchRooms = useCallback(async () => {
//     try {
//       const res = await axios.get(`/api/roar/rooms?t=${Date.now()}`);
//       if (res.data?.success) {
//         setRooms(res.data.rooms);
//         setSelectedRoom(prev => {
//           if (prev) return prev;
//           return res.data.rooms.length > 0 ? res.data.rooms[0] : null;
//         });
//       }
//     } catch (err) { console.error("Failed to fetch rooms:", err); }
//   }, []);

//   const combinedFetch = useCallback(() => {
//     fetchRooms(); fetchPosts();
//   }, [fetchRooms, fetchPosts]);

//    useVisibilityInterval(combinedFetch, 30000);


//   useEffect(() => {
//     const postId = searchParams.get("postId");
//     if (!postId || !onboarded || dbPosts.length === 0) return;
//     const target = dbPosts.find(p => p.postId === postId || p.id === postId);
//     if (target) { setSelectedPost(target); window.history.replaceState(null, "", window.location.pathname); }
//   }, [searchParams, onboarded, dbPosts]);

//   useEffect(() => {
//     if (!onboarded) return;

//     // const fetchRooms = async () => {
//     //   try {
//     //     const res = await axios.get(`/api/roar/rooms?t=${Date.now()}`);
//     //     if (res.data?.success) {
//     //       setRooms(res.data.rooms);
//     //       setSelectedRoom(prev => {
//     //         if (prev) return prev;
//     //         return res.data.rooms.length > 0 ? res.data.rooms[0] : null;
//     //       });
//     //     }
//     //   } catch (err) { console.error("Failed to fetch rooms:", err); }
//     // };

//     const fetchUserSports = async () => {
//       try {
//         const res = await axios.get("/api/roar/profile");
//         if (res.data?.success) {
//           setUserSports(res.data.user.sports ?? []);
//           setUserBadge(res.data.user.badge || "RISING_FAN");
//           setCurrentAvatarUrl(res.data.user.avatarUrl || undefined);
//           try { if (res.data.user.avatarUrl) localStorage.setItem("roar_avatar_url", res.data.user.avatarUrl); } catch {}
//         }
//       } catch (err: any) {
//         if (err.response?.status === 404) { setOnboarded(false); try { localStorage.removeItem("roar_v2_complete"); } catch {} }
//       }
//     };

//     fetchRooms(); fetchPosts(); fetchUserSports();
//     // const interval = setInterval(() => { fetchRooms(); fetchPosts(); }, 5000);
//     // const interval = setInterval(() => { fetchRooms(); fetchPosts(); }, 30000);
//     // return () => clearInterval(interval);
// //     const combinedFetch = useCallback(() => { fetchRooms(); fetchPosts(); }, [fetchRooms, fetchPosts]);
// // useVisibilityInterval(combinedFetch, 30000);

//   }, [onboarded, fetchPosts]); // eslint-disable-line react-hooks/exhaustive-deps

//   useEffect(() => {
//     const syncAvatar = (event?: Event) => {
//       const custom = event as CustomEvent<{ avatarUrl?: string }> | undefined;
//       try { setCurrentAvatarUrl(custom?.detail?.avatarUrl || localStorage.getItem("roar_avatar_url") || undefined); }
//       catch { setCurrentAvatarUrl(custom?.detail?.avatarUrl || undefined); }
//     };
//     syncAvatar();
//     window.addEventListener("roar-profile-updated", syncAvatar);
//     return () => window.removeEventListener("roar-profile-updated", syncAvatar);
//   }, []);

//   // Sync live-room notifications
//   useEffect(() => {
//     if (!rooms.length) return;
//     setNotifications(prev => {
//       const nonMatch = prev.filter(n => n.type !== "MATCH_LIVE" && n.type !== "HEATING_UP");
//       const matchNotifs: Notification[] = [];
//       rooms.forEach(room => {
//         if (!room.isActive) return;
//         const prevLive = prev.find(n => n.id === `live-${room.roomId}`);
//         const prevHeat = prev.find(n => n.id === `heat-${room.roomId}`);
//         matchNotifs.push({ id: `live-${room.roomId}`, type: "MATCH_LIVE", title: `MATCH LIVE: ${room.name}`, subtitle: `${room.fanCount || 0} fans already debating.`, time: "Just now", read: prevLive ? prevLive.read : false, fan: null, cta: null });
//         matchNotifs.push({ id: `heat-${room.roomId}`, type: "HEATING_UP", title: "This room is heating up 🔥", subtitle: `${room.name}: ${room.fanCount || 0} fans live.`, time: "15m", read: prevHeat ? prevHeat.read : false, fan: null, cta: null });
//       });
//       return [...matchNotifs, ...nonMatch];
//     });
//   }, [rooms]); // eslint-disable-line react-hooks/exhaustive-deps


//   // ── Actions ────────────────────────────────────────────────────────────────
//   const handleVote = useCallback(async (postId: string, voteType: "agree" | "disagree" | null) => {
//     setDbPosts(prev => prev.map(post => {
//       if (post.id === postId || post._id === postId || post.postId === postId) {
//         let ag = post.agreeCount ?? 0; let di = post.disagreeCount ?? 0;
//         if (post.userVote === "agree")    ag = Math.max(0, ag - 1);
//         if (post.userVote === "disagree") di = Math.max(0, di - 1);
//         if (voteType === "agree")    ag += 1;
//         if (voteType === "disagree") di += 1;
//         return { ...post, userVote: voteType, agreeCount: ag, disagreeCount: di };
//       }
//       return post;
//     }));
//     try {
//       await axios.post(`/api/roar/posts/${postId}/vote`, { vote: voteType });
//     } catch (err: any) {
//       if (err.response?.status === 409) { await fetchPosts(); return; }
//       console.error("Failed to submit vote:", err); await fetchPosts();
//     }
//   }, [fetchPosts]);

//   const handleLike = useCallback(async (postId: string) => {
//     if (likingPosts.has(postId)) return;
//     setLikingPosts(prev => new Set(prev).add(postId));
//     setDbPosts(prev => prev.map(post => {
//       if (post.postId === postId || post._id === postId) {
//         const ul = post.userLiked ?? false;
//         return { ...post, userLiked: !ul, likeCount: Math.max(0, (post.likeCount ?? 0) + (ul ? -1 : 1)) };
//       }
//       return post;
//     }));
//     // try { await axios.post(`/api/roar/posts/${postId}/like`); fetchPosts(); }
//     try { await axios.post(`/api/roar/posts/${postId}/like`); }
//     catch {
//       setDbPosts(prev => prev.map(post => {
//         if (post.postId === postId || post._id === postId) {
//           const ul = post.userLiked ?? false;
//           return { ...post, userLiked: !ul, likeCount: Math.max(0, (post.likeCount ?? 0) + (ul ? 1 : -1)) };
//         }
//         return post;
//       }));
//       showToast("Failed to like post");
//     }
//     finally { setLikingPosts(prev => { const s = new Set(prev); s.delete(postId); return s; }); }
//   }, [showToast, likingPosts, fetchPosts]);

//   const handleDeletePost = useCallback(async (postId: string, roomId?: string) => {
//     try {
//       const url = roomId ? `/api/roar/rooms/${roomId}/messages/${postId}` : `/api/roar/posts/${postId}`;
//       const res = await axios.delete(url);
//       if (res.data?.success) { showToast(roomId ? "Message deleted" : "Post deleted"); await fetchPosts(); }
//       else showToast(roomId ? "Failed to delete message" : "Failed to delete post");
//     } catch { showToast(roomId ? "Error deleting message" : "Error deleting post"); }
//   }, [fetchPosts, showToast]);

//   const handlePost = useCallback(async (payload: any) => {
//     try {
//       const postType = ["hot_take", "prediction", "debate", "raw_reactions", "post", "quiz"].includes(payload.type) ? payload.type : "hot_take";
//       let mediaUrls: string[] = [];
//       if (payload.mediaFiles?.length > 0) {
//         showToast("Uploading media...");
//         mediaUrls = await Promise.all(payload.mediaFiles.map(async (file: File) => {
//           const fd = new FormData(); fd.append("file", file);
//           const r = await axios.post("/api/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
//           return r.data.url;
//         }));
//       }
//       const ROOM_NATIVE = ["post", "chat", "hot_take", "hottake", "prediction", "debate", "raw_reactions"];
//       const isRoomNative = overlay === "room" && selectedRoom?.roomId && ROOM_NATIVE.includes(postType) && !payload.quizQuestion;

//       if (isRoomNative) {
//         const msgTypeMap: Record<string, string> = { prediction: "prediction", hot_take: "hottake", hottake: "hottake", debate: "debate", raw_reactions: "raw_reactions", post: "post", chat: "chat" };
//         const res = await axios.post(`/api/roar/rooms/${selectedRoom!.roomId}/messages`, {
//           text: payload.text, type: msgTypeMap[postType] || "post",
//           mediaUrls: payload.mediaUrls, sideA: payload.sideA, sideB: payload.sideB,
//           memGifUrl: payload.gifUrl ?? undefined, memTag: payload.sf360Tag ?? undefined,
//         });
//         if (res.data?.success) { showToast("Post is live in room!"); roomRefreshRef.current?.(); }
//       } else {
//         const res = await axios.post("/api/roar/posts", {
//           type: postType,
//           text: postType === "quiz" ? payload.quizQuestion : payload.text,
//           sport: payload.sport || "cricket", audience: payload.audience, mediaUrls,
//           ...(postType !== "quiz" && { sideA: payload.sideA, sideB: payload.sideB, memCtx: payload.memCtx, matchId: payload.match, confidence: payload.confidence }),
//           ...(postType === "quiz" && { quizQuestion: payload.quizQuestion, quizOptions: payload.quizOptions, quizCorrectOption: payload.quizCorrectOption, quizTimer: payload.quizTimer, quizPoints: payload.quizPoints }),
//           ...(postType === "raw_reactions" && { memGifUrl: payload.gifUrl, memTag: payload.sf360Tag }),
//         });
//         if (res.data?.success) {
//           const toastMap: Record<string, string> = { hot_take: "🔥 Hot Take is live", prediction: "📊 Prediction posted", debate: "⚡ Debate started", raw_reactions: "🎭 Raw Reaction shared", post: "✏️ Post is live", quiz: "🧠 Flash Quiz launched!" };
//           showToast(toastMap[postType] || "🔥 Your take is live");
//           fetchPosts();
//         }
//       }
//     } catch { showToast("Failed to create post"); }
//   }, [showToast, fetchPosts, overlay, selectedRoom]);

//   const handleTab = (tab: string) => {
//     setOverlay(null);
//     if (tab === "discuss") { setOverlay("room"); return; }
//     setActiveTab(tab);
//   };

//   const completeOnboarding = useCallback(async (prefs: any) => {
//     const username = prefs.username || "RoarUser";
//     const badge    = prefs.badge    || "RISING_FAN";
//     setUserSports(prefs.sports ?? []); setUserBadge(badge); setCurrentUsername(username); setOnboarded(true);
//     try { localStorage.setItem("roar_v2_complete", "1"); localStorage.setItem("roar_badge", badge); localStorage.setItem("roar_username", username); } catch {}
//   }, []);

//   // ── Derived ────────────────────────────────────────────────────────────────
//   const isRoom     = overlay === "room";
//   const isInfinity = overlay === "infinity";
//   const isLB       = overlay === "leaderboard";
//   const isFullScreenOverlay = isRoom || isInfinity;
//   // Onboarding should also hide the global header / bottom nav, same as room/infinity overlays.
//   // const hideChrome = isFullScreenOverlay || !onboarded;
//   const hideChrome = isFullScreenOverlay || !onboarded || !!viewingUserId;

//    useEffect(() => {
//   if (hideChrome) document.body.classList.add("roar-room-active");
//   else document.body.classList.remove("roar-room-active");
//   return () => document.body.classList.remove("roar-room-active");
// }, [hideChrome]);

//   // ── Loading spinner ────────────────────────────────────────────────────────
//   if (!mounted || checkingProfile) {
//     return (
//       <div className="roar-root" style={{ minHeight: "600px", height: "100%", background: "#050508", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", borderRadius: "24px", border: "1px solid #252538" }}>
//         <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
//         <div style={{ textAlign: "center", zIndex: 10 }}>
//           <div style={{ width: 40, height: 40, border: "3px solid rgba(255,255,255,0.1)", borderTop: "3px solid #E91E8C", borderRadius: "50%", animation: "roar-spin 1s linear infinite", margin: "0 auto 16px" }} />
//           <style dangerouslySetInnerHTML={{ __html: `@keyframes roar-spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}` }} />
//           <div style={{ color: "#9494AD", fontSize: 14, fontFamily: "sans-serif", fontWeight: 500 }}>Loading ROAR...</div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     // <div className={`roar-root${isRoom ? " roar-room-active" : ""}`}>
//     <div className={`roar-root${hideChrome ? " roar-room-active" : ""}`}>
//       <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />

//       <div className="roar-inner" ref={containerRef} style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
//         {/* Ambient background */}
//         <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, background: "radial-gradient(ellipse 90% 55% at 50% -15%,rgba(233,30,140,0.18),transparent 55%),radial-gradient(ellipse 70% 45% at 100% 80%,rgba(255,107,53,0.12),transparent 50%),radial-gradient(ellipse 50% 40% at 0% 60%,rgba(0,232,198,0.08),transparent 45%),var(--bg-primary)" }} />
//         {/* Floating sparks */}
//         <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
//           {[{ left: "12%", color: "var(--accent-magenta)", size: 3, duration: "14s", delay: "0s" }, { left: "28%", color: "var(--accent-orange)", size: 4, duration: "18s", delay: "2s" }, { left: "50%", color: "var(--teal)", size: 3, duration: "15s", delay: "5s" }, { left: "72%", color: "var(--accent-magenta)", size: 4, duration: "20s", delay: "1s" }, { left: "88%", color: "var(--accent-yellow)", size: 3, duration: "16s", delay: "7s" }].map(({ left, color, size, duration, delay }) => (
//             <div key={left} style={{ position: "absolute", bottom: -10, left, width: size, height: size, borderRadius: "50%", background: color, animation: `roar-driftUp ${duration} linear infinite ${delay}` }} />
//           ))}
//         </div>
//         {/* ROAR watermark */}
//         <div style={{ position: "absolute", bottom: 88, right: 0, left: 0, textAlign: "right", paddingRight: 12, fontFamily: "'Bebas Neue',sans-serif", fontSize: 72, color: "white", opacity: 0.04, pointerEvents: "none", zIndex: 0, letterSpacing: "0.1em" }}>ROAR</div>

//         <Toast message={toast.message} visible={toast.visible} />

//         {!onboarded && (
//           <>
//             {/* Hide global header (desktop/tablet/mobile) and its mobile spacer while onboarding runs */}
//             <style dangerouslySetInnerHTML={{ __html: `#global-header-desktop,#global-header-tablet,#global-header-mobile,.roar-header-spacer{display:none!important}` }} />
//             <Onboarding onComplete={completeOnboarding} />
//           </>
//         )}

//         {onboarded && (
//           <div style={{ position: "relative", zIndex: 1, flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
//             <AnimatePresence mode="wait">
//               {viewingUserId ? (
//                 // ── Viewing another user's profile ──
//                 <motion.div 
//                   key="viewing-profile" 
//                   initial={{ opacity: 0 }} 
//                   animate={{ opacity: 1 }} 
//                   exit={{ opacity: 0 }} 
//                   transition={{ duration: 0.18 }} 
//                   style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}
//                 >
//                   <Profile
//                     userBadge={userBadge}
//                     setUserBadge={setUserBadge}
//                     onCompose={() => openCompose("prediction")}
//                     onToast={showToast}
//                     setOnboarded={setOnboarded}
//                     onNavigateTab={handleTab}
//                     viewingProfile={viewingUserId}
//                     onClose={closeProfile}
//                   />
//                 </motion.div>
//               ) : isLB ? (
//                 <motion.div key="lb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
//                   <Leaderboard onBack={() => setOverlay(null)} onCompose={() => openCompose("prediction")} />
//                 </motion.div>
//               ) : isInfinity ? (
//                 // SF360 Infinity Room → original HomeFeed (all posts)
//                 <motion.div key="infinity" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
//                   <style dangerouslySetInnerHTML={{ __html: `#global-header-desktop,#global-header-tablet,#global-header-mobile{display:none!important}` }} />
//                   <HomeFeed
//                     onJoinRoom={room => { if (room) setSelectedRoom(room); else if (rooms.length) setSelectedRoom(rooms[0]); setOverlay("room"); }}
//                     onLeaderboard={() => setOverlay("leaderboard")}
//                     onFanProfile={handleFanProfileClick}
//                     onToast={showToast}
//                     extraItems={[]}
//                     showBanner={false}
//                     onDismissBanner={() => {}}
//                     userBadge={userBadge}
//                     rooms={rooms}
//                     dbPosts={dbPosts}
//                     onPostClick={post => setSelectedPost(post)}
//                     onVote={handleVote}
//                     // onLike={handleLike}
//                     onDeletePost={handleDeletePost}
//                     userSports={userSports}
//                     onQuickCompose={t => openCompose(t)}
//                     currentUsername={currentUsername}
//                     currentAvatarUrl={currentAvatarUrl}
//                     onBack={() => { setOverlay(null); setActiveTab("home"); }}
//                   />
//                 </motion.div>
//               ) : isRoom ? (
//                 <motion.div key="room" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
//                   <style dangerouslySetInnerHTML={{ __html: `#global-header-desktop,#global-header-tablet,#global-header-mobile{display:none!important}` }} />
//                   <DiscussionRoom
//                     roomId={selectedRoom?.roomId}
//                     roomName={selectedRoom?.name}
//                     fanCount={selectedRoom?.fanCount}
//                     score={selectedRoom?.score}
//                     scoreSubtitle={selectedRoom?.scoreSubtitle}
//                     onBack={() => { setOverlay(null); setActiveTab("home"); }}
//                     onToast={showToast}
//                     onPostClick={post => setSelectedPost(post)}
//                     onCompose={type => openCompose(type)}
//                     currentAvatarUrl={currentAvatarUrl}
//                     onRegisterRefresh={fn => { roomRefreshRef.current = fn; }}
//                     onRegisterReplyUpdate={fn => { roomReplyUpdateRef.current = fn; }}
//                     onFanProfile={handleFanProfileClick}
//                   />
//                 </motion.div>
//               ) : (
//                 <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
//                   {/* HOME TAB → RoomsHome */}
//                   {activeTab === "home" && (
//                     <RoomsHome
//                       rooms={rooms}
//                       onJoinRoom={room => {
//                         if (room?.roomId === "sf360-infinity") {
//                           // Infinity Room = the old HomeFeed (all posts)
//                           setOverlay("infinity");
//                         } else {
//                           if (room) setSelectedRoom(room);
//                           else if (rooms.length) setSelectedRoom(rooms[0]);
//                           setOverlay("room");
//                         }
//                       }}
//                       onToast={showToast}
//                     />
//                   )}
//                   {activeTab === "profile" && (
//                     <Profile userBadge={userBadge} setUserBadge={setUserBadge} onCompose={() => openCompose("prediction")} onToast={showToast} setOnboarded={setOnboarded} onNavigateTab={handleTab} />
//                   )}
//                   {activeTab === "alerts" && (
//                     <Notifications notifications={notifications} onMarkRead={id => markRoarRead(id)} onMarkAllRead={markAllRoarRead} onCompose={() => openCompose()} onJoinRoom={room => { if (room) setSelectedRoom(room); else if (rooms.length) setSelectedRoom(rooms[0]); setOverlay("room"); }} onNavigateTab={handleTab} rooms={rooms} />
//                   )}
//                 </motion.div>
//               )}
//             </AnimatePresence>

//             {onboarded && selectedPost && (
//               overlay === "room" ? (
//                 <RoomPostDetailsOverlay
//                   post={selectedPost}
//                   onClose={(count?) => { if (selectedPost && count !== undefined) roomReplyUpdateRef.current?.(selectedPost.id, count); setSelectedPost(null); roomRefreshRef.current?.(); }}
//                   onToast={showToast} onVote={handleVote} onDeletePost={handleDeletePost}
//                   currentUsername={currentUsername} currentAvatarUrl={currentAvatarUrl}
//                 />
//               ) : (
//                 <PostDetailsOverlay
//                   post={selectedPost}
//                   onClose={() => setSelectedPost(null)}
//                   onToast={showToast} onVote={handleVote} onDeletePost={handleDeletePost}
//                   currentUsername={currentUsername} currentAvatarUrl={currentAvatarUrl}
//                 />
//               )
//             )}
//           </div>
//         )}
//       </div>

//       {/* Modals outside roar-inner */}
//       {onboarded && (
//         <ComposeModal open={composeOpen} onClose={() => { setComposeOpen(false); setComposeType(null); }} onPost={handlePost} initialType={composeType} onOpenQuiz={() => { setComposeOpen(false); setComposeType(null); setQuizOpen(true); }} />
//       )}
//       {onboarded && (
//         <CreateFlashQuizModal open={quizOpen} onClose={() => setQuizOpen(false)} onPost={handlePost} />
//       )}

//     </div>
//   );
// }





// Home tab now shows RoomsHome (rooms list).
// Entering a room shows DiscussionRoom with icon-pill composer.

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import axios from "axios";
import { emitSxpActivityRefresh } from "@/lib/sxpEvents";

import { GLOBAL_CSS } from "./constants/styles";
import { NOTIFICATIONS_DATA } from "./constants";
import { Toast } from "./components/shared";
import ComposeModal from "./components/ComposeModal";
import CreateFlashQuizModal from "./components/CreateFlashQuizModal";
import PostDetailsOverlay from "./components/PostDetailsOverlay";
import Onboarding from "./screens/Onboarding";
import RoomsHome from "./screens/RoomsHome";
// import HomeFeed from "./screens/HomeFeed";             // SF360 Infinity Room = posts feed
import DiscussionRoom from "./screens/DiscussionRoom";
import Notifications from "./screens/Notifications";
import Leaderboard from "./screens/Leaderboard";
import Profile from "./screens/Profile";
import type { Notification, Room } from "./types";
import { useRoarNotifications } from "@/context/RoarNotificationsContext";
import { RoarProfileProvider, useRoarProfileContext } from "@/context/RoarProfileContext";
import RoomPostDetailsOverlay from "./components/RoomPostDetailsOverlay";
import { useRouter } from "next/navigation";


export default function ROARApp() {
  const phog = usePostHog();
  const containerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [likingPosts, setLikingPosts] = useState<Set<string>>(new Set());
  const roomRefreshRef = useRef<(() => void) | null>(null);
  const roomReplyUpdateRef = useRef<((postId: string, count: number) => void) | null>(null);
  const roomInjectPostRef = useRef<((post: any) => void) | null>(null);
  const roomOptimisticSwapRef = useRef<((tempId: string, realMsg?: any) => void) | null>(null);
  // const infinityFetchedRef = useRef(false);

  // ── Bootstrap 
  const [mounted, setMounted] = useState(false);
  const [checkingProfile, setChecking] = useState(true);
  const [onboarded, setOnboarded] = useState(false);
  const [userBadge, setUserBadge] = useState("RISING_FAN");
  const [userSports, setUserSports] = useState<string[]>([]);
  const [currentUsername, setCurrentUsername] = useState("RoarUser");
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | undefined>();

  useEffect(() => {
    setMounted(true);
    const checkProfile = async () => {
      try {
        const res = await axios.get("/api/roar/profile");
        if (res.data?.success) {
          const u = res.data.user;
          setUserBadge(u.badge || "RISING_FAN");
          setUserSports(u.sports ?? []);
          setCurrentUsername(u.username || "RoarUser");
          setCurrentUserId(u.actualUserId);
          setCurrentAvatarUrl(u.avatarUrl || undefined);
          try {
            localStorage.setItem("roar_v2_complete", "1");
            localStorage.setItem("roar_badge", u.badge || "RISING_FAN");
            localStorage.setItem("roar_username", u.username || "RoarUser");
            if (u.avatarUrl) localStorage.setItem("roar_avatar_url", u.avatarUrl);
          } catch { }
          setOnboarded(true);
          setChecking(false);
        } else {
          setOnboarded(false);
          setChecking(false);
        }
      } catch (err: any) {
        const status = err.response?.status;
        if (status === 404 || status === 401) {
          setOnboarded(false);
          setChecking(false);
        } else {
          let hasLocal = false; let badge = "RISING_FAN";
          try {
            hasLocal = !!localStorage.getItem("roar_v2_complete");
            badge = localStorage.getItem("roar_badge") || "RISING_FAN";
          } catch { }
          setOnboarded(hasLocal);
          setUserBadge(badge);
          setChecking(false);
        }
      }
    };
    checkProfile();
  }, []);

  useEffect(() => {
    if (phog) {
      phog.capture("second_screen_session_start");
    }
    return () => {
      if (phog) {
        phog.capture("second_screen_session_end");
      }
    };
  }, [phog]);

  // ── Navigation ─────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("home");
  const [overlay, setOverlay] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);

  useEffect(() => {
    if (selectedPost && phog) {
      if (selectedPost.type === "debate") {
        phog.capture("open_debate", {
          post_id: selectedPost.id,
          room_id: selectedPost.roomId || selectedRoom?.roomId,
          room_name: selectedRoom?.name || ""
        });
      } else if (selectedPost.type === "prediction") {
        phog.capture("open_prediction", {
          post_id: selectedPost.id,
          room_id: selectedPost.roomId || selectedRoom?.roomId,
          room_name: selectedRoom?.name || ""
        });
      }
    }
  }, [selectedPost, phog, selectedRoom]);

  const { viewingUserId, profileData, openProfile, closeProfile } = useRoarProfileContext();

  const handleFanProfileClick = useCallback((fan: any) => {
    if (phog) {
      phog.capture("view_profile", {
        viewed_user: fan.authorUid || fan.username || "",
        room_name: selectedRoom?.name || ""
      });
    }
    if (fan.authorUid && fan.authorUid === currentUserId) {
      router.push("/MainModules/Profile");
    } else {
      openProfile(fan.authorUid);
    }
  }, [currentUserId, openProfile, router, phog, selectedRoom]);

  // ── Compose ────────────────────────────────────────────────────────────────
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeType, setComposeType] = useState<string | null>(null);
  const [quizOpen, setQuizOpen] = useState(false);

  const openCompose = (type: string | null = null) => {
    if (type === "quiz") { setQuizOpen(true); return; }
    setComposeType(type); setComposeOpen(true);
  };

  // ── Toast ──────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState({ visible: false, message: "" });
  const showToast = useCallback((msg: string) => {
    setToast({ visible: true, message: msg });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3200);
    setTimeout(() => setToast({ visible: false, message: "" }), 3700);
  }, []);

  // ── Notifications ──────────────────────────────────────────────────────────
  const { roarNotifications: notifications, setRoarNotifications: setNotifications, markRoarRead, markAllRoarRead } = useRoarNotifications();
  const [notifSeeded, setNotifSeeded] = useState(false);
  const fetchRoarNotifications = useCallback(async () => {
    try {
      const res = await axios.get("/api/roar/notifications?limit=30");
      if (!res.data?.success || !Array.isArray(res.data.notifications)) return false;
      const mapped: Notification[] = res.data.notifications.map((n: any) => ({
        id: n.notifId || n.id,
        type: n.type || "ROAR_NOTIFICATION",
        title: n.title || n.message || "ROAR update",
        subtitle: n.subtitle || n.postPreview || "",
        time: n.createdAt ? "Just now" : "",
        read: Boolean(n.read),
        fan: n.fan ?? null,
        cta: n.cta ?? null,
        postId: n.postId,
      }));
      setNotifications(mapped);
      return true;
    } catch (err) {
      console.error("Failed to fetch ROAR notifications:", err);
      return false;
    }
  }, [setNotifications]);

  useEffect(() => {
    if (notifSeeded) return;
    fetchRoarNotifications().then((ok) => {
      if (!ok) setNotifications(NOTIFICATIONS_DATA.map(n => ({ ...n })));
      setNotifSeeded(true);
    });
  }, [notifSeeded, setNotifications, fetchRoarNotifications]);

  // ── Remote data ────────────────────────────────────────────────────────────
  const [rooms, setRooms] = useState<Room[]>([]);
  const [dbPosts, setDbPosts] = useState<any[]>([]);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await axios.get(`/api/roar/posts?t=${Date.now()}&limit=15`);
      if (res.data?.success) setDbPosts(res.data.posts);
    } catch (err) { console.error("Failed to fetch posts:", err); }
  }, []);

  const fetchRooms = useCallback(async () => {
    try {
      const res = await axios.get(`/api/roar/rooms?t=${Date.now()}`);
      if (res.data?.success) {
        setRooms(res.data.rooms);
        setSelectedRoom(prev => {
          if (!prev) return res.data.rooms.length > 0 ? res.data.rooms[0] : null;
          const updated = res.data.rooms.find((r: any) => r.roomId === prev.roomId);
          return updated || prev;
        });
      }
    } catch (err) { console.error("Failed to fetch rooms:", err); }
  }, []);

  // ── Initial load on boot ───────────────────────────────────────────────────
  useEffect(() => {
    if (!onboarded) return;

    const fetchUserSports = async () => {
      try {
        const res = await axios.get("/api/roar/profile", { withCredentials: true });
        if (res.data?.success) {
          setUserSports(res.data.user.sports ?? []);
          setUserBadge(res.data.user.badge || "RISING_FAN");
          setCurrentAvatarUrl(res.data.user.avatarUrl || undefined);
          try { if (res.data.user.avatarUrl) localStorage.setItem("roar_avatar_url", res.data.user.avatarUrl); } catch { }
        }
      } catch (err: any) {
        if (err.response?.status === 404) { setOnboarded(false); try { localStorage.removeItem("roar_v2_complete"); } catch { } }
      }
    };

    fetchRooms(); fetchPosts(); fetchUserSports();
  }, [onboarded, fetchPosts]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fetch fresh posts every time user opens the feed ──────────────────────
  // useEffect(() => {
  //   if (overlay !== "infinity" || !onboarded) return;
  //   fetchPosts(); // always fetch immediately on open
  //   const interval = setInterval(() => {
  //     if (!document.hidden) fetchPosts(); // skip if tab is hidden
  //   }, 15000);
  //   const onVisible = () => { if (!document.hidden) fetchPosts(); }; // fetch instantly on tab return
  //   document.addEventListener("visibilitychange", onVisible);
  //   return () => {
  //     clearInterval(interval);
  //     document.removeEventListener("visibilitychange", onVisible);
  //   };
  // }, [overlay, onboarded]); 

  useEffect(() => {
    const postId = searchParams.get("postId");
    if (!postId || !onboarded || dbPosts.length === 0) return;
    const target = dbPosts.find(p => p.postId === postId || p.id === postId);
    if (target) { setSelectedPost(target); window.history.replaceState(null, "", window.location.pathname); }
  }, [searchParams, onboarded, dbPosts]);

  useEffect(() => {
    if (!onboarded || rooms.length === 0) return;
    try {
      const autoJoinId = localStorage.getItem("roar_auto_join_room_id");
      if (autoJoinId) {
        const matched = rooms.find(r => r.roomId === autoJoinId);
        if (matched) {
          setSelectedRoom(matched);
          setOverlay("room");
          localStorage.removeItem("roar_auto_join_room_id");
        }
      }
    } catch (e) {
      console.error("Failed to auto-join room from localStorage:", e);
    }
  }, [onboarded, rooms]);

  useEffect(() => {
    const syncAvatar = (event?: Event) => {
      const custom = event as CustomEvent<{ avatarUrl?: string }> | undefined;
      try { setCurrentAvatarUrl(custom?.detail?.avatarUrl || localStorage.getItem("roar_avatar_url") || undefined); }
      catch { setCurrentAvatarUrl(custom?.detail?.avatarUrl || undefined); }
    };
    syncAvatar();
    window.addEventListener("roar-profile-updated", syncAvatar);
    return () => window.removeEventListener("roar-profile-updated", syncAvatar);
  }, []);

  // Sync live-room notifications
  useEffect(() => {
    if (!rooms.length) return;
    setNotifications(prev => {
      const nonMatch = prev.filter(n => n.type !== "MATCH_LIVE" && n.type !== "HEATING_UP");
      const matchNotifs: Notification[] = [];
      rooms.forEach(room => {
        if (!room.isActive) return;
        const prevLive = prev.find(n => n.id === `live-${room.roomId}`);
        const prevHeat = prev.find(n => n.id === `heat-${room.roomId}`);
        matchNotifs.push({ id: `live-${room.roomId}`, type: "MATCH_LIVE", title: `MATCH LIVE: ${room.name}`, subtitle: `${room.fanCount || 0} fans already debating.`, time: "Just now", read: prevLive ? prevLive.read : false, fan: null, cta: null });
        matchNotifs.push({ id: `heat-${room.roomId}`, type: "HEATING_UP", title: "This room is heating up 🔥", subtitle: `${room.name}: ${room.fanCount || 0} fans live.`, time: "15m", read: prevHeat ? prevHeat.read : false, fan: null, cta: null });
      });
      return [...matchNotifs, ...nonMatch];
    });
  }, [rooms]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-join room from localStorage if roar_auto_join_room_id is present
  useEffect(() => {
    if (!rooms.length) return;
    try {
      const autoJoinRoomId = localStorage.getItem("roar_auto_join_room_id");
      if (autoJoinRoomId) {
        const matchedRoom = rooms.find(r => r.roomId === autoJoinRoomId);
        if (matchedRoom) {
          setSelectedRoom(matchedRoom);
          setOverlay("room");
          localStorage.removeItem("roar_auto_join_room_id");
        }
      }
    } catch (e) {
      console.error("Failed to auto-join ROAR room", e);
    }
  }, [rooms]);



  // ── Actions ────────────────────────────────────────────────────────────────
  const handleVote = useCallback(async (postId: string, voteType: string | null) => {
    setDbPosts(prev => prev.map(post => {
      if (post.id === postId || post._id === postId || post.postId === postId) {
        let ag = post.agreeCount ?? 0; let di = post.disagreeCount ?? 0;
        if (post.userVote === "agree") ag = Math.max(0, ag - 1);
        if (post.userVote === "disagree") di = Math.max(0, di - 1);
        if (voteType === "agree") ag += 1;
        if (voteType === "disagree") di += 1;
        const predictionOptionCounts = { ...(post.predictionOptionCounts ?? {}) };
        if (typeof post.userVote === "string" && post.userVote.startsWith("option_")) {
          predictionOptionCounts[post.userVote] = Math.max(0, (predictionOptionCounts[post.userVote] ?? 0) - 1);
        }
        if (typeof voteType === "string" && voteType.startsWith("option_")) {
          predictionOptionCounts[voteType] = (predictionOptionCounts[voteType] ?? 0) + 1;
        }
        return { ...post, userVote: voteType, agreeCount: ag, disagreeCount: di, predictionOptionCounts };
      }
      return post;
    }));
    try {
      await axios.post(`/api/roar/posts/${postId}/vote`, { vote: voteType });
    } catch (err: any) {
      if (err.response?.status === 409) { await fetchPosts(); return; }
      console.error("Failed to submit vote:", err); await fetchPosts();
    }
  }, [fetchPosts]);

  const handleLike = useCallback(async (postId: string) => {
    if (likingPosts.has(postId)) return;
    setLikingPosts(prev => new Set(prev).add(postId));
    setDbPosts(prev => prev.map(post => {
      if (post.postId === postId || post._id === postId) {
        const ul = post.userLiked ?? false;
        return { ...post, userLiked: !ul, likeCount: Math.max(0, (post.likeCount ?? 0) + (ul ? -1 : 1)) };
      }
      return post;
    }));
    try { await axios.post(`/api/roar/posts/${postId}/like`); }
    catch {
      setDbPosts(prev => prev.map(post => {
        if (post.postId === postId || post._id === postId) {
          const ul = post.userLiked ?? false;
          return { ...post, userLiked: !ul, likeCount: Math.max(0, (post.likeCount ?? 0) + (ul ? 1 : -1)) };
        }
        return post;
      }));
      showToast("Failed to like post");
    }
    finally { setLikingPosts(prev => { const s = new Set(prev); s.delete(postId); return s; }); }
  }, [showToast, likingPosts]);

  const handleDeletePost = useCallback(async (postId: string, roomId?: string) => {
    try {
      const url = roomId ? `/api/roar/rooms/${roomId}/messages/${postId}` : `/api/roar/posts/${postId}`;
      const res = await axios.delete(url);
      if (res.data?.success) { showToast(roomId ? "Message deleted" : "Post deleted"); await fetchPosts(); }
      else showToast(roomId ? "Failed to delete message" : "Failed to delete post");
    } catch { showToast(roomId ? "Error deleting message" : "Error deleting post"); }
  }, [fetchPosts, showToast]);

  const handlePost = useCallback(async (payload: any) => {
    try {
      const postType = ["hot_take", "prediction", "debate", "raw_reactions", "post", "quiz"]
        .includes(payload.type) ? payload.type : "hot_take";

      let mediaUrls: string[] = [];
      if (payload.mediaFiles?.length > 0) {
        showToast("Uploading media...");
        mediaUrls = await Promise.all(payload.mediaFiles.map(async (file: File) => {
          const fd = new FormData(); fd.append("file", file);
          const r = await axios.post("/api/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
          return r.data.url;
        }));
      }

      const ROOM_NATIVE = ["post", "chat", "hot_take", "hottake", "prediction", "debate", "raw_reactions"];
      const isRoomNative = overlay === "room" && selectedRoom?.roomId
        && ROOM_NATIVE.includes(postType) && !payload.quizQuestion;

      if (isRoomNative) {
        const msgTypeMap: Record<string, string> = {
          prediction: "prediction", hot_take: "hottake", hottake: "hottake",
          debate: "debate", raw_reactions: "raw_reactions", post: "post", chat: "chat",
        };
        const mappedType = msgTypeMap[postType] || "post";
        
        const tempId = `temp-${Date.now()}`;
        const optimisticMsg: any = {
          id: tempId, msgId: tempId,
          fan: { username: currentUsername, authorUid: currentUserId, badge: userBadge, avatarUrl: currentAvatarUrl },
          text: payload.text || "Shared media", fireCount: 0, heartCount: 0, mindblownCount: 0, goatCount: 0, clapCount: 0, nochanceCount: 0, userReaction: null, replyCount: 0, agreeCount: 0, disagreeCount: 0, userVote: null, sideA: payload.sideA || null, sideB: payload.sideB || null, timeAgo: "Sending...", createdAt: Date.now(), type: mappedType, mediaUrls: mediaUrls.length ? mediaUrls : undefined, quizQuestion: null, quizOptions: null, quizCorrectOption: null, quizUserAnswer: null, quizTimer: null, quizPoints: null, quizParticipants: 0, memGifUrl: payload.gifUrl || null, memTag: payload.sf360Tag || null, status: "sending", predictionOptions: payload.predictionOptions || null
        };
        
        roomInjectPostRef.current?.(optimisticMsg);

        try {
          const res = await axios.post(`/api/roar/rooms/${selectedRoom!.roomId}/messages`, {
            text: payload.text, type: mappedType,
            mediaUrls: mediaUrls.length ? mediaUrls : payload.mediaUrls, sideA: payload.sideA, sideB: payload.sideB, predictionOptions: payload.predictionOptions,
            memGifUrl: payload.gifUrl ?? undefined, memTag: payload.sf360Tag ?? undefined,
            ...(postType === "prediction" && { closesAt: payload.closesAt, closeAfterMinutes: payload.closeAfterMinutes }),
          });
          if (res.data?.success) {
            roomOptimisticSwapRef.current?.(tempId, res.data.message);
          } else {
            roomOptimisticSwapRef.current?.(tempId, null);
          }
        } catch {
          roomOptimisticSwapRef.current?.(tempId, null);
        }
        return;
      }

      // ── Optimistic prepend — fires before the network call ──────────────────
      const tempId = `optimistic-${Date.now()}`;
      const optimisticPost = {
        postId: tempId,
        type: postType,
        text: postType === "quiz" ? payload.quizQuestion : payload.text,
        sport: payload.sport || "cricket",
        authorUid: currentUserId,
        authorUsername: currentUsername,
        authorAvatarUrl: currentAvatarUrl ?? null,
        authorBadge: userBadge,
        agreeCount: 0, disagreeCount: 0,
        likeCount: 0, replyCount: 0,
        userVote: null, userLiked: false, userReaction: null,
        sideA: payload.sideA ?? null,
        sideB: payload.sideB ?? null,
        predictionOptions: payload.predictionOptions ?? null,
        mediaUrls: mediaUrls ?? [],
        memGifUrl: payload.gifUrl ?? null,
        memTag: payload.sf360Tag ?? null,
        closesAt: payload.closesAt ?? null,
        createdAt: Date.now(),
        status: "active",
        ...(postType === "quiz" && {
          quizQuestion: payload.quizQuestion,
          quizOptions: payload.quizOptions,
          quizCorrectOption: payload.quizCorrectOption,
          quizTimer: payload.quizTimer,
          quizPoints: payload.quizPoints
        }),
        ...(postType !== "quiz" && {
          memCtx: payload.memCtx,
          matchId: payload.match,
          confidence: payload.confidence
        }),
      };

      const toastMap: Record<string, string> = {
        hot_take: "🔥 Hot Take is live", prediction: "📊 Prediction posted",
        debate: "⚡ Debate started", raw_reactions: "🎭 Raw Reaction shared",
        post: "✏️ Post is live", quiz: "🧠 Flash Quiz launched!",
      };
      showToast(toastMap[postType] || "🔥 Your take is live");
      setDbPosts(prev => [optimisticPost, ...prev]);

      // If user is in a room, instantly inject the post into the DiscussionRoom feed
      if (overlay === "room") {
        roomInjectPostRef.current?.(optimisticPost);
      }

      // ── Background API call — swaps tempId for real data on success ─────────
      try {
        const res = await axios.post("/api/roar/posts", {
          type: postType,
          text: postType === "quiz" ? payload.quizQuestion : payload.text,
          sport: payload.sport || "cricket",
          audience: payload.audience,
          mediaUrls,
          ...(postType !== "quiz" && {
            sideA: payload.sideA,
            sideB: payload.sideB,
            predictionOptions: payload.predictionOptions,
            memCtx: payload.memCtx,
            matchId: payload.match,
            confidence: payload.confidence
          }),
          ...(postType === "quiz" && {
            quizQuestion: payload.quizQuestion,
            quizOptions: payload.quizOptions,
            quizCorrectOption: payload.quizCorrectOption,
            quizTimer: payload.quizTimer,
            quizPoints: payload.quizPoints
          }),
          ...(postType === "raw_reactions" && {
            memGifUrl: payload.gifUrl,
            memTag: payload.sf360Tag
          }),
          ...(postType === "prediction" && {
            closesAt: payload.closesAt,
            closeAfterMinutes: payload.closeAfterMinutes
          }),
        });

        if (res.data?.success) {
          // Replace optimistic entry with server-confirmed data
          setDbPosts(prev => prev.map(p =>
            p.postId === tempId
              ? { ...optimisticPost, ...res.data.post, postId: res.data.postId, authorAvatarUrl: currentAvatarUrl ?? null }
              : p
          ));
        } else {
          // Server rejected — remove optimistic entry
          setDbPosts(prev => prev.filter(p => p.postId !== tempId));
          showToast("Failed to create post");
        }
      } catch {
        setDbPosts(prev => prev.filter(p => p.postId !== tempId));
        showToast("Failed to create post");
      }
    } catch {
      // Outer catch only for media upload failures
      showToast("Failed to upload media");
    }
  }, [showToast, overlay, selectedRoom, currentUserId, currentUsername, currentAvatarUrl, userBadge]);

  const handleTab = (tab: string) => {
    setOverlay(null);
    if (tab === "discuss") { setOverlay("room"); return; }
    setActiveTab(tab);
  };

  const completeOnboarding = useCallback(async (prefs: any) => {
    const username = prefs.username || "RoarUser";
    const badge = prefs.badge || "RISING_FAN";
    setUserSports(prefs.sports ?? []); setUserBadge(badge); setCurrentUsername(username); setOnboarded(true);
    try { localStorage.setItem("roar_v2_complete", "1"); localStorage.setItem("roar_badge", badge); localStorage.setItem("roar_username", username); } catch { }
  }, []);

  // ── Derived ────────────────────────────────────────────────────────────────
  // const isRoom = overlay === "room";
  // const isInfinity = overlay === "infinity";
  // const isLB = overlay === "leaderboard";
  // const isFullScreenOverlay = isRoom || isInfinity;
  const isRoom = overlay === "room";
  const isLB = overlay === "leaderboard";
  const isFullScreenOverlay = isRoom;
  const hideChrome = isFullScreenOverlay || !onboarded || !!viewingUserId;

  useEffect(() => {
    if (hideChrome) document.body.classList.add("roar-room-active");
    else document.body.classList.remove("roar-room-active");
    return () => document.body.classList.remove("roar-room-active");
  }, [hideChrome]);

  // ── Loading spinner ────────────────────────────────────────────────────────
  if (!mounted || checkingProfile) {
    return (
      <div className="roar-root" style={{ minHeight: "600px", height: "100%", background: "#050508", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", borderRadius: "24px", border: "1px solid #252538" }}>
        <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
        <div style={{ textAlign: "center", zIndex: 10 }}>
          <div style={{ width: 40, height: 40, border: "3px solid rgba(255,255,255,0.1)", borderTop: "3px solid #E91E8C", borderRadius: "50%", animation: "roar-spin 1s linear infinite", margin: "0 auto 16px" }} />
          <style dangerouslySetInnerHTML={{ __html: `@keyframes roar-spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}` }} />
          <div style={{ color: "#9494AD", fontSize: 14, fontFamily: "sans-serif", fontWeight: 500 }}>Loading ROAR...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`roar-root${hideChrome ? " roar-room-active" : ""}`}>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />

      <div className="roar-inner" ref={containerRef} style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Ambient background */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, background: "radial-gradient(ellipse 90% 55% at 50% -15%,rgba(233,30,140,0.18),transparent 55%),radial-gradient(ellipse 70% 45% at 100% 80%,rgba(255,107,53,0.12),transparent 50%),radial-gradient(ellipse 50% 40% at 0% 60%,rgba(0,232,198,0.08),transparent 45%),var(--bg-primary)" }} />
        {/* Floating sparks */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
          {[{ left: "12%", color: "var(--accent-magenta)", size: 3, duration: "14s", delay: "0s" }, { left: "28%", color: "var(--accent-orange)", size: 4, duration: "18s", delay: "2s" }, { left: "50%", color: "var(--teal)", size: 3, duration: "15s", delay: "5s" }, { left: "72%", color: "var(--accent-magenta)", size: 4, duration: "20s", delay: "1s" }, { left: "88%", color: "var(--accent-yellow)", size: 3, duration: "16s", delay: "7s" }].map(({ left, color, size, duration, delay }) => (
            <div key={left} style={{ position: "absolute", bottom: -10, left, width: size, height: size, borderRadius: "50%", background: color, animation: `roar-driftUp ${duration} linear infinite ${delay}` }} />
          ))}
        </div>
        {/* ROAR watermark */}
        <div style={{ position: "absolute", bottom: 88, right: 0, left: 0, textAlign: "right", paddingRight: 12, fontFamily: "'Bebas Neue',sans-serif", fontSize: 72, color: "white", opacity: 0.04, pointerEvents: "none", zIndex: 0, letterSpacing: "0.1em" }}>ROAR</div>

        <Toast message={toast.message} visible={toast.visible} />

        {!onboarded && (
          <>
            <style dangerouslySetInnerHTML={{ __html: `#global-header-desktop,#global-header-tablet,#global-header-mobile,.roar-header-spacer{display:none!important}` }} />
            <Onboarding onComplete={completeOnboarding} />
          </>
        )}

        {onboarded && (
          <div style={{ position: "relative", zIndex: 1, flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <AnimatePresence mode="wait">
              {viewingUserId ? (
                <motion.div
                  key="viewing-profile"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}
                >
                  <Profile
                    userBadge={userBadge}
                    setUserBadge={setUserBadge}
                    onCompose={() => openCompose("prediction")}
                    onToast={showToast}
                    setOnboarded={setOnboarded}
                    onNavigateTab={handleTab}
                    viewingProfile={viewingUserId}
                    onClose={closeProfile}
                  />
                </motion.div>
              ) : isLB ? (
                <motion.div key="lb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                  <Leaderboard onBack={() => setOverlay(null)} onCompose={() => openCompose("prediction")} />
                </motion.div>
                // ) : isInfinity ? (
                //   <motion.div key="infinity" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                //     <style dangerouslySetInnerHTML={{ __html: `#global-header-desktop,#global-header-tablet,#global-header-mobile{display:none!important}` }} />
                //     <HomeFeed
                //       onJoinRoom={room => { if (room) setSelectedRoom(room); else if (rooms.length) setSelectedRoom(rooms[0]); setOverlay("room"); }}
                //       onLeaderboard={() => setOverlay("leaderboard")}
                //       onFanProfile={handleFanProfileClick}
                //       onToast={showToast}
                //       extraItems={[]}
                //       showBanner={false}
                //       onDismissBanner={() => { }}
                //       userBadge={userBadge}
                //       onHandlePost={handlePost}
                //       rooms={rooms}
                //       dbPosts={dbPosts}
                //       onPostClick={post => setSelectedPost(post)}
                //       onVote={handleVote}
                //       onDeletePost={handleDeletePost}
                //       userSports={userSports}
                //       onQuickCompose={t => openCompose(t)}
                //       currentUsername={currentUsername}
                //       currentUserId={currentUserId}
                //       currentAvatarUrl={currentAvatarUrl}
                //       onBack={() => { setOverlay(null); setActiveTab("home"); }}
                //     />
                //   </motion.div>
              ) : isRoom ? (
                <motion.div key="room" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                  <style dangerouslySetInnerHTML={{ __html: `#global-header-desktop,#global-header-tablet,#global-header-mobile{display:none!important}` }} />
                  <DiscussionRoom
                    roomId={selectedRoom?.roomId}
                        roomSports={selectedRoom?.sport}
                    roomName={selectedRoom?.name}
                    fanCount={selectedRoom?.fanCount}
                    score={selectedRoom?.score}
                    scoreSubtitle={selectedRoom?.scoreSubtitle}
                    watchAlongRoomId={selectedRoom?.watchAlongRoomId}
                    onBack={() => { setOverlay(null); setActiveTab("home"); }}
                    onToast={showToast}
                    onPostClick={post => setSelectedPost(post)}
                    onCompose={type => openCompose(type)}
                    // currentUserId={currentUserId}
                    currentAvatarUrl={currentAvatarUrl}
                    onRegisterRefresh={fn => { roomRefreshRef.current = fn; }}
                    onRegisterReplyUpdate={fn => { roomReplyUpdateRef.current = fn; }}
                    onRegisterInjectPost={fn => { roomInjectPostRef.current = fn; }}
                    onRegisterOptimisticSwap={fn => { roomOptimisticSwapRef.current = fn; }}
                    onFanProfile={handleFanProfileClick}
                  />
                </motion.div>
              ) : (
                <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                  {activeTab === "home" && (
                    <RoomsHome
                      rooms={rooms}
                      // onJoinRoom={room => {
                      //   if (room?.roomId === "sf360-infinity") {
                      //     setOverlay("infinity");
                      //   } else {
                      //     if (room) setSelectedRoom(room);
                      //     else if (rooms.length) setSelectedRoom(rooms[0]);
                      //     setOverlay("room");
                      //   }
                      // }}
                      onJoinRoom={room => {
                        if (room) setSelectedRoom(room);
                        else if (rooms.length) setSelectedRoom(rooms[0]);
                        setOverlay("room");
                      }}
                      onToast={showToast}
                    />
                  )}
                  {activeTab === "profile" && (
                    <Profile userBadge={userBadge} setUserBadge={setUserBadge} onCompose={() => openCompose("prediction")} onToast={showToast} setOnboarded={setOnboarded} onNavigateTab={handleTab} />
                  )}
                  {activeTab === "alerts" && (
                    <Notifications notifications={notifications} onMarkRead={id => markRoarRead(id)} onMarkAllRead={markAllRoarRead} onCompose={() => openCompose()} onJoinRoom={room => { if (room) setSelectedRoom(room); else if (rooms.length) setSelectedRoom(rooms[0]); setOverlay("room"); }} onNavigateTab={handleTab} rooms={rooms} />
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* {onboarded && selectedPost && (
              overlay === "room" ? (
                <RoomPostDetailsOverlay
                  post={selectedPost}
                  onClose={(count?) => { if (selectedPost && count !== undefined) roomReplyUpdateRef.current?.(selectedPost.id, count); setSelectedPost(null); roomRefreshRef.current?.(); }}
                  onToast={showToast} onVote={handleVote} onDeletePost={handleDeletePost}
                  currentUsername={currentUsername} currentUserId={currentUserId} currentAvatarUrl={currentAvatarUrl}
                  roomName={selectedRoom?.name}
                />
              ) : (
                <PostDetailsOverlay
                  post={selectedPost}
                  onClose={() => setSelectedPost(null)}
                  onToast={showToast} onVote={handleVote} onDeletePost={handleDeletePost}
                  currentUsername={currentUsername} currentUserId={currentUserId} currentAvatarUrl={currentAvatarUrl}
                  roomName={rooms.find(r => r.roomId === selectedPost.roomId)?.name || ""}
                />
              )
            )} */}
          </div>
        )}
      </div>

      {/* Modals outside roar-inner */}
      {onboarded && (
        <ComposeModal open={composeOpen} onClose={() => { setComposeOpen(false); setComposeType(null); }} onPost={handlePost} initialType={composeType} onOpenQuiz={() => { setComposeOpen(false); setComposeType(null); setQuizOpen(true); }} />
      )}
      {onboarded && (
        <CreateFlashQuizModal open={quizOpen} onClose={() => setQuizOpen(false)} onPost={handlePost} />
      )}

    </div>
  );
}
