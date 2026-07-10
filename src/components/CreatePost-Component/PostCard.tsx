
// //CreatePost-Componnet/PostCard.tsx

// "use client";

// import { useEffect, useState, useCallback, useRef } from "react";
// import Image from "next/image";
// import axios from "axios";
// import {
//     MessageCircle,
//     MoreHorizontal,
//     Trash2,
//     Repeat2,
//     Share,
//     CheckCircle2,
//     User,
//     Quote,
//     Flag,
//     ThumbsUp,
//     ThumbsDown,
//     X,
//     AlertTriangle,
//     Heart,
// } from "lucide-react";
// import type { Post } from "@/types/PostPolls";
// import PostLikeButton from "./Postlikebutton";
// import CommentsSection from "./Commentssection";
// import ReactionsModal from "./Reactionsmodal";
// import RepostModal from "./Repostmodal";

// type ReactionId = "like" | "love" | "haha" | "wow" | "sad" | "angry";
// type VotedByEntry = { voterId: string; userName: string } | string;

// type ReportReason =
//     | "illegal_content"
//     | "indecent_content"
//     | "irrelevant_content"
//     | "misleading_information"
//     | "offensive_content";

// const REPORT_REASONS: { id: ReportReason; label: string }[] = [
//     { id: "illegal_content",        label: "Illegal content e.g. drugs, weapons" },
//     { id: "indecent_content",       label: "Indecent content" },
//     { id: "irrelevant_content",     label: "Irrelevant content e.g. politics, religion" },
//     { id: "misleading_information", label: "Misleading or false information" },
//     { id: "offensive_content",      label: "Offensive or hateful content" },
// ];

// const REACTION_EMOJIS: Record<ReactionId, string> = {
//     like:  "👍",
//     love:  "❤️",
//     haha:  "😂",
//     wow:   "😮",
//     sad:   "😢",
//     angry: "😡",
// };

// const REACTION_IDS: ReactionId[] = ["like", "love", "haha", "wow", "sad", "angry"];

// const ProfilePlaceholder = ({ size = 40 }: { size?: number }) => (
//     <div
//         className="bg-gradient-to-br from-[#C9115F] to-[#e8185a] rounded-full flex items-center justify-center text-white shadow-inner flex-shrink-0"
//         style={{ width: `${size}px`, height: `${size}px` }}
//     >
//         <User style={{ width: size * 0.4, height: size * 0.4 }} />
//     </div>
// );

// const formatTimeAgo = (timestamp: number): string => {
//     const diff = Date.now() - timestamp;
//     const s = Math.floor(diff / 1000);
//     const m = Math.floor(s / 60);
//     const h = Math.floor(m / 60);
//     const d = Math.floor(h / 24);
//     if (d > 0) return `${d}d ago`;
//     if (h > 0) return `${h}h ago`;
//     if (m > 0) return `${m}m ago`;
//     return `${s}s ago`;
// };

// interface Props {
//     post: Post;
//     postMap?: Record<string, Post>;
//     onLike?: (postId: string, userId: string, reaction?: ReactionId) => void;
//     onDelete?: (id: string) => Promise<void>;
//     onVote?: (postId: string, optionId: string, voterId: string, userName: string) => Promise<void>;
//     onRepost?: (postId: string) => Promise<void>;
//     onQuoteRepost?: (postId: string, quoteText: string) => Promise<void>;
//     currentUserId?: string;
//     currentUserName?: string;
//     onCommentAdded?: (postId: string) => void;
//     onCommentDeleted?: (postId: string) => void;
// }

// export default function PostCard({
//     post,
//     postMap,
//     onLike,
//     onDelete,
//     onVote,
//     onRepost,
//     onQuoteRepost,
//     currentUserId,
//     currentUserName = "Anonymous",
//     onCommentAdded,
//     onCommentDeleted,
// }: Props) {
//     const [showComments, setShowComments] = useState(false);
//     const [showMenu, setShowMenu] = useState(false);
//     const menuRef = useRef<HTMLDivElement>(null);
//     const [showShareDialog, setShowShareDialog] = useState(false);
//     const [copied, setCopied] = useState(false);
//     const [deleting, setDeleting] = useState(false);
//     const [localPoll, setLocalPoll] = useState(post.poll);

//     const [showReactionsModal, setShowReactionsModal] = useState(false);
//     const [showRepostModal, setShowRepostModal] = useState(false);

//     // ── Emoji picker state ────────────────────────────────────────────────────
//     const [showEmojiPicker, setShowEmojiPicker] = useState(false);
//     const emojiHideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

//     // ── Report modal state ────────────────────────────────────────────────────
//     const [showReportModal, setShowReportModal] = useState(false);
//     const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
//     const [reporting, setReporting] = useState(false);
//     const [reportDone, setReportDone] = useState(false);

//     // ── Preference state ──────────────────────────────────────────────────────
//     const [preferenceAction, setPreferenceAction] = useState<"suggest_more" | "suggest_less" | null>(null);
//     const [preferenceToast, setPreferenceToast] = useState<string | null>(null);

//     const [localCommentCount, setLocalCommentCount] = useState<number | null>(
//         typeof post.commentCount === "number" ? post.commentCount : null
//     );
//     const [localLikes, setLocalLikes] = useState(post.likes || 0);
//     const [localLikedBy, setLocalLikedBy] = useState<string[]>(post.likedBy || []);
//     const [localReactions, setLocalReactions] = useState<Record<string, string>>(
//         (post.reactions as Record<string, string>) || {}
//     );
//     const [localRepostCount, setLocalRepostCount] = useState(post.repostCount || 0);
//     const [hasReposted, setHasReposted] = useState(
//         !!(post.repostedBy as string[] | undefined)?.includes(currentUserId ?? "")
//     );

//     const isOwner = (() => {
//         if (!currentUserId?.trim()) return false;
//         const cid = currentUserId.trim().toLowerCase();
//         const uid = (post.userId ?? "").trim().toLowerCase();
//         const email = (post.userEmail ?? "").trim().toLowerCase();
//         return cid === uid || cid === email;
//     })();

//     // Close menu on outside click
//     useEffect(() => {
//         if (!showMenu) return;
//         const handler = (e: MouseEvent) => {
//             if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
//                 setShowMenu(false);
//             }
//         };
//         document.addEventListener("mousedown", handler);
//         return () => document.removeEventListener("mousedown", handler);
//     }, [showMenu]);

//     // Emoji picker hover helpers — delay hide so cursor can travel to picker
//     const handleEmojiEnter = () => {
//         if (emojiHideTimeout.current) clearTimeout(emojiHideTimeout.current);
//         setShowEmojiPicker(true);
//     };
//     const handleEmojiLeave = () => {
//         emojiHideTimeout.current = setTimeout(() => setShowEmojiPicker(false), 180);
//     };

//     const isPlainRepost = post.isRepost && !post.isQuoteRepost;
//     const originalPost = isPlainRepost
//         ? post.quotedPost ?? postMap?.[post.originalPostId ?? ""] ?? null
//         : null;
//     const displayedAuthorName = originalPost?.userName ?? post.userName;
//     const displayedCreatedAt  = originalPost?.createdAt  ?? post.createdAt;
//     const displayedContent    = originalPost?.content    ?? post.content;
//     const displayedMedia      = originalPost?.media      ?? post.media;

//     const handleDelete = async () => {
//         if (!post.id) return;
//         if (!confirm("Are you sure you want to delete this post?")) return;
//         setDeleting(true);
//         setShowMenu(false);
//         try {
//             if (onDelete) await onDelete(post.id);
//             else await axios.delete(`/api/createpost/${post.id}`);
//         } catch (error) {
//             console.error("Failed to delete post:", error);
//             alert("Failed to delete post. Please try again.");
//         } finally {
//             setDeleting(false);
//         }
//     };

//     const openReportModal = () => {
//         setShowMenu(false);
//         setSelectedReason(null);
//         setReportDone(false);
//         setShowReportModal(true);
//     };

//     const handleSubmitReport = async () => {
//         if (!selectedReason || !post.id || !currentUserId) return;
//         setReporting(true);
//         try {
//             await axios.post("/api/post-report", {
//                 postId: post.id,
//                 reporterId: currentUserId,
//                 reporterName: currentUserName,
//                 reason: selectedReason,
//             });
//             setReportDone(true);
//         } catch (err: unknown) {
//             const msg = axios.isAxiosError(err) && err.response?.data?.error
//                 ? err.response.data.error
//                 : "Failed to submit report. Please try again.";
//             alert(msg);
//         } finally {
//             setReporting(false);
//         }
//     };

//     const handlePreference = async (action: "suggest_more" | "suggest_less") => {
//         if (!post.id || !currentUserId) return;
//         setShowMenu(false);
//         try {
//             const res = await axios.post("/api/post-preference", { postId: post.id, userId: currentUserId, action });
//             setPreferenceAction(action);
//             setPreferenceToast(res.data?.message ?? (action === "suggest_more" ? "You'll see more posts like this." : "You'll see fewer posts like this."));
//             setTimeout(() => setPreferenceToast(null), 3000);
//         } catch (err) {
//             console.error("Failed to save preference:", err);
//         }
//     };

