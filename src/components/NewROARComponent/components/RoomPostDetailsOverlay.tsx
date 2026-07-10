

// /**
//  * RoomPostDetailsOverlay — DiscussionRoom variant.
//  * Uses position:absolute; inset:0 to fill the roar-inner container exactly.
//  */
// import { useState, useEffect, useCallback, useRef } from "react";
// import { AnimatePresence } from "framer-motion";
// import axios from "axios";
// import AvatarWithBadge from "./AvatarWithBadge";
// import { SplitBar } from "./shared";
// import { clamp, formatTimeAgo } from "../utils";
// import { ChevronLeft, Trash2, X, User, Loader2, Heart } from "lucide-react";

// interface Props {
//     post: any;
//     onClose: (replyCount?: number) => void;
//     onToast: (m: string) => void;
//     onVote: (id: string, vote: "agree" | "disagree" | null) => void;
//     onDeletePost?: (id: string, roomId?: string) => void;
//     currentUsername?: string;
//     currentUserId?: string;
//     currentAvatarUrl?: string;
//     onFanProfileClick?: (fan: any) => void;
// }

// interface MentionUser {
//     userId: string;
//     username: string;
//     firstName?: string;
//     lastName?: string;
//     name?: string;
//     avatarUrl?: string;
//     email?: string;
// }

// export default function RoomPostDetailsOverlay({
//     post,
//     onClose,
//     onToast,
//     onVote,
//     onDeletePost,
//     currentUsername,
//     currentUserId,
//     currentAvatarUrl,
//     onFanProfileClick,
// }: Props) {
//     const [comments, setComments] = useState<any[]>([]);
//     const [commentText, setCommentText] = useState("");
//     const [replyTo, setReplyTo] = useState<{ commentId: string; authorUsername: string } | null>(null);
//     const [loading, setLoading] = useState(false);
//     const [userUsername, setUserUsername] = useState("RoarUser");
//     const activeUsername = currentUsername || userUsername;
//     const [userBadge, setUserBadge] = useState("RISING_FAN");
//     const [userAvatarUrl, setUserAvatarUrl] = useState<string | undefined>(currentAvatarUrl);
//     const [votes, setVotes] = useState<Record<string, boolean | null>>(() =>
//         post.userVote ? { [post.id]: post.userVote === "agree" } : {},
//     );
//     const [pct, setPct] = useState(post.agreePercent ?? 50);
//     const [resolvingPrediction, setResolvingPrediction] = useState(false);
//     const [localResolution, setLocalResolution] = useState<{ resolvedAt: number; closedAt: number; correctVote: string } | null>(null);
//     const inputRef = useRef<HTMLInputElement>(null);
//     const scrollRef = useRef<HTMLDivElement>(null);

//     const [mentionUsers, setMentionUsers] = useState<MentionUser[]>([]);
//     const [showMentionPopup, setShowMentionPopup] = useState(false);
//     const [mentionIndex, setMentionIndex] = useState(0);
//     const [cursorPosition, setCursorPosition] = useState(0);
//     const [allUsers, setAllUsers] = useState<MentionUser[]>([]);

//     const hasUnderscore = (u: any) => {
//         const n = u.username || u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim();
//         return n.includes("_") || (u.email || "").split("@")[0].includes("_");
//     };

//     useEffect(() => {
//         axios.get("/api/users", { withCredentials: true }).then(res => {
//             if (!res.data?.users) return;
//             const seen = new Set<string>();
//             setAllUsers(res.data.users
//                 .filter((u: any) => {
//                     const n = u.username || u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim();
//                     return n !== activeUsername && !hasUnderscore(u);
//                 })
//                 .map((u: any) => ({
//                     userId: u.userId || u.id,
//                     username: u.username,
//                     firstName: u.firstName,
//                     lastName: u.lastName,
//                     name: u.name,
//                     avatarUrl: u.avatarUrl || u.avatar,
//                     email: u.email,
//                 }))
//                 .filter((u: MentionUser) => {
//                     const key = u.userId || u.username;
//                     if (!key || seen.has(key)) return false;
//                     const dn = u.username || u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim();
//                     if (dn.includes("_")) return false;
//                     seen.add(key); return true;
//                 }));
//         }).catch(() => {});
//     }, [activeUsername]);

//     useEffect(() => {
//         try {
//             setUserUsername(localStorage.getItem("roar_username") || "RoarUser");
//             setUserBadge(localStorage.getItem("roar_badge") || "RISING_FAN");
//             setUserAvatarUrl(currentAvatarUrl || localStorage.getItem("roar_avatar_url") || undefined);
//         } catch {}
//     }, [currentAvatarUrl]);

//     const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const value = e.target.value;
//         const cur = e.target.selectionStart || 0;
//         setCommentText(value);
//         setCursorPosition(cur);
//         const before = value.slice(0, cur);
//         const at = before.lastIndexOf("@");
//         if (at !== -1) {
//             const afterAt = before.slice(at + 1);
//             if (!afterAt.includes(" ")) {
//                 const filtered = afterAt.trim() === ""
//                     ? allUsers.slice(0, 8)
//                     : allUsers.filter(u =>
//                         `${u.username || ""} ${u.firstName || ""} ${u.lastName || ""} ${u.email || ""}`
//                             .toLowerCase().includes(afterAt.toLowerCase())
//                     ).slice(0, 8);
//                 setMentionUsers(filtered);
//                 setShowMentionPopup(filtered.length > 0);
//                 setMentionIndex(0);
//                 return;
//             }
//         }
//         setShowMentionPopup(false);
//         setMentionUsers([]);
//     };

//     const insertMention = (user: MentionUser) => {
//         const dn = user.username || user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email?.split("@")[0] || "user";
//         const mt = `@${dn} `;
//         const before = commentText.slice(0, cursorPosition);
//         const at = before.lastIndexOf("@");
//         setCommentText(`${commentText.slice(0, at)}${mt}${commentText.slice(cursorPosition)}`);
//         setShowMentionPopup(false);
//         setMentionUsers([]);
//         setTimeout(() => {
//             if (inputRef.current) {
//                 const p = at + mt.length;
//                 inputRef.current.focus();
//                 inputRef.current.setSelectionRange(p, p);
//             }
//         }, 10);
//     };

//     const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//         if (showMentionPopup && mentionUsers.length > 0) {
//             if (e.key === "ArrowDown") { e.preventDefault(); setMentionIndex(p => (p + 1) % mentionUsers.length); }
//             else if (e.key === "ArrowUp") { e.preventDefault(); setMentionIndex(p => (p - 1 + mentionUsers.length) % mentionUsers.length); }
//             else if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); if (mentionUsers[mentionIndex]) insertMention(mentionUsers[mentionIndex]); }
//             else if (e.key === "Escape") { setShowMentionPopup(false); setMentionUsers([]); }
//         } else if (e.key === "Enter" && !e.shiftKey) {
//             e.preventDefault();
//             submitComment();
//         }
//     };

//     const fetchComments = useCallback(async () => {
//         if (!post?.id) return;
//         try {
//             const res = await axios.get(`/api/roar/rooms/${post.roomId}/messages/${post.id}/comments`);
//             if (res.data?.success) setComments(res.data.comments);
//         } catch {}
//     }, [post]);

//     const buildCommentTree = (flatComments: any[]) => {
//         const nodes = flatComments.map((comment) => ({
//             ...comment,
//             commentId: comment.commentId || comment.id,
//             parentCommentId: comment.parentCommentId || comment.parentId || comment.replyToId || null,
//             replies: [],
//         }));

//         const map = new Map<string, any>();
//         nodes.forEach((comment) => map.set(comment.commentId, comment));

//         const roots: any[] = [];
//         nodes.forEach((comment) => {
//             if (!comment.parentCommentId) {
//                 const mentionMatch = comment.text?.trim()?.match(/^@([\w\.\-_]+)/i);
//                 if (mentionMatch?.[1]) {
//                     const mentionUsername = mentionMatch[1].toLowerCase();
//                     const parentCandidate = nodes.find((candidate) =>
//                         candidate.commentId !== comment.commentId &&
//                         candidate.authorUsername?.toLowerCase() === mentionUsername &&
//                         candidate.createdAt <= comment.createdAt
//                     );
//                     if (parentCandidate) {
//                         comment.parentCommentId = parentCandidate.commentId;
//                     }
//                 }
//             }
//             const parentId = comment.parentCommentId;
//             if (parentId && map.has(parentId)) {
//                 map.get(parentId).replies.push(comment);
//             } else {
//                 roots.push(comment);
//             }
//         });

//         return roots;
//     };

//     const renderComment = (comment: any, depth = 0) => {
//         const hasReplies = comment.replies && comment.replies.length > 0;
//         const commentId = comment.commentId || comment.id;
//         const isReply = depth > 0;
//         const heartCount = comment.heartCount ?? 0;

//         return (
//             <div key={commentId}>
//                 {/* indent replies with a faint left line */}
//                 <div className={isReply ? "ml-10 pl-3 border-l border-white/[0.07]" : ""}>
//                     <div className="flex gap-3 items-start">
//                         {/* Avatar */}
//                         <div
//                             className="shrink-0"
//                             style={{ cursor: onFanProfileClick ? "pointer" : "default" }}
//                             onClick={(e) => {
//                                 if (onFanProfileClick) {
//                                     e.stopPropagation();
//                                     onFanProfileClick({
//                                         username: comment.authorUsername,
//                                         badge: comment.authorBadge,
//                                         avatarUrl: comment.authorAvatarUrl || comment.avatarUrl,
//                                     });
//                                 }
//                             }}
//                         >
//                             <AvatarWithBadge
//                                 username={comment.authorUsername}
//                                 badge={comment.authorBadge}
//                                 size="sm"
//                                 avatarUrl={
//                                     comment.authorAvatarUrl ||
//                                     comment.avatarUrl ||
//                                     (comment.authorUsername === activeUsername ? userAvatarUrl : undefined)
//                                 }
//                             />
//                         </div>

//                         {/* Body */}
//                         <div className="flex-1 min-w-0">
//                             {/* Name inline with comment text */}
//                             <p className="text-[13.5px] leading-[1.55] text-[#E8E8F0] m-0">
//                                 <span
//                                     className="font-bold text-white mr-1.5"
//                                     style={{ cursor: onFanProfileClick ? "pointer" : "default" }}
//                                     onClick={(e) => {
//                                         if (onFanProfileClick) {
//                                             e.stopPropagation();
//                                             onFanProfileClick({
//                                                 username: comment.authorUsername,
//                                                 badge: comment.authorBadge,
//                                                 avatarUrl: comment.authorAvatarUrl || comment.avatarUrl,
//                                             });
//                                         }
//                                     }}
//                                 >
//                                     {comment.authorUsername}
//                                 </span>
//                                 {comment.text}
//                             </p>

//                             {/* Meta row: time · likes · Reply · delete */}
//                             <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[#6B6B8A]">
//                                 <span>{formatTimeAgo(comment.createdAt)}</span>
//                                 {heartCount > 0 && (
//                                     <span>{heartCount} {heartCount === 1 ? "like" : "likes"}</span>
//                                 )}
//                                 <button
//                                     onClick={() => {
//                                         setReplyTo({ commentId, authorUsername: comment.authorUsername });
//                                         setCommentText("");
//                                         setTimeout(() => inputRef.current?.focus(), 50);
//                                     }}
//                                     className="bg-transparent border-none cursor-pointer text-[#6B6B8A] font-semibold p-0 hover:text-white transition-colors duration-150 text-[11px]"
//                                 >
//                                     Reply
//                                 </button>
//                                 {comment.authorUsername === activeUsername && (
//                                     <button
//                                         onClick={async (e) => {
//                                             e.stopPropagation();
//                                             if (window.confirm("Delete comment?")) {
//                                                 try {
//                                                     await axios.delete(`/api/roar/posts/${post.id}/comments/${commentId}`);
//                                                     onToast("Deleted");
//                                                     fetchComments();
//                                                 } catch {
//                                                     onToast("Failed");
//                                                 }
//                                             }
//                                         }}
//                                         className="bg-transparent border-none text-[#f87171] cursor-pointer flex items-center p-0"
//                                     >
//                                         <Trash2 size={11} />
//                                     </button>
//                                 )}
//                             </div>
//                         </div>

//                         {/* Heart button — right aligned */}
//                         <button
//                             onClick={() => reactToComment(commentId)}
//                             className="bg-transparent border-none cursor-pointer flex flex-col items-center gap-0.5 shrink-0 pt-0.5 p-0 text-[#6B6B8A] hover:text-[#f87171] transition-colors duration-150"
//                         >
//                             <Heart size={13} strokeWidth={1.5} />
//                         </button>
//                     </div>

