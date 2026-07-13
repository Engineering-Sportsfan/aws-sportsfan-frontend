// import React from "react";
// import { useState, useEffect, useRef, useCallback } from "react";
// import { useRouter } from "next/navigation";
// import { usePostHog } from "posthog-js/react";
// import { motion, AnimatePresence, useAnimationControls } from "framer-motion";
// import { useUserProfile } from "@/context/UserProfileContext";
// import axios from "axios";
// import AvatarWithBadge from "../components/AvatarWithBadge";
// import ReactionPicker, { type Reaction } from "../components/ReactionPicker";
// import ReactionsDialog from "../components/ReactionsDialog";
// import ActiveFansDialog from "../components/ActiveFansDialog";
// import EmojiPicker from "@emoji-mart/react";
// import data from "@emoji-mart/data";
// import { roarApi } from "@/lib/roarApi";
// import { RADIAL_OPTS } from "../constants";
// import {
//   Image, ChevronLeft, Flame, TrendingUp, Zap, History, PenTool,
//   Brain, Users, CheckCircle2, XCircle, Volume2, VolumeX,
//   Share2, Send, ChevronDown, ChevronUp, Clock, MoreVertical, Trash2,
// } from "lucide-react";
// import PredictionsLivePanel from "../components/PredictionsLivePanel";
// import DollyPanel, { type DollyHistorySession } from "../components/DollyPanel";
// import VotersDialog from "../components/VotersDialog";

// const REQUEST_TIMEOUT_MS = 12000;
// const PRESENCE_TIMEOUT_MS = 20000; 

// interface Props {
//   onBack: () => void;
//   onToast: (m: string) => void;
//   roomId?: string;
//   roomName?: string;
//   onPostClick?: (post: any) => void;
//   onCompose?: (type: string | null) => void;
//   fanCount?: number;
//   score?: string;
//   scoreSubtitle?: string;
//   currentAvatarUrl?: string;
//   currentUserId?: string;
//   onRegisterRefresh?: (fn: () => void) => void;
//   onRegisterReplyUpdate?: (fn: (postId: string, count: number) => void) => void;
//   onFanProfile?: (fan: any) => void;
//   watchAlongRoomId?: string;
//   roomSports?: string;
// }

// const QUICK_REACT_OPTS = [
//   { id: "qr_wicket", label: "Wicket!", emoji: "🎯", sport: "cricket" },
//   { id: "qr_six", label: "Six!!", emoji: "💪", sport: "cricket" },
//   { id: "qr_four", label: "Four!", emoji: "🏏", sport: "cricket" },
//   { id: "qr_catch", label: "Catch!", emoji: "🧤", sport: "cricket" },
//   { id: "qr_goal", label: "Goal!!", emoji: "⚽", sport: "football" },
//   { id: "qr_redcard", label: "Red Card!", emoji: "🟥", sport: "football" },
//   { id: "qr_frango", label: "Frango!", emoji: "🐔", sport: "football" },
//   { id: "qr_yellowcard", label: "Yellow Card!", emoji: "🟨", sport: "football" },
//   { id: "qr_wave", label: "Wave!", emoji: "🌊", sport: "both" },
// ];

// const QUICK_REACT_GRADIENTS: Record<string, string> = {
//   qr_wicket: "linear-gradient(135deg,#e91e8c,#c2185b)",
//   qr_six: "linear-gradient(135deg,#f59e0b,#d97706)",
//   qr_four: "linear-gradient(135deg,#f97316,#ea580c)",
//   qr_catch: "linear-gradient(135deg,#3b82f6,#2563eb)",
//   qr_frango: "linear-gradient(135deg,#f97316,#ea580c)",
//   qr_redcard: "linear-gradient(135deg,#ef4444,#dc2626)",
//   qr_yellowcard: "linear-gradient(135deg,#eab308,#ca8a04)",
//   qr_goal: "linear-gradient(135deg,#10b981,#059669)",
// };

// const QUICK_REACT_VIDEO_MAP: Record<string, string> = {
//   wicket: "/QUICK_REACT_VIDEO/wicket.mp4",
//   six: "/QUICK_REACT_VIDEO/six.mp4",
//   four: "/QUICK_REACT_VIDEO/four.mp4",
//   catch: "/QUICK_REACT_VIDEO/catch.mp4",
//   frango: "/QUICK_REACT_VIDEO/Frango.mp4",
//   redcard: "/QUICK_REACT_VIDEO/RedCard.mp4",
//   yellowcard: "/QUICK_REACT_VIDEO/Yellowcard.mp4",
//   goal: "/QUICK_REACT_VIDEO/Goal.mp4",
// };
// const QUICK_REACT_IMAGES_MAP: Record<string, string> = {
//   wicket: "/QUICK_REACT_IMAGES/Wicket.png",
//   six: "/QUICK_REACT_IMAGES/Six.png",
//   four: "/QUICK_REACT_IMAGES/Four.png",
//   catch: "/QUICK_REACT_IMAGES/Catch.png",
//   frango: "/QUICK_REACT_IMAGES/Frango.png",
//   redcard: "/QUICK_REACT_IMAGES/Redcard.png",
//   yellowcard: "/QUICK_REACT_IMAGES/Yellowcard.png",
//   goal: "/QUICK_REACT_IMAGES/Goal.png",
// };

// const MODE_COLOR: Record<string, string> = {
//   post: "var(--text-primary)",
//   prediction: "var(--gold)",
//   hottake: "#f87171",
//   debate: "#e91e8c",
//   raw_reactions: "#00e8c6",
// };

// const LOAD_MORE_PAGE_SIZE = 15;

// const PLACEHOLDER: Record<string, string> = {
//   post: "Drop your take...",
//   debate: "My debate side: ",
//   prediction: "My prediction: ",
//   hottake: "Drop a hot take...",
//   raw_reactions: "Share your raw reaction...",
// };


// interface MentionUser {
//   userId: string;
//   username: string;
//   firstName?: string;
//   lastName?: string;
//   name?: string;
//   avatarUrl?: string;
//   email?: string;
// }

// function useMentionAutocomplete(activeUsername?: string) {
//   const [allUsers, setAllUsers] = useState<MentionUser[]>([]);
//   const [mentionUsers, setMentionUsers] = useState<MentionUser[]>([]);
//   const [showMentionPopup, setShowMentionPopup] = useState(false);
//   const [mentionIndex, setMentionIndex] = useState(0);
//   const [cursorPosition, setCursorPosition] = useState(0);

//   const hasUnderscore = (u: any) => {
//     const n = u.username || u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim();
//     return n.includes("_") || (u.email || "").split("@")[0].includes("_");
//   };

//   useEffect(() => {
//     axios.get("/api/users", { withCredentials: true }).then(res => {
//       if (!res.data?.users) return;
//       const seen = new Set<string>();
//       setAllUsers(res.data.users
//         .filter((u: any) => {
//           const n = u.username || u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim();
//           return n !== activeUsername && !hasUnderscore(u);
//         })
//         .map((u: any) => ({
//           userId: u.userId || u.id, username: u.username, firstName: u.firstName,
//           lastName: u.lastName, name: u.name, avatarUrl: u.avatarUrl || u.avatar, email: u.email,
//         }))
//         .filter((u: MentionUser) => {
//           const key = u.userId || u.username;
//           if (!key || seen.has(key)) return false;
//           const dn = u.username || u.name || `${u.firstName || ""}${u.lastName || ""}`.trim();
//           if (dn.includes("_")) return false;
//           seen.add(key); return true;
//         }));
//     }).catch(() => { });
//   }, [activeUsername]);

//   // Call this from the input's onChange
//   const handleMentionInputChange = (value: string, cursorPos: number) => {
//     setCursorPosition(cursorPos);
//     const before = value.slice(0, cursorPos);
//     const at = before.lastIndexOf("@");
//     if (at !== -1) {
//       const afterAt = before.slice(at + 1);
//       if (!afterAt.includes(" ")) {
//         const filtered = afterAt.trim() === ""
//           ? allUsers.slice(0, 8)
//           : allUsers.filter(u =>
//             `${u.username || ""} ${u.firstName || ""} ${u.lastName || ""} ${u.email || ""}`
//               .toLowerCase().includes(afterAt.toLowerCase())
//           ).slice(0, 8);
//         setMentionUsers(filtered);
//         setShowMentionPopup(filtered.length > 0);
//         setMentionIndex(0);
//         return;
//       }
//     }
//     setShowMentionPopup(false);
//     setMentionUsers([]);
//   };

//   // Call this to splice the chosen mention into the text
//   const insertMention = (
//     user: MentionUser,
//     currentText: string,
//     setText: (t: string) => void,
//    inputRef: React.RefObject<HTMLInputElement | null>
//   ) => {
//     const dn = user.username || user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email?.split("@")[0] || "user";
//     const mt = `@${dn} `;
//     const before = currentText.slice(0, cursorPosition);
//     const at = before.lastIndexOf("@");
//     const newText = `${currentText.slice(0, at)}${mt}${currentText.slice(cursorPosition)}`;
//     setText(newText);
//     setShowMentionPopup(false);
//     setMentionUsers([]);
//     setTimeout(() => {
//       if (inputRef.current) {
//         const p = at + mt.length;
//         inputRef.current.focus();
//         inputRef.current.setSelectionRange(p, p);
//       }
//     }, 10);
//   };

//   // Call this from the input's onKeyDown, BEFORE your existing Enter-to-send logic.
//   // Returns true if it handled the keypress (so you should return early / not send).
//   const handleMentionKeyDown = (
//     e: React.KeyboardEvent<HTMLInputElement>,
//     currentText: string,
//     setText: (t: string) => void,
//      inputRef: React.RefObject<HTMLInputElement | null> 
//   ): boolean => {
//     if (!showMentionPopup || mentionUsers.length === 0) return false;
//     if (e.key === "ArrowDown") { e.preventDefault(); setMentionIndex(p => (p + 1) % mentionUsers.length); return true; }
//     if (e.key === "ArrowUp") { e.preventDefault(); setMentionIndex(p => (p - 1 + mentionUsers.length) % mentionUsers.length); return true; }
//     if (e.key === "Enter" || e.key === "Tab") {
//       e.preventDefault();
//       if (mentionUsers[mentionIndex]) insertMention(mentionUsers[mentionIndex], currentText, setText, inputRef);
//       return true;
//     }
//     if (e.key === "Escape") { setShowMentionPopup(false); setMentionUsers([]); return true; }
//     return false;
//   };

//   return {
//     mentionUsers, showMentionPopup, mentionIndex, setMentionIndex,
//     handleMentionInputChange, handleMentionKeyDown, insertMention,
//   };
// }

// function MentionPopup({
//   mentionUsers, mentionIndex, setMentionIndex, onSelect, currentAvatarLookup,
// }: {
//   mentionUsers: MentionUser[];
//   mentionIndex: number;
//   setMentionIndex: (i: number) => void;
//   onSelect: (u: MentionUser) => void;
//   currentAvatarLookup?: (u: MentionUser) => string | undefined;
// }) {
//   return (
//     <div style={{
//       position: "absolute", bottom: "100%", left: 8, right: 8, marginBottom: 6,
//       background: "#181c24", borderRadius: 14, border: "1px solid rgba(255,255,255,0.1)",
//       overflow: "hidden", zIndex: 60, boxShadow: "0 8px 32px rgba(0,0,0,0.4)", maxHeight: 220, overflowY: "auto",
//     }}>
//       {mentionUsers.map((user, idx) => {
//         const dn = user.username || user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email?.split("@")[0] || "user";
//         return (
//           <button
//             key={user.userId}
//             type="button"
//             onClick={() => onSelect(user)}
//             onMouseEnter={() => setMentionIndex(idx)}
//             style={{
//               display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px",
//               border: "none", cursor: "pointer", textAlign: "left",
//               background: idx === mentionIndex ? "rgba(233,30,140,0.15)" : "transparent",
//             }}
//           >
//             <div style={{ width: 20, height: 20, borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: "linear-gradient(135deg,#e91e8c,#ff6b35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
//               {user.avatarUrl ? <img src={user.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 9, fontWeight: 800, color: "#fff" }}>{dn[0]?.toUpperCase()}</span>}
//             </div>
//             <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>{dn}</span>
//           </button>
//         );
//       })}
//     </div>
//   );
// }

// const typeBadgeClass = (type: string) => {
//   const base = "text-[8px] font-extrabold px-1.5 py-0.5 rounded";
//   if (type === "prediction") return `${base} bg-[rgba(255,215,0,0.15)] text-[#fbbf24] border border-[rgba(255,215,0,0.25)]`;
//   if (type === "post") return `${base} bg-[rgba(233,30,140,0.12)] text-[#E91E8C] border border-[rgba(233,30,140,0.2)]`;
//   if (type === "hottake") return `${base} bg-[rgba(239,68,68,0.15)] text-[#f87171] border border-[rgba(239,68,68,0.25)]`;
//   if (type === "debate") return `${base} bg-[rgba(233,30,140,0.15)] text-[#e91e8c] border border-[rgba(233,30,140,0.25)]`;
//   if (type === "raw_reactions") return `${base} bg-[rgba(0,232,198,0.15)] text-[#00e8c6] border border-[rgba(0,232,198,0.25)]`;
//   return `${base} bg-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.5)] border border-[rgba(255,255,255,0.1)]`;
// };

// const commentAccentColor = (type: string) => {
//   if (type === "prediction") return "#22c55e";
//   if (type === "hottake") return "#f87171";
//   if (type === "raw_reactions") return "#00e8c6";
//   return "#e91e8c";
// };

// function ActiveFansStack({
//   fans, count, totalJoinCount, onClick,
// }: {
//   fans: { uid: string; username: string; avatarUrl?: string | null }[];
//   count: number;
//   totalJoinCount?: number;
//   onClick: () => void;
// }) {
//   if (count === 0 && !totalJoinCount) return null;
//   const formatCount = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;
//   return (
//     <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2px 0" }}>
//       <button type="button" onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
//         <div style={{ display: "flex" }}>
//           {fans.slice(0, 3).map((fan, i) => (
//             <div key={fan.uid} style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid #0e0e14", overflow: "hidden", marginLeft: i === 0 ? 0 : -6, zIndex: 3 - i, background: "linear-gradient(135deg,#e91e8c,#ff6b35)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
//               {fan.avatarUrl ? <img src={fan.avatarUrl} alt={fan.username} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 8, fontWeight: 800, color: "#fff" }}>{fan.username?.[0]?.toUpperCase() || "?"}</span>}
//             </div>
//           ))}
//         </div>
//         <span style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>
//           <span style={{ color: "#fff", fontWeight: 700 }}>{formatCount(count)}</span> active now
//         </span>
//       </button>
//       {totalJoinCount !== undefined && totalJoinCount > 0 && (
//         <span style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>
//           Total Joined <span style={{ color: "#fff", fontWeight: 700 }}>{formatCount(totalJoinCount)}</span>
//         </span>
//       )}
//     </div>
//   );
// }

// function mentionMatchesAuthor(mentionToken: string, authorUsername: string): boolean {
//   const mention = mentionToken.toLowerCase().trim();
//   const uname = (authorUsername ?? "").toLowerCase().trim();
//   if (uname === mention) return true;
//   const segments = uname.split(/[\s_\.]+/).filter(Boolean);
//   if (segments.some(seg => seg === mention)) return true;
//   if (segments.join("") === mention.replace(/\s+/g, "")) return true;
//   return false;
// }

// function threadSort(flat: any[]): any[] {
//   const result: any[] = [];
//   for (const comment of flat) {
//     const text: string = (comment.text ?? "").trimStart();
//     const mentionMatch = text.match(/^@(\S+)/);
//     if (mentionMatch) {
//       const mentionToken = mentionMatch[1];
//       let insertAfter = -1;
//       for (let i = result.length - 1; i >= 0; i--) {
//         if (mentionMatchesAuthor(mentionToken, result[i].authorUsername ?? "")) {
//           insertAfter = i;
//           break;
//         }
//       }
//       if (insertAfter >= 0) {
//         let insertAt = insertAfter + 1;
//         while (
//           insertAt < result.length &&
//           (result[insertAt].text ?? "").trimStart().match(/^@/)
//         ) {
//           insertAt++;
//         }
//         result.splice(insertAt, 0, comment);
//         continue;
//       }
//     }
//     result.push(comment);
//   }
//   return result;
// }

// function InlineSection({
//   postId, roomId, roomName, isOpen, onOpenFull, accentColor, currentAvatarUrl,
//   onCommentPosted, onCommentDeleted, currentUserId, currentUsername, onFanProfile,
// }: {
//   postId: string; roomId: string; roomName?: string; isOpen: boolean; onOpenFull: () => void;
//   accentColor: string; currentAvatarUrl?: string; onCommentPosted: () => void;
//   onCommentDeleted?: () => void;
//   currentUserId?: string; currentUsername?: string; onFanProfile?: (fan: any) => void;
// }) {
//   const phog = usePostHog();
//   const [replies, setReplies] = useState<any[]>([]);
//   const [showAllReplies, setShowAllReplies] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [commentText, setCommentText] = useState("");
//   const [sending, setSending] = useState(false);
//   const [replyTo, setReplyTo] = useState<{ commentId: string; authorUsername: string } | null>(null);
//   const inputRef = useRef<HTMLInputElement>(null);
//   const [isAnimatingHeight, setIsAnimatingHeight] = useState(true);
//   const [commentReactions, setCommentReactions] = useState<Record<string, { reaction: Reaction | null; heartCount: number }>>({});
//   const pendingCommentReactRef = useRef<Record<string, boolean>>({});
//   const commentTopReactionsCache = useRef<Record<string, string[]>>({});
//   const [commentTopReactionsMap, setCommentTopReactionsMap] = useState<Record<string, string[]>>({});
//   const [reactionsDialogCommentId, setReactionsDialogCommentId] = useState<string | null>(null);
//   const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
//   const mention = useMentionAutocomplete(currentUsername);

//   const REACTION_EMOJI: Record<string, string> = {
//     fire: "🔥", heart: "❤️", mindblown: "🤯", goat: "🐐", clap: "👏",
//     nochance: "🙅", laugh: "😂", sad: "😢", thumb: "👍",
//   };

//   const fetchCommentTopReactions = useCallback(async (commentId: string) => {
//     if (commentTopReactionsCache.current[commentId] !== undefined) return;
//     commentTopReactionsCache.current[commentId] = [];
//     try {
//       const res = await axios.get(`/api/roar/rooms/${roomId}/messages/${postId}/comments/${commentId}/reactions`);
//       const reactors: { reaction: string }[] = res.data?.reactors ?? [];
//       const counts: Record<string, number> = {};
//       reactors.forEach(r => { counts[r.reaction] = (counts[r.reaction] ?? 0) + 1; });
//       const top = Object.entries(counts).sort(([, a], [, b]) => b - a).slice(0, 3).map(([type]) => type);
//       commentTopReactionsCache.current[commentId] = top;
//       setCommentTopReactionsMap(prev => ({ ...prev, [commentId]: top }));
//     } catch { commentTopReactionsCache.current[commentId] = []; }
//   }, [roomId, postId]);

//   const handleCommentReact = useCallback(async (commentId: string, reaction: Reaction | null) => {
//     if (pendingCommentReactRef.current[commentId]) return;
//     const comment = replies.find(c => (c.commentId || c.id) === commentId);
//     const persistedReaction: Reaction | null =
//       comment?.userReaction ?? (currentUserId ? (comment?.reactions?.[currentUserId] ?? null) : null);
//     const prev = commentReactions[commentId] ?? { reaction: persistedReaction, heartCount: comment?.heartCount ?? 0 };
//     const sameReaction = prev.reaction === reaction;
//     const newReaction = sameReaction ? null : reaction;
//     const wasActive = prev.reaction !== null;
//     const newActive = newReaction !== null;
//     const delta = newActive && !wasActive ? 1 : (!newActive && wasActive ? -1 : 0);
//     const optimistic = { reaction: newReaction, heartCount: Math.max(0, prev.heartCount + delta) };

//     setCommentReactions(p => ({ ...p, [commentId]: optimistic }));
//     delete commentTopReactionsCache.current[commentId];
//     pendingCommentReactRef.current[commentId] = true;
//     try {
//       const res = await axios.post(
//         `/api/roar/rooms/${roomId}/messages/${postId}/comments/${commentId}/react`,
//         { reaction: newReaction ?? prev.reaction }
//       );
//       if (res.data && typeof res.data.heartCount === "number") {
//         setCommentReactions(p => ({ ...p, [commentId]: { ...optimistic, heartCount: res.data.heartCount } }));
//       }
//       delete commentTopReactionsCache.current[commentId];
//       setCommentTopReactionsMap(p => { const n = { ...p }; delete n[commentId]; return n; });
//     } catch {
//       setCommentReactions(p => ({ ...p, [commentId]: prev }));
//     } finally {
//       pendingCommentReactRef.current[commentId] = false;
//     }
//   }, [roomId, postId, replies, commentReactions, currentUserId]);

//   const fetchReplies = useCallback(async () => {
//     setLoading(true);
//     try {
//       const res = await axios.get(`/api/roar/rooms/${roomId}/messages/${postId}/comments`, { params: { limit: 50 } });
//       const list: any[] = res.data?.comments ?? [];
//       const oldestFirst = [...list].sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));
//       const threaded = threadSort(oldestFirst);
//       setReplies(threaded);
//     } catch { setReplies([]); }
//     finally { setLoading(false); }
//   }, [postId, roomId]);

//   useEffect(() => {
//     if (isOpen) { fetchReplies(); setTimeout(() => inputRef.current?.focus(), 180); }
//   }, [isOpen, fetchReplies]);

//   const handleSend = async () => {
//     const fullText = replyTo ? `@${replyTo.authorUsername} ${commentText.trim()}` : commentText.trim();
//     if (!fullText || sending) return;
//     setSending(true);
//     try {
//       await axios.post(`/api/roar/rooms/${roomId}/messages/${postId}/comments`, { text: fullText });
//       if (phog) {
//         phog.capture("post_comment", { post_id: postId, room_id: roomId, room_name: roomName || "" });
//       }
//       setCommentText(""); setReplyTo(null); onCommentPosted(); fetchReplies();
//     } catch { }
//     finally { setSending(false); }
//   };

//   const handleDeleteComment = useCallback(async (commentId: string) => {
//     if (!window.confirm("Delete this reply?")) return;
//     setDeletingCommentId(commentId);
//     try {
//       await axios.delete(`/api/roar/rooms/${roomId}/messages/${postId}/comments/${commentId}`);
//       setReplies(prev => prev.filter(r => (r.id ?? r.commentId) !== commentId));
//       onCommentDeleted?.();
//     } catch {
//       // leave it in place on failure
//     } finally {
//       setDeletingCommentId(null);
//     }
//   }, [roomId, postId, onCommentDeleted]);

//   if (!isOpen) return null;

//   return (
//     <motion.div
//       initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
//       exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22, ease: "easeOut" }}
//       onAnimationStart={() => setIsAnimatingHeight(true)}
//       onAnimationComplete={() => setIsAnimatingHeight(false)}
//       style={{ overflow: isAnimatingHeight ? "hidden" : "visible" }}
//       onClick={e => e.stopPropagation()}
//     >
//       <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 0 }}>
//         {loading ? (
//           <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontStyle: "italic", marginBottom: 6, paddingLeft: 4 }}>Loading replies…</p>
//         ) : replies.length === 0 ? (
//           <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontStyle: "italic", marginBottom: 6, paddingLeft: 4 }}>No replies yet — be the first!</p>
//         ) : (
//           <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 8 }}>
//             {(showAllReplies ? replies : replies.slice(0, 2)).map((r, i) => {
//               const isReply = /^@\S+/.test((r.text ?? "").trimStart());
//               const commentId = r.id ?? r.commentId ?? String(i);
//               const persistedReaction: Reaction | null =
//                 r.userReaction ?? (currentUserId ? (r.reactions?.[currentUserId] ?? null) : null);
//               const lo = commentReactions[commentId];
//               const currentReaction: Reaction | null = lo !== undefined ? lo.reaction : persistedReaction;
//               const liveHeartCount = lo !== undefined ? lo.heartCount : (r.heartCount ?? 0);
//               const topReactions = commentTopReactionsMap[commentId] ?? [];
//               if (liveHeartCount > 0 && topReactions.length === 0 && !commentTopReactionsCache.current[commentId]) {
//                 fetchCommentTopReactions(commentId);
//               }
//               const displayReactions = topReactions.length > 0 ? topReactions : (currentReaction ? [currentReaction] : []);
//               const isOwnComment = currentUserId && r.authorUid === currentUserId;
//               // const mention = useMentionAutocomplete(currentUsername);
//               return (
//                 <div key={commentId} style={{ display: "flex", gap: 6, alignItems: "flex-start", paddingLeft: isReply ? 24 : 0, minWidth: 0, width: "100%" }}>
//                   <div style={{ width: 14, height: 14, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg,#e91e8c,#ff6b35)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", cursor: onFanProfile ? "pointer" : "default" }}
//                     onClick={e => { e.stopPropagation(); onFanProfile?.({ username: r.authorUsername, badge: r.authorBadge, avatarUrl: r.authorAvatarUrl || r.avatarUrl, authorUid: r.authorUid }); }}
//                   >
//                     {(() => {
//                       const resolvedAvatar =
//                         r.authorAvatarUrl ||
//                         r.avatarUrl ||
//                         (r.authorUsername === currentUsername ? currentAvatarUrl : undefined);
//                       return resolvedAvatar
//                         ? <img src={resolvedAvatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
//                         : <span style={{ fontSize: 7, fontWeight: 800, color: "#fff" }}>{(r.authorUsername ?? "?")[0].toUpperCase()}</span>;
//                     })()}
//                   </div>
//                   <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
//                     <span
//                       style={{ fontWeight: 700, color: "#fff", fontSize: 10, display: "block", wordBreak: "break-word", cursor: onFanProfile ? "pointer" : "default" }}
//                       onClick={e => { e.stopPropagation(); onFanProfile?.({ username: r.authorUsername, badge: r.authorBadge, avatarUrl: r.authorAvatarUrl || r.avatarUrl, authorUid: r.authorUid }); }}
//                     >
//                       {r.authorUsername ?? "Fan"}
//                     </span>
//                     <p style={{ margin: 0, fontSize: 10, lineHeight: 1.4, color: "rgba(255,255,255,0.75)", wordBreak: "break-word", overflowWrap: "anywhere" }}>
//                       {isReply ? (() => {
//                         const spaceIdx = (r.text ?? "").indexOf(" ");
//                         const mention = spaceIdx > -1 ? (r.text ?? "").slice(0, spaceIdx) : (r.text ?? "");
//                         const rest = spaceIdx > -1 ? (r.text ?? "").slice(spaceIdx) : "";
//                         return (<><span style={{ color: accentColor, fontWeight: 600 }}>{mention}</span>{rest}</>);
//                       })() : (r.text ?? "")}
//                     </p>
//                     <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 1 }}>
//                       {liveHeartCount > 0 && (
//                         <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{liveHeartCount} {liveHeartCount === 1 ? "like" : "likes"}</span>
//                       )}
//                       <button type="button" onClick={e => { e.stopPropagation(); setReplyTo({ commentId, authorUsername: r.authorUsername ?? "Fan" }); setTimeout(() => inputRef.current?.focus(), 80); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.35)", padding: 0 }}>Reply</button>
//                       {isOwnComment && (
//                         <button
//                           type="button"
//                           onClick={e => { e.stopPropagation(); handleDeleteComment(commentId); }}
//                           disabled={deletingCommentId === commentId}
//                           style={{ background: "none", border: "none", cursor: deletingCommentId === commentId ? "wait" : "pointer", fontSize: 9, fontWeight: 700, color: "#f87171", padding: 0, display: "flex", alignItems: "center", gap: 2 }}
//                         >
//                           <Trash2 size={9} />
//                         </button>
//                       )}
//                     </div>
//                   </div>

//                   <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
//                     <ReactionPicker
//                       currentReaction={currentReaction}
//                       count={liveHeartCount}
//                       onReact={(reaction) => handleCommentReact(commentId, reaction)}
//                       postId={commentId}
//                       roomId={roomId}
//                       roomName={roomName}
//                     />
//                     {liveHeartCount > 0 && displayReactions.length > 0 && (
//                       <button
//                         onClick={() => setReactionsDialogCommentId(commentId)}
//                         style={{ display: "flex", alignItems: "center", background: "none", border: "none", cursor: "pointer", padding: 0 }}
//                         title="See who reacted"
//                       >
//                         <div style={{ display: "flex" }}>
//                           {displayReactions.map((type, idx) => (
//                             <div key={type} style={{ width: 12, height: 12, borderRadius: "50%", background: "#1e1e2a", border: "1.5px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, marginLeft: idx === 0 ? 0 : -4, zIndex: displayReactions.length - idx, position: "relative" }}>
//                               {REACTION_EMOJI[type] ?? "❤️"}
//                             </div>
//                           ))}
//                         </div>
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               );
//             })}
//             {replies.length > 2 && !showAllReplies && (
//               <button type="button" onClick={e => { e.stopPropagation(); setShowAllReplies(true); }} style={{ alignSelf: "flex-start", background: "none", border: "none", cursor: "pointer", fontSize: 10, fontWeight: 700, color: accentColor, padding: 0, marginTop: 1 }}>View all replies →</button>
//             )}
//           </div>
//         )}

//         <AnimatePresence>
//           {replyTo && (
//             <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden", marginBottom: 3 }}>
//               <div style={{ display: "flex", alignItems: "center", gap: 4, paddingLeft: 2 }}>
//                 <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>Replying to</span>
//                 <span style={{ fontSize: 9, fontWeight: 700, color: accentColor, background: `${accentColor}18`, border: `1px solid ${accentColor}40`, borderRadius: 999, padding: "1px 6px" }}>@{replyTo.authorUsername}</span>
//                 <button type="button" onClick={e => { e.stopPropagation(); setReplyTo(null); }} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", fontSize: 12, lineHeight: 1, padding: 0 }}>×</button>
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>

//         {/* <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 5px", borderRadius: 14, background: "rgba(255,255,255,0.04)", border: `1px solid ${accentColor}40` }}>
//           {currentAvatarUrl ? <img src={currentAvatarUrl} alt="" style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, objectFit: "cover" }} /> : <div style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg,#e91e8c,#ff6b35)" }} />}
//           <input ref={inputRef} type="text" value={commentText} onChange={e => setCommentText(e.target.value)} onKeyDown={e => { if (e.key === "Enter") handleSend(); }} placeholder={replyTo ? `…` : "Add a comment…"} style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#fff", fontSize: 11, fontWeight: 500 }} />
//           <button type="button" onClick={e => { e.stopPropagation(); onOpenFull(); }} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: 600, whiteSpace: "nowrap", padding: "0 2px" }}>All</button>
//           <motion.button whileTap={{ scale: 0.9 }} type="button" onClick={e => { e.stopPropagation(); handleSend(); }} disabled={!commentText.trim() || sending} style={{ background: commentText.trim() ? `linear-gradient(135deg,${accentColor},#ff6b35)` : "rgba(255,255,255,0.08)", border: "none", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: commentText.trim() ? "pointer" : "default", transition: "background 0.2s", flexShrink: 0 }}>
//             <Send size={12} color={commentText.trim() ? "#fff" : "rgba(255,255,255,0.3)"} />
//           </motion.button>
//         </div> */}
//         <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 5px", borderRadius: 14, background: "rgba(255,255,255,0.04)", border: `1px solid ${accentColor}40`, position: "relative" }}>
//           {mention.showMentionPopup && (
//             <MentionPopup
//               mentionUsers={mention.mentionUsers}
//               mentionIndex={mention.mentionIndex}
//               setMentionIndex={mention.setMentionIndex}
//               onSelect={(u) => mention.insertMention(u, commentText, setCommentText, inputRef)}
//             />
//           )}
//           {currentAvatarUrl ? <img src={currentAvatarUrl} alt="" style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, objectFit: "cover" }} /> : <div style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg,#e91e8c,#ff6b35)" }} />}
//           <input
//             ref={inputRef}
//             type="text"
//             value={commentText}
//             onChange={e => {
//               const value = e.target.value;
//               setCommentText(value);
//               mention.handleMentionInputChange(value, e.target.selectionStart || value.length);
//             }}
//             onKeyDown={e => {
//               if (mention.handleMentionKeyDown(e, commentText, setCommentText, inputRef)) return;
//               if (e.key === "Enter") handleSend();
//             }}
//             placeholder={replyTo ? `…` : "Add a comment…"}
//             style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#fff", fontSize: 11, fontWeight: 500 }}
//           />
//           <button type="button" onClick={e => { e.stopPropagation(); onOpenFull(); }} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: 600, whiteSpace: "nowrap", padding: "0 2px" }}>All</button>
//           <motion.button whileTap={{ scale: 0.9 }} type="button" onClick={e => { e.stopPropagation(); handleSend(); }} disabled={!commentText.trim() || sending} style={{ background: commentText.trim() ? `linear-gradient(135deg,${accentColor},#ff6b35)` : "rgba(255,255,255,0.08)", border: "none", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: commentText.trim() ? "pointer" : "default", transition: "background 0.2s", flexShrink: 0 }}>
//             <Send size={12} color={commentText.trim() ? "#fff" : "rgba(255,255,255,0.3)"} />
//           </motion.button>
//         </div>
//       </div>

//       <ReactionsDialog
//         postId={reactionsDialogCommentId ?? ""}
//         isOpen={reactionsDialogCommentId !== null}
//         onClose={() => setReactionsDialogCommentId(null)}
//         onFanProfile={onFanProfile}
//         roomId={roomId}
//         msgId={postId}
//         commentId={reactionsDialogCommentId ?? undefined}
//       />
//     </motion.div>
//   );
// }

// function QuizCard({ post, onToast, onPostClick, roomId, onFanProfile }: { post: any; onToast: (m: string) => void; onPostClick?: (post: any) => void; roomId?: string; onFanProfile?: (fan: any) => void; }) {
//   const [selectedOption, setSelectedOption] = useState<string | null>(post.quizUserAnswer ?? null);
//   const [revealedCorrect, setRevealedCorrect] = useState<string | null>(post.quizCorrectOption ?? null);
//   const [submitting, setSubmitting] = useState(false);
//   const [participants, setParticipants] = useState<number>(post.quizParticipants ?? 0);
//   const hasAnswered = selectedOption !== null;
//   const quizOptions: { label: string; text: string }[] = post.quizOptions ?? [];

//   const handleOptionClick = useCallback(async (label: string) => {
//     if (hasAnswered || submitting) return;
//     setSubmitting(true); setSelectedOption(label);
//     try {
//       const res = await axios.post(`/api/roar/posts/${post.id}/quiz-answer`, { selectedOption: label });
//       if (res.data?.success || res.data?.message === "Already answered") {
//         setRevealedCorrect(res.data.correctOption);
//         setParticipants(res.data.quizParticipants ?? participants + 1);
//         if (res.data.isCorrect) onToast("Correct! +2 points awarded");
//         else onToast(`Wrong! Correct answer was ${res.data.correctOption}`);
//       }
//     } catch { setSelectedOption(null); onToast("Failed to submit answer"); }
//     finally { setSubmitting(false); }
//   }, [hasAnswered, submitting, post.id, participants, onToast]);

//   const getOptionStyle = (label: string): React.CSSProperties => {
//     const isSelected = selectedOption === label;
//     const isCorrect = revealedCorrect === label;
//     const isWrong = hasAnswered && isSelected && revealedCorrect !== null && !isCorrect;
//     if (!hasAnswered) return { padding: "9px 12px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: 8, cursor: submitting ? "not-allowed" : "pointer", transition: "all 0.18s", opacity: submitting ? 0.6 : 1 };
//     if (isCorrect) return { padding: "9px 12px", borderRadius: 12, background: "rgba(0,232,198,0.12)", border: "1px solid rgba(0,232,198,0.4)", display: "flex", alignItems: "center", gap: 8, cursor: "default", transition: "all 0.18s" };
//     if (isWrong) return { padding: "9px 12px", borderRadius: 12, background: "rgba(244,67,54,0.1)", border: "1px solid rgba(244,67,54,0.35)", display: "flex", alignItems: "center", gap: 8, cursor: "default", transition: "all 0.18s" };
//     return { padding: "9px 12px", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 8, cursor: "default", opacity: 0.45, transition: "all 0.18s" };
//   };

//   const getLabelColor = (label: string) => {
//     if (!hasAnswered) return "#4A4A62";
//     if (revealedCorrect === label) return "#00E8C6";
//     if (selectedOption === label && revealedCorrect !== label) return "#F44336";
//     return "#4A4A62";
//   };

//   return (
//     <div style={{ padding: "12px 0", position: "relative", overflow: "hidden" }}>
//       <div style={{ display: "flex", gap: 4, marginBottom: 8, flexWrap: "wrap", alignItems: "center" }}>
//         <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.06em", padding: "2px 6px", borderRadius: 4, textTransform: "uppercase", background: "rgba(0,232,198,0.12)", color: "#00E8C6", border: "1px solid rgba(0,232,198,0.25)" }}>🧠 Quiz</span>
//         {hasAnswered && revealedCorrect && <span style={{ fontSize: 9, fontWeight: 700, marginLeft: "auto", color: selectedOption === revealedCorrect ? "#00E8C6" : "#F44336" }}>{selectedOption === revealedCorrect ? "✓ Correct!" : "✗ Wrong"}</span>}
//       </div>
//       <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10, cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); onFanProfile?.(post.fan); }}>
//         <AvatarWithBadge username={post.fan.username} badge={post.fan.badge} size="sm" avatarUrl={post.fan.avatarUrl} />
//         <div><p style={{ fontWeight: 700, fontSize: 11 }}>{post.fan.username}</p><p style={{ fontSize: 9, color: "var(--text-secondary)" }}>{post.timeAgo}</p></div>
//       </div>
//       <p style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.4, marginBottom: 12, color: "#F5F5FA", cursor: "pointer" }} onClick={() => onPostClick && onPostClick(post)}>{post.quizQuestion || post.text}</p>
//       {quizOptions.length > 0 && (
//         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12 }}>
//           {quizOptions.map((opt) => {
//             const isCorrect = hasAnswered && revealedCorrect === opt.label;
//             const isWrong = hasAnswered && selectedOption === opt.label && revealedCorrect !== opt.label && revealedCorrect !== null;
//             return (
//               <motion.div key={opt.label} whileTap={!hasAnswered && !submitting ? { scale: 0.97 } : {}} style={getOptionStyle(opt.label)} onClick={(e) => { e.stopPropagation(); handleOptionClick(opt.label); }}>
//                 <span style={{ fontSize: 10, fontWeight: 800, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.04em", color: getLabelColor(opt.label), minWidth: 12, flexShrink: 0 }}>{opt.label}</span>
//                 {hasAnswered && isCorrect && <CheckCircle2 size={11} color="#00E8C6" style={{ flexShrink: 0 }} />}
//                 {hasAnswered && isWrong && <XCircle size={11} color="#F44336" style={{ flexShrink: 0 }} />}
//                 <span style={{ fontSize: 11, fontWeight: 500, color: isCorrect ? "#00E8C6" : isWrong ? "#F44336" : hasAnswered ? "rgba(255,255,255,0.35)" : "#9494AD", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{opt.text || `Option ${opt.label}`}</span>
//               </motion.div>
//             );
//           })}
//         </div>
//       )}
//       {!hasAnswered && <p style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 6, fontStyle: "italic" }}>Tap an option to answer</p>}
//       <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
//         <Users size={11} color="#9494AD" />
//         <span style={{ fontSize: 10, fontWeight: 600, color: "#9494AD" }}>{participants > 0 ? `${participants.toLocaleString()} fan${participants === 1 ? "" : "s"} participated` : "Be the first to answer!"}</span>
//       </div>
//     </div>
//   );
// }

// function DollyCardHeader({ post, typeLabel, typeColor, typeIcon }: {
//   post: any; typeLabel: string; typeColor: string; typeIcon: React.ReactNode;
// }) {
//   return (
//     <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
//       <img src="/images/dollyavatar.png" alt="" style={{ width: 18, height: 18, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
//       <span style={{ fontWeight: 700, fontSize: 10, color: "#fff" }}>Dolly</span>
//       <span style={{ fontSize: 7, color: "rgba(255,255,255,0.48)" }}>{post.timeAgo}</span>
//       <span className={`text-[7px] font-extrabold px-1.5 py-0.5 rounded uppercase inline-flex items-center gap-1`} style={{ background: `${typeColor}22`, color: typeColor, border: `1px solid ${typeColor}40` }}>
//         {typeIcon} {typeLabel}
//       </span>
//     </div>
//   );
// }

// function TriviaCard({ post, onToast, onPostClick, roomId, onFanProfile }: {
//   post: any; onToast: (m: string) => void; onPostClick?: (post: any) => void; roomId?: string; onFanProfile?: (fan: any) => void;
// }) {
//   const questions: { question: string; options: { label: string; text?: string; isCorrect?: boolean }[] }[] = post.triviaQuestions ?? [];
//   const [answers, setAnswers] = useState<Record<number, { selected: string; correctOption?: string; isCorrect?: boolean }>>(() => {
//     const initial: Record<number, { selected: string; correctOption?: string; isCorrect?: boolean }> = {};
//     Object.entries(post.userTriviaAnswers ?? {}).forEach(([idx, val]: [string, any]) => {
//       initial[Number(idx)] = { selected: val.selectedOption ?? val.selected, correctOption: val.correctOption, isCorrect: val.isCorrect };
//     });
//     return initial;
//   });
//   const [submittingIdx, setSubmittingIdx] = useState<number | null>(null);
//   const isExpired = Boolean(post.closesAt && post.closesAt <= Date.now());

//   const handleAnswer = useCallback(async (qIndex: number, label: string) => {
//     if (answers[qIndex] || submittingIdx !== null || isExpired) return;
//     setSubmittingIdx(qIndex);
//     setAnswers(prev => ({ ...prev, [qIndex]: { selected: label } }));
//     try {
//       const res = await axios.post(`/api/roar/rooms/${roomId}/messages/${post.id}/trivia-answer`, {
//         questionIndex: qIndex, selectedOption: label,
//       });
//       const correctOption = res.data?.correctOption;
//       const isCorrect = res.data?.isCorrect;
//       setAnswers(prev => ({ ...prev, [qIndex]: { selected: label, correctOption, isCorrect } }));
//       onToast(isCorrect ? "Correct! Points awarded" : `Wrong! Correct answer was ${correctOption ?? "revealed"}`);
//     } catch (err: any) {
//       if (err?.response?.status !== 409) {
//         setAnswers(prev => { const next = { ...prev }; delete next[qIndex]; return next; });
//         onToast("Failed to submit answer");
//       }
//     } finally {
//       setSubmittingIdx(null);
//     }
//   }, [answers, submittingIdx, isExpired, roomId, post.id, onToast]);

//   return (
//     <div style={{ padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
//       <DollyCardHeader post={post} typeLabel="Trivia" typeColor="#E91E8C" typeIcon={<Brain size={8} />} />

//       {questions.map((q, qIndex) => {
//         const answered = answers[qIndex];
//         const hasAnswered = Boolean(answered);
//         return (
//           <div key={qIndex} style={{ marginBottom: qIndex < questions.length - 1 ? 12 : 3 }}>
//             <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 6, marginBottom: 6 }}>
//               <p style={{ fontWeight: 700, fontSize: 11, lineHeight: 1.3, margin: 0, color: "#fff", cursor: "pointer" }} onClick={() => onPostClick && onPostClick(post)}>
//                 {questions.length > 1 ? `${qIndex + 1}. ` : ""}{q.question}
//               </p>
//               {isExpired && !hasAnswered && (
//                 <span style={{ flexShrink: 0, fontSize: 8, fontWeight: 800, color: "#c084fc", background: "rgba(147,51,234,0.18)", border: "1px solid rgba(147,51,234,0.35)", borderRadius: 0, padding: "2px 6px", whiteSpace: "nowrap" }}>
//                   Time up!
//                 </span>
//               )}
//             </div>
//             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
//               {(() => {
//                 const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];
//                 const revealedCorrectLabel = q.options.find(o => o.isCorrect)?.label;
//                 const correctLabel = answered?.correctOption ?? revealedCorrectLabel;
//                 return q.options.map((opt, optIndex) => {
//                   const label = opt.label;
//                   const optionLetter = OPTION_LETTERS[optIndex] ?? String(optIndex + 1);
//                   const isSelected = answered?.selected === label;
//                   const isCorrect = hasAnswered && correctLabel === label;
//                   const isWrong = hasAnswered && isSelected && !!correctLabel && correctLabel !== label;
//                   const style: React.CSSProperties = isCorrect
//                     ? { background: "rgba(34,197,94,0.14)", border: "1.5px solid rgba(34,197,94,0.5)" }
//                     : isWrong
//                       ? { background: "rgba(244,67,54,0.1)", border: "1.5px solid rgba(244,67,54,0.4)" }
//                       : hasAnswered
//                         ? { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", opacity: 0.5 }
//                         : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" };
//                   const badgeStyle: React.CSSProperties = isCorrect
//                     ? { background: "#22c55e", color: "#0a0a10" }
//                     : { background: "rgba(147,51,234,0.25)", color: "#c084fc" };
//                   return (
//                     <motion.div key={label} whileTap={!hasAnswered && submittingIdx === null ? { scale: 0.96 } : {}}
//                       onClick={(e) => { e.stopPropagation(); handleAnswer(qIndex, label); }}
//                       style={{ ...style, borderRadius: 0, padding: "6px 8px", display: "flex", alignItems: "center", gap: 6, cursor: (hasAnswered || isExpired) ? "default" : "pointer", transition: "all 0.2s" }}
//                     >
//                       <span style={{ width: 16, height: 16, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 800, flexShrink: 0, ...badgeStyle }}>
//                         {isCorrect ? <CheckCircle2 size={10} /> : optionLetter}
//                       </span>
//                       <span style={{ fontSize: 10, fontWeight: 700, color: isCorrect ? "#4ade80" : isWrong ? "#f87171" : "#e5e5f0" }}>
//                         {opt.text || label}
//                       </span>
//                     </motion.div>
//                   );
//                 });
//               })()}
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }

// const abbrevOf = (name?: string) => (name || "").trim().slice(0, 2).toUpperCase() || "??";

// function BattleSwipeCard({
//   post, roomId, qIndex, playerA, playerB, initialVote, onToast,
// }: {
//   post: any; roomId?: string; qIndex: number;
//   playerA: { name: string; team?: string; image?: string };
//   playerB: { name: string; team?: string; image?: string };
//   initialVote?: "playerA" | "playerB";
//   onToast: (m: string) => void;
// }) {
//   const [votedSide, setVotedSide] = useState<"playerA" | "playerB" | undefined>(initialVote);
//   const [candidateIdx, setCandidateIdx] = useState(0);
//   const [dragX, setDragX] = useState(0);
//   const [flash, setFlash] = useState<"green" | "red" | null>(null);
//   const [submitting, setSubmitting] = useState(false);

//   const candidate = candidateIdx === 0 ? playerA : playerB;
//   const candidateSide: "playerA" | "playerB" = candidateIdx === 0 ? "playerA" : "playerB";

//   const vibrate = (pattern: number | number[]) => {
//     try {
//       if (typeof navigator !== "undefined" && "vibrate" in navigator) {
//         navigator.vibrate(pattern);
//       }
//     } catch { /* ignore */ }
//   };

//   const castVote = useCallback(async (side: "playerA" | "playerB") => {
//     if (submitting || votedSide) return;
//     setSubmitting(true);
//     setFlash("green");
//     setVotedSide(side);
//     vibrate(30);
//     try {
//       await axios.post(`/api/roar/rooms/${roomId}/messages/${post.id}/vote`, { vote: side, questionIndex: qIndex });
//     } catch (err: any) {
//       if (err?.response?.status !== 409) {
//         setVotedSide(undefined);
//         onToast("Failed to submit vote");
//       }
//     } finally {
//       setSubmitting(false);
//     }
//   }, [submitting, votedSide, roomId, post.id, qIndex, onToast]);

//   const reject = useCallback(() => {
//     setFlash("red");
//     vibrate(20);
//     setTimeout(() => {
//       setFlash(null);
//       setDragX(0);
//       setCandidateIdx(i => (i === 0 ? 1 : 0));
//     }, 180);
//   }, []);

//   const handleDragEnd = (_e: any, info: { offset: { x: number } }) => {
//     if (info.offset.x > 90) {
//       castVote(candidateSide);
//     } else if (info.offset.x < -90) {
//       reject();
//     } else {
//       setDragX(0);
//     }
//   };

//   if (votedSide) {
//     const winner = votedSide === "playerA" ? playerA : playerB;
//     const loser = votedSide === "playerA" ? playerB : playerA;
//     return (
//       <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 10, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)" }}>
//         <CheckCircle2 size={12} color="#22c55e" style={{ flexShrink: 0 }} />
//         <span style={{ fontSize: 10, color: "#e5e5f0" }}>
//           You picked <strong style={{ color: "#4ade80" }}>{winner.name}</strong> over {loser.name}
//         </span>
//       </div>
//     );
//   }

//   const overlayOpacity = Math.min(Math.abs(dragX) / 100, 0.4);
//   const overlayColor = dragX > 0 ? "34,197,94" : "244,67,54";

//   return (
//     <div>
//       <motion.div
//         drag="x"
//         dragConstraints={{ left: 0, right: 0 }}
//         dragElastic={0.7}
//         dragMomentum={false}
//         onDrag={(_e, info) => setDragX(info.offset.x)}
//         onDragEnd={handleDragEnd}
//         animate={flash ? { x: flash === "green" ? 260 : -260, opacity: 0 } : { x: 0, opacity: 1 }}
//         transition={{ duration: 0.22 }}
//         whileTap={{ scale: 0.98 }}
//         style={{
//           position: "relative", borderRadius: 12, padding: "12px 10px", textAlign: "center",
//           background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
//           display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
//           cursor: "grab",
//           touchAction: "none",
//           overflow: "hidden",
//           WebkitUserSelect: "none",
//           userSelect: "none",
//         }}
//       >
//         <div style={{ position: "absolute", inset: 0, background: `rgba(${overlayColor},${overlayOpacity})`, pointerEvents: "none", transition: "background 0.05s" }} />
//         {dragX > 30 && <span style={{ position: "absolute", top: 6, left: 8, fontSize: 9, fontWeight: 800, color: "#22c55e", border: "1.5px solid #22c55e", borderRadius: 4, padding: "1px 4px" }}>VOTE</span>}
//         {dragX < -30 && <span style={{ position: "absolute", top: 6, right: 8, fontSize: 9, fontWeight: 800, color: "#f87171", border: "1.5px solid #f87171", borderRadius: 4, padding: "1px 4px" }}>SKIP</span>}
//         {candidate.image
//           ? <img src={candidate.image} alt="" style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover" }} draggable={false} />
//           : <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{abbrevOf(candidate.team || candidate.name)}</span>}
//         <p style={{ margin: "3px 0 0", fontSize: 11, fontWeight: 700, color: "#fff" }}>{candidate.name}</p>
//         {candidate.team && <p style={{ margin: 0, fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{candidate.team}</p>}
//       </motion.div>
//       <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 6 }}>
//         <button type="button" onClick={reject} style={{ width: 26, height: 26, borderRadius: "50%", border: "1.5px solid rgba(244,67,54,0.4)", background: "rgba(244,67,54,0.1)", color: "#f87171", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>✕</button>
//         <button type="button" onClick={() => castVote(candidateSide)} style={{ width: 26, height: 26, borderRadius: "50%", border: "1.5px solid rgba(34,197,94,0.4)", background: "rgba(34,197,94,0.1)", color: "#4ade80", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>✓</button>
//       </div>
//       <p style={{ fontSize: 8, color: "var(--text-muted)", fontStyle: "italic", textAlign: "center", marginTop: 4 }}>
//         Swipe right to vote {candidate.name} · swipe left to see {candidateIdx === 0 ? playerB.name : playerA.name}
//       </p>
//     </div>
//   );
// }

// function BattleCard({ post, onToast, onPostClick, roomId, onFanProfile }: {
//   post: any; onToast: (m: string) => void; onPostClick?: (post: any) => void; roomId?: string; onFanProfile?: (fan: any) => void;
// }) {
//   const questions: { question?: string; playerA: { name: string; team?: string; image?: string }; playerB: { name: string; team?: string; image?: string } }[] = post.battleQuestions ?? [];
//   const votesByQuestion: Record<number, "playerA" | "playerB"> = post.userPredictionVotes ?? {};
//   const isExpired = Boolean(post.closesAt && post.closesAt <= Date.now());

//   return (
//     <div style={{ padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
//       <DollyCardHeader post={post} typeLabel="Battle" typeColor="#f97316" typeIcon={<Zap size={8} />} />

//       {questions.map((q, qIndex) => {
//         const alreadyVoted = votesByQuestion[qIndex];
//         return (
//           <div key={qIndex} style={{ marginBottom: qIndex < questions.length - 1 ? 12 : 3 }}>
//             {q.question && (
//               <p style={{ fontWeight: 600, fontSize: 10, lineHeight: 1.3, marginBottom: 6, color: "rgba(255,255,255,0.75)", cursor: "pointer" }} onClick={() => onPostClick && onPostClick(post)}>
//                 {q.question}
//               </p>
//             )}
//             {isExpired && !alreadyVoted ? (
//               <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontStyle: "italic" }}>Voting closed</p>
//             ) : (
//               <BattleSwipeCard
//                 post={post} roomId={roomId} qIndex={qIndex}
//                 playerA={q.playerA} playerB={q.playerB}
//                 initialVote={alreadyVoted}
//                 onToast={onToast}
//               />
//             )}
//           </div>
//         );
//       })}
//     </div>
//   );
// }

// function WaveInlineContent({
//   post, liveCount, onReact, localReactions, onCelebrate,
// }: {
//   post: any;
//   liveCount: number;
//   onReact: (msgId: string, reaction: Reaction | null) => Promise<void>;
//   localReactions: Record<string, { reaction: Reaction | null; heartCount: number }>;
//   onCelebrate: () => void;
// }) {
//   const lo = localReactions[post.id];
//   const joinedCount = lo !== undefined ? lo.heartCount : (post.heartCount ?? 0);
//   const joined = (lo !== undefined ? lo.reaction : post.userReaction) != null;
//   const required = Math.max(6, Math.ceil((liveCount || 3) * 0.6));
//   const pct = Math.min(100, Math.round((joinedCount / required) * 100));

//   const [hasFired, setHasFired] = useState(joinedCount >= required);
//   const firedRef = useRef(hasFired);

//   useEffect(() => {
//     if (!firedRef.current && joinedCount >= required) {
//       firedRef.current = true;
//       setHasFired(true);
//       onCelebrate();
//     }
//   }, [joinedCount, required, onCelebrate]);

//   const handleJoin = () => {
//     if (joined || hasFired) return;
//     onReact(post.id, "fire");
//   };

//   if (hasFired) {
//     return (
//       <div style={{ marginTop: 3, marginBottom: 3 }}>
//         <p style={{ margin: 0, fontWeight: 900, fontSize: 13, color: "#fff", letterSpacing: "0.06em", textTransform: "uppercase", textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
//           🌊 WAVE!
//         </p>
//         <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4, textAlign: "center" }}>
//           {joinedCount} fans waved together 👀
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div style={{ marginTop: 3 }}>
//       <p className="leading-snug text-white" style={{ fontSize: 10, marginBottom: 1 }}>
//         🌊 Stadium Wave started! Join in 🙌
//       </p>
//       <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 1 }}>
//         <div style={{ flex: 1, height: 5, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
//           <motion.div
//             animate={{ width: `${pct}%` }}
//             transition={{ duration: 0.3 }}
//             style={{ height: "100%", background: "linear-gradient(90deg,#38bdf8,#4fd1ff)" }}
//           />
//         </div>
//         <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.6)", flexShrink: 0 }}>
//           {joinedCount}/{required} · {pct}%
//         </span>
//       </div>
//       <motion.button
//         whileTap={!joined ? { scale: 0.97 } : {}}
//         onClick={(e) => { e.stopPropagation(); handleJoin(); }}
//         disabled={joined}
//         style={{
//           width: "100%", padding: "1px", borderRadius: 999, border: "none",
//           background: joined ? "rgba(56,189,248,0.15)" : "linear-gradient(90deg,#0ea5e9,#38bdf8)",
//           color: joined ? "#4fd1ff" : "#fff", fontWeight: 800, fontSize: 10,
//           cursor: joined ? "default" : "pointer",
//         }}
//       >
//         {joined ? "✓ You joined the wave" : "🙌 Join the Wave!"}
//       </motion.button>
//     </div>
//   );
// }

// function useVisibilityInterval(callback: () => void, delay: number) {
//   const savedCallback = useRef(callback);
//   useEffect(() => { savedCallback.current = callback; }, [callback]);
//   useEffect(() => {
//     let id: ReturnType<typeof setInterval>;
//     const start = () => { id = setInterval(() => { if (!document.hidden) savedCallback.current(); }, delay); };
//     const handleVisibility = () => { clearInterval(id); if (!document.hidden) { savedCallback.current(); start(); } };
//     start();
//     document.addEventListener("visibilitychange", handleVisibility);
//     return () => { clearInterval(id); document.removeEventListener("visibilitychange", handleVisibility); };
//   }, [delay]);
// }

// type ShareableRoarPost = { id?: string | number; text?: string; authorUsername?: string; fan?: { username?: string }; };

// function displayUsername(raw: string | undefined | null): string {
//   if (!raw) return "RoarUser";
//   const trimmed = raw.trim();
//   if (!trimmed) return "RoarUser";
//   if (!trimmed.includes("_")) return trimmed;
//   const spaced = trimmed.replace(/_+/g, " ").replace(/\s+/g, " ").trim();
//   if (!spaced) return "RoarUser";
//   return spaced.split(" ").map((word) => (/[A-Z]/.test(word) ? word : word.charAt(0).toUpperCase() + word.slice(1))).join(" ");
// }

// const buildRoarPostShareUrl = (post: ShareableRoarPost) => {
//   if (typeof window === "undefined") return "";
//   const targetUrl = new URL(`${window.location.origin}/MainModules/ROAR`);
//   if (post?.id) targetUrl.searchParams.set("post", String(post.id));
//   return targetUrl.toString();
// };

// const buildRoarPostShareText = (post: ShareableRoarPost) => {
//   const shareUrl = buildRoarPostShareUrl(post);
//   const author = displayUsername(post?.fan?.username || post?.authorUsername || "a Sportsfan");
//   return [`Check out this ROAR post by ${author}`, post?.text || "Join the conversation on Sportsfan ROAR.", `View post: ${shareUrl}`].filter(Boolean).join("\n");
// };

// const CELEBRATION_EMOJIS_MAP: Record<string, string[]> = {
//   six: ["💪", "6️⃣", "🔥", "⚡", "🏏", "🎉", "💪", "6️⃣", "🔥", "✨", "🎊", "⚡"],
//   wicket: ["🎯", "💥", "🏏", "⚡", "🎊", "🔥", "🎯", "💥", "🏏", "✨", "🎉", "⚡"],
//   four: ["🏏", "⚡", "💫", "🔥", "4️⃣", "⚡", "🏏", "💫", "🔥", "✨"],
//   catch: ["💥", "🏏", "⚡", "🔥", "💥", "🏏", "✨"],
//   goal: ["⚽", "🎉", "🔥", "🥅", "✨", "🎊", "⚡", "⚽", "🎉", "🔥"],
//   redcard: ["⚽", "🎉", "🔥", "🥅", "✨", "🎊", "⚡", "⚽", "🎉", "🔥"],
//   yellowcard: ["⚽", "🎉", "🔥", "🥅", "✨", "🎊", "⚡", "⚽", "🎉", "🔥"],
//   frango: ["⚽", "🎉", "🔥", "🥅", "✨", "🎊", "⚡", "⚽", "🎉", "🔥"],
//   wave: ["🙌", "👋", "🌊", "✨", "🎉", "👏", "🙌", "👋", "🌊", "✨", "🎉", "👏"],
// };

// function CelebrationBurst({ memTag, onDone }: { memTag: string; onDone: () => void }) {
//   const particles = React.useMemo(() => {
//     const emojis = CELEBRATION_EMOJIS_MAP[memTag] ?? ["🎉", "🔥", "⚡"];

//     return Array.from({ length: 80 }).map(() => ({
//       emoji: emojis[Math.floor(Math.random() * emojis.length)],
//       x: (Math.random() - 0.5) * window.innerWidth * 1.3,
//       y: -(window.innerHeight * (0.5 + Math.random() * 0.5)),
//       rotate: Math.random() * 1080 - 540,
//       size: 20 + Math.random() * 26,
//       duration: 2.8 + Math.random() * 1.2,
//       delay: Math.random() * 0.8,
//     }));
//   }, [memTag]);

//   useEffect(() => {
//     const t = setTimeout(onDone, 1500);
//     return () => clearTimeout(t);
//   }, [onDone]);

//   return (
//     <div
//       style={{
//         position: "fixed",
//         inset: 0,
//         pointerEvents: "none",
//         zIndex: 9999,
//         overflow: "hidden",
//       }}
//     >
//       {particles.map((pt, i) => (
//         <motion.div
//           key={i}
//           initial={{
//             x: 0,
//             y: 0,
//             scale: 0,
//             opacity: 1,
//             rotate: 0,
//           }}
//           animate={{
//             x: [0, pt.x * 0.3, pt.x],
//             y: [0, pt.y * 0.4, pt.y],
//             scale: [0, 1.2, 1],
//             opacity: [1, 1, 0],
//             rotate: [0, pt.rotate],
//           }}
//           transition={{
//             duration: pt.duration,
//             delay: pt.delay,
//             ease: "easeOut",
//             times: [0, 0.35, 1],
//           }}
//           style={{
//             position: "absolute",
//             left: "50%",
//             bottom: 30,
//             marginLeft: -12,
//             fontSize: pt.size,
//             lineHeight: 1,
//           }}
//         >
//           {pt.emoji}
//         </motion.div>
//       ))}
//     </div>
//   );
// }

// function WaveCelebrationBurst({ onDone }: { onDone: () => void }) {
//   const COLUMNS = 22;
//   const ROWS = 4;
//   const ROW_EMOJIS = ["🙌", "🎉", "👐", "🙌"];
//   const audioRef = useRef<HTMLAudioElement | null>(null);

//   const items = React.useMemo(() => {
//     const arr: { row: number; col: number; delay: number; emoji: string }[] = [];
//     for (let row = 0; row < ROWS; row++) {
//       for (let col = 0; col < COLUMNS; col++) {
//         arr.push({
//           row,
//           col,
//           delay: col * 0.055 + row * 0.12,
//           emoji: ROW_EMOJIS[row % ROW_EMOJIS.length],
//         });
//       }
//     }
//     return arr;
//   }, []);

//   useEffect(() => {
//     audioRef.current?.play().catch(() => { });
//     const totalMs = COLUMNS * 55 + ROWS * 120 + 900;
//     const t = setTimeout(onDone, totalMs);
//     return () => clearTimeout(t);
//   }, [onDone]);

//   return (
//     <div
//       style={{
//         position: "fixed",
//         left: 0, right: 0,
//         bottom: "12vh",
//         height: 260,
//         pointerEvents: "none",
//         zIndex: 9999,
//         display: "flex",
//         flexDirection: "column",
//         justifyContent: "flex-end",
//         gap: 6,
//       }}
//     >
//       <audio ref={audioRef} src="/sounds/wave.mp3" preload="auto" />
//       {Array.from({ length: ROWS }).map((_, row) => (
//         <div
//           key={row}
//           style={{
//             display: "flex",
//             alignItems: "flex-end",
//             justifyContent: "space-evenly",
//             height: 55,
//           }}
//         >
//           {items
//             .filter((it) => it.row === row)
//             .map((it, i) => (
//               <motion.div
//                 key={i}
//                 initial={{ y: 0, opacity: 0.35, scale: 0.8 }}
//                 animate={{
//                   y: [0, -50, 0],
//                   opacity: [0.35, 1, 0.35],
//                   scale: [0.8, 1.1, 0.8],
//                 }}
//                 transition={{
//                   duration: 0.75,
//                   delay: it.delay,
//                   ease: "easeInOut",
//                   times: [0, 0.5, 1],
//                 }}
//                 style={{ fontSize: 26, lineHeight: 1 }}
//               >
//                 {it.emoji}
//               </motion.div>
//             ))}
//         </div>
//       ))}
//     </div>
//   );
// }

// export default function DiscussionRoom({
//   roomSports,
//   onBack, onToast, roomId, roomName, onPostClick, onCompose,
//   fanCount = 312, score, scoreSubtitle, currentAvatarUrl, currentUserId: propCurrentUserId, onRegisterRefresh, onRegisterReplyUpdate,
//   onFanProfile, watchAlongRoomId
// }: Props) {
//   const router = useRouter();
//   const phog = usePostHog();
//   const [posts, setPosts] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [input, setInput] = useState("");
//   const [showEmojiPicker, setShowEmojiPicker] = useState(false);
//   const [showQuickCompose, setShowQuickCompose] = useState(false);
//   const emojiPickerRef = useRef<HTMLDivElement>(null);
//   const [mode, setMode] = useState<"post" | "debate" | "prediction" | "hottake" | "raw_reactions">("post");
//   const [uploading, setUploading] = useState(false);
//   const [attachedUrl, setAttachedUrl] = useState<string | null>(null);
//   const [attachedType, setAttachedType] = useState<"image" | "video" | null>(null);
//   const [userUsername, setUserUsername] = useState("RoarUser");
//   const [userAvatarUrl, setUserAvatarUrl] = useState<string | undefined>(currentAvatarUrl);
//   const [selectedActionId, setSelectedActionId] = useState("post");
//   const dropdownRef = useRef<HTMLDivElement>(null);
//   const dollyActiveRoomIdRef = useRef<string | undefined>(roomId);
//   const dollyFetchTokenRef = useRef<symbol | null>(null);
//   const [liveCount, setLiveCount] = useState<number>(fanCount ?? 0);
//   const [totalJoinCount, setTotalJoinCount] = useState<number>(0);
//   const [sharePost, setSharePost] = useState<ShareableRoarPost | null>(null);
//   const [copied, setCopied] = useState(false);
//   const { userProfile } = useUserProfile();
//   const [roomCounts, setRoomCounts] = useState({ post: 0, debate: 0, prediction: 0, trivia: 0, battle: 0 });
//   const [activeFilter, setActiveFilter] = useState<"all" | "post" | "debate" | "prediction" | "trivia" | "battle">("all");
//   const [dollyHistory, setDollyHistory] = useState<DollyHistorySession[]>([]);
//   const [dollyHistoryLoading, setDollyHistoryLoading] = useState(false);
//   const [dollyActiveRoomId, setDollyActiveRoomId] = useState<string | undefined>(roomId);
//   const [dollyActiveRoomName, setDollyActiveRoomName] = useState<string | undefined>(roomName);
//   const [dollyRepliesLoading, setDollyRepliesLoading] = useState(false);
//   const [votersMsgId, setVotersMsgId] = useState<string | null>(null);
//   const [votersMode, setVotersMode] = useState<"debate" | "prediction">("prediction");
//   const lastLocalReactAtRef = useRef<Record<string, number>>({});
//   const mainInputRef = useRef<HTMLInputElement>(null);
//   const mention = useMentionAutocomplete(userUsername);
//   // Tracks uids we've already seen in this room so we only toast on *new* arrivals,
//   // not on the initial fan list when we ourselves join.
//   const knownFanUidsRef = useRef<Set<string> | null>(null);
//   const presenceRequestSeqRef = useRef(0);
//   const presenceBootstrapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
//   const [joinToast, setJoinToast] = useState<{ username: string } | null>(null);
//   const joinToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
//   const joinToastQueueRef = useRef<string[]>([]);
//   const joinToastActiveRef = useRef(false);

//   const showNextJoinToast = useCallback(() => {
//     if (joinToastActiveRef.current) return;
//     const next = joinToastQueueRef.current.shift();
//     if (!next) return;
//     joinToastActiveRef.current = true;
//     setJoinToast({ username: next });
//     if (joinToastTimerRef.current) clearTimeout(joinToastTimerRef.current);
//     joinToastTimerRef.current = setTimeout(() => {
//       setJoinToast(null);
//       joinToastActiveRef.current = false;
//       showNextJoinToast(); // show the next queued joiner, if any
//     }, 2800);
//   }, []);

//   const queueJoinToast = useCallback((username: string) => {
//     joinToastQueueRef.current.push(username);
//     showNextJoinToast();
//   }, [showNextJoinToast]);

//   // Diff the latest fans list against what we've already seen for this room.
//   // First call just establishes the baseline silently (so you don't get a
//   // flood of "X has joined" for everyone already in the room when you arrive).

//   const SOUND_FILES: Record<"join" | "comment" | "post", string> = {
//     join: "/sounds/join.mp3",
//     comment: "/sounds/comment.mp3",
//     post: "/sounds/post.mp3",
//   };

//   const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
//     try {
//       const stored = localStorage.getItem("roar_sound_enabled");
//       return stored === null ? true : stored === "true";
//     } catch { return true; }
//   });

//   const soundEnabledRef = useRef(soundEnabled);
//   useEffect(() => { soundEnabledRef.current = soundEnabled; }, [soundEnabled]);

//   const audioCache = useRef<Partial<Record<keyof typeof SOUND_FILES, HTMLAudioElement>>>({});

//   const playSound = useCallback((key: keyof typeof SOUND_FILES) => {
//     if (!soundEnabledRef.current) return;
//     try {
//       let audio = audioCache.current[key];
//       if (!audio) {
//         audio = new Audio(SOUND_FILES[key]);
//         audio.volume = 0.5;
//         audioCache.current[key] = audio;
//       }

//       audio.currentTime = 0;
//       audio.play().catch(() => { });
//     } catch { /* ignore */ }
//   }, []);

//   const toggleSound = useCallback(() => {
//     setSoundEnabled(prev => {
//       const next = !prev;
//       try { localStorage.setItem("roar_sound_enabled", String(next)); } catch { }
//       return next;
//     });
//   }, []);
//   useEffect(() => {
//     dollyActiveRoomIdRef.current = dollyActiveRoomId;
//   }, [dollyActiveRoomId]);

//   useEffect(() => {
//     if (phog && roomId) {
//       phog.capture("enter_room", {
//         room_id: roomId,
//         room_name: roomName || ""
//       });
//     }
//   }, [phog, roomId, roomName]);
//   const votingInProgressRef = useRef<Set<string>>(new Set());
//   const [pinnedPost, setPinnedPost] = useState<{
//     msgId: string; text: string; authorUsername: string; type: string; pinnedAt: number;
//   } | null>(null);
//   const [openMenuPostId, setOpenMenuPostId] = useState<string | null>(null);
//   const menuRef = useRef<HTMLDivElement>(null);
//   const currentUserId = propCurrentUserId || userProfile?.actualUserId;
//   const currentUserIdCandidates = [
//     currentUserId,
//     userProfile?.actualUserId,
//     (userProfile as { userId?: string })?.userId,
//     (userProfile as { uid?: string })?.uid,
//     (userProfile as { email?: string })?.email,
//   ].filter(Boolean).map(String);

//   const isCurrentUserAuthor = (post: { authorUid?: unknown; authorEmail?: unknown; fan?: { authorUid?: unknown } }) => {
//     const authorCandidates = [post.authorUid, post.fan?.authorUid, post.authorEmail].filter(Boolean).map(String);
//     return authorCandidates.some(id => currentUserIdCandidates.includes(id));
//   };

//   const detectNewJoiners = useCallback((fans: { uid: string; username: string }[]) => {
//     if (!knownFanUidsRef.current) {
//       knownFanUidsRef.current = new Set(fans.map(f => f.uid));
//       return;
//     }
//     const seen = knownFanUidsRef.current;
//     const newcomers = fans.filter(f => f.uid !== currentUserId && !seen.has(f.uid));
//     seen.forEach(() => { }); // no-op, just keeping structure clear
//     fans.forEach(f => seen.add(f.uid));
//     if (newcomers.length > 0) playSound("join");
//     newcomers.forEach(f => queueJoinToast(displayUsername(f.username)));
//   }, [currentUserId, queueJoinToast, playSound]);

//   // NEW — single function that both the header state AND the toast derive from
//   const applyPresenceResponse = useCallback((seq: number, data: any) => {
//     if (seq !== presenceRequestSeqRef.current) return; // drop stale/out-of-order response
//     const fans = data.fans ?? [];
//     setActiveFans(fans);
//     setLiveCount(data.fanCount ?? 0);
//     if (data.totalJoinCount !== undefined) setTotalJoinCount(data.totalJoinCount);
//     setPinnedPost(data.pinnedPost ?? null);
//     detectNewJoiners(fans);
//   }, [detectNewJoiners]);

//   const latestCreatedAtRef = useRef<number | null>(null);
//   const sendingRef = useRef(false);
//   const [isSending, setIsSending] = useState(false);
//   const [resolvingRoomPredictionId, setResolvingRoomPredictionId] = useState<string | null>(null);
//   const [openInlinePostId, setOpenInlinePostId] = useState<string | null>(null);
//   const [explicitlyClosedPostIds, setExplicitlyClosedPostIds] = useState<Set<string>>(new Set());
//   const [notifToast, setNotifToast] = useState<{ message: string; type: "like" | "comment"; } | null>(null);
//   const notifToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
//   const [activeFans, setActiveFans] = useState<{ uid: string; username: string; avatarUrl?: string | null; badge?: string | null }[]>([]);
//   const [activeFansOpen, setActiveFansOpen] = useState(false);
//   const [localReactions, setLocalReactions] = useState<Record<string, { reaction: Reaction | null; heartCount: number }>>({});
//   const localReactionsRef = useRef<Record<string, { reaction: Reaction | null; heartCount: number }>>({});
//   const pendingReactRef = useRef<Record<string, boolean>>({});
//   const [reactionsMsgId, setReactionsMsgId] = useState<string | null>(null);
//   useEffect(() => { localReactionsRef.current = localReactions; }, [localReactions]);

//   const [newlyPostedIds, setNewlyPostedIds] = useState<Set<string>>(new Set());
//   const [videoEndedIds, setVideoEndedIds] = useState<Set<string>>(new Set());
//   const [celebration, setCelebration] = useState<{ memTag: string } | null>(null);

//   const [dollyOpen, setDollyOpen] = useState(false);
//   const [dollyQuestion, setDollyQuestion] = useState("");
//   const [dollyAsking, setDollyAsking] = useState(false);
//   const [dollyReplies, setDollyReplies] = useState<{ id: string; question: string; answer: string; createdAt: number }[]>([]);
//   const [dollyLoaded, setDollyLoaded] = useState(false);
//   const prevDollyCountRef = useRef(0);

//   const listRef = useRef<HTMLDivElement>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const [morePosts, setMorePosts] = useState<any[]>([]);
//   const [hasMoreMsgs, setHasMoreMsgs] = useState(true);
//   const [loadingMoreMsgs, setLoadingMoreMsgs] = useState(false);
//   const loadingMoreMsgsRef = useRef(false);
//   const sentinelRef = useRef<HTMLDivElement | null>(null);
//   const topReactionsCache = useRef<Record<string, string[]>>({});
//   const [topReactionsMap, setTopReactionsMap] = useState<Record<string, string[]>>({});

//   const fetchTopReactions = useCallback(async (msgId: string) => {
//     if (topReactionsCache.current[msgId] !== undefined) return;
//     topReactionsCache.current[msgId] = [];
//     try {
//       const url = `/api/roar/posts/${msgId}/reactions${roomId ? `?roomId=${encodeURIComponent(roomId)}` : ""}`;
//       const res = await axios.get(url);
//       const reactors: { reaction: string }[] = res.data?.reactors ?? [];
//       const counts: Record<string, number> = {};
//       reactors.forEach(r => { counts[r.reaction] = (counts[r.reaction] ?? 0) + 1; });
//       const top = Object.entries(counts).sort(([, a], [, b]) => b - a).slice(0, 3).map(([type]) => type);
//       topReactionsCache.current[msgId] = top;
//       setTopReactionsMap(prev => ({ ...prev, [msgId]: top }));
//     } catch { topReactionsCache.current[msgId] = []; }
//   }, [roomId]);



//   const mapMessage = useCallback((m: any, existing?: any) => {
//     const isPending = pendingReactRef.current[m.msgId];
//     return {
//       id: m.msgId, authorUid: m.authorUid, authorEmail: m.authorEmail,
//       fan: { username: displayUsername(m.authorUsername), authorUid: m.authorUid, badge: m.authorBadge, avatarUrl: m.authorUid === currentUserId ? (userAvatarUrl || m.authorAvatarUrl || m.avatarUrl) : (m.authorAvatarUrl || m.avatarUrl) },
//       text: m.text,
//       fireCount: m.fireCount ?? 0, heartCount: m.heartCount ?? 0, mindblownCount: m.mindblownCount ?? 0,
//       goatCount: m.goatCount ?? 0, clapCount: m.clapCount ?? 0, nochanceCount: m.noChanceCount ?? 0,
//       userReaction: isPending ? (existing?.userReaction ?? null) : (m.userReaction ?? null),
//       replyCount: Math.max(m.replyCount ?? 0, existing?.replyCount ?? 0),
//       agreeCount: m.agreeCount ?? 0, disagreeCount: m.disagreeCount ?? 0,
//       userVote: (existing?.userVote && !m.userVote) ? existing.userVote : (m.userVote ?? existing?.userVote ?? null),
//       sideA: m.sideA ?? null, sideB: m.sideB ?? null,
//       predictionOptions: Array.isArray(m.predictionOptions) ? m.predictionOptions : [m.sideA, m.sideB].filter(Boolean),
//       predictionOptionCounts: m.predictionOptionCounts ?? {},
//       closesAt: m.closesAt ?? null, closedAt: m.closedAt ?? null,
//       resolvedAt: m.resolvedAt ?? null, correctVote: m.correctVote ?? null,
//       accuracyAwarded: m.accuracyAwarded ?? false,
//       timeAgo: new Date(m.createdAt).toLocaleDateString([], { month: "short", day: "numeric" }) + " · " + new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
//       createdAt: m.createdAt, type: m.type, mediaUrls: m.mediaUrls,
//       quizQuestion: m.quizQuestion, quizOptions: m.quizOptions, quizCorrectOption: m.quizCorrectOption,
//       quizUserAnswer: m.quizUserAnswer ?? null, quizTimer: m.quizTimer, quizPoints: m.quizPoints,
//       quizParticipants: m.quizParticipants ?? 0, memGifUrl: m.memGifUrl ?? null, memTag: m.memTag ?? null,
//       questions: (() => {
//         const q = m.questions;
//         if (Array.isArray(q)) return q;
//         if (typeof q === "string") {
//           try { return JSON.parse(q); } catch { return []; }
//         }
//         return [];
//       })(),
//       matchTitle: m.matchTitle ?? null,
//       triviaQuestions: Array.isArray(m.triviaQuestions) ? m.triviaQuestions : [],
//       userTriviaAnswers: m.userTriviaAnswers ?? {},
//       matchStartAt: m.matchStartAt ?? null,
//       matchEndAt: m.matchEndAt ?? null,
//       triviaParticipants: m.triviaParticipants ?? {},
//       battleQuestions: Array.isArray(m.battleQuestions) ? m.battleQuestions : [],
//       battleVoteCounts: m.battleVoteCounts ?? {},
//       userPredictionVotes: m.userPredictionVotes ?? {},
//     };
//   }, [currentUserId, userAvatarUrl]);

//   const loadMoreMsgs = useCallback(async () => {
//     if (!roomId || loadingMoreMsgsRef.current || !hasMoreMsgs) return;
//     const combined = [...posts, ...morePosts];
//     if (combined.length === 0) return;
//     const oldestCreatedAt = combined.reduce((min, p) => (p.createdAt < min ? p.createdAt : min), combined[0].createdAt);
//     loadingMoreMsgsRef.current = true; setLoadingMoreMsgs(true);
//     try {
//       const res = await axios.get(`/api/roar/rooms/${roomId}/messages`, { params: { limit: LOAD_MORE_PAGE_SIZE, lastCreatedAt: oldestCreatedAt } });
//       if (res.data?.success) {
//         const newMsgs: any[] = res.data.messages ?? [];
//         setMorePosts(prev => {
//           const seenIds = new Set([...posts, ...prev].map(p => p.id ?? p.msgId));
//           const fresh = newMsgs.filter(m => !seenIds.has(m.msgId)).map(m => mapMessage(m));
//           return [...fresh, ...prev];
//         });
//         setHasMoreMsgs(Boolean(res.data.pagination?.hasMore));
//       } else { setHasMoreMsgs(false); }
//     } catch (e) { console.error("Failed to load more messages:", e); }
//     finally { loadingMoreMsgsRef.current = false; setLoadingMoreMsgs(false); }
//   }, [roomId, hasMoreMsgs, posts, morePosts, mapMessage]);

//   const [postCooldown, setPostCooldown] = useState(0);
//   const cooldownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

//   const startPostCooldown = useCallback(() => {
//     setPostCooldown(10);
//     if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
//     cooldownIntervalRef.current = setInterval(() => {
//       setPostCooldown(prev => {
//         if (prev <= 1) {
//           if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);
//   }, []);

//   useEffect(() => () => { if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current); }, []);

//   useEffect(() => {
//     const sentinel = sentinelRef.current;
//     if (!sentinel) return;
//     const observer = new IntersectionObserver((entries) => { if (entries[0]?.isIntersecting) loadMoreMsgs(); }, { root: listRef.current, rootMargin: "200px 0px 0px 0px", threshold: 0 });
//     observer.observe(sentinel);
//     return () => observer.disconnect();
//   }, [loadMoreMsgs]);

//   const openShareDialog = (post: ShareableRoarPost) => { setSharePost(post); setCopied(false); };
//   const closeShareDialog = () => { setSharePost(null); setCopied(false); };
//   const copyToClipboard = async (text: string) => {
//     try { await navigator.clipboard.writeText(text); return true; }
//     catch {
//       try {
//         const el = document.createElement("textarea"); el.value = text; el.style.position = "fixed"; el.style.opacity = "0";
//         document.body.appendChild(el); el.focus(); el.select();
//         const ok = document.execCommand("copy"); document.body.removeChild(el); return ok;
//       } catch { return false; }
//     }
//   };
//   const handleShareToWhatsApp = () => { if (!sharePost) return; window.open(`https://wa.me/?text=${encodeURIComponent(buildRoarPostShareText(sharePost))}`, "_blank"); };
//   const handleShareToThreads = () => { if (!sharePost) return; window.open(`https://www.threads.net/intent/post?text=${encodeURIComponent(buildRoarPostShareText(sharePost))}`, "_blank"); };
//   const handleShareToInstagram = async () => { if (!sharePost) return; await copyToClipboard(buildRoarPostShareText(sharePost)); setCopied(true); setTimeout(() => setCopied(false), 1600); window.open("https://www.instagram.com/", "_blank"); };
//   const handleShareToLinkedIn = () => { if (!sharePost) return; window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(buildRoarPostShareUrl(sharePost))}`, "_blank"); };
//   const handleShareToX = () => { if (!sharePost) return; window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(buildRoarPostShareText(sharePost))}`, "_blank"); };
//   const handleCopyLink = async () => {
//     if (!sharePost) return;
//     const ok = await copyToClipboard(buildRoarPostShareText(sharePost));
//     if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1600); onToast("Link copied to clipboard!"); }
//   };

//   const shareButtons = (size: string) => (
//     <>
//       {[
//         { handler: handleShareToWhatsApp, src: "/images/share_whatsapp.png", alt: "WhatsApp" },
//         { handler: handleShareToThreads, src: "/images/share_thread.png", alt: "Threads" },
//         { handler: handleShareToInstagram, src: "/images/share_insta.png", alt: "Instagram" },
//         { handler: handleShareToLinkedIn, src: "/images/Share_linkedin.png", alt: "LinkedIn" },
//         { handler: handleShareToX, src: "/images/Share_X.png", alt: "X" },
//         { handler: handleCopyLink, src: "/images/share_copy_link.png", alt: "Copy" },
//       ].map(({ handler, src, alt }) => (
//         <button key={alt} onClick={handler} className={`${size} shrink-0 rounded-full overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center`} type="button">
//           <img src={src} alt={alt} width={36} height={36} className="w-full h-full object-cover rounded-full" />
//         </button>
//       ))}
//     </>
//   );

//   const loadDollyHistory = useCallback(async () => {
//     setDollyHistoryLoading(true);
//     try {
//       const res = await axios.get("/api/roar/dolly/rooms");
//       const rooms: any[] = res.data?.rooms ?? [];
//       const mapped: DollyHistorySession[] = rooms
//         .filter(r => r.roomId !== roomId)
//         .map(r => ({
//           roomId: r.roomId,
//           title: r.title,
//           subtitle: r.lastQuestion || "No questions yet",
//           dateLabel: new Date(r.lastAskedAt).toLocaleDateString([], { month: "short", day: "numeric" }),
//           sport: r.sport,
//         }));
//       setDollyHistory([
//         { roomId: roomId!, title: roomName || "This match", subtitle: "", dateLabel: "Today", isLive: true, sport: roomSports },
//         ...mapped,
//       ]);
//     } catch (err) {
//       console.error("[dolly] Failed to load room history:", err);
//       onToast?.("Couldn't load chat history — showing this match only");
//       setDollyHistory(roomId ? [{ roomId, title: roomName || "This match", subtitle: "", dateLabel: "Today", isLive: true, sport: roomSports }] : []);
//     } finally {
//       setDollyHistoryLoading(false);
//     }
//   }, [roomId, roomName, roomSports]);

//   useEffect(() => {
//     if (dollyOpen) loadDollyHistory();
//   }, [roomId, dollyOpen, loadDollyHistory]);

//   const handleSelectDollySession = useCallback(async (session: DollyHistorySession) => {
//     if (session.roomId === dollyActiveRoomId) return;
//     const requestId = Symbol();
//     dollyFetchTokenRef.current = requestId;
//     setDollyActiveRoomId(session.roomId);
//     setDollyActiveRoomName(session.title);
//     setDollyRepliesLoading(true);
//     try {
//       const res = await axios.get(`/api/roar/rooms/${session.roomId}/dolly`);
//       if (dollyFetchTokenRef.current !== requestId) return;
//       setDollyReplies(res.data?.success ? (res.data.replies ?? []) : []);
//     } catch {
//       if (dollyFetchTokenRef.current === requestId) setDollyReplies([]);
//     } finally {
//       if (dollyFetchTokenRef.current === requestId) setDollyRepliesLoading(false);
//     }
//   }, [dollyActiveRoomId]);

//   const handleNewDollyChat = useCallback(() => {
//     const requestId = Symbol();
//     dollyFetchTokenRef.current = requestId;
//     setDollyActiveRoomId(roomId);
//     setDollyActiveRoomName(roomName);
//     setDollyQuestion("");
//     if (!roomId) { setDollyReplies([]); return; }
//     setDollyRepliesLoading(true);
//     axios.get(`/api/roar/rooms/${roomId}/dolly`)
//       .then(res => {
//         if (dollyFetchTokenRef.current !== requestId) return;
//         setDollyReplies(res.data?.success ? (res.data.replies ?? []) : []);
//       })
//       .catch(() => { if (dollyFetchTokenRef.current === requestId) setDollyReplies([]); })
//       .finally(() => { if (dollyFetchTokenRef.current === requestId) setDollyRepliesLoading(false); });
//   }, [roomId, roomName]);

//   useEffect(() => {
//     const handleClickOutside = (e: MouseEvent) => {
//       if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) setShowEmojiPicker(false);
//     };
//     if (showEmojiPicker) document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [showEmojiPicker]);

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) return;
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   // const refreshActiveFans = useCallback(async () => {
//   //   if (!roomId) return;
//   //   try {
//   //     const res = await axios.get(`/api/roar/rooms/${roomId}/presence`);
//   //     if (res.data?.success) {
//   //       setActiveFans(res.data.fans ?? []);
//   //       setLiveCount(res.data.fanCount ?? 0);
//   //       detectNewJoiners(res.data.fans ?? []);
//   //       if (res.data.totalJoinCount !== undefined) setTotalJoinCount(res.data.totalJoinCount);
//   //       setPinnedPost(res.data.pinnedPost ?? null);
//   //     }
//   //   } catch (e) { console.error("Active fans fetch failed:", e); }
//   // }, [roomId, detectNewJoiners]);

//   const refreshActiveFans = useCallback(async () => {
//     if (!roomId) return;
//     const seq = ++presenceRequestSeqRef.current;
//     try {
//       // const res = await axios.get(`/api/roar/rooms/${roomId}/presence`);
//       const res = await axios.get(`/api/roar/rooms/${roomId}/presence`, { timeout: PRESENCE_TIMEOUT_MS });
//       if (res.data?.success) applyPresenceResponse(seq, res.data);
//     } catch (e) { console.error("Active fans fetch failed:", e); }
//   }, [roomId, applyPresenceResponse]);

//   // useEffect(() => {
//   //   if (!roomId) return;
//   //   setActiveFans([]); setLiveCount(0); setTotalJoinCount(0);
//   //   const join = async () => {
//   //     try {
//   //       const res = await axios.post(`/api/roar/rooms/${roomId}/presence`);
//   //       if (res.data?.success) {
//   //         setLiveCount(res.data.fanCount);
//   //         console.log('fans from presence:', res.data.fans)
//   //         setActiveFans(res.data.fans ?? []);
//   //         detectNewJoiners(res.data.fans ?? []);
//   //         if (res.data.totalJoinCount !== undefined) setTotalJoinCount(res.data.totalJoinCount);
//   //         setPinnedPost(res.data.pinnedPost ?? null);
//   //       }
//   //     } catch (e) { console.error("Join failed:", e); }
//   //   };

//   //   const refreshActiveFans = async () => {
//   //     try {
//   //       const res = await axios.get(`/api/roar/rooms/${roomId}/presence`);
//   //       if (res.data?.success) {
//   //         setActiveFans(res.data.fans ?? []);
//   //         setLiveCount(res.data.fanCount ?? 0);
//   //         console.log('fans from presence:', res.data.fans)
//   //         detectNewJoiners(res.data.fans ?? []);
//   //         if (res.data.totalJoinCount !== undefined) setTotalJoinCount(res.data.totalJoinCount);
//   //         setPinnedPost(res.data.pinnedPost ?? null);
//   //       }
//   //     } catch (e) { console.error("Active fans fetch failed:", e); }
//   //   };
//   //   const leaveBeacon = () => { navigator.sendBeacon(`/api/roar/rooms/${roomId}/presence/leave`); };
//   //   const leaveAxios = () => { axios.delete(`/api/roar/rooms/${roomId}/presence`).catch(() => { }); };
//   //   join().then(() => setTimeout(refreshActiveFans, 2000));
//   //   const heartbeat = setInterval(() => { if (!document.hidden) join(); }, 30000);
//   //   const fanRefresh = setInterval(() => { if (!document.hidden) refreshActiveFans(); }, 120000);
//   //   window.addEventListener("beforeunload", leaveBeacon);
//   //   return () => { leaveAxios(); clearInterval(heartbeat); clearInterval(fanRefresh); window.removeEventListener("beforeunload", leaveBeacon); };
//   // }, [roomId, detectNewJoiners]);

//   useEffect(() => {
//     if (!roomId) return;
//     setActiveFans([]); setLiveCount(0); setTotalJoinCount(0);

//     const join = async () => {
//       const seq = ++presenceRequestSeqRef.current;
//       try {
//         // const res = await axios.post(`/api/roar/rooms/${roomId}/presence`);
//         const res = await axios.post(`/api/roar/rooms/${roomId}/presence`, undefined, { timeout: PRESENCE_TIMEOUT_MS });
//         if (res.data?.success) applyPresenceResponse(seq, res.data);
//       } catch (e) { console.error("Join failed:", e); }
//     };

//     const leaveBeacon = () => { navigator.sendBeacon(`/api/roar/rooms/${roomId}/presence/leave`); };
//     // const leaveAxios = () => { axios.delete(`/api/roar/rooms/${roomId}/presence`).catch(() => { }); };
//     const leaveAxios = () => { axios.delete(`/api/roar/rooms/${roomId}/presence`, { timeout: PRESENCE_TIMEOUT_MS }).catch(() => { }); };

//     join();
//     presenceBootstrapTimeoutRef.current = setTimeout(refreshActiveFans, 2000);

//     const heartbeat = setInterval(() => { if (!document.hidden) join(); }, 30000);
//     const fanRefresh = setInterval(() => { if (!document.hidden) refreshActiveFans(); }, 120000);
//     window.addEventListener("beforeunload", leaveBeacon);

//     return () => {
//       leaveAxios();
//       clearInterval(heartbeat);
//       clearInterval(fanRefresh);
//       if (presenceBootstrapTimeoutRef.current) clearTimeout(presenceBootstrapTimeoutRef.current);
//       window.removeEventListener("beforeunload", leaveBeacon);
//     };
//   }, [roomId, applyPresenceResponse, refreshActiveFans]);

//   useEffect(() => {
//     try {
//       setUserUsername(userProfile?.username || localStorage.getItem("roar_username") || "RoarUser");
//       setUserAvatarUrl(currentAvatarUrl || userProfile?.avatarUrl || userProfile?.avatar || localStorage.getItem("roar_avatar_url") || undefined);
//     } catch { }
//   }, [currentAvatarUrl, userProfile]);

//   useEffect(() => {
//     if (!roomId) { setDollyReplies([]); setDollyLoaded(true); return; }
//     const requestId = Symbol();
//     dollyFetchTokenRef.current = requestId;
//     setDollyActiveRoomId(roomId);
//     setDollyActiveRoomName(roomName);
//     setDollyLoaded(false);
//     axios.get(`/api/roar/rooms/${roomId}/dolly`)
//       .then(res => {
//         if (dollyFetchTokenRef.current !== requestId) return;
//         setDollyReplies(res.data?.success ? (res.data.replies ?? []) : []);
//       })
//       .catch(() => { if (dollyFetchTokenRef.current === requestId) setDollyReplies([]); })
//       .finally(() => { if (dollyFetchTokenRef.current === requestId) setDollyLoaded(true); });
//   }, [roomId, roomName]);

//   const fetchMsgs = useCallback(async () => {
//     if (!roomId) return;
//     try {
//       const url = latestCreatedAtRef.current
//         ? `/api/roar/rooms/${roomId}/messages?since=${latestCreatedAtRef.current}&t=${Date.now()}`
//         : `/api/roar/rooms/${roomId}/messages?t=${Date.now()}`;
//       const res = await axios.get(url);
//       if (res.data?.success) {
//         if (res.data.counts) setRoomCounts(res.data.counts);
//         const incoming: any[] = res.data.messages ?? [];
//         if (latestCreatedAtRef.current === null) {
//           setPosts(prev => {
//             const prevMap = Object.fromEntries(prev.map(p => [p.id, p]));
//             return [...res.data.messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).map((m: any) => mapMessage(m, prevMap[m.msgId]));
//           });
//           if (incoming.length > 0) latestCreatedAtRef.current = Math.max(...incoming.map(m => m.createdAt));
//         } else if (incoming.length > 0) {
//           latestCreatedAtRef.current = Math.max(...incoming.map((m: any) => m.createdAt));
//           setPosts(prev => {
//             const existingIds = new Set(prev.map(p => p.id));
//             const fresh = incoming.filter((m: any) => !existingIds.has(m.msgId)).map((m: any) => ({ ...mapMessage(m), timeAgo: "now" }));
//             if (fresh.length > 0) playSound("post");
//             return fresh.length > 0 ? [...prev, ...fresh] : prev;

//           });
//         }
//       }
//     } catch (e) { console.error(e); }
//     finally { setLoading(false); }
//   }, [roomId, mapMessage, playSound]);

//   useEffect(() => { onRegisterRefresh?.(fetchMsgs); }, [fetchMsgs, onRegisterRefresh]);
//   useEffect(() => {
//     onRegisterReplyUpdate?.((postId, count) => {
//       setPosts(p => p.map(x => x.id === postId ? { ...x, replyCount: count } : x));
//     });
//   }, [onRegisterReplyUpdate, playSound]);
//   useEffect(() => {
//     latestCreatedAtRef.current = null;
//     setPosts([]);
//     setMorePosts([]);
//     setHasMoreMsgs(true);
//     setLoading(true);
//     setRoomCounts({ post: 0, debate: 0, prediction: 0, trivia: 0, battle: 0 });
//     setPinnedPost(null);
//     setLocalReactions({});
//     topReactionsCache.current = {};
//     setTopReactionsMap({});
//     setOpenInlinePostId(null);
//     setActiveFilter("all");
//     knownFanUidsRef.current = null;
//     presenceRequestSeqRef.current = 0;
//     joinToastQueueRef.current = [];
//     setJoinToast(null);
//   }, [roomId]);
//   useEffect(() => { if (!roomId) return; fetchMsgs(); }, [fetchMsgs, roomId]);
//   useVisibilityInterval(fetchMsgs, 15000);

//   const fetchReactionUpdates = useCallback(async () => {
//     if (!roomId) return;
//     try {
//       const res = await axios.get(`/api/roar/rooms/${roomId}/messages?t=${Date.now()}`);
//       if (res.data?.success) {
//         const incoming: any[] = res.data.messages ?? [];
//         const isLocked = (id: string) => {
//           const t = lastLocalReactAtRef.current[id];
//           return t !== undefined && Date.now() - t < 6000;
//         };
//         setPosts(prev => prev.map(p => {
//           const updated = incoming.find((m: any) => m.msgId === p.id);
//           if (!updated) return p;
//           const isPending = pendingReactRef.current[p.id] || isLocked(p.id);
//           return {
//             ...p,
//             heartCount: isPending ? p.heartCount : (updated.heartCount ?? p.heartCount),
//             userReaction: isPending ? p.userReaction : (updated.userReaction ?? null),
//             replyCount: Math.max(p.replyCount ?? 0, updated.replyCount ?? 0),
//             agreeCount: updated.agreeCount ?? p.agreeCount,
//             disagreeCount: updated.disagreeCount ?? p.disagreeCount,
//             userVote: (p.userVote && !updated.userVote) ? p.userVote : (updated.userVote ?? p.userVote ?? null),
//           };
//         }));
//         setMorePosts(prev => prev.map(p => {
//           const updated = incoming.find((m: any) => m.msgId === p.id);
//           if (!updated) return p;
//           return {
//             ...p,
//             replyCount: Math.max(p.replyCount ?? 0, updated.replyCount ?? 0),
//             agreeCount: updated.agreeCount ?? p.agreeCount,
//             disagreeCount: updated.disagreeCount ?? p.disagreeCount,
//             userVote: (p.userVote && !updated.userVote) ? p.userVote : (updated.userVote ?? p.userVote ?? null),
//           };
//         }));

//         setLocalReactions(prev => {
//           const next = { ...prev };
//           incoming.forEach((m: any) => {
//             if (!pendingReactRef.current[m.msgId] && !isLocked(m.msgId)) {
//               next[m.msgId] = { reaction: m.userReaction ?? null, heartCount: m.heartCount ?? 0 };
//             }
//           });
//           return next;
//         });
//       }
//     } catch { }
//   }, [roomId]);

//   useVisibilityInterval(fetchReactionUpdates, 5000);

//   const lastNotifCheckRef = useRef<number>(Date.now());
//   const seenNotifIdsRef = useRef<Set<string>>(new Set());
//   useEffect(() => {
//     if (!roomId) return;
//     const checkNotifs = async () => {
//       try {
//         const res = await axios.get("/api/notifications", { params: { uid: userProfile?.actualUserId, email: userProfile?.email } });
//         const notifs: any[] = res.data?.notifications ?? [];
//         const fresh = notifs.filter(n => n.roomId === roomId && !n.isRead && !seenNotifIdsRef.current.has(n.id) && (n.createdAt ?? 0) > lastNotifCheckRef.current);
//         if (fresh.length > 0) {
//           fresh.forEach(n => seenNotifIdsRef.current.add(n.id));
//           const latest = fresh[fresh.length - 1];
//           const type = latest.type === "roar_post_comment" ? "comment" : "like";
//           setNotifToast({ message: latest.message ?? (type === "comment" ? "Someone commented on your post" : "Someone reacted to your post"), type });
//           if (notifToastTimerRef.current) clearTimeout(notifToastTimerRef.current);
//           notifToastTimerRef.current = setTimeout(() => setNotifToast(null), 60000);
//         }
//       } catch { }
//     };
//     lastNotifCheckRef.current = Date.now();
//     const interval = setInterval(checkNotifs, 60000);
//     return () => { clearInterval(interval); if (notifToastTimerRef.current) clearTimeout(notifToastTimerRef.current); };
//   }, [roomId, userProfile?.actualUserId, userProfile?.email]);

//   useEffect(() => {
//     if (!loading && listRef.current)
//       setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight }), 50);
//   }, [loading]);

//   const prevPostCountRef = useRef(0);
//   useEffect(() => {
//     const newCount = posts.length;
//     if (newCount > prevPostCountRef.current && listRef.current) {
//       setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }), 50);
//     }
//     prevPostCountRef.current = newCount;
//   }, [posts.length]);

//   useEffect(() => {
//     if (dollyReplies.length > prevDollyCountRef.current && listRef.current) {
//       setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }), 50);
//     }
//     prevDollyCountRef.current = dollyReplies.length;
//   }, [dollyReplies.length]);

//   const handlePinPost = async (p: any) => {
//     if (!roomId) return;
//     setOpenMenuPostId(null);
//     const optimistic = { msgId: p.id, text: p.text, authorUsername: p.fan.username, type: p.type || "post", pinnedAt: Date.now() };
//     setPinnedPost(optimistic);
//     try {
//       await axios.post(`/api/roar/rooms/${roomId}/messages/${p.id}/pin`, { action: "pin" });
//     } catch {
//       setPinnedPost(null);
//       onToast("Failed to pin post");
//     }
//   };

//   const handleUnpin = async () => {
//     if (!roomId || !pinnedPost) return;
//     const prev = pinnedPost;
//     const msgId = prev.msgId;
//     setPinnedPost(null);
//     setOpenMenuPostId(null);
//     try {
//       await axios.post(`/api/roar/rooms/${roomId}/messages/${msgId}/pin`, { action: "unpin" });
//     } catch {
//       setPinnedPost(prev);
//       onToast("Failed to unpin post");
//     }
//   };

//   useEffect(() => {
//     const handleClickOutside = (e: MouseEvent) => {
//       if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuPostId(null);
//     };
//     if (openMenuPostId) document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [openMenuPostId]);

//   const handleReact = useCallback(async (msgId: string, reaction: Reaction | null) => {
//     if (!roomId || pendingReactRef.current[msgId]) return;
//     const post = posts.find(p => p.id === msgId);
//     const prev = localReactionsRef.current[msgId] ?? { reaction: post?.userReaction ?? null, heartCount: post?.heartCount ?? 0 };
//     const sameReaction = prev.reaction === reaction;
//     const newReaction = sameReaction ? null : reaction;
//     const wasActive = prev.reaction !== null;
//     const newActive = newReaction !== null;
//     const countDelta = newActive && !wasActive ? 1 : (!newActive && wasActive ? -1 : 0);
//     const optimisticState = { reaction: newReaction, heartCount: Math.max(0, prev.heartCount + countDelta) };
//     setLocalReactions(p => ({ ...p, [msgId]: optimisticState }));
//     lastLocalReactAtRef.current[msgId] = Date.now();
//     pendingReactRef.current[msgId] = true;
//     try {
//       const res: any = newReaction === null ? await roarApi.unreactPost(msgId, roomId) : await roarApi.reactPost(msgId, newReaction, roomId);
//       if (res && typeof res.likeCount === "number") {
//         setLocalReactions(p => ({ ...p, [msgId]: { ...optimisticState, heartCount: res.likeCount } }));
//         lastLocalReactAtRef.current[msgId] = Date.now();
//       }
//     } catch { setLocalReactions(p => ({ ...p, [msgId]: prev })); onToast("Failed to save reaction"); }
//     finally { pendingReactRef.current[msgId] = false; }
//   }, [roomId, posts, onToast]);

//   const getPredictionVoteValue = (optionIndex: number) => (
//     optionIndex === 0 ? "agree" : optionIndex === 1 ? "disagree" : `option_${optionIndex}`
//   );

//   const getPredictionOptionLabel = (voteValue: string | undefined, options: string[]) => {
//     if (!voteValue) return "";
//     if (voteValue === "agree") return options[0] || "Option 1";
//     if (voteValue === "disagree") return options[1] || "Option 2";
//     const optionIndex = Number(voteValue.replace("option_", ""));
//     return Number.isFinite(optionIndex) ? (options[optionIndex] || voteValue) : voteValue;
//   };

//   const formatPredictionCloseLabel = (p: { resolvedAt?: number; closesAt?: number; closedAt?: number }) => {
//     if (p.resolvedAt) return "Resolved";
//     if (!p.closesAt) return "Open";
//     const remaining = p.closesAt - Date.now();
//     if (remaining <= 0 || p.closedAt) return "Closed";
//     const mins = Math.ceil(remaining / 60000);
//     if (mins < 60) return `${mins}m left`;
//     return `${Math.ceil(mins / 60)}h left`;
//   };

//   const resolveRoomPrediction = async (msgId: string, correctVote: string) => {
//     if (!roomId) return;
//     try {
//       setResolvingRoomPredictionId(msgId);
//       const res = await axios.post(`/api/roar/rooms/${roomId}/messages/${msgId}/resolve`, { correctVote });
//       if (res.data?.success) {
//         const resolvedAt = res.data.message?.resolvedAt ?? Date.now();
//         setPosts(prev => prev.map(p => p.id !== msgId ? p : { ...p, resolvedAt, closedAt: res.data.message?.closedAt ?? resolvedAt, correctVote, accuracyAwarded: true }));
//         onToast(`Prediction resolved. ${res.data.correctCount ?? 0} correct fans awarded.`);
//       } else { onToast("Failed to resolve prediction"); }
//     } catch (err: unknown) {
//       const message = axios.isAxiosError(err) ? err.response?.data?.error : undefined;
//       onToast(message || "Failed to resolve prediction");
//     } finally { setResolvingRoomPredictionId(null); }
//   };

//   const triggerUpload = (type: "image" | "video") => {
//     setAttachedType(type);
//     if (fileInputRef.current) { fileInputRef.current.accept = type === "image" ? "image/*" : "video/*"; fileInputRef.current.click(); }
//   };

//   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0]; if (!file) return;
//     try {
//       setUploading(true); onToast("Uploading media...");
//       const fd = new FormData(); fd.append("file", file);
//       const res = await axios.post("/api/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
//       if (res.data?.url) { setAttachedUrl(res.data.url); onToast("Media uploaded!"); }
//     } catch { onToast("Upload failed"); setAttachedType(null); }
//     finally { setUploading(false); if (e.target) e.target.value = ""; }
//   };

//   const send = async () => {
//     if (!roomId) return;
//     if (postCooldown > 0) return;
//     const text = input.trim();
//     if (!text && !attachedUrl) return;
//     if (sendingRef.current) return;
//     sendingRef.current = true; setIsSending(true);
//     const clientMsgId = `${currentUserId || "anon"}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
//     try {
//       const res = await axios.post(`/api/roar/rooms/${roomId}/messages`, { text: text || "Shared media", type: mode, mediaUrls: attachedUrl ? [attachedUrl] : undefined, clientMsgId, });
//       if (res.data?.success) {
//         const m = res.data.message;
//         setPosts(p => [...p, { id: m.msgId, fan: { username: displayUsername(m.authorUsername), authorUid: m.authorUid, badge: m.authorBadge, avatarUrl: m.authorAvatarUrl || m.avatarUrl || (m.authorUsername === userUsername ? userAvatarUrl : undefined) }, text: m.text, fireCount: m.fireCount ?? 0, heartCount: m.heartCount ?? 0, mindblownCount: m.mindblownCount ?? 0, goatCount: m.goatCount ?? 0, clapCount: m.clapCount ?? 0, nochanceCount: m.noChanceCount ?? 0, userReaction: null, replyCount: 0, agreeCount: 0, disagreeCount: 0, userVote: null, sideA: m.sideA ?? null, sideB: m.sideB ?? null, timeAgo: "now", createdAt: m.createdAt || Date.now(), type: m.type, mediaUrls: m.mediaUrls, quizQuestion: m.quizQuestion, quizOptions: m.quizOptions, quizCorrectOption: m.quizCorrectOption, quizUserAnswer: m.quizUserAnswer ?? null, quizTimer: m.quizTimer, quizPoints: m.quizPoints, quizParticipants: m.quizParticipants ?? 0, memGifUrl: m.memGifUrl ?? null, memTag: m.memTag ?? null }]);
//         setInput(""); setAttachedUrl(null); setAttachedType(null);
//         playSound("post");
//         startPostCooldown();
//         setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }), 50);
//       }
//     } catch { onToast("Failed to send message"); }
//     finally { sendingRef.current = false; setIsSending(false); }
//   };

//   const askDolly = async () => {
//     const q = dollyQuestion.trim();

//     const targetRoomId = dollyActiveRoomId ?? roomId;
//     if (!q || dollyAsking || !targetRoomId) return;
//     setDollyAsking(true);
//     const tempId = `temp-dolly-${Date.now()}`;
//     setDollyReplies(prev => [...prev, { id: tempId, question: q, answer: "", createdAt: Date.now() }]);
//     setDollyQuestion("");
//     try {
//       const res = await axios.post(`/api/roar/rooms/${targetRoomId}/dolly`, { question: q });
//       if (res.data?.success) {
//         if (dollyActiveRoomIdRef.current === targetRoomId) {
//           setDollyReplies(prev => prev.map(d => d.id === tempId ? res.data.reply : d));
//         }
//       } else {
//         throw new Error("Dolly request failed");
//       }
//     } catch {
//       if (dollyActiveRoomIdRef.current === targetRoomId) {
//         setDollyReplies(prev => prev.map(d => d.id === tempId ? { ...d, answer: "Something went wrong — try again." } : d));
//       }
//     } finally {
//       setDollyAsking(false);
//     }
//   };

//   const handleQuickReactPost = async (opt: typeof QUICK_REACT_OPTS[0]) => {
//     if (!roomId) return;
//     setShowQuickCompose(false);
//     const memTag = opt.id.replace("qr_", "");

//     const tempId = `temp-qr-${Date.now()}`;
//     const optimisticMsg: any = {
//       id: tempId,
//       fan: { username: displayUsername(userUsername), authorUid: "", badge: "", avatarUrl: userAvatarUrl },
//       text: opt.label, fireCount: 0, heartCount: 0, mindblownCount: 0, goatCount: 0, clapCount: 0, nochanceCount: 0, userReaction: null, replyCount: 0, agreeCount: 0, disagreeCount: 0, userVote: null, sideA: null, sideB: null, timeAgo: "Sending...", createdAt: Date.now(), type: "post", mediaUrls: [], quizQuestion: null, quizOptions: null, quizCorrectOption: null, quizUserAnswer: null, quizTimer: null, quizPoints: null, quizParticipants: 0, memGifUrl: null, memTag: memTag, status: "sending"
//     };

//     setPosts(p => [...p, optimisticMsg]);

//     try {
//       const res = await axios.post(`/api/roar/rooms/${roomId}/messages`, {
//         text: opt.label,
//         type: "post",
//         memTag,
//       });
//       if (res.data?.success) {
//         const m = res.data.message;
//         setPosts(p => {
//           if (p.some(post => post.id === m.msgId)) return p.filter(post => post.id !== tempId);
//           return p.map(post => post.id === tempId ? { ...post, id: m.msgId, status: "sent", timeAgo: "now", createdAt: m.createdAt || Date.now(), memGifUrl: m.memGifUrl } : post);
//         });
//         setNewlyPostedIds(prev => new Set([...prev, m.msgId]));
//         playSound("post");
//         if (["wicket", "six", "four", "goal", "redcard", "catch", "frango", "yellowcard"].includes(memTag)) {
//           setCelebration({ memTag });
//         }
//         setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }), 50);
//         onToast(`${opt.emoji} ${opt.label} posted!`);
//       }
//     } catch {
//       setPosts(p => p.filter(post => post.id !== tempId));
//       onToast("Failed to post");
//     }
//   };

//   const handleBack = (e: React.PointerEvent | React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); onBack(); };
//   const shareRoomLink = () => {
//     if (typeof navigator !== "undefined" && navigator.share) navigator.share({ title: "SF360 Infinity Room", url: window.location.href });
//     else { copyToClipboard(window.location.href); onToast("Link copied!"); }
//   };



//   const composeIconMap: Record<string, React.ReactNode> = {
//     hot_take: <Flame size={13} stroke="url(#dr-pink-orange-grad)" fill="url(#dr-pink-orange-grad)" />,
//     prediction: <TrendingUp size={13} stroke="url(#dr-pink-orange-grad)" />,
//     debate: <Zap size={13} stroke="url(#dr-pink-orange-grad)" fill="url(#dr-pink-orange-grad)" />,
//     memory: <History size={13} stroke="url(#dr-pink-orange-grad)" />,
//     post: <PenTool size={13} stroke="url(#dr-pink-orange-grad)" />,
//     quiz: <Brain size={13} stroke="url(#dr-pink-orange-grad)" />,
//   };

//   const renderReactionPicker = (p: any) => {
//     const lo = localReactions[p.id];
//     const currentReaction: Reaction | null = lo !== undefined ? lo.reaction : (p.userReaction ?? null);
//     const heartCount = lo !== undefined ? lo.heartCount : (p.heartCount ?? 0);
//     return (
//       <div onClick={e => e.stopPropagation()}>
//         <ReactionPicker
//           currentReaction={currentReaction}
//           count={heartCount}
//           onReact={(r) => handleReact(p.id, r)}
//           postId={p.id}
//           roomId={roomId}
//           roomName={roomName}
//         />
//       </div>
//     );
//   };

//   const REACTION_EMOJI: Record<string, string> = { fire: "🔥", heart: "❤️", mindblown: "🤯", goat: "🐐", clap: "👏", nochance: "🙅", laugh: "😂", sad: "😢", thumb: "👍" };

//   const renderReactionsTrigger = (p: any) => {
//     const lo = localReactions[p.id];
//     const heartCount = lo !== undefined ? lo.heartCount : (p.heartCount ?? 0);
//     if (heartCount === 0) return null;
//     const topReactions = topReactionsMap[p.id] ?? [];
//     if (topReactions.length === 0 && !topReactionsCache.current[p.id]) fetchTopReactions(p.id);
//     const currentReaction = lo?.reaction ?? p.userReaction ?? null;
//     const displayReactions = topReactions.length > 0 ? topReactions : currentReaction ? [currentReaction] : [];
//     if (displayReactions.length === 0) return null;
//     return (
//       <motion.button whileTap={{ scale: 0.93 }} onClick={e => { e.stopPropagation(); setReactionsMsgId(p.id); }} style={{ display: "flex", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", marginLeft: "auto", padding: 0 }} title="See who reacted">
//         <div style={{ display: "flex" }}>
//           {displayReactions.map((type, i) => (
//             <div key={type} style={{ width: 18, height: 18, borderRadius: "50%", background: "#1e1e2a", border: "1.5px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, marginLeft: i === 0 ? 0 : -5, zIndex: displayReactions.length - i, position: "relative" }}>
//               {REACTION_EMOJI[type] ?? "❤️"}
//             </div>
//           ))}
//         </div>
//       </motion.button>
//     );
//   };

//   const renderPostHeader = (p: any, postType: string, onAvatarClick?: () => void) => (
//     <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, minWidth: 0 }} onClick={e => e.stopPropagation()}>
//       <div style={{ flexShrink: 0, cursor: onAvatarClick ? "pointer" : "default" }} onClick={e => { e.stopPropagation(); onAvatarClick?.(); }}>
//         <AvatarWithBadge username={p.fan.username} badge={p.fan.badge} size="sm" avatarUrl={p.fan.avatarUrl} />
//       </div>
//       <div style={{ display: "flex", alignItems: "center", gap: 4, flex: 1, minWidth: 0, flexWrap: "wrap" }}>
//         <span style={{ fontWeight: 700, fontSize: 10, color: "#fff", whiteSpace: "nowrap", cursor: onAvatarClick ? "pointer" : "default" }} onClick={e => { e.stopPropagation(); onAvatarClick?.(); }}>
//           {p.fan.username}
//         </span>
//         <span style={{ fontSize: 7, color: "rgba(255,255,255,0.48)", whiteSpace: "nowrap" }}>{p.timeAgo}</span>
//         {p.type && (
//           <span className={typeBadgeClass(p.type)}>
//             {p.type === "post" ? "POST" : p.type === "hottake" ? "HOT TAKE" : p.type === "prediction" ? "PREDICTION" : p.type === "debate" ? "DEBATE" : p.type === "raw_reactions" ? "RAW REACTIONS" : p.type.toUpperCase()}
//           </span>
//         )}
//       </div>
//       <div style={{ position: "relative", flexShrink: 0 }} ref={openMenuPostId === p.id ? menuRef : undefined}>
//         <button
//           onClick={e => { e.stopPropagation(); setOpenMenuPostId(openMenuPostId === p.id ? null : p.id); }}
//           style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 3, borderRadius: "50%" }}
//         >
//           <MoreVertical size={14} />
//         </button>
//         <AnimatePresence>
//           {openMenuPostId === p.id && (
//             <motion.div
//               initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -4 }}
//               transition={{ duration: 0.12 }}
//               onClick={e => e.stopPropagation()}
//               style={{ position: "absolute", top: "calc(100% + 3px)", right: 0, zIndex: 30, background: "#1a1a24", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, overflow: "hidden", minWidth: 110, boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}
//             >
//               <button
//                 onClick={() => pinnedPost?.msgId === p.id ? handleUnpin() : handlePinPost(p)}
//                 style={{ width: "100%", textAlign: "left", padding: "7px 10px", background: "none", border: "none", cursor: "pointer", color: "#fff", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}
//               >
//                 {pinnedPost?.msgId === p.id ? "Unpin" : "Pin"}
//               </button>
//               {isCurrentUserAuthor(p) && (
//                 <button
//                   onClick={async () => {
//                     setOpenMenuPostId(null);
//                     if (!window.confirm("Delete this post?")) return;
//                     try { await axios.delete(`/api/roar/rooms/${roomId}/messages/${p.id}`); setPosts(prev => prev.filter(x => x.id !== p.id)); }
//                     catch { onToast("Failed to delete post"); }
//                   }}
//                   style={{ width: "100%", textAlign: "left", padding: "7px 10px", background: "none", border: "none", borderTop: "1px solid rgba(255,255,255,0.06)", cursor: "pointer", color: "#f87171", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}
//                 >
//                   Delete
//                 </button>
//               )}
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>
//     </div>
//   );

//   const renderActionBar = (p: any, postPayload: any, postType: string) => {
//     const replyCount = p.replyCount || 0;
//     const defaultOpen = replyCount > 0;
//     const isOpen = openInlinePostId === p.id || (defaultOpen && !explicitlyClosedPostIds.has(p.id));
//     const accent = commentAccentColor(postType);
//     return (
//       <div style={{ marginTop: 0 }}>
//         <div style={{ display: "flex", gap: 6, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 4, alignItems: "center" }}>
//           {renderReactionPicker(p)}
//           <button
//             onClick={e => {
//               e.stopPropagation();
//               if (isOpen) {
//                 if (openInlinePostId === p.id) setOpenInlinePostId(null);
//                 setExplicitlyClosedPostIds(prev => {
//                   const next = new Set(prev);
//                   next.add(p.id);
//                   return next;
//                 });
//               } else {
//                 setOpenInlinePostId(p.id);
//                 setExplicitlyClosedPostIds(prev => {
//                   const next = new Set(prev);
//                   next.delete(p.id);
//                   return next;
//                 });
//               }
//             }}
//             style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", color: isOpen ? accent : "#9494ad", fontSize: 11, fontWeight: 600, transition: "color 0.15s", padding: 0 }}
//           >
//             <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//               <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
//             </svg>
//             <span style={{ fontSize: 9 }}>{replyCount}</span>
//             {isOpen ? <ChevronUp size={10} style={{ opacity: 0.7 }} /> : <ChevronDown size={10} style={{ opacity: 0.5 }} />}
//           </button>
//           <button onClick={e => { e.stopPropagation(); openShareDialog(p); }} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", color: "#9494ad", fontSize: 11, fontWeight: 600 }}>
//             <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//               <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
//               <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
//             </svg>
//           </button>
//           {renderReactionsTrigger(p)}
//         </div>
//         <AnimatePresence>
//           {isOpen && roomId && (
//             <InlineSection
//               key={`inline-${p.id}`}
//               postId={p.id} roomId={roomId} roomName={roomName} isOpen={isOpen}
//               onOpenFull={() => { setOpenInlinePostId(null); onPostClick?.(postPayload); }}
//               accentColor={accent} currentAvatarUrl={userAvatarUrl}
//               currentUserId={currentUserId}
//               currentUsername={userUsername}
//               onFanProfile={onFanProfile}
//               onCommentPosted={() => {
//                 setPosts(prev => prev.map(x => x.id === p.id ? { ...x, replyCount: (x.replyCount || 0) + 1 } : x));
//                 playSound("comment");
//                 onToast("Comment posted!");
//               }}
//               onCommentDeleted={() => {
//                 setPosts(prev => prev.map(x => x.id === p.id ? { ...x, replyCount: Math.max(0, (x.replyCount || 0) - 1) } : x));
//                 onToast("Reply deleted");
//               }}
//             />
//           )}
//         </AnimatePresence>
//       </div>
//     );
//   };

//   const allVisiblePosts = React.useMemo(() => {
//     const seen = new Set<string>();
//     return [...morePosts, ...posts].filter(p => {
//       if (p.type === "predictions_live") return false;
//       if (seen.has(p.id)) return false;
//       seen.add(p.id);
//       return true;
//     });
//   }, [morePosts, posts]);

//   const postCount = roomCounts.post;
//   const debateCount = roomCounts.debate;
//   const predictionCount = roomCounts.prediction;
//   const triviaCount = roomCounts.trivia;
//   const battleCount = roomCounts.battle;

//   const filteredPosts = activeFilter === "all"
//     ? allVisiblePosts
//     : allVisiblePosts.filter(p => {
//       if (activeFilter === "post") return p.type === "post" || !p.type;
//       return p.type === activeFilter;
//     });

//   const predictionsLivePosts =
//     [...morePosts, ...posts]
//       .filter((p) => p.type === "predictions_live")
//       .sort((a, b) => b.createdAt - a.createdAt);

//   type FeedItem =
//     | { kind: "post"; data: any; sortKey: number }
//     | { kind: "dolly"; data: typeof dollyReplies[0]; sortKey: number };

//   const feedItems: FeedItem[] = filteredPosts
//     .map(p => ({ kind: "post" as const, data: p, sortKey: p.createdAt }))
//     .sort((a, b) => a.sortKey - b.sortKey);

//   return (
//     <div className="flex flex-col w-full bg-[#0e0e14]" style={{ height: "100%", overflow: "hidden" }}>
//       <svg width="0" height="0" style={{ position: "absolute" }}>
//         <linearGradient id="dr-pink-orange-grad" x1="0%" y1="0%" x2="100%" y2="100%">
//           <stop offset="0%" stopColor="#e91e8c" /><stop offset="100%" stopColor="#ff6b35" />
//         </linearGradient>
//       </svg>

//       <AnimatePresence>
//         {celebration && (
//           celebration.memTag === "wave" ? (
//             <WaveCelebrationBurst
//               key={"wave-" + Date.now()}
//               onDone={() => setCelebration(null)}
//             />
//           ) : (
//             <CelebrationBurst
//               key={celebration.memTag + Date.now()}
//               memTag={celebration.memTag}
//               onDone={() => setCelebration(null)}
//             />
//           )
//         )}
//       </AnimatePresence>

//       {sharePost && (
//         <>
//           <button type="button" className="fixed inset-0 z-40 bg-black/70 lg:hidden" onClick={closeShareDialog} />
//           <div className="fixed bottom-16 inset-x-4 z-50 mx-auto w-full max-w-[280px] rounded-2xl border border-white/10 bg-[#1a1a1e] p-3 shadow-2xl lg:hidden" onClick={e => e.stopPropagation()}>
//             <div className="flex items-center justify-between mb-2">
//               <p className="text-white text-sm font-semibold">Share</p>
//               <button type="button" onClick={closeShareDialog} className="text-gray-400 hover:text-white"><svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg></button>
//             </div>
//             <div className="flex flex-row flex-nowrap items-center gap-1.5 mb-2 overflow-x-auto">{shareButtons("w-8 h-8")}</div>
//             {copied && <p className="text-xs text-emerald-400">Copied to clipboard</p>}
//           </div>
//           <div className="hidden lg:flex fixed inset-0 z-50 items-center justify-center bg-black/60" onClick={closeShareDialog}>
//             <div className="bg-[#1a1a1e] rounded-2xl border border-white/10 p-4 w-[300px] shadow-2xl" onClick={e => e.stopPropagation()}>
//               <div className="flex items-center justify-between mb-3">
//                 <p className="text-white text-sm font-semibold">Share ROAR Post</p>
//                 <button type="button" onClick={closeShareDialog} className="text-gray-400 hover:text-white"><svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg></button>
//               </div>
//               <div className="rounded-xl border border-white/10 bg-[#111114] p-3 mb-3">
//                 <p className="text-white text-sm font-semibold line-clamp-2">{sharePost.text || "ROAR Post"}</p>
//                 <p className="text-white/45 text-[11px] mt-2 line-clamp-2 break-all">{buildRoarPostShareUrl(sharePost)}</p>
//               </div>
//               <div className="flex flex-row flex-nowrap items-center gap-2 mb-2">{shareButtons("w-9 h-9")}</div>
//               {copied && <p className="text-xs text-emerald-400">Copied to clipboard</p>}
//             </div>
//           </div>
//         </>
//       )}

//       <div className="shrink-0 px-3 py-2 bg-[rgba(14,14,20,0.98)] backdrop-blur-[20px] border-b border-[var(--border)]" style={{ overflow: "visible", position: "relative", zIndex: 40 }}>
//         <div className="flex justify-between items-start gap-2">
//           <div className="flex items-center gap-2 min-w-0 flex-1">
//             <button type="button" onPointerDown={handleBack} onClick={handleBack} className="bg-transparent border-none cursor-pointer text-white flex items-center p-0 flex-shrink-0" style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}>
//               <ChevronLeft size={22} />
//             </button>
//             <div className="text-left pt-0.5 min-w-0 flex-1">
//               <p className="font-display text-lg tracking-[0.04em] m-0 leading-tight text-white font-extrabold uppercase truncate">{roomName || "WORLDCUP"}</p>
//               <div className="flex items-center gap-1 flex-wrap">
//                 <div className="flex items-center gap-1">
//                   <span className="live-pulse w-1.5 h-1.5 rounded-full bg-[var(--live-green)] inline-block flex-shrink-0" />
//                   <span className="text-[8px] font-bold text-[var(--live-green)] flex-shrink-0">LIVE</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//           <div className="flex items-center gap-1 flex-shrink-0">
//             <button
//               type="button"
//               onClick={toggleSound}
//               className="flex-shrink-0 bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.12)] rounded-[10px] p-1.5 cursor-pointer text-[rgba(255,255,255,0.75)] flex items-center justify-center"
//               style={{ width: "32px", height: "32px" }}
//               title={soundEnabled ? "Mute sounds" : "Unmute sounds"}
//             >
//               {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
//             </button>
//             <button type="button" onClick={shareRoomLink} className="flex-shrink-0 bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.12)] rounded-[10px] p-1.5 cursor-pointer text-[rgba(255,255,255,0.75)] flex items-center justify-center" style={{ width: "32px", height: "32px" }}>
//               <Share2 size={14} />
//             </button>
//             {(score || scoreSubtitle) && (
//               <div className="text-right pr-0.5 flex-shrink-0">
//                 {score && <div className="font-display text-[22px] text-[var(--accent-yellow)] leading-none">{score}</div>}
//                 {scoreSubtitle && <div className="text-[10px] text-[var(--text-secondary)] mt-0.5">{scoreSubtitle}</div>}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       <div className="shrink-0 px-3 py-0 bg-[rgba(14,14,20,0.98)] border-b border-[var(--border)]">
//         <ActiveFansStack
//           fans={activeFans}
//           count={liveCount}
//           totalJoinCount={totalJoinCount}
//           onClick={() => { refreshActiveFans(); setActiveFansOpen(true); }}
//         />
//       </div>

//       {pinnedPost && (
//         <div
//           className="shrink-0 px-3 py-0.5 bg-[rgba(233,30,140,0.08)] border-b border-[rgba(233,30,140,0.18)] flex items-center gap-1.5 cursor-pointer"
//           onClick={() => {
//             const target = [...morePosts, ...posts].find(p => p.id === pinnedPost.msgId);
//             if (target) {
//               onPostClick?.({ id: target.id, text: target.text, fan: target.fan, timeAgo: target.timeAgo, createdAt: target.createdAt, type: target.type || "post", isDbPost: true, roomId, mediaUrls: target.mediaUrls });
//             }
//           }}
//         >
//           <span className="text-[9px] shrink-0">📌</span>
//           <p className="m-0 text-[10px] text-white/85 whitespace-nowrap overflow-hidden text-ellipsis flex-1">
//             <span className="font-bold text-[#e91e8c]">Pinned: </span>
//             {pinnedPost.text}
//           </p>
//           <ChevronDown size={12} className="text-white/35 shrink-0 -rotate-90" />
//         </div>
//       )}

//       <div className="flex justify-start gap-1 py-1 px-2 overflow-x-auto shrink-0 border-b border-[var(--border)]" style={{ scrollbarWidth: "none" }}>
//         {(["all", "post", "debate", "prediction", "trivia", "battle"] as const).map((f) => {
//           const isActive = activeFilter === f;
//           const count = f === "post" ? postCount : f === "debate" ? debateCount : f === "prediction" ? predictionCount : f === "trivia" ? triviaCount : f === "battle" ? battleCount : 0;
//           const color = f === "post" ? "#e91e8c" : f === "debate" ? "#60a5fa" : f === "prediction" ? "#fbbf24" : f === "trivia" ? "#22c55e" : f === "battle" ? "#E91E8C" : "#fff";
//           const label = f === "all" ? "All" : f === "post" ? "Posts" : f === "debate" ? "Debates" : f === "prediction" ? "Predictions" : f === "trivia" ? "Trivia" : "Battles";
//           return (
//             <button key={f} type="button" onClick={() => setActiveFilter(f)}
//               className="flex items-center gap-1 px-2 rounded-full text-[10px] font-bold whitespace-nowrap shrink-0 transition-all duration-150"
//               style={{ background: isActive ? `${color}22` : "rgba(255,255,255,0.05)", border: `1.5px solid ${isActive ? `${color}70` : "rgba(255,255,255,0.1)"}`, color: isActive ? color : "rgba(255,255,255,0.5)" }}
//             >
//               {f !== "all" && <span className="w-1 h-1 rounded-full shrink-0" style={{ background: color }} />}
//               {label}
//               {f !== "all" && !isActive && count > 0 && (
//                 <span className="text-[8px] font-extrabold px-1 rounded-full" style={{ background: `${color}28`, color }}>{count}</span>
//               )}
//             </button>
//           );
//         })}
//       </div>

//       {predictionsLivePosts.length > 0 && (
//         <PredictionsLivePanel
//           posts={predictionsLivePosts}
//           roomId={roomId ?? ""}
//           onToast={onToast}
//           openInlinePostId={openInlinePostId}
//           setOpenInlinePostId={setOpenInlinePostId}
//           currentAvatarUrl={userAvatarUrl}
//           handleReact={handleReact}
//           localReactions={localReactions}
//           pendingReactRef={pendingReactRef}
//           onPostClick={onPostClick}
//           onFanProfile={onFanProfile}
//           setReactionsMsgId={setReactionsMsgId}
//           topReactionsMap={topReactionsMap}
//           topReactionsCache={topReactionsCache}
//           fetchTopReactions={fetchTopReactions}
//         />
//       )}
//       <div ref={listRef} className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-1 flex flex-col gap-0 min-h-0">
//         <AnimatePresence initial={false}>
//           {loading || !dollyLoaded ? (
//             <div className="text-center text-[var(--text-muted)] py-6 text-xs">Loading messages...</div>
//           )
//             : (
//               feedItems.map((item) => {
//                 const p = item.data;

//                 if (p.type === "trivia") {
//                   return (
//                     <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
//                       <TriviaCard post={p} onToast={onToast} onPostClick={onPostClick} roomId={roomId} onFanProfile={onFanProfile} />
//                     </motion.div>
//                   );
//                 }

//                 if (p.type === "battle") {
//                   return (
//                     <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
//                       <BattleCard post={p} onToast={onToast} onPostClick={onPostClick} roomId={roomId} onFanProfile={onFanProfile} />
//                     </motion.div>
//                   );
//                 }

//                 if (p.type === "quiz") {
//                   return (
//                     <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
//                       <QuizCard post={p} onToast={onToast} onPostClick={onPostClick} roomId={roomId} onFanProfile={onFanProfile} />
//                     </motion.div>
//                   );
//                 }

//                 if (p.type === "debate") {
//                   const liveTotal = (p.agreeCount ?? 0) + (p.disagreeCount ?? 0);
//                   const agrPct = liveTotal > 0 ? Math.round(((p.agreeCount ?? 0) / liveTotal) * 100) : 50;
//                   const disAgrPct = 100 - agrPct;
//                   const userVote = p.userVote;
//                   const hasVoted = userVote === "agree" || userVote === "disagree";
//                   const displayVotedA = userVote === "agree";
//                   const displayVotedB = userVote === "disagree";
//                   const rawText = p.text ?? "";
//                   const vsParts = rawText.split(" VS ");
//                   const hasSides = !!(p.sideA || p.sideB);
//                   const sideA = p.sideA || vsParts[0] || "Side A";
//                   const sideB = p.sideB || vsParts[1] || "Side B";
//                   const questionText = hasSides ? rawText : null;
//                   const debatePayload = { id: p.id, text: p.text, fan: p.fan, timeAgo: p.timeAgo, createdAt: p.createdAt, type: "debate", isDbPost: true, roomId, mediaUrls: p.mediaUrls, sideA, sideB };
//                   return (
//                     <motion.div key={p.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}
//                       className="cursor-pointer" style={{ padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.07)" }}
//                       onClick={() => onPostClick?.(debatePayload)}
//                     >
//                       {renderPostHeader(p, "debate", () => onFanProfile?.(p.fan))}
//                       {questionText && <p style={{ fontWeight: 600, fontSize: 10, lineHeight: 1.3, marginBottom: 3, color: "var(--text-primary)" }}>{questionText}</p>}
//                       <div style={{ display: "flex", gap: 6, alignItems: "stretch", marginBottom: 4 }}>
//                         {[
//                           { label: sideA, voted: displayVotedA, color: "var(--accent-magenta)", bg: "rgba(233,30,140,0.08)", border: "rgba(233,30,140,0.3)", voteVal: "agree" as const },
//                           { label: sideB, voted: displayVotedB, color: "#60a5fa", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.3)", voteVal: "disagree" as const },
//                         ].map(({ label, voted, color, bg, border, voteVal }, idx) => (
//                           <>
//                             {idx === 1 && <div key="vs" style={{ display: "flex", alignItems: "center", padding: "0 1px" }}><span className="font-display" style={{ fontSize: 14, color: "var(--text-muted)" }}>VS</span></div>}
//                             <motion.button key={voteVal} whileTap={!hasVoted ? { scale: 0.96 } : {}}
//                               onClick={async (e) => {
//                                 e.stopPropagation();
//                                 if (hasVoted || votingInProgressRef.current.has(p.id)) return;
//                                 votingInProgressRef.current.add(p.id);
//                                 setPosts(prev => prev.map(x => x.id !== p.id ? x : { ...x, userVote: voteVal, agreeCount: (x.agreeCount ?? 0) + (voteVal === "agree" ? 1 : 0), disagreeCount: (x.disagreeCount ?? 0) + (voteVal === "disagree" ? 1 : 0) }));
//                                 setOpenInlinePostId(p.id);
//                                 try {
//                                   await axios.post(`/api/roar/rooms/${roomId}/messages/${p.id}/vote`, { vote: voteVal });
//                                   if (phog) {
//                                     phog.capture("poll_voted", {
//                                       poll_id: p.id,
//                                       poll_type: "debate_vs",
//                                       option_id: voteVal,
//                                       room_id: roomId,
//                                       room_name: roomName || ""
//                                     });
//                                   }
//                                 } catch (err: any) {
//                                   const status = err?.response?.status;
//                                   if (status !== 409 && status !== 400) {
//                                     setPosts(prev => prev.map(x => x.id !== p.id ? x : { ...x, userVote: null, agreeCount: Math.max(0, (x.agreeCount ?? 0) - (voteVal === "agree" ? 1 : 0)), disagreeCount: Math.max(0, (x.disagreeCount ?? 0) - (voteVal === "disagree" ? 1 : 0)) }));
//                                     onToast("Failed to submit vote");
//                                   }
//                                 } finally { votingInProgressRef.current.delete(p.id); }
//                               }}
//                               disabled={hasVoted}
//                               style={{ flex: 1, padding: "6px", borderRadius: "0px", textAlign: "center", background: voted ? color : bg, border: `2px solid ${voted ? color : border}`, color: voted ? "white" : "var(--text-primary)", cursor: hasVoted ? "not-allowed" : "pointer", transition: "all 0.2s", opacity: hasVoted && !voted ? 0.35 : 1 }}
//                             >
//                               <p style={{ fontSize: 10, fontWeight: 700, margin: 0 }}>{voted ? "✓ " : ""}{label}</p>
//                             </motion.button>
//                           </>
//                         ))}
//                       </div>
//                       <div style={{ marginBottom: 1 }}>
//                         <div style={{ display: "flex", borderRadius: 0, overflow: "hidden", height: 1.5, background: "rgba(255,255,255,0.06)" }}>
//                           <div style={{ width: `${agrPct}%`, background: "var(--accent-magenta)", transition: "width 0.4s ease" }} />
//                           <div style={{ width: `${disAgrPct}%`, background: "#60a5fa", transition: "width 0.4s ease" }} />
//                         </div>
//                         <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
//                           <span style={{ fontSize: 7, fontWeight: 700, color: "var(--accent-magenta)" }}>{agrPct}%</span>
//                           <span style={{ fontSize: 8, color: "var(--text-muted)", fontWeight: 500 }}>{liveTotal} vote{liveTotal !== 1 ? "s" : ""}</span>
//                           <span style={{ fontSize: 7, fontWeight: 700, color: "#60a5fa" }}>{disAgrPct}%</span>
//                         </div>
//                       </div>
//                       {liveTotal > 0 && (
//                         <button
//                           type="button"
//                           onClick={(e) => { e.stopPropagation(); setVotersMsgId(p.id); setVotersMode("debate"); }}
//                           style={{
//                             display: "flex", alignItems: "center", gap: 4,
//                             width: "100%", marginBottom: 4,
//                             padding: "4px 8px", borderRadius: 6,
//                             background: "rgba(233,30,140,0.07)",
//                             border: "1px solid rgba(233,30,140,0.22)",
//                             cursor: "pointer", color: "var(--accent-magenta)",
//                             fontSize: 9, fontWeight: 700,
//                           }}
//                         >
//                           <Users size={10} />
//                           <span>View Votes</span>
//                         </button>
//                       )}
//                       <p style={{ fontSize: 9, fontWeight: hasVoted ? 600 : 400, color: hasVoted ? "var(--accent-magenta)" : "var(--text-muted)", marginBottom: 6, fontStyle: hasVoted ? "normal" : "italic" }}>
//                         {hasVoted ? "You've already voted · thanks for joining the debate!" : "Tap a side to vote · results reveal after voting"}
//                       </p>
//                       {renderActionBar(p, debatePayload, "debate")}
//                     </motion.div>
//                   );
//                 }

//                 const defaultPayload = { id: p.id, text: p.text, fan: p.fan, timeAgo: p.timeAgo, createdAt: p.createdAt, type: p.type || "post", isDbPost: true, roomId, mediaUrls: p.mediaUrls };

//                 return (
//                   <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}
//                     className="cursor-pointer" style={{ padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.07)" }}
//                     onClick={() => onPostClick?.(defaultPayload)}
//                   >
//                     {renderPostHeader(p, p.type || "post", () => onFanProfile?.(p.fan))}

//                     {/* {p.memTag === "wave" ? (
//                       <WaveInlineContent
//                         post={p}
//                         liveCount={liveCount}
//                         onReact={handleReact}
//                         localReactions={localReactions}
//                         onCelebrate={() => setCelebration({ memTag: "wave" })}
//                       />
//                      ) : (
//                       <>
//                         <p
//                           className="leading-snug text-white"
//                           style={
//                             p.memTag && ["wicket", "six", "four", "catch", "boundary", "frango", "redcard", "yellowcard", "goal"].includes(p.memTag)
//                               ? { fontSize: 13, fontWeight: 800, letterSpacing: "0.02em", textTransform: "uppercase", margin: "3px 0" }
//                               : { fontSize: 10 }
//                           }
//                         >
//                           {p.text}
//                         </p>
//                         {p.type === "raw_reactions" && p.memGifUrl && <img src={p.memGifUrl} alt="reaction gif" style={{ width: "100%", maxHeight: 140, objectFit: "cover", borderRadius: 10, marginTop: 6 }} />}
//                         {p.type === "raw_reactions" && p.memTag && !["wicket", "six", "four", "boundary"].includes(p.memTag) && (
//                           <span style={{ display: "inline-block", marginTop: 6, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "rgba(0,232,198,0.12)", color: "#00e8c6", border: "1px solid rgba(0,232,198,0.3)", letterSpacing: "0.04em" }}>#{p.memTag}</span>
//                         )}
//                       </>
//                     )} */}

//                     {p.memTag === "wave" ? (
//                       <WaveInlineContent
//                         post={p}
//                         liveCount={liveCount}
//                         onReact={handleReact}
//                         localReactions={localReactions}
//                         onCelebrate={() => setCelebration({ memTag: "wave" })}
//                       />
//                     ) : (
//                       <>
//                         <p
//                           className="leading-snug text-white"
//                           style={
//                             p.memTag && ["wicket", "six", "four", "catch", "boundary", "frango", "redcard", "yellowcard", "goal"].includes(p.memTag)
//                               ? { fontSize: 13, fontWeight: 800, letterSpacing: "0.02em", textTransform: "uppercase", margin: "3px 0" }
//                               : { fontSize: 10 }
//                           }
//                         >
//                           {p.text}
//                         </p>

//                         {/* NEW: play sound only, without showing video, for newly posted quick-reacts */}
//                         {p.memTag &&
//                           QUICK_REACT_VIDEO_MAP[p.memTag] &&
//                           newlyPostedIds.has(p.id) &&
//                           !videoEndedIds.has(p.id) && (
//                             <video
//                               src={QUICK_REACT_VIDEO_MAP[p.memTag]}
//                               autoPlay
//                               muted={false}
//                               playsInline
//                               onEnded={() => {
//                                 setNewlyPostedIds(prev => {
//                                   const next = new Set(prev);
//                                   next.delete(p.id);
//                                   return next;
//                                 });
//                                 setVideoEndedIds(prev => new Set([...prev, p.id]));
//                               }}
//                               style={{
//                                 position: "absolute",
//                                 width: 1,
//                                 height: 1,
//                                 opacity: 0,
//                                 pointerEvents: "none",
//                               }}
//                             />
//                           )}

//                         {p.type === "raw_reactions" && p.memGifUrl && (
//                           <img src={p.memGifUrl} alt="reaction gif" style={{ width: "100%", maxHeight: 140, objectFit: "cover", borderRadius: 10, marginTop: 6 }} />
//                         )}
//                         {p.type === "raw_reactions" && p.memTag && !["wicket", "six", "four", "boundary"].includes(p.memTag) && (
//                           <span style={{ display: "inline-block", marginTop: 6, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "rgba(0,232,198,0.12)", color: "#00e8c6", border: "1px solid rgba(0,232,198,0.3)", letterSpacing: "0.04em" }}>#{p.memTag}</span>
//                         )}
//                       </>
//                     )}

//                     {p.type === "prediction" && (() => {
//                       const liveTotal = (p.agreeCount ?? 0) + (p.disagreeCount ?? 0);
//                       const userVote = p.userVote;
//                       const hasVoted = userVote === "agree" || userVote === "disagree";
//                       const predictionOptions = Array.isArray(p.predictionOptions) && p.predictionOptions.length >= 2 ? p.predictionOptions : [p.sideA || "Option 1", p.sideB || "Option 2"];
//                       const optionCounts = p.predictionOptionCounts ?? {};
//                       const predictionTotal = liveTotal + Object.values(optionCounts).reduce((sum: number, count: unknown) => sum + (Number(count) || 0), 0);
//                       const predictionPct = (count: number) => predictionTotal > 0 ? Math.round((count / predictionTotal) * 100) : 0;
//                       const predAgrPct = predictionPct(p.agreeCount ?? 0);
//                       const predDisAgrPct = predictionPct(p.disagreeCount ?? 0);
//                       const hasPredictionVoted = hasVoted || (typeof userVote === "string" && userVote.startsWith("option_"));
//                       const predictionClosed = Boolean(p.resolvedAt || p.closedAt || (p.closesAt && p.closesAt <= Date.now()));
//                       const isPredictionAuthor = isCurrentUserAuthor(p);
//                       const correctVoteLabel = getPredictionOptionLabel(p.correctVote, predictionOptions);
//                       return (
//                         <>
//                           <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}>
//                             <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 4, background: predictionClosed ? "rgba(244,67,54,0.12)" : "rgba(34,197,94,0.1)", color: predictionClosed ? "#f87171" : "#22c55e", border: `1px solid ${predictionClosed ? "rgba(244,67,54,0.25)" : "rgba(34,197,94,0.22)"}` }}>
//                               <Clock size={9} /> {formatPredictionCloseLabel(p)}
//                             </span>
//                           </div>
//                           <div style={{ display: "flex", gap: 6, marginTop: 4, marginBottom: 3 }}>
//                             {predictionOptions.slice(0, 2).map((label: string, optionIndex: number) => {
//                               const agree = optionIndex === 0;
//                               const pctVal = optionIndex === 0 ? predAgrPct : predDisAgrPct;
//                               const active = optionIndex === 0 ? userVote === "agree" : userVote === "disagree";
//                               return (
//                                 <motion.button key={label} disabled={predictionClosed} whileTap={!hasPredictionVoted && !predictionClosed ? { scale: 0.93 } : {}}
//                                   onClick={async (e) => {
//                                     e.stopPropagation();
//                                     if (hasPredictionVoted || predictionClosed) return;
//                                     setPosts(prev => prev.map(x => x.id !== p.id ? x : { ...x, userVote: agree ? "agree" : "disagree", agreeCount: (x.agreeCount ?? 0) + (agree ? 1 : 0), disagreeCount: (x.disagreeCount ?? 0) + (!agree ? 1 : 0) }));
//                                     try {
//                                       await axios.post(`/api/roar/rooms/${roomId}/messages/${p.id}/vote`, { vote: agree ? "agree" : "disagree" });
//                                       if (phog) {
//                                         phog.capture("poll_voted", {
//                                           poll_id: p.id,
//                                           poll_type: p.type || "prediction",
//                                           option_id: agree ? "agree" : "disagree",
//                                           room_id: roomId,
//                                           room_name: roomName || ""
//                                         });
//                                         phog.capture("submit_prediction", {
//                                           post_id: p.id,
//                                           room_id: roomId,
//                                           option_id: agree ? "agree" : "disagree",
//                                           room_name: roomName || ""
//                                         });
//                                       }
//                                     } catch { onToast("You've already voted!!"); }
//                                   }}
//                                   style={{ flex: 1, padding: "3px", borderRadius: 0, fontSize: 10, fontWeight: 700, cursor: hasPredictionVoted || predictionClosed ? "default" : "pointer", border: `2px solid ${active ? "#ff6b35" : "#8b8b8b"}`, background: active ? "rgba(255,107,53,0.24)" : "rgba(255,255,255,0.02)", color: active ? "#fff" : "#d1d1d1", boxShadow: active ? "0 0 12px rgba(255,107,53,0.35)" : "none", transition: "all 0.2s ease-in-out", display: "flex", alignItems: "center", justifyContent: "center", gap: 4, opacity: (hasPredictionVoted || predictionClosed) && !active ? 0.4 : 1 }}
//                                 >
//                                   {label}
//                                   <span style={{ fontSize: 9, fontWeight: 800, background: active ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)", borderRadius: 0, padding: "1px 5px" }}>{pctVal}%</span>
//                                 </motion.button>
//                               );
//                             })}
//                           </div>
//                           {predictionOptions.length > 2 && (
//                             <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 3 }}>
//                               {predictionOptions.slice(2).map((label: string, idx: number) => {
//                                 const voteValue = `option_${idx + 2}`;
//                                 const active = userVote === voteValue;
//                                 const pctVal = predictionPct(optionCounts[voteValue] ?? 0);
//                                 return (
//                                   <button key={`${label}-${idx}`} type="button" disabled={hasPredictionVoted || predictionClosed}
//                                     onClick={async (e) => {
//                                       e.stopPropagation();
//                                       if (hasPredictionVoted || predictionClosed) return;
//                                       setPosts(prev => prev.map(x => x.id !== p.id ? x : { ...x, userVote: voteValue, predictionOptionCounts: { ...(x.predictionOptionCounts ?? {}), [voteValue]: ((x.predictionOptionCounts ?? {})[voteValue] ?? 0) + 1 } }));
//                                       try {
//                                         await axios.post(`/api/roar/rooms/${roomId}/messages/${p.id}/vote`, { vote: voteValue });
//                                         if (phog) {
//                                           phog.capture("poll_voted", {
//                                             poll_id: p.id,
//                                             poll_type: p.type || "prediction",
//                                             option_id: voteValue,
//                                             room_id: roomId,
//                                             room_name: roomName || ""
//                                           });
//                                           phog.capture("submit_prediction", {
//                                             post_id: p.id,
//                                             room_id: roomId,
//                                             option_id: voteValue,
//                                             room_name: roomName || ""
//                                           });
//                                         }
//                                       } catch { onToast("You've already voted!!"); }
//                                     }}
//                                     style={{ flex: "1 1 calc(50% - 3px)", minWidth: 0, padding: "4px", borderRadius: 0, fontSize: 9, fontWeight: 700, border: `2px solid ${active ? "#ff6b35" : "#8b8b8b"}`, background: active ? "rgba(255,107,53,0.24)" : "rgba(255,255,255,0.02)", color: active ? "#fff" : "#d1d1d1", boxShadow: active ? "0 0 12px rgba(255,107,53,0.35)" : "none", textAlign: "center", opacity: (hasPredictionVoted || predictionClosed) && !active ? 0.4 : 1, cursor: hasPredictionVoted || predictionClosed ? "default" : "pointer" }}
//                                   >
//                                     {label}
//                                     <span style={{ marginLeft: 4, fontSize: 9, fontWeight: 800, background: active ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)", borderRadius: 0, padding: "1px 5px" }}>{pctVal}%</span>
//                                   </button>
//                                 );
//                               })}
//                             </div>
//                           )}
//                           {predictionTotal > 0 && (
//                             <button
//                               type="button"
//                               onClick={(e) => { e.stopPropagation(); setVotersMsgId(p.id); setVotersMode("prediction"); }}
//                               style={{
//                                 display: "flex", alignItems: "center", gap: 4,
//                                 width: "100%", marginTop: 1, marginBottom: 4,
//                                 padding: "4px 8px", borderRadius: 6,
//                                 background: "rgba(255,107,53,0.08)",
//                                 border: "1px solid rgba(255,107,53,0.22)",
//                                 cursor: "pointer", color: "#ff8a5c",
//                                 fontSize: 9, fontWeight: 700,
//                               }}
//                             >
//                               <Users size={10} />
//                               <span>View Votes</span>
//                             </button>
//                           )}
//                           {predictionClosed && !p.resolvedAt && isPredictionAuthor && (
//                             <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6, marginBottom: 3 }}>
//                               {predictionOptions.map((label: string, optionIndex: number) => (
//                                 <button key={`room-resolve-${label}-${optionIndex}`} type="button" disabled={resolvingRoomPredictionId === p.id}
//                                   onClick={(e) => { e.stopPropagation(); resolveRoomPrediction(p.id, getPredictionVoteValue(optionIndex)); }}
//                                   style={{ flex: "1 1 calc(50% - 3px)", minWidth: 0, padding: "7px", borderRadius: 10, fontSize: 10, fontWeight: 800, border: "1px solid rgba(34,197,94,0.35)", background: "rgba(34,197,94,0.1)", color: "#22c55e", cursor: resolvingRoomPredictionId === p.id ? "wait" : "pointer" }}
//                                 >
//                                   Resolve: {label}
//                                 </button>
//                               ))}
//                             </div>
//                           )}
//                           {p.resolvedAt && correctVoteLabel && (
//                             <p style={{ fontSize: 10, color: "#22c55e", fontWeight: 800, marginTop: 6, marginBottom: 3 }}>Correct answer: {correctVoteLabel}</p>
//                           )}
//                         </>
//                       );
//                     })()}

//                     {p.mediaUrls?.length > 0 && (
//                       <div className="flex flex-col gap-1.5 mt-1.5">
//                         {p.mediaUrls.map((url: string, i: number) =>
//                           url.endsWith(".mp4") || url.includes("/video/upload/")
//                             ? <video key={i} src={url} controls className="w-full max-h-[160px] rounded-lg object-cover" onClick={e => e.stopPropagation()} />
//                             : <img key={i} src={url} alt="" className="w-full max-h-[120px] rounded-lg object-cover" />
//                         )}
//                       </div>
//                     )}

//                     {p.type === "hottake" && (() => {
//                       const liveTotal = (p.agreeCount ?? 0) + (p.disagreeCount ?? 0);
//                       const agrPct = liveTotal > 0 ? Math.round(((p.agreeCount ?? 0) / liveTotal) * 100) : 50;
//                       const disAgrPct = 100 - agrPct;
//                       const userVote = p.userVote;
//                       const hasVoted = userVote === "agree" || userVote === "disagree";
//                       return (
//                         <div style={{ marginTop: 8, marginBottom: 3 }}>
//                           <div style={{ display: "flex", borderRadius: 0, overflow: "hidden", height: 4, background: "rgba(255,255,255,0.06)", marginBottom: 6 }}>
//                             <div style={{ width: `${agrPct}%`, background: "var(--accent-magenta)", transition: "width 0.4s ease" }} />
//                             <div style={{ width: `${disAgrPct}%`, background: "var(--accent-orange)", transition: "width 0.4s ease" }} />
//                           </div>
//                           <div style={{ display: "flex", gap: 6 }}>
//                             {[
//                               { agree: true, label: "Agree", pctVal: agrPct, active: userVote === "agree", color: "var(--accent-magenta)" },
//                               { agree: false, label: "Disagree", pctVal: disAgrPct, active: userVote === "disagree", color: "var(--accent-orange)" },
//                             ].map(({ agree, label, pctVal, active, color }) => (
//                               <motion.button key={label} whileTap={!hasVoted ? { scale: 0.93 } : {}}
//                                 onClick={async (e) => {
//                                   e.stopPropagation();
//                                   if (hasVoted) return;
//                                   setPosts(prev => prev.map(x => x.id !== p.id ? x : { ...x, userVote: agree ? "agree" : "disagree", agreeCount: (x.agreeCount ?? 0) + (agree ? 1 : 0), disagreeCount: (x.disagreeCount ?? 0) + (!agree ? 1 : 0) }));
//                                   setOpenInlinePostId(p.id);
//                                   try {
//                                     await axios.post(`/api/roar/rooms/${roomId}/messages/${p.id}/vote`, { vote: agree ? "agree" : "disagree" });
//                                     if (phog) {
//                                       phog.capture("poll_voted", {
//                                         poll_id: p.id,
//                                         poll_type: p.type || "hot_take",
//                                         option_id: agree ? "agree" : "disagree",
//                                         room_id: roomId,
//                                         room_name: roomName || ""
//                                       });
//                                     }
//                                   } catch { onToast("Failed to submit vote"); }
//                                 }}
//                                 style={{ flex: 1, padding: "8px", borderRadius: 0, fontSize: 10, fontWeight: 700, cursor: hasVoted ? "default" : "pointer", border: `2.5px solid ${color}`, background: active ? color : "rgba(255,255,255,0.02)", color: active ? "white" : color, boxShadow: active ? `0 0 14px ${color}60` : "none", transition: "all 0.2s ease-in-out", display: "flex", alignItems: "center", justifyContent: "center", gap: 4, opacity: hasVoted && !active ? 0.4 : 1 }}
//                               >
//                                 {active ? `✓ ${agree ? "Agreed" : "Disagreed"}` : label}
//                                 <span style={{ fontSize: 9, fontWeight: 800, background: active ? "rgba(255,255,255,0.2)" : `${color}22`, borderRadius: 0, padding: "1px 5px" }}>{pctVal}%</span>
//                               </motion.button>
//                             ))}
//                           </div>
//                         </div>
//                       );
//                     })()}

//                     {renderActionBar(p, { ...defaultPayload, replyCount: p.replyCount }, p.type || "post")}
//                   </motion.div>
//                 );
//               })
//             )}
//         </AnimatePresence>

//         {hasMoreMsgs && !loading && (
//           <div ref={sentinelRef} style={{ display: "flex", justifyContent: "center", padding: "12px 0" }}>
//             {loadingMoreMsgs && <div style={{ width: 24, height: 24, borderRadius: "50%", border: "3px solid rgba(255,255,255,0.1)", borderTop: "3px solid #E91E8C", animation: "dr-spin 0.8s linear infinite" }} />}
//           </div>
//         )}
//       </div>

//       <style dangerouslySetInnerHTML={{ __html: `@keyframes dr-spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}` }} />

//       {!showQuickCompose && !dollyOpen && (
//         <div className="flex justify-start gap-1 py-1 px-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
//           {RADIAL_OPTS.map((q) => {
//             const isActive = q.id === selectedActionId;
//             return (
//               <div key={q.id} className="flex items-center gap-1 shrink-0">
//                 <button type="button"
//                   onClick={() => { setSelectedActionId(q.id); onCompose?.(q.id); if (q.id !== "post") setSelectedActionId("post"); }}
//                   className={["flex items-center justify-start gap-1 px-2.5 rounded-full text-[10px] font-bold whitespace-nowrap border transition-all duration-150 cursor-pointer shrink-0", isActive ? "border-[rgba(233,30,140,0.35)] bg-[rgba(233,30,140,0.12)]" : "border-transparent bg-[rgba(255,255,255,0.04)] text-[rgba(255,255,255,0.6)]"].join(" ")}
//                 >
//                   {composeIconMap[q.id] || <span>{q.emoji}</span>}
//                   <span>{q.label}</span>
//                 </button>
//                 {q.id === "debate" && postCooldown > 0 && (
//                   <span
//                     style={{
//                       display: "flex", alignItems: "center", justifyContent: "center",
//                       minWidth: 18, height: 18, borderRadius: 999, padding: "0 5px",
//                       background: "rgba(248,113,113,0.15)", border: "1px solid rgba(248,113,113,0.4)",
//                       color: "#f87171", fontSize: 9, fontWeight: 800,
//                     }}
//                     title="Posting cooldown"
//                   >
//                     {postCooldown}s
//                   </span>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       )}

//       <div className="shrink-0 px-2.5 pt-1 pb-1.5 bg-[rgba(14,14,20,0.98)] backdrop-blur-[20px] border-t border-[var(--border)] flex flex-col gap-1">
//         {selectedActionId === "post" && !dollyOpen && (
//           <>
//             <AnimatePresence>
//               {showQuickCompose && (
//                 <motion.div
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: "auto" }}
//                   exit={{ opacity: 0, height: 0 }}
//                   transition={{ duration: 0.2, ease: "easeOut" }}
//                   style={{ overflow: "hidden" }}
//                 >
//                   <div style={{ paddingBottom: 3, paddingTop: 0 }}>
//                     <p style={{ fontSize: 7, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>
//                       Quick Post
//                     </p>
//                     <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 0.5, scrollbarWidth: "none" }}>
//                       {QUICK_REACT_OPTS
//                         .filter((q) => q.sport === roomSports?.toLowerCase() || q.sport === "both")
//                         .map((q) => (
//                           <motion.button
//                             key={q.id}
//                             type="button"
//                             whileTap={{ scale: 0.93 }}
//                             onClick={() => handleQuickReactPost(q)}
//                             style={{
//                               flexShrink: 0,
//                               display: "flex",
//                               alignItems: "center",
//                               gap: 4,
//                               padding: "1.5px 8px",
//                               borderRadius: 999,
//                               border: q.id.includes("wicket") ? "1px solid rgba(233,30,140,0.4)"
//                                 : q.id.includes("six") ? "1px solid rgba(245,158,11,0.4)"
//                                   : q.id.includes("four") ? "1px solid rgba(249,115,22,0.4)"
//                                     : q.id.includes("wave") ? "1px solid rgba(56,189,248,0.4)"
//                                       : "1px solid rgba(16,185,129,0.4)",
//                               background: q.id.includes("wicket") ? "rgba(233,30,140,0.12)"
//                                 : q.id.includes("six") ? "rgba(245,158,11,0.12)"
//                                   : q.id.includes("four") ? "rgba(249,115,22,0.12)"
//                                     : q.id.includes("wave") ? "rgba(56,189,248,0.12)"
//                                       : "rgba(16,185,129,0.12)",
//                               color: "#fff",
//                               fontSize: 9,
//                               fontWeight: 700,
//                               cursor: "pointer",
//                               whiteSpace: "nowrap",
//                             }}
//                           >
//                             <span style={{ fontSize: 10 }}>{q.emoji}</span>
//                             <span>{q.label}</span>
//                           </motion.button>
//                         ))}
//                     </div>
//                   </div>
//                 </motion.div>
//               )}
//             </AnimatePresence>

//             {attachedUrl && (
//               <div className="px-2 py-1 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] flex justify-between items-center">
//                 <div className="flex items-center gap-1.5">
//                   {attachedType === "image"
//                     ? <img src={attachedUrl} className="w-7 h-7 rounded-lg object-cover" alt="Attached" />
//                     : <video src={attachedUrl} className="w-7 h-7 rounded-lg object-cover" />}
//                   <span className="text-[10px] text-[var(--text-secondary)]">Media attached</span>
//                 </div>
//                 <button type="button" onClick={() => { setAttachedUrl(null); setAttachedType(null); }} className="bg-transparent border-none text-[var(--text-muted)] cursor-pointer text-xs">✕</button>
//               </div>
//             )}

//             {showEmojiPicker && (
//               <div ref={emojiPickerRef} className="w-full overflow-hidden rounded-xl border border-white/10" onClick={e => e.stopPropagation()}>
//                 <div className="flex items-center justify-between px-3 py-1 bg-[#1a1a24] border-b border-white/10">
//                   <span className="text-[10px] font-semibold text-white/40">Pick an emoji</span>
//                   <button type="button" onClick={() => setShowEmojiPicker(false)} className="w-5 h-5 flex items-center justify-center rounded-full bg-white/10 border-none cursor-pointer text-white text-xs font-bold leading-none">✕</button>
//                 </div>
//                 <div className="max-h-[180px] overflow-y-auto w-full [&>em-emoji-picker]:w-full">
//                   <EmojiPicker data={data} theme="dark" onEmojiSelect={(emoji: any) => { setInput(prev => prev + emoji.native); }} previewPosition="none" skinTonePosition="none" perLine={7} />
//                 </div>
//               </div>
//             )}

//             <div className="flex items-center w-full gap-0.5">
//               <button type="button" onClick={() => triggerUpload("image")} disabled={uploading} className="bg-transparent border-none -ml-1.5 text-white/40 cursor-pointer flex items-center justify-center p-1 shrink-0">
//                 <Image size={16} />
//               </button>

//               <button
//                 type="button"
//                 onClick={() => { setShowQuickCompose(prev => !prev); setShowEmojiPicker(false); }}
//                 className="bg-transparent border-none cursor-pointer flex items-center justify-center p-1 shrink-0"
//                 style={{
//                   color: showQuickCompose ? "#e91e8c" : "rgba(255,255,255,0.4)",
//                   fontSize: 18,
//                   fontWeight: 300,
//                   lineHeight: 1,
//                   width: 24,
//                   height: 24,
//                   borderRadius: "50%",
//                   background: showQuickCompose ? "rgba(233,30,140,0.12)" : "transparent",
//                   border: showQuickCompose ? "1px solid rgba(233,30,140,0.3)" : "1px solid transparent",
//                   transition: "all 0.15s",
//                 }}
//               >
//                 {showQuickCompose ? "✕" : "🎭"}
//               </button>

//               <button
//                 type="button"
//                 onClick={() => { setShowEmojiPicker(prev => !prev); setShowQuickCompose(false); }}
//                 className="bg-transparent border-none cursor-pointer -ml-0.5 flex items-center justify-center p-1 shrink-0 text-[16px] leading-none"
//                 style={{ color: showEmojiPicker ? "#e91e8c" : "rgba(255,255,255,0.4)" }}
//               >
//                 😊
//               </button>
//               {/* 
//               <div className="flex-1 relative min-w-0">
//                 {input === "" && !uploading && postCooldown === 0 && (
//                   <div className="absolute left-2.5 top-0 bottom-0 flex items-center pointer-events-none">
//                     <span className="text-xs font-medium truncate" style={{ color: MODE_COLOR["post"] || "var(--text-secondary)" }}>{PLACEHOLDER["post"]}</span>
//                   </div>
//                 )}
//                 <input
//                   type="text"
//                   disabled={uploading || postCooldown > 0}
//                   value={input}
//                   onChange={e => setInput(e.target.value)}
//                   // onKeyDown={e => e.key === "Enter" && send()}
//                   onKeyDown={e => {
//                     if (e.key === "Enter") {
//                       e.preventDefault();
//                       send();
//                     }
//                   }}
//                   placeholder={postCooldown > 0 ? `Wait ${postCooldown}s before posting …` : ""}
//                   className="w-full h-8 rounded-[16px] bg-[var(--bg-secondary)] border border-[var(--border)] pl-2.5 pr-2.5 text-white text-xs outline-none"
//                   style={{ opacity: postCooldown > 0 ? 0.5 : 1 }}
//                 />
//               </div> */}

//               <div className="flex-1 relative min-w-0">
//                 {mention.showMentionPopup && (
//                   <MentionPopup
//                     mentionUsers={mention.mentionUsers}
//                     mentionIndex={mention.mentionIndex}
//                     setMentionIndex={mention.setMentionIndex}
//                     onSelect={(u) => mention.insertMention(u, input, setInput, mainInputRef)}
//                   />
//                 )}
//                 {input === "" && !uploading && postCooldown === 0 && (
//                   <div className="absolute left-2.5 top-0 bottom-0 flex items-center pointer-events-none">
//                     <span className="text-xs font-medium truncate" style={{ color: MODE_COLOR["post"] || "var(--text-secondary)" }}>{PLACEHOLDER["post"]}</span>
//                   </div>
//                 )}
//                 <input
//                   ref={mainInputRef}
//                   type="text"
//                   disabled={uploading || postCooldown > 0}
//                   value={input}
//                   onChange={e => {
//                     const value = e.target.value;
//                     setInput(value);
//                     mention.handleMentionInputChange(value, e.target.selectionStart || value.length);
//                   }}
//                   onKeyDown={e => {
//                     if (mention.handleMentionKeyDown(e, input, setInput, mainInputRef)) return;
//                     if (e.key === "Enter") {
//                       e.preventDefault();
//                       send();
//                     }
//                   }}
//                   placeholder={postCooldown > 0 ? `Wait ${postCooldown}s before posting …` : ""}
//                   className="w-full h-8 rounded-[16px] bg-[var(--bg-secondary)] border border-[var(--border)] pl-2.5 pr-2.5 text-white text-xs outline-none"
//                   style={{ opacity: postCooldown > 0 ? 0.5 : 1 }}
//                 />
//               </div>

//               <motion.button
//                 whileTap={{ scale: 0.96 }} onClick={send} disabled={uploading || isSending || postCooldown > 0}
//                 className="w-6 h-6 rounded-full border-none -mr-1.5 text-white text-base font-bold flex items-center justify-center cursor-pointer shrink-0 bg-gradient-to-br from-[#e91e8c] to-[#ff6b35]"
//                 style={{ opacity: uploading ? 0.5 : 1 }}
//               >
//                 ↑
//               </motion.button>
//             </div>
//           </>
//         )}
//       </div>

//       <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

//       <VotersDialog
//         postId={votersMsgId ?? ""}
//         isOpen={votersMsgId !== null}
//         onClose={() => setVotersMsgId(null)}
//         roomId={roomId}
//         mode={votersMode}
//       />

//       <ReactionsDialog postId={reactionsMsgId ?? ""} isOpen={reactionsMsgId !== null} onClose={() => setReactionsMsgId(null)} onFanProfile={onFanProfile} roomId={roomId} />
//       <ActiveFansDialog
//         roomId={roomId}
//         isOpen={activeFansOpen}
//         onClose={() => setActiveFansOpen(false)}
//         onFanProfile={onFanProfile}
//         prefetchedFans={activeFans}
//         prefetchedCount={liveCount}
//       />

//       <DollyPanel
//         isOpen={dollyOpen}
//         onOpen={() => { setDollyOpen(true); loadDollyHistory(); }}
//         onClose={() => setDollyOpen(false)}
//         activeRoomId={dollyActiveRoomId}
//         activeRoomName={dollyActiveRoomName}
//         question={dollyQuestion}
//         setQuestion={setDollyQuestion}
//         asking={dollyAsking}
//         onAsk={askDolly}
//         replies={dollyReplies}
//         loadingReplies={dollyRepliesLoading}
//         history={dollyHistory}
//         loadingHistory={dollyHistoryLoading}
//         onSelectHistorySession={handleSelectDollySession}
//         onNewChat={handleNewDollyChat}
//       />

//       <AnimatePresence>
//         {notifToast && (
//           <motion.div initial={{ opacity: 0, y: -60, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -40, scale: 0.95 }} transition={{ duration: 0.22, ease: "easeOut" }} onClick={() => setNotifToast(null)}
//             style={{ position: "fixed", top: 14, left: 14, right: 14, zIndex: 100, display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 18, background: notifToast.type === "comment" ? "rgba(147,51,234,0.92)" : "rgba(233,30,140,0.92)", backdropFilter: "blur(12px)", border: `1px solid ${notifToast.type === "comment" ? "rgba(147,51,234,0.5)" : "rgba(233,30,140,0.5)"}`, boxShadow: `0 8px 32px ${notifToast.type === "comment" ? "rgba(147,51,234,0.35)" : "rgba(233,30,140,0.35)"}`, cursor: "pointer", wordBreak: "break-word" }}
//           >
//             <span style={{ fontSize: 10, flexShrink: 0 }}>{notifToast.type === "comment" ? "💬" : "❤️"}</span>
//             <span style={{ fontSize: 11, fontWeight: 600, color: "#fff", wordBreak: "break-word" }}>{notifToast.message}</span>
//             <span style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", flexShrink: 0, marginLeft: 3 }}>tap to dismiss</span>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <AnimatePresence>
//         {joinToast && (
//           <motion.div
//             key={joinToast.username + Date.now()}
//             initial={{ opacity: 0, y: -30, scale: 0.96 }}
//             animate={{ opacity: 1, y: 0, scale: 1 }}
//             exit={{ opacity: 0, y: -20, scale: 0.96 }}
//             transition={{ duration: 0.2, ease: "easeOut" }}
//             className="fixed top-3.5 left-0 right-0 mx-auto w-fit max-w-[88vw] sm:max-w-[340px] z-[100] flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/90 backdrop-blur-md border border-emerald-500/50 shadow-[0_8px_24px_rgba(34,197,94,0.3)]"
//           >
//             <span className="text-[11px] shrink-0">👋</span>
//             <span className="text-[11px] font-bold text-white whitespace-nowrap overflow-hidden text-ellipsis">
//               {joinToast.username} has joined
//             </span>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }










import React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion";
import { useUserProfile } from "@/context/UserProfileContext";
import axios from "axios";
import AvatarWithBadge from "../components/AvatarWithBadge";
import ReactionPicker, { type Reaction } from "../components/ReactionPicker";
import ReactionsDialog from "../components/ReactionsDialog";
import ActiveFansDialog from "../components/ActiveFansDialog";
import EmojiPicker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { roarApi } from "@/lib/roarApi";
import { RADIAL_OPTS } from "../constants";
import {
  Image, ChevronLeft, Flame, TrendingUp, Zap, History, PenTool,
  Brain, Users, CheckCircle2, XCircle, Volume2, VolumeX,
  Share2, Send, ChevronDown, ChevronUp, Clock, MoreVertical, Trash2,
} from "lucide-react";
import PredictionsLivePanel from "../components/PredictionsLivePanel";
import DollyPanel, { type DollyHistorySession } from "../components/DollyPanel";
import VotersDialog from "../components/VotersDialog";

// Fail fast instead of hanging forever on flaky connections. Without this,
// a request that never resolves (weak signal, backgrounded app, etc.) leaves
// the corresponding "in flight" lock (sendingRef / pendingReactRef /
// votingInProgressRef) stuck forever, silently blocking all future
// sends/votes/reactions until the user force-closes and reopens the app.
const REQUEST_TIMEOUT_MS = 12000;
// Presence polling (join heartbeat / active-fans refresh) gets a longer
// timeout than other requests: it's a background poll, not a user-initiated
// action, so a slower-but-successful response is strictly better than a
// spurious failure.
const PRESENCE_TIMEOUT_MS = 20000;

interface Props {
  onBack: () => void;
  onToast: (m: string) => void;
  roomId?: string;
  roomName?: string;
  onPostClick?: (post: any) => void;
  onCompose?: (type: string | null) => void;
  fanCount?: number;
  score?: string;
  scoreSubtitle?: string;
  currentAvatarUrl?: string;
  currentUserId?: string;
  onRegisterRefresh?: (fn: () => void) => void;
  onRegisterReplyUpdate?: (fn: (postId: string, count: number) => void) => void;
  onFanProfile?: (fan: any) => void;
  watchAlongRoomId?: string;
  roomSports?: string;
  onRegisterInjectPost?: (fn: (post: any) => void) => void;
  onRegisterOptimisticSwap?: (fn: (tempId: string, realMsg?: any) => void) => void;
}

const QUICK_REACT_OPTS = [
  { id: "qr_wicket", label: "Wicket!", emoji: "🎯", sport: "cricket" },
  { id: "qr_six", label: "Six!!", emoji: "💪", sport: "cricket" },
  { id: "qr_four", label: "Four!", emoji: "🏏", sport: "cricket" },
  { id: "qr_catch", label: "Catch!", emoji: "🧤", sport: "cricket" },
  { id: "qr_goal", label: "Goal!!", emoji: "⚽", sport: "football" },
  { id: "qr_redcard", label: "Red Card!", emoji: "🟥", sport: "football" },
  { id: "qr_frango", label: "Frango!", emoji: "🐔", sport: "football" },
  { id: "qr_yellowcard", label: "Yellow Card!", emoji: "🟨", sport: "football" },
  { id: "qr_wave", label: "Wave!", emoji: "🌊", sport: "both" },
];

const QUICK_REACT_GRADIENTS: Record<string, string> = {
  qr_wicket: "linear-gradient(135deg,#e91e8c,#c2185b)",
  qr_six: "linear-gradient(135deg,#f59e0b,#d97706)",
  qr_four: "linear-gradient(135deg,#f97316,#ea580c)",
  qr_catch: "linear-gradient(135deg,#3b82f6,#2563eb)",
  qr_frango: "linear-gradient(135deg,#f97316,#ea580c)",
  qr_redcard: "linear-gradient(135deg,#ef4444,#dc2626)",
  qr_yellowcard: "linear-gradient(135deg,#eab308,#ca8a04)",
  qr_goal: "linear-gradient(135deg,#10b981,#059669)",
};

const QUICK_REACT_VIDEO_MAP: Record<string, string> = {
  wicket: "/QUICK_REACT_VIDEO/wicket.mp4",
  six: "/QUICK_REACT_VIDEO/six.mp4",
  four: "/QUICK_REACT_VIDEO/four.mp4",
  catch: "/QUICK_REACT_VIDEO/catch.mp4",
  frango: "/QUICK_REACT_VIDEO/Frango.mp4",
  redcard: "/QUICK_REACT_VIDEO/RedCard.mp4",
  yellowcard: "/QUICK_REACT_VIDEO/Yellowcard.mp4",
  goal: "/QUICK_REACT_VIDEO/Goal.mp4",
};
const QUICK_REACT_IMAGES_MAP: Record<string, string> = {
  wicket: "/QUICK_REACT_IMAGES/Wicket.png",
  six: "/QUICK_REACT_IMAGES/Six.png",
  four: "/QUICK_REACT_IMAGES/Four.png",
  catch: "/QUICK_REACT_IMAGES/Catch.png",
  frango: "/QUICK_REACT_IMAGES/Frango.png",
  redcard: "/QUICK_REACT_IMAGES/Redcard.png",
  yellowcard: "/QUICK_REACT_IMAGES/Yellowcard.png",
  goal: "/QUICK_REACT_IMAGES/Goal.png",
};

const MODE_COLOR: Record<string, string> = {
  post: "var(--text-primary)",
  prediction: "var(--gold)",
  hottake: "#f87171",
  debate: "#e91e8c",
  raw_reactions: "#00e8c6",
};

const LOAD_MORE_PAGE_SIZE = 15;

const PLACEHOLDER: Record<string, string> = {
  post: "Drop your take...",
  debate: "My debate side: ",
  prediction: "My prediction: ",
  hottake: "Drop a hot take...",
  raw_reactions: "Share your raw reaction...",
};


interface MentionUser {
  userId: string;
  username: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  avatarUrl?: string;
  email?: string;
}

function useMentionAutocomplete(activeUsername?: string) {
  const [allUsers, setAllUsers] = useState<MentionUser[]>([]);
  const [mentionUsers, setMentionUsers] = useState<MentionUser[]>([]);
  const [showMentionPopup, setShowMentionPopup] = useState(false);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);

  const hasUnderscore = (u: any) => {
    const n = u.username || u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim();
    return n.includes("_") || (u.email || "").split("@")[0].includes("_");
  };

  useEffect(() => {
    axios.get("/api/users", { withCredentials: true, timeout: REQUEST_TIMEOUT_MS }).then(res => {
      if (!res.data?.users) return;
      const seen = new Set<string>();
      setAllUsers(res.data.users
        .filter((u: any) => {
          const n = u.username || u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim();
          return n !== activeUsername && !hasUnderscore(u);
        })
        .map((u: any) => ({
          userId: u.userId || u.id, username: u.username, firstName: u.firstName,
          lastName: u.lastName, name: u.name, avatarUrl: u.avatarUrl || u.avatar, email: u.email,
        }))
        .filter((u: MentionUser) => {
          const key = u.userId || u.username;
          if (!key || seen.has(key)) return false;
          const dn = u.username || u.name || `${u.firstName || ""}${u.lastName || ""}`.trim();
          if (dn.includes("_")) return false;
          seen.add(key); return true;
        }));
    }).catch(() => { });
  }, [activeUsername]);

  // Call this from the input's onChange
  const handleMentionInputChange = (value: string, cursorPos: number) => {
    setCursorPosition(cursorPos);
    const before = value.slice(0, cursorPos);
    const at = before.lastIndexOf("@");
    if (at !== -1) {
      const afterAt = before.slice(at + 1);
      if (!afterAt.includes(" ")) {
        const filtered = afterAt.trim() === ""
          ? allUsers.slice(0, 8)
          : allUsers.filter(u =>
            `${u.username || ""} ${u.firstName || ""} ${u.lastName || ""} ${u.email || ""}`
              .toLowerCase().includes(afterAt.toLowerCase())
          ).slice(0, 8);
        setMentionUsers(filtered);
        setShowMentionPopup(filtered.length > 0);
        setMentionIndex(0);
        return;
      }
    }
    setShowMentionPopup(false);
    setMentionUsers([]);
  };

  // Call this to splice the chosen mention into the text
  const insertMention = (
    user: MentionUser,
    currentText: string,
    setText: (t: string) => void,
    inputRef: React.RefObject<HTMLInputElement | null>
  ) => {
    const dn = user.username || user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email?.split("@")[0] || "user";
    const mt = `@${dn} `;
    const before = currentText.slice(0, cursorPosition);
    const at = before.lastIndexOf("@");
    const newText = `${currentText.slice(0, at)}${mt}${currentText.slice(cursorPosition)}`;
    setText(newText);
    setShowMentionPopup(false);
    setMentionUsers([]);
    setTimeout(() => {
      if (inputRef.current) {
        const p = at + mt.length;
        inputRef.current.focus();
        inputRef.current.setSelectionRange(p, p);
      }
    }, 10);
  };

  // Call this from the input's onKeyDown, BEFORE your existing Enter-to-send logic.
  // Returns true if it handled the keypress (so you should return early / not send).
  const handleMentionKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    currentText: string,
    setText: (t: string) => void,
    inputRef: React.RefObject<HTMLInputElement | null>
  ): boolean => {
    if (!showMentionPopup || mentionUsers.length === 0) return false;
    if (e.key === "ArrowDown") { e.preventDefault(); setMentionIndex(p => (p + 1) % mentionUsers.length); return true; }
    if (e.key === "ArrowUp") { e.preventDefault(); setMentionIndex(p => (p - 1 + mentionUsers.length) % mentionUsers.length); return true; }
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      if (mentionUsers[mentionIndex]) insertMention(mentionUsers[mentionIndex], currentText, setText, inputRef);
      return true;
    }
    if (e.key === "Escape") { setShowMentionPopup(false); setMentionUsers([]); return true; }
    return false;
  };

  return {
    mentionUsers, showMentionPopup, mentionIndex, setMentionIndex,
    handleMentionInputChange, handleMentionKeyDown, insertMention,
  };
}

function MentionPopup({
  mentionUsers, mentionIndex, setMentionIndex, onSelect, currentAvatarLookup,
}: {
  mentionUsers: MentionUser[];
  mentionIndex: number;
  setMentionIndex: (i: number) => void;
  onSelect: (u: MentionUser) => void;
  currentAvatarLookup?: (u: MentionUser) => string | undefined;
}) {
  return (
    <div style={{
      position: "absolute", bottom: "100%", left: 8, right: 8, marginBottom: 6,
      background: "#181c24", borderRadius: 14, border: "1px solid rgba(255,255,255,0.1)",
      overflow: "hidden", zIndex: 60, boxShadow: "0 8px 32px rgba(0,0,0,0.4)", maxHeight: 220, overflowY: "auto",
    }}>
      {mentionUsers.map((user, idx) => {
        const dn = user.username || user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email?.split("@")[0] || "user";
        return (
          <button
            key={user.userId}
            type="button"
            onClick={() => onSelect(user)}
            onMouseEnter={() => setMentionIndex(idx)}
            style={{
              display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px",
              border: "none", cursor: "pointer", textAlign: "left",
              background: idx === mentionIndex ? "rgba(233,30,140,0.15)" : "transparent",
            }}
          >
            <div style={{ width: 20, height: 20, borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: "linear-gradient(135deg,#e91e8c,#ff6b35)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {user.avatarUrl ? <img src={user.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 9, fontWeight: 800, color: "#fff" }}>{dn[0]?.toUpperCase()}</span>}
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>{dn}</span>
          </button>
        );
      })}
    </div>
  );
}

const typeBadgeClass = (type: string) => {
  const base = "text-[8px] font-extrabold px-1.5 py-0.5 rounded";
  if (type === "prediction") return `${base} bg-[rgba(255,215,0,0.15)] text-[#fbbf24] border border-[rgba(255,215,0,0.25)]`;
  if (type === "post") return `${base} bg-[rgba(233,30,140,0.12)] text-[#E91E8C] border border-[rgba(233,30,140,0.2)]`;
  if (type === "hottake") return `${base} bg-[rgba(239,68,68,0.15)] text-[#f87171] border border-[rgba(239,68,68,0.25)]`;
  if (type === "debate") return `${base} bg-[rgba(233,30,140,0.15)] text-[#e91e8c] border border-[rgba(233,30,140,0.25)]`;
  if (type === "raw_reactions") return `${base} bg-[rgba(0,232,198,0.15)] text-[#00e8c6] border border-[rgba(0,232,198,0.25)]`;
  return `${base} bg-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.5)] border border-[rgba(255,255,255,0.1)]`;
};

const commentAccentColor = (type: string) => {
  if (type === "prediction") return "#22c55e";
  if (type === "hottake") return "#f87171";
  if (type === "raw_reactions") return "#00e8c6";
  return "#e91e8c";
};

function ActiveFansStack({
  fans, count, totalJoinCount, onClick,
}: {
  fans: { uid: string; username: string; avatarUrl?: string | null }[];
  count: number;
  totalJoinCount?: number;
  onClick: () => void;
}) {
  if (count === 0 && !totalJoinCount) return null;
  const formatCount = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2px 0" }}>
      <button type="button" onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
        <div style={{ display: "flex" }}>
          {fans.slice(0, 3).map((fan, i) => (
            <div key={fan.uid} style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid #0e0e14", overflow: "hidden", marginLeft: i === 0 ? 0 : -6, zIndex: 3 - i, background: "linear-gradient(135deg,#e91e8c,#ff6b35)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {fan.avatarUrl ? <img src={fan.avatarUrl} alt={fan.username} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 8, fontWeight: 800, color: "#fff" }}>{fan.username?.[0]?.toUpperCase() || "?"}</span>}
            </div>
          ))}
        </div>
        <span style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>
          <span style={{ color: "#fff", fontWeight: 700 }}>{formatCount(count)}</span> active now
        </span>
      </button>
      {totalJoinCount !== undefined && totalJoinCount > 0 && (
        <span style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>
          Total Joined <span style={{ color: "#fff", fontWeight: 700 }}>{formatCount(totalJoinCount)}</span>
        </span>
      )}
    </div>
  );
}

function mentionMatchesAuthor(mentionToken: string, authorUsername: string): boolean {
  const mention = mentionToken.toLowerCase().trim();
  const uname = (authorUsername ?? "").toLowerCase().trim();
  if (uname === mention) return true;
  const segments = uname.split(/[\s_\.]+/).filter(Boolean);
  if (segments.some(seg => seg === mention)) return true;
  if (segments.join("") === mention.replace(/\s+/g, "")) return true;
  return false;
}

function threadSort(flat: any[]): any[] {
  const result: any[] = [];
  for (const comment of flat) {
    const text: string = (comment.text ?? "").trimStart();
    const mentionMatch = text.match(/^@(\S+)/);
    if (mentionMatch) {
      const mentionToken = mentionMatch[1];
      let insertAfter = -1;
      for (let i = result.length - 1; i >= 0; i--) {
        if (mentionMatchesAuthor(mentionToken, result[i].authorUsername ?? "")) {
          insertAfter = i;
          break;
        }
      }
      if (insertAfter >= 0) {
        let insertAt = insertAfter + 1;
        while (
          insertAt < result.length &&
          (result[insertAt].text ?? "").trimStart().match(/^@/)
        ) {
          insertAt++;
        }
        result.splice(insertAt, 0, comment);
        continue;
      }
    }
    result.push(comment);
  }
  return result;
}

function InlineSection({
  postId, roomId, roomName, isOpen, onOpenFull, accentColor, currentAvatarUrl,
  onCommentPosted, onCommentDeleted, currentUserId, currentUsername, onFanProfile,
}: {
  postId: string; roomId: string; roomName?: string; isOpen: boolean; onOpenFull: () => void;
  accentColor: string; currentAvatarUrl?: string; onCommentPosted: () => void;
  onCommentDeleted?: () => void;
  currentUserId?: string; currentUsername?: string; onFanProfile?: (fan: any) => void;
}) {
  const phog = usePostHog();
  const [replies, setReplies] = useState<any[]>([]);
  const [showAllReplies, setShowAllReplies] = useState(false);
  const [loading, setLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [sending, setSending] = useState(false);
  const [replyTo, setReplyTo] = useState<{ commentId: string; authorUsername: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isAnimatingHeight, setIsAnimatingHeight] = useState(true);
  const [commentReactions, setCommentReactions] = useState<Record<string, { reaction: Reaction | null; heartCount: number }>>({});
  const pendingCommentReactRef = useRef<Record<string, boolean>>({});
  const commentTopReactionsCache = useRef<Record<string, string[]>>({});
  const [commentTopReactionsMap, setCommentTopReactionsMap] = useState<Record<string, string[]>>({});
  const [reactionsDialogCommentId, setReactionsDialogCommentId] = useState<string | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const mention = useMentionAutocomplete(currentUsername);

  const REACTION_EMOJI: Record<string, string> = {
    fire: "🔥", heart: "❤️", mindblown: "🤯", goat: "🐐", clap: "👏",
    nochance: "🙅", laugh: "😂", sad: "😢", thumb: "👍",
  };

  const fetchCommentTopReactions = useCallback(async (commentId: string) => {
    if (commentTopReactionsCache.current[commentId] !== undefined) return;
    commentTopReactionsCache.current[commentId] = [];
    try {
      const res = await axios.get(`/api/roar/rooms/${roomId}/messages/${postId}/comments/${commentId}/reactions`, { timeout: REQUEST_TIMEOUT_MS });
      const reactors: { reaction: string }[] = res.data?.reactors ?? [];
      const counts: Record<string, number> = {};
      reactors.forEach(r => { counts[r.reaction] = (counts[r.reaction] ?? 0) + 1; });
      const top = Object.entries(counts).sort(([, a], [, b]) => b - a).slice(0, 3).map(([type]) => type);
      commentTopReactionsCache.current[commentId] = top;
      setCommentTopReactionsMap(prev => ({ ...prev, [commentId]: top }));
    } catch { commentTopReactionsCache.current[commentId] = []; }
  }, [roomId, postId]);

  const handleCommentReact = useCallback(async (commentId: string, reaction: Reaction | null) => {
    if (pendingCommentReactRef.current[commentId]) return;
    const comment = replies.find(c => (c.commentId || c.id) === commentId);
    const persistedReaction: Reaction | null =
      comment?.userReaction ?? (currentUserId ? (comment?.reactions?.[currentUserId] ?? null) : null);
    const prev = commentReactions[commentId] ?? { reaction: persistedReaction, heartCount: comment?.heartCount ?? 0 };
    const sameReaction = prev.reaction === reaction;
    const newReaction = sameReaction ? null : reaction;
    const wasActive = prev.reaction !== null;
    const newActive = newReaction !== null;
    const delta = newActive && !wasActive ? 1 : (!newActive && wasActive ? -1 : 0);
    const optimistic = { reaction: newReaction, heartCount: Math.max(0, prev.heartCount + delta) };

    setCommentReactions(p => ({ ...p, [commentId]: optimistic }));
    delete commentTopReactionsCache.current[commentId];
    pendingCommentReactRef.current[commentId] = true;
    const failsafe = setTimeout(() => { pendingCommentReactRef.current[commentId] = false; }, REQUEST_TIMEOUT_MS + 3000);
    try {
      const res = await axios.post(
        `/api/roar/rooms/${roomId}/messages/${postId}/comments/${commentId}/react`,
        { reaction: newReaction ?? prev.reaction },
        { timeout: REQUEST_TIMEOUT_MS }
      );
      if (res.data && typeof res.data.heartCount === "number") {
        setCommentReactions(p => ({ ...p, [commentId]: { ...optimistic, heartCount: res.data.heartCount } }));
      }
      delete commentTopReactionsCache.current[commentId];
      setCommentTopReactionsMap(p => { const n = { ...p }; delete n[commentId]; return n; });
    } catch {
      setCommentReactions(p => ({ ...p, [commentId]: prev }));
    } finally {
      clearTimeout(failsafe);
      pendingCommentReactRef.current[commentId] = false;
    }
  }, [roomId, postId, replies, commentReactions, currentUserId]);

  const fetchReplies = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/roar/rooms/${roomId}/messages/${postId}/comments`, { params: { limit: 50 }, timeout: REQUEST_TIMEOUT_MS });
      const list: any[] = res.data?.comments ?? [];
      const oldestFirst = [...list].sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));
      const threaded = threadSort(oldestFirst);
      setReplies(threaded);
    } catch { setReplies([]); }
    finally { setLoading(false); }
  }, [postId, roomId]);

  useEffect(() => {
    if (isOpen) { fetchReplies(); setTimeout(() => inputRef.current?.focus(), 180); }
  }, [isOpen, fetchReplies]);

  const handleSend = async () => {
    const fullText = replyTo ? `@${replyTo.authorUsername} ${commentText.trim()}` : commentText.trim();
    if (!fullText || sending) return;
    setSending(true);
    try {
      await axios.post(`/api/roar/rooms/${roomId}/messages/${postId}/comments`, { text: fullText }, { timeout: REQUEST_TIMEOUT_MS });
      if (phog) {
        phog.capture("post_comment", { post_id: postId, room_id: roomId, room_name: roomName || "" });
      }
      setCommentText(""); setReplyTo(null); onCommentPosted(); fetchReplies();
    } catch { }
    finally { setSending(false); }
  };

  const handleDeleteComment = useCallback(async (commentId: string) => {
    if (!window.confirm("Delete this reply?")) return;
    setDeletingCommentId(commentId);
    try {
      await axios.delete(`/api/roar/rooms/${roomId}/messages/${postId}/comments/${commentId}`, { timeout: REQUEST_TIMEOUT_MS });
      setReplies(prev => prev.filter(r => (r.id ?? r.commentId) !== commentId));
      onCommentDeleted?.();
    } catch {
      // leave it in place on failure
    } finally {
      setDeletingCommentId(null);
    }
  }, [roomId, postId, onCommentDeleted]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22, ease: "easeOut" }}
      onAnimationStart={() => setIsAnimatingHeight(true)}
      onAnimationComplete={() => setIsAnimatingHeight(false)}
      style={{ overflow: isAnimatingHeight ? "hidden" : "visible" }}
      onClick={e => e.stopPropagation()}
    >
      <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 0 }}>
        {loading ? (
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontStyle: "italic", marginBottom: 6, paddingLeft: 4 }}>Loading replies…</p>
        ) : replies.length === 0 ? (
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontStyle: "italic", marginBottom: 6, paddingLeft: 4 }}>No replies yet — be the first!</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 8 }}>
            {(showAllReplies ? replies : replies.slice(0, 2)).map((r, i) => {
              const isReply = /^@\S+/.test((r.text ?? "").trimStart());
              const commentId = r.id ?? r.commentId ?? String(i);
              const persistedReaction: Reaction | null =
                r.userReaction ?? (currentUserId ? (r.reactions?.[currentUserId] ?? null) : null);
              const lo = commentReactions[commentId];
              const currentReaction: Reaction | null = lo !== undefined ? lo.reaction : persistedReaction;
              const liveHeartCount = lo !== undefined ? lo.heartCount : (r.heartCount ?? 0);
              const topReactions = commentTopReactionsMap[commentId] ?? [];
              if (liveHeartCount > 0 && topReactions.length === 0 && !commentTopReactionsCache.current[commentId]) {
                fetchCommentTopReactions(commentId);
              }
              const displayReactions = topReactions.length > 0 ? topReactions : (currentReaction ? [currentReaction] : []);
              const isOwnComment = currentUserId && r.authorUid === currentUserId;
              // const mention = useMentionAutocomplete(currentUsername);
              return (
                <div key={commentId} style={{ display: "flex", gap: 6, alignItems: "flex-start", paddingLeft: isReply ? 24 : 0, minWidth: 0, width: "100%" }}>
                  <div style={{ width: 14, height: 14, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg,#e91e8c,#ff6b35)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", cursor: onFanProfile ? "pointer" : "default" }}
                    onClick={e => { e.stopPropagation(); onFanProfile?.({ username: r.authorUsername, badge: r.authorBadge, avatarUrl: r.authorAvatarUrl || r.avatarUrl, authorUid: r.authorUid }); }}
                  >
                    {(() => {
                      const resolvedAvatar =
                        r.authorAvatarUrl ||
                        r.avatarUrl ||
                        (r.authorUsername === currentUsername ? currentAvatarUrl : undefined);
                      return resolvedAvatar
                        ? <img src={resolvedAvatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <span style={{ fontSize: 7, fontWeight: 800, color: "#fff" }}>{(r.authorUsername ?? "?")[0].toUpperCase()}</span>;
                    })()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                    <span
                      style={{ fontWeight: 700, color: "#fff", fontSize: 10, display: "block", wordBreak: "break-word", cursor: onFanProfile ? "pointer" : "default" }}
                      onClick={e => { e.stopPropagation(); onFanProfile?.({ username: r.authorUsername, badge: r.authorBadge, avatarUrl: r.authorAvatarUrl || r.avatarUrl, authorUid: r.authorUid }); }}
                    >
                      {r.authorUsername ?? "Fan"}
                    </span>
                    <p style={{ margin: 0, fontSize: 10, lineHeight: 1.4, color: "rgba(255,255,255,0.75)", wordBreak: "break-word", overflowWrap: "anywhere" }}>
                      {isReply ? (() => {
                        const spaceIdx = (r.text ?? "").indexOf(" ");
                        const mention = spaceIdx > -1 ? (r.text ?? "").slice(0, spaceIdx) : (r.text ?? "");
                        const rest = spaceIdx > -1 ? (r.text ?? "").slice(spaceIdx) : "";
                        return (<><span style={{ color: accentColor, fontWeight: 600 }}>{mention}</span>{rest}</>);
                      })() : (r.text ?? "")}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 1 }}>
                      {liveHeartCount > 0 && (
                        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{liveHeartCount} {liveHeartCount === 1 ? "like" : "likes"}</span>
                      )}
                      <button type="button" onClick={e => { e.stopPropagation(); setReplyTo({ commentId, authorUsername: r.authorUsername ?? "Fan" }); setTimeout(() => inputRef.current?.focus(), 80); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.35)", padding: 0 }}>Reply</button>
                      {isOwnComment && (
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); handleDeleteComment(commentId); }}
                          disabled={deletingCommentId === commentId}
                          style={{ background: "none", border: "none", cursor: deletingCommentId === commentId ? "wait" : "pointer", fontSize: 9, fontWeight: 700, color: "#f87171", padding: 0, display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <Trash2 size={9} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                    <ReactionPicker
                      currentReaction={currentReaction}
                      count={liveHeartCount}
                      onReact={(reaction) => handleCommentReact(commentId, reaction)}
                      postId={commentId}
                      roomId={roomId}
                      roomName={roomName}
                    />
                    {liveHeartCount > 0 && displayReactions.length > 0 && (
                      <button
                        onClick={() => setReactionsDialogCommentId(commentId)}
                        style={{ display: "flex", alignItems: "center", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                        title="See who reacted"
                      >
                        <div style={{ display: "flex" }}>
                          {displayReactions.map((type, idx) => (
                            <div key={type} style={{ width: 12, height: 12, borderRadius: "50%", background: "#1e1e2a", border: "1.5px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, marginLeft: idx === 0 ? 0 : -4, zIndex: displayReactions.length - idx, position: "relative" }}>
                              {REACTION_EMOJI[type] ?? "❤️"}
                            </div>
                          ))}
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {replies.length > 2 && !showAllReplies && (
              <button type="button" onClick={e => { e.stopPropagation(); setShowAllReplies(true); }} style={{ alignSelf: "flex-start", background: "none", border: "none", cursor: "pointer", fontSize: 10, fontWeight: 700, color: accentColor, padding: 0, marginTop: 1 }}>View all replies →</button>
            )}
          </div>
        )}

        <AnimatePresence>
          {replyTo && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden", marginBottom: 3 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4, paddingLeft: 2 }}>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>Replying to</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: accentColor, background: `${accentColor}18`, border: `1px solid ${accentColor}40`, borderRadius: 999, padding: "1px 6px" }}>@{replyTo.authorUsername}</span>
                <button type="button" onClick={e => { e.stopPropagation(); setReplyTo(null); }} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", fontSize: 12, lineHeight: 1, padding: 0 }}>×</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 5px", borderRadius: 14, background: "rgba(255,255,255,0.04)", border: `1px solid ${accentColor}40`, position: "relative" }}>
          {mention.showMentionPopup && (
            <MentionPopup
              mentionUsers={mention.mentionUsers}
              mentionIndex={mention.mentionIndex}
              setMentionIndex={mention.setMentionIndex}
              onSelect={(u) => mention.insertMention(u, commentText, setCommentText, inputRef)}
            />
          )}
          {currentAvatarUrl ? <img src={currentAvatarUrl} alt="" style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, objectFit: "cover" }} /> : <div style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg,#e91e8c,#ff6b35)" }} />}
          <input
            ref={inputRef}
            type="text"
            value={commentText}
            onChange={e => {
              const value = e.target.value;
              setCommentText(value);
              mention.handleMentionInputChange(value, e.target.selectionStart || value.length);
            }}
            onKeyDown={e => {
              if (mention.handleMentionKeyDown(e, commentText, setCommentText, inputRef)) return;
              if (e.key === "Enter") handleSend();
            }}
            placeholder={replyTo ? `…` : "Add a comment…"}
            style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#fff", fontSize: 11, fontWeight: 500 }}
          />
          <button type="button" onClick={e => { e.stopPropagation(); onOpenFull(); }} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: 600, whiteSpace: "nowrap", padding: "0 2px" }}>All</button>
          <motion.button whileTap={{ scale: 0.9 }} type="button" onClick={e => { e.stopPropagation(); handleSend(); }} disabled={!commentText.trim() || sending} style={{ background: commentText.trim() ? `linear-gradient(135deg,${accentColor},#ff6b35)` : "rgba(255,255,255,0.08)", border: "none", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: commentText.trim() ? "pointer" : "default", transition: "background 0.2s", flexShrink: 0 }}>
            <Send size={12} color={commentText.trim() ? "#fff" : "rgba(255,255,255,0.3)"} />
          </motion.button>
        </div>
      </div>

      <ReactionsDialog
        postId={reactionsDialogCommentId ?? ""}
        isOpen={reactionsDialogCommentId !== null}
        onClose={() => setReactionsDialogCommentId(null)}
        onFanProfile={onFanProfile}
        roomId={roomId}
        msgId={postId}
        commentId={reactionsDialogCommentId ?? undefined}
      />
    </motion.div>
  );
}

function QuizCard({ post, onToast, onPostClick, roomId, onFanProfile }: { post: any; onToast: (m: string) => void; onPostClick?: (post: any) => void; roomId?: string; onFanProfile?: (fan: any) => void; }) {
  const [selectedOption, setSelectedOption] = useState<string | null>(post.quizUserAnswer ?? null);
  const [revealedCorrect, setRevealedCorrect] = useState<string | null>(post.quizCorrectOption ?? null);
  const [submitting, setSubmitting] = useState(false);
  const [participants, setParticipants] = useState<number>(post.quizParticipants ?? 0);
  const hasAnswered = selectedOption !== null;
  const quizOptions: { label: string; text: string }[] = post.quizOptions ?? [];

  const handleOptionClick = useCallback(async (label: string) => {
    if (hasAnswered || submitting) return;
    setSubmitting(true); setSelectedOption(label);
    try {
      const res = await axios.post(`/api/roar/posts/${post.id}/quiz-answer`, { selectedOption: label }, { timeout: REQUEST_TIMEOUT_MS });
      if (res.data?.success || res.data?.message === "Already answered") {
        setRevealedCorrect(res.data.correctOption);
        setParticipants(res.data.quizParticipants ?? participants + 1);
        if (res.data.isCorrect) onToast("Correct! +2 points awarded");
        else onToast(`Wrong! Correct answer was ${res.data.correctOption}`);
      }
    } catch { setSelectedOption(null); onToast("Failed to submit answer"); }
    finally { setSubmitting(false); }
  }, [hasAnswered, submitting, post.id, participants, onToast]);

  const getOptionStyle = (label: string): React.CSSProperties => {
    const isSelected = selectedOption === label;
    const isCorrect = revealedCorrect === label;
    const isWrong = hasAnswered && isSelected && revealedCorrect !== null && !isCorrect;
    if (!hasAnswered) return { padding: "9px 12px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: 8, cursor: submitting ? "not-allowed" : "pointer", transition: "all 0.18s", opacity: submitting ? 0.6 : 1 };
    if (isCorrect) return { padding: "9px 12px", borderRadius: 12, background: "rgba(0,232,198,0.12)", border: "1px solid rgba(0,232,198,0.4)", display: "flex", alignItems: "center", gap: 8, cursor: "default", transition: "all 0.18s" };
    if (isWrong) return { padding: "9px 12px", borderRadius: 12, background: "rgba(244,67,54,0.1)", border: "1px solid rgba(244,67,54,0.35)", display: "flex", alignItems: "center", gap: 8, cursor: "default", transition: "all 0.18s" };
    return { padding: "9px 12px", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 8, cursor: "default", opacity: 0.45, transition: "all 0.18s" };
  };

  const getLabelColor = (label: string) => {
    if (!hasAnswered) return "#4A4A62";
    if (revealedCorrect === label) return "#00E8C6";
    if (selectedOption === label && revealedCorrect !== label) return "#F44336";
    return "#4A4A62";
  };

  return (
    <div style={{ padding: "12px 0", position: "relative", overflow: "hidden" }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 8, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.06em", padding: "2px 6px", borderRadius: 4, textTransform: "uppercase", background: "rgba(0,232,198,0.12)", color: "#00E8C6", border: "1px solid rgba(0,232,198,0.25)" }}>🧠 Quiz</span>
        {hasAnswered && revealedCorrect && <span style={{ fontSize: 9, fontWeight: 700, marginLeft: "auto", color: selectedOption === revealedCorrect ? "#00E8C6" : "#F44336" }}>{selectedOption === revealedCorrect ? "✓ Correct!" : "✗ Wrong"}</span>}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10, cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); onFanProfile?.(post.fan); }}>
        <AvatarWithBadge username={post.fan.username} badge={post.fan.badge} size="sm" avatarUrl={post.fan.avatarUrl} />
        <div><p style={{ fontWeight: 700, fontSize: 11 }}>{post.fan.username}</p><p style={{ fontSize: 9, color: "var(--text-secondary)" }}>{post.timeAgo}</p></div>
      </div>
      <p style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.4, marginBottom: 12, color: "#F5F5FA", cursor: "pointer" }} onClick={() => onPostClick && onPostClick(post)}>{post.quizQuestion || post.text}</p>
      {quizOptions.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12 }}>
          {quizOptions.map((opt) => {
            const isCorrect = hasAnswered && revealedCorrect === opt.label;
            const isWrong = hasAnswered && selectedOption === opt.label && revealedCorrect !== opt.label && revealedCorrect !== null;
            return (
              <motion.div key={opt.label} whileTap={!hasAnswered && !submitting ? { scale: 0.97 } : {}} style={getOptionStyle(opt.label)} onClick={(e) => { e.stopPropagation(); handleOptionClick(opt.label); }}>
                <span style={{ fontSize: 10, fontWeight: 800, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.04em", color: getLabelColor(opt.label), minWidth: 12, flexShrink: 0 }}>{opt.label}</span>
                {hasAnswered && isCorrect && <CheckCircle2 size={11} color="#00E8C6" style={{ flexShrink: 0 }} />}
                {hasAnswered && isWrong && <XCircle size={11} color="#F44336" style={{ flexShrink: 0 }} />}
                <span style={{ fontSize: 11, fontWeight: 500, color: isCorrect ? "#00E8C6" : isWrong ? "#F44336" : hasAnswered ? "rgba(255,255,255,0.35)" : "#9494AD", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{opt.text || `Option ${opt.label}`}</span>
              </motion.div>
            );
          })}
        </div>
      )}
      {!hasAnswered && <p style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 6, fontStyle: "italic" }}>Tap an option to answer</p>}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <Users size={11} color="#9494AD" />
        <span style={{ fontSize: 10, fontWeight: 600, color: "#9494AD" }}>{participants > 0 ? `${participants.toLocaleString()} fan${participants === 1 ? "" : "s"} participated` : "Be the first to answer!"}</span>
      </div>
    </div>
  );
}

function DollyCardHeader({ post, typeLabel, typeColor, typeIcon }: {
  post: any; typeLabel: string; typeColor: string; typeIcon: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
      <img src="/images/dollyavatar.png" alt="" style={{ width: 18, height: 18, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
      <span style={{ fontWeight: 700, fontSize: 10, color: "#fff" }}>Dolly</span>
      <span style={{ fontSize: 7, color: "rgba(255,255,255,0.48)" }}>{post.timeAgo}</span>
      <span className={`text-[7px] font-extrabold px-1.5 py-0.5 rounded uppercase inline-flex items-center gap-1`} style={{ background: `${typeColor}22`, color: typeColor, border: `1px solid ${typeColor}40` }}>
        {typeIcon} {typeLabel}
      </span>
    </div>
  );
}

function TriviaCard({ post, onToast, onPostClick, roomId, onFanProfile }: {
  post: any; onToast: (m: string) => void; onPostClick?: (post: any) => void; roomId?: string; onFanProfile?: (fan: any) => void;
}) {
  const questions: { question: string; options: { label: string; text?: string; isCorrect?: boolean }[] }[] = post.triviaQuestions ?? [];
  const [answers, setAnswers] = useState<Record<number, { selected: string; correctOption?: string; isCorrect?: boolean }>>(() => {
    const initial: Record<number, { selected: string; correctOption?: string; isCorrect?: boolean }> = {};
    Object.entries(post.userTriviaAnswers ?? {}).forEach(([idx, val]: [string, any]) => {
      initial[Number(idx)] = { selected: val.selectedOption ?? val.selected, correctOption: val.correctOption, isCorrect: val.isCorrect };
    });
    return initial;
  });
  const [submittingIdx, setSubmittingIdx] = useState<number | null>(null);
  const isExpired = Boolean(post.closesAt && post.closesAt <= Date.now());

  const handleAnswer = useCallback(async (qIndex: number, label: string) => {
    if (answers[qIndex] || submittingIdx !== null || isExpired) return;
    setSubmittingIdx(qIndex);
    setAnswers(prev => ({ ...prev, [qIndex]: { selected: label } }));
    try {
      const res = await axios.post(`/api/roar/rooms/${roomId}/messages/${post.id}/trivia-answer`, {
        questionIndex: qIndex, selectedOption: label,
      }, { timeout: REQUEST_TIMEOUT_MS });
      const correctOption = res.data?.correctOption;
      const isCorrect = res.data?.isCorrect;
      setAnswers(prev => ({ ...prev, [qIndex]: { selected: label, correctOption, isCorrect } }));
      onToast(isCorrect ? "Correct! Points awarded" : `Wrong! Correct answer was ${correctOption ?? "revealed"}`);
    } catch (err: any) {
      if (err?.response?.status !== 409) {
        setAnswers(prev => { const next = { ...prev }; delete next[qIndex]; return next; });
        onToast("Failed to submit answer");
      }
    } finally {
      setSubmittingIdx(null);
    }
  }, [answers, submittingIdx, isExpired, roomId, post.id, onToast]);

  return (
    <div style={{ padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
      <DollyCardHeader post={post} typeLabel="Trivia" typeColor="#E91E8C" typeIcon={<Brain size={8} />} />

      {questions.map((q, qIndex) => {
        const answered = answers[qIndex];
        const hasAnswered = Boolean(answered);
        return (
          <div key={qIndex} style={{ marginBottom: qIndex < questions.length - 1 ? 12 : 3 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 6, marginBottom: 6 }}>
              <p style={{ fontWeight: 700, fontSize: 11, lineHeight: 1.3, margin: 0, color: "#fff", cursor: "pointer" }} onClick={() => onPostClick && onPostClick(post)}>
                {questions.length > 1 ? `${qIndex + 1}. ` : ""}{q.question}
              </p>
              {isExpired && !hasAnswered && (
                <span style={{ flexShrink: 0, fontSize: 8, fontWeight: 800, color: "#c084fc", background: "rgba(147,51,234,0.18)", border: "1px solid rgba(147,51,234,0.35)", borderRadius: 0, padding: "2px 6px", whiteSpace: "nowrap" }}>
                  Time up!
                </span>
              )}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {(() => {
                const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];
                const revealedCorrectLabel = q.options.find(o => o.isCorrect)?.label;
                const correctLabel = answered?.correctOption ?? revealedCorrectLabel;
                return q.options.map((opt, optIndex) => {
                  const label = opt.label;
                  const optionLetter = OPTION_LETTERS[optIndex] ?? String(optIndex + 1);
                  const isSelected = answered?.selected === label;
                  const isCorrect = hasAnswered && correctLabel === label;
                  const isWrong = hasAnswered && isSelected && !!correctLabel && correctLabel !== label;
                  const style: React.CSSProperties = isCorrect
                    ? { background: "rgba(34,197,94,0.14)", border: "1.5px solid rgba(34,197,94,0.5)" }
                    : isWrong
                      ? { background: "rgba(244,67,54,0.1)", border: "1.5px solid rgba(244,67,54,0.4)" }
                      : hasAnswered
                        ? { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", opacity: 0.5 }
                        : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" };
                  const badgeStyle: React.CSSProperties = isCorrect
                    ? { background: "#22c55e", color: "#0a0a10" }
                    : { background: "rgba(147,51,234,0.25)", color: "#c084fc" };
                  return (
                    <motion.div key={label} whileTap={!hasAnswered && submittingIdx === null ? { scale: 0.96 } : {}}
                      onClick={(e) => { e.stopPropagation(); handleAnswer(qIndex, label); }}
                      style={{ ...style, borderRadius: 0, padding: "6px 8px", display: "flex", alignItems: "center", gap: 6, cursor: (hasAnswered || isExpired) ? "default" : "pointer", transition: "all 0.2s" }}
                    >
                      <span style={{ width: 16, height: 16, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 800, flexShrink: 0, ...badgeStyle }}>
                        {isCorrect ? <CheckCircle2 size={10} /> : optionLetter}
                      </span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: isCorrect ? "#4ade80" : isWrong ? "#f87171" : "#e5e5f0" }}>
                        {opt.text || label}
                      </span>
                    </motion.div>
                  );
                });
              })()}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const abbrevOf = (name?: string) => (name || "").trim().slice(0, 2).toUpperCase() || "??";

function BattleSwipeCard({
  post, roomId, qIndex, playerA, playerB, initialVote, onToast,
}: {
  post: any; roomId?: string; qIndex: number;
  playerA: { name: string; team?: string; image?: string };
  playerB: { name: string; team?: string; image?: string };
  initialVote?: "playerA" | "playerB";
  onToast: (m: string) => void;
}) {
  const [votedSide, setVotedSide] = useState<"playerA" | "playerB" | undefined>(initialVote);
  const [candidateIdx, setCandidateIdx] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [flash, setFlash] = useState<"green" | "red" | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const candidate = candidateIdx === 0 ? playerA : playerB;
  const candidateSide: "playerA" | "playerB" = candidateIdx === 0 ? "playerA" : "playerB";

  const vibrate = (pattern: number | number[]) => {
    try {
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(pattern);
      }
    } catch { /* ignore */ }
  };

  const castVote = useCallback(async (side: "playerA" | "playerB") => {
    if (submitting || votedSide) return;
    setSubmitting(true);
    setFlash("green");
    setVotedSide(side);
    vibrate(30);
    const failsafe = setTimeout(() => setSubmitting(false), REQUEST_TIMEOUT_MS + 3000);
    try {
      await axios.post(`/api/roar/rooms/${roomId}/messages/${post.id}/vote`, { vote: side, questionIndex: qIndex }, { timeout: REQUEST_TIMEOUT_MS });
    } catch (err: any) {
      if (err?.response?.status !== 409) {
        setVotedSide(undefined);
        onToast("Failed to submit vote");
      }
    } finally {
      clearTimeout(failsafe);
      setSubmitting(false);
    }
  }, [submitting, votedSide, roomId, post.id, qIndex, onToast]);

  const reject = useCallback(() => {
    setFlash("red");
    vibrate(20);
    setTimeout(() => {
      setFlash(null);
      setDragX(0);
      setCandidateIdx(i => (i === 0 ? 1 : 0));
    }, 180);
  }, []);

  const handleDragEnd = (_e: any, info: { offset: { x: number } }) => {
    if (info.offset.x > 90) {
      castVote(candidateSide);
    } else if (info.offset.x < -90) {
      reject();
    } else {
      setDragX(0);
    }
  };

  if (votedSide) {
    const winner = votedSide === "playerA" ? playerA : playerB;
    const loser = votedSide === "playerA" ? playerB : playerA;
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 10, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)" }}>
        <CheckCircle2 size={12} color="#22c55e" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 10, color: "#e5e5f0" }}>
          You picked <strong style={{ color: "#4ade80" }}>{winner.name}</strong> over {loser.name}
        </span>
      </div>
    );
  }

  const overlayOpacity = Math.min(Math.abs(dragX) / 100, 0.4);
  const overlayColor = dragX > 0 ? "34,197,94" : "244,67,54";

  return (
    <div>
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        dragMomentum={false}
        onDrag={(_e, info) => setDragX(info.offset.x)}
        onDragEnd={handleDragEnd}
        animate={flash ? { x: flash === "green" ? 260 : -260, opacity: 0 } : { x: 0, opacity: 1 }}
        transition={{ duration: 0.22 }}
        whileTap={{ scale: 0.98 }}
        style={{
          position: "relative", borderRadius: 12, padding: "12px 10px", textAlign: "center",
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
          cursor: "grab",
          touchAction: "none",
          overflow: "hidden",
          WebkitUserSelect: "none",
          userSelect: "none",
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: `rgba(${overlayColor},${overlayOpacity})`, pointerEvents: "none", transition: "background 0.05s" }} />
        {dragX > 30 && <span style={{ position: "absolute", top: 6, left: 8, fontSize: 9, fontWeight: 800, color: "#22c55e", border: "1.5px solid #22c55e", borderRadius: 4, padding: "1px 4px" }}>VOTE</span>}
        {dragX < -30 && <span style={{ position: "absolute", top: 6, right: 8, fontSize: 9, fontWeight: 800, color: "#f87171", border: "1.5px solid #f87171", borderRadius: 4, padding: "1px 4px" }}>SKIP</span>}
        {candidate.image
          ? <img src={candidate.image} alt="" style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover" }} draggable={false} />
          : <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{abbrevOf(candidate.team || candidate.name)}</span>}
        <p style={{ margin: "3px 0 0", fontSize: 11, fontWeight: 700, color: "#fff" }}>{candidate.name}</p>
        {candidate.team && <p style={{ margin: 0, fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{candidate.team}</p>}
      </motion.div>
      <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 6 }}>
        <button type="button" onClick={reject} style={{ width: 26, height: 26, borderRadius: "50%", border: "1.5px solid rgba(244,67,54,0.4)", background: "rgba(244,67,54,0.1)", color: "#f87171", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>✕</button>
        <button type="button" onClick={() => castVote(candidateSide)} style={{ width: 26, height: 26, borderRadius: "50%", border: "1.5px solid rgba(34,197,94,0.4)", background: "rgba(34,197,94,0.1)", color: "#4ade80", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>✓</button>
      </div>
      <p style={{ fontSize: 8, color: "var(--text-muted)", fontStyle: "italic", textAlign: "center", marginTop: 4 }}>
        Swipe right to vote {candidate.name} · swipe left to see {candidateIdx === 0 ? playerB.name : playerA.name}
      </p>
    </div>
  );
}

function BattleCard({ post, onToast, onPostClick, roomId, onFanProfile }: {
  post: any; onToast: (m: string) => void; onPostClick?: (post: any) => void; roomId?: string; onFanProfile?: (fan: any) => void;
}) {
  const questions: { question?: string; playerA: { name: string; team?: string; image?: string }; playerB: { name: string; team?: string; image?: string } }[] = post.battleQuestions ?? [];
  const votesByQuestion: Record<number, "playerA" | "playerB"> = post.userPredictionVotes ?? {};
  const isExpired = Boolean(post.closesAt && post.closesAt <= Date.now());

  return (
    <div style={{ padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
      <DollyCardHeader post={post} typeLabel="Battle" typeColor="#f97316" typeIcon={<Zap size={8} />} />

      {questions.map((q, qIndex) => {
        const alreadyVoted = votesByQuestion[qIndex];
        return (
          <div key={qIndex} style={{ marginBottom: qIndex < questions.length - 1 ? 12 : 3 }}>
            {q.question && (
              <p style={{ fontWeight: 600, fontSize: 10, lineHeight: 1.3, marginBottom: 6, color: "rgba(255,255,255,0.75)", cursor: "pointer" }} onClick={() => onPostClick && onPostClick(post)}>
                {q.question}
              </p>
            )}
            {isExpired && !alreadyVoted ? (
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontStyle: "italic" }}>Voting closed</p>
            ) : (
              <BattleSwipeCard
                post={post} roomId={roomId} qIndex={qIndex}
                playerA={q.playerA} playerB={q.playerB}
                initialVote={alreadyVoted}
                onToast={onToast}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function WaveInlineContent({
  post, liveCount, onReact, localReactions, onCelebrate,
}: {
  post: any;
  liveCount: number;
  onReact: (msgId: string, reaction: Reaction | null) => Promise<void>;
  localReactions: Record<string, { reaction: Reaction | null; heartCount: number }>;
  onCelebrate: () => void;
}) {
  const lo = localReactions[post.id];
  const joinedCount = lo !== undefined ? lo.heartCount : (post.heartCount ?? 0);
  const joined = (lo !== undefined ? lo.reaction : post.userReaction) != null;
  const required = Math.max(6, Math.ceil((liveCount || 3) * 0.6));
  const pct = Math.min(100, Math.round((joinedCount / required) * 100));

  const [hasFired, setHasFired] = useState(joinedCount >= required);
  const firedRef = useRef(hasFired);

  useEffect(() => {
    if (!firedRef.current && joinedCount >= required) {
      firedRef.current = true;
      setHasFired(true);
      onCelebrate();
    }
  }, [joinedCount, required, onCelebrate]);

  const handleJoin = () => {
    if (joined || hasFired) return;
    onReact(post.id, "fire");
  };

  if (hasFired) {
    return (
      <div style={{ marginTop: 3, marginBottom: 3 }}>
        <p style={{ margin: 0, fontWeight: 900, fontSize: 13, color: "#fff", letterSpacing: "0.06em", textTransform: "uppercase", textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
          🌊 WAVE!
        </p>
        <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4, textAlign: "center" }}>
          {joinedCount} fans waved together 👀
        </p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 3 }}>
      <p className="leading-snug text-white" style={{ fontSize: 10, marginBottom: 1 }}>
        🌊 Stadium Wave started! Join in 🙌
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 1 }}>
        <div style={{ flex: 1, height: 5, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
          <motion.div
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.3 }}
            style={{ height: "100%", background: "linear-gradient(90deg,#38bdf8,#4fd1ff)" }}
          />
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.6)", flexShrink: 0 }}>
          {joinedCount}/{required} · {pct}%
        </span>
      </div>
      <motion.button
        whileTap={!joined ? { scale: 0.97 } : {}}
        onClick={(e) => { e.stopPropagation(); handleJoin(); }}
        disabled={joined}
        style={{
          width: "100%", padding: "1px", borderRadius: 999, border: "none",
          background: joined ? "rgba(56,189,248,0.15)" : "linear-gradient(90deg,#0ea5e9,#38bdf8)",
          color: joined ? "#4fd1ff" : "#fff", fontWeight: 800, fontSize: 10,
          cursor: joined ? "default" : "pointer",
        }}
      >
        {joined ? "✓ You joined the wave" : "🙌 Join the Wave!"}
      </motion.button>
    </div>
  );
}

function useVisibilityInterval(callback: () => void, delay: number) {
  const savedCallback = useRef(callback);
  useEffect(() => { savedCallback.current = callback; }, [callback]);
  useEffect(() => {
    let id: ReturnType<typeof setInterval>;
    const start = () => { id = setInterval(() => { if (!document.hidden) savedCallback.current(); }, delay); };
    const handleVisibility = () => { clearInterval(id); if (!document.hidden) { savedCallback.current(); start(); } };
    start();
    document.addEventListener("visibilitychange", handleVisibility);
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", handleVisibility); };
  }, [delay]);
}

type ShareableRoarPost = { id?: string | number; text?: string; authorUsername?: string; fan?: { username?: string }; };

function displayUsername(raw: string | undefined | null): string {
  if (!raw) return "RoarUser";
  const trimmed = raw.trim();
  if (!trimmed) return "RoarUser";
  if (!trimmed.includes("_")) return trimmed;
  const spaced = trimmed.replace(/_+/g, " ").replace(/\s+/g, " ").trim();
  if (!spaced) return "RoarUser";
  return spaced.split(" ").map((word) => (/[A-Z]/.test(word) ? word : word.charAt(0).toUpperCase() + word.slice(1))).join(" ");
}

const buildRoarPostShareUrl = (post: ShareableRoarPost) => {
  if (typeof window === "undefined") return "";
  const targetUrl = new URL(`${window.location.origin}/MainModules/ROAR`);
  if (post?.id) targetUrl.searchParams.set("post", String(post.id));
  return targetUrl.toString();
};

const buildRoarPostShareText = (post: ShareableRoarPost) => {
  const shareUrl = buildRoarPostShareUrl(post);
  const author = displayUsername(post?.fan?.username || post?.authorUsername || "a Sportsfan");
  return [`Check out this ROAR post by ${author}`, post?.text || "Join the conversation on Sportsfan ROAR.", `View post: ${shareUrl}`].filter(Boolean).join("\n");
};

const CELEBRATION_EMOJIS_MAP: Record<string, string[]> = {
  six: ["💪", "6️⃣", "🔥", "⚡", "🏏", "🎉", "💪", "6️⃣", "🔥", "✨", "🎊", "⚡"],
  wicket: ["🎯", "💥", "🏏", "⚡", "🎊", "🔥", "🎯", "💥", "🏏", "✨", "🎉", "⚡"],
  four: ["🏏", "⚡", "💫", "🔥", "4️⃣", "⚡", "🏏", "💫", "🔥", "✨"],
  catch: ["💥", "🏏", "⚡", "🔥", "💥", "🏏", "✨"],
  goal: ["⚽", "🎉", "🔥", "🥅", "✨", "🎊", "⚡", "⚽", "🎉", "🔥"],
  redcard: ["⚽", "🎉", "🔥", "🥅", "✨", "🎊", "⚡", "⚽", "🎉", "🔥"],
  yellowcard: ["⚽", "🎉", "🔥", "🥅", "✨", "🎊", "⚡", "⚽", "🎉", "🔥"],
  frango: ["⚽", "🎉", "🔥", "🥅", "✨", "🎊", "⚡", "⚽", "🎉", "🔥"],
  wave: ["🙌", "👋", "🌊", "✨", "🎉", "👏", "🙌", "👋", "🌊", "✨", "🎉", "👏"],
};

function CelebrationBurst({ memTag, onDone }: { memTag: string; onDone: () => void }) {
  const particles = React.useMemo(() => {
    const emojis = CELEBRATION_EMOJIS_MAP[memTag] ?? ["🎉", "🔥", "⚡"];

    return Array.from({ length: 80 }).map(() => ({
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      x: (Math.random() - 0.5) * window.innerWidth * 1.3,
      y: -(window.innerHeight * (0.5 + Math.random() * 0.5)),
      rotate: Math.random() * 1080 - 540,
      size: 20 + Math.random() * 26,
      duration: 2.8 + Math.random() * 1.2,
      delay: Math.random() * 0.8,
    }));
  }, [memTag]);

  useEffect(() => {
    const t = setTimeout(onDone, 1500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 9999,
        overflow: "hidden",
      }}
    >
      {particles.map((pt, i) => (
        <motion.div
          key={i}
          initial={{
            x: 0,
            y: 0,
            scale: 0,
            opacity: 1,
            rotate: 0,
          }}
          animate={{
            x: [0, pt.x * 0.3, pt.x],
            y: [0, pt.y * 0.4, pt.y],
            scale: [0, 1.2, 1],
            opacity: [1, 1, 0],
            rotate: [0, pt.rotate],
          }}
          transition={{
            duration: pt.duration,
            delay: pt.delay,
            ease: "easeOut",
            times: [0, 0.35, 1],
          }}
          style={{
            position: "absolute",
            left: "50%",
            bottom: 30,
            marginLeft: -12,
            fontSize: pt.size,
            lineHeight: 1,
          }}
        >
          {pt.emoji}
        </motion.div>
      ))}
    </div>
  );
}

function WaveCelebrationBurst({ onDone }: { onDone: () => void }) {
  const COLUMNS = 22;
  const ROWS = 4;
  const ROW_EMOJIS = ["🙌", "🎉", "👐", "🙌"];
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const items = React.useMemo(() => {
    const arr: { row: number; col: number; delay: number; emoji: string }[] = [];
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLUMNS; col++) {
        arr.push({
          row,
          col,
          delay: col * 0.055 + row * 0.12,
          emoji: ROW_EMOJIS[row % ROW_EMOJIS.length],
        });
      }
    }
    return arr;
  }, []);

  useEffect(() => {
    audioRef.current?.play().catch(() => { });
    const totalMs = COLUMNS * 55 + ROWS * 120 + 900;
    const t = setTimeout(onDone, totalMs);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      style={{
        position: "fixed",
        left: 0, right: 0,
        bottom: "12vh",
        height: 260,
        pointerEvents: "none",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        gap: 6,
      }}
    >
      <audio ref={audioRef} src="/sounds/wave.mp3" preload="auto" />
      {Array.from({ length: ROWS }).map((_, row) => (
        <div
          key={row}
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-evenly",
            height: 55,
          }}
        >
          {items
            .filter((it) => it.row === row)
            .map((it, i) => (
              <motion.div
                key={i}
                initial={{ y: 0, opacity: 0.35, scale: 0.8 }}
                animate={{
                  y: [0, -50, 0],
                  opacity: [0.35, 1, 0.35],
                  scale: [0.8, 1.1, 0.8],
                }}
                transition={{
                  duration: 0.75,
                  delay: it.delay,
                  ease: "easeInOut",
                  times: [0, 0.5, 1],
                }}
                style={{ fontSize: 26, lineHeight: 1 }}
              >
                {it.emoji}
              </motion.div>
            ))}
        </div>
      ))}
    </div>
  );
}

export default function DiscussionRoom({
  roomSports,
  onBack, onToast, roomId, roomName, onPostClick, onCompose,
  fanCount = 312, score, scoreSubtitle, currentAvatarUrl, currentUserId: propCurrentUserId, onRegisterRefresh, onRegisterReplyUpdate,
  onRegisterInjectPost, onRegisterOptimisticSwap,
  onFanProfile, watchAlongRoomId
}: Props) {
  const router = useRouter();
  const phog = usePostHog();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showQuickCompose, setShowQuickCompose] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"post" | "debate" | "prediction" | "hottake" | "raw_reactions">("post");
  const [uploading, setUploading] = useState(false);
  const [attachedUrl, setAttachedUrl] = useState<string | null>(null);
  const [attachedType, setAttachedType] = useState<"image" | "video" | null>(null);
  const [userUsername, setUserUsername] = useState("RoarUser");
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | undefined>(currentAvatarUrl);
  const [selectedActionId, setSelectedActionId] = useState("post");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dollyActiveRoomIdRef = useRef<string | undefined>(roomId);
  const dollyFetchTokenRef = useRef<symbol | null>(null);
  const [liveCount, setLiveCount] = useState<number>(fanCount ?? 0);
  const [totalJoinCount, setTotalJoinCount] = useState<number>(0);
  const [sharePost, setSharePost] = useState<ShareableRoarPost | null>(null);
  const [copied, setCopied] = useState(false);
  const { userProfile } = useUserProfile();
  const [roomCounts, setRoomCounts] = useState({ post: 0, debate: 0, prediction: 0, trivia: 0, battle: 0 });
  const [activeFilter, setActiveFilter] = useState<"all" | "post" | "debate" | "prediction" | "trivia" | "battle">("all");
  const [dollyHistory, setDollyHistory] = useState<DollyHistorySession[]>([]);
  const [dollyHistoryLoading, setDollyHistoryLoading] = useState(false);
  const [dollyActiveRoomId, setDollyActiveRoomId] = useState<string | undefined>(roomId);
  const [dollyActiveRoomName, setDollyActiveRoomName] = useState<string | undefined>(roomName);
  const [dollyRepliesLoading, setDollyRepliesLoading] = useState(false);
  const [votersMsgId, setVotersMsgId] = useState<string | null>(null);
  const [votersMode, setVotersMode] = useState<"debate" | "prediction">("prediction");
  const lastLocalReactAtRef = useRef<Record<string, number>>({});
  const mainInputRef = useRef<HTMLInputElement>(null);
  const mention = useMentionAutocomplete(userUsername);
  const knownFanUidsRef = useRef<Set<string> | null>(null);
  const toastedUidsRef = useRef<Set<string>>(new Set());
  const presenceFetchInFlightRef = useRef(false);
  const presenceRequestSeqRef = useRef(0);
  const presenceBootstrapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [joinToast, setJoinToast] = useState<{ username: string } | null>(null);
  const joinToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const joinToastQueueRef = useRef<string[]>([]);
  const joinToastActiveRef = useRef(false);

  const showNextJoinToast = useCallback(() => {
    if (joinToastActiveRef.current) return;
    const next = joinToastQueueRef.current.shift();
    if (!next) return;
    joinToastActiveRef.current = true;
    setJoinToast({ username: next });
    if (joinToastTimerRef.current) clearTimeout(joinToastTimerRef.current);
    joinToastTimerRef.current = setTimeout(() => {
      setJoinToast(null);
      joinToastActiveRef.current = false;
      showNextJoinToast();
    }, 2800);
  }, []);

  const queueJoinToast = useCallback((username: string) => {
    joinToastQueueRef.current.push(username);
    showNextJoinToast();
  }, [showNextJoinToast]);

  const SOUND_FILES: Record<"join" | "comment" | "post", string> = {
    join: "/sounds/join.mp3",
    comment: "/sounds/comment.mp3",
    post: "/sounds/post.mp3",
  };

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem("roar_sound_enabled");
      return stored === null ? true : stored === "true";
    } catch { return true; }
  });

  const soundEnabledRef = useRef(soundEnabled);
  useEffect(() => { soundEnabledRef.current = soundEnabled; }, [soundEnabled]);

  const audioCache = useRef<Partial<Record<keyof typeof SOUND_FILES, HTMLAudioElement>>>({});

  const playSound = useCallback((key: keyof typeof SOUND_FILES) => {
    if (!soundEnabledRef.current) return;
    try {
      let audio = audioCache.current[key];
      if (!audio) {
        audio = new Audio(SOUND_FILES[key]);
        audio.volume = 0.5;
        audioCache.current[key] = audio;
      }

      audio.currentTime = 0;
      audio.play().catch(() => { });
    } catch { /* ignore */ }
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const next = !prev;
      try { localStorage.setItem("roar_sound_enabled", String(next)); } catch { }
      return next;
    });
  }, []);
  useEffect(() => {
    dollyActiveRoomIdRef.current = dollyActiveRoomId;
  }, [dollyActiveRoomId]);

  useEffect(() => {
    if (phog && roomId) {
      phog.capture("enter_room", {
        room_id: roomId,
        room_name: roomName || ""
      });
    }
  }, [phog, roomId, roomName]);
  const votingInProgressRef = useRef<Set<string>>(new Set());
  const [pinnedPost, setPinnedPost] = useState<{
    msgId: string; text: string; authorUsername: string; type: string; pinnedAt: number;
  } | null>(null);
  const [openMenuPostId, setOpenMenuPostId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const currentUserId = propCurrentUserId || userProfile?.actualUserId;
  const currentUserIdCandidates = [
    currentUserId,
    userProfile?.actualUserId,
    (userProfile as { userId?: string })?.userId,
    (userProfile as { uid?: string })?.uid,
    (userProfile as { email?: string })?.email,
  ].filter(Boolean).map(String);

  const isCurrentUserAuthor = (post: { authorUid?: unknown; authorEmail?: unknown; fan?: { authorUid?: unknown } }) => {
    const authorCandidates = [post.authorUid, post.fan?.authorUid, post.authorEmail].filter(Boolean).map(String);
    return authorCandidates.some(id => currentUserIdCandidates.includes(id));
  };

 const detectNewJoiners = useCallback((fans: { uid: string; username: string }[]) => {
    if (!knownFanUidsRef.current) {
      knownFanUidsRef.current = new Set(fans.map(f => f.uid));
      return;
    }
    const seen = knownFanUidsRef.current;
    const newcomers = fans.filter(
      f => f.uid !== currentUserId && !seen.has(f.uid) && !toastedUidsRef.current.has(f.uid)
    );
    fans.forEach(f => seen.add(f.uid));
    if (newcomers.length > 0) {
      playSound("join");
      newcomers.forEach(f => {
        toastedUidsRef.current.add(f.uid);
        queueJoinToast(displayUsername(f.username));
      });
    }
  }, [currentUserId, queueJoinToast, playSound]);

  const applyPresenceResponse = useCallback((seq: number, data: any) => {
    if (seq !== presenceRequestSeqRef.current) return;
    const fans = data.fans ?? [];
    setActiveFans(fans);
    setLiveCount(data.fanCount ?? 0);
    if (data.totalJoinCount !== undefined) setTotalJoinCount(data.totalJoinCount);
    setPinnedPost(data.pinnedPost ?? null);
    detectNewJoiners(fans);
  }, [detectNewJoiners]);

  const latestCreatedAtRef = useRef<number | null>(null);
  const sendingRef = useRef(false);
  const [isSending, setIsSending] = useState(false);
  const [resolvingRoomPredictionId, setResolvingRoomPredictionId] = useState<string | null>(null);
  const [openInlinePostId, setOpenInlinePostId] = useState<string | null>(null);
  const [explicitlyClosedPostIds, setExplicitlyClosedPostIds] = useState<Set<string>>(new Set());
  const [notifToast, setNotifToast] = useState<{ message: string; type: "like" | "comment"; } | null>(null);
  const notifToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activeFans, setActiveFans] = useState<{ uid: string; username: string; avatarUrl?: string | null; badge?: string | null }[]>([]);
  const [activeFansOpen, setActiveFansOpen] = useState(false);
  const [localReactions, setLocalReactions] = useState<Record<string, { reaction: Reaction | null; heartCount: number }>>({});
  const localReactionsRef = useRef<Record<string, { reaction: Reaction | null; heartCount: number }>>({});
  const pendingReactRef = useRef<Record<string, boolean>>({});
  const [reactionsMsgId, setReactionsMsgId] = useState<string | null>(null);
  useEffect(() => { localReactionsRef.current = localReactions; }, [localReactions]);

  const [newlyPostedIds, setNewlyPostedIds] = useState<Set<string>>(new Set());
  const [videoEndedIds, setVideoEndedIds] = useState<Set<string>>(new Set());
  const [celebration, setCelebration] = useState<{ memTag: string } | null>(null);

  const [dollyOpen, setDollyOpen] = useState(false);
  const [dollyQuestion, setDollyQuestion] = useState("");
  const [dollyAsking, setDollyAsking] = useState(false);
  const [dollyReplies, setDollyReplies] = useState<{ id: string; question: string; answer: string; createdAt: number }[]>([]);
  const [dollyLoaded, setDollyLoaded] = useState(false);
  const prevDollyCountRef = useRef(0);

  const listRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [morePosts, setMorePosts] = useState<any[]>([]);
  const [hasMoreMsgs, setHasMoreMsgs] = useState(true);
  const [loadingMoreMsgs, setLoadingMoreMsgs] = useState(false);
  const loadingMoreMsgsRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const topReactionsCache = useRef<Record<string, string[]>>({});
  const [topReactionsMap, setTopReactionsMap] = useState<Record<string, string[]>>({});

  const fetchTopReactions = useCallback(async (msgId: string) => {
    if (topReactionsCache.current[msgId] !== undefined) return;
    topReactionsCache.current[msgId] = [];
    try {
      const url = `/api/roar/posts/${msgId}/reactions${roomId ? `?roomId=${encodeURIComponent(roomId)}` : ""}`;
      const res = await axios.get(url, { timeout: REQUEST_TIMEOUT_MS });
      const reactors: { reaction: string }[] = res.data?.reactors ?? [];
      const counts: Record<string, number> = {};
      reactors.forEach(r => { counts[r.reaction] = (counts[r.reaction] ?? 0) + 1; });
      const top = Object.entries(counts).sort(([, a], [, b]) => b - a).slice(0, 3).map(([type]) => type);
      topReactionsCache.current[msgId] = top;
      setTopReactionsMap(prev => ({ ...prev, [msgId]: top }));
    } catch { topReactionsCache.current[msgId] = []; }
  }, [roomId]);



  const mapMessage = useCallback((m: any, existing?: any) => {
    const isPending = pendingReactRef.current[m.msgId];
    return {
      id: m.msgId, authorUid: m.authorUid, authorEmail: m.authorEmail,
      fan: { username: displayUsername(m.authorUsername), authorUid: m.authorUid, badge: m.authorBadge, avatarUrl: m.authorUid === currentUserId ? (userAvatarUrl || m.authorAvatarUrl || m.avatarUrl) : (m.authorAvatarUrl || m.avatarUrl) },
      text: m.text,
      fireCount: m.fireCount ?? 0, heartCount: m.heartCount ?? 0, mindblownCount: m.mindblownCount ?? 0,
      goatCount: m.goatCount ?? 0, clapCount: m.clapCount ?? 0, nochanceCount: m.noChanceCount ?? 0,
      userReaction: isPending ? (existing?.userReaction ?? null) : (m.userReaction ?? null),
      replyCount: Math.max(m.replyCount ?? 0, existing?.replyCount ?? 0),
      agreeCount: m.agreeCount ?? 0, disagreeCount: m.disagreeCount ?? 0,
      userVote: (existing?.userVote && !m.userVote) ? existing.userVote : (m.userVote ?? existing?.userVote ?? null),
      sideA: m.sideA ?? null, sideB: m.sideB ?? null,
      predictionOptions: Array.isArray(m.predictionOptions) ? m.predictionOptions : [m.sideA, m.sideB].filter(Boolean),
      predictionOptionCounts: m.predictionOptionCounts ?? {},
      closesAt: m.closesAt ?? null, closedAt: m.closedAt ?? null,
      resolvedAt: m.resolvedAt ?? null, correctVote: m.correctVote ?? null,
      accuracyAwarded: m.accuracyAwarded ?? false,
      timeAgo: new Date(m.createdAt).toLocaleDateString([], { month: "short", day: "numeric" }) + " · " + new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      createdAt: m.createdAt, type: m.type, mediaUrls: m.mediaUrls,
      quizQuestion: m.quizQuestion, quizOptions: m.quizOptions, quizCorrectOption: m.quizCorrectOption,
      quizUserAnswer: m.quizUserAnswer ?? null, quizTimer: m.quizTimer, quizPoints: m.quizPoints,
      quizParticipants: m.quizParticipants ?? 0, memGifUrl: m.memGifUrl ?? null, memTag: m.memTag ?? null,
      questions: (() => {
        const q = m.questions;
        if (Array.isArray(q)) return q;
        if (typeof q === "string") {
          try { return JSON.parse(q); } catch { return []; }
        }
        return [];
      })(),
      matchTitle: m.matchTitle ?? null,
      triviaQuestions: Array.isArray(m.triviaQuestions) ? m.triviaQuestions : [],
      userTriviaAnswers: m.userTriviaAnswers ?? {},
      matchStartAt: m.matchStartAt ?? null,
      matchEndAt: m.matchEndAt ?? null,
      triviaParticipants: m.triviaParticipants ?? {},
      battleQuestions: Array.isArray(m.battleQuestions) ? m.battleQuestions : [],
      battleVoteCounts: m.battleVoteCounts ?? {},
      userPredictionVotes: m.userPredictionVotes ?? {},
    };
  }, [currentUserId, userAvatarUrl]);

  const loadMoreMsgs = useCallback(async () => {
    if (!roomId || loadingMoreMsgsRef.current || !hasMoreMsgs) return;
    const combined = [...posts, ...morePosts];
    if (combined.length === 0) return;
    const oldestCreatedAt = combined.reduce((min, p) => (p.createdAt < min ? p.createdAt : min), combined[0].createdAt);
    loadingMoreMsgsRef.current = true; setLoadingMoreMsgs(true);
    try {
      const res = await axios.get(`/api/roar/rooms/${roomId}/messages`, { params: { limit: LOAD_MORE_PAGE_SIZE, lastCreatedAt: oldestCreatedAt }, timeout: REQUEST_TIMEOUT_MS });
      if (res.data?.success) {
        const newMsgs: any[] = res.data.messages ?? [];
        setMorePosts(prev => {
          const seenIds = new Set([...posts, ...prev].map(p => p.id ?? p.msgId));
          const fresh = newMsgs.filter(m => !seenIds.has(m.msgId)).map(m => mapMessage(m));
          return [...fresh, ...prev];
        });
        setHasMoreMsgs(Boolean(res.data.pagination?.hasMore));
      } else { setHasMoreMsgs(false); }
    } catch (e) { console.error("Failed to load more messages:", e); }
    finally { loadingMoreMsgsRef.current = false; setLoadingMoreMsgs(false); }
  }, [roomId, hasMoreMsgs, posts, morePosts, mapMessage]);

  const [postCooldown, setPostCooldown] = useState(0);
  const cooldownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startPostCooldown = useCallback(() => {
    setPostCooldown(10);
    if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
    cooldownIntervalRef.current = setInterval(() => {
      setPostCooldown(prev => {
        if (prev <= 1) {
          if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => { if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current); }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver((entries) => { if (entries[0]?.isIntersecting) loadMoreMsgs(); }, { root: listRef.current, rootMargin: "200px 0px 0px 0px", threshold: 0 });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMoreMsgs]);

  const openShareDialog = (post: ShareableRoarPost) => { setSharePost(post); setCopied(false); };
  const closeShareDialog = () => { setSharePost(null); setCopied(false); };
  const copyToClipboard = async (text: string) => {
    try { await navigator.clipboard.writeText(text); return true; }
    catch {
      try {
        const el = document.createElement("textarea"); el.value = text; el.style.position = "fixed"; el.style.opacity = "0";
        document.body.appendChild(el); el.focus(); el.select();
        const ok = document.execCommand("copy"); document.body.removeChild(el); return ok;
      } catch { return false; }
    }
  };
  const handleShareToWhatsApp = () => { if (!sharePost) return; window.open(`https://wa.me/?text=${encodeURIComponent(buildRoarPostShareText(sharePost))}`, "_blank"); };
  const handleShareToThreads = () => { if (!sharePost) return; window.open(`https://www.threads.net/intent/post?text=${encodeURIComponent(buildRoarPostShareText(sharePost))}`, "_blank"); };
  const handleShareToInstagram = async () => { if (!sharePost) return; await copyToClipboard(buildRoarPostShareText(sharePost)); setCopied(true); setTimeout(() => setCopied(false), 1600); window.open("https://www.instagram.com/", "_blank"); };
  const handleShareToLinkedIn = () => { if (!sharePost) return; window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(buildRoarPostShareUrl(sharePost))}`, "_blank"); };
  const handleShareToX = () => { if (!sharePost) return; window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(buildRoarPostShareText(sharePost))}`, "_blank"); };
  const handleCopyLink = async () => {
    if (!sharePost) return;
    const ok = await copyToClipboard(buildRoarPostShareText(sharePost));
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1600); onToast("Link copied to clipboard!"); }
  };

  const shareButtons = (size: string) => (
    <>
      {[
        { handler: handleShareToWhatsApp, src: "/images/share_whatsapp.png", alt: "WhatsApp" },
        { handler: handleShareToThreads, src: "/images/share_thread.png", alt: "Threads" },
        { handler: handleShareToInstagram, src: "/images/share_insta.png", alt: "Instagram" },
        { handler: handleShareToLinkedIn, src: "/images/Share_linkedin.png", alt: "LinkedIn" },
        { handler: handleShareToX, src: "/images/Share_X.png", alt: "X" },
        { handler: handleCopyLink, src: "/images/share_copy_link.png", alt: "Copy" },
      ].map(({ handler, src, alt }) => (
        <button key={alt} onClick={handler} className={`${size} shrink-0 rounded-full overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center`} type="button">
          <img src={src} alt={alt} width={36} height={36} className="w-full h-full object-cover rounded-full" />
        </button>
      ))}
    </>
  );

  const loadDollyHistory = useCallback(async () => {
    setDollyHistoryLoading(true);
    try {
      const res = await axios.get("/api/roar/dolly/rooms", { timeout: REQUEST_TIMEOUT_MS });
      const rooms: any[] = res.data?.rooms ?? [];
      const mapped: DollyHistorySession[] = rooms
        .filter(r => r.roomId !== roomId)
        .map(r => ({
          roomId: r.roomId,
          title: r.title,
          subtitle: r.lastQuestion || "No questions yet",
          dateLabel: new Date(r.lastAskedAt).toLocaleDateString([], { month: "short", day: "numeric" }),
          sport: r.sport,
        }));
      setDollyHistory([
        { roomId: roomId!, title: roomName || "This match", subtitle: "", dateLabel: "Today", isLive: true, sport: roomSports },
        ...mapped,
      ]);
    } catch (err) {
      console.error("[dolly] Failed to load room history:", err);
      onToast?.("Couldn't load chat history — showing this match only");
      setDollyHistory(roomId ? [{ roomId, title: roomName || "This match", subtitle: "", dateLabel: "Today", isLive: true, sport: roomSports }] : []);
    } finally {
      setDollyHistoryLoading(false);
    }
  }, [roomId, roomName, roomSports]);

  useEffect(() => {
    if (dollyOpen) loadDollyHistory();
  }, [roomId, dollyOpen, loadDollyHistory]);

  const handleSelectDollySession = useCallback(async (session: DollyHistorySession) => {
    if (session.roomId === dollyActiveRoomId) return;
    const requestId = Symbol();
    dollyFetchTokenRef.current = requestId;
    setDollyActiveRoomId(session.roomId);
    setDollyActiveRoomName(session.title);
    setDollyRepliesLoading(true);
    try {
      const res = await axios.get(`/api/roar/rooms/${session.roomId}/dolly`, { timeout: REQUEST_TIMEOUT_MS });
      if (dollyFetchTokenRef.current !== requestId) return;
      setDollyReplies(res.data?.success ? (res.data.replies ?? []) : []);
    } catch {
      if (dollyFetchTokenRef.current === requestId) setDollyReplies([]);
    } finally {
      if (dollyFetchTokenRef.current === requestId) setDollyRepliesLoading(false);
    }
  }, [dollyActiveRoomId]);

  const handleNewDollyChat = useCallback(() => {
    const requestId = Symbol();
    dollyFetchTokenRef.current = requestId;
    setDollyActiveRoomId(roomId);
    setDollyActiveRoomName(roomName);
    setDollyQuestion("");
    if (!roomId) { setDollyReplies([]); return; }
    setDollyRepliesLoading(true);
    axios.get(`/api/roar/rooms/${roomId}/dolly`, { timeout: REQUEST_TIMEOUT_MS })
      .then(res => {
        if (dollyFetchTokenRef.current !== requestId) return;
        setDollyReplies(res.data?.success ? (res.data.replies ?? []) : []);
      })
      .catch(() => { if (dollyFetchTokenRef.current === requestId) setDollyReplies([]); })
      .finally(() => { if (dollyFetchTokenRef.current === requestId) setDollyRepliesLoading(false); });
  }, [roomId, roomName]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) setShowEmojiPicker(false);
    };
    if (showEmojiPicker) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmojiPicker]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) return;
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // const refreshActiveFans = useCallback(async () => {
  //   if (!roomId) return;
  //   const seq = ++presenceRequestSeqRef.current;
  //   try {
  //     const res = await axios.get(`/api/roar/rooms/${roomId}/presence`, { timeout: PRESENCE_TIMEOUT_MS });
  //     if (res.data?.success) applyPresenceResponse(seq, res.data);
  //   } catch (e) { console.error("Active fans fetch failed:", e); }
  // }, [roomId, applyPresenceResponse]);

  const refreshActiveFans = useCallback(async () => {
    if (!roomId || presenceFetchInFlightRef.current) return;
    presenceFetchInFlightRef.current = true;
    const seq = ++presenceRequestSeqRef.current;
    try {
      const res = await axios.get(`/api/roar/rooms/${roomId}/presence`, { timeout: PRESENCE_TIMEOUT_MS });
      if (res.data?.success) applyPresenceResponse(seq, res.data);
    } catch (e) { console.error("Active fans fetch failed:", e); }
    finally { presenceFetchInFlightRef.current = false; }
  }, [roomId, applyPresenceResponse]);

  useEffect(() => {
    if (!roomId) return;
    setActiveFans([]); setLiveCount(0); setTotalJoinCount(0);

    // const join = async () => {
    //   const seq = ++presenceRequestSeqRef.current;
    //   try {
    //     const res = await axios.post(`/api/roar/rooms/${roomId}/presence`, undefined, { timeout: PRESENCE_TIMEOUT_MS });
    //     if (res.data?.success) applyPresenceResponse(seq, res.data);
    //   } catch (e) { console.error("Join failed:", e); }
    // };

    // const leaveBeacon = () => { navigator.sendBeacon(`/api/roar/rooms/${roomId}/presence/leave`); };
    // const leaveAxios = () => { axios.delete(`/api/roar/rooms/${roomId}/presence`, { timeout: PRESENCE_TIMEOUT_MS }).catch(() => { }); };

    // join();
    // presenceBootstrapTimeoutRef.current = setTimeout(refreshActiveFans, 2000);

    // const heartbeat = setInterval(() => { if (!document.hidden) join(); }, 30000);
    // const fanRefresh = setInterval(() => { if (!document.hidden) refreshActiveFans(); }, 120000);


    const join = async () => {
      if (presenceFetchInFlightRef.current) return;
      presenceFetchInFlightRef.current = true;
      const seq = ++presenceRequestSeqRef.current;
      try {
        const res = await axios.post(`/api/roar/rooms/${roomId}/presence`, undefined, { timeout: PRESENCE_TIMEOUT_MS });
        if (res.data?.success) applyPresenceResponse(seq, res.data);
      } catch (e) { console.error("Join failed:", e); }
      finally { presenceFetchInFlightRef.current = false; }
    };

    const leaveBeacon = () => { navigator.sendBeacon(`/api/roar/rooms/${roomId}/presence/leave`); };
    const leaveAxios = () => { axios.delete(`/api/roar/rooms/${roomId}/presence`, { timeout: PRESENCE_TIMEOUT_MS }).catch(() => { }); };

    join();
    // Bootstrap refresh pushed out so it doesn't race the initial join() response
    presenceBootstrapTimeoutRef.current = setTimeout(refreshActiveFans, 8000);

    const heartbeat = setInterval(() => { if (!document.hidden) join(); }, 30000);
    const fanRefresh = setInterval(() => { if (!document.hidden) refreshActiveFans(); }, 120000);

    window.addEventListener("beforeunload", leaveBeacon);

    return () => {
      leaveAxios();
      clearInterval(heartbeat);
      clearInterval(fanRefresh);
      if (presenceBootstrapTimeoutRef.current) clearTimeout(presenceBootstrapTimeoutRef.current);
      window.removeEventListener("beforeunload", leaveBeacon);
    };
  }, [roomId, applyPresenceResponse, refreshActiveFans]);

  useEffect(() => {
    try {
      setUserUsername(userProfile?.username || localStorage.getItem("roar_username") || "RoarUser");
      setUserAvatarUrl(currentAvatarUrl || userProfile?.avatarUrl || userProfile?.avatar || localStorage.getItem("roar_avatar_url") || undefined);
    } catch { }
  }, [currentAvatarUrl, userProfile]);

  useEffect(() => {
    if (!roomId) { setDollyReplies([]); setDollyLoaded(true); return; }
    const requestId = Symbol();
    dollyFetchTokenRef.current = requestId;
    setDollyActiveRoomId(roomId);
    setDollyActiveRoomName(roomName);
    setDollyLoaded(false);
    axios.get(`/api/roar/rooms/${roomId}/dolly`, { timeout: REQUEST_TIMEOUT_MS })
      .then(res => {
        if (dollyFetchTokenRef.current !== requestId) return;
        setDollyReplies(res.data?.success ? (res.data.replies ?? []) : []);
      })
      .catch(() => { if (dollyFetchTokenRef.current === requestId) setDollyReplies([]); })
      .finally(() => { if (dollyFetchTokenRef.current === requestId) setDollyLoaded(true); });
  }, [roomId, roomName]);

  const fetchMsgs = useCallback(async () => {
    if (!roomId) return;
    try {
      const url = latestCreatedAtRef.current
        ? `/api/roar/rooms/${roomId}/messages?since=${latestCreatedAtRef.current}&t=${Date.now()}`
        : `/api/roar/rooms/${roomId}/messages?t=${Date.now()}`;
      const res = await axios.get(url, { timeout: REQUEST_TIMEOUT_MS });
      if (res.data?.success) {
        if (res.data.counts) setRoomCounts(res.data.counts);
        const incoming: any[] = res.data.messages ?? [];
        if (latestCreatedAtRef.current === null) {
          setPosts(prev => {
            const prevMap = Object.fromEntries(prev.map(p => [p.id, p]));
            return [...res.data.messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).map((m: any) => mapMessage(m, prevMap[m.msgId]));
          });
          if (incoming.length > 0) latestCreatedAtRef.current = Math.max(...incoming.map(m => m.createdAt));
        } else if (incoming.length > 0) {
          latestCreatedAtRef.current = Math.max(...incoming.map((m: any) => m.createdAt));
          setPosts(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const fresh = incoming.filter((m: any) => !existingIds.has(m.msgId)).map((m: any) => ({ ...mapMessage(m), timeAgo: "now" }));
            if (fresh.length > 0) playSound("post");
            return fresh.length > 0 ? [...prev, ...fresh] : prev;

          });
        }
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [roomId, mapMessage, playSound]);

  useEffect(() => { onRegisterRefresh?.(fetchMsgs); }, [fetchMsgs, onRegisterRefresh]);
  useEffect(() => {
    onRegisterReplyUpdate?.((postId, count) => {
      setPosts(p => p.map(x => x.id === postId ? { ...x, replyCount: count } : x));
    });
  }, [onRegisterReplyUpdate, playSound]);
  const injectPost = useCallback((post: any) => {
  setPosts(p => [...p, post]);
  playSound("post");
  setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }), 50);
}, [playSound]);

const optimisticSwap = useCallback((tempId: string, realMsg?: any) => {
  if (!realMsg) {
    setPosts(p => p.filter(x => x.id !== tempId));
    return;
  }
  setPosts(p => p.map(x => x.id === tempId ? { ...mapMessage(realMsg), timeAgo: "now" } : x));
}, [mapMessage]);

useEffect(() => { onRegisterInjectPost?.(injectPost); }, [injectPost, onRegisterInjectPost]);
useEffect(() => { onRegisterOptimisticSwap?.(optimisticSwap); }, [optimisticSwap, onRegisterOptimisticSwap]);
  useEffect(() => {
    latestCreatedAtRef.current = null;
    setPosts([]);
    setMorePosts([]);
    setHasMoreMsgs(true);
    setLoading(true);
    setRoomCounts({ post: 0, debate: 0, prediction: 0, trivia: 0, battle: 0 });
    setPinnedPost(null);
    setLocalReactions({});
    topReactionsCache.current = {};
    setTopReactionsMap({});
    setOpenInlinePostId(null);
    setActiveFilter("all");
  //   knownFanUidsRef.current = null;
  //   presenceRequestSeqRef.current = 0;
  //   joinToastQueueRef.current = [];
  //   setJoinToast(null);
  // }, [roomId]);
  knownFanUidsRef.current = null;
    toastedUidsRef.current = new Set();
    presenceFetchInFlightRef.current = false;
    presenceRequestSeqRef.current = 0;
    joinToastQueueRef.current = [];
    setJoinToast(null);
  }, [roomId]);

  useEffect(() => { if (!roomId) return; fetchMsgs(); }, [fetchMsgs, roomId]);
  useVisibilityInterval(fetchMsgs, 15000);

  const fetchReactionUpdates = useCallback(async () => {
    if (!roomId) return;
    try {
      const res = await axios.get(`/api/roar/rooms/${roomId}/messages?t=${Date.now()}`, { timeout: REQUEST_TIMEOUT_MS });
      if (res.data?.success) {
        const incoming: any[] = res.data.messages ?? [];
        const isLocked = (id: string) => {
          const t = lastLocalReactAtRef.current[id];
          return t !== undefined && Date.now() - t < 6000;
        };
        setPosts(prev => prev.map(p => {
          const updated = incoming.find((m: any) => m.msgId === p.id);
          if (!updated) return p;
          const isPending = pendingReactRef.current[p.id] || isLocked(p.id);
          return {
            ...p,
            heartCount: isPending ? p.heartCount : (updated.heartCount ?? p.heartCount),
            userReaction: isPending ? p.userReaction : (updated.userReaction ?? null),
            replyCount: Math.max(p.replyCount ?? 0, updated.replyCount ?? 0),
            agreeCount: updated.agreeCount ?? p.agreeCount,
            disagreeCount: updated.disagreeCount ?? p.disagreeCount,
            userVote: (p.userVote && !updated.userVote) ? p.userVote : (updated.userVote ?? p.userVote ?? null),
          };
        }));
        setMorePosts(prev => prev.map(p => {
          const updated = incoming.find((m: any) => m.msgId === p.id);
          if (!updated) return p;
          return {
            ...p,
            replyCount: Math.max(p.replyCount ?? 0, updated.replyCount ?? 0),
            agreeCount: updated.agreeCount ?? p.agreeCount,
            disagreeCount: updated.disagreeCount ?? p.disagreeCount,
            userVote: (p.userVote && !updated.userVote) ? p.userVote : (updated.userVote ?? p.userVote ?? null),
          };
        }));

        setLocalReactions(prev => {
          const next = { ...prev };
          incoming.forEach((m: any) => {
            if (!pendingReactRef.current[m.msgId] && !isLocked(m.msgId)) {
              next[m.msgId] = { reaction: m.userReaction ?? null, heartCount: m.heartCount ?? 0 };
            }
          });
          return next;
        });
      }
    } catch { }
  }, [roomId]);

  useVisibilityInterval(fetchReactionUpdates, 5000);

  const lastNotifCheckRef = useRef<number>(Date.now());
  const seenNotifIdsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!roomId) return;
    const checkNotifs = async () => {
      try {
        const res = await axios.get("/api/notifications", { params: { uid: userProfile?.actualUserId, email: userProfile?.email }, timeout: REQUEST_TIMEOUT_MS });
        const notifs: any[] = res.data?.notifications ?? [];
        const fresh = notifs.filter(n => n.roomId === roomId && !n.isRead && !seenNotifIdsRef.current.has(n.id) && (n.createdAt ?? 0) > lastNotifCheckRef.current);
        if (fresh.length > 0) {
          fresh.forEach(n => seenNotifIdsRef.current.add(n.id));
          const latest = fresh[fresh.length - 1];
          const type = latest.type === "roar_post_comment" ? "comment" : "like";
          setNotifToast({ message: latest.message ?? (type === "comment" ? "Someone commented on your post" : "Someone reacted to your post"), type });
          if (notifToastTimerRef.current) clearTimeout(notifToastTimerRef.current);
          notifToastTimerRef.current = setTimeout(() => setNotifToast(null), 60000);
        }
      } catch { }
    };
    lastNotifCheckRef.current = Date.now();
    const interval = setInterval(checkNotifs, 60000);
    return () => { clearInterval(interval); if (notifToastTimerRef.current) clearTimeout(notifToastTimerRef.current); };
  }, [roomId, userProfile?.actualUserId, userProfile?.email]);

  useEffect(() => {
    if (!loading && listRef.current)
      setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight }), 50);
  }, [loading]);

  const prevPostCountRef = useRef(0);
  useEffect(() => {
    const newCount = posts.length;
    if (newCount > prevPostCountRef.current && listRef.current) {
      setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }), 50);
    }
    prevPostCountRef.current = newCount;
  }, [posts.length]);

  useEffect(() => {
    if (dollyReplies.length > prevDollyCountRef.current && listRef.current) {
      setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }), 50);
    }
    prevDollyCountRef.current = dollyReplies.length;
  }, [dollyReplies.length]);

  const handlePinPost = async (p: any) => {
    if (!roomId) return;
    setOpenMenuPostId(null);
    const optimistic = { msgId: p.id, text: p.text, authorUsername: p.fan.username, type: p.type || "post", pinnedAt: Date.now() };
    setPinnedPost(optimistic);
    try {
      await axios.post(`/api/roar/rooms/${roomId}/messages/${p.id}/pin`, { action: "pin" }, { timeout: REQUEST_TIMEOUT_MS });
    } catch {
      setPinnedPost(null);
      onToast("Failed to pin post");
    }
  };

  const handleUnpin = async () => {
    if (!roomId || !pinnedPost) return;
    const prev = pinnedPost;
    const msgId = prev.msgId;
    setPinnedPost(null);
    setOpenMenuPostId(null);
    try {
      await axios.post(`/api/roar/rooms/${roomId}/messages/${msgId}/pin`, { action: "unpin" }, { timeout: REQUEST_TIMEOUT_MS });
    } catch {
      setPinnedPost(prev);
      onToast("Failed to unpin post");
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuPostId(null);
    };
    if (openMenuPostId) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuPostId]);

  const handleReact = useCallback(async (msgId: string, reaction: Reaction | null) => {
    if (!roomId || pendingReactRef.current[msgId]) return;
    const post = posts.find(p => p.id === msgId);
    const prev = localReactionsRef.current[msgId] ?? { reaction: post?.userReaction ?? null, heartCount: post?.heartCount ?? 0 };
    const sameReaction = prev.reaction === reaction;
    const newReaction = sameReaction ? null : reaction;
    const wasActive = prev.reaction !== null;
    const newActive = newReaction !== null;
    const countDelta = newActive && !wasActive ? 1 : (!newActive && wasActive ? -1 : 0);
    const optimisticState = { reaction: newReaction, heartCount: Math.max(0, prev.heartCount + countDelta) };
    setLocalReactions(p => ({ ...p, [msgId]: optimisticState }));
    lastLocalReactAtRef.current[msgId] = Date.now();
    pendingReactRef.current[msgId] = true;
    // Failsafe: if roarApi's underlying axios call hangs past the timeout for
    // any reason, don't leave this reaction permanently "pending" — release
    // the lock so the person can try again instead of the button going dead.
    const failsafe = setTimeout(() => { pendingReactRef.current[msgId] = false; }, REQUEST_TIMEOUT_MS + 3000);
    try {
      const res: any = newReaction === null ? await roarApi.unreactPost(msgId, roomId) : await roarApi.reactPost(msgId, newReaction, roomId);
      if (res && typeof res.likeCount === "number") {
        setLocalReactions(p => ({ ...p, [msgId]: { ...optimisticState, heartCount: res.likeCount } }));
        lastLocalReactAtRef.current[msgId] = Date.now();
      }
    } catch { setLocalReactions(p => ({ ...p, [msgId]: prev })); onToast("Failed to save reaction"); }
    finally { clearTimeout(failsafe); pendingReactRef.current[msgId] = false; }
  }, [roomId, posts, onToast]);

  const getPredictionVoteValue = (optionIndex: number) => (
    optionIndex === 0 ? "agree" : optionIndex === 1 ? "disagree" : `option_${optionIndex}`
  );

  const getPredictionOptionLabel = (voteValue: string | undefined, options: string[]) => {
    if (!voteValue) return "";
    if (voteValue === "agree") return options[0] || "Option 1";
    if (voteValue === "disagree") return options[1] || "Option 2";
    const optionIndex = Number(voteValue.replace("option_", ""));
    return Number.isFinite(optionIndex) ? (options[optionIndex] || voteValue) : voteValue;
  };

  const formatPredictionCloseLabel = (p: { resolvedAt?: number; closesAt?: number; closedAt?: number }) => {
    if (p.resolvedAt) return "Resolved";
    if (!p.closesAt) return "Open";
    const remaining = p.closesAt - Date.now();
    if (remaining <= 0 || p.closedAt) return "Closed";
    const mins = Math.ceil(remaining / 60000);
    if (mins < 60) return `${mins}m left`;
    return `${Math.ceil(mins / 60)}h left`;
  };

  const resolveRoomPrediction = async (msgId: string, correctVote: string) => {
    if (!roomId) return;
    try {
      setResolvingRoomPredictionId(msgId);
      const res = await axios.post(`/api/roar/rooms/${roomId}/messages/${msgId}/resolve`, { correctVote }, { timeout: REQUEST_TIMEOUT_MS });
      if (res.data?.success) {
        const resolvedAt = res.data.message?.resolvedAt ?? Date.now();
        setPosts(prev => prev.map(p => p.id !== msgId ? p : { ...p, resolvedAt, closedAt: res.data.message?.closedAt ?? resolvedAt, correctVote, accuracyAwarded: true }));
        onToast(`Prediction resolved. ${res.data.correctCount ?? 0} correct fans awarded.`);
      } else { onToast("Failed to resolve prediction"); }
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.error : undefined;
      onToast(message || "Failed to resolve prediction");
    } finally { setResolvingRoomPredictionId(null); }
  };

  const triggerUpload = (type: "image" | "video") => {
    setAttachedType(type);
    if (fileInputRef.current) { fileInputRef.current.accept = type === "image" ? "image/*" : "video/*"; fileInputRef.current.click(); }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      setUploading(true); onToast("Uploading media...");
      const fd = new FormData(); fd.append("file", file);
      // Uploads can legitimately take longer than a normal API call, so this
      // one intentionally gets a longer timeout rather than REQUEST_TIMEOUT_MS.
      const res = await axios.post("/api/upload", fd, { headers: { "Content-Type": "multipart/form-data" }, timeout: 60000 });
      if (res.data?.url) { setAttachedUrl(res.data.url); onToast("Media uploaded!"); }
    } catch { onToast("Upload failed"); setAttachedType(null); }
    finally { setUploading(false); if (e.target) e.target.value = ""; }
  };

  const send = async () => {
    if (!roomId) return;
    if (postCooldown > 0) return;
    const text = input.trim();
    if (!text && !attachedUrl) return;
    if (sendingRef.current) return;
    sendingRef.current = true; setIsSending(true);
    // Failsafe: guarantees the send lock is released even if something we
    // didn't anticipate keeps the axios promise from ever settling.
    const failsafe = setTimeout(() => {
      sendingRef.current = false;
      setIsSending(false);
    }, REQUEST_TIMEOUT_MS + 3000);
    const clientMsgId = `${currentUserId || "anon"}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    try {
      const res = await axios.post(
        `/api/roar/rooms/${roomId}/messages`,
        { text: text || "Shared media", type: mode, mediaUrls: attachedUrl ? [attachedUrl] : undefined, clientMsgId },
        { timeout: REQUEST_TIMEOUT_MS }
      );
      if (res.data?.success) {
        const m = res.data.message;
        setPosts(p => [...p, { id: m.msgId, fan: { username: displayUsername(m.authorUsername), authorUid: m.authorUid, badge: m.authorBadge, avatarUrl: m.authorAvatarUrl || m.avatarUrl || (m.authorUsername === userUsername ? userAvatarUrl : undefined) }, text: m.text, fireCount: m.fireCount ?? 0, heartCount: m.heartCount ?? 0, mindblownCount: m.mindblownCount ?? 0, goatCount: m.goatCount ?? 0, clapCount: m.clapCount ?? 0, nochanceCount: m.noChanceCount ?? 0, userReaction: null, replyCount: 0, agreeCount: 0, disagreeCount: 0, userVote: null, sideA: m.sideA ?? null, sideB: m.sideB ?? null, timeAgo: "now", createdAt: m.createdAt || Date.now(), type: m.type, mediaUrls: m.mediaUrls, quizQuestion: m.quizQuestion, quizOptions: m.quizOptions, quizCorrectOption: m.quizCorrectOption, quizUserAnswer: m.quizUserAnswer ?? null, quizTimer: m.quizTimer, quizPoints: m.quizPoints, quizParticipants: m.quizParticipants ?? 0, memGifUrl: m.memGifUrl ?? null, memTag: m.memTag ?? null }]);
        setInput(""); setAttachedUrl(null); setAttachedType(null);
        playSound("post");
        startPostCooldown();
        setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }), 50);
      }
    } catch { onToast("Failed to send message"); }
    finally { clearTimeout(failsafe); sendingRef.current = false; setIsSending(false); }
  };

  const askDolly = async () => {
    const q = dollyQuestion.trim();

    const targetRoomId = dollyActiveRoomId ?? roomId;
    if (!q || dollyAsking || !targetRoomId) return;
    setDollyAsking(true);
    const tempId = `temp-dolly-${Date.now()}`;
    setDollyReplies(prev => [...prev, { id: tempId, question: q, answer: "", createdAt: Date.now() }]);
    setDollyQuestion("");
    try {
      // Dolly is an AI response and can legitimately take longer than a
      // normal API call, so it gets a longer timeout than REQUEST_TIMEOUT_MS.
      const res = await axios.post(`/api/roar/rooms/${targetRoomId}/dolly`, { question: q }, { timeout: 30000 });
      if (res.data?.success) {
        if (dollyActiveRoomIdRef.current === targetRoomId) {
          setDollyReplies(prev => prev.map(d => d.id === tempId ? res.data.reply : d));
        }
      } else {
        throw new Error("Dolly request failed");
      }
    } catch {
      if (dollyActiveRoomIdRef.current === targetRoomId) {
        setDollyReplies(prev => prev.map(d => d.id === tempId ? { ...d, answer: "Something went wrong — try again." } : d));
      }
    } finally {
      setDollyAsking(false);
    }
  };

  const handleQuickReactPost = async (opt: typeof QUICK_REACT_OPTS[0]) => {
    if (!roomId) return;
    setShowQuickCompose(false);
    const memTag = opt.id.replace("qr_", "");

    const tempId = `temp-qr-${Date.now()}`;
    const optimisticMsg: any = {
      id: tempId,
      fan: { username: displayUsername(userUsername), authorUid: "", badge: "", avatarUrl: userAvatarUrl },
      text: opt.label, fireCount: 0, heartCount: 0, mindblownCount: 0, goatCount: 0, clapCount: 0, nochanceCount: 0, userReaction: null, replyCount: 0, agreeCount: 0, disagreeCount: 0, userVote: null, sideA: null, sideB: null, timeAgo: "Sending...", createdAt: Date.now(), type: "post", mediaUrls: [], quizQuestion: null, quizOptions: null, quizCorrectOption: null, quizUserAnswer: null, quizTimer: null, quizPoints: null, quizParticipants: 0, memGifUrl: null, memTag: memTag, status: "sending"
    };

    setPosts(p => [...p, optimisticMsg]);

    try {
      const res = await axios.post(`/api/roar/rooms/${roomId}/messages`, {
        text: opt.label,
        type: "post",
        memTag,
      }, { timeout: REQUEST_TIMEOUT_MS });
      if (res.data?.success) {
        const m = res.data.message;
        setPosts(p => {
          if (p.some(post => post.id === m.msgId)) return p.filter(post => post.id !== tempId);
          return p.map(post => post.id === tempId ? { ...post, id: m.msgId, status: "sent", timeAgo: "now", createdAt: m.createdAt || Date.now(), memGifUrl: m.memGifUrl } : post);
        });
        setNewlyPostedIds(prev => new Set([...prev, m.msgId]));
        playSound("post");
        if (["wicket", "six", "four", "goal", "redcard", "catch", "frango", "yellowcard"].includes(memTag)) {
          setCelebration({ memTag });
        }
        setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }), 50);
        onToast(`${opt.emoji} ${opt.label} posted!`);
      }
    } catch {
      setPosts(p => p.filter(post => post.id !== tempId));
      onToast("Failed to post");
    }
  };

  const handleBack = (e: React.PointerEvent | React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); onBack(); };
  const shareRoomLink = () => {
    if (typeof navigator !== "undefined" && navigator.share) navigator.share({ title: "SF360 Infinity Room", url: window.location.href });
    else { copyToClipboard(window.location.href); onToast("Link copied!"); }
  };



  const composeIconMap: Record<string, React.ReactNode> = {
    hot_take: <Flame size={13} stroke="url(#dr-pink-orange-grad)" fill="url(#dr-pink-orange-grad)" />,
    prediction: <TrendingUp size={13} stroke="url(#dr-pink-orange-grad)" />,
    debate: <Zap size={13} stroke="url(#dr-pink-orange-grad)" fill="url(#dr-pink-orange-grad)" />,
    memory: <History size={13} stroke="url(#dr-pink-orange-grad)" />,
    post: <PenTool size={13} stroke="url(#dr-pink-orange-grad)" />,
    quiz: <Brain size={13} stroke="url(#dr-pink-orange-grad)" />,
  };

  const renderReactionPicker = (p: any) => {
    const lo = localReactions[p.id];
    const currentReaction: Reaction | null = lo !== undefined ? lo.reaction : (p.userReaction ?? null);
    const heartCount = lo !== undefined ? lo.heartCount : (p.heartCount ?? 0);
    return (
      <div onClick={e => e.stopPropagation()}>
        <ReactionPicker
          currentReaction={currentReaction}
          count={heartCount}
          onReact={(r) => handleReact(p.id, r)}
          postId={p.id}
          roomId={roomId}
          roomName={roomName}
        />
      </div>
    );
  };

  const REACTION_EMOJI: Record<string, string> = { fire: "🔥", heart: "❤️", mindblown: "🤯", goat: "🐐", clap: "👏", nochance: "🙅", laugh: "😂", sad: "😢", thumb: "👍" };

  const renderReactionsTrigger = (p: any) => {
    const lo = localReactions[p.id];
    const heartCount = lo !== undefined ? lo.heartCount : (p.heartCount ?? 0);
    if (heartCount === 0) return null;
    const topReactions = topReactionsMap[p.id] ?? [];
    if (topReactions.length === 0 && !topReactionsCache.current[p.id]) fetchTopReactions(p.id);
    const currentReaction = lo?.reaction ?? p.userReaction ?? null;
    const displayReactions = topReactions.length > 0 ? topReactions : currentReaction ? [currentReaction] : [];
    if (displayReactions.length === 0) return null;
    return (
      <motion.button whileTap={{ scale: 0.93 }} onClick={e => { e.stopPropagation(); setReactionsMsgId(p.id); }} style={{ display: "flex", alignItems: "center", gap: 3, background: "none", border: "none", cursor: "pointer", marginLeft: "auto", padding: 0 }} title="See who reacted">
        <div style={{ display: "flex" }}>
          {displayReactions.map((type, i) => (
            <div key={type} style={{ width: 18, height: 18, borderRadius: "50%", background: "#1e1e2a", border: "1.5px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, marginLeft: i === 0 ? 0 : -5, zIndex: displayReactions.length - i, position: "relative" }}>
              {REACTION_EMOJI[type] ?? "❤️"}
            </div>
          ))}
        </div>
      </motion.button>
    );
  };

  const renderPostHeader = (p: any, postType: string, onAvatarClick?: () => void) => (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, minWidth: 0 }} onClick={e => e.stopPropagation()}>
      <div style={{ flexShrink: 0, cursor: onAvatarClick ? "pointer" : "default" }} onClick={e => { e.stopPropagation(); onAvatarClick?.(); }}>
        <AvatarWithBadge username={p.fan.username} badge={p.fan.badge} size="sm" avatarUrl={p.fan.avatarUrl} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, flex: 1, minWidth: 0, flexWrap: "wrap" }}>
        <span style={{ fontWeight: 700, fontSize: 10, color: "#fff", whiteSpace: "nowrap", cursor: onAvatarClick ? "pointer" : "default" }} onClick={e => { e.stopPropagation(); onAvatarClick?.(); }}>
          {p.fan.username}
        </span>
        <span style={{ fontSize: 7, color: "rgba(255,255,255,0.48)", whiteSpace: "nowrap" }}>{p.timeAgo}</span>
        {p.type && (
          <span className={typeBadgeClass(p.type)}>
            {p.type === "post" ? "POST" : p.type === "hottake" ? "HOT TAKE" : p.type === "prediction" ? "PREDICTION" : p.type === "debate" ? "DEBATE" : p.type === "raw_reactions" ? "RAW REACTIONS" : p.type.toUpperCase()}
          </span>
        )}
      </div>
      <div style={{ position: "relative", flexShrink: 0 }} ref={openMenuPostId === p.id ? menuRef : undefined}>
        <button
          onClick={e => { e.stopPropagation(); setOpenMenuPostId(openMenuPostId === p.id ? null : p.id); }}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 3, borderRadius: "50%" }}
        >
          <MoreVertical size={14} />
        </button>
        <AnimatePresence>
          {openMenuPostId === p.id && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.12 }}
              onClick={e => e.stopPropagation()}
              style={{ position: "absolute", top: "calc(100% + 3px)", right: 0, zIndex: 30, background: "#1a1a24", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, overflow: "hidden", minWidth: 110, boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}
            >
              <button
                onClick={() => pinnedPost?.msgId === p.id ? handleUnpin() : handlePinPost(p)}
                style={{ width: "100%", textAlign: "left", padding: "7px 10px", background: "none", border: "none", cursor: "pointer", color: "#fff", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}
              >
                {pinnedPost?.msgId === p.id ? "Unpin" : "Pin"}
              </button>
              {isCurrentUserAuthor(p) && (
                <button
                  onClick={async () => {
                    setOpenMenuPostId(null);
                    if (!window.confirm("Delete this post?")) return;
                    try { await axios.delete(`/api/roar/rooms/${roomId}/messages/${p.id}`, { timeout: REQUEST_TIMEOUT_MS }); setPosts(prev => prev.filter(x => x.id !== p.id)); }
                    catch { onToast("Failed to delete post"); }
                  }}
                  style={{ width: "100%", textAlign: "left", padding: "7px 10px", background: "none", border: "none", borderTop: "1px solid rgba(255,255,255,0.06)", cursor: "pointer", color: "#f87171", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}
                >
                  Delete
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  const renderActionBar = (p: any, postPayload: any, postType: string) => {
    const replyCount = p.replyCount || 0;
    const defaultOpen = replyCount > 0;
    const isOpen = openInlinePostId === p.id || (defaultOpen && !explicitlyClosedPostIds.has(p.id));
    const accent = commentAccentColor(postType);
    return (
      <div style={{ marginTop: 0 }}>
        <div style={{ display: "flex", gap: 6, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 4, alignItems: "center" }}>
          {renderReactionPicker(p)}
          <button
            onClick={e => {
              e.stopPropagation();
              if (isOpen) {
                if (openInlinePostId === p.id) setOpenInlinePostId(null);
                setExplicitlyClosedPostIds(prev => {
                  const next = new Set(prev);
                  next.add(p.id);
                  return next;
                });
              } else {
                setOpenInlinePostId(p.id);
                setExplicitlyClosedPostIds(prev => {
                  const next = new Set(prev);
                  next.delete(p.id);
                  return next;
                });
              }
            }}
            style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", color: isOpen ? accent : "#9494ad", fontSize: 11, fontWeight: 600, transition: "color 0.15s", padding: 0 }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span style={{ fontSize: 9 }}>{replyCount}</span>
            {isOpen ? <ChevronUp size={10} style={{ opacity: 0.7 }} /> : <ChevronDown size={10} style={{ opacity: 0.5 }} />}
          </button>
          <button onClick={e => { e.stopPropagation(); openShareDialog(p); }} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", color: "#9494ad", fontSize: 11, fontWeight: 600 }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </button>
          {renderReactionsTrigger(p)}
        </div>
        <AnimatePresence>
          {isOpen && roomId && (
            <InlineSection
              key={`inline-${p.id}`}
              postId={p.id} roomId={roomId} roomName={roomName} isOpen={isOpen}
              onOpenFull={() => { setOpenInlinePostId(null); onPostClick?.(postPayload); }}
              accentColor={accent} currentAvatarUrl={userAvatarUrl}
              currentUserId={currentUserId}
              currentUsername={userUsername}
              onFanProfile={onFanProfile}
              onCommentPosted={() => {
                setPosts(prev => prev.map(x => x.id === p.id ? { ...x, replyCount: (x.replyCount || 0) + 1 } : x));
                playSound("comment");
                onToast("Comment posted!");
              }}
              onCommentDeleted={() => {
                setPosts(prev => prev.map(x => x.id === p.id ? { ...x, replyCount: Math.max(0, (x.replyCount || 0) - 1) } : x));
                onToast("Reply deleted");
              }}
            />
          )}
        </AnimatePresence>
      </div>
    );
  };

  const allVisiblePosts = React.useMemo(() => {
    const seen = new Set<string>();
    return [...morePosts, ...posts].filter(p => {
      if (p.type === "predictions_live") return false;
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
  }, [morePosts, posts]);

  const postCount = roomCounts.post;
  const debateCount = roomCounts.debate;
  const predictionCount = roomCounts.prediction;
  const triviaCount = roomCounts.trivia;
  const battleCount = roomCounts.battle;

  const filteredPosts = activeFilter === "all"
    ? allVisiblePosts
    : allVisiblePosts.filter(p => {
      if (activeFilter === "post") return p.type === "post" || !p.type;
      return p.type === activeFilter;
    });

  const predictionsLivePosts =
    [...morePosts, ...posts]
      .filter((p) => p.type === "predictions_live")
      .sort((a, b) => b.createdAt - a.createdAt);

  type FeedItem =
    | { kind: "post"; data: any; sortKey: number }
    | { kind: "dolly"; data: typeof dollyReplies[0]; sortKey: number };

  const feedItems: FeedItem[] = filteredPosts
    .map(p => ({ kind: "post" as const, data: p, sortKey: p.createdAt }))
    .sort((a, b) => a.sortKey - b.sortKey);

  return (
    <div className="flex flex-col w-full bg-[#0e0e14]" style={{ height: "100%", overflow: "hidden" }}>
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <linearGradient id="dr-pink-orange-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e91e8c" /><stop offset="100%" stopColor="#ff6b35" />
        </linearGradient>
      </svg>

      <AnimatePresence>
        {celebration && (
          celebration.memTag === "wave" ? (
            <WaveCelebrationBurst
              key={"wave-" + Date.now()}
              onDone={() => setCelebration(null)}
            />
          ) : (
            <CelebrationBurst
              key={celebration.memTag + Date.now()}
              memTag={celebration.memTag}
              onDone={() => setCelebration(null)}
            />
          )
        )}
      </AnimatePresence>

      {sharePost && (
        <>
          <button type="button" className="fixed inset-0 z-40 bg-black/70 lg:hidden" onClick={closeShareDialog} />
          <div className="fixed bottom-16 inset-x-4 z-50 mx-auto w-full max-w-[280px] rounded-2xl border border-white/10 bg-[#1a1a1e] p-3 shadow-2xl lg:hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-white text-sm font-semibold">Share</p>
              <button type="button" onClick={closeShareDialog} className="text-gray-400 hover:text-white"><svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg></button>
            </div>
            <div className="flex flex-row flex-nowrap items-center gap-1.5 mb-2 overflow-x-auto">{shareButtons("w-8 h-8")}</div>
            {copied && <p className="text-xs text-emerald-400">Copied to clipboard</p>}
          </div>
          <div className="hidden lg:flex fixed inset-0 z-50 items-center justify-center bg-black/60" onClick={closeShareDialog}>
            <div className="bg-[#1a1a1e] rounded-2xl border border-white/10 p-4 w-[300px] shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-white text-sm font-semibold">Share ROAR Post</p>
                <button type="button" onClick={closeShareDialog} className="text-gray-400 hover:text-white"><svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg></button>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#111114] p-3 mb-3">
                <p className="text-white text-sm font-semibold line-clamp-2">{sharePost.text || "ROAR Post"}</p>
                <p className="text-white/45 text-[11px] mt-2 line-clamp-2 break-all">{buildRoarPostShareUrl(sharePost)}</p>
              </div>
              <div className="flex flex-row flex-nowrap items-center gap-2 mb-2">{shareButtons("w-9 h-9")}</div>
              {copied && <p className="text-xs text-emerald-400">Copied to clipboard</p>}
            </div>
          </div>
        </>
      )}

      {!watchAlongRoomId && (
        <>
          <div className="shrink-0 px-3 py-2 bg-[rgba(14,14,20,0.98)] backdrop-blur-[20px] border-b border-[var(--border)]" style={{ overflow: "visible", position: "relative", zIndex: 40 }}>
            <div className="flex justify-between items-start gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <button type="button" onPointerDown={handleBack} onClick={handleBack} className="bg-transparent border-none cursor-pointer text-white flex items-center p-0 flex-shrink-0" style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}>
                  <ChevronLeft size={22} />
                </button>
                <div className="text-left pt-0.5 min-w-0 flex-1">
                  <p className="font-display text-lg tracking-[0.04em] m-0 leading-tight text-white font-extrabold uppercase truncate">{roomName || "WORLDCUP"}</p>
                  <div className="flex items-center gap-1 flex-wrap">
                    <div className="flex items-center gap-1">
                      <span className="live-pulse w-1.5 h-1.5 rounded-full bg-[var(--live-green)] inline-block flex-shrink-0" />
                      <span className="text-[8px] font-bold text-[var(--live-green)] flex-shrink-0">LIVE</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={toggleSound}
                  className="flex-shrink-0 bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.12)] rounded-[10px] p-1.5 cursor-pointer text-[rgba(255,255,255,0.75)] flex items-center justify-center"
                  style={{ width: "32px", height: "32px" }}
                  title={soundEnabled ? "Mute sounds" : "Unmute sounds"}
                >
                  {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                </button>
                <button type="button" onClick={shareRoomLink} className="flex-shrink-0 bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.12)] rounded-[10px] p-1.5 cursor-pointer text-[rgba(255,255,255,0.75)] flex items-center justify-center" style={{ width: "32px", height: "32px" }}>
                  <Share2 size={14} />
                </button>
                {(score || scoreSubtitle) && (
                  <div className="text-right pr-0.5 flex-shrink-0">
                    {score && <div className="font-display text-[22px] text-[var(--accent-yellow)] leading-none">{score}</div>}
                    {scoreSubtitle && <div className="text-[10px] text-[var(--text-secondary)] mt-0.5">{scoreSubtitle}</div>}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="shrink-0 px-3 py-0 bg-[rgba(14,14,20,0.98)] border-b border-[var(--border)]">
            <ActiveFansStack
              fans={activeFans}
              count={liveCount}
              totalJoinCount={totalJoinCount}
              onClick={() => { refreshActiveFans(); setActiveFansOpen(true); }}
            />
          </div>
        </>
      )}

      {pinnedPost && (
        <div
          className="shrink-0 px-3 py-0.5 bg-[rgba(233,30,140,0.08)] border-b border-[rgba(233,30,140,0.18)] flex items-center gap-1.5 cursor-pointer"
          onClick={() => {
            const target = [...morePosts, ...posts].find(p => p.id === pinnedPost.msgId);
            if (target) {
              onPostClick?.({ id: target.id, text: target.text, fan: target.fan, timeAgo: target.timeAgo, createdAt: target.createdAt, type: target.type || "post", isDbPost: true, roomId, mediaUrls: target.mediaUrls });
            }
          }}
        >
          <span className="text-[9px] shrink-0">📌</span>
          <p className="m-0 text-[10px] text-white/85 whitespace-nowrap overflow-hidden text-ellipsis flex-1">
            <span className="font-bold text-[#e91e8c]">Pinned: </span>
            {pinnedPost.text}
          </p>
          <ChevronDown size={12} className="text-white/35 shrink-0 -rotate-90" />
        </div>
      )}

      <div className="flex justify-start gap-1 py-1 px-2 overflow-x-auto shrink-0 border-b border-[var(--border)]" style={{ scrollbarWidth: "none" }}>
        {(["all", "post", "debate", "prediction", "trivia", "battle"] as const).map((f) => {
          const isActive = activeFilter === f;
          const count = f === "post" ? postCount : f === "debate" ? debateCount : f === "prediction" ? predictionCount : f === "trivia" ? triviaCount : f === "battle" ? battleCount : 0;
          const color = f === "post" ? "#e91e8c" : f === "debate" ? "#60a5fa" : f === "prediction" ? "#fbbf24" : f === "trivia" ? "#22c55e" : f === "battle" ? "#E91E8C" : "#fff";
          const label = f === "all" ? "All" : f === "post" ? "Posts" : f === "debate" ? "Debates" : f === "prediction" ? "Predictions" : f === "trivia" ? "Trivia" : "Battles";
          return (
            <button key={f} type="button" onClick={() => setActiveFilter(f)}
              className="flex items-center gap-1 px-2 rounded-full text-[10px] font-bold whitespace-nowrap shrink-0 transition-all duration-150"
              style={{ background: isActive ? `${color}22` : "rgba(255,255,255,0.05)", border: `1.5px solid ${isActive ? `${color}70` : "rgba(255,255,255,0.1)"}`, color: isActive ? color : "rgba(255,255,255,0.5)" }}
            >
              {f !== "all" && <span className="w-1 h-1 rounded-full shrink-0" style={{ background: color }} />}
              {label}
              {f !== "all" && !isActive && count > 0 && (
                <span className="text-[8px] font-extrabold px-1 rounded-full" style={{ background: `${color}28`, color }}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {predictionsLivePosts.length > 0 && (
        <PredictionsLivePanel
          posts={predictionsLivePosts}
          roomId={roomId ?? ""}
          onToast={onToast}
          openInlinePostId={openInlinePostId}
          setOpenInlinePostId={setOpenInlinePostId}
          currentAvatarUrl={userAvatarUrl}
          handleReact={handleReact}
          localReactions={localReactions}
          pendingReactRef={pendingReactRef}
          onPostClick={onPostClick}
          onFanProfile={onFanProfile}
          setReactionsMsgId={setReactionsMsgId}
          topReactionsMap={topReactionsMap}
          topReactionsCache={topReactionsCache}
          fetchTopReactions={fetchTopReactions}
        />
      )}
      <div ref={listRef} className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-1 flex flex-col gap-0 min-h-0">
        <AnimatePresence initial={false}>
          {loading || !dollyLoaded ? (
            <div className="text-center text-[var(--text-muted)] py-6 text-xs">Loading messages...</div>
          )
            : (
              feedItems.map((item) => {
                const p = item.data;

                if (p.type === "trivia") {
                  return (
                    <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
                      <TriviaCard post={p} onToast={onToast} onPostClick={onPostClick} roomId={roomId} onFanProfile={onFanProfile} />
                    </motion.div>
                  );
                }

                if (p.type === "battle") {
                  return (
                    <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
                      <BattleCard post={p} onToast={onToast} onPostClick={onPostClick} roomId={roomId} onFanProfile={onFanProfile} />
                    </motion.div>
                  );
                }

                if (p.type === "quiz") {
                  return (
                    <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
                      <QuizCard post={p} onToast={onToast} onPostClick={onPostClick} roomId={roomId} onFanProfile={onFanProfile} />
                    </motion.div>
                  );
                }

                if (p.type === "debate") {
                  const liveTotal = (p.agreeCount ?? 0) + (p.disagreeCount ?? 0);
                  const agrPct = liveTotal > 0 ? Math.round(((p.agreeCount ?? 0) / liveTotal) * 100) : 50;
                  const disAgrPct = 100 - agrPct;
                  const userVote = p.userVote;
                  const hasVoted = userVote === "agree" || userVote === "disagree";
                  const displayVotedA = userVote === "agree";
                  const displayVotedB = userVote === "disagree";
                  const rawText = p.text ?? "";
                  const vsParts = rawText.split(" VS ");
                  const hasSides = !!(p.sideA || p.sideB);
                  const sideA = p.sideA || vsParts[0] || "Side A";
                  const sideB = p.sideB || vsParts[1] || "Side B";
                  const questionText = hasSides ? rawText : null;
                  const debatePayload = { id: p.id, text: p.text, fan: p.fan, timeAgo: p.timeAgo, createdAt: p.createdAt, type: "debate", isDbPost: true, roomId, mediaUrls: p.mediaUrls, sideA, sideB };
                  return (
                    <motion.div key={p.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}
                      className="cursor-pointer" style={{ padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.07)" }}
                      onClick={() => onPostClick?.(debatePayload)}
                    >
                      {renderPostHeader(p, "debate", () => onFanProfile?.(p.fan))}
                      {questionText && <p style={{ fontWeight: 600, fontSize: 10, lineHeight: 1.3, marginBottom: 3, color: "var(--text-primary)" }}>{questionText}</p>}
                      <div style={{ display: "flex", gap: 6, alignItems: "stretch", marginBottom: 4 }}>
                        {[
                          { label: sideA, voted: displayVotedA, color: "var(--accent-magenta)", bg: "rgba(233,30,140,0.08)", border: "rgba(233,30,140,0.3)", voteVal: "agree" as const },
                          { label: sideB, voted: displayVotedB, color: "#60a5fa", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.3)", voteVal: "disagree" as const },
                        ].map(({ label, voted, color, bg, border, voteVal }, idx) => (
                          <>
                            {idx === 1 && <div key="vs" style={{ display: "flex", alignItems: "center", padding: "0 1px" }}><span className="font-display" style={{ fontSize: 14, color: "var(--text-muted)" }}>VS</span></div>}
                            <motion.button key={voteVal} whileTap={!hasVoted ? { scale: 0.96 } : {}}
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (hasVoted || votingInProgressRef.current.has(p.id)) return;
                                votingInProgressRef.current.add(p.id);
                                const failsafe = setTimeout(() => votingInProgressRef.current.delete(p.id), REQUEST_TIMEOUT_MS + 3000);
                                setPosts(prev => prev.map(x => x.id !== p.id ? x : { ...x, userVote: voteVal, agreeCount: (x.agreeCount ?? 0) + (voteVal === "agree" ? 1 : 0), disagreeCount: (x.disagreeCount ?? 0) + (voteVal === "disagree" ? 1 : 0) }));
                                setOpenInlinePostId(p.id);
                                try {
                                  await axios.post(`/api/roar/rooms/${roomId}/messages/${p.id}/vote`, { vote: voteVal }, { timeout: REQUEST_TIMEOUT_MS });
                                  if (phog) {
                                    phog.capture("poll_voted", {
                                      poll_id: p.id,
                                      poll_type: "debate_vs",
                                      option_id: voteVal,
                                      room_id: roomId,
                                      room_name: roomName || ""
                                    });
                                  }
                                } catch (err: any) {
                                  const status = err?.response?.status;
                                  if (status !== 409 && status !== 400) {
                                    setPosts(prev => prev.map(x => x.id !== p.id ? x : { ...x, userVote: null, agreeCount: Math.max(0, (x.agreeCount ?? 0) - (voteVal === "agree" ? 1 : 0)), disagreeCount: Math.max(0, (x.disagreeCount ?? 0) - (voteVal === "disagree" ? 1 : 0)) }));
                                    onToast("Failed to submit vote");
                                  }
                                } finally { clearTimeout(failsafe); votingInProgressRef.current.delete(p.id); }
                              }}
                              disabled={hasVoted}
                              style={{ flex: 1, padding: "6px", borderRadius: "0px", textAlign: "center", background: voted ? color : bg, border: `2px solid ${voted ? color : border}`, color: voted ? "white" : "var(--text-primary)", cursor: hasVoted ? "not-allowed" : "pointer", transition: "all 0.2s", opacity: hasVoted && !voted ? 0.35 : 1 }}
                            >
                              <p style={{ fontSize: 10, fontWeight: 700, margin: 0 }}>{voted ? "✓ " : ""}{label}</p>
                            </motion.button>
                          </>
                        ))}
                      </div>
                      <div style={{ marginBottom: 1 }}>
                        <div style={{ display: "flex", borderRadius: 0, overflow: "hidden", height: 1.5, background: "rgba(255,255,255,0.06)" }}>
                          <div style={{ width: `${agrPct}%`, background: "var(--accent-magenta)", transition: "width 0.4s ease" }} />
                          <div style={{ width: `${disAgrPct}%`, background: "#60a5fa", transition: "width 0.4s ease" }} />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
                          <span style={{ fontSize: 7, fontWeight: 700, color: "var(--accent-magenta)" }}>{agrPct}%</span>
                          <span style={{ fontSize: 8, color: "var(--text-muted)", fontWeight: 500 }}>{liveTotal} vote{liveTotal !== 1 ? "s" : ""}</span>
                          <span style={{ fontSize: 7, fontWeight: 700, color: "#60a5fa" }}>{disAgrPct}%</span>
                        </div>
                      </div>
                      {liveTotal > 0 && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setVotersMsgId(p.id); setVotersMode("debate"); }}
                          style={{
                            display: "flex", alignItems: "center", gap: 4,
                            width: "100%", marginBottom: 4,
                            padding: "4px 8px", borderRadius: 6,
                            background: "rgba(233,30,140,0.07)",
                            border: "1px solid rgba(233,30,140,0.22)",
                            cursor: "pointer", color: "var(--accent-magenta)",
                            fontSize: 9, fontWeight: 700,
                          }}
                        >
                          <Users size={10} />
                          <span>View Votes</span>
                        </button>
                      )}
                      <p style={{ fontSize: 9, fontWeight: hasVoted ? 600 : 400, color: hasVoted ? "var(--accent-magenta)" : "var(--text-muted)", marginBottom: 6, fontStyle: hasVoted ? "normal" : "italic" }}>
                        {hasVoted ? "You've already voted · thanks for joining the debate!" : "Tap a side to vote · results reveal after voting"}
                      </p>
                      {renderActionBar(p, debatePayload, "debate")}
                    </motion.div>
                  );
                }

                const defaultPayload = { id: p.id, text: p.text, fan: p.fan, timeAgo: p.timeAgo, createdAt: p.createdAt, type: p.type || "post", isDbPost: true, roomId, mediaUrls: p.mediaUrls };

                return (
                  <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}
                    className="cursor-pointer" style={{ padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.07)" }}
                    onClick={() => onPostClick?.(defaultPayload)}
                  >
                    {renderPostHeader(p, p.type || "post", () => onFanProfile?.(p.fan))}

                    {p.memTag === "wave" ? (
                      <WaveInlineContent
                        post={p}
                        liveCount={liveCount}
                        onReact={handleReact}
                        localReactions={localReactions}
                        onCelebrate={() => setCelebration({ memTag: "wave" })}
                      />
                    ) : (
                      <>
                        <p
                          className="leading-snug text-white"
                          style={
                            p.memTag && ["wicket", "six", "four", "catch", "boundary", "frango", "redcard", "yellowcard", "goal"].includes(p.memTag)
                              ? { fontSize: 13, fontWeight: 800, letterSpacing: "0.02em", textTransform: "uppercase", margin: "3px 0" }
                              : { fontSize: 10 }
                          }
                        >
                          {p.text}
                        </p>

                        {/* Play sound only, without showing video, for newly posted quick-reacts */}
                        {p.memTag &&
                          QUICK_REACT_VIDEO_MAP[p.memTag] &&
                          newlyPostedIds.has(p.id) &&
                          !videoEndedIds.has(p.id) && (
                            <video
                              src={QUICK_REACT_VIDEO_MAP[p.memTag]}
                              autoPlay
                              muted={false}
                              playsInline
                              onEnded={() => {
                                setNewlyPostedIds(prev => {
                                  const next = new Set(prev);
                                  next.delete(p.id);
                                  return next;
                                });
                                setVideoEndedIds(prev => new Set([...prev, p.id]));
                              }}
                              style={{
                                position: "absolute",
                                width: 1,
                                height: 1,
                                opacity: 0,
                                pointerEvents: "none",
                              }}
                            />
                          )}

                        {p.type === "raw_reactions" && p.memGifUrl && (
                          <img src={p.memGifUrl} alt="reaction gif" style={{ width: "100%", maxHeight: 140, objectFit: "cover", borderRadius: 10, marginTop: 6 }} />
                        )}
                        {p.type === "raw_reactions" && p.memTag && !["wicket", "six", "four", "boundary"].includes(p.memTag) && (
                          <span style={{ display: "inline-block", marginTop: 6, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "rgba(0,232,198,0.12)", color: "#00e8c6", border: "1px solid rgba(0,232,198,0.3)", letterSpacing: "0.04em" }}>#{p.memTag}</span>
                        )}
                      </>
                    )}

                    {p.type === "prediction" && (() => {
                      const liveTotal = (p.agreeCount ?? 0) + (p.disagreeCount ?? 0);
                      const userVote = p.userVote;
                      const hasVoted = userVote === "agree" || userVote === "disagree";
                      const predictionOptions = Array.isArray(p.predictionOptions) && p.predictionOptions.length >= 2 ? p.predictionOptions : [p.sideA || "Option 1", p.sideB || "Option 2"];
                      const optionCounts = p.predictionOptionCounts ?? {};
                      const predictionTotal = liveTotal + Object.values(optionCounts).reduce((sum: number, count: unknown) => sum + (Number(count) || 0), 0);
                      const predictionPct = (count: number) => predictionTotal > 0 ? Math.round((count / predictionTotal) * 100) : 0;
                      const predAgrPct = predictionPct(p.agreeCount ?? 0);
                      const predDisAgrPct = predictionPct(p.disagreeCount ?? 0);
                      const hasPredictionVoted = hasVoted || (typeof userVote === "string" && userVote.startsWith("option_"));
                      const predictionClosed = Boolean(p.resolvedAt || p.closedAt || (p.closesAt && p.closesAt <= Date.now()));
                      const isPredictionAuthor = isCurrentUserAuthor(p);
                      const correctVoteLabel = getPredictionOptionLabel(p.correctVote, predictionOptions);
                      return (
                        <>
                          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 4, background: predictionClosed ? "rgba(244,67,54,0.12)" : "rgba(34,197,94,0.1)", color: predictionClosed ? "#f87171" : "#22c55e", border: `1px solid ${predictionClosed ? "rgba(244,67,54,0.25)" : "rgba(34,197,94,0.22)"}` }}>
                              <Clock size={9} /> {formatPredictionCloseLabel(p)}
                            </span>
                          </div>
                          <div style={{ display: "flex", gap: 6, marginTop: 4, marginBottom: 3 }}>
                            {predictionOptions.slice(0, 2).map((label: string, optionIndex: number) => {
                              const agree = optionIndex === 0;
                              const pctVal = optionIndex === 0 ? predAgrPct : predDisAgrPct;
                              const active = optionIndex === 0 ? userVote === "agree" : userVote === "disagree";
                              return (
                                <motion.button key={label} disabled={predictionClosed} whileTap={!hasPredictionVoted && !predictionClosed ? { scale: 0.93 } : {}}
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    if (hasPredictionVoted || predictionClosed) return;
                                    setPosts(prev => prev.map(x => x.id !== p.id ? x : { ...x, userVote: agree ? "agree" : "disagree", agreeCount: (x.agreeCount ?? 0) + (agree ? 1 : 0), disagreeCount: (x.disagreeCount ?? 0) + (!agree ? 1 : 0) }));
                                    try {
                                      await axios.post(`/api/roar/rooms/${roomId}/messages/${p.id}/vote`, { vote: agree ? "agree" : "disagree" }, { timeout: REQUEST_TIMEOUT_MS });
                                      if (phog) {
                                        phog.capture("poll_voted", {
                                          poll_id: p.id,
                                          poll_type: p.type || "prediction",
                                          option_id: agree ? "agree" : "disagree",
                                          room_id: roomId,
                                          room_name: roomName || ""
                                        });
                                        phog.capture("submit_prediction", {
                                          post_id: p.id,
                                          room_id: roomId,
                                          option_id: agree ? "agree" : "disagree",
                                          room_name: roomName || ""
                                        });
                                      }
                                    } catch { onToast("You've already voted!!"); }
                                  }}
                                  style={{ flex: 1, padding: "3px", borderRadius: 0, fontSize: 10, fontWeight: 700, cursor: hasPredictionVoted || predictionClosed ? "default" : "pointer", border: `2px solid ${active ? "#ff6b35" : "#8b8b8b"}`, background: active ? "rgba(255,107,53,0.24)" : "rgba(255,255,255,0.02)", color: active ? "#fff" : "#d1d1d1", boxShadow: active ? "0 0 12px rgba(255,107,53,0.35)" : "none", transition: "all 0.2s ease-in-out", display: "flex", alignItems: "center", justifyContent: "center", gap: 4, opacity: (hasPredictionVoted || predictionClosed) && !active ? 0.4 : 1 }}
                                >
                                  {label}
                                  <span style={{ fontSize: 9, fontWeight: 800, background: active ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)", borderRadius: 0, padding: "1px 5px" }}>{pctVal}%</span>
                                </motion.button>
                              );
                            })}
                          </div>
                          {predictionOptions.length > 2 && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 3 }}>
                              {predictionOptions.slice(2).map((label: string, idx: number) => {
                                const voteValue = `option_${idx + 2}`;
                                const active = userVote === voteValue;
                                const pctVal = predictionPct(optionCounts[voteValue] ?? 0);
                                return (
                                  <button key={`${label}-${idx}`} type="button" disabled={hasPredictionVoted || predictionClosed}
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      if (hasPredictionVoted || predictionClosed) return;
                                      setPosts(prev => prev.map(x => x.id !== p.id ? x : { ...x, userVote: voteValue, predictionOptionCounts: { ...(x.predictionOptionCounts ?? {}), [voteValue]: ((x.predictionOptionCounts ?? {})[voteValue] ?? 0) + 1 } }));
                                      try {
                                        await axios.post(`/api/roar/rooms/${roomId}/messages/${p.id}/vote`, { vote: voteValue }, { timeout: REQUEST_TIMEOUT_MS });
                                        if (phog) {
                                          phog.capture("poll_voted", {
                                            poll_id: p.id,
                                            poll_type: p.type || "prediction",
                                            option_id: voteValue,
                                            room_id: roomId,
                                            room_name: roomName || ""
                                          });
                                          phog.capture("submit_prediction", {
                                            post_id: p.id,
                                            room_id: roomId,
                                            option_id: voteValue,
                                            room_name: roomName || ""
                                          });
                                        }
                                      } catch { onToast("You've already voted!!"); }
                                    }}
                                    style={{ flex: "1 1 calc(50% - 3px)", minWidth: 0, padding: "4px", borderRadius: 0, fontSize: 9, fontWeight: 700, border: `2px solid ${active ? "#ff6b35" : "#8b8b8b"}`, background: active ? "rgba(255,107,53,0.24)" : "rgba(255,255,255,0.02)", color: active ? "#fff" : "#d1d1d1", boxShadow: active ? "0 0 12px rgba(255,107,53,0.35)" : "none", textAlign: "center", opacity: (hasPredictionVoted || predictionClosed) && !active ? 0.4 : 1, cursor: hasPredictionVoted || predictionClosed ? "default" : "pointer" }}
                                  >
                                    {label}
                                    <span style={{ marginLeft: 4, fontSize: 9, fontWeight: 800, background: active ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)", borderRadius: 0, padding: "1px 5px" }}>{pctVal}%</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                          {predictionTotal > 0 && (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setVotersMsgId(p.id); setVotersMode("prediction"); }}
                              style={{
                                display: "flex", alignItems: "center", gap: 4,
                                width: "100%", marginTop: 1, marginBottom: 4,
                                padding: "4px 8px", borderRadius: 6,
                                background: "rgba(255,107,53,0.08)",
                                border: "1px solid rgba(255,107,53,0.22)",
                                cursor: "pointer", color: "#ff8a5c",
                                fontSize: 9, fontWeight: 700,
                              }}
                            >
                              <Users size={10} />
                              <span>View Votes</span>
                            </button>
                          )}
                          {predictionClosed && !p.resolvedAt && isPredictionAuthor && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6, marginBottom: 3 }}>
                              {predictionOptions.map((label: string, optionIndex: number) => (
                                <button key={`room-resolve-${label}-${optionIndex}`} type="button" disabled={resolvingRoomPredictionId === p.id}
                                  onClick={(e) => { e.stopPropagation(); resolveRoomPrediction(p.id, getPredictionVoteValue(optionIndex)); }}
                                  style={{ flex: "1 1 calc(50% - 3px)", minWidth: 0, padding: "7px", borderRadius: 10, fontSize: 10, fontWeight: 800, border: "1px solid rgba(34,197,94,0.35)", background: "rgba(34,197,94,0.1)", color: "#22c55e", cursor: resolvingRoomPredictionId === p.id ? "wait" : "pointer" }}
                                >
                                  Resolve: {label}
                                </button>
                              ))}
                            </div>
                          )}
                          {p.resolvedAt && correctVoteLabel && (
                            <p style={{ fontSize: 10, color: "#22c55e", fontWeight: 800, marginTop: 6, marginBottom: 3 }}>Correct answer: {correctVoteLabel}</p>
                          )}
                        </>
                      );
                    })()}

                    {p.mediaUrls?.length > 0 && (
                      <div className="flex flex-col gap-1.5 mt-1.5">
                        {p.mediaUrls.map((url: string, i: number) =>
                          url.endsWith(".mp4") || url.includes("/video/upload/")
                            ? <video key={i} src={url} controls className="w-full max-h-[160px] rounded-lg object-cover" onClick={e => e.stopPropagation()} />
                            : <img key={i} src={url} alt="" className="w-full max-h-[120px] rounded-lg object-cover" />
                        )}
                      </div>
                    )}

                    {p.type === "hottake" && (() => {
                      const liveTotal = (p.agreeCount ?? 0) + (p.disagreeCount ?? 0);
                      const agrPct = liveTotal > 0 ? Math.round(((p.agreeCount ?? 0) / liveTotal) * 100) : 50;
                      const disAgrPct = 100 - agrPct;
                      const userVote = p.userVote;
                      const hasVoted = userVote === "agree" || userVote === "disagree";
                      return (
                        <div style={{ marginTop: 8, marginBottom: 3 }}>
                          <div style={{ display: "flex", borderRadius: 0, overflow: "hidden", height: 4, background: "rgba(255,255,255,0.06)", marginBottom: 6 }}>
                            <div style={{ width: `${agrPct}%`, background: "var(--accent-magenta)", transition: "width 0.4s ease" }} />
                            <div style={{ width: `${disAgrPct}%`, background: "var(--accent-orange)", transition: "width 0.4s ease" }} />
                          </div>
                          <div style={{ display: "flex", gap: 6 }}>
                            {[
                              { agree: true, label: "Agree", pctVal: agrPct, active: userVote === "agree", color: "var(--accent-magenta)" },
                              { agree: false, label: "Disagree", pctVal: disAgrPct, active: userVote === "disagree", color: "var(--accent-orange)" },
                            ].map(({ agree, label, pctVal, active, color }) => (
                              <motion.button key={label} whileTap={!hasVoted ? { scale: 0.93 } : {}}
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (hasVoted) return;
                                  setPosts(prev => prev.map(x => x.id !== p.id ? x : { ...x, userVote: agree ? "agree" : "disagree", agreeCount: (x.agreeCount ?? 0) + (agree ? 1 : 0), disagreeCount: (x.disagreeCount ?? 0) + (!agree ? 1 : 0) }));
                                  setOpenInlinePostId(p.id);
                                  try {
                                    await axios.post(`/api/roar/rooms/${roomId}/messages/${p.id}/vote`, { vote: agree ? "agree" : "disagree" }, { timeout: REQUEST_TIMEOUT_MS });
                                    if (phog) {
                                      phog.capture("poll_voted", {
                                        poll_id: p.id,
                                        poll_type: p.type || "hot_take",
                                        option_id: agree ? "agree" : "disagree",
                                        room_id: roomId,
                                        room_name: roomName || ""
                                      });
                                    }
                                  } catch { onToast("Failed to submit vote"); }
                                }}
                                style={{ flex: 1, padding: "8px", borderRadius: 0, fontSize: 10, fontWeight: 700, cursor: hasVoted ? "default" : "pointer", border: `2.5px solid ${color}`, background: active ? color : "rgba(255,255,255,0.02)", color: active ? "white" : color, boxShadow: active ? `0 0 14px ${color}60` : "none", transition: "all 0.2s ease-in-out", display: "flex", alignItems: "center", justifyContent: "center", gap: 4, opacity: hasVoted && !active ? 0.4 : 1 }}
                              >
                                {active ? `✓ ${agree ? "Agreed" : "Disagreed"}` : label}
                                <span style={{ fontSize: 9, fontWeight: 800, background: active ? "rgba(255,255,255,0.2)" : `${color}22`, borderRadius: 0, padding: "1px 5px" }}>{pctVal}%</span>
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    {renderActionBar(p, { ...defaultPayload, replyCount: p.replyCount }, p.type || "post")}
                  </motion.div>
                );
              })
            )}
        </AnimatePresence>

        {hasMoreMsgs && !loading && (
          <div ref={sentinelRef} style={{ display: "flex", justifyContent: "center", padding: "12px 0" }}>
            {loadingMoreMsgs && <div style={{ width: 24, height: 24, borderRadius: "50%", border: "3px solid rgba(255,255,255,0.1)", borderTop: "3px solid #E91E8C", animation: "dr-spin 0.8s linear infinite" }} />}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `@keyframes dr-spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}` }} />

      {!showQuickCompose && !dollyOpen && (
        <div className="flex justify-start gap-1 py-1 px-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {RADIAL_OPTS.map((q) => {
            const isActive = q.id === selectedActionId;
            return (
              <div key={q.id} className="flex items-center gap-1 shrink-0">
                <button type="button"
                  onClick={() => { setSelectedActionId(q.id); onCompose?.(q.id); if (q.id !== "post") setSelectedActionId("post"); }}
                  className={["flex items-center justify-start gap-1 px-2.5 rounded-full text-[10px] font-bold whitespace-nowrap border transition-all duration-150 cursor-pointer shrink-0", isActive ? "border-[rgba(233,30,140,0.35)] bg-[rgba(233,30,140,0.12)]" : "border-transparent bg-[rgba(255,255,255,0.04)] text-[rgba(255,255,255,0.6)]"].join(" ")}
                >
                  {composeIconMap[q.id] || <span>{q.emoji}</span>}
                  <span>{q.label}</span>
                </button>
                {q.id === "debate" && postCooldown > 0 && (
                  <span
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      minWidth: 18, height: 18, borderRadius: 999, padding: "0 5px",
                      background: "rgba(248,113,113,0.15)", border: "1px solid rgba(248,113,113,0.4)",
                      color: "#f87171", fontSize: 9, fontWeight: 800,
                    }}
                    title="Posting cooldown"
                  >
                    {postCooldown}s
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="shrink-0 px-2.5 pt-1 pb-1.5 bg-[rgba(14,14,20,0.98)] backdrop-blur-[20px] border-t border-[var(--border)] flex flex-col gap-1">
        {selectedActionId === "post" && !dollyOpen && (
          <>
            <AnimatePresence>
              {showQuickCompose && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  style={{ overflow: "hidden" }}
                >
                  <div style={{ paddingBottom: 3, paddingTop: 0 }}>
                    <p style={{ fontSize: 7, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>
                      Quick Post
                    </p>
                    <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 0.5, scrollbarWidth: "none" }}>
                      {QUICK_REACT_OPTS
                        .filter((q) => q.sport === (roomSports || "cricket").toLowerCase() || q.sport === "both")
                        .map((q) => (
                          <motion.button
                            key={q.id}
                            type="button"
                            whileTap={{ scale: 0.93 }}
                            onClick={() => handleQuickReactPost(q)}
                            style={{
                              flexShrink: 0,
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              padding: "1.5px 8px",
                              borderRadius: 999,
                              border: q.id.includes("wicket") ? "1px solid rgba(233,30,140,0.4)"
                                : q.id.includes("six") ? "1px solid rgba(245,158,11,0.4)"
                                  : q.id.includes("four") ? "1px solid rgba(249,115,22,0.4)"
                                    : q.id.includes("wave") ? "1px solid rgba(56,189,248,0.4)"
                                      : "1px solid rgba(16,185,129,0.4)",
                              background: q.id.includes("wicket") ? "rgba(233,30,140,0.12)"
                                : q.id.includes("six") ? "rgba(245,158,11,0.12)"
                                  : q.id.includes("four") ? "rgba(249,115,22,0.12)"
                                    : q.id.includes("wave") ? "rgba(56,189,248,0.12)"
                                      : "rgba(16,185,129,0.12)",
                              color: "#fff",
                              fontSize: 9,
                              fontWeight: 700,
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <span style={{ fontSize: 10 }}>{q.emoji}</span>
                            <span>{q.label}</span>
                          </motion.button>
                        ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {attachedUrl && (
              <div className="px-2 py-1 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  {attachedType === "image"
                    ? <img src={attachedUrl} className="w-7 h-7 rounded-lg object-cover" alt="Attached" />
                    : <video src={attachedUrl} className="w-7 h-7 rounded-lg object-cover" />}
                  <span className="text-[10px] text-[var(--text-secondary)]">Media attached</span>
                </div>
                <button type="button" onClick={() => { setAttachedUrl(null); setAttachedType(null); }} className="bg-transparent border-none text-[var(--text-muted)] cursor-pointer text-xs">✕</button>
              </div>
            )}

            {showEmojiPicker && (
              <div ref={emojiPickerRef} className="w-full overflow-hidden rounded-xl border border-white/10" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-3 py-1 bg-[#1a1a24] border-b border-white/10">
                  <span className="text-[10px] font-semibold text-white/40">Pick an emoji</span>
                  <button type="button" onClick={() => setShowEmojiPicker(false)} className="w-5 h-5 flex items-center justify-center rounded-full bg-white/10 border-none cursor-pointer text-white text-xs font-bold leading-none">✕</button>
                </div>
                <div className="max-h-[180px] overflow-y-auto w-full [&>em-emoji-picker]:w-full">
                  <EmojiPicker data={data} theme="dark" onEmojiSelect={(emoji: any) => { setInput(prev => prev + emoji.native); }} previewPosition="none" skinTonePosition="none" perLine={7} />
                </div>
              </div>
            )}

            <div className="flex items-center w-full gap-0.5 pl-7 sm:pl-0">
              <button type="button" onClick={() => triggerUpload("image")} disabled={uploading} className="bg-transparent border-none -ml-1.5 text-white/40 cursor-pointer flex items-center justify-center p-1 shrink-0">
                <Image size={16} />
              </button>

              <button
                type="button"
                onClick={() => { setShowQuickCompose(prev => !prev); setShowEmojiPicker(false); }}
                className="bg-transparent border-none cursor-pointer flex items-center justify-center p-1 shrink-0"
                style={{
                  color: showQuickCompose ? "#e91e8c" : "rgba(255,255,255,0.4)",
                  fontSize: 18,
                  fontWeight: 300,
                  lineHeight: 1,
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: showQuickCompose ? "rgba(233,30,140,0.12)" : "transparent",
                  border: showQuickCompose ? "1px solid rgba(233,30,140,0.3)" : "1px solid transparent",
                  transition: "all 0.15s",
                }}
              >
                {showQuickCompose ? "✕" : "🎭"}
              </button>

              <button
                type="button"
                onClick={() => { setShowEmojiPicker(prev => !prev); setShowQuickCompose(false); }}
                className="bg-transparent border-none cursor-pointer -ml-0.5 flex items-center justify-center p-1 shrink-0 text-[16px] leading-none"
                style={{ color: showEmojiPicker ? "#e91e8c" : "rgba(255,255,255,0.4)" }}
              >
                😊
              </button>

              <div className="flex-1 relative min-w-0">
                {mention.showMentionPopup && (
                  <MentionPopup
                    mentionUsers={mention.mentionUsers}
                    mentionIndex={mention.mentionIndex}
                    setMentionIndex={mention.setMentionIndex}
                    onSelect={(u) => mention.insertMention(u, input, setInput, mainInputRef)}
                  />
                )}
                {input === "" && !uploading && postCooldown === 0 && (
                  <div className="absolute left-2.5 top-0 bottom-0 flex items-center pointer-events-none">
                    <span className="text-xs font-medium truncate" style={{ color: MODE_COLOR["post"] || "var(--text-secondary)" }}>{PLACEHOLDER["post"]}</span>
                  </div>
                )}
                <input
                  ref={mainInputRef}
                  type="text"
                  disabled={uploading || postCooldown > 0}
                  value={input}
                  onChange={e => {
                    const value = e.target.value;
                    setInput(value);
                    mention.handleMentionInputChange(value, e.target.selectionStart || value.length);
                  }}
                  onKeyDown={e => {
                    if (mention.handleMentionKeyDown(e, input, setInput, mainInputRef)) return;
                    if (e.key === "Enter") {
                      e.preventDefault();
                      send();
                    }
                  }}
                  placeholder={postCooldown > 0 ? `Wait ${postCooldown}s before posting …` : ""}
                  className="w-full h-8 rounded-[16px] bg-[var(--bg-secondary)] border border-[var(--border)] pl-2.5 pr-2.5 text-white text-xs outline-none"
                  style={{ opacity: postCooldown > 0 ? 0.5 : 1 }}
                />
              </div>

              <motion.button
                whileTap={{ scale: 0.96 }} onClick={send} disabled={uploading || isSending || postCooldown > 0}
                className="w-6 h-6 rounded-full border-none -mr-1.5 text-white text-base font-bold flex items-center justify-center cursor-pointer shrink-0 bg-gradient-to-br from-[#e91e8c] to-[#ff6b35]"
                style={{ opacity: uploading ? 0.5 : 1 }}
              >
                ↑
              </motion.button>
            </div>
          </>
        )}
      </div>

      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

      <VotersDialog
        postId={votersMsgId ?? ""}
        isOpen={votersMsgId !== null}
        onClose={() => setVotersMsgId(null)}
        roomId={roomId}
        mode={votersMode}
      />

      <ReactionsDialog postId={reactionsMsgId ?? ""} isOpen={reactionsMsgId !== null} onClose={() => setReactionsMsgId(null)} onFanProfile={onFanProfile} roomId={roomId} />
      <ActiveFansDialog
        roomId={roomId}
        isOpen={activeFansOpen}
        onClose={() => setActiveFansOpen(false)}
        onFanProfile={onFanProfile}
        prefetchedFans={activeFans}
        prefetchedCount={liveCount}
      />

      <DollyPanel
        isOpen={dollyOpen}
        onOpen={() => { setDollyOpen(true); loadDollyHistory(); }}
        onClose={() => setDollyOpen(false)}
        activeRoomId={dollyActiveRoomId}
        activeRoomName={dollyActiveRoomName}
        question={dollyQuestion}
        setQuestion={setDollyQuestion}
        asking={dollyAsking}
        onAsk={askDolly}
        replies={dollyReplies}
        loadingReplies={dollyRepliesLoading}
        history={dollyHistory}
        loadingHistory={dollyHistoryLoading}
        onSelectHistorySession={handleSelectDollySession}
        onNewChat={handleNewDollyChat}
        constrainedToParent={!!watchAlongRoomId}
      />

      <AnimatePresence>
        {notifToast && (
          <motion.div initial={{ opacity: 0, y: -60, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -40, scale: 0.95 }} transition={{ duration: 0.22, ease: "easeOut" }} onClick={() => setNotifToast(null)}
            style={{ position: "fixed", top: 14, left: 14, right: 14, zIndex: 100, display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 18, background: notifToast.type === "comment" ? "rgba(147,51,234,0.92)" : "rgba(233,30,140,0.92)", backdropFilter: "blur(12px)", border: `1px solid ${notifToast.type === "comment" ? "rgba(147,51,234,0.5)" : "rgba(233,30,140,0.5)"}`, boxShadow: `0 8px 32px ${notifToast.type === "comment" ? "rgba(147,51,234,0.35)" : "rgba(233,30,140,0.35)"}`, cursor: "pointer", wordBreak: "break-word" }}
          >
            <span style={{ fontSize: 10, flexShrink: 0 }}>{notifToast.type === "comment" ? "💬" : "❤️"}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#fff", wordBreak: "break-word" }}>{notifToast.message}</span>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", flexShrink: 0, marginLeft: 3 }}>tap to dismiss</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {joinToast && (
          <motion.div
            key={joinToast.username + Date.now()}
            initial={{ opacity: 0, y: -30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed top-3.5 left-0 right-0 mx-auto w-fit max-w-[88vw] sm:max-w-[340px] z-[100] flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/90 backdrop-blur-md border border-emerald-500/50 shadow-[0_8px_24px_rgba(34,197,94,0.3)]"
          >
            <span className="text-[11px] shrink-0">👋</span>
            <span className="text-[11px] font-bold text-white whitespace-nowrap overflow-hidden text-ellipsis">
              {joinToast.username} has joined
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}