//     const openShareDialog  = () => { setShowShareDialog(true); setCopied(false); };
//     const closeShareDialog = () => { setShowShareDialog(false); setCopied(false); };

//     const copyToClipboard = async (text: string) => {
//         try { await navigator.clipboard.writeText(text); return true; }
//         catch {
//             try {
//                 const el = document.createElement("textarea");
//                 el.value = text;
//                 el.style.cssText = "position:fixed;opacity:0";
//                 document.body.appendChild(el);
//                 el.focus(); el.select();
//                 const ok = document.execCommand("copy");
//                 document.body.removeChild(el);
//                 return ok;
//             } catch { return false; }
//         }
//     };

//     const buildPostShareUrl  = () => typeof window !== "undefined"
//         ? `${window.location.origin}${window.location.pathname}${window.location.search}` : "";
//     const buildPostShareText = () =>
//         [(post.content?.trim() || "Check out this post"), `View post: ${buildPostShareUrl()}`].join("\n");

//     const handleShareToWhatsApp  = () => { const url = `whatsapp://send?text=${encodeURIComponent(buildPostShareText())}`; const opened = window.open(url, "_self"); if (!opened) window.location.href = `https://wa.me/?text=${encodeURIComponent(buildPostShareText())}`; };
//     const handleShareToThreads   = () => window.open(`https://www.threads.net/intent/post?text=${encodeURIComponent(buildPostShareText())}`, "_blank", "noopener,noreferrer");
//     const handleShareToInstagram = async () => { await copyToClipboard(buildPostShareText()); setCopied(true); window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer"); setTimeout(() => setCopied(false), 1600); };
//     const handleShareToLinkedIn  = () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(buildPostShareUrl())}`, "_blank", "noopener,noreferrer");
//     const handleShareToX         = () => window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(buildPostShareText())}`, "_blank", "noopener,noreferrer");
//     const handleCopyLink = async () => { const ok = await copyToClipboard(buildPostShareText()); if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1600); } };

//     const shareButtons = (size: string) => (
//         <>
//             {[
//                 { handler: handleShareToWhatsApp,  src: "/images/share_whatsapp.png",  alt: "WhatsApp"  },
//                 { handler: handleShareToThreads,   src: "/images/share_thread.png",    alt: "Threads"   },
//                 { handler: handleShareToInstagram, src: "/images/share_insta.png",     alt: "Instagram" },
//                 { handler: handleShareToLinkedIn,  src: "/images/Share_linkedin.png",  alt: "LinkedIn"  },
//                 { handler: handleShareToX,         src: "/images/Share_X.png",         alt: "X"         },
//                 { handler: handleCopyLink,         src: "/images/share_copy_link.png", alt: "Copy"      },
//             ].map(({ handler, src, alt }) => (
//                 <button key={alt} onClick={handler}
//                     className={`${size} shrink-0 rounded-full overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center`}
//                     aria-label={`Share on ${alt}`}
//                 >
//                     <img src={src} alt={alt} className="w-full h-full object-cover rounded-full" />
//                 </button>
//             ))}
//         </>
//     );

//     useEffect(() => {
//         if (typeof post.commentCount === "number") setLocalCommentCount(post.commentCount);
//     }, [post.commentCount]);

//     useEffect(() => {
//         setLocalLikes(post.likes || 0);
//         setLocalLikedBy(post.likedBy || []);
//         setLocalRepostCount(post.repostCount || 0);
//         setLocalReactions((prev) => {
//             const incoming = (post.reactions as Record<string, string>) || {};
//             if (!currentUserId) return incoming;
//             const merged = { ...incoming };
//             if (prev[currentUserId] && !incoming[currentUserId]) merged[currentUserId] = prev[currentUserId];
//             return merged;
//         });
//     }, [post.likes, post.likedBy, post.reactions, post.repostCount, currentUserId]);

//     useEffect(() => {
//         if (!post.id || localCommentCount !== null) return;
//         const controller = new AbortController();
//         let canceled = false;
//         (async () => {
//             try {
//                 const res = await axios.get(`/api/comments?contentId=${post.id}&contentType=post&limit=1`, { signal: controller.signal });
//                 const total = res.data?.pagination?.total ?? (Array.isArray(res.data?.comments) ? res.data.comments.length : null);
//                 if (!canceled && typeof total === "number") setLocalCommentCount(total);
//             } catch { /* ignore */ }
//         })();
//         return () => { canceled = true; controller.abort(); };
//     }, [post.id, localCommentCount]);

//     const hasVoted =
//         Array.isArray(localPoll?.votedBy) &&
//         localPoll.votedBy.some((v: VotedByEntry) =>
//             typeof v === "string" ? v === currentUserId : v.voterId === currentUserId
//         );

//     const handleVote = (optionId: string) => {
//         if (!post.id || !onVote || !currentUserId || hasVoted) return;
//         if (localPoll) {
//             setLocalPoll({
//                 ...localPoll,
//                 totalVotes: (localPoll.totalVotes ?? 0) + 1,
//                 options: localPoll.options.map((opt) =>
//                     opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
//                 ),
//                 votedBy: [...(localPoll.votedBy ?? []), { voterId: currentUserId, userName: currentUserName }],
//             });
//         }
//         onVote(post.id, optionId, currentUserId, currentUserName);
//     };

//     const handleCommentCountLoaded = useCallback((count: number) => {
//         setLocalCommentCount((prev) => (prev === null ? count : prev));
//     }, []);
//     const handleCommentAdded = useCallback(() => {
//         setLocalCommentCount((prev) => (prev === null ? 1 : prev + 1));
//         onCommentAdded?.(post.id!);
//     }, [onCommentAdded, post.id]);
//     const handleCommentDeleted = useCallback(() => {
//         setLocalCommentCount((prev) => (prev === null ? 0 : Math.max(0, prev - 1)));
//         onCommentDeleted?.(post.id!);
//     }, [onCommentDeleted, post.id]);

//     const handleReactionToggle = (postId: string, userId: string, reaction?: ReactionId) => {
//         if (!currentUserId) return;
//         const wasLiked = localLikedBy.includes(currentUserId);
//         if (!reaction) {
//             setLocalLikedBy((prev) => prev.filter((id) => id !== currentUserId));
//             setLocalLikes((prev) => Math.max(0, prev - 1));
//             setLocalReactions((prev) => { const next = { ...prev }; delete next[currentUserId]; return next; });
//         } else {
//             if (!wasLiked) { setLocalLikedBy((prev) => [...prev, currentUserId]); setLocalLikes((prev) => prev + 1); }
//             setLocalReactions((prev) => ({ ...prev, [currentUserId]: reaction }));
//         }
//         onLike?.(postId, userId, reaction);
//     };

//     // Direct emoji reaction from picker
//     const handleEmojiReaction = (reaction: ReactionId) => {
//         if (!post.id || !currentUserId) return;
//         setShowEmojiPicker(false);
//         if (emojiHideTimeout.current) clearTimeout(emojiHideTimeout.current);
//         handleReactionToggle(post.id, currentUserId, reaction);
//     };

//     const handleRepost = async (postId: string) => {
//         if (!onRepost) return;
//         setHasReposted(true);
//         setLocalRepostCount((prev) => prev + 1);
//         try { await onRepost(postId); }
//         catch { setHasReposted(false); setLocalRepostCount((prev) => Math.max(0, prev - 1)); }
//     };

//     const handleQuoteRepost = async (postId: string, quoteText: string) => {
//         if (!onQuoteRepost) return;
//         await onQuoteRepost(postId, quoteText);
//         setLocalRepostCount((prev) => prev + 1);
//     };

//     const reactionSummary = (() => {
//         if (localLikes === 0) return null;
//         const counts: Record<string, number> = {};
//         Object.values(localReactions).forEach((r) => { counts[r] = (counts[r] || 0) + 1; });
//         const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([id]) => REACTION_EMOJIS[id as ReactionId] || "👍");
//         if (sorted.length === 0) sorted.push("👍");
//         return sorted;
//     })();

//     const commentCountDisplay = localCommentCount !== null ? localCommentCount : null;

//     // Derived display state for like button
//     const isLiked = currentUserId ? localLikedBy.includes(currentUserId) : false;
//     const currentUserReaction = currentUserId ? (localReactions[currentUserId] as ReactionId | undefined) : undefined;

//     return (
//         <div className="bg-white/5 rounded-2xl p-4 border border-white/10 hover:bg-white/[0.08] transition-all duration-200">