//                     {/* Nested replies */}
//                     {hasReplies && (
//                         <div className="mt-3 space-y-3">
//                             {comment.replies.map((reply: any) => renderComment(reply, depth + 1))}
//                         </div>
//                     )}
//                 </div>
//             </div>
//         );
//     };

//     useEffect(() => { fetchComments(); }, [fetchComments]);

//     const submitComment = async () => {
//         const fullText = replyTo
//             ? `@${replyTo.authorUsername} ${commentText.trim()}`
//             : commentText.trim();
//         if (!fullText) return;
//         try {
//             setLoading(true);
//             const res = await axios.post(
//                 `/api/roar/rooms/${post.roomId}/messages/${post.id}/comments`,
//                 { text: fullText }
//             );
//             if (res.data?.success) {
//                 setCommentText("");
//                 setReplyTo(null);
//                 fetchComments();
//                 onToast("Comment posted!");
//                 setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }), 400);
//             }
//         } catch {
//             onToast("Error posting comment");
//         } finally {
//             setLoading(false);
//         }
//     };

//     const reactToComment = async (commentId: string) => {
//         try {
//             const res = await axios.post(`/api/roar/posts/${post.id}/comments/${commentId}/react`);
//             if (res.data?.success)
//                 setComments(p => p.map(c => c.commentId === commentId ? { ...c, heartCount: res.data.heartCount } : c));
//         } catch {}
//     };

//     const userVote = votes[post.id];
//     const currentUserIdCandidates = [currentUserId, post.currentUserId].filter(Boolean).map(String);
//     const isCurrentUserAuthor = () => {
//         const authorCandidates = [post.authorUid, post.fan?.authorUid, post.authorEmail].filter(Boolean).map(String);
//         return authorCandidates.some(id => currentUserIdCandidates.includes(id));
//     };
//     const getPredictionVoteValue = (optionIndex: number) =>
//         optionIndex === 0 ? "agree" : optionIndex === 1 ? "disagree" : `option_${optionIndex}`;
//     const getPredictionOptionLabel = (voteValue: string | undefined, options: string[]) => {
//         if (!voteValue) return "";
//         if (voteValue === "agree") return options[0] || "Option 1";
//         if (voteValue === "disagree") return options[1] || "Option 2";
//         const optionIndex = Number(voteValue.replace("option_", ""));
//         return Number.isFinite(optionIndex) ? (options[optionIndex] || voteValue) : voteValue;
//     };
//     const resolvePrediction = async (correctVote: string) => {
//         if (!post.roomId) return;
//         try {
//             setResolvingPrediction(true);
//             const res = await axios.post(`/api/roar/rooms/${post.roomId}/messages/${post.id}/resolve`, { correctVote });
//             if (res.data?.success) {
//                 const resolvedAt = res.data.message?.resolvedAt ?? Date.now();
//                 setLocalResolution({ resolvedAt, closedAt: res.data.message?.closedAt ?? resolvedAt, correctVote });
//                 onToast(`Prediction resolved. ${res.data.correctCount ?? 0} correct fans awarded.`);
//             } else {
//                 onToast("Failed to resolve prediction");
//             }
//         } catch (err: unknown) {
//             const message = axios.isAxiosError(err) ? err.response?.data?.error : undefined;
//             onToast(message || "Failed to resolve prediction");
//         } finally {
//             setResolvingPrediction(false);
//         }
//     };
//     const handleVoteClick = (agree: boolean) => {
//         const prev = votes[post.id];
//         let nextVote: boolean | null = agree;
//         if (prev === agree) nextVote = null;
//         setVotes(v => ({ ...v, [post.id]: nextVote }));
//         let delta = 0;
//         if (post.userVote === "agree") delta = nextVote === true ? 0 : nextVote === false ? -8 : -4;
//         else if (post.userVote === "disagree") delta = nextVote === true ? 8 : nextVote === false ? 0 : 4;
//         else delta = nextVote === true ? 4 : nextVote === false ? -4 : 0;
//         setPct(clamp(post.agreePercent + delta, 1, 99));
//         onVote(post.id, nextVote === true ? "agree" : nextVote === false ? "disagree" : null);
//     };

//     const canSubmit = commentText.trim().length > 0;

//     return (
//         <AnimatePresence>
//             <div className="absolute inset-0 z-[1000] flex flex-col overflow-hidden pointer-events-auto bg-[#050508]">
//                 {/* Header */}
//                 <div className="flex items-center gap-[14px] px-5 py-4 border-b border-[#252538] bg-[rgba(5,5,8,0.97)] backdrop-blur-[10px] shrink-0">
//                     <button
//                         onClick={() => onClose(comments.length)}
//                         className="bg-transparent border-none text-white cursor-pointer p-1 flex items-center min-w-9 min-h-9"
//                     >
//                         <ChevronLeft size={22} />
//                     </button>
//                     <div className="flex flex-col flex-1 min-w-0">
//                         <h2 className="text-[12px] font-bold text-white m-0 uppercase tracking-[0.03em]">Post</h2>
//                         <p className="text-[9px] text-[#9494AD] mt-0.5 mb-0">
//                             Posted by {post.fan?.username || post.authorUsername} • {formatTimeAgo(post.createdAt)} • {comments.length} comments
//                         </p>
//                     </div>
//                 </div>

//                 {/* Scrollable content */}
//                 <div
//                     ref={scrollRef}
//                     className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden [-webkit-overflow-scrolling:touch] px-5 pt-4 pb-4 bg-gradient-to-b from-[#050508] to-[#0b0b12]"
//                 >
//                     {/* Post card */}
//                     <div className="p-4 mb-5 bg-white/[0.03] border border-white/[0.06] rounded-[20px]">
//                         <div
//                             className="flex gap-2.5 items-center mb-3"
//                             style={{ cursor: onFanProfileClick ? "pointer" : "default" }}
//                             onClick={(e) => {
//                                 if (onFanProfileClick) {
//                                     e.stopPropagation();
//                                     onFanProfileClick(
//                                         post.fan || { username: post.authorUsername, badge: post.authorBadge, avatarUrl: post.authorAvatarUrl || post.avatarUrl }
//                                     );
//                                 }
//                             }}
//                         >
//                             <AvatarWithBadge
//                                 username={post.fan?.username || post.authorUsername}
//                                 badge={post.fan?.badge || post.authorBadge}
//                                 size="sm"
//                                 avatarUrl={
//                                     post.fan?.avatarUrl || post.authorAvatarUrl || post.avatarUrl ||
//                                     ((post.fan?.username || post.authorUsername) === activeUsername ? userAvatarUrl : undefined)
//                                 }
//                             />
//                             <div>
//                                 <p className="font-bold text-[13px] text-white m-0 flex items-center gap-1">
//                                     {post.fan?.username || post.authorUsername}
//                                     <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] inline-block" />
//                                 </p>
//                                 <p className="text-[10px] text-[#9494AD] m-0">{formatTimeAgo(post.createdAt)}</p>
//                             </div>
//                         </div>

//                         <p className="font-semibold text-[15px] leading-[1.5] mb-3 text-white">{post.text}</p>

//                         {post.type === "debate" && (post.sideA || post.sideB) && (() => {
//                             const sideA = post.sideA || "Side A";
//                             const sideB = post.sideB || "Side B";
//                             const hasVoted = post.userVote === "agree" || post.userVote === "disagree";
//                             const votedA = post.userVote === "agree";
//                             const votedB = post.userVote === "disagree";
//                             return (
//                                 <div className="mb-3">
//                                     <div style={{ display: "flex", gap: 8, alignItems: "stretch", marginBottom: 10 }}>
//                                         {[
//                                             { label: sideA, voted: votedA, color: "#E91E8C", bg: "rgba(233,30,140,0.08)", border: "rgba(233,30,140,0.3)", vote: "agree" as const },
//                                             { label: sideB, voted: votedB, color: "#60a5fa", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.3)", vote: "disagree" as const },
//                                         ].map(({ label, voted, color, bg, border, vote }, idx) => (
//                                             <>
//                                                 {idx === 1 && (
//                                                     <div key="vs" style={{ display: "flex", alignItems: "center", padding: "0 4px" }}>
//                                                         <span className="font-display" style={{ fontSize: 16, color: "#4A4A62" }}>VS</span>
//                                                     </div>
//                                                 )}
//                                                 <button
//                                                     key={vote}
//                                                     disabled={hasVoted}
//                                                     onClick={async (e) => {
//                                                         e.stopPropagation();
//                                                         if (hasVoted) return;
//                                                         try {
//                                                             await axios.post(`/api/roar/rooms/${post.roomId}/messages/${post.id}/vote`, { vote });
//                                                             onVote(post.id, vote);
//                                                         } catch { onToast("Failed to submit vote"); }
//                                                     }}
//                                                     style={{
//                                                         flex: 1, padding: "12px", borderRadius: 14, textAlign: "center",
//                                                         background: voted ? color : bg,
//                                                         border: `2px solid ${voted ? color : border}`,
//                                                         color: voted ? "white" : "var(--text-primary)",
//                                                         cursor: hasVoted ? "not-allowed" : "pointer",
//                                                         transition: "all 0.2s",
//                                                         opacity: hasVoted && !voted ? 0.35 : 1,
//                                                     }}
//                                                 >
//                                                     <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>
//                                                         {voted ? "✓ " : ""}{label}
//                                                     </p>
//                                                 </button>
//                                             </>
//                                         ))}
//                                     </div>
//                                     <p style={{
//                                         fontSize: 11, marginBottom: 0,
//                                         fontWeight: hasVoted ? 600 : 400,
//                                         color: hasVoted ? "#E91E8C" : "#4A4A62",
//                                         fontStyle: hasVoted ? "normal" : "italic",
//                                     }}>
//                                         {hasVoted ? "🗳️ You've already voted!" : "Tap a side to vote"}
//                                     </p>
//                                 </div>
//                             );
//                         })()}

//                         {post.mediaUrls?.length > 0 && (
//                             <div className="flex flex-col gap-2 mb-3">
//                                 {post.mediaUrls.map((url: string, idx: number) =>
//                                     url.endsWith(".mp4") || url.includes("/video/upload/")
//                                         ? <video key={idx} src={url} controls className="w-full max-h-[300px] rounded-xl object-cover" />
//                                         : <img key={idx} src={url} alt="" className="w-full max-h-[300px] rounded-xl object-cover" />
//                                 )}
//                             </div>
//                         )}

//                         {post.type === "prediction" && (() => {
//                             const predictionOptions = Array.isArray(post.predictionOptions) && post.predictionOptions.length >= 2
//                                 ? post.predictionOptions
//                                 : [post.sideA || "Option 1", post.sideB || "Option 2"];
//                             const resolvedAt = localResolution?.resolvedAt ?? post.resolvedAt;
//                             const closedAt = localResolution?.closedAt ?? post.closedAt;
//                             const correctVote = localResolution?.correctVote ?? post.correctVote;
//                             const predictionClosed = Boolean(resolvedAt || closedAt || (post.closesAt && post.closesAt <= Date.now()));
//                             const correctVoteLabel = getPredictionOptionLabel(correctVote, predictionOptions);
//                             return (
//                                 <div className="mb-3">
//                                     {predictionClosed && !resolvedAt && isCurrentUserAuthor() && (
//                                         <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
//                                             {predictionOptions.map((label: string, optionIndex: number) => (
//                                                 <button
//                                                     key={`resolve-${label}-${optionIndex}`}
//                                                     type="button"
//                                                     disabled={resolvingPrediction}
//                                                     onClick={(e) => { e.stopPropagation(); resolvePrediction(getPredictionVoteValue(optionIndex)); }}
//                                                     style={{
//                                                         flex: "1 1 calc(50% - 4px)", minWidth: 0,
//                                                         padding: "9px 10px", borderRadius: 12,
//                                                         border: "1px solid rgba(34,197,94,0.35)",
//                                                         background: "rgba(34,197,94,0.1)", color: "#22c55e",
//                                                         fontSize: 12, fontWeight: 800,
//                                                         cursor: resolvingPrediction ? "wait" : "pointer",
//                                                     }}
//                                                 >
//                                                     Resolve: {label}
//                                                 </button>
//                                             ))}
//                                         </div>
//                                     )}
//                                     {resolvedAt && correctVoteLabel && (
//                                         <p style={{ fontSize: 11, color: "#22c55e", fontWeight: 800, marginBottom: 8 }}>
//                                             Correct answer: {correctVoteLabel}
//                                         </p>
//                                     )}
//                                 </div>
//                             );
//                         })()}

