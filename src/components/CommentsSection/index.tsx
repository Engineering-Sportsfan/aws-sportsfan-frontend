// "use client";

// import { useState } from "react";

// type CommentItem = {
//   id: string;
//   user: string;
//   initials: string;
//   postedAt: string;
//   text: string;
// };

// const defaultComments: CommentItem[] = [
//   {
//     id: "c1",
//     user: "Ayush",
//     initials: "A",
//     postedAt: "2m ago",
//     text: "Nulla quis nunc eget odio eleifend convallis non non odio.",
//   },
//   {
//     id: "c2",
//     user: "Ayush",
//     initials: "A",
//     postedAt: "6m ago",
//     text: "Nulla quis nunc eget odio eleifend convallis non non odio.",
//   },
//   {
//     id: "c3",
//     user: "Ayush",
//     initials: "A",
//     postedAt: "10m ago",
//     text: "Nulla quis nunc eget odio eleifend convallis non non odio.",
//   },
// ];

// interface CommentsSectionProps {
//   className?: string;
//   heading?: string;
//   initialComments?: CommentItem[];
// }

// export default function CommentsSection({
//   className = "",
//   heading = "Comments",
//   initialComments = defaultComments,
// }: CommentsSectionProps) {
//   const [comments, setComments] = useState<CommentItem[]>(initialComments);
//   const [commentText, setCommentText] = useState("");

//   const addComment = () => {
//     const text = commentText.trim();
//     if (!text) return;

//     setComments((prev) => [
//       {
//         id: `c${Date.now()}`,
//         user: "You",
//         initials: "Y",
//         postedAt: "Just now",
//         text,
//       },
//       ...prev,
//     ]);
//     setCommentText("");
//   };

//   return (
//     <section className={`mt-5 rounded-[24px] border border-[#26262b] bg-[#0b0b0d] px-4 py-4 ${className}`.trim()}>
//       <div className="mb-4">
//         <h2 className="text-white text-[18px] font-medium leading-none">{heading}</h2>
//       </div>

//       <div className="space-y-4">
//         {comments.map((comment) => (
//           <div key={comment.id} className="flex items-start gap-3">
//             <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-pink-500 flex items-center justify-center text-white text-[11px] font-semibold">
//               {comment.initials}
//             </div>

//             <div className="flex-1 min-w-0">
//               <div className="flex items-center justify-between gap-2">
//                 <span className="text-[13px] font-semibold text-[#9f9f9f]">{comment.user}</span>
//                 <button type="button" className="text-[#8a8a8a] text-[18px] leading-none" aria-label="More options">
//                   ⋮
//                 </button>
//               </div>
//               <p className="mt-1 text-[13px] leading-snug text-white/90 break-words">{comment.text}</p>
//               <p className="mt-1 text-[11px] text-[#6f6f74]">{comment.postedAt}</p>
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="mt-4 flex items-center gap-3 rounded-full bg-[#242427] px-4 py-2.5">
//         <input
//           type="text"
//           value={commentText}
//           onChange={(e) => setCommentText(e.target.value)}
//           onKeyDown={(e) => {
//             if (e.key === "Enter") addComment();
//           }}
//           placeholder="Add a comment"
//           className="flex-1 bg-transparent text-[14px] text-white placeholder:text-[#7f7f84] outline-none"
//         />
//         <button
//           type="button"
//           onClick={addComment}
//           className="h-12 w-12 shrink-0 rounded-full bg-gradient-to-br from-pink-500 via-pink-600 to-orange-500 flex items-center justify-center text-white shadow-[0_8px_24px_rgba(224,24,90,0.35)]"
//           aria-label="Post comment"
//         >
//           <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
//             <path d="M12 5v14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
//             <path d="M6 11l6-6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
//           </svg>
//         </button>
//       </div>
//     </section>
//   );
// }
