//             {/* Repost / quote banners */}
//             {post.isQuoteRepost && post.quotedPost && (
//                 <div className="flex items-center gap-1.5 mb-2 text-white/40 text-xs">
//                     <Quote className="w-3 h-3" />
//                     <span>{post.userName} quoted a post</span>
//                 </div>
//             )}
//             {post.isRepost && !post.isQuoteRepost && (
//                 <div className="flex items-center gap-1.5 mb-2 text-green-400/70 text-xs">
//                     <Repeat2 className="w-3 h-3" />
//                     <span>
//                         {currentUserId && (post.repostedBy as string[] | undefined)?.includes(currentUserId)
//                             ? `You reposted ${originalPost?.userName ?? post.userName}'s post`
//                             : `${post.userName} reposted`}
//                     </span>
//                 </div>
//             )}

//             {/* ── Header ── */}
//             <div className="flex items-start justify-between mb-3">
//                 <div className="flex items-center gap-3">
//                     <ProfilePlaceholder size={40} />
//                     <div>
//                         <p className="text-white font-semibold text-sm">{displayedAuthorName}</p>
//                         <div className="flex items-center gap-2">
//                             <span className="text-white/20 text-xs">•</span>
//                             <p className="text-white/30 text-xs">{formatTimeAgo(displayedCreatedAt)}</p>
//                         </div>
//                     </div>
//                 </div>

//                 {/* ── Three-dot menu ── */}
//                 {currentUserId && (
//                     <div className="relative" ref={menuRef}>
//                         <button
//                             onClick={() => setShowMenu((v) => !v)}
//                             disabled={deleting}
//                             className="w-8 h-8 rounded-full hover:bg-white/10 transition-colors flex items-center justify-center"
//                             aria-label="Post options"
//                         >
//                             <MoreHorizontal className="w-5 h-5 text-white/60" />
//                         </button>

//                         {showMenu && (
//                             <div className="absolute right-0 top-10 z-30 bg-[#1a1a1a] rounded-xl shadow-2xl border border-white/10 overflow-hidden min-w-[210px]">
//                                 {isOwner ? (
//                                     <button
//                                         onClick={handleDelete}
//                                         disabled={deleting}
//                                         className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2.5"
//                                     >
//                                         <Trash2 className="w-4 h-4 shrink-0" />
//                                         {deleting ? "Deleting…" : "Delete Post"}
//                                     </button>
//                                 ) : (
//                                     <>
//                                         <button
//                                             onClick={openReportModal}
//                                             className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2.5"
//                                         >
//                                             <Flag className="w-4 h-4 shrink-0" />
//                                             Report
//                                         </button>
//                                         <div className="h-px bg-white/8 mx-3" />
//                                         <button
//                                             onClick={() => handlePreference("suggest_more")}
//                                             disabled={preferenceAction === "suggest_more"}
//                                             className={`w-full px-4 py-3 text-left text-sm transition-colors flex items-center gap-2.5
//                                                 ${preferenceAction === "suggest_more"
//                                                     ? "text-[#C9115F] bg-[#C9115F]/10 cursor-default"
//                                                     : "text-white/70 hover:bg-white/10"}`}
//                                         >
//                                             <ThumbsUp className="w-4 h-4 shrink-0" />
//                                             Suggest more like this
//                                         </button>
//                                         <button
//                                             onClick={() => handlePreference("suggest_less")}
//                                             disabled={preferenceAction === "suggest_less"}
//                                             className={`w-full px-4 py-3 text-left text-sm transition-colors flex items-center gap-2.5
//                                                 ${preferenceAction === "suggest_less"
//                                                     ? "text-white/50 bg-white/5 cursor-default"
//                                                     : "text-white/70 hover:bg-white/10"}`}
//                                         >
//                                             <ThumbsDown className="w-4 h-4 shrink-0" />
//                                             Suggest less like this
//                                         </button>
//                                     </>
//                                 )}
//                             </div>
//                         )}
//                     </div>
//                 )}
//             </div>

//             {/* Content */}
//             {displayedContent && (
//                 <p className="text-white text-sm mb-3 leading-relaxed">{displayedContent}</p>
//             )}

//             {/* Media */}
//             {displayedMedia && displayedMedia.length > 0 && (
//                 <div className={`mb-3 grid gap-2 ${displayedMedia.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
//                     {displayedMedia.map((item, idx) => (
//                         <div key={idx} className="relative rounded-xl overflow-hidden bg-zinc-800" style={{ aspectRatio: "56/25" }}>
//                             {item.type === "image" ? (
//                                 <Image src={item.url} alt={item.name || `media-${idx}`} fill
//                                     className="object-contain cursor-pointer hover:scale-105 transition-transform duration-300"
//                                     onClick={() => window.open(item.url, "_blank")}
//                                 />
//                             ) : (
//                                 <video src={item.url} className="w-full h-full object-cover" controls preload="metadata" />
//                             )}
//                         </div>
//                     ))}
//                 </div>
//             )}

//             {/* Quoted post embed */}
//             {post.quotedPost && post.isQuoteRepost && (
//                 <div className="mb-3 rounded-xl border border-white/10 bg-white/5 p-3">
//                     <div className="flex items-center gap-2 mb-2">
//                         <ProfilePlaceholder size={22} />
//                         <span className="text-white/70 text-xs font-medium">{post.quotedPost.userName}</span>
//                         <span className="text-white/25 text-xs">·</span>
//                         <span className="text-white/25 text-xs">{formatTimeAgo(post.quotedPost.createdAt)}</span>
//                     </div>
//                     {post.quotedPost.content && (
//                         <p className="text-white/55 text-xs leading-relaxed line-clamp-4">{post.quotedPost.content}</p>
//                     )}
//                     {post.quotedPost.media && post.quotedPost.media.length > 0 && (
//                         <div className="mt-2 rounded-lg overflow-hidden bg-black/30 max-h-24">
//                             <img src={post.quotedPost.media[0].url} alt="quoted media" className="w-full h-full object-cover" />
//                         </div>
//                     )}
//                 </div>
//             )}

//             {/* Poll */}
//             {localPoll && localPoll.options && localPoll.options.length > 0 && (
//                 <div className="mb-3 bg-white/5 rounded-xl p-3 border border-white/10">
//                     {hasVoted && (
//                         <div className="flex items-center gap-1.5 mb-2 text-[#C9115F] text-xs">
//                             <CheckCircle2 className="w-3.5 h-3.5" /><span>You voted</span>
//                         </div>
//                     )}
//                     <div className="space-y-2">
//                         {localPoll.options.map((option) => {
//                             const total = localPoll.totalVotes ?? 0;
//                             const pct = total > 0 ? (option.votes / total) * 100 : 0;
//                             const ended = (localPoll.endsAt ?? 0) < Date.now();
//                             return (
//                                 <button key={option.id} onClick={() => handleVote(option.id)}
//                                     disabled={ended || hasVoted}
//                                     className={`w-full relative transition-opacity ${ended || hasVoted ? "cursor-not-allowed opacity-80" : "hover:opacity-90"}`}
//                                 >
//                                     <div className="relative bg-white/10 rounded-lg overflow-hidden">
//                                         <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#C9115F]/30 to-[#e8185a]/30 rounded-lg transition-all duration-300" style={{ width: `${pct}%` }} />
//                                         <div className="relative px-3 py-2 flex justify-between items-center">
//                                             <span className="text-white text-sm">{option.text}</span>
//                                             <span className="text-white/50 text-xs">{pct.toFixed(0)}% ({option.votes})</span>
//                                         </div>
//                                     </div>
//                                 </button>
//                             );
//                         })}
//                     </div>
//                     <div className="mt-2 text-xs text-white/30 text-center">
//                         {(localPoll.endsAt ?? 0) < Date.now() ? "Poll ended" : `${localPoll.totalVotes ?? 0} votes`}
//                     </div>
//                 </div>
//             )}

//             {/* Reaction summary */}
//             {reactionSummary && reactionSummary.length > 0 && (
//                 <button onClick={() => setShowReactionsModal(true)} className="flex items-center gap-1.5 mb-2 group" aria-label="See reactions">
//                     <div className="flex -space-x-1">
//                         {reactionSummary.map((emoji, i) => (
//                             <span key={i} className="text-sm leading-none w-5 h-5 flex items-center justify-center rounded-full bg-white/10 border border-white/5 ring-1 ring-[#111]"
//                                 style={{ zIndex: reactionSummary.length - i }}>{emoji}</span>
//                         ))}
//                     </div>
//                     <span className="text-white/40 text-xs group-hover:text-white/70 transition-colors tabular-nums">
//                         {localLikes > 0 ? localLikes : ""}
//                     </span>
//                 </button>
//             )}

//             {/* ── Action bar ── */}
//             <div className="flex items-center justify-between mt-1 pt-3 border-t border-white/8 flex-nowrap gap-1 min-w-0">