//                         {post.type === "hot_take" && (
//                             <>
//                                 <div className="mb-2.5"><SplitBar left={pct} /></div>
//                                 <div className="flex gap-2 mt-3">
//                                     {[
//                                         { agree: true, label: "Agree", active: userVote === true, color: "#E91E8C" },
//                                         { agree: false, label: "Disagree", active: userVote === false, color: "#FF6B35" },
//                                     ].map(({ agree, label, active, color }) => (
//                                         <button
//                                             key={label}
//                                             onClick={() => handleVoteClick(agree)}
//                                             className="flex-1 py-3 rounded-full text-[13px] font-bold cursor-pointer transition-all duration-[220ms] border-[2.5px]"
//                                             style={{ borderColor: color, background: active ? color : "rgba(255,255,255,0.02)", color: active ? "white" : color }}
//                                         >
//                                             {active ? `✓ ${label}d` : label}
//                                         </button>
//                                     ))}
//                                 </div>
//                             </>
//                         )}

//                         <div className="flex items-center mt-4 border-t border-white/[0.06] pt-3">
//                             {(post.fan?.username === activeUsername || post.authorUsername === activeUsername) && (
//                                 <button
//                                     onClick={(e) => {
//                                         e.stopPropagation();
//                                         if (window.confirm("Delete this post?")) {
//                                             onDeletePost?.(post.id, post.roomId);
//                                             onClose();
//                                         }
//                                     }}
//                                     className="flex items-center justify-center bg-transparent border-none cursor-pointer text-[#f87171] ml-auto p-1 rounded-full"
//                                 >
//                                     <Trash2 size={16} />
//                                 </button>
//                             )}
//                         </div>
//                     </div>

//                     {/* Comments header */}
//                     <div className="flex justify-between items-center mb-4">
//                         <span className="text-[11px] font-extrabold text-white tracking-[0.06em] uppercase">Comments</span>
//                         <span className="text-[10px] text-[#9494AD]">{comments.length} total</span>
//                     </div>

//                     {/* Comments list — Instagram-style threading */}
//                     <div className="flex flex-col gap-5 pb-2">
//                         {comments.length === 0 ? (
//                             <p className="text-[13px] text-[#4A4A62] text-center py-5">No comments yet. Be the first!</p>
//                         ) : (
//                             buildCommentTree(comments).map((comment) => renderComment(comment))
//                         )}
//                     </div>
//                 </div>

//                 {/* Composer */}
//                 <div className="shrink-0 bg-[rgba(5,5,8,0.97)] border-t border-[#252538] relative z-10 pb-2">
//                     {replyTo && (
//                         <div className="flex items-center gap-1.5 px-4 pt-1.5">
//                             <span className="text-[11px] text-[#9494AD]">Replying to</span>
//                             <span className="inline-flex items-center gap-1 bg-[rgba(233,30,140,0.15)] border border-[rgba(233,30,140,0.35)] rounded-full py-0.5 pl-1.5 pr-2 text-[12px] font-bold text-[#E91E8C] max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap">
//                                 @{replyTo.authorUsername}
//                                 <button
//                                     onClick={() => { setReplyTo(null); setCommentText(""); }}
//                                     className="bg-transparent border-none p-0 cursor-pointer text-[#E91E8C] flex items-center ml-0.5 shrink-0"
//                                 >
//                                     <X size={11} />
//                                 </button>
//                             </span>
//                         </div>
//                     )}

//                     {showMentionPopup && mentionUsers.length > 0 && (
//                         <div className="absolute bottom-full left-4 right-4 mb-2 bg-[#181c24] rounded-2xl border border-[rgba(200,112,90,0.2)] overflow-hidden z-20 shadow-[0_8px_32px_rgba(0,0,0,0.4)] max-h-[300px] overflow-y-auto">
//                             {mentionUsers.map((user, idx) => {
//                                 const dn = user.username || user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email?.split("@")[0] || "user";
//                                 return (
//                                     <button
//                                         key={user.userId}
//                                         onClick={() => insertMention(user)}
//                                         onMouseEnter={() => setMentionIndex(idx)}
//                                         className={`flex items-center gap-3 px-4 py-2.5 w-full border-none cursor-pointer transition-colors duration-150 ${idx === mentionIndex ? "bg-[rgba(200,112,90,0.15)]" : "bg-transparent"}`}
//                                     >
//                                         <AvatarWithBadge username={dn} badge="RISING_FAN" size="sm" avatarUrl={user.avatarUrl} />
//                                         <div className="flex-1 text-left">
//                                             <p className="font-semibold text-[13px] text-white m-0">{dn}</p>
//                                             {user.email && <p className="text-[10px] text-[#7a6a65] m-0">{user.email}</p>}
//                                         </div>
//                                         <User size={14} className="text-[#c8705a]" />
//                                     </button>
//                                 );
//                             })}
//                         </div>
//                     )}

//                     <p className="px-5 pt-2 pb-0 m-0 text-[10px] text-[#7a6a65]">Type @ to mention someone</p>
//                     <div className="flex gap-2 items-center px-4 pt-1.5 pb-1">
//                         <AvatarWithBadge username={userUsername} badge={userBadge} size="sm" avatarUrl={userAvatarUrl} />
//                         <div className="flex-1">
//                             <input
//                                 ref={inputRef}
//                                 type="text"
//                                 placeholder={replyTo ? "Write your reply…" : "Share your opinion..."}
//                                 value={commentText}
//                                 onChange={handleInputChange}
//                                 onKeyDown={handleKeyDown}
//                                 className="w-full h-11 rounded-full bg-white/[0.04] border border-white/[0.12] pl-4 pr-4 text-white text-[16px] outline-none placeholder:text-[#8A8AA9] transition-colors duration-150 focus:border-[#E91E8C]/60 focus:bg-white/[0.08]"
//                             />
//                         </div>
//                         <button
//                             onClick={submitComment}
//                             disabled={loading || !canSubmit}
//                             className={`w-[38px] h-[38px] rounded-full bg-[#E91E8C] border-none text-white flex items-center justify-center shrink-0 transition-opacity duration-200 ${canSubmit ? "cursor-pointer opacity-100" : "cursor-default opacity-50"}`}
//                         >
//                             {loading ? <Loader2 size={16} className="animate-spin" /> : "↑"}
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </AnimatePresence>
//     );
// }




// /**
//  * RoomPostDetailsOverlay — DiscussionRoom variant.
//  * Uses position:absolute; inset:0 to fill the roar-inner container exactly.
//  */
// import { useState, useEffect, useCallback, useRef } from "react";
// import { AnimatePresence } from "framer-motion";
// import { usePostHog } from "posthog-js/react";
// import axios from "axios";
// import AvatarWithBadge from "./AvatarWithBadge";
// import { SplitBar } from "./shared";
// import { clamp, formatTimeAgo } from "../utils";
// import { ChevronLeft, Trash2, X, User, Loader2, Heart } from "lucide-react";
// import ReactionPicker, { type Reaction } from "./ReactionPicker";
// import ReactionsDialog from "./ReactionsDialog";

// interface Props {
//     post: any;
//     onClose: (replyCount?: number) => void;
//     onToast: (m: string) => void;
//     onVote: (id: string, vote: "agree" | "disagree" | null) => void;
//     onDeletePost?: (id: string, roomId?: string) => void;
//     currentUsername?: string;
//     currentUserId?: string;
//     currentAvatarUrl?: string;
//     onFanProfileClick?: (fan: any) => void;
//     roomName?: string;
// }

// interface MentionUser {
//     userId: string;
//     username: string;
//     firstName?: string;
//     lastName?: string;
//     name?: string;
//     avatarUrl?: string;
//     email?: string;
// }

// // ---------------------------------------------------------------------------
// // Threading helpers (mirrors DiscussionRoom.tsx logic)
// // ---------------------------------------------------------------------------

// /**
//  * Returns true if a @mention token plausibly refers to the given authorUsername.
//  * Handles:
//  *   @Prince    → "Prince Chandu"   (first word of display name)
//  *   @Chandu    → "chandu_srikakulam" (first segment before underscore)
//  *   @username  → exact username match (case-insensitive)
//  */
// function mentionMatchesAuthor(mentionToken: string, authorUsername: string): boolean {
//     const m = mentionToken.toLowerCase();
//     const u = (authorUsername || "").toLowerCase();

//     // exact username
//     if (m === u) return true;

//     // first word of a space-separated display name  (e.g. "Prince Chandu" → "prince")
//     const firstWord = u.split(" ")[0];
//     if (m === firstWord) return true;

//     // first segment before underscore (e.g. "chandu_srikakulam" → "chandu")
//     const firstSegment = u.split("_")[0];
//     if (firstSegment && m === firstSegment) return true;

//     return false;
// }

// /**
//  * Takes a flat array of comments (oldest → newest) and returns a new array
//  * where each @mention reply is inserted directly below the last comment by
//  * the mentioned author, creating a threaded appearance without true nesting.
//  */
// function threadSort(flat: any[]): any[] {
//     // Work oldest→newest so insertion positions stay stable
//     const sorted = [...flat].sort((a, b) => a.createdAt - b.createdAt);
//     const result: any[] = [];

//     for (const comment of sorted) {
//         const mentionMatch = comment.text?.trim().match(/^@([\w.\-]+)/i);
//         if (mentionMatch) {
//             const token = mentionMatch[1];
//             // Find the last index in `result` whose author matches the mention
//             let insertAfter = -1;
//             for (let i = result.length - 1; i >= 0; i--) {
//                 if (mentionMatchesAuthor(token, result[i].authorUsername)) {
//                     insertAfter = i;
//                     break;
//                 }
//             }
//             if (insertAfter !== -1) {
//                 result.splice(insertAfter + 1, 0, comment);
//                 continue;
//             }
//         }
//         result.push(comment);
//     }

//     return result;
// }

// export default function RoomPostDetailsOverlay({
//     post,
//     onClose,
//     onToast,
//     onVote,
//     onDeletePost,
//     currentUsername,
//     currentUserId,
//     currentAvatarUrl,
//     onFanProfileClick,
//     roomName,
// }: Props) {
//     const phog = usePostHog();
//     const [comments, setComments] = useState<any[]>([]);
//     const [commentText, setCommentText] = useState("");
//     const [replyTo, setReplyTo] = useState<{ commentId: string; authorUsername: string } | null>(null);
//     const [loading, setLoading] = useState(false);
//     const [userUsername, setUserUsername] = useState("RoarUser");
//     const activeUsername = currentUsername || userUsername;
//     const [userBadge, setUserBadge] = useState("RISING_FAN");
//     const [userAvatarUrl, setUserAvatarUrl] = useState<string | undefined>(currentAvatarUrl);
//     const [votes, setVotes] = useState<Record<string, boolean | null>>(() =>
//         post.userVote ? { [post.id]: post.userVote === "agree" } : {},
//     );
//     const [pct, setPct] = useState(post.agreePercent ?? 50);
//     const [resolvingPrediction, setResolvingPrediction] = useState(false);
//     const [localResolution, setLocalResolution] = useState<{ resolvedAt: number; closedAt: number; correctVote: string } | null>(null);
//     const inputRef = useRef<HTMLInputElement>(null);
//     const scrollRef = useRef<HTMLDivElement>(null);

//     const [mentionUsers, setMentionUsers] = useState<MentionUser[]>([]);
//     const [showMentionPopup, setShowMentionPopup] = useState(false);
//     const [mentionIndex, setMentionIndex] = useState(0);
//     const [cursorPosition, setCursorPosition] = useState(0);
//     const [allUsers, setAllUsers] = useState<MentionUser[]>([]);

//     const [commentReactions, setCommentReactions] = useState<Record<string, { reaction: Reaction | null; heartCount: number }>>({});
//     const [reactionsDialogCommentId, setReactionsDialogCommentId] = useState<string | null>(null);
//     const pendingCommentReactRef = useRef<Record<string, boolean>>({});

//     const hasUnderscore = (u: any) => {
//         const n = u.username || u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim();
//         return n.includes("_") || (u.email || "").split("@")[0].includes("_");
//     };

//     useEffect(() => {
//         axios.get("/api/users", { withCredentials: true }).then(res => {
//             if (!res.data?.users) return;
//             const seen = new Set<string>();
//             setAllUsers(res.data.users
//                 .filter((u: any) => {
//                     const n = u.username || u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim();
//                     return n !== activeUsername && !hasUnderscore(u);
//                 })
//                 .map((u: any) => ({
//                     userId: u.userId || u.id,
//                     username: u.username,
//                     firstName: u.firstName,
//                     lastName: u.lastName,
//                     name: u.name,
//                     avatarUrl: u.avatarUrl || u.avatar,
//                     email: u.email,
//                 }))
//                 .filter((u: MentionUser) => {
//                     const key = u.userId || u.username;
//                     if (!key || seen.has(key)) return false;
//                     const dn = u.username || u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim();
//                     if (dn.includes("_")) return false;
//                     seen.add(key); return true;
//                 }));
//         }).catch(() => { });
//     }, [activeUsername]);

