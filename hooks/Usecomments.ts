"use client";

import { useState, useCallback } from "react";
import axios from "axios";

export interface Comment {
  id: string;
  contentId: string;
  contentType: string;
  userId: string;
  userName: string;
  userEmail?: string;
  userAvatar?: string;
  commentText: string;
  parentCommentId?: string | null;
  likes: number;
  likedBy: string[];
  createdAt: number;
  updatedAt: number;
  replyCount?: number;
}

interface Pagination {
  hasMore: boolean;
  nextCursor: { lastDocId: string; lastDocCreatedAt: number } | null;
}

export function useComments(contentId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [replies, setReplies] = useState<Record<string, Comment[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({ hasMore: true, nextCursor: null });

  // ── Fetch top-level comments ──────────────────────────────────────────────
  const fetchComments = useCallback(
    async (reset = false) => {
      setLoading(true);
      setError(null);
      try {
        const cursor =
          !reset && pagination.nextCursor
            ? `&lastDocId=${pagination.nextCursor.lastDocId}&lastDocCreatedAt=${pagination.nextCursor.lastDocCreatedAt}`
            : "";
        const res = await axios.get(
          `/api/comments?contentId=${contentId}&limit=10${cursor}`
        );
        const json = res.data;
        if (!json.success) throw new Error(json.error);

        setComments((prev) => (reset ? json.comments : [...prev, ...json.comments]));
        setPagination(json.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch comments");
      } finally {
        setLoading(false);
      }
    },
    [contentId, pagination.nextCursor]
  );

  // ── Fetch replies for a comment ───────────────────────────────────────────
  const fetchReplies = useCallback(async (parentCommentId: string) => {
    try {
      const res = await axios.get(
        `/api/comments?parentCommentId=${parentCommentId}&limit=20`
      );
      const json = res.data;
      if (!json.success) throw new Error(json.error);
      setReplies((prev) => ({ ...prev, [parentCommentId]: json.comments }));
    } catch (err) {
      console.error("Failed to fetch replies:", err);
    }
  }, []);

  // ── Post a comment or reply ───────────────────────────────────────────────
  const postComment = useCallback(
    async (params: {
      commentText: string;
      userId: string;
      userName: string;
      userEmail?: string;
      userAvatar?: string;
      parentCommentId?: string;
    }) => {
      const res = await axios.post("/api/comments", {
        contentId,
        contentType: "socialPost",
        ...params,
      });
      const json = res.data;
      if (!json.success) throw new Error(json.error);

      if (params.parentCommentId) {
        // Append reply to the relevant thread
        setReplies((prev) => ({
          ...prev,
          [params.parentCommentId!]: [
            ...(prev[params.parentCommentId!] || []),
            json.comment,
          ],
        }));
        // Increment parent replyCount in local state
        setComments((prev) =>
          prev.map((c) =>
            c.id === params.parentCommentId
              ? { ...c, replyCount: (c.replyCount || 0) + 1 }
              : c
          )
        );
      } else {
        setComments((prev) => [json.comment, ...prev]);
      }

      return json.comment as Comment;
    },
    [contentId]
  );

  // ── Like / unlike a comment ───────────────────────────────────────────────
  const toggleLike = useCallback(async (commentId: string, userId: string, isReply = false, parentCommentId?: string) => {
    const updateList = (list: Comment[]) =>
      list.map((c) => {
        if (c.id !== commentId) return c;
        const alreadyLiked = c.likedBy.includes(userId);
        return {
          ...c,
          likes: alreadyLiked ? c.likes - 1 : c.likes + 1,
          likedBy: alreadyLiked
            ? c.likedBy.filter((id) => id !== userId)
            : [...c.likedBy, userId],
        };
      });

    // Optimistic update
    if (isReply && parentCommentId) {
      setReplies((prev) => ({
        ...prev,
        [parentCommentId]: updateList(prev[parentCommentId] || []),
      }));
    } else {
      setComments((prev) => updateList(prev));
    }

    try {
      const comment = isReply && parentCommentId
        ? replies[parentCommentId]?.find((c) => c.id === commentId)
        : comments.find((c) => c.id === commentId);
      const alreadyLiked = comment?.likedBy.includes(userId);
      await axios.put("/api/comments", {
        commentId,
        userId,
        action: alreadyLiked ? "unlike" : "like",
      });
    } catch {
      // Revert on failure
      if (isReply && parentCommentId) {
        setReplies((prev) => ({
          ...prev,
          [parentCommentId]: updateList(prev[parentCommentId] || []),
        }));
      } else {
        setComments((prev) => updateList(prev));
      }
    }
  }, [comments, replies]);

  // ── Delete a comment ──────────────────────────────────────────────────────
  const deleteComment = useCallback(async (commentId: string, userId: string, parentCommentId?: string) => {
    await axios.delete(`/api/comments?commentId=${commentId}&userId=${userId}`);
    if (parentCommentId) {
      setReplies((prev) => ({
        ...prev,
        [parentCommentId]: (prev[parentCommentId] || []).filter((c) => c.id !== commentId),
      }));
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentCommentId
            ? { ...c, replyCount: Math.max(0, (c.replyCount || 0) - 1) }
            : c
        )
      );
    } else {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    }
  }, []);

  return {
    comments,
    replies,
    loading,
    error,
    hasMore: pagination.hasMore,
    fetchComments,
    fetchReplies,
    postComment,
    toggleLike,
    deleteComment,
  };
}