//                 {/* ── Like + Emoji Picker ── */}
//                 <div
//                     className="relative flex-shrink-0"
//                     onMouseEnter={handleEmojiEnter}
//                     onMouseLeave={handleEmojiLeave}
//                 >
//                     {/* Floating emoji picker — appears above on hover */}
//                     {showEmojiPicker && (
//                         <div
//                             onMouseEnter={handleEmojiEnter}
//                             onMouseLeave={handleEmojiLeave}
//                             className="absolute bottom-[calc(100%+8px)] left-0 z-50 flex items-center gap-0.5 bg-[#1c1c1f] border border-white/[0.12] rounded-full px-2.5 py-1.5 shadow-2xl"
//                             style={{ whiteSpace: "nowrap" }}
//                         >
//                             {REACTION_IDS.map((r) => (
//                                 <button
//                                     key={r}
//                                     onMouseDown={(e) => { e.preventDefault(); handleEmojiReaction(r); }}
//                                     className={`text-xl w-9 h-9 flex items-center justify-center rounded-full transition-transform duration-150 hover:scale-[1.3] hover:bg-white/10 ${currentUserReaction === r ? "bg-white/10 scale-110 ring-2 ring-[#C9115F]/50" : ""}`}
//                                     aria-label={r}
//                                     title={r}
//                                 >
//                                     {REACTION_EMOJIS[r]}
//                                 </button>
//                             ))}
//                         </div>
//                     )}

//                     {/* PostLikeButton unchanged — just wrapped for hover area */}
//                     <PostLikeButton
//                         postId={post.id ?? ""}
//                         likes={localLikes}
//                         likedBy={localLikedBy}
//                         reactions={localReactions}
//                         onToggle={handleReactionToggle}
//                     />
//                 </div>

//                 {/* ── Comment ── */}
//                 <button
//                     onClick={() => setShowComments((v) => !v)}
//                     className={`flex-shrink-0 flex items-center gap-1 px-2 py-1.5 rounded-lg transition-colors hover:bg-white/8 ${showComments ? "text-[#C9115F]" : "text-white/40 hover:text-white/70"}`}
//                 >
//                     <MessageCircle className="w-4 h-4 shrink-0" />
//                     {commentCountDisplay !== null && (
//                         <span className="tabular-nums text-sm">{commentCountDisplay}</span>
//                     )}
//                 </button>

//                 {/* ── Repost ── */}
//                 <button
//                     onClick={() => setShowRepostModal(true)}
//                     className={`flex-shrink-0 flex items-center gap-1 px-2 py-1.5 rounded-lg transition-colors hover:bg-white/8 ${hasReposted ? "text-green-400 hover:text-green-300" : "text-white/40 hover:text-green-400"}`}
//                     title={hasReposted ? "Already reposted" : "Repost or Quote"}
//                 >
//                     <Repeat2 className="w-5 h-5 shrink-0" />
//                     {localRepostCount > 0 && (
//                         <span className="tabular-nums text-sm">{localRepostCount}</span>
//                     )}
//                 </button>

//                 {/* ── Share ── */}
//                 <button
//                     onClick={openShareDialog}
//                     className="flex-shrink-0 flex items-center gap-1 px-2 py-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/8 transition-colors"
//                 >
//                     <Share className="w-4 h-4 shrink-0" />
//                     <span className="text-sm whitespace-nowrap">Share</span>
//                 </button>
//             </div>

//             {/* Share dialog */}
//             {showShareDialog && (
//                 <>
//                     <button type="button" className="fixed inset-0 z-40 bg-black/70 lg:hidden" onClick={closeShareDialog} />
//                     <div className="fixed bottom-16 inset-x-4 z-50 mx-auto w-full max-w-[280px] rounded-2xl border border-white/10 bg-[#1a1a1e] p-3 shadow-2xl lg:hidden" onClick={(e) => e.stopPropagation()}>
//                         <div className="flex items-center justify-between mb-2">
//                             <p className="text-white text-sm font-semibold">Share</p>
//                             <button onClick={closeShareDialog} className="text-gray-400 hover:text-white"><svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg></button>
//                         </div>
//                         <div className="flex flex-row flex-nowrap items-center gap-1.5 mb-2 overflow-x-auto">{shareButtons("w-8 h-8")}</div>
//                         {copied && <p className="text-xs text-emerald-400">Copied to clipboard</p>}
//                     </div>
//                     <div className="hidden lg:flex fixed inset-0 z-50 items-center justify-center bg-black/60" onClick={closeShareDialog}>
//                         <div className="bg-[#1a1a1e] rounded-2xl border border-white/10 p-4 w-[300px] shadow-2xl" onClick={(e) => e.stopPropagation()}>
//                             <div className="flex items-center justify-between mb-3">
//                                 <p className="text-white text-sm font-semibold">Share Post</p>
//                                 <button onClick={closeShareDialog} className="text-gray-400 hover:text-white"><svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg></button>
//                             </div>
//                             <div className="rounded-xl border border-white/10 bg-[#111114] p-3 mb-3">
//                                 <p className="text-white text-sm font-semibold line-clamp-2">{post.content?.slice(0, 60) || "Post"}</p>
//                                 <p className="text-white/45 text-[11px] mt-2 line-clamp-2 break-all">{buildPostShareUrl()}</p>
//                             </div>
//                             <div className="flex flex-row flex-nowrap items-center gap-2 mb-2">{shareButtons("w-9 h-9")}</div>
//                             {copied && <p className="text-xs text-emerald-400">Copied to clipboard</p>}
//                         </div>
//                     </div>
//                 </>
//             )}

//             {/* Comments */}
//             {showComments && post.id && (
//                 <div className="mt-4 pt-4 border-t border-white/8">
//                     <CommentsSection
//                         contentId={post.id}
//                         contentType="post"
//                         contentTitle={post.content?.slice(0, 100) || "Post"}
//                         onCommentAdded={handleCommentAdded}
//                         onCommentDeleted={handleCommentDeleted}
//                         onCommentCountLoaded={handleCommentCountLoaded}
//                     />
//                 </div>
//             )}

//             <ReactionsModal
//                 open={showReactionsModal}
//                 onClose={() => setShowReactionsModal(false)}
//                 reactions={localReactions}
//                 totalLikes={localLikes}
//             />

//             <RepostModal
//                 open={showRepostModal}
//                 onClose={() => setShowRepostModal(false)}
//                 post={post}
//                 currentUserId={currentUserId ?? ""}
//                 currentUserName={currentUserName}
//                 onRepost={handleRepost}
//                 onQuoteRepost={handleQuoteRepost}
//                 hasReposted={hasReposted}
//             />

//             {/* Preference toast */}
//             {preferenceToast && (
//                 <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1a1a1e] border border-white/10 rounded-xl px-4 py-2.5 shadow-xl flex items-center gap-2 text-sm text-white/80 animate-fade-in">
//                     {preferenceAction === "suggest_more"
//                         ? <ThumbsUp className="w-4 h-4 text-[#C9115F]" />
//                         : <ThumbsDown className="w-4 h-4 text-white/50" />}
//                     {preferenceToast}
//                 </div>
//             )}

//             {/* Report Modal */}
//             {showReportModal && (
//                 <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 px-4 pb-4 sm:pb-0"
//                     onClick={(e) => { if (e.target === e.currentTarget) setShowReportModal(false); }}>
//                     <div className="w-full max-w-sm bg-[#1a1a1e] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
//                         <div className="flex justify-center pt-3 pb-1 sm:hidden">
//                             <div className="w-9 h-1 rounded-full bg-white/20" />
//                         </div>
//                         <div className="flex items-center justify-between px-5 pt-4 pb-2">
//                             <div className="flex items-center gap-2">
//                                 <AlertTriangle className="w-4 h-4 text-red-400" />
//                                 <h2 className="text-white font-semibold text-base">Report a post</h2>
//                             </div>
//                             <button onClick={() => setShowReportModal(false)} className="p-1 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors">
//                                 <X className="w-4 h-4" />
//                             </button>
//                         </div>

//                         {!reportDone ? (
//                             <>
//                                 <p className="text-white/40 text-xs px-5 pb-4 leading-relaxed">
//                                     We&apos;ll assess the post according to the guidelines before taking any action. Your report is anonymous.
//                                 </p>
//                                 <div className="px-3 pb-3 space-y-1">
//                                     {REPORT_REASONS.map((r) => (
//                                         <button
//                                             key={r.id}
//                                             onClick={() => setSelectedReason(r.id)}
//                                             className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm transition-colors text-left
//                                                 ${selectedReason === r.id ? "bg-red-500/10 text-white" : "text-white/70 hover:bg-white/5"}`}
//                                         >
//                                             <span>{r.label}</span>
//                                             <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-3 transition-colors
//                                                 ${selectedReason === r.id ? "border-red-400 bg-red-400" : "border-white/25"}`}>
//                                                 {selectedReason === r.id && <span className="w-2 h-2 rounded-full bg-white" />}
//                                             </span>
//                                         </button>
//                                     ))}
//                                 </div>
//                                 <div className="px-4 pb-5 pt-1">
//                                     <button
//                                         onClick={handleSubmitReport}
//                                         disabled={!selectedReason || reporting}
//                                         className={`w-full py-3 rounded-xl font-semibold text-sm transition-all
//                                             ${selectedReason && !reporting
//                                                 ? "bg-white text-[#111] hover:bg-white/90 active:scale-[0.98]"
//                                                 : "bg-white/10 text-white/30 cursor-not-allowed"}`}
//                                     >
//                                         {reporting ? "Submitting…" : "Report"}
//                                     </button>
//                                 </div>
//                             </>
//                         ) : (
//                             <div className="flex flex-col items-center gap-3 px-6 pb-8 pt-4 text-center">
//                                 <div className="w-14 h-14 rounded-full bg-red-500/15 flex items-center justify-center">
//                                     <CheckCircle2 className="w-7 h-7 text-red-400" />
//                                 </div>
//                                 <h3 className="text-white font-semibold">Report submitted</h3>
//                                 <p className="text-white/45 text-sm leading-relaxed">
//                                     Thank you for helping keep the community safe. We&apos;ll review this post and take action if needed.
//                                 </p>
//                                 <button
//                                     onClick={() => setShowReportModal(false)}
//                                     className="mt-2 w-full py-3 rounded-xl bg-white/10 text-white/70 text-sm font-medium hover:bg-white/15 transition-colors"
//                                 >
//                                     Done
//                                 </button>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }



//CreatePost-Component/PostCard.tsx

"use client";

import { useEffect, useState, useCallback, useRef, useLayoutEffect } from "react";
import Image from "next/image";
import axios from "axios";
import {
    MessageCircle, MoreHorizontal, Trash2, Repeat2, Share,
    CheckCircle2, User, Quote, Flag, ThumbsUp, ThumbsDown,
    X, AlertTriangle, Heart,
} from "lucide-react";
import type { Post } from "@/types/PostPolls";
import CommentsSection from "./Commentssection";
import ReactionsModal from "./Reactionsmodal";
import RepostModal from "./Repostmodal";

type ReactionId = "like" | "love" | "haha" | "wow" | "sad" | "angry";
type VotedByEntry = { voterId: string; userName: string } | string;
type ReportReason =
    | "illegal_content" | "indecent_content" | "irrelevant_content"
    | "misleading_information" | "offensive_content";

const REPORT_REASONS: { id: ReportReason; label: string }[] = [
    { id: "illegal_content",        label: "Illegal content e.g. drugs, weapons" },
    { id: "indecent_content",       label: "Indecent content" },
    { id: "irrelevant_content",     label: "Irrelevant content e.g. politics, religion" },
    { id: "misleading_information", label: "Misleading or false information" },
    { id: "offensive_content",      label: "Offensive or hateful content" },
];

const REACTION_EMOJIS: Record<ReactionId, string> = {
    like: "👍", love: "❤️", haha: "😂", wow: "😮", sad: "😢", angry: "😡",
};
const REACTION_IDS: ReactionId[] = ["like", "love", "haha", "wow", "sad", "angry"];

const GRADIENTS = [
    "linear-gradient(145deg,#0d1b2a,#1a2744)",
    "linear-gradient(145deg,#1a0d2e,#2d1560)",
    "linear-gradient(145deg,#0f1923,#1c2e3d)",
    "linear-gradient(145deg,#12110f,#2a2520)",
    "linear-gradient(145deg,#0d1f0d,#162e1a)",
];
const gradient = (id?: string) =>
    GRADIENTS[id ? id.charCodeAt(id.length - 1) % GRADIENTS.length : 0];