//     useEffect(() => {
//         try {
//             setUserUsername(localStorage.getItem("roar_username") || "RoarUser");
//             setUserBadge(localStorage.getItem("roar_badge") || "RISING_FAN");
//             setUserAvatarUrl(currentAvatarUrl || localStorage.getItem("roar_avatar_url") || undefined);
//         } catch { }
//     }, [currentAvatarUrl]);

//     const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const value = e.target.value;
//         const cur = e.target.selectionStart || 0;
//         setCommentText(value);
//         setCursorPosition(cur);
//         const before = value.slice(0, cur);
//         const at = before.lastIndexOf("@");
//         if (at !== -1) {
//             const afterAt = before.slice(at + 1);
//             if (!afterAt.includes(" ")) {
//                 const filtered = afterAt.trim() === ""
//                     ? allUsers.slice(0, 8)
//                     : allUsers.filter(u =>
//                         `${u.username || ""} ${u.firstName || ""} ${u.lastName || ""} ${u.email || ""}`
//                             .toLowerCase().includes(afterAt.toLowerCase())
//                     ).slice(0, 8);
//                 setMentionUsers(filtered);
//                 setShowMentionPopup(filtered.length > 0);
//                 setMentionIndex(0);
//                 return;
//             }
//         }
//         setShowMentionPopup(false);
//         setMentionUsers([]);
//     };

//     const insertMention = (user: MentionUser) => {
//         const dn = user.username || user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email?.split("@")[0] || "user";
//         const mt = `@${dn} `;
//         const before = commentText.slice(0, cursorPosition);
//         const at = before.lastIndexOf("@");
//         setCommentText(`${commentText.slice(0, at)}${mt}${commentText.slice(cursorPosition)}`);
//         setShowMentionPopup(false);
//         setMentionUsers([]);
//         setTimeout(() => {
//             if (inputRef.current) {
//                 const p = at + mt.length;
//                 inputRef.current.focus();
//                 inputRef.current.setSelectionRange(p, p);
//             }
//         }, 10);
//     };

//     const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//         if (showMentionPopup && mentionUsers.length > 0) {
//             if (e.key === "ArrowDown") { e.preventDefault(); setMentionIndex(p => (p + 1) % mentionUsers.length); }
//             else if (e.key === "ArrowUp") { e.preventDefault(); setMentionIndex(p => (p - 1 + mentionUsers.length) % mentionUsers.length); }
//             else if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); if (mentionUsers[mentionIndex]) insertMention(mentionUsers[mentionIndex]); }
//             else if (e.key === "Escape") { setShowMentionPopup(false); setMentionUsers([]); }
//         } else if (e.key === "Enter" && !e.shiftKey) {
//             e.preventDefault();
//             submitComment();
//         }
//     };

//     const fetchComments = useCallback(async () => {
//         if (!post?.id) return;
//         try {
//             const res = await axios.get(`/api/roar/rooms/${post.roomId}/messages/${post.id}/comments`);
//             if (res.data?.success) setComments(res.data.comments);
//         } catch { }
//     }, [post]);

//     // ---------------------------------------------------------------------------
//     // Render a single comment row (flat list — threading is done by threadSort)
//     // ---------------------------------------------------------------------------
//     const renderComment = (comment: any) => {
//         const commentId = comment.commentId || comment.id;
//         const heartCount = comment.heartCount ?? 0;

//         // Detect if this comment is a reply (@mention at the start) to give
//         // it a subtle left-indent, matching the DiscussionRoom inline style.
//         const isReply = Boolean(comment.text?.trim().match(/^@[\w.\-]+/i));

//         return (
//             <div key={commentId} className={isReply ? "ml-10 pl-3 border-l border-white/[0.07]" : ""}>
//                 <div className="flex gap-3 items-start">
//                     {/* Avatar */}
//                     <div
//                         className="shrink-0"
//                         style={{ cursor: onFanProfileClick ? "pointer" : "default" }}
//                         onClick={(e) => {
//                             if (onFanProfileClick) {
//                                 e.stopPropagation();
//                                 onFanProfileClick({
//                                     username: comment.authorUsername,
//                                     badge: comment.authorBadge,
//                                     avatarUrl: comment.authorAvatarUrl || comment.avatarUrl,
//                                 });
//                             }
//                         }}
//                     >
//                         <AvatarWithBadge
//                             username={comment.authorUsername}
//                             badge={comment.authorBadge}
//                             size="sm"
//                             avatarUrl={
//                                 comment.authorAvatarUrl ||
//                                 comment.avatarUrl ||
//                                 (comment.authorUsername === activeUsername ? userAvatarUrl : undefined)
//                             }
//                         />
//                     </div>

//                     {/* Body */}
//                     <div className="flex-1 min-w-0 overflow-hidden">
//                         <span
//                             className="font-bold text-white text-[13px] block truncate"
//                             style={{ cursor: onFanProfileClick ? "pointer" : "default" }}
//                             onClick={(e) => {
//                                 if (onFanProfileClick) {
//                                     e.stopPropagation();
//                                     onFanProfileClick({
//                                         username: comment.authorUsername,
//                                         badge: comment.authorBadge,
//                                         avatarUrl: comment.authorAvatarUrl || comment.avatarUrl,
//                                     });
//                                 }
//                             }}
//                         >
//                             {comment.authorUsername}
//                         </span>
//                         <p className="text-[13.5px] leading-[1.55] text-[#E8E8F0] m-0" style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>
//                             {comment.text}
//                         </p>

//                         {/* Meta row */}
//                         <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[#6B6B8A]">
//                             <span>{formatTimeAgo(comment.createdAt)}</span>
//                             {heartCount > 0 && (
//                                 <span>{heartCount} {heartCount === 1 ? "like" : "likes"}</span>
//                             )}
//                             <button
//                                 onClick={() => {
//                                     setReplyTo({ commentId, authorUsername: comment.authorUsername });
//                                     setCommentText("");
//                                     setTimeout(() => inputRef.current?.focus(), 50);
//                                 }}
//                                 className="bg-transparent border-none cursor-pointer text-[#6B6B8A] font-semibold p-0 hover:text-white transition-colors duration-150 text-[11px]"
//                             >
//                                 Reply
//                             </button>
//                             {comment.authorUsername === activeUsername && (
//                                 <button
//                                     onClick={async (e) => {
//                                         e.stopPropagation();
//                                         if (window.confirm("Delete comment?")) {
//                                             try {
//                                                 // await axios.delete(`/api/roar/posts/${post.id}/comments/${commentId}`);
//                                                 await axios.delete(`/api/roar/rooms/${post.roomId}/messages/${post.id}/comments/${commentId}`);
//                                                 onToast("Deleted");
//                                                 fetchComments();
//                                             } catch {
//                                                 onToast("Failed");
//                                             }
//                                         }
//                                     }}
//                                     className="bg-transparent border-none text-[#f87171] cursor-pointer flex items-center p-0"
//                                 >
//                                     <Trash2 size={11} />
//                                 </button>
//                             )}
//                         </div>
//                     </div>

//                     {/* Heart button */}
//                     {/* <button
//                         onClick={() => reactToComment(commentId)}
//                         className="bg-transparent border-none cursor-pointer flex flex-col items-center gap-0.5 shrink-0 pt-0.5 p-0 text-[#6B6B8A] hover:text-[#f87171] transition-colors duration-150"
//                     >
//                         <Heart size={13} strokeWidth={1.5} />
//                     </button> */}
//                     {/* Reaction picker + "who reacted" trigger */}
//                     <div className="flex flex-col items-center gap-0.5 shrink-0 pt-0.5" onClick={e => e.stopPropagation()}>
//                         <ReactionPicker
//                             currentReaction={commentReactions[commentId]?.reaction ?? comment.userReaction ?? null}
//                             count={commentReactions[commentId]?.heartCount ?? heartCount}
//                             onReact={(r) => handleCommentReact(commentId, r)}
//                             postId={commentId}
//                             roomId={post.roomId}
//                             roomName={roomName}
//                         />
//                         {(commentReactions[commentId]?.heartCount ?? heartCount) > 0 && (
//                             <button
//                                 onClick={() => setReactionsDialogCommentId(commentId)}
//                                 className="bg-transparent border-none p-0 cursor-pointer text-[9px] text-[#6B6B8A] hover:text-white"
//                             >
//                                 See
//                             </button>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         );
//     };

//     useEffect(() => { fetchComments(); }, [fetchComments]);

//     const submitComment = async () => {
//         const fullText = replyTo
//             ? `@${replyTo.authorUsername} ${commentText.trim()}`
//             : commentText.trim();
//         if (!fullText) return;
//         try {
//             setLoading(true);
//             const res = await axios.post(
//                 `/api/roar/rooms/${post.roomId}/messages/${post.id}/comments`,
//                 { text: fullText }
//             );
//             if (res.data?.success) {
//                 setCommentText("");
//                 setReplyTo(null);
//                 fetchComments();
//                 onToast("Comment posted!");
//                 if (phog) {
//                     phog.capture("post_comment", {
//                         post_id: post.id,
//                         room_id: post.roomId,
//                         room_name: roomName || ""
//                     });
//                 }
//                 setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }), 400);
//             }
//         } catch {
//             onToast("Error posting comment");
//         } finally {
//             setLoading(false);
//         }
//     };

//     // const reactToComment = async (commentId: string) => {
//     //     try {
//     //         const res = await axios.post(`/api/roar/posts/${post.id}/comments/${commentId}/react`);
//     //         if (res.data?.success)
//     //             setComments(p => p.map(c => c.commentId === commentId ? { ...c, heartCount: res.data.heartCount } : c));
//     //     } catch { }
//     // };
//     const handleCommentReact = async (commentId: string, reaction: Reaction | null) => {
//         if (pendingCommentReactRef.current[commentId]) return;
//         const comment = comments.find(c => (c.commentId || c.id) === commentId);
//         const prev = commentReactions[commentId] ?? { reaction: comment?.userReaction ?? null, heartCount: comment?.heartCount ?? 0 };
//         const sameReaction = prev.reaction === reaction;
//         const newReaction = sameReaction ? null : reaction;
//         const wasActive = prev.reaction !== null;
//         const newActive = newReaction !== null;
//         const delta = newActive && !wasActive ? 1 : (!newActive && wasActive ? -1 : 0);
//         const optimistic = { reaction: newReaction, heartCount: Math.max(0, prev.heartCount + delta) };

//         setCommentReactions(p => ({ ...p, [commentId]: optimistic }));
//         pendingCommentReactRef.current[commentId] = true;
//         try {
//             const res = await axios.post(
//                 `/api/roar/rooms/${post.roomId}/messages/${post.id}/comments/${commentId}/react`,
//                 { reaction: newReaction ?? prev.reaction }
//             );
//             if (res.data && typeof res.data.heartCount === "number") {
//                 setCommentReactions(p => ({ ...p, [commentId]: { ...optimistic, heartCount: res.data.heartCount } }));
//             }
//         } catch {
//             setCommentReactions(p => ({ ...p, [commentId]: prev }));
//             onToast("Failed to save reaction");
//         } finally {
//             pendingCommentReactRef.current[commentId] = false;
//         }
//     };

//     const userVote = votes[post.id];
//     const currentUserIdCandidates = [currentUserId, post.currentUserId].filter(Boolean).map(String);
//     const isCurrentUserAuthor = () => {
//         const authorCandidates = [post.authorUid, post.fan?.authorUid, post.authorEmail].filter(Boolean).map(String);
//         return authorCandidates.some(id => currentUserIdCandidates.includes(id));
//     };
//     const getPredictionVoteValue = (optionIndex: number) =>
//         optionIndex === 0 ? "agree" : optionIndex === 1 ? "disagree" : `option_${optionIndex}`;
//     const getPredictionOptionLabel = (voteValue: string | undefined, options: string[]) => {
//         if (!voteValue) return "";
//         if (voteValue === "agree") return options[0] || "Option 1";
//         if (voteValue === "disagree") return options[1] || "Option 2";
//         const optionIndex = Number(voteValue.replace("option_", ""));
//         return Number.isFinite(optionIndex) ? (options[optionIndex] || voteValue) : voteValue;
//     };
//     const resolvePrediction = async (correctVote: string) => {
//         if (!post.roomId) return;
//         try {
//             setResolvingPrediction(true);
//             const res = await axios.post(`/api/roar/rooms/${post.roomId}/messages/${post.id}/resolve`, { correctVote });
//             if (res.data?.success) {
//                 const resolvedAt = res.data.message?.resolvedAt ?? Date.now();
//                 setLocalResolution({ resolvedAt, closedAt: res.data.message?.closedAt ?? resolvedAt, correctVote });
//                 onToast(`Prediction resolved. ${res.data.correctCount ?? 0} correct fans awarded.`);
//             } else {
//                 onToast("Failed to resolve prediction");
//             }
//         } catch (err: unknown) {
//             const message = axios.isAxiosError(err) ? err.response?.data?.error : undefined;
//             onToast(message || "Failed to resolve prediction");
//         } finally {
//             setResolvingPrediction(false);
//         }
//     };
//     const handleVoteClick = (agree: boolean) => {
//         const prev = votes[post.id];
//         let nextVote: boolean | null = agree;
//         if (prev === agree) nextVote = null;
//         setVotes(v => ({ ...v, [post.id]: nextVote }));
//         let delta = 0;
//         if (post.userVote === "agree") delta = nextVote === true ? 0 : nextVote === false ? -8 : -4;
//         else if (post.userVote === "disagree") delta = nextVote === true ? 8 : nextVote === false ? 0 : 4;
//         else delta = nextVote === true ? 4 : nextVote === false ? -4 : 0;
//         setPct(clamp(post.agreePercent + delta, 1, 99));
//         onVote(post.id, nextVote === true ? "agree" : nextVote === false ? "disagree" : null);
//     };

