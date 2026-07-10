
// //chandu's code



// import { useState, useEffect, useCallback, useRef } from "react";
// import { AnimatePresence } from "framer-motion";
// import axios from "axios";
// import AvatarWithBadge from "./AvatarWithBadge";
// import { SplitBar } from "./shared";
// import { clamp, formatTimeAgo } from "../utils";
// import { ChevronLeft, Trash2, X, User, Loader2, Search } from "lucide-react";

// interface Props {
//   post: any;
//   // onClose: () => void;
//    onClose: (replyCount?: number) => void;
//   onToast: (m: string) => void;
//   onVote: (id: string, vote: "agree" | "disagree" | null) => void;
//   onDeletePost?: (id: string, roomId?: string) => void;
//   currentUsername?: string;
//   currentAvatarUrl?: string;
//   bottomNavHeight?: number;
// }

// interface MentionUser {
//   userId: string;
//   username: string;
//   firstName?: string;
//   lastName?: string;
//   name?: string;
//   avatarUrl?: string;
//   email?: string;
// }

// export default function PostDetailsOverlay({
//   post,
//   onClose,
//   onToast,
//   onVote,
//   onDeletePost,
//   currentUsername,
//   currentAvatarUrl,
//   bottomNavHeight = 0,
// }: Props) {
//   const [comments, setComments] = useState<any[]>([]);
//   const [commentText, setCommentText] = useState("");
//   const [replyTo, setReplyTo] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [userUsername, setUserUsername] = useState("RoarUser");
//   const activeUsername = currentUsername || userUsername;
//   const [userBadge, setUserBadge] = useState("RISING_FAN");
//   const [userAvatarUrl, setUserAvatarUrl] = useState<string | undefined>(currentAvatarUrl);
//   const [votes, setVotes] = useState<Record<string, boolean | null>>(() =>
//     post.userVote ? { [post.id]: post.userVote === "agree" } : {},
//   );
//   const [pct, setPct] = useState(post.agreePercent ?? 50);
//   const inputRef = useRef<HTMLInputElement>(null);
//   const scrollRef = useRef<HTMLDivElement>(null);
//   const [isMobile, setIsMobile] = useState(false);
//   const [headerHeight, setHeaderHeight] = useState(0);
//   const [sidebarWidth, setSidebarWidth] = useState(0);

//   // Mention states
//   const [mentionQuery, setMentionQuery] = useState("");
//   const [mentionUsers, setMentionUsers] = useState<MentionUser[]>([]);
//   const [showMentionPopup, setShowMentionPopup] = useState(false);
//   const [mentionIndex, setMentionIndex] = useState(0);
//   const [cursorPosition, setCursorPosition] = useState(0);
//   const [mentionLoading, setMentionLoading] = useState(false);
//   const [allUsers, setAllUsers] = useState<MentionUser[]>([]);
//   useEffect(() => {
//     const checkLayout = () => {
//       const mobile = window.innerWidth < 768;
//       setIsMobile(mobile);
//       const header = document.querySelector("header");
//       setHeaderHeight(header ? header.getBoundingClientRect().height : 60);
//       if (!mobile) {
//         const sidebar = document.querySelector("aside");
//         setSidebarWidth(sidebar ? sidebar.getBoundingClientRect().width : 84);
//       } else {
//         setSidebarWidth(0);
//       }
//     };

//     checkLayout();
//     window.addEventListener("resize", checkLayout);

//     // ✅ FIX — observe every resize on the sidebar, including CSS transitions
//     const sidebar = document.querySelector("aside");
//     let ro: ResizeObserver | null = null;
//     if (sidebar) {
//       ro = new ResizeObserver((entries) => {
//         if (window.innerWidth < 768) return;
//         const width = entries[0]?.contentRect.width ?? 0;
//         setSidebarWidth(width);
//       });
//       ro.observe(sidebar);
//     }

//     return () => {
//       window.removeEventListener("resize", checkLayout);
//       ro?.disconnect();
//     };
//   }, []);

//   const hasUnderscore = (u: any): boolean => {
//     const username = u.username || u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim();
//     const emailLocal = (u.email || "").split("@")[0];
//     return username.includes("_") || emailLocal.includes("_");
//   };

//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const res = await axios.get("/api/users", { withCredentials: true });
//         if (res.data?.users) {
//           const seen = new Set<string>();
//           const formattedUsers = res.data.users
//             .filter((u: any) => {
//               const username = u.username || u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim();
//               return username !== activeUsername && !hasUnderscore(u);
//             })
//             .map((u: any) => ({
//               userId: u.userId || u.id,
//               username: u.username,
//               firstName: u.firstName,
//               lastName: u.lastName,
//               name: u.name,
//               avatarUrl: u.avatarUrl || u.avatar,
//               email: u.email,
//             }))
//             .filter((u: MentionUser) => {
//               const key = u.userId || u.username;
//               if (!key || seen.has(key)) return false;
//               const displayName = u.username || u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim();
//               if (displayName.includes("_")) return false;
//               seen.add(key);
//               return true;
//             });
//           setAllUsers(formattedUsers);
//         }
//       } catch (err) {
//         console.error("Failed to fetch users:", err);
//         setAllUsers([
//           { userId: "1", username: "johndoe", firstName: "John", lastName: "Doe", email: "john@example.com" },
//           { userId: "2", username: "janesmith", firstName: "Jane", lastName: "Smith", email: "jane@example.com" },
//           { userId: "3", username: "mikewilson", firstName: "Mike", lastName: "Wilson", email: "mike@example.com" },
//           { userId: "4", username: "sarahparker", firstName: "Sarah", lastName: "Parker", email: "sarah@example.com" },
//           { userId: "5", username: "chrisevans", firstName: "Chris", lastName: "Evans", email: "chris@example.com" },
//         ]);
//       }
//     };
//     fetchUsers();
//   }, [activeUsername]);

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     const cursorPos = e.target.selectionStart || 0;
//     setCommentText(value);
//     setCursorPosition(cursorPos);

//     const textBeforeCursor = value.slice(0, cursorPos);
//     const lastAtIndex = textBeforeCursor.lastIndexOf("@");

//     if (lastAtIndex !== -1) {
//       const afterAt = textBeforeCursor.slice(lastAtIndex + 1);
//       if (!afterAt.includes(" ")) {
//         setMentionQuery(afterAt);
//         if (afterAt.trim() === "") {
//           setMentionUsers(allUsers.slice(0, 8));
//           setShowMentionPopup(allUsers.length > 0);
//         } else {
//           const filtered = allUsers
//             .filter((user) => {
//               const searchStr = `${user.username || ""} ${user.firstName || ""} ${user.lastName || ""} ${user.email || ""}`.toLowerCase();
//               return searchStr.includes(afterAt.toLowerCase());
//             })
//             .slice(0, 8);
//           setMentionUsers(filtered);
//           setShowMentionPopup(filtered.length > 0);
//         }
//         setMentionIndex(0);
//         return;
//       }
//     }

//     setShowMentionPopup(false);
//     setMentionUsers([]);
//   };