// src/components/CommentsSection.tsx
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { ArrowDown } from "lucide-react";

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  commentText: string;
  likes: number;
  likedBy: string[];
  createdAt: number;
  parentCommentId?: string;
  replies?: Comment[];
  replyCount?: number;
  isFlagged?: boolean;
  flaggedByAdmin?: boolean;
  flaggedBy?: string;
  flagReason?: string;
  flaggedAt?: number;
}

interface CommentsSectionProps {
  contentId: string;
  contentType: string; // "article", "audio", "video", etc.
  contentTitle?: string;
  className?: string;
}

export default function CommentsSection({
  contentId,
  contentType,
  contentTitle,
  className = "",
}: CommentsSectionProps) {
  const { user, getUserName } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [replyText, setReplyText] = useState("");
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [flaggedComment, setFlaggedComment] = useState<Comment | null>(null);

  // Fetch comments when component mounts or contentId changes
  useEffect(() => {
    if (contentId) {
      fetchComments();
    }
  }, [contentId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/comments?contentId=${contentId}&contentType=${contentType}&limit=20`);
      if (response.data.success) {
        setComments(response.data.comments || []);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReplies = async (commentId: string) => {
    if (expandedReplies.has(commentId)) {
      // Toggle off
      const newSet = new Set(expandedReplies);
      newSet.delete(commentId);
      setExpandedReplies(newSet);
      return;
    }

    try {
      const response = await axios.get(`/api/comments?parentCommentId=${commentId}&limit=10`);
      if (response.data.success) {
        // Update the comment with replies
        setComments(prevComments =>
          prevComments.map(comment =>
            comment.id === commentId
              ? { ...comment, replies: response.data.comments, replyCount: response.data.comments.length }
              : comment
          )
        );
        const newSet = new Set(expandedReplies);
        newSet.add(commentId);
        setExpandedReplies(newSet);
      }
    } catch (error) {
      console.error("Error fetching replies:", error);
    }
  };

  const addComment = async () => {
    const text = commentText.trim();
    if (!text || !user?.userId) return;

    setSubmitting(true);
    try {
      const response = await axios.post("/api/comments", {
        contentId,
        contentType,
        commentText: text,
        userId: user.userId,
        userName: getUserName(),
        userEmail: user.email,
        // userAvatar: user.photoURL || "",
        metadata: {
          contentTitle: contentTitle || "",
        },
      });

      if (response.data.success) {
        setCommentText("");
        await fetchComments(); // Refresh comments
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      alert("Failed to post comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const addReply = async (parentCommentId: string) => {
    const text = replyText.trim();
    if (!text || !user?.userId) return;

    setSubmitting(true);
    try {
      const response = await axios.post("/api/comments", {
        contentId,
        contentType,
        commentText: text,
        userId: user.userId,
        userName: getUserName(),
        userEmail: user.email,
        parentCommentId,
        metadata: {
          contentTitle: contentTitle || "",
        },
      });

      if (response.data.success) {
        setReplyText("");
        setReplyTo(null);
        // Refresh the replies for this comment
        await fetchReplies(parentCommentId);
        // Also refresh top-level comments to update reply counts
        await fetchComments();
      }
    } catch (error) {
      console.error("Error posting reply:", error);
      alert("Failed to post reply. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const likeComment = async (commentId: string) => {
    if (!user?.userId) return;

    try {
      const response = await axios.put("/api/comments", {
        commentId,
        userId: user.userId,
        action: "like",
      });

      if (response.data.success) {
        // Update local state
        setComments(prevComments =>
          prevComments.map(comment =>
            comment.id === commentId
              ? {
                ...comment,
                likes: response.data.comment.likes,
                likedBy: response.data.comment.likedBy
              }
              : comment
          )
        );
      }
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  const formatTime = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const isFlaggedComment = (comment: Comment) => Boolean(comment.isFlagged || comment.flaggedByAdmin);

  const openFlagWarning = (comment: Comment) => {
    setFlaggedComment(comment);
  };

  const closeFlagWarning = () => {
    setFlaggedComment(null);
  };

  const getFlaggedByLabel = (comment: Comment) => comment.flaggedBy || (comment.flaggedByAdmin ? "Admin" : "Moderator");

  if (loading) {
    return (
      <section className={`mt-5 rounded-[24px] border border-[#26262b] bg-[#0b0b0d] px-4 py-4 ${className}`}>
        <div className="mb-4">
          <h2 className="text-white text-[18px] font-medium">Comments</h2>
        </div>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500" />
        </div>
      </section>
    );
  }

  return (
    <section className={`mt-5 rounded-[24px] border border-[#26262b] bg-[#0b0b0d] px-4 py-4 ${className}`}>
      <div className="mb-4">
        <h2 className="text-white text-[10px] md:text-[15px] font-medium leading-none">
          Comments ({comments.length})
        </h2>
      </div>

      {/* Comments List */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-3">
              <div className="h-3 w-3 md:h-5 md:w-5 lg:h-8 lg:w-8 mt-1 shrink-0 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-pink-500 flex items-center justify-center text-white text-[6px] md:text-[11px] font-semibold">
                {comment.userName?.charAt(0).toUpperCase() || "U"}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] lg:text-[15px] font-semibold text-[#9f9f9f]">
                      {comment.userName}
                    </span>
                    <span className="text-[10px] text-[#6f6f74]">
                      {formatTime(comment.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isFlaggedComment(comment) && (
                      <button
                        type="button"
                        onClick={() => openFlagWarning(comment)}
                        className="flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-[10px] font-medium text-amber-300 hover:bg-amber-500/20 transition"
                        aria-label={`Open warning for flagged comment by ${comment.userName}`}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 9v4" />
                          <path d="M12 17h.01" />
                          <path d="M10.29 3.86L1.82 18a2 2 0 001.72 3h16.92a2 2 0 001.72-3L13.71 3.86a2 2 0 00-3.42 0z" />
                        </svg>
                        Flagged
                      </button>
                    )}
                    <button
                      onClick={() => likeComment(comment.id)}
                      className="flex items-center gap-1 text-[#8a8a8a] hover:text-pink-500 transition"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill={comment.likedBy?.includes(user?.userId || "") ? "#C9115F" : "none"} stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                      <span className="text-xs">{comment.likes || 0}</span>
                    </button>
                  </div>
                </div>
                <p className="mt-1 text-[10px] lg:text-[13px] leading-snug text-white/90 break-words">
                  {comment.commentText}
                </p>
                {isFlaggedComment(comment) && (
                  <p className="mt-1 text-[10px] text-amber-300/90">
                    This comment was flagged by {getFlaggedByLabel(comment)}.
                  </p>
                )}
                <button
                  onClick={() => setReplyTo(comment)}
                  className="mt-1 text-[11px] text-[#6f6f74] hover:text-pink-500 transition"
                >
                  {/* Reply {comment.replyCount > 0 ? `(${comment.replyCount})` : ""} */}
                  Reply
                </button>

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-2 pl-4 border-l-2 border-[#26262b] space-y-2">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex items-start gap-2">
                        <div className="h-6 w-6 shrink-0 rounded-full bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center text-white text-[9px] font-semibold">
                          {reply.userName?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold text-[#9f9f9f]">
                              {reply.userName}
                            </span>
                            <span className="text-[9px] text-[#6f6f74]">
                              {formatTime(reply.createdAt)}
                            </span>
                          </div>
                          <p className="text-[12px] text-white/90 break-words">
                            {reply.commentText}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Load more replies button */}
                {(comment.replyCount || 0) > (comment.replies?.length || 0) && (
                  <button
                    onClick={() => fetchReplies(comment.id)}
                    className="mt-1 text-[10px] text-pink-500 hover:text-pink-400 transition flex items-center whitespace-nowrap"
                  >
                    View more replies <ArrowDown className="w-3 h-3 flex shrink-0"/>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reply Input (when replying to a comment) */}
      {replyTo && (
        <div className="mt-3 mb-2 p-2 bg-[#1a1a1e] rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-400">
              Replying to <span className="text-pink-500">{replyTo.userName}</span>
            </p>
            <button
              onClick={() => setReplyTo(null)}
              className="text-gray-500 hover:text-white text-xs"
            >
              Cancel
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  addReply(replyTo.id);
                }
              }}
              placeholder="Write a reply..."
              className="flex-1 bg-[#242427] text-white text-sm rounded-full px-4 py-2 outline-none placeholder:text-[#7f7f84]"
            />
            <button
              onClick={() => addReply(replyTo.id)}
              disabled={!replyText.trim() || submitting}
              className="h-9 w-9 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center text-white disabled:opacity-50"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M6 11l6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Main Comment Input */}
      <div className="mt-4 flex items-center gap-3 rounded-full bg-[#242427] px-4 py-1.5">
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              addComment();
            }
          }}
          placeholder={user ? "Add a comment..." : "Sign in to comment..."}
          disabled={!user}
          className="flex-1 bg-transparent text-[14px] text-white placeholder:text-[#7f7f84] outline-none disabled:opacity-50"
        />
        {/* <button
                    onClick={addComment}
                    disabled={!commentText.trim() || submitting || !user}
                    className="h-12 w-12 shrink-0 rounded-full bg-gradient-to-br from-pink-500 via-pink-600 to-orange-500 flex items-center justify-center text-white shadow-[0_8px_24px_rgba(224,24,90,0.35)] disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Post comment"
                >
                    {submitting ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M12 5v14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                            <path d="M6 11l6-6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                </button> */}
        <button
          onClick={addComment}
          disabled={!commentText.trim() || submitting || !user}
          className="h-9 w-9 -ml-10 sm:h-10 sm:w-10 shrink-0 rounded-full bg-gradient-to-br from-pink-500 via-pink-600 to-orange-500 flex items-center justify-center text-white shadow-[0_8px_24px_rgba(224,24,90,0.35)] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
          aria-label="Post comment"
        >
          {submitting ? (
            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white" />
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-4 h-4 sm:w-[18px] sm:h-[18px]"
            >
              <path d="M12 5v14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M6 11l6-6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </div>
      {!user && (
        <p className="text-center text-xs text-gray-500 mt-2">
          Please sign in to join the conversation
        </p>
      )}

      {flaggedComment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6" onClick={closeFlagWarning}>
          <div
            className="w-full max-w-lg rounded-2xl border border-amber-500/30 bg-[#141417] p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-amber-300 text-sm font-semibold uppercase tracking-wide">Warning</p>
                <h3 className="mt-1 text-white text-lg font-semibold">Flagged comment</h3>
              </div>
              <button
                type="button"
                onClick={closeFlagWarning}
                className="text-gray-400 hover:text-white transition"
                aria-label="Close warning dialog"
              >
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="mt-4 space-y-3 rounded-xl border border-white/10 bg-black/20 p-3">
              <div>
                <p className="text-xs text-gray-400">Comment by</p>
                <p className="text-sm text-white font-medium">{flaggedComment.userName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Comment</p>
                <p className="text-sm text-white/90 leading-snug break-words">{flaggedComment.commentText}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400">Flagged by</p>
                  <p className="text-sm text-amber-300">{getFlaggedByLabel(flaggedComment)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Flagged status</p>
                  <p className="text-sm text-amber-300">{flaggedComment.isFlagged || flaggedComment.flaggedByAdmin ? "Needs review" : "Flagged"}</p>
                </div>
              </div>
              {flaggedComment.flagReason && (
                <div>
                  <p className="text-xs text-gray-400">Reason</p>
                  <p className="text-sm text-white/90 break-words">{flaggedComment.flagReason}</p>
                </div>
              )}
              {flaggedComment.flaggedAt && (
                <div>
                  <p className="text-xs text-gray-400">Flagged at</p>
                  <p className="text-sm text-white/90">{formatTime(flaggedComment.flaggedAt)}</p>
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={closeFlagWarning}
                className="rounded-full bg-amber-500 px-4 py-2 text-sm font-medium text-black hover:bg-amber-400 transition"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}