//     const canSubmit = commentText.trim().length > 0;

//     return (
//         <AnimatePresence>
//             <div className="absolute inset-0 z-[1000] flex flex-col overflow-hidden pointer-events-auto bg-[#050508]">
//                 {/* Header */}
//                 <div className="flex items-center gap-[14px] px-5 py-4 border-b border-[#252538] bg-[rgba(5,5,8,0.97)] backdrop-blur-[10px] shrink-0">
//                     <button
//                         onClick={() => onClose(comments.length)}
//                         className="bg-transparent border-none text-white cursor-pointer p-1 flex items-center min-w-9 min-h-9"
//                     >
//                         <ChevronLeft size={22} />
//                     </button>
//                     <div className="flex flex-col flex-1 min-w-0">
//                         {/* <h2 className="text-[12px] font-bold text-white m-0 uppercase tracking-[0.03em]">Post</h2> */}
//                         <h2 className="text-[12px] font-bold text-white m-0 uppercase tracking-[0.03em]">
//                             {post.type === "hottake" ? "Hot Take"
//                                 : post.type === "debate" ? "Debate"
//                                     : post.type === "prediction" ? "Prediction"
//                                         : post.type === "raw_reactions" ? "Raw Reactions"
//                                             : post.type === "quiz" ? "Quiz"
//                                                 : "Post"}
//                         </h2>
//                         <p className="text-[9px] text-[#9494AD] mt-0.5 mb-0">
//                             Posted by {post.fan?.username || post.authorUsername} • {formatTimeAgo(post.createdAt)} • {comments.length} comments
//                         </p>
//                     </div>
//                 </div>

//                 {/* Scrollable content */}
//                 <div
//                     ref={scrollRef}
//                     className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden [-webkit-overflow-scrolling:touch] px-5 pt-4 pb-4 bg-gradient-to-b from-[#050508] to-[#0b0b12]"
//                 >
//                     {/* Post card */}
//                     <div className="p-4 mb-5 bg-white/[0.03] border border-white/[0.06] rounded-[20px]">
//                         <div
//                             className="flex gap-2.5 items-center mb-3"
//                             style={{ cursor: onFanProfileClick ? "pointer" : "default" }}
//                             onClick={(e) => {
//                                 if (onFanProfileClick) {
//                                     e.stopPropagation();
//                                     onFanProfileClick(
//                                         post.fan || { username: post.authorUsername, badge: post.authorBadge, avatarUrl: post.authorAvatarUrl || post.avatarUrl }
//                                     );
//                                 }
//                             }}
//                         >
//                             <AvatarWithBadge
//                                 username={post.fan?.username || post.authorUsername}
//                                 badge={post.fan?.badge || post.authorBadge}
//                                 size="sm"
//                                 avatarUrl={
//                                     post.fan?.avatarUrl || post.authorAvatarUrl || post.avatarUrl ||
//                                     ((post.fan?.username || post.authorUsername) === activeUsername ? userAvatarUrl : undefined)
//                                 }
//                             />
//                             <div>
//                                 <p className="font-bold text-[13px] text-white m-0 flex items-center gap-1">
//                                     {post.fan?.username || post.authorUsername}
//                                     <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] inline-block" />
//                                 </p>
//                                 <p className="text-[10px] text-[#9494AD] m-0">{formatTimeAgo(post.createdAt)}</p>
//                             </div>
//                         </div>

//                         <p className="font-semibold text-[15px] leading-[1.5] mb-3 text-white">{post.text}</p>

//                         {post.type === "debate" && (post.sideA || post.sideB) && (() => {
//                             const sideA = post.sideA || "Side A";
//                             const sideB = post.sideB || "Side B";
//                             const hasVoted = post.userVote === "agree" || post.userVote === "disagree";
//                             const votedA = post.userVote === "agree";
//                             const votedB = post.userVote === "disagree";
//                             return (
//                                 <div className="mb-3">
//                                     <div style={{ display: "flex", gap: 8, alignItems: "stretch", marginBottom: 10 }}>
//                                         {[
//                                             { label: sideA, voted: votedA, color: "#E91E8C", bg: "rgba(233,30,140,0.08)", border: "rgba(233,30,140,0.3)", vote: "agree" as const },
//                                             { label: sideB, voted: votedB, color: "#60a5fa", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.3)", vote: "disagree" as const },
//                                         ].map(({ label, voted, color, bg, border, vote }, idx) => (
//                                             <>
//                                                 {idx === 1 && (
//                                                     <div key="vs" style={{ display: "flex", alignItems: "center", padding: "0 4px" }}>
//                                                         <span className="font-display" style={{ fontSize: 16, color: "#4A4A62" }}>VS</span>
//                                                     </div>
//                                                 )}
//                                                 <button
//                                                     key={vote}
//                                                     disabled={hasVoted}
//                                                     onClick={async (e) => {
//                                                         e.stopPropagation();
//                                                         if (hasVoted) return;
//                                                         try {
//                                                             await axios.post(`/api/roar/rooms/${post.roomId}/messages/${post.id}/vote`, { vote });
//                                                             onVote(post.id, vote);
//                                                         } catch { onToast("Failed to submit vote"); }
//                                                     }}
//                                                     style={{
//                                                         flex: 1, padding: "12px", borderRadius: 14, textAlign: "center",
//                                                         background: voted ? color : bg,
//                                                         border: `2px solid ${voted ? color : border}`,
//                                                         color: voted ? "white" : "var(--text-primary)",
//                                                         cursor: hasVoted ? "not-allowed" : "pointer",
//                                                         transition: "all 0.2s",
//                                                         opacity: hasVoted && !voted ? 0.35 : 1,
//                                                     }}
//                                                 >
//                                                     <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>
//                                                         {voted ? "✓ " : ""}{label}
//                                                     </p>
//                                                 </button>
//                                             </>
//                                         ))}
//                                     </div>
//                                     <p style={{
//                                         fontSize: 11, marginBottom: 0,
//                                         fontWeight: hasVoted ? 600 : 400,
//                                         color: hasVoted ? "#E91E8C" : "#4A4A62",
//                                         fontStyle: hasVoted ? "normal" : "italic",
//                                     }}>
//                                         {hasVoted ? "🗳️ You've already voted!" : "Tap a side to vote"}
//                                     </p>
//                                 </div>
//                             );
//                         })()}

//                         {post.mediaUrls?.length > 0 && (
//                             <div className="flex flex-col gap-2 mb-3">
//                                 {post.mediaUrls.map((url: string, idx: number) =>
//                                     url.endsWith(".mp4") || url.includes("/video/upload/")
//                                         ? <video key={idx} src={url} controls className="w-full max-h-[300px] rounded-xl object-cover" />
//                                         : <img key={idx} src={url} alt="" className="w-full max-h-[300px] rounded-xl object-cover" />
//                                 )}
//                             </div>
//                         )}

//                         {post.type === "prediction" && (() => {
//                             const predictionOptions = Array.isArray(post.predictionOptions) && post.predictionOptions.length >= 2
//                                 ? post.predictionOptions
//                                 : [post.sideA || "Option 1", post.sideB || "Option 2"];
//                             const resolvedAt = localResolution?.resolvedAt ?? post.resolvedAt;
//                             const closedAt = localResolution?.closedAt ?? post.closedAt;
//                             const correctVote = localResolution?.correctVote ?? post.correctVote;
//                             const predictionClosed = Boolean(resolvedAt || closedAt || (post.closesAt && post.closesAt <= Date.now()));
//                             const correctVoteLabel = getPredictionOptionLabel(correctVote, predictionOptions);
//                             return (
//                                 <div className="mb-3">
//                                     {predictionClosed && !resolvedAt && isCurrentUserAuthor() && (
//                                         <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
//                                             {predictionOptions.map((label: string, optionIndex: number) => (
//                                                 <button
//                                                     key={`resolve-${label}-${optionIndex}`}
//                                                     type="button"
//                                                     disabled={resolvingPrediction}
//                                                     onClick={(e) => { e.stopPropagation(); resolvePrediction(getPredictionVoteValue(optionIndex)); }}
//                                                     style={{
//                                                         flex: "1 1 calc(50% - 4px)", minWidth: 0,
//                                                         padding: "9px 10px", borderRadius: 12,
//                                                         border: "1px solid rgba(34,197,94,0.35)",
//                                                         background: "rgba(34,197,94,0.1)", color: "#22c55e",
//                                                         fontSize: 12, fontWeight: 800,
//                                                         cursor: resolvingPrediction ? "wait" : "pointer",
//                                                     }}
//                                                 >
//                                                     Resolve: {label}
//                                                 </button>
//                                             ))}
//                                         </div>
//                                     )}
//                                     {resolvedAt && correctVoteLabel && (
//                                         <p style={{ fontSize: 11, color: "#22c55e", fontWeight: 800, marginBottom: 8 }}>
//                                             Correct answer: {correctVoteLabel}
//                                         </p>
//                                     )}
//                                 </div>
//                             );
//                         })()}

//                         {post.type === "hot_take" && (
//                             <>
//                                 <div className="mb-2.5"><SplitBar left={pct} /></div>
//                                 <div className="flex gap-2 mt-3">
//                                     {[
//                                         { agree: true, label: "Agree", active: userVote === true, color: "#E91E8C" },
//                                         { agree: false, label: "Disagree", active: userVote === false, color: "#FF6B35" },
//                                     ].map(({ agree, label, active, color }) => (
//                                         <button
//                                             key={label}
//                                             onClick={() => handleVoteClick(agree)}
//                                             className="flex-1 py-3 rounded-full text-[13px] font-bold cursor-pointer transition-all duration-[220ms] border-[2.5px]"
//                                             style={{ borderColor: color, background: active ? color : "rgba(255,255,255,0.02)", color: active ? "white" : color }}
//                                         >
//                                             {active ? `✓ ${label}d` : label}
//                                         </button>
//                                     ))}
//                                 </div>
//                             </>
//                         )}

//                         <div className="flex items-center mt-4 border-t border-white/[0.06] pt-3">
//                             {(post.fan?.username === activeUsername || post.authorUsername === activeUsername) && (
//                                 <button
//                                     onClick={(e) => {
//                                         e.stopPropagation();
//                                         if (window.confirm("Delete this post?")) {
//                                             onDeletePost?.(post.id, post.roomId);
//                                             onClose();
//                                         }
//                                     }}
//                                     className="flex items-center justify-center bg-transparent border-none cursor-pointer text-[#f87171] ml-auto p-1 rounded-full"
//                                 >
//                                     <Trash2 size={16} />
//                                 </button>
//                             )}
//                         </div>
//                     </div>

//                     {/* Comments header */}
//                     <div className="flex justify-between items-center mb-4">
//                         <span className="text-[11px] font-extrabold text-white tracking-[0.06em] uppercase">Comments</span>
//                         <span className="text-[10px] text-[#9494AD]">{comments.length} total</span>
//                     </div>

//                     {/* Comments list — threaded via threadSort */}
//                     <div className="flex flex-col gap-5 pb-2">
//                         {comments.length === 0 ? (
//                             <p className="text-[13px] text-[#4A4A62] text-center py-5">No comments yet. Be the first!</p>
//                         ) : (
//                             threadSort(comments).map((comment) => renderComment(comment))
//                         )}
//                     </div>
//                 </div>

//                 {/* Composer */}
//                 <div className="shrink-0 bg-[rgba(5,5,8,0.97)] border-t border-[#252538] relative z-10 pb-2">
//                     {replyTo && (
//                         <div className="flex items-center gap-1.5 px-4 pt-1.5">
//                             <span className="text-[11px] text-[#9494AD]">Replying to</span>
//                             <span className="inline-flex items-center gap-1 bg-[rgba(233,30,140,0.15)] border border-[rgba(233,30,140,0.35)] rounded-full py-0.5 pl-1.5 pr-2 text-[12px] font-bold text-[#E91E8C] max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap">
//                                 @{replyTo.authorUsername}
//                                 <button
//                                     onClick={() => { setReplyTo(null); setCommentText(""); }}
//                                     className="bg-transparent border-none p-0 cursor-pointer text-[#E91E8C] flex items-center ml-0.5 shrink-0"
//                                 >
//                                     <X size={11} />
//                                 </button>
//                             </span>
//                         </div>
//                     )}