//   const insertMention = (user: MentionUser) => {
//     const displayName =
//       user.username ||
//       user.name ||
//       `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
//       user.email?.split("@")[0] ||
//       "user";
//     const mentionText = `@${displayName} `;
//     const textBeforeCursor = commentText.slice(0, cursorPosition);
//     const lastAtIndex = textBeforeCursor.lastIndexOf("@");
//     const textBeforeMention = commentText.slice(0, lastAtIndex);
//     const textAfterCursor = commentText.slice(cursorPosition);
//     setCommentText(`${textBeforeMention}${mentionText}${textAfterCursor}`);
//     setShowMentionPopup(false);
//     setMentionUsers([]);
//     setTimeout(() => {
//       if (inputRef.current) {
//         const newCursorPos = lastAtIndex + mentionText.length;
//         inputRef.current.focus();
//         inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
//       }
//     }, 10);
//   };

//   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (showMentionPopup && mentionUsers.length > 0) {
//       if (e.key === "ArrowDown") {
//         e.preventDefault();
//         setMentionIndex((prev) => (prev + 1) % mentionUsers.length);
//       } else if (e.key === "ArrowUp") {
//         e.preventDefault();
//         setMentionIndex((prev) => (prev - 1 + mentionUsers.length) % mentionUsers.length);
//       } else if (e.key === "Enter" || e.key === "Tab") {
//         e.preventDefault();
//         if (mentionUsers[mentionIndex]) insertMention(mentionUsers[mentionIndex]);
//       } else if (e.key === "Escape") {
//         setShowMentionPopup(false);
//         setMentionUsers([]);
//       }
//     } else if (e.key === "Enter" && !e.shiftKey && !showMentionPopup) {
//       e.preventDefault();
//       submitComment();
//     }
//   };

//   useEffect(() => {
//     try {
//       setUserUsername(localStorage.getItem("roar_username") || "RoarUser");
//       setUserBadge(localStorage.getItem("roar_badge") || "RISING_FAN");
//       setUserAvatarUrl(currentAvatarUrl || localStorage.getItem("roar_avatar_url") || undefined);
//     } catch { }
//   }, [currentAvatarUrl]);

//   const fetchComments = useCallback(async () => {
//     if (!post?.id) return;
//     try {
//       const res = await axios.get(`/api/roar/posts/${post.id}/comments`, {
//         params: { roomId: post.roomId },
//       });
//       if (res.data?.success) setComments(res.data.comments);
//     } catch (err) {
//       console.error("Failed to fetch comments:", err);
//     }
//   }, [post]);

//   useEffect(() => {
//     fetchComments();
//   }, [fetchComments]);

//   const handleReply = (username: string) => {
//     setReplyTo(username);
//     setCommentText("");
//     setTimeout(() => inputRef.current?.focus(), 50);
//   };

//   const clearReply = () => {
//     setReplyTo(null);
//     setCommentText("");
//   };

//   const submitComment = async () => {
//     const fullText = replyTo ? `@${replyTo} ${commentText.trim()}` : commentText.trim();
//     if (!fullText.trim()) return;
//     try {
//       setLoading(true);
//       const res = await axios.post(`/api/roar/posts/${post.id}/comments`, {
//         text: fullText,
//         roomId: post.roomId,
//       });
//       if (res.data?.success) {
//         setCommentText("");
//         setReplyTo(null);
//         fetchComments();
//         onToast("Comment posted successfully!");
//         setTimeout(() => {
//           scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
//         }, 400);
//       }
//     } catch (err) {
//       console.error("Failed to submit comment:", err);
//       onToast("Error posting comment");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const reactToComment = async (commentId: string) => {
//     try {
//       const res = await axios.post(`/api/roar/posts/${post.id}/comments/${commentId}/react`);
//       if (res.data?.success)
//         setComments((prev) =>
//           prev.map((c) =>
//             c.commentId === commentId ? { ...c, heartCount: res.data.heartCount } : c,
//           ),
//         );
//     } catch (err) {
//       console.error("Failed to react to comment:", err);
//     }
//   };

//   const userVote = votes[post.id];

//   const handleVoteClick = (agree: boolean) => {
//     const prev = votes[post.id];
//     let nextVote: boolean | null = agree;
//     if (prev === agree) nextVote = null;
//     setVotes((v) => ({ ...v, [post.id]: nextVote }));

//     let delta = 0;
//     if (post.userVote === "agree") {
//       if (nextVote === true) delta = 0;
//       else if (nextVote === false) delta = -8;
//       else delta = -4;
//     } else if (post.userVote === "disagree") {
//       if (nextVote === true) delta = 8;
//       else if (nextVote === false) delta = 0;
//       else delta = 4;
//     } else {
//       if (nextVote === true) delta = 4;
//       else if (nextVote === false) delta = -4;
//       else delta = 0;
//     }

//     setPct(clamp(post.agreePercent + delta, 1, 99));
//     onVote(post.id, nextVote === true ? "agree" : nextVote === false ? "disagree" : null);
//   };

//   const canSubmit = commentText.trim().length > 0;

//   // Dynamic positioning via CSS variables (Tailwind can't handle runtime values)
//   const overlayStyle = {
//     "--overlay-top": isMobile ? "0px" : `${headerHeight}px`,
//     "--overlay-left": isMobile ? "0px" : `${sidebarWidth}px`,
//   } as React.CSSProperties;

//   return (
//     <AnimatePresence>
//       {/* Overlay wrapper */}
//       <div
//         className="fixed right-0 bottom-0 z-[1000] flex flex-col overflow-hidden pointer-events-auto bg-[#050508]"
//         style={{
//           top: isMobile ? 0 : headerHeight,
//           left: isMobile ? 0 : sidebarWidth,
//           transition: "left 0.2s ease",
//         }}
//       >
//         {/* Mobile header */}
//         {isMobile && (
//           <div className="flex items-center gap-[14px] px-5 py-4 pt-30 border-b border-[#252538] bg-[rgba(5,5,8,0.97)] backdrop-blur-[10px] shrink-0">
//             <button
//              onClick={() => onClose(comments.length)}
//               className="bg-transparent border-none text-white cursor-pointer p-1 flex items-center min-w-9 min-h-9"
//             >
//               <ChevronLeft size={22} />
//             </button>
//             <div className="flex flex-col flex-1 min-w-0">
//               <h2 className="text-[12px] font-bold text-white m-0 uppercase tracking-[0.03em]">
//                 Post
//               </h2>
//               <p className="text-[9px] text-[#9494AD] mt-0.5 mb-0">
//                 Posted by {post.fan?.username || post.authorUsername} •{" "}
//                 {formatTimeAgo(post.createdAt)} • {comments.length} comments
//               </p>
//             </div>
//           </div>
//         )}

//         {/* Desktop header */}
//         {!isMobile && (
//           <div className="flex items-center gap-3 px-5 py-3 border-b border-[#252538] bg-[rgba(5,5,8,0.97)] backdrop-blur-[10px] shrink-0">
//             <button
//               onClick={() => onClose(comments.length)}
//               className="bg-transparent border-none text-white cursor-pointer p-1 flex items-center min-w-9 min-h-9"
//             >
//               <ChevronLeft size={22} />
//             </button>
//             <h2 className="text-[12px] font-bold text-white m-0 uppercase tracking-[0.03em]">
//               Post Details
//             </h2>
//             <p className="text-[9px] text-[#9494AD] m-0">{comments.length} comments</p>
//           </div>
//         )}