const fmtTime = (ts: number) => {
    const diff = Date.now() - ts;
    const d = Math.floor(diff / 86400000);
    const h = Math.floor(diff / 3600000);
    const m = Math.floor(diff / 60000);
    const s = Math.floor(diff / 1000);
    if (d > 0) return `${d}d ago`;
    if (h > 0) return `${h}h ago`;
    if (m > 0) return `${m}m ago`;
    return `${s}s ago`;
};
const fmtCount = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`);

const URL_RX = /(https?:\/\/[^\s]+)/g;
const linkify = (text: string) =>
    text.split(URL_RX).map((p, i) =>
        URL_RX.test(p) ? (
            <a key={i} href={p} target="_blank" rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="text-[#C9115F] underline underline-offset-2 break-all hover:opacity-80">
                {p}
            </a>
        ) : <span key={i}>{p}</span>
    );

const Avatar = ({ size = 36 }: { size?: number }) => (
    <div className="rounded-full bg-gradient-to-br from-[#C9115F] to-[#e8185a] flex items-center justify-center text-white flex-shrink-0"
        style={{ width: size, height: size }}>
        <User style={{ width: size * 0.42, height: size * 0.42 }} />
    </div>
);

interface Props {
    post: Post;
    postMap?: Record<string, Post>;
    onLike?: (postId: string, userId: string, reaction?: ReactionId) => void;
    onDelete?: (id: string) => Promise<void>;
    onVote?: (postId: string, optionId: string, voterId: string, userName: string) => Promise<void>;
    onRepost?: (postId: string) => Promise<void>;
    onQuoteRepost?: (postId: string, quoteText: string) => Promise<void>;
    currentUserId?: string;
    currentUserName?: string;
    onCommentAdded?: (postId: string) => void;
    onCommentDeleted?: (postId: string) => void;
}

export default function PostCard({
    post, postMap, onLike, onDelete, onVote, onRepost, onQuoteRepost,
    currentUserId, currentUserName = "Anonymous", onCommentAdded, onCommentDeleted,
}: Props) {
    /* ── ui state ── */
    const [expanded,        setExpanded]        = useState(false);
    const [textOverflows,   setTextOverflows]   = useState(false);
    const [showComments,    setShowComments]    = useState(false);
    const [showMenu,        setShowMenu]        = useState(false);
    const [showShare,       setShowShare]       = useState(false);
    const [copied,          setCopied]          = useState(false);
    const [deleting,        setDeleting]        = useState(false);
    const [showReactions,   setShowReactions]   = useState(false);
    const [showRepost,      setShowRepost]      = useState(false);
    const [showEmoji,       setShowEmoji]       = useState(false);
    const [showReport,      setShowReport]      = useState(false);
    const [expandedQuoted,   setExpandedQuoted]   = useState(false);
    const [reportReason,    setReportReason]    = useState<ReportReason | null>(null);
    const [reporting,       setReporting]       = useState(false);
    const [reportDone,      setReportDone]      = useState(false);
    const [prefAction,      setPrefAction]      = useState<"suggest_more"|"suggest_less"|null>(null);
    const [prefToast,       setPrefToast]       = useState<string|null>(null);
    const [localPoll,       setLocalPoll]       = useState(post.poll);

    /* ── local interaction state ── */
    const [likes,       setLikes]       = useState(post.likes || 0);
    const [likedBy,     setLikedBy]     = useState<string[]>(post.likedBy || []);
    const [reactions,   setReactions]   = useState<Record<string,string>>((post.reactions as Record<string,string>) || {});
    const [reposts,     setReposts]     = useState(post.repostCount || 0);
    const [reposted,    setReposted]    = useState(!!(post.repostedBy as string[]|undefined)?.includes(currentUserId ?? ""));
    const [commentCount,setCommentCount]= useState<number|null>(typeof post.commentCount === "number" ? post.commentCount : null);

    const menuRef      = useRef<HTMLDivElement>(null);
    const emojiTimer   = useRef<ReturnType<typeof setTimeout>|null>(null);
    const textRef      = useRef<HTMLParagraphElement>(null);

    /* ── derived ── */
    const isPlain    = post.isRepost && !post.isQuoteRepost;
    const orig       = isPlain ? post.quotedPost ?? postMap?.[post.originalPostId ?? ""] ?? null : null;
    const author     = orig?.userName  ?? post.userName;
    const createdAt  = orig?.createdAt ?? post.createdAt;
    const content    = orig?.content   ?? post.content;
    const media      = orig?.media     ?? post.media;
    const hasMedia   = !!(media?.length);
    const hasPoll    = !!(localPoll?.options?.length);
    const isOwner    = !!currentUserId && (
        currentUserId.trim().toLowerCase() === (post.userId   ?? "").trim().toLowerCase() ||
        currentUserId.trim().toLowerCase() === (post.userEmail ?? "").trim().toLowerCase()
    );
    const isLiked    = !!currentUserId && likedBy.includes(currentUserId);
    const myReaction = currentUserId ? (reactions[currentUserId] as ReactionId|undefined) : undefined;

    /* ── measure text overflow after layout ── */
    useLayoutEffect(() => {
        const el = textRef.current;
        if (!el) { setTextOverflows(false); return; }
        el.style.cssText = "overflow:visible;display:block;-webkit-line-clamp:unset;max-height:none;";
        const natural = el.scrollHeight;
        el.style.cssText = "";
        setTextOverflows(natural > 44); // > 2 lines at ~22px each
    }, [content, hasMedia]);

    /* ── outside-click to close menu ── */
    useEffect(() => {
        if (!showMenu) return;
        const h = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
        };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, [showMenu]);

    /* ── sync props ── */
    useEffect(() => { if (typeof post.commentCount === "number") setCommentCount(post.commentCount); }, [post.commentCount]);
    useEffect(() => {
        setLikes(post.likes || 0);
        setLikedBy(post.likedBy || []);
        setReposts(post.repostCount || 0);
        setReactions(prev => {
            const inc = (post.reactions as Record<string,string>) || {};
            if (!currentUserId) return inc;
            const m = { ...inc };
            if (prev[currentUserId] && !inc[currentUserId]) m[currentUserId] = prev[currentUserId];
            return m;
        });
    }, [post.likes, post.likedBy, post.reactions, post.repostCount, currentUserId]);

    useEffect(() => {
        if (!post.id || commentCount !== null) return;
        const ctrl = new AbortController();
        let dead = false;
        axios.get(`/api/comments?contentId=${post.id}&contentType=post&limit=1`, { signal: ctrl.signal })
            .then(r => {
                const t = r.data?.pagination?.total ?? (Array.isArray(r.data?.comments) ? r.data.comments.length : null);
                if (!dead && typeof t === "number") setCommentCount(t);
            }).catch(() => {});
        return () => { dead = true; ctrl.abort(); };
    }, [post.id, commentCount]);

    /* ── handlers ── */
    const toggleReaction = (postId: string, userId: string, reaction?: ReactionId) => {
        if (!currentUserId) return;
        const was = likedBy.includes(currentUserId);
        if (!reaction) {
            setLikedBy(p => p.filter(id => id !== currentUserId));
            setLikes(p => Math.max(0, p - 1));
            setReactions(p => { const n = { ...p }; delete n[currentUserId]; return n; });
        } else {
            if (!was) { setLikedBy(p => [...p, currentUserId]); setLikes(p => p + 1); }
            setReactions(p => ({ ...p, [currentUserId]: reaction }));
        }
        onLike?.(postId, userId, reaction);
    };
    const pickEmoji = (r: ReactionId) => {
        if (!post.id || !currentUserId) return;
        setShowEmoji(false);
        if (emojiTimer.current) clearTimeout(emojiTimer.current);
        toggleReaction(post.id, currentUserId, r);
    };

    const handleRepost = async (id: string) => {
        if (!onRepost) return;
        setReposted(true); setReposts(p => p + 1);
        try { await onRepost(id); }
        catch { setReposted(false); setReposts(p => Math.max(0, p - 1)); }
    };
    const handleQuote = async (id: string, txt: string) => {
        if (!onQuoteRepost) return;
        await onQuoteRepost(id, txt);
        setReposts(p => p + 1);
    };

    const handleDelete = async () => {
        if (!post.id || !confirm("Delete this post?")) return;
        setDeleting(true); setShowMenu(false);
        try { if (onDelete) await onDelete(post.id); else await axios.delete(`/api/createpost/${post.id}`); }
        catch { alert("Failed to delete."); }
        finally { setDeleting(false); }
    };

    const handleReport = async () => {
        if (!reportReason || !post.id || !currentUserId) return;
        setReporting(true);
        try {
            await axios.post("/api/post-report", { postId: post.id, reporterId: currentUserId, reporterName: currentUserName, reason: reportReason });
            setReportDone(true);
        } catch (e: unknown) {
            alert(axios.isAxiosError(e) && e.response?.data?.error ? e.response.data.error : "Failed to submit report.");
        } finally { setReporting(false); }
    };

    const handlePref = async (action: "suggest_more"|"suggest_less") => {
        if (!post.id || !currentUserId) return;
        setShowMenu(false);
        try {
            const r = await axios.post("/api/post-preference", { postId: post.id, userId: currentUserId, action });
            setPrefAction(action);
            setPrefToast(r.data?.message ?? (action === "suggest_more" ? "You'll see more like this." : "You'll see fewer like this."));
            setTimeout(() => setPrefToast(null), 3000);
        } catch { /* ignore */ }
    };

    const handleVote = (optId: string) => {
        if (!post.id || !onVote || !currentUserId || hasVoted) return;
        if (localPoll) {
            setLocalPoll({
                ...localPoll,
                totalVotes: (localPoll.totalVotes ?? 0) + 1,
                options: localPoll.options.map(o => o.id === optId ? { ...o, votes: o.votes + 1 } : o),
                votedBy: [...(localPoll.votedBy ?? []), { voterId: currentUserId, userName: currentUserName }],
            });
        }
        onVote(post.id, optId, currentUserId, currentUserName);
    };
    const hasVoted = Array.isArray(localPoll?.votedBy) &&
        localPoll.votedBy.some((v: VotedByEntry) => typeof v === "string" ? v === currentUserId : v.voterId === currentUserId);

    const onCommentAdd = useCallback(() => { setCommentCount(p => p === null ? 1 : p + 1); onCommentAdded?.(post.id!); }, [onCommentAdded, post.id]);
    const onCommentDel = useCallback(() => { setCommentCount(p => p === null ? 0 : Math.max(0, p - 1)); onCommentDeleted?.(post.id!); }, [onCommentDeleted, post.id]);
    const onCountLoad  = useCallback((n: number) => { setCommentCount(p => p === null ? n : p); }, []);

    /* ── share helpers ── */
    const clip = async (t: string) => {
        try { await navigator.clipboard.writeText(t); return true; }
        catch {
            try {
                const el = document.createElement("textarea");
                el.value = t; el.style.cssText = "position:fixed;opacity:0";
                document.body.appendChild(el); el.focus(); el.select();
                const ok = document.execCommand("copy"); document.body.removeChild(el); return ok;
            } catch { return false; }
        }
    };
    const sUrl  = () => typeof window !== "undefined" ? `${window.location.origin}${window.location.pathname}${window.location.search}` : "";
    const sTxt  = () => [(post.content?.trim() || "Check out this post"), `View post: ${sUrl()}`].join("\n");
    const shareButtons = (sz: string) => ([
        { fn: () => { const u=`whatsapp://send?text=${encodeURIComponent(sTxt())}`; const o=window.open(u,"_self"); if(!o) window.location.href=`https://wa.me/?text=${encodeURIComponent(sTxt())}`; }, src:"/images/share_whatsapp.png",  alt:"WhatsApp"  },
        { fn: () => window.open(`https://www.threads.net/intent/post?text=${encodeURIComponent(sTxt())}`,"_blank","noopener,noreferrer"),                                                                                                      src:"/images/share_thread.png",    alt:"Threads"   },
        { fn: async () => { await clip(sTxt()); setCopied(true); window.open("https://www.instagram.com/","_blank","noopener,noreferrer"); setTimeout(()=>setCopied(false),1600); },                                                            src:"/images/share_insta.png",     alt:"Instagram" },
        { fn: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(sUrl())}`,"_blank","noopener,noreferrer"),                                                                                            src:"/images/Share_linkedin.png",  alt:"LinkedIn"  },
        { fn: () => window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(sTxt())}`,"_blank","noopener,noreferrer"),                                                                                                                src:"/images/Share_X.png",         alt:"X"         },
        { fn: async () => { const ok=await clip(sTxt()); if(ok){setCopied(true);setTimeout(()=>setCopied(false),1600);} },                                                                                                                     src:"/images/share_copy_link.png", alt:"Copy"      },
    ].map(({ fn, src, alt }) => (
        <button key={alt} onClick={fn}
            className={`${sz} shrink-0 rounded-full overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center`}>
            <img src={src} alt={alt} className="w-full h-full object-cover rounded-full" />
        </button>
    )));

    /* ── reaction summary ── */
    const reactionSummary = (() => {
        if (likes === 0) return null;
        const counts: Record<string,number> = {};
        Object.values(reactions).forEach(r => { counts[r] = (counts[r]||0)+1; });
        const top = Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([id])=>REACTION_EMOJIS[id as ReactionId]||"👍");
        return top.length ? top : ["👍"];
    })();

   

    const CARD_H   = 300;  // collapsed total
    const HEAD_H   = 46;
    const ACT_H    = 34;
    const BODY_H   = CARD_H - HEAD_H - ACT_H; // 200px

    return (
        <div className="w-full min-w-[280px] sm:min-w-[320px] max-w-[320px] rounded-2xl border border-white/10 bg-[#1c1c1f] flex flex-col transition-all duration-300"
            style={{ height: expanded ? "auto" : `${CARD_H}px`, overflow: "hidden" }}>

            {/* repost / quote banners */}
            {post.isQuoteRepost && post.quotedPost && (
                <div className="flex items-center gap-1 px-3 pt-2 pb-0 text-white/40 text-[10px] flex-shrink-0">
                    <Quote className="w-2.5 h-2.5" /><span>{post.userName} quoted</span>
                </div>
            )}
            {post.isRepost && !post.isQuoteRepost && (
                <div className="flex items-center gap-1 px-3 pt-2 pb-0 text-green-400/70 text-[10px] flex-shrink-0">
                    <Repeat2 className="w-2.5 h-2.5" />
                    <span>{currentUserId && (post.repostedBy as string[]|undefined)?.includes(currentUserId) ? `You reposted ${orig?.userName ?? post.userName}` : `${post.userName} reposted`}</span>
                </div>
            )}

            {/* ── HEADER 56px ─────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-3 flex-shrink-0" style={{ height: HEAD_H }}>
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="rounded-full flex items-center justify-center border-2 border-white/20 flex-shrink-0 overflow-hidden" style={{ width: 38, height: 38 }}>
                        <Avatar size={38} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-white font-semibold text-[13px] leading-tight truncate">@{author}</p>
                        <p className="text-white/40 text-[11px] mt-0.5">{fmtTime(createdAt)}</p>
                    </div>
                </div>

                {currentUserId && (
                    <div className="relative flex-shrink-0" ref={menuRef}>
                        <button onClick={() => setShowMenu(v => !v)} disabled={deleting}
                            className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">
                            <MoreHorizontal className="w-4 h-4 text-white/50" />
                        </button>
                        {showMenu && (
                            <div className="absolute right-0 top-9 z-30 bg-[#111] rounded-xl shadow-2xl border border-white/10 overflow-hidden min-w-[210px]">
                                {isOwner ? (
                                    <button onClick={handleDelete} disabled={deleting}
                                        className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2.5">
                                        <Trash2 className="w-4 h-4" />{deleting ? "Deleting…" : "Delete Post"}
                                    </button>
                                ) : (<>
                                    <button onClick={() => { setShowMenu(false); setReportReason(null); setReportDone(false); setShowReport(true); }}
                                        className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2.5">
                                        <Flag className="w-4 h-4" />Report
                                    </button>
                                    <div className="h-px bg-white/8 mx-3" />
                                    <button onClick={() => handlePref("suggest_more")} disabled={prefAction === "suggest_more"}
                                        className={`w-full px-4 py-3 text-left text-sm flex items-center gap-2.5 ${prefAction === "suggest_more" ? "text-[#C9115F] bg-[#C9115F]/10" : "text-white/70 hover:bg-white/10"}`}>
                                        <ThumbsUp className="w-4 h-4" />Suggest more like this
                                    </button>
                                    <button onClick={() => handlePref("suggest_less")} disabled={prefAction === "suggest_less"}
                                        className={`w-full px-4 py-3 text-left text-sm flex items-center gap-2.5 ${prefAction === "suggest_less" ? "text-white/50 bg-white/5" : "text-white/70 hover:bg-white/10"}`}>
                                        <ThumbsDown className="w-4 h-4" />Suggest less like this
                                    </button>
                                </>)}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── SCROLLABLE MIDDLE: body + caption + show more + reactions (clips inside fixed card) ── */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">

            {/* ── BODY fills middle container ───────────────────────────── */}
            <div className="px-3 flex-1 min-h-0">

                {/* TEXT ONLY → gradient box */}
                {!hasMedia && !hasPoll && content && (
                    <div className="w-full h-full rounded-xl flex items-center justify-center px-5"
                        style={{ background: gradient(post.id) }}>
                        <p ref={textRef} className="text-white text-sm leading-relaxed text-center w-full"
                            style={expanded ? {} : { overflow:"hidden", display:"-webkit-box", WebkitLineClamp:5, WebkitBoxOrient:"vertical" } as React.CSSProperties}>
                            {linkify(content)}
                        </p>
                    </div>
                )}

                {/* MEDIA → image fills entire body */}
                {hasMedia && (
                    <div className={`w-full h-full rounded-xl overflow-hidden grid gap-0.5 ${media!.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                        {media!.map((item, i) => (
                            <div key={i} className="relative bg-zinc-900 w-full h-full">
                                {item.type === "image" ? (
                                    <Image src={item.url} alt={item.name || `img-${i}`} fill
                                        className="object-cover cursor-pointer"
                                        onClick={() => window.open(item.url, "_blank")} />
                                ) : (
                                    <video src={item.url} className="w-full h-full object-cover" controls preload="metadata" />
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* QUOTED POST */}
                {post.quotedPost && post.isQuoteRepost && (
                    <div className="w-full h-full flex flex-col gap-2 overflow-hidden">
                        {content && <p className="text-white text-[13px] leading-relaxed flex-shrink-0 line-clamp-2">{linkify(content)}</p>}
                        <button
                            type="button"
                            onClick={() => setExpandedQuoted(v => !v)}
                            className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 flex-1 overflow-hidden text-left hover:bg-white/8 transition-colors"
                        >
                            <div className="flex items-center gap-1.5 mb-1.5">
                                <Avatar size={18} />
                                <span className="text-white/70 text-[11px] font-medium">{post.quotedPost.userName}</span>
                                <span className="text-white/25 text-[11px]">·</span>
                                <span className="text-white/25 text-[11px]">{fmtTime(post.quotedPost.createdAt)}</span>
                            </div>
                            {post.quotedPost.content && (
                                <p className={`text-white/55 text-[11px] leading-relaxed ${expandedQuoted ? "line-clamp-none" : "line-clamp-1"}`}>
                                    {linkify(post.quotedPost.content)}
                                </p>
                            )}
                            {post.quotedPost.media?.[0] && (
                                <div className="mt-1.5 rounded-lg overflow-hidden bg-black/30 h-14">
                                    <img src={post.quotedPost.media[0].url} alt="quoted" className="w-full h-full object-cover" />
                                </div>
                            )}
                            <span className="mt-2 inline-flex text-[10px] text-[#C9115F]">{expandedQuoted ? "Show less" : "View original post"}</span>
                        </button>
                    </div>
                )}

                {/* POLL */}
                {hasPoll && (
                    <div className="w-full h-full flex flex-col overflow-hidden">
                        {content && <p className="text-white text-[13px] leading-snug mb-2 flex-shrink-0 line-clamp-2">{linkify(content)}</p>}
                        {hasVoted && (
                            <div className="flex items-center gap-1 mb-1.5 text-[#C9115F] text-[11px] flex-shrink-0">
                                <CheckCircle2 className="w-3 h-3" /><span>You voted</span>
                            </div>
                        )}
                        <div className="space-y-1.5 flex-1 overflow-hidden">
                            {localPoll!.options.map(opt => {
                                const total = localPoll!.totalVotes ?? 0;
                                const pct   = total > 0 ? (opt.votes / total) * 100 : 0;
                                const ended = (localPoll!.endsAt ?? 0) < Date.now();
                                return (
                                    <button key={opt.id} onClick={() => handleVote(opt.id)} disabled={ended || hasVoted}
                                        className={`w-full relative ${ended || hasVoted ? "cursor-not-allowed opacity-80" : "hover:opacity-90"}`}>
                                        <div className="relative bg-white/10 rounded-lg overflow-hidden">
                                            <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#C9115F]/30 to-[#e8185a]/30 rounded-lg transition-all" style={{ width:`${pct}%` }} />
                                            <div className="relative px-3 py-2 flex justify-between items-center">
                                                <span className="text-white text-xs">{opt.text}</span>
                                                <span className="text-white/50 text-[10px]">{pct.toFixed(0)}% ({opt.votes})</span>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        <div className="mt-1.5 text-[10px] text-white/30 text-center flex-shrink-0">
                            {(localPoll!.endsAt ?? 0) < Date.now() ? "Poll ended" : `${localPoll!.totalVotes ?? 0} votes`}
                        </div>
                    </div>
                )}
            </div>

            {/* ── CAPTION (media + text only) — always visible, 2-line clamp ── */}
            {hasMedia && content && (
                <div className="px-3 pt-2 flex-shrink-0">
                    <p ref={textRef} className="text-white text-[13px] leading-snug"
                        style={expanded ? {} : { overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" } as React.CSSProperties}>
                        {linkify(content)}
                    </p>
                </div>
            )}

            {/* ── SHOW MORE / SHOW LESS ── */}
            {content && !hasPoll && textOverflows && (
                <div className="px-3 pt-1 flex-shrink-0">
                    <button onClick={() => setExpanded(v => !v)}
                        className="text-[#C9115F] text-[12px] font-medium hover:opacity-80 transition-opacity">
                        {expanded ? "show less" : "show more"}
                    </button>
                </div>
            )}

            {/* ── REACTION SUMMARY ── */}
            {reactionSummary && (
                <button onClick={() => setShowReactions(true)}
                    className="flex items-center gap-1.5 px-3 pt-2 flex-shrink-0 group w-fit">
                    <div className="flex -space-x-1">
                        {reactionSummary.map((e, i) => (
                            <span key={i}
                                className="text-sm w-5 h-5 flex items-center justify-center rounded-full bg-white/10 border border-white/5 ring-1 ring-[#1c1c1f]"
                                style={{ zIndex: reactionSummary.length - i }}>{e}</span>
                        ))}
                    </div>
                    <span className="text-white/40 text-xs group-hover:text-white/70 tabular-nums">{fmtCount(likes)}</span>
                </button>
            )}

            </div>{/* end scrollable middle */}

            {/* ── ACTION BAR 44px — always visible at bottom ─────────── */}
            <div className="flex items-center justify-between px-4 flex-shrink-0 border-t border-white/[0.07]"
                style={{ height: ACT_H, minHeight: ACT_H }}>

                {/* LIKE + emoji hover picker */}
                <div className="relative"
                    onMouseEnter={() => { if (emojiTimer.current) clearTimeout(emojiTimer.current); setShowEmoji(true); }}
                    onMouseLeave={() => { emojiTimer.current = setTimeout(() => setShowEmoji(false), 180); }}>
                    {showEmoji && (
                        <div className="absolute bottom-[calc(100%+8px)] left-0 z-50 flex items-center gap-0.5 bg-[#111] border border-white/10 rounded-full px-2.5 py-1.5 shadow-2xl"
                            style={{ whiteSpace:"nowrap" }}
                            onMouseEnter={() => { if (emojiTimer.current) clearTimeout(emojiTimer.current); setShowEmoji(true); }}
                            onMouseLeave={() => { emojiTimer.current = setTimeout(() => setShowEmoji(false), 180); }}>
                            {REACTION_IDS.map(r => (
                                <button key={r}
                                    onMouseDown={e => { e.preventDefault(); pickEmoji(r); }}
                                    title={r}
                                    className={`text-xl w-9 h-9 flex items-center justify-center rounded-full transition-transform hover:scale-[1.3] hover:bg-white/10 ${myReaction === r ? "bg-white/10 scale-110 ring-2 ring-[#C9115F]/50" : ""}`}>
                                    {REACTION_EMOJIS[r]}
                                </button>
                            ))}
                        </div>
                    )}
                    <button
                        onClick={() => {
                            if (!post.id || !currentUserId) return;
                            if (isLiked) toggleReaction(post.id, currentUserId, undefined);
                            else toggleReaction(post.id, currentUserId, "like");
                        }}
                        className="flex items-center gap-1.5 group">
                        <Heart className={`w-[18px] h-[18px] transition-all ${isLiked ? "fill-[#C9115F] text-[#C9115F]" : "text-white/50 group-hover:text-white/80"}`} />
                        {likes > 0 && <span className={`text-sm tabular-nums ${isLiked ? "text-[#C9115F]" : "text-white/50"}`}>{fmtCount(likes)}</span>}
                    </button>
                </div>

                {/* COMMENT */}
                <button onClick={() => setShowComments(v => !v)}
                    className={`flex items-center gap-1.5 transition-colors ${showComments ? "text-[#C9115F]" : "text-white/50 hover:text-white/80"}`}>
                    <MessageCircle className="w-[18px] h-[18px]" />
                    {commentCount !== null && commentCount > 0 && <span className="text-sm tabular-nums">{fmtCount(commentCount)}</span>}
                </button>

                {/* REPOST */}
                <button onClick={() => setShowRepost(true)}
                    className={`flex items-center gap-1.5 transition-colors ${reposted ? "text-green-400 hover:text-green-300" : "text-white/50 hover:text-green-400"}`}>
                    <Repeat2 className="w-[18px] h-[18px]" />
                    {reposts > 0 && <span className="text-sm tabular-nums">{fmtCount(reposts)}</span>}
                </button>

                {/* SHARE */}
                <button onClick={() => { setShowShare(true); setCopied(false); }}
                    className="text-white/50 hover:text-white/80 transition-colors">
                    <Share className="w-[18px] h-[18px]" />
                </button>
            </div>

            {/* ── COMMENTS ── */}
            {showComments && post.id && (
                <div className="px-3 pb-3 pt-1 border-t border-white/[0.07] bg-black/10">
                    <CommentsSection contentId={post.id} contentType="post"
                        contentTitle={post.content?.slice(0,100) || "Post"}
                        onCommentAdded={onCommentAdd} onCommentDeleted={onCommentDel} onCommentCountLoaded={onCountLoad} />
                </div>
            )}

            {/* ── SHARE DIALOG ── */}
            {showShare && (<>
                <button type="button" className="fixed inset-0 z-40 bg-black/70 lg:hidden" onClick={() => setShowShare(false)} />
                <div className="fixed bottom-16 inset-x-4 z-50 mx-auto w-full max-w-[280px] rounded-2xl border border-white/10 bg-[#1a1a1e] p-3 shadow-2xl lg:hidden" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-white text-sm font-semibold">Share</p>
                        <button onClick={() => setShowShare(false)} className="text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
                    </div>
                    <div className="flex gap-1.5 mb-2 overflow-x-auto">{shareButtons("w-8 h-8")}</div>
                    {copied && <p className="text-xs text-emerald-400">Copied!</p>}
                </div>
                <div className="hidden lg:flex fixed inset-0 z-50 items-center justify-center bg-black/60" onClick={() => setShowShare(false)}>
                    <div className="bg-[#1a1a1e] rounded-2xl border border-white/10 p-4 w-[300px] shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-white text-sm font-semibold">Share Post</p>
                            <button onClick={() => setShowShare(false)} className="text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-[#111] p-3 mb-3">
                            <p className="text-white text-sm font-semibold line-clamp-2">{post.content?.slice(0,60)||"Post"}</p>
                            <p className="text-white/45 text-[11px] mt-2 break-all line-clamp-2">{sUrl()}</p>
                        </div>
                        <div className="flex gap-2 mb-2">{shareButtons("w-9 h-9")}</div>
                        {copied && <p className="text-xs text-emerald-400">Copied!</p>}
                    </div>
                </div>
            </>)}

            {/* ── MODALS ── */}
            <ReactionsModal open={showReactions} onClose={() => setShowReactions(false)} reactions={reactions} totalLikes={likes} />
            <RepostModal open={showRepost} onClose={() => setShowRepost(false)} post={post}
                currentUserId={currentUserId ?? ""} currentUserName={currentUserName}
                onRepost={handleRepost} onQuoteRepost={handleQuote} hasReposted={reposted} />

            {/* preference toast */}
            {prefToast && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1a1a1e] border border-white/10 rounded-xl px-4 py-2.5 shadow-xl flex items-center gap-2 text-sm text-white/80">
                    {prefAction === "suggest_more" ? <ThumbsUp className="w-4 h-4 text-[#C9115F]" /> : <ThumbsDown className="w-4 h-4 text-white/50" />}
                    {prefToast}
                </div>
            )}

            {/* ── REPORT MODAL ── */}
            {showReport && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 px-4 pb-4 sm:pb-0"
                    onClick={e => { if (e.target === e.currentTarget) setShowReport(false); }}>
                    <div className="w-full max-w-sm bg-[#1a1a1e] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                        <div className="flex justify-center pt-3 pb-1 sm:hidden"><div className="w-9 h-1 rounded-full bg-white/20" /></div>
                        <div className="flex items-center justify-between px-5 pt-4 pb-2">
                            <div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-400" /><h2 className="text-white font-semibold">Report a post</h2></div>
                            <button onClick={() => setShowReport(false)} className="p-1 rounded-full hover:bg-white/10 text-white/50"><X className="w-4 h-4" /></button>
                        </div>
                        {!reportDone ? (<>
                            <p className="text-white/40 text-xs px-5 pb-4 leading-relaxed">We&apos;ll review this. Your report is anonymous.</p>
                            <div className="px-3 pb-3 space-y-1">
                                {REPORT_REASONS.map(r => (
                                    <button key={r.id} onClick={() => setReportReason(r.id)}
                                        className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm text-left transition-colors ${reportReason === r.id ? "bg-red-500/10 text-white" : "text-white/70 hover:bg-white/5"}`}>
                                        <span>{r.label}</span>
                                        <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-3 ${reportReason === r.id ? "border-red-400 bg-red-400" : "border-white/25"}`}>
                                            {reportReason === r.id && <span className="w-2 h-2 rounded-full bg-white" />}
                                        </span>
                                    </button>
                                ))}
                            </div>
                            <div className="px-4 pb-5">
                                <button onClick={handleReport} disabled={!reportReason || reporting}
                                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${reportReason && !reporting ? "bg-white text-[#111] hover:bg-white/90" : "bg-white/10 text-white/30 cursor-not-allowed"}`}>
                                    {reporting ? "Submitting…" : "Report"}
                                </button>
                            </div>
                        </>) : (
                            <div className="flex flex-col items-center gap-3 px-6 pb-8 pt-4 text-center">
                                <div className="w-14 h-14 rounded-full bg-red-500/15 flex items-center justify-center"><CheckCircle2 className="w-7 h-7 text-red-400" /></div>
                                <h3 className="text-white font-semibold">Report submitted</h3>
                                <p className="text-white/45 text-sm leading-relaxed">Thank you. We&apos;ll review and act if needed.</p>
                                <button onClick={() => setShowReport(false)} className="mt-2 w-full py-3 rounded-xl bg-white/10 text-white/70 text-sm hover:bg-white/15">Done</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}