//                     {showMentionPopup && mentionUsers.length > 0 && (
//                         <div className="absolute bottom-full left-4 right-4 mb-2 bg-[#181c24] rounded-2xl border border-[rgba(200,112,90,0.2)] overflow-hidden z-20 shadow-[0_8px_32px_rgba(0,0,0,0.4)] max-h-[300px] overflow-y-auto">
//                             {mentionUsers.map((user, idx) => {
//                                 const dn = user.username || user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email?.split("@")[0] || "user";
//                                 return (
//                                     <button
//                                         key={user.userId}
//                                         onClick={() => insertMention(user)}
//                                         onMouseEnter={() => setMentionIndex(idx)}
//                                         className={`flex items-center gap-3 px-4 py-2.5 w-full border-none cursor-pointer transition-colors duration-150 ${idx === mentionIndex ? "bg-[rgba(200,112,90,0.15)]" : "bg-transparent"}`}
//                                     >
//                                         <AvatarWithBadge username={dn} badge="RISING_FAN" size="sm" avatarUrl={user.avatarUrl} />
//                                         <div className="flex-1 text-left">
//                                             <p className="font-semibold text-[13px] text-white m-0">{dn}</p>
//                                             {user.email && <p className="text-[10px] text-[#7a6a65] m-0">{user.email}</p>}
//                                         </div>
//                                         <User size={14} className="text-[#c8705a]" />
//                                     </button>
//                                 );
//                             })}
//                         </div>
//                     )}

//                     <p className="px-5 pt-2 pb-0 m-0 text-[10px] text-[#7a6a65]">Type @ to mention someone</p>
//                     <div className="flex gap-2 items-center px-4 pt-1.5 pb-1">
//                         <AvatarWithBadge username={userUsername} badge={userBadge} size="sm" avatarUrl={userAvatarUrl} />
//                         <div className="flex-1">
//                             <input
//                                 ref={inputRef}
//                                 type="text"
//                                 placeholder={replyTo ? "Write your reply…" : "Share your opinion..."}
//                                 value={commentText}
//                                 onChange={handleInputChange}
//                                 onKeyDown={handleKeyDown}
//                                 className="w-full h-11 rounded-full bg-white/[0.04] border border-white/[0.12] pl-4 pr-4 text-white text-[16px] outline-none placeholder:text-[#8A8AA9] transition-colors duration-150 focus:border-[#E91E8C]/60 focus:bg-white/[0.08]"
//                             />
//                         </div>
//                         <button
//                             onClick={submitComment}
//                             disabled={loading || !canSubmit}
//                             className={`w-[38px] h-[38px] rounded-full bg-[#E91E8C] border-none text-white flex items-center justify-center shrink-0 transition-opacity duration-200 ${canSubmit ? "cursor-pointer opacity-100" : "cursor-default opacity-50"}`}
//                         >
//                             {loading ? <Loader2 size={16} className="animate-spin" /> : "↑"}
//                         </button>
//                     </div>
//                 </div>

//                 <ReactionsDialog
//                     postId={reactionsDialogCommentId ?? ""}
//                     isOpen={reactionsDialogCommentId !== null}
//                     onClose={() => setReactionsDialogCommentId(null)}
//                     onFanProfile={onFanProfileClick}
//                     roomId={post.roomId}
//                     msgId={post.id}
//                     commentId={reactionsDialogCommentId ?? undefined}
//                 />
//             </div>
//         </AnimatePresence>
//     );
// }