//         {/* Scrollable area */}
//         <div
//           ref={scrollRef}
//           className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden [-webkit-overflow-scrolling:touch] px-5 pt-4 bg-gradient-to-b from-[#050508] to-[#0b0b12] ${isMobile ? "pb-[100px]" : "pb-[80px]"
//             }`}
//         >
//           {/* Post card */}
//           <div className="p-4 mb-5 bg-white/[0.03] border border-white/[0.06] rounded-[20px]">
//             <div className="flex gap-2.5 items-center mb-3">
//               <AvatarWithBadge
//                 username={post.fan?.username || post.authorUsername}
//                 badge={post.fan?.badge || post.authorBadge}
//                 size="sm"
//                 avatarUrl={
//                   post.fan?.avatarUrl ||
//                   post.authorAvatarUrl ||
//                   post.avatarUrl ||
//                   ((post.fan?.username || post.authorUsername) === activeUsername
//                     ? userAvatarUrl
//                     : undefined)
//                 }
//               />
//               <div>
//                 <p className="font-bold text-[13px] text-white m-0 flex items-center gap-1">
//                   {post.fan?.username || post.authorUsername}
//                   <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] inline-block" />
//                 </p>
//                 <p className="text-[10px] text-[#9494AD] m-0">{formatTimeAgo(post.createdAt)}</p>
//               </div>
//             </div>

//             <p className="font-semibold text-[15px] leading-[1.5] mb-3 text-white">{post.text}</p>

//             {post.mediaUrls && post.mediaUrls.length > 0 && (
//               <div className="flex flex-col gap-2 mb-3">
//                 {post.mediaUrls.map((url: string, idx: number) => {
//                   const isVideo = url.endsWith(".mp4") || url.includes("/video/upload/");
//                   return isVideo ? (
//                     <video
//                       key={idx}
//                       src={url}
//                       controls
//                       className="w-full max-h-[300px] rounded-xl object-cover"
//                     />
//                   ) : (
//                     <img
//                       key={idx}
//                       src={url}
//                       alt="Post Media"
//                       className="w-full max-h-[300px] rounded-xl object-cover"
//                     />
//                   );
//                 })}
//               </div>
//             )}

//             {post.type === "hot_take" && (
//               <>
//                 <div className="mb-2.5">
//                   <SplitBar left={pct} />
//                 </div>
//                 <div className="flex gap-2 mt-3">
//                   {[
//                     {
//                       agree: true,
//                       label: "Agree",
//                       active: userVote === true,
//                       color: "#E91E8C",
//                     },
//                     {
//                       agree: false,
//                       label: "Disagree",
//                       active: userVote === false,
//                       color: "#FF6B35",
//                     },
//                   ].map(({ agree, label, active, color }) => (
//                     <button
//                       key={label}
//                       onClick={() => handleVoteClick(agree)}
//                       className="flex-1 py-3 rounded-full text-[13px] font-bold cursor-pointer transition-all duration-[220ms] ease-in-out border-[2.5px]"
//                       style={{
//                         borderColor: color,
//                         background: active ? color : "rgba(255,255,255,0.02)",
//                         color: active ? "white" : color,
//                       }}
//                     >
//                       {active ? `✓ ${label}d` : label}
//                     </button>
//                   ))}
//                 </div>
//               </>
//             )}