/**
 * RoomPostDetailsOverlay — DiscussionRoom variant.
 * Uses position:absolute; inset:0 to fill the roar-inner container exactly.
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { usePostHog } from "posthog-js/react";
import axios from "axios";
import AvatarWithBadge from "./AvatarWithBadge";
import { SplitBar } from "./shared";
import { clamp, formatTimeAgo } from "../utils";
import { ChevronLeft, Trash2, X, User, Loader2, Heart } from "lucide-react";
import ReactionPicker, { type Reaction } from "./ReactionPicker";
import ReactionsDialog from "./ReactionsDialog";

interface Props {
    post: any;
    onClose: (replyCount?: number) => void;
    onToast: (m: string) => void;
    onVote: (id: string, vote: "agree" | "disagree" | null) => void;
    onDeletePost?: (id: string, roomId?: string) => void;
    currentUsername?: string;
    currentUserId?: string;
    currentAvatarUrl?: string;
    onFanProfileClick?: (fan: any) => void;
    roomName?: string;
}

interface MentionUser {
    userId: string;
    username: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    avatarUrl?: string;
    email?: string;
}

const REACTION_EMOJI: Record<string, string> = {
    fire: "🔥", heart: "❤️", mindblown: "🤯", goat: "🐐", clap: "👏",
    nochance: "🙅", laugh: "😂", sad: "😢", thumb: "👍",
};

// ---------------------------------------------------------------------------
// Threading helpers (mirrors DiscussionRoom.tsx logic)
// ---------------------------------------------------------------------------

function mentionMatchesAuthor(mentionToken: string, authorUsername: string): boolean {
    const m = mentionToken.toLowerCase();
    const u = (authorUsername || "").toLowerCase();
    if (m === u) return true;
    const firstWord = u.split(" ")[0];
    if (m === firstWord) return true;
    const firstSegment = u.split("_")[0];
    if (firstSegment && m === firstSegment) return true;
    return false;
}

function threadSort(flat: any[]): any[] {
    const sorted = [...flat].sort((a, b) => a.createdAt - b.createdAt);
    const result: any[] = [];

    for (const comment of sorted) {
        const mentionMatch = comment.text?.trim().match(/^@([\w.\-]+)/i);
        if (mentionMatch) {
            const token = mentionMatch[1];
            let insertAfter = -1;
            for (let i = result.length - 1; i >= 0; i--) {
                if (mentionMatchesAuthor(token, result[i].authorUsername)) {
                    insertAfter = i;
                    break;
                }
            }
            if (insertAfter !== -1) {
                result.splice(insertAfter + 1, 0, comment);
                continue;
            }
        }
        result.push(comment);
    }

    return result;
}

export default function RoomPostDetailsOverlay({
    post,
    onClose,
    onToast,
    onVote,
    onDeletePost,
    currentUsername,
    currentUserId,
    currentAvatarUrl,
    onFanProfileClick,
    roomName,
}: Props) {
    const phog = usePostHog();
    const [comments, setComments] = useState<any[]>([]);
    const [commentText, setCommentText] = useState("");
    const [replyTo, setReplyTo] = useState<{ commentId: string; authorUsername: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [userUsername, setUserUsername] = useState("RoarUser");
    const activeUsername = currentUsername || userUsername;
    const [userBadge, setUserBadge] = useState("RISING_FAN");
    const [userAvatarUrl, setUserAvatarUrl] = useState<string | undefined>(currentAvatarUrl);
    const [votes, setVotes] = useState<Record<string, boolean | null>>(() =>
        post.userVote ? { [post.id]: post.userVote === "agree" } : {},
    );
    const [pct, setPct] = useState(post.agreePercent ?? 50);
    const [resolvingPrediction, setResolvingPrediction] = useState(false);
    const [localResolution, setLocalResolution] = useState<{ resolvedAt: number; closedAt: number; correctVote: string } | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const [mentionUsers, setMentionUsers] = useState<MentionUser[]>([]);
    const [showMentionPopup, setShowMentionPopup] = useState(false);
    const [mentionIndex, setMentionIndex] = useState(0);
    const [cursorPosition, setCursorPosition] = useState(0);
    const [allUsers, setAllUsers] = useState<MentionUser[]>([]);

    const [commentReactions, setCommentReactions] = useState<Record<string, { reaction: Reaction | null; heartCount: number }>>({});
    const [reactionsDialogCommentId, setReactionsDialogCommentId] = useState<string | null>(null);
    const pendingCommentReactRef = useRef<Record<string, boolean>>({});

    // ── Top reaction emojis per comment (shown under the heart button,
    // mirrors DiscussionRoom's renderReactionsTrigger stack of emoji bubbles) ──
    const commentTopReactionsCache = useRef<Record<string, string[]>>({});
    const [commentTopReactionsMap, setCommentTopReactionsMap] = useState<Record<string, string[]>>({});

    const fetchCommentTopReactions = useCallback(async (commentId: string) => {
        if (commentTopReactionsCache.current[commentId] !== undefined) return;
        commentTopReactionsCache.current[commentId] = [];
        try {
            const res = await axios.get(
                `/api/roar/rooms/${post.roomId}/messages/${post.id}/comments/${commentId}/reactions`
            );
            const reactors: { reaction: string }[] = res.data?.reactors ?? [];
            const counts: Record<string, number> = {};
            reactors.forEach(r => { counts[r.reaction] = (counts[r.reaction] ?? 0) + 1; });
            const top = Object.entries(counts).sort(([, a], [, b]) => b - a).slice(0, 3).map(([type]) => type);
            commentTopReactionsCache.current[commentId] = top;
            setCommentTopReactionsMap(prev => ({ ...prev, [commentId]: top }));
        } catch {
            commentTopReactionsCache.current[commentId] = [];
        }
    }, [post.roomId, post.id]);

    const hasUnderscore = (u: any) => {
        const n = u.username || u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim();
        return n.includes("_") || (u.email || "").split("@")[0].includes("_");
    };

    useEffect(() => {
        axios.get("/api/users", { withCredentials: true }).then(res => {
            if (!res.data?.users) return;
            const seen = new Set<string>();
            setAllUsers(res.data.users
                .filter((u: any) => {
                    const n = u.username || u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim();
                    return n !== activeUsername && !hasUnderscore(u);
                })
                .map((u: any) => ({
                    userId: u.userId || u.id,
                    username: u.username,
                    firstName: u.firstName,
                    lastName: u.lastName,
                    name: u.name,
                    avatarUrl: u.avatarUrl || u.avatar,
                    email: u.email,
                }))
                .filter((u: MentionUser) => {
                    const key = u.userId || u.username;
                    if (!key || seen.has(key)) return false;
                    const dn = u.username || u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim();
                    if (dn.includes("_")) return false;
                    seen.add(key); return true;
                }));
        }).catch(() => { });
    }, [activeUsername]);

    useEffect(() => {
        try {
            setUserUsername(localStorage.getItem("roar_username") || "RoarUser");
            setUserBadge(localStorage.getItem("roar_badge") || "RISING_FAN");
            setUserAvatarUrl(currentAvatarUrl || localStorage.getItem("roar_avatar_url") || undefined);
        } catch { }
    }, [currentAvatarUrl]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const cur = e.target.selectionStart || 0;
        setCommentText(value);
        setCursorPosition(cur);
        const before = value.slice(0, cur);
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

    const insertMention = (user: MentionUser) => {
        const dn = user.username || user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email?.split("@")[0] || "user";
        const mt = `@${dn} `;
        const before = commentText.slice(0, cursorPosition);
        const at = before.lastIndexOf("@");
        setCommentText(`${commentText.slice(0, at)}${mt}${commentText.slice(cursorPosition)}`);
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

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (showMentionPopup && mentionUsers.length > 0) {
            if (e.key === "ArrowDown") { e.preventDefault(); setMentionIndex(p => (p + 1) % mentionUsers.length); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setMentionIndex(p => (p - 1 + mentionUsers.length) % mentionUsers.length); }
            else if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); if (mentionUsers[mentionIndex]) insertMention(mentionUsers[mentionIndex]); }
            else if (e.key === "Escape") { setShowMentionPopup(false); setMentionUsers([]); }
        } else if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submitComment();
        }
    };

    const fetchComments = useCallback(async () => {
        if (!post?.id) return;
        try {
            const res = await axios.get(`/api/roar/rooms/${post.roomId}/messages/${post.id}/comments`);
            if (res.data?.success) setComments(res.data.comments);
        } catch { }
    }, [post]);

    // ---------------------------------------------------------------------------
    // Render a single comment row (flat list — threading is done by threadSort)
    // ---------------------------------------------------------------------------
    const renderComment = (comment: any) => {
        const commentId = comment.commentId || comment.id;
        const heartCount = comment.heartCount ?? 0;

        const isReply = Boolean(comment.text?.trim().match(/^@[\w.\-]+/i));

        // ── Resolve the current user's own reaction on this comment ──
        // The comments-list endpoint may not compute `userReaction` per
        // comment, but the `react` route always writes it into the raw
        // `reactions` map on the comment doc (reactions[userId] = type).
        // Fall back to that map (keyed by currentUserId) so a page
        // refresh still shows which emoji the user picked, not just the count.
        const persistedReaction: Reaction | null =
            comment.userReaction ??
            (currentUserId ? (comment.reactions?.[currentUserId] ?? null) : null);

        const lo = commentReactions[commentId];
        const currentReaction: Reaction | null = lo !== undefined ? lo.reaction : persistedReaction;
        const liveHeartCount = lo !== undefined ? lo.heartCount : heartCount;

        // Lazily fetch top reaction emojis (like DiscussionRoom's stack)
        const topReactions = commentTopReactionsMap[commentId] ?? [];
        if (liveHeartCount > 0 && topReactions.length === 0 && !commentTopReactionsCache.current[commentId]) {
            fetchCommentTopReactions(commentId);
        }
        const displayReactions = topReactions.length > 0
            ? topReactions
            : (currentReaction ? [currentReaction] : []);

        const isSending = comment.status === "sending";
        return (
            <div key={commentId} className={isReply ? "ml-10 pl-3 border-l border-white/[0.07]" : ""} style={{ opacity: isSending ? 0.6 : 1, pointerEvents: isSending ? "none" : "auto" }}>
                <div className="flex gap-3 items-start">
                    {/* Avatar */}
                    <div
                        className="shrink-0"
                        style={{ cursor: onFanProfileClick ? "pointer" : "default" }}
                        onClick={(e) => {
                            if (onFanProfileClick) {
                                e.stopPropagation();
                                onFanProfileClick({
                                    username: comment.authorUsername,
                                    badge: comment.authorBadge,
                                    avatarUrl: comment.authorAvatarUrl || comment.avatarUrl,
                                });
                            }
                        }}
                    >
                        <AvatarWithBadge
                            username={comment.authorUsername}
                            badge={comment.authorBadge}
                            size="sm"
                            avatarUrl={
                                comment.authorAvatarUrl ||
                                comment.avatarUrl ||
                                (comment.authorUsername === activeUsername ? userAvatarUrl : undefined)
                            }
                        />
                    </div>

                    {/* Body */}
                    <div className="flex-1 min-w-0 overflow-hidden">
                        <span
                            className="font-bold text-white text-[13px] block truncate"
                            style={{ cursor: onFanProfileClick ? "pointer" : "default" }}
                            onClick={(e) => {
                                if (onFanProfileClick) {
                                    e.stopPropagation();
                                    onFanProfileClick({
                                        username: comment.authorUsername,
                                        badge: comment.authorBadge,
                                        avatarUrl: comment.authorAvatarUrl || comment.avatarUrl,
                                    });
                                }
                            }}
                        >
                            {comment.authorUsername}
                        </span>
                        <p className="text-[13.5px] leading-[1.55] text-[#E8E8F0] m-0" style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}>
                            {comment.text}
                        </p>

                        {/* Meta row */}
                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[#6B6B8A]">
                            <span>{formatTimeAgo(comment.createdAt)}</span>
                            {liveHeartCount > 0 && (
                                <span>{liveHeartCount} {liveHeartCount === 1 ? "like" : "likes"}</span>
                            )}
                            <button
                                onClick={() => {
                                    setReplyTo({ commentId, authorUsername: comment.authorUsername });
                                    setCommentText("");
                                    setTimeout(() => inputRef.current?.focus(), 50);
                                }}
                                className="bg-transparent border-none cursor-pointer text-[#6B6B8A] font-semibold p-0 hover:text-white transition-colors duration-150 text-[11px]"
                            >
                                Reply
                            </button>
                            {comment.authorUsername === activeUsername && (
                                <button
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        if (comment.status === "sending") return;
                                        if (window.confirm("Delete comment?")) {
                                            const backup = comment;
                                            setComments(prev => prev.filter(x => (x.id || x.commentId) !== commentId));
                                            try {
                                                await axios.delete(`/api/roar/rooms/${post.roomId}/messages/${post.id}/comments/${commentId}`);
                                                onToast("Deleted");
                                            } catch {
                                                onToast("Failed");
                                                setComments(prev => [...prev, backup].sort((a,b) => a.createdAt - b.createdAt));
                                            }
                                        }
                                    }}
                                    className="bg-transparent border-none text-[#f87171] cursor-pointer flex items-center p-0"
                                >
                                    <Trash2 size={11} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Reaction picker + top-reactions stack (replaces "See" text,
                        aligned directly under the heart button like DiscussionRoom) */}
                    <div className="flex flex-col items-center gap-0.5 shrink-0 pt-0.5" onClick={e => e.stopPropagation()}>
                        <ReactionPicker
                            currentReaction={currentReaction}
                            count={liveHeartCount}
                            onReact={(r) => handleCommentReact(commentId, r)}
                            postId={commentId}
                            roomId={post.roomId}
                            roomName={roomName}
                        />
                        {liveHeartCount > 0 && displayReactions.length > 0 && (
                            <button
                                onClick={() => setReactionsDialogCommentId(commentId)}
                                style={{ display: "flex", alignItems: "center", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                                title="See who reacted"
                            >
                                <div style={{ display: "flex" }}>
                                    {displayReactions.map((type, i) => (
                                        <div
                                            key={type}
                                            style={{
                                                width: 16, height: 16, borderRadius: "50%",
                                                background: "#1e1e2a", border: "1.5px solid rgba(255,255,255,0.1)",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                fontSize: 9, marginLeft: i === 0 ? 0 : -5,
                                                zIndex: displayReactions.length - i, position: "relative",
                                            }}
                                        >
                                            {REACTION_EMOJI[type] ?? "❤️"}
                                        </div>
                                    ))}
                                </div>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    useEffect(() => { fetchComments(); }, [fetchComments]);

    const submitComment = async () => {
        const fullText = replyTo
            ? `@${replyTo.authorUsername} ${commentText.trim()}`
            : commentText.trim();
        if (!fullText) return;

        const tempId = `temp-comment-${Date.now()}`;
        const optimisticComment: any = {
            id: tempId, commentId: tempId,
            authorUsername: currentUsername, authorUid: currentUserId, authorAvatarUrl: currentAvatarUrl,
            text: fullText, createdAt: Date.now(), heartCount: 0, status: "sending"
        };
        
        setComments(prev => [...prev, optimisticComment]);
        setCommentText("");
        setReplyTo(null);
        setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }), 50);

        try {
            const res = await axios.post(
                `/api/roar/rooms/${post.roomId}/messages/${post.id}/comments`,
                { text: fullText }
            );
            if (res.data?.success) {
                const c = res.data.comment;
                setComments(prev => {
                    if (prev.some(x => x.id === c.commentId || x.commentId === c.commentId)) return prev.filter(x => x.id !== tempId && x.commentId !== tempId);
                    return prev.map(x => (x.id === tempId || x.commentId === tempId) ? { ...x, id: c.commentId, commentId: c.commentId, status: "sent" } : x);
                });
                onToast("Comment posted!");
                if (phog) {
                    phog.capture("post_comment", {
                        post_id: post.id,
                        room_id: post.roomId,
                        room_name: roomName || ""
                    });
                }
            } else {
                setComments(prev => prev.map(x => (x.id === tempId || x.commentId === tempId) ? { ...x, status: "error" } : x));
                onToast("Error posting comment");
            }
        } catch {
            setComments(prev => prev.map(x => (x.id === tempId || x.commentId === tempId) ? { ...x, status: "error" } : x));
            onToast("Error posting comment");
        }
    };

    const handleCommentReact = async (commentId: string, reaction: Reaction | null) => {
        if (pendingCommentReactRef.current[commentId]) return;
        const comment = comments.find(c => (c.commentId || c.id) === commentId);
        const persistedReaction: Reaction | null =
            comment?.userReaction ??
            (currentUserId ? (comment?.reactions?.[currentUserId] ?? null) : null);
        const prev = commentReactions[commentId] ?? { reaction: persistedReaction, heartCount: comment?.heartCount ?? 0 };
        const sameReaction = prev.reaction === reaction;
        const newReaction = sameReaction ? null : reaction;
        const wasActive = prev.reaction !== null;
        const newActive = newReaction !== null;
        const delta = newActive && !wasActive ? 1 : (!newActive && wasActive ? -1 : 0);
        const optimistic = { reaction: newReaction, heartCount: Math.max(0, prev.heartCount + delta) };

        setCommentReactions(p => ({ ...p, [commentId]: optimistic }));
        // Invalidate the top-reactions cache so the emoji stack refetches
        // and reflects this change (add/remove/switch) once the request lands.
        delete commentTopReactionsCache.current[commentId];
        pendingCommentReactRef.current[commentId] = true;
        try {
            const res = await axios.post(
                `/api/roar/rooms/${post.roomId}/messages/${post.id}/comments/${commentId}/react`,
                { reaction: newReaction ?? prev.reaction }
            );
            if (res.data && typeof res.data.heartCount === "number") {
                setCommentReactions(p => ({ ...p, [commentId]: { ...optimistic, heartCount: res.data.heartCount } }));
            }
            // Refresh the top-reactions stack now that the reaction has persisted
            delete commentTopReactionsCache.current[commentId];
            setCommentTopReactionsMap(p => { const n = { ...p }; delete n[commentId]; return n; });
        } catch {
            setCommentReactions(p => ({ ...p, [commentId]: prev }));
            onToast("Failed to save reaction");
        } finally {
            pendingCommentReactRef.current[commentId] = false;
        }
    };

    const userVote = votes[post.id];
    const currentUserIdCandidates = [currentUserId, post.currentUserId].filter(Boolean).map(String);
    const isCurrentUserAuthor = () => {
        const authorCandidates = [post.authorUid, post.fan?.authorUid, post.authorEmail].filter(Boolean).map(String);
        return authorCandidates.some(id => currentUserIdCandidates.includes(id));
    };
    const getPredictionVoteValue = (optionIndex: number) =>
        optionIndex === 0 ? "agree" : optionIndex === 1 ? "disagree" : `option_${optionIndex}`;
    const getPredictionOptionLabel = (voteValue: string | undefined, options: string[]) => {
        if (!voteValue) return "";
        if (voteValue === "agree") return options[0] || "Option 1";
        if (voteValue === "disagree") return options[1] || "Option 2";
        const optionIndex = Number(voteValue.replace("option_", ""));
        return Number.isFinite(optionIndex) ? (options[optionIndex] || voteValue) : voteValue;
    };
    const resolvePrediction = async (correctVote: string) => {
        if (!post.roomId) return;
        try {
            setResolvingPrediction(true);
            const res = await axios.post(`/api/roar/rooms/${post.roomId}/messages/${post.id}/resolve`, { correctVote });
            if (res.data?.success) {
                const resolvedAt = res.data.message?.resolvedAt ?? Date.now();
                setLocalResolution({ resolvedAt, closedAt: res.data.message?.closedAt ?? resolvedAt, correctVote });
                onToast(`Prediction resolved. ${res.data.correctCount ?? 0} correct fans awarded.`);
            } else {
                onToast("Failed to resolve prediction");
            }
        } catch (err: unknown) {
            const message = axios.isAxiosError(err) ? err.response?.data?.error : undefined;
            onToast(message || "Failed to resolve prediction");
        } finally {
            setResolvingPrediction(false);
        }
    };
    const handleVoteClick = (agree: boolean) => {
        const prev = votes[post.id];
        let nextVote: boolean | null = agree;
        if (prev === agree) nextVote = null;
        setVotes(v => ({ ...v, [post.id]: nextVote }));
        let delta = 0;
        if (post.userVote === "agree") delta = nextVote === true ? 0 : nextVote === false ? -8 : -4;
        else if (post.userVote === "disagree") delta = nextVote === true ? 8 : nextVote === false ? 0 : 4;
        else delta = nextVote === true ? 4 : nextVote === false ? -4 : 0;
        setPct(clamp(post.agreePercent + delta, 1, 99));
        onVote(post.id, nextVote === true ? "agree" : nextVote === false ? "disagree" : null);
    };

    const canSubmit = commentText.trim().length > 0;

    return (
        <AnimatePresence>
            <div className="absolute inset-0 z-[1000] flex flex-col overflow-hidden pointer-events-auto bg-[#050508]">
                {/* Header */}
                <div className="flex items-center gap-[14px] px-5 py-4 border-b border-[#252538] bg-[rgba(5,5,8,0.97)] backdrop-blur-[10px] shrink-0">
                    <button
                        onClick={() => onClose(comments.length)}
                        className="bg-transparent border-none text-white cursor-pointer p-1 flex items-center min-w-9 min-h-9"
                    >
                        <ChevronLeft size={22} />
                    </button>
                    <div className="flex flex-col flex-1 min-w-0">
                        <h2 className="text-[12px] font-bold text-white m-0 uppercase tracking-[0.03em]">
                            {post.type === "hottake" ? "Hot Take"
                                : post.type === "debate" ? "Debate"
                                    : post.type === "prediction" ? "Prediction"
                                        : post.type === "raw_reactions" ? "Raw Reactions"
                                            : post.type === "quiz" ? "Quiz"
                                                : "Post"}
                        </h2>
                        <p className="text-[9px] text-[#9494AD] mt-0.5 mb-0">
                            Posted by {post.fan?.username || post.authorUsername} • {formatTimeAgo(post.createdAt)} • {comments.length} comments
                        </p>
                    </div>
                </div>

                {/* Scrollable content */}
                <div
                    ref={scrollRef}
                    className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden [-webkit-overflow-scrolling:touch] px-5 pt-4 pb-4 bg-gradient-to-b from-[#050508] to-[#0b0b12]"
                >
                    {/* Post card */}
                    <div className="p-4 mb-5 bg-white/[0.03] border border-white/[0.06] rounded-[20px]">
                        <div
                            className="flex gap-2.5 items-center mb-3"
                            style={{ cursor: onFanProfileClick ? "pointer" : "default" }}
                            onClick={(e) => {
                                if (onFanProfileClick) {
                                    e.stopPropagation();
                                    onFanProfileClick(
                                        post.fan || { username: post.authorUsername, badge: post.authorBadge, avatarUrl: post.authorAvatarUrl || post.avatarUrl }
                                    );
                                }
                            }}
                        >
                            <AvatarWithBadge
                                username={post.fan?.username || post.authorUsername}
                                badge={post.fan?.badge || post.authorBadge}
                                size="sm"
                                avatarUrl={
                                    post.fan?.avatarUrl || post.authorAvatarUrl || post.avatarUrl ||
                                    ((post.fan?.username || post.authorUsername) === activeUsername ? userAvatarUrl : undefined)
                                }
                            />
                            <div>
                                <p className="font-bold text-[13px] text-white m-0 flex items-center gap-1">
                                    {post.fan?.username || post.authorUsername}
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] inline-block" />
                                </p>
                                <p className="text-[10px] text-[#9494AD] m-0">{formatTimeAgo(post.createdAt)}</p>
                            </div>
                        </div>

                        <p className="font-semibold text-[15px] leading-[1.5] mb-3 text-white">{post.text}</p>

                        {post.type === "debate" && (post.sideA || post.sideB) && (() => {
                            const sideA = post.sideA || "Side A";
                            const sideB = post.sideB || "Side B";
                            const hasVoted = post.userVote === "agree" || post.userVote === "disagree";
                            const votedA = post.userVote === "agree";
                            const votedB = post.userVote === "disagree";
                            return (
                                <div className="mb-3">
                                    <div style={{ display: "flex", gap: 8, alignItems: "stretch", marginBottom: 10 }}>
                                        {[
                                            { label: sideA, voted: votedA, color: "#E91E8C", bg: "rgba(233,30,140,0.08)", border: "rgba(233,30,140,0.3)", vote: "agree" as const },
                                            { label: sideB, voted: votedB, color: "#60a5fa", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.3)", vote: "disagree" as const },
                                        ].map(({ label, voted, color, bg, border, vote }, idx) => (
                                            <>
                                                {idx === 1 && (
                                                    <div key="vs" style={{ display: "flex", alignItems: "center", padding: "0 4px" }}>
                                                        <span className="font-display" style={{ fontSize: 16, color: "#4A4A62" }}>VS</span>
                                                    </div>
                                                )}
                                                <button
                                                    key={vote}
                                                    disabled={hasVoted}
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        if (hasVoted) return;
                                                        try {
                                                            await axios.post(`/api/roar/rooms/${post.roomId}/messages/${post.id}/vote`, { vote });
                                                            onVote(post.id, vote);
                                                        } catch { onToast("Failed to submit vote"); }
                                                    }}
                                                    style={{
                                                        flex: 1, padding: "12px", borderRadius: 14, textAlign: "center",
                                                        background: voted ? color : bg,
                                                        border: `2px solid ${voted ? color : border}`,
                                                        color: voted ? "white" : "var(--text-primary)",
                                                        cursor: hasVoted ? "not-allowed" : "pointer",
                                                        transition: "all 0.2s",
                                                        opacity: hasVoted && !voted ? 0.35 : 1,
                                                    }}
                                                >
                                                    <p style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>
                                                        {voted ? "✓ " : ""}{label}
                                                    </p>
                                                </button>
                                            </>
                                        ))}
                                    </div>
                                    <p style={{
                                        fontSize: 11, marginBottom: 0,
                                        fontWeight: hasVoted ? 600 : 400,
                                        color: hasVoted ? "#E91E8C" : "#4A4A62",
                                        fontStyle: hasVoted ? "normal" : "italic",
                                    }}>
                                        {hasVoted ? "🗳️ You've already voted!" : "Tap a side to vote"}
                                    </p>
                                </div>
                            );
                        })()}

                        {post.mediaUrls?.length > 0 && (
                            <div className="flex flex-col gap-2 mb-3">
                                {post.mediaUrls.map((url: string, idx: number) =>
                                    url.endsWith(".mp4") || url.includes("/video/upload/")
                                        ? <video key={idx} src={url} controls className="w-full max-h-[300px] rounded-xl object-cover" />
                                        : <img key={idx} src={url} alt="" className="w-full max-h-[300px] rounded-xl object-cover" />
                                )}
                            </div>
                        )}

                        {post.type === "prediction" && (() => {
                            const predictionOptions = Array.isArray(post.predictionOptions) && post.predictionOptions.length >= 2
                                ? post.predictionOptions
                                : [post.sideA || "Option 1", post.sideB || "Option 2"];
                            const resolvedAt = localResolution?.resolvedAt ?? post.resolvedAt;
                            const closedAt = localResolution?.closedAt ?? post.closedAt;
                            const correctVote = localResolution?.correctVote ?? post.correctVote;
                            const predictionClosed = Boolean(resolvedAt || closedAt || (post.closesAt && post.closesAt <= Date.now()));
                            const correctVoteLabel = getPredictionOptionLabel(correctVote, predictionOptions);
                            return (
                                <div className="mb-3">
                                    {predictionClosed && !resolvedAt && isCurrentUserAuthor() && (
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                                            {predictionOptions.map((label: string, optionIndex: number) => (
                                                <button
                                                    key={`resolve-${label}-${optionIndex}`}
                                                    type="button"
                                                    disabled={resolvingPrediction}
                                                    onClick={(e) => { e.stopPropagation(); resolvePrediction(getPredictionVoteValue(optionIndex)); }}
                                                    style={{
                                                        flex: "1 1 calc(50% - 4px)", minWidth: 0,
                                                        padding: "9px 10px", borderRadius: 12,
                                                        border: "1px solid rgba(34,197,94,0.35)",
                                                        background: "rgba(34,197,94,0.1)", color: "#22c55e",
                                                        fontSize: 12, fontWeight: 800,
                                                        cursor: resolvingPrediction ? "wait" : "pointer",
                                                    }}
                                                >
                                                    Resolve: {label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {resolvedAt && correctVoteLabel && (
                                        <p style={{ fontSize: 11, color: "#22c55e", fontWeight: 800, marginBottom: 8 }}>
                                            Correct answer: {correctVoteLabel}
                                        </p>
                                    )}
                                </div>
                            );
                        })()}

                        {post.type === "hot_take" && (
                            <>
                                <div className="mb-2.5"><SplitBar left={pct} /></div>
                                <div className="flex gap-2 mt-3">
                                    {[
                                        { agree: true, label: "Agree", active: userVote === true, color: "#E91E8C" },
                                        { agree: false, label: "Disagree", active: userVote === false, color: "#FF6B35" },
                                    ].map(({ agree, label, active, color }) => (
                                        <button
                                            key={label}
                                            onClick={() => handleVoteClick(agree)}
                                            className="flex-1 py-3 rounded-full text-[13px] font-bold cursor-pointer transition-all duration-[220ms] border-[2.5px]"
                                            style={{ borderColor: color, background: active ? color : "rgba(255,255,255,0.02)", color: active ? "white" : color }}
                                        >
                                            {active ? `✓ ${label}d` : label}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        <div className="flex items-center mt-4 border-t border-white/[0.06] pt-3">
                            {(post.fan?.username === activeUsername || post.authorUsername === activeUsername) && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm("Delete this post?")) {
                                            onDeletePost?.(post.id, post.roomId);
                                            onClose();
                                        }
                                    }}
                                    className="flex items-center justify-center bg-transparent border-none cursor-pointer text-[#f87171] ml-auto p-1 rounded-full"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Comments header */}
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-[11px] font-extrabold text-white tracking-[0.06em] uppercase">Comments</span>
                        <span className="text-[10px] text-[#9494AD]">{comments.length} total</span>
                    </div>

                    {/* Comments list — threaded via threadSort */}
                    <div className="flex flex-col gap-5 pb-2">
                        {comments.length === 0 ? (
                            <p className="text-[13px] text-[#4A4A62] text-center py-5">No comments yet. Be the first!</p>
                        ) : (
                            threadSort(comments).map((comment) => renderComment(comment))
                        )}
                    </div>
                </div>

                {/* Composer */}
                <div className="shrink-0 bg-[rgba(5,5,8,0.97)] border-t border-[#252538] relative z-10 pb-2">
                    {replyTo && (
                        <div className="flex items-center gap-1.5 px-4 pt-1.5">
                            <span className="text-[11px] text-[#9494AD]">Replying to</span>
                            <span className="inline-flex items-center gap-1 bg-[rgba(233,30,140,0.15)] border border-[rgba(233,30,140,0.35)] rounded-full py-0.5 pl-1.5 pr-2 text-[12px] font-bold text-[#E91E8C] max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap">
                                @{replyTo.authorUsername}
                                <button
                                    onClick={() => { setReplyTo(null); setCommentText(""); }}
                                    className="bg-transparent border-none p-0 cursor-pointer text-[#E91E8C] flex items-center ml-0.5 shrink-0"
                                >
                                    <X size={11} />
                                </button>
                            </span>
                        </div>
                    )}

                    {showMentionPopup && mentionUsers.length > 0 && (
                        <div className="absolute bottom-full left-4 right-4 mb-2 bg-[#181c24] rounded-2xl border border-[rgba(200,112,90,0.2)] overflow-hidden z-20 shadow-[0_8px_32px_rgba(0,0,0,0.4)] max-h-[300px] overflow-y-auto">
                            {mentionUsers.map((user, idx) => {
                                const dn = user.username || user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email?.split("@")[0] || "user";
                                return (
                                    <button
                                        key={user.userId}
                                        onClick={() => insertMention(user)}
                                        onMouseEnter={() => setMentionIndex(idx)}
                                        className={`flex items-center gap-3 px-4 py-2.5 w-full border-none cursor-pointer transition-colors duration-150 ${idx === mentionIndex ? "bg-[rgba(200,112,90,0.15)]" : "bg-transparent"}`}
                                    >
                                        <AvatarWithBadge username={dn} badge="RISING_FAN" size="sm" avatarUrl={user.avatarUrl} />
                                        <div className="flex-1 text-left">
                                            <p className="font-semibold text-[13px] text-white m-0">{dn}</p>
                                            {user.email && <p className="text-[10px] text-[#7a6a65] m-0">{user.email}</p>}
                                        </div>
                                        <User size={14} className="text-[#c8705a]" />
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    <p className="px-5 pt-2 pb-0 m-0 text-[10px] text-[#7a6a65]">Type @ to mention someone</p>
                    <div className="flex gap-2 items-center px-4 pt-1.5 pb-1">
                        <AvatarWithBadge username={userUsername} badge={userBadge} size="sm" avatarUrl={userAvatarUrl} />
                        <div className="flex-1">
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder={replyTo ? "Write your reply…" : "Share your opinion..."}
                                value={commentText}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                className="w-full h-11 rounded-full bg-white/[0.04] border border-white/[0.12] pl-4 pr-4 text-white text-[16px] outline-none placeholder:text-[#8A8AA9] transition-colors duration-150 focus:border-[#E91E8C]/60 focus:bg-white/[0.08]"
                            />
                        </div>
                        <button
                            onClick={submitComment}
                            disabled={loading || !canSubmit}
                            className={`w-[38px] h-[38px] rounded-full bg-[#E91E8C] border-none text-white flex items-center justify-center shrink-0 transition-opacity duration-200 ${canSubmit ? "cursor-pointer opacity-100" : "cursor-default opacity-50"}`}
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : "↑"}
                        </button>
                    </div>
                </div>

                <ReactionsDialog
                    postId={reactionsDialogCommentId ?? ""}
                    isOpen={reactionsDialogCommentId !== null}
                    onClose={() => setReactionsDialogCommentId(null)}
                    onFanProfile={onFanProfileClick}
                    roomId={post.roomId}
                    msgId={post.id}
                    commentId={reactionsDialogCommentId ?? undefined}
                />
            </div>
        </AnimatePresence>
    );
}