//             <div className="flex items-center mt-4 border-t border-white/[0.06] pt-3">
//               {(post.fan?.username === activeUsername ||
//                 post.authorUsername === activeUsername) && (
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       if (window.confirm("Delete this post?")) {
//                         if (onDeletePost) {
//                           onDeletePost(post.id, post.roomId);
//                           onClose();
//                         }
//                       }
//                     }}
//                     className="flex items-center justify-center bg-transparent border-none cursor-pointer text-[#f87171] ml-auto p-1 rounded-full"
//                   >
//                     <Trash2 size={16} />
//                   </button>
//                 )}
//             </div>
//           </div>

//           {/* Comments heading */}
//           <div className="flex justify-between items-center mb-3">
//             <span className="text-[11px] font-extrabold text-white tracking-[0.06em] uppercase">
//               Comments
//             </span>
//             <span className="text-[10px] text-[#9494AD]">{comments.length} total</span>
//           </div>

//           {/* Comments list */}
//           <div className="flex flex-col gap-3 pb-2">
//             {comments.length === 0 ? (
//               <p className="text-[13px] text-[#4A4A62] text-center py-5">
//                 No comments yet. Be the first!
//               </p>
//             ) : (
//               comments.map((comment) => {
//                 const isReply = comment.text.trim().startsWith("@");
//                 return (
//                   <div
//                     key={comment.commentId}
//                     className={`relative p-3 px-[14px] rounded-2xl bg-white/[0.03] border border-white/[0.05] flex flex-col gap-1.5 ${isReply ? "ml-6" : "ml-0"
//                       }`}
//                   >
/**
 * PostDetailsOverlay — HomeFeed variant.
 * Uses position:fixed, offset by the global header + sidebar on desktop,
 * and by headerHeight top + bottomNavHeight bottom on mobile.
 * Do NOT use this from DiscussionRoom — use RoomPostDetailsOverlay instead.
 */



// import { useState, useEffect, useCallback, useRef } from "react";
// import { AnimatePresence } from "framer-motion";
// import axios from "axios";
// import AvatarWithBadge from "./AvatarWithBadge";
// import { SplitBar } from "./shared";
// import { clamp, formatTimeAgo } from "../utils";
// import { ChevronLeft, Trash2, X, User, Loader2 } from "lucide-react";

// interface Props {
//   post: any;
//   onClose: (replyCount?: number) => void;
//   onToast: (m: string) => void;
//   onVote: (id: string, vote: "agree" | "disagree" | null) => void;
//   onDeletePost?: (id: string, roomId?: string) => void;
//   currentUsername?: string;
//   currentAvatarUrl?: string;
//   onFanProfileClick?: (fan: any) => void;
// }

// interface MentionUser {
//   userId: string;
//   username: string;
//   firstName?: string;
//   lastName?: string;
//   name?: string;
//   avatarUrl?: string;
//   email?: string;
// }

// export default function PostDetailsOverlay({
//   post,
//   onClose,
//   onToast,
//   onVote,
//   onDeletePost,
//   currentUsername,
//   currentAvatarUrl,
//   onFanProfileClick,
// }: Props) {
//   const [comments, setComments] = useState<any[]>([]);
//   const [commentText, setCommentText] = useState("");
//   const [replyTo, setReplyTo] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [userUsername, setUserUsername] = useState("RoarUser");
//   const activeUsername = currentUsername || userUsername;
//   const [userBadge, setUserBadge] = useState("RISING_FAN");
//   const [userAvatarUrl, setUserAvatarUrl] = useState<string | undefined>(currentAvatarUrl);
//   const [votes, setVotes] = useState<Record<string, boolean | null>>(() =>
//     post.userVote ? { [post.id]: post.userVote === "agree" } : {},
//   );
//   const [pct, setPct] = useState(post.agreePercent ?? 50);
//   const inputRef = useRef<HTMLInputElement>(null);
//   const scrollRef = useRef<HTMLDivElement>(null);

//   const [isMobile, setIsMobile] = useState(false);
//   const [headerHeight, setHeaderHeight] = useState(0);
//   const [sidebarWidth, setSidebarWidth] = useState(0);
//   const BOTTOM_NAV_HEIGHT = 60; // matches BottomNav height in CSS

//   const [mentionUsers, setMentionUsers] = useState<MentionUser[]>([]);
//   const [showMentionPopup, setShowMentionPopup] = useState(false);
//   const [mentionIndex, setMentionIndex] = useState(0);
//   const [cursorPosition, setCursorPosition] = useState(0);
//   const [allUsers, setAllUsers] = useState<MentionUser[]>([]);

//   useEffect(() => {
//     const measure = () => {
//       const mobile = window.innerWidth < 768;
//       setIsMobile(mobile);
//       const header = document.querySelector("header");
//       setHeaderHeight(header ? header.getBoundingClientRect().height : 0);
//       if (!mobile) {
//         const sidebar = document.querySelector("aside");
//         setSidebarWidth(sidebar ? sidebar.getBoundingClientRect().width : 84);
//       } else {
//         setSidebarWidth(0);
//       }
//     };
//     measure();
//     window.addEventListener("resize", measure);
//     const sidebar = document.querySelector("aside");
//     let ro: ResizeObserver | null = null;
//     if (sidebar) {
//       ro = new ResizeObserver(entries => {
//         if (window.innerWidth < 768) return;
//         setSidebarWidth(entries[0]?.contentRect.width ?? 0);
//       });
//       ro.observe(sidebar);
//     }
//     return () => { window.removeEventListener("resize", measure); ro?.disconnect(); };
//   }, []);

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
//         .map((u: any) => ({ userId: u.userId || u.id, username: u.username, firstName: u.firstName, lastName: u.lastName, name: u.name, avatarUrl: u.avatarUrl || u.avatar, email: u.email }))
//         .filter((u: MentionUser) => {
//           const key = u.userId || u.username;
//           if (!key || seen.has(key)) return false;
//           const dn = u.username || u.name || `${u.firstName || ""}${u.lastName || ""}`.trim();
//           if (dn.includes("_")) return false;
//           seen.add(key); return true;
//         }));
//     }).catch(() => {});
//   }, [activeUsername]);

//   useEffect(() => {
//     try {
//       setUserUsername(localStorage.getItem("roar_username") || "RoarUser");
//       setUserBadge(localStorage.getItem("roar_badge") || "RISING_FAN");
//       setUserAvatarUrl(currentAvatarUrl || localStorage.getItem("roar_avatar_url") || undefined);
//     } catch {}
//   }, [currentAvatarUrl]);

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     const cur = e.target.selectionStart || 0;
//     setCommentText(value); setCursorPosition(cur);
//     const before = value.slice(0, cur);
//     const at = before.lastIndexOf("@");
//     if (at !== -1) {
//       const afterAt = before.slice(at + 1);
//       if (!afterAt.includes(" ")) {
//         const filtered = afterAt.trim() === ""
//           ? allUsers.slice(0, 8)
//           : allUsers.filter(u => `${u.username||""} ${u.firstName||""} ${u.lastName||""} ${u.email||""}`.toLowerCase().includes(afterAt.toLowerCase())).slice(0, 8);
//         setMentionUsers(filtered); setShowMentionPopup(filtered.length > 0); setMentionIndex(0); return;
//       }
//     }
//     setShowMentionPopup(false); setMentionUsers([]);
//   };

//   const insertMention = (user: MentionUser) => {
//     const dn = user.username || user.name || `${user.firstName||""} ${user.lastName||""}`.trim() || user.email?.split("@")[0] || "user";
//     const mt = `@${dn} `;
//     const before = commentText.slice(0, cursorPosition);
//     const at = before.lastIndexOf("@");
//     setCommentText(`${commentText.slice(0, at)}${mt}${commentText.slice(cursorPosition)}`);
//     setShowMentionPopup(false); setMentionUsers([]);
//     setTimeout(() => { if (inputRef.current) { const p = at + mt.length; inputRef.current.focus(); inputRef.current.setSelectionRange(p, p); } }, 10);
//   };

//   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (showMentionPopup && mentionUsers.length > 0) {
//       if (e.key === "ArrowDown") { e.preventDefault(); setMentionIndex(p => (p+1) % mentionUsers.length); }
//       else if (e.key === "ArrowUp") { e.preventDefault(); setMentionIndex(p => (p-1+mentionUsers.length) % mentionUsers.length); }
//       else if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); if (mentionUsers[mentionIndex]) insertMention(mentionUsers[mentionIndex]); }
//       else if (e.key === "Escape") { setShowMentionPopup(false); setMentionUsers([]); }
//     } else if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitComment(); }
//   };

//   const fetchComments = useCallback(async () => {
//     if (!post?.id) return;
//     try {
//       const res = await axios.get(`/api/roar/posts/${post.id}/comments`, { params: { roomId: post.roomId } });
//       if (res.data?.success) setComments(res.data.comments);
//     } catch {}
//   }, [post]);

//   useEffect(() => { fetchComments(); }, [fetchComments]);

//   const submitComment = async () => {
//     const fullText = replyTo ? `@${replyTo} ${commentText.trim()}` : commentText.trim();
//     if (!fullText) return;
//     try {
//       setLoading(true);
//       const res = await axios.post(`/api/roar/posts/${post.id}/comments`, { text: fullText, roomId: post.roomId });
//       if (res.data?.success) {
//         setCommentText(""); setReplyTo(null); fetchComments(); onToast("Comment posted!");
//         setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }), 400);
//       }
//     } catch { onToast("Error posting comment"); }
//     finally { setLoading(false); }
//   };

//   const reactToComment = async (commentId: string) => {
//     try {
//       const res = await axios.post(`/api/roar/posts/${post.id}/comments/${commentId}/react`);
//       if (res.data?.success) setComments(p => p.map(c => c.commentId === commentId ? { ...c, heartCount: res.data.heartCount } : c));
//     } catch {}
//   };

//   const userVote = votes[post.id];
//   const handleVoteClick = (agree: boolean) => {
//     const prev = votes[post.id]; let nextVote: boolean | null = agree;
//     if (prev === agree) nextVote = null;
//     setVotes(v => ({ ...v, [post.id]: nextVote }));
//     let delta = 0;
//     if (post.userVote === "agree") delta = nextVote === true ? 0 : nextVote === false ? -8 : -4;
//     else if (post.userVote === "disagree") delta = nextVote === true ? 8 : nextVote === false ? 0 : 4;
//     else delta = nextVote === true ? 4 : nextVote === false ? -4 : 0;
//     setPct(clamp(post.agreePercent + delta, 1, 99));
//     onVote(post.id, nextVote === true ? "agree" : nextVote === false ? "disagree" : null);
//   };

//   const canSubmit = commentText.trim().length > 0;

//   return (
//     <AnimatePresence>
//       <div
//         className="fixed z-[1000] flex flex-col overflow-hidden pointer-events-auto bg-[#050508]"
//         style={{
//           top: headerHeight,
//           left: sidebarWidth,
//           right: 0,
//           // On mobile stop above the bottom nav so the composer is always visible
//           bottom: isMobile ? BOTTOM_NAV_HEIGHT : 0,
//         }}
//       >
//         {isMobile && (
//           <div className="flex items-center gap-[14px] pt-30 px-5 py-4 border-b border-[#252538] bg-[rgba(5,5,8,0.97)] backdrop-blur-[10px] shrink-0">
//             <button onClick={() => onClose(comments.length)} className="bg-transparent border-none text-white cursor-pointer p-1 flex items-center min-w-9 min-h-9">
//               <ChevronLeft size={22} />
//             </button>
//             <div className="flex flex-col flex-1 min-w-0">
//               <h2 className="text-[12px] font-bold text-white m-0 uppercase tracking-[0.03em]">Post</h2>
//               <p className="text-[9px] text-[#9494AD] mt-0.5 mb-0">
//                 Posted by {post.fan?.username || post.authorUsername} • {formatTimeAgo(post.createdAt)} • {comments.length} comments
//               </p>
//             </div>
//           </div>
//         )}

//         {!isMobile && (
//           <div className="flex items-center gap-3 px-5 pt-30 lg:pt-0 py-3 border-b border-[#252538] bg-[rgba(5,5,8,0.97)] backdrop-blur-[10px] shrink-0">
//             <button onClick={() => onClose(comments.length)} className="bg-transparent border-none text-white cursor-pointer p-1 flex items-center min-w-9 min-h-9">
//               <ChevronLeft size={22} />
//             </button>
//             <h2 className="text-[12px] font-bold text-white m-0 uppercase tracking-[0.03em]">Post Details</h2>
//             <p className="text-[9px] text-[#9494AD] m-0">{comments.length} comments</p>
//           </div>
//         )}

//         <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden [-webkit-overflow-scrolling:touch] px-5 pt-4 pb-4 bg-gradient-to-b from-[#050508] to-[#0b0b12]">
//           <div className="p-4 mb-5 bg-white/[0.03] border border-white/[0.06] rounded-[20px]">
//             <div 
//               style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12, cursor: onFanProfileClick ? "pointer" : "default" }}
//               onClick={(e) => {
//                 if (onFanProfileClick) {
//                   e.stopPropagation();
//                   onFanProfileClick(
//                     post.fan || { username: post.authorUsername, badge: post.authorBadge, avatarUrl: post.authorAvatarUrl || post.avatarUrl }
//                   );
//                 }
//               }}
//             >
//               <AvatarWithBadge
//                 username={post.fan?.username || post.authorUsername}
//                 badge={post.fan?.badge || post.authorBadge}
//                 size="sm"
//                 avatarUrl={post.fan?.avatarUrl || post.authorAvatarUrl || post.avatarUrl || ((post.fan?.username || post.authorUsername) === activeUsername ? userAvatarUrl : undefined)}
//               />
//               <div>
//                 <p className="font-bold text-[13px] text-white m-0 flex items-center gap-1">
//                   {post.fan?.username || post.authorUsername}
//                   <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] inline-block" />
//                 </p>
//                 <p className="text-[10px] text-[#9494AD] m-0">{formatTimeAgo(post.createdAt)}</p>
//               </div>
//             </div>
//             <p className="font-semibold text-[15px] leading-[1.5] mb-3 text-white">{post.text}</p>
//             {post.mediaUrls?.length > 0 && (
//               <div className="flex flex-col gap-2 mb-3">
//                 {post.mediaUrls.map((url: string, idx: number) =>
//                   url.endsWith(".mp4") || url.includes("/video/upload/")
//                     ? <video key={idx} src={url} controls className="w-full max-h-[300px] rounded-xl object-cover" />
//                     : <img key={idx} src={url} alt="" className="w-full max-h-[300px] rounded-xl object-cover" />
//                 )}
//               </div>
//             )}
//             {post.type === "hot_take" && (
//               <>
//                 <div className="mb-2.5"><SplitBar left={pct} /></div>
//                 <div className="flex gap-2 mt-3">
//                   {[{ agree: true, label: "Agree", active: userVote === true, color: "#E91E8C" }, { agree: false, label: "Disagree", active: userVote === false, color: "#FF6B35" }].map(({ agree, label, active, color }) => (
//                     <button key={label} onClick={() => handleVoteClick(agree)} className="flex-1 py-3 rounded-full text-[13px] font-bold cursor-pointer transition-all duration-[220ms] border-[2.5px]"
//                       style={{ borderColor: color, background: active ? color : "rgba(255,255,255,0.02)", color: active ? "white" : color }}>
//                       {active ? `✓ ${label}d` : label}
//                     </button>
//                   ))}
//                 </div>
//               </>
//             )}
//             <div className="flex items-center mt-4 border-t border-white/[0.06] pt-3">
//               {(post.fan?.username === activeUsername || post.authorUsername === activeUsername) && (
//                 <button onClick={(e) => { e.stopPropagation(); if (window.confirm("Delete this post?")) { onDeletePost?.(post.id, post.roomId); onClose(); } }}
//                   className="flex items-center justify-center bg-transparent border-none cursor-pointer text-[#f87171] ml-auto p-1 rounded-full">
//                   <Trash2 size={16} />
//                 </button>
//               )}
//             </div>
//           </div>

//           <div className="flex justify-between items-center mb-3">
//             <span className="text-[11px] font-extrabold text-white tracking-[0.06em] uppercase">Comments</span>
//             <span className="text-[10px] text-[#9494AD]">{comments.length} total</span>
//           </div>

//           <div className="flex flex-col gap-3 pb-2">
//             {comments.length === 0 ? (
//               <p className="text-[13px] text-[#4A4A62] text-center py-5">No comments yet. Be the first!</p>
//             ) : comments.map((comment) => {
//               const isReply = comment.text.trim().startsWith("@");
//               return (
//                 <div key={comment.commentId} className={`relative p-3 px-[14px] rounded-2xl bg-white/[0.03] border border-white/[0.05] flex flex-col gap-1.5 ${isReply ? "ml-6" : "ml-0"}`}>
//                   {isReply && <div className="absolute -left-[14px] top-[-12px] bottom-1/2 w-3 border-l-[1.5px] border-b-[1.5px] border-white/[0.12] rounded-bl-lg pointer-events-none" />}
//                   <div className="flex justify-between items-center">
//                     <div 
//                       className="flex gap-2 items-center"
//                       style={{ cursor: onFanProfileClick ? "pointer" : "default" }}
//                       onClick={(e) => {
//                         if (onFanProfileClick) {
//                           e.stopPropagation();
//                           onFanProfileClick({
//                             username: comment.authorUsername,
//                             badge: comment.authorBadge,
//                             avatarUrl: comment.authorAvatarUrl || comment.avatarUrl,
//                           });
//                         }
//                       }}
//                     >
//                       <AvatarWithBadge username={comment.authorUsername} badge={comment.authorBadge} size="sm" avatarUrl={comment.authorAvatarUrl || comment.avatarUrl || (comment.authorUsername === activeUsername ? userAvatarUrl : undefined)} />
//                       <p className="font-bold text-[12px] text-white m-0">{comment.authorUsername}</p>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <span className="text-[9px] text-[#4A4A62]">{formatTimeAgo(comment.createdAt)}</span>
//                       {comment.authorUsername === activeUsername && (
//                         <button onClick={async (e) => { e.stopPropagation(); if (window.confirm("Delete comment?")) { try { await axios.delete(`/api/roar/posts/${post.id}/comments/${comment.commentId}`); onToast("Deleted"); fetchComments(); } catch { onToast("Failed"); } } }}
//                           className="bg-transparent border-none text-[#f87171] cursor-pointer flex items-center p-0.5"><Trash2 size={12} /></button>
//                       )}
//                     </div>
//                   </div>
//                   <p className="text-[13px] text-[#F5F5FA] leading-[1.4] my-1">{comment.text}</p>
//                   <div className="flex gap-[14px] items-center mt-1">
//                     <button onClick={() => reactToComment(comment.commentId)} className={`bg-transparent border-none cursor-pointer flex items-center gap-1 text-[12px] p-0 ${comment.heartCount > 0 ? "text-white" : "text-[#4A4A62]"}`}>
//                       🤍 {comment.heartCount ?? 0}
//                     </button>
//                     <button onClick={() => { setReplyTo(comment.authorUsername); setCommentText(""); setTimeout(() => inputRef.current?.focus(), 50); }}
//                       className="bg-transparent border-none cursor-pointer text-[11px] text-[#4A4A62] font-semibold p-0">Reply</button>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>

//         {/* Composer — sits flush at the bottom of the overlay (above bottom nav) */}
//         <div className="shrink-0 bg-[rgba(5,5,8,0.97)] border-t border-[#252538] relative z-10 pb-2">
//           {replyTo && (
//             <div className="flex items-center gap-1.5 px-4 pt-1.5">
//               <span className="text-[11px] text-[#9494AD]">Replying to</span>
//               <span className="inline-flex items-center gap-1 bg-[rgba(233,30,140,0.15)] border border-[rgba(233,30,140,0.35)] rounded-full py-0.5 pl-1.5 pr-2 text-[12px] font-bold text-[#E91E8C] max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap">
//                 @{replyTo}
//                 <button onClick={() => { setReplyTo(null); setCommentText(""); }} className="bg-transparent border-none p-0 cursor-pointer text-[#E91E8C] flex items-center ml-0.5 shrink-0"><X size={11} /></button>
//               </span>
//             </div>
//           )}
//           {showMentionPopup && mentionUsers.length > 0 && (
//             <div className="absolute bottom-full left-4 right-4 mb-2 bg-[#181c24] rounded-2xl border border-[rgba(200,112,90,0.2)] overflow-hidden z-20 shadow-[0_8px_32px_rgba(0,0,0,0.4)] max-h-[300px] overflow-y-auto">
//               {mentionUsers.map((user, idx) => {
//                 const dn = user.username || user.name || `${user.firstName||""} ${user.lastName||""}`.trim() || user.email?.split("@")[0] || "user";
//                 return (
//                   <button key={user.userId} onClick={() => insertMention(user)} onMouseEnter={() => setMentionIndex(idx)}
//                     className={`flex items-center gap-3 px-4 py-2.5 w-full border-none cursor-pointer transition-colors duration-150 ${idx === mentionIndex ? "bg-[rgba(200,112,90,0.15)]" : "bg-transparent"}`}>
//                     <AvatarWithBadge username={dn} badge="RISING_FAN" size="sm" avatarUrl={user.avatarUrl} />
//                     <div className="flex-1 text-left">
//                       <p className="font-semibold text-[13px] text-white m-0">{dn}</p>
//                       {user.email && <p className="text-[10px] text-[#7a6a65] m-0">{user.email}</p>}
//                     </div>
//                     <User size={14} className="text-[#c8705a]" />
//                   </button>
//                 );
//               })}
//             </div>
//           )}
//           <p className="px-5 pt-2 pb-0 m-0 text-[10px] text-[#7a6a65]">Type @ to mention someone</p>
//           <div className="flex gap-2 items-center px-4 pt-1.5 pb-1">
//             <AvatarWithBadge username={userUsername} badge={userBadge} size="sm" avatarUrl={userAvatarUrl} />
//             <div className="flex-1">
//               <input ref={inputRef} type="text" placeholder={replyTo ? "Write your reply…" : "Share your opinion..."} value={commentText}
//                 onChange={handleInputChange} onKeyDown={handleKeyDown}
//                 className="w-full h-10 rounded-full bg-[#0E0E14] border border-[#252538] pl-4 pr-4 text-white text-[16px] outline-none" />
//             </div>
//             <button onClick={submitComment} disabled={loading || !canSubmit}
//               className={`w-[38px] h-[38px] rounded-full bg-[#E91E8C] border-none text-white flex items-center justify-center shrink-0 transition-opacity duration-200 ${canSubmit ? "cursor-pointer opacity-100" : "cursor-default opacity-50"}`}>
//               {loading ? <Loader2 size={16} className="animate-spin" /> : "↑"}
//             </button>
//           </div>
//         </div>
//       </div>
//     </AnimatePresence>
//   );
// }





// PostDetailsOverlay.tsx — 

import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { usePostHog } from "posthog-js/react";
import axios from "axios";
import AvatarWithBadge from "./AvatarWithBadge";
import { SplitBar } from "./shared";
import { clamp, formatTimeAgo } from "../utils";
import { ChevronLeft, Trash2, X, User, Loader2 } from "lucide-react";
import { useUserProfile } from "@/context/UserProfileContext";

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

export default function PostDetailsOverlay({
  post,
  onClose,
  onToast,
  onVote,
  onDeletePost,
  currentUsername,
  currentUserId: propCurrentUserId,
  currentAvatarUrl,
  onFanProfileClick,
  roomName,
}: Props) {
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<{ commentId: string; authorUsername: string } | null>(null);
  const [loading, setLoading] = useState(false);
  // const [userUsername, setUserUsername] = useState("RoarUser");
  // const activeUsername = currentUsername || userUsername;
  // const [userBadge, setUserBadge] = useState("RISING_FAN");
  // const [userAvatarUrl, setUserAvatarUrl] = useState<string | undefined>(currentAvatarUrl);
  const { userProfile } = useUserProfile();
  const activeUsername = currentUsername || userProfile?.username || userProfile?.name || "RoarUser";
  const currentUserId = propCurrentUserId || userProfile?.actualUserId;
  const userBadge = userProfile?.badge || "RISING_FAN";
  const userAvatarUrl = currentAvatarUrl || userProfile?.avatarUrl || userProfile?.avatar || undefined;
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

  const hasUnderscore = (u: any) => {
    const n = u.username || u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim();
    return n.includes("_") || (u.email || "").split("@")[0].includes("_");
  };

  const phog = usePostHog();

  useEffect(() => {
    // Fire content_completed when user opens a post
    if (phog) { phog.capture("content_completed", { post_id: post?.id }); }
    axios.get("/api/users", { withCredentials: true }).then(res => {
      if (!res.data?.users) return;
      const seen = new Set<string>();
      setAllUsers(res.data.users
        .filter((u: any) => {
          const n = u.username || u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim();
          return n !== activeUsername && !hasUnderscore(u);
        })
        .map((u: any) => ({ userId: u.userId || u.id, username: u.username, firstName: u.firstName, lastName: u.lastName, name: u.name, avatarUrl: u.avatarUrl || u.avatar, email: u.email }))
        .filter((u: MentionUser) => {
          const key = u.userId || u.username;
          if (!key || seen.has(key)) return false;
          const dn = u.username || u.name || `${u.firstName || ""}${u.lastName || ""}`.trim();
          if (dn.includes("_")) return false;
          seen.add(key); return true;
        }));
    }).catch(() => { });
  }, [activeUsername]);

  // useEffect(() => {
  //   try {
  //     setUserUsername(localStorage.getItem("roar_username") || "RoarUser");
  //     setUserBadge(localStorage.getItem("roar_badge") || "RISING_FAN");
  //     setUserAvatarUrl(currentAvatarUrl || localStorage.getItem("roar_avatar_url") || undefined);
  //   } catch {}
  // }, [currentAvatarUrl]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cur = e.target.selectionStart || 0;
    setCommentText(value); setCursorPosition(cur);
    const before = value.slice(0, cur);
    const at = before.lastIndexOf("@");
    if (at !== -1) {
      const afterAt = before.slice(at + 1);
      if (!afterAt.includes(" ")) {
        const filtered = afterAt.trim() === ""
          ? allUsers.slice(0, 8)
          : allUsers.filter(u => `${u.username || ""} ${u.firstName || ""} ${u.lastName || ""} ${u.email || ""}`.toLowerCase().includes(afterAt.toLowerCase())).slice(0, 8);
        setMentionUsers(filtered); setShowMentionPopup(filtered.length > 0); setMentionIndex(0); return;
      }
    }
    setShowMentionPopup(false); setMentionUsers([]);
  };

  const insertMention = (user: MentionUser) => {
    const dn = user.username || user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email?.split("@")[0] || "user";
    const mt = `@${dn} `;
    const before = commentText.slice(0, cursorPosition);
    const at = before.lastIndexOf("@");
    setCommentText(`${commentText.slice(0, at)}${mt}${commentText.slice(cursorPosition)}`);
    setShowMentionPopup(false); setMentionUsers([]);
    setTimeout(() => { if (inputRef.current) { const p = at + mt.length; inputRef.current.focus(); inputRef.current.setSelectionRange(p, p); } }, 10);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showMentionPopup && mentionUsers.length > 0) {
      if (e.key === "ArrowDown") { e.preventDefault(); setMentionIndex(p => (p + 1) % mentionUsers.length); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setMentionIndex(p => (p - 1 + mentionUsers.length) % mentionUsers.length); }
      else if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); if (mentionUsers[mentionIndex]) insertMention(mentionUsers[mentionIndex]); }
      else if (e.key === "Escape") { setShowMentionPopup(false); setMentionUsers([]); }
    } else if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitComment(); }
  };

  const fetchComments = useCallback(async () => {
    if (!post?.id) return;
    try {
      const res = await axios.get(`/api/roar/posts/${post.id}/comments`, { params: { roomId: post.roomId } });
      if (res.data?.success) setComments(res.data.comments);
    } catch { }
  }, [post]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  const submitComment = async () => {
    const fullText = replyTo ? `@${replyTo.authorUsername} ${commentText.trim()}` : commentText.trim();
    if (!fullText) return;
    try {
      setLoading(true);
      const res = await axios.post(`/api/roar/posts/${post.id}/comments`, {
        text: fullText,
        roomId: post.roomId,
        parentCommentId: replyTo?.commentId,
      });
      if (res.data?.success) {
        setCommentText(""); setReplyTo(null); fetchComments(); onToast("Comment posted!");
        if (phog) {
          phog.capture("post_comment", {
            post_id: post.id,
            room_id: post.roomId,
            room_name: roomName || ""
          });
        }
        setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }), 400);
      }
    } catch { onToast("Error posting comment"); }
    finally { setLoading(false); }
  };

  const buildCommentTree = (flatComments: any[]) => {
    const nodes = flatComments.map((comment) => ({
      ...comment,
      commentId: comment.commentId || comment.id,
      parentCommentId: comment.parentCommentId || comment.parentId || comment.replyToId || null,
      replies: [],
    }));

    const map = new Map<string, any>();
    nodes.forEach((c) => map.set(c.commentId, c));

    // Try to infer parent from @mentions when explicit parent missing
    nodes.forEach((comment) => {
      if (comment.parentCommentId) return;
      const mentionMatch = comment.text?.trim()?.match(/^@([\w\.\-_]+)/i);
      if (!mentionMatch?.[1]) return;
      const mentionName = mentionMatch[1].toLowerCase();
      const parent = nodes.find((n) => n.authorUsername?.toLowerCase() === mentionName && n.commentId !== comment.commentId && n.createdAt <= comment.createdAt);
      if (parent) comment.parentCommentId = parent.commentId;
    });

    const roots: any[] = [];
    nodes.forEach((comment) => {
      const parentId = comment.parentCommentId;
      if (parentId && map.has(parentId)) map.get(parentId).replies.push(comment);
      else roots.push(comment);
    });

    return roots;
  };

  const renderComment = (comment: any, depth = 0) => {
    const id = comment.commentId || comment.id;
    const hasReplies = comment.replies && comment.replies.length > 0;
    const isReply = depth > 0;
    return (
      <div key={id} className={`${isReply ? "relative ml-6 pl-4 border-l border-white/[0.08]" : "relative rounded-[22px] bg-white/[0.03] border border-white/[0.06] p-4 hover:bg-white/[0.04]"}`}>
        {isReply && <div className="absolute left-0 top-1 bottom-1 w-[1px] bg-white/[0.08] rounded-full" />}
        <div className="flex justify-between items-start gap-3">
          <div
            className="flex gap-2 items-start"
            style={{ cursor: onFanProfileClick ? "pointer" : "default" }}
            onClick={(e) => {
              if (onFanProfileClick) { e.stopPropagation(); onFanProfileClick({ username: comment.authorUsername, badge: comment.authorBadge, avatarUrl: comment.authorAvatarUrl || comment.avatarUrl }); }
            }}
          >
            <AvatarWithBadge username={comment.authorUsername} badge={comment.authorBadge} size="sm" avatarUrl={comment.authorAvatarUrl || comment.avatarUrl || (comment.authorUsername === activeUsername ? userAvatarUrl : undefined)} />
            <div>
              <p className="font-semibold text-[12px] text-white m-0">{comment.authorUsername}</p>
              <p className="text-[10px] text-[#7D7DA8] m-0">{formatTimeAgo(comment.createdAt)}</p>
            </div>
          </div>
          {comment.authorUsername === activeUsername && (
            <button onClick={async (e) => { e.stopPropagation(); if (window.confirm("Delete comment?")) { try { await  onToast("Deleted"); fetchComments(); } catch { onToast("Failed"); } } }} className="bg-transparent border-none text-[#f87171] cursor-pointer flex items-center p-0.5"><Trash2 size={12} /></button>
          )}
        </div>
        <p className={`text-[14px] ${isReply ? "text-[#EAEAF1]" : "text-[#F5F5FA]"} leading-[1.7] my-3`}>{comment.text}</p>
        <div className="flex flex-wrap items-center gap-4 text-[12px] text-[#8A8AA9]">
          <button onClick={() => reactToComment(id)} className="bg-transparent border-none cursor-pointer flex items-center gap-2 text-inherit p-0 hover:text-white transition-colors duration-150">
            <span className="text-sm">🤍</span>
            <span>{comment.heartCount ?? 0}</span>
          </button>
          <button onClick={() => { setReplyTo({ commentId: id, authorUsername: comment.authorUsername }); setCommentText(""); setTimeout(() => inputRef.current?.focus(), 50); }} className="bg-transparent border-none cursor-pointer text-[#C8705A] font-semibold p-0 hover:text-white transition-colors duration-150">Reply</button>
        </div>
        {hasReplies && (
          <div className="mt-4 space-y-3">{comment.replies.map((r: any) => renderComment(r, depth + 1))}</div>
        )}
      </div>
    );
  };

  const reactToComment = async (commentId: string) => {
    try {
      const res = await axios.post(`/api/roar/posts/${post.id}/comments/${commentId}/react`);
      if (res.data?.success) setComments(p => p.map(c => c.commentId === commentId ? { ...c, heartCount: res.data.heartCount } : c));
    } catch { }
  };

  const userVote = votes[post.id];
  const currentUserIdCandidates = [
    currentUserId,
    (userProfile as { userId?: string })?.userId,
    (userProfile as { uid?: string })?.uid,
    (userProfile as { email?: string })?.email,
  ].filter(Boolean).map(String);
  const isCurrentUserAuthor = () => {
    const authorCandidates = [post.authorUid, post.fan?.authorUid, post.authorEmail].filter(Boolean).map(String);
    return authorCandidates.some(id => currentUserIdCandidates.includes(id));
  };
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
  const resolvePrediction = async (correctVote: string) => {
    try {
      setResolvingPrediction(true);
      const res = await axios.post(`/api/roar/posts/${post.id}/resolve`, { correctVote });
      if (res.data?.success) {
        const resolvedAt = res.data.post?.resolvedAt ?? Date.now();
        setLocalResolution({ resolvedAt, closedAt: res.data.post?.closedAt ?? resolvedAt, correctVote });
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
    const prev = votes[post.id]; let nextVote: boolean | null = agree;
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
      {/* ✅ Changed: absolute inset-0 (same as RoomPostDetailsOverlay) — no more fixed+measurement gaps */}
      <div className="absolute inset-0 z-[1000] flex flex-col overflow-hidden pointer-events-auto bg-[#050508]">

        {/* Single unified header (works for both mobile & desktop) */}
        <div className="flex items-center gap-[14px] px-5 py-4 border-b border-[#252538] bg-[rgba(5,5,8,0.97)] backdrop-blur-[10px] shrink-0">
          <button onClick={() => onClose(comments.length)} className="bg-transparent border-none text-white cursor-pointer p-1 flex items-center min-w-9 min-h-9">
            <ChevronLeft size={22} />
          </button>
          <div className="flex flex-col flex-1 min-w-0">
            <h2 className="text-[12px] font-bold text-white m-0 uppercase tracking-[0.03em]">Post</h2>
            <p className="text-[9px] text-[#9494AD] mt-0.5 mb-0">
              Posted by {post.fan?.username || post.authorUsername} • {formatTimeAgo(post.createdAt)} • {comments.length} comments
            </p>
          </div>
        </div>

        {/* Scrollable content */}
        <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden [-webkit-overflow-scrolling:touch] px-5 pt-4 pb-4 bg-gradient-to-b from-[#050508] to-[#0b0b12]">
          <div className="p-4 mb-5 bg-white/[0.03] border border-white/[0.06] rounded-[20px]">
            <div
              style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12, cursor: onFanProfileClick ? "pointer" : "default" }}
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
                avatarUrl={post.fan?.avatarUrl || post.authorAvatarUrl || post.avatarUrl || ((post.fan?.username || post.authorUsername) === activeUsername ? userAvatarUrl : undefined)}
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
                        <button key={`resolve-${label}-${optionIndex}`} type="button" disabled={resolvingPrediction} onClick={(e) => { e.stopPropagation(); resolvePrediction(getPredictionVoteValue(optionIndex)); }} style={{ flex: "1 1 calc(50% - 4px)", minWidth: 0, padding: "9px 10px", borderRadius: 12, border: "1px solid rgba(34,197,94,0.35)", background: "rgba(34,197,94,0.1)", color: "#22c55e", fontSize: 12, fontWeight: 800, cursor: resolvingPrediction ? "wait" : "pointer" }}>
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
                  {[{ agree: true, label: "Agree", active: userVote === true, color: "#E91E8C" }, { agree: false, label: "Disagree", active: userVote === false, color: "#FF6B35" }].map(({ agree, label, active, color }) => (
                    <button key={label} onClick={() => handleVoteClick(agree)} className="flex-1 py-3 rounded-full text-[13px] font-bold cursor-pointer transition-all duration-[220ms] border-[2.5px]"
                      style={{ borderColor: color, background: active ? color : "rgba(255,255,255,0.02)", color: active ? "white" : color }}>
                      {active ? `✓ ${label}d` : label}
                    </button>
                  ))}
                </div>
              </>
            )}
            <div className="flex items-center mt-4 border-t border-white/[0.06] pt-3">
              {(post.fan?.username === activeUsername || post.authorUsername === activeUsername) && (
                <button onClick={(e) => { e.stopPropagation(); if (window.confirm("Delete this post?")) { onDeletePost?.(post.id, post.roomId); onClose(); } }}
                  className="flex items-center justify-center bg-transparent border-none cursor-pointer text-[#f87171] ml-auto p-1 rounded-full">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center mb-3">
            <span className="text-[11px] font-extrabold text-white tracking-[0.06em] uppercase">Comments</span>
            <span className="text-[10px] text-[#9494AD]">{comments.length} total</span>
          </div>

          <div className="flex flex-col gap-3 pb-2">
            {comments.length === 0 ? (
              <p className="text-[13px] text-[#4A4A62] text-center py-5">No comments yet. Be the first!</p>
            ) : (
              buildCommentTree(comments).map((comment) => renderComment(comment))
            )}
          </div>
        </div>

        {/* Composer */}
        <div className="shrink-0 bg-[rgba(5,5,8,0.97)] border-t border-[#252538] relative z-10 pb-2">
          {replyTo && (
            <div className="flex items-center gap-1.5 px-4 pt-1.5">
              <span className="text-[11px] text-[#9494AD]">Replying to</span>
              <span className="inline-flex items-center gap-1 bg-[rgba(233,30,140,0.15)] border border-[rgba(233,30,140,0.35)] rounded-full py-0.5 pl-1.5 pr-2 text-[12px] font-bold text-[#E91E8C] max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap">
                @{replyTo?.authorUsername}
                <button onClick={() => { setReplyTo(null); setCommentText(""); }} className="bg-transparent border-none p-0 cursor-pointer text-[#E91E8C] flex items-center ml-0.5 shrink-0"><X size={11} /></button>
              </span>
            </div>
          )}
          {showMentionPopup && mentionUsers.length > 0 && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-[#181c24] rounded-2xl border border-[rgba(200,112,90,0.2)] overflow-hidden z-20 shadow-[0_8px_32px_rgba(0,0,0,0.4)] max-h-[300px] overflow-y-auto">
              {mentionUsers.map((user, idx) => {
                const dn = user.username || user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email?.split("@")[0] || "user";
                return (
                  <button key={user.userId} onClick={() => insertMention(user)} onMouseEnter={() => setMentionIndex(idx)}
                    className={`flex items-center gap-3 px-4 py-2.5 w-full border-none cursor-pointer transition-colors duration-150 ${idx === mentionIndex ? "bg-[rgba(200,112,90,0.15)]" : "bg-transparent"}`}>
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
            <AvatarWithBadge username={activeUsername} badge={userBadge} size="sm" avatarUrl={userAvatarUrl} />
            <div className="flex-1">
              <input ref={inputRef} type="text" placeholder={replyTo ? "Write your reply…" : "Share your opinion..."} value={commentText}
                onChange={handleInputChange} onKeyDown={handleKeyDown}
                className="w-full h-11 rounded-full bg-white/[0.04] border border-white/[0.12] pl-4 pr-4 text-white text-[16px] outline-none placeholder:text-[#8A8AA9] transition-colors duration-150 focus:border-[#E91E8C]/60 focus:bg-white/[0.08]" />
            </div>
            <button onClick={submitComment} disabled={loading || !canSubmit}
              className={`w-[38px] h-[38px] rounded-full bg-[#E91E8C] border-none text-white flex items-center justify-center shrink-0 transition-opacity duration-200 ${canSubmit ? "cursor-pointer opacity-100" : "cursor-default opacity-50"}`}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : "↑"}
            </button>
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
}
