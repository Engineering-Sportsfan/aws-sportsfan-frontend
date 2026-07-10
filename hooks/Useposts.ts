"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { Post } from "@/types/PostPolls";
import axios from "axios";
import { useLeaderboard } from "@/context/LeaderboardContext";
import { useActivity } from "@/context/ActivityContext";
import { emitSxpActivityRefresh } from "@/lib/sxpEvents";

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<{
    lastDocId: string;
    lastDocCreatedAt: number;
  } | null>(null);
  const { addLocalPoints } = useLeaderboard();
  const { addLocalActivity, refreshActivities } = useActivity();

  const fetchPosts = useCallback(async (reset = false) => {
    setLoading(true);
    setError(null);
    try {
      const cursor =
        !reset && nextCursor
          ? `&lastDocId=${nextCursor.lastDocId}&lastDocCreatedAt=${nextCursor.lastDocCreatedAt}`
          : "";
      const res = await axios.get(`/api/createpost?limit=10${cursor}`);
      const json = res.data;
      if (!json.success) throw new Error(json.error);
      setPosts((prev) => (reset ? json.posts : [...prev, ...json.posts]));
      setHasMore(json.pagination.hasMore);
      setNextCursor(json.pagination.nextCursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  }, [nextCursor]);

  useEffect(() => {
    fetchPosts(true);
  }, []);

  const createPost = useCallback(
    async (formData: FormData, userId: string, userName: string, userEmail?: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.post("/api/createpost", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const json = res.data;
        if (!json.success) throw new Error(json.error);
        const newPost = json.data as Post;
        setPosts((prev) => [newPost, ...prev]);
        try {
          if (newPost.id) {
            const postId = newPost.id;
            const transactionId = `${userId}_${postId}_CREATE_POST`;

            await awardPostPoints(userId, userName, userEmail, postId);

            addLocalPoints(12);
            addLocalActivity({
              id: transactionId,
              type: "CREATE_POST",
              points: 12,
              label: "Created a Fan Zone post",
              metadata: {
                postId,
                transactionId,
              },
              createdAt: Date.now(),
            });
            emitSxpActivityRefresh();
            await refreshActivities();
          }
        } catch (pointsErr) {
          console.warn("[usePosts] Failed to award points:", pointsErr);
        }
        return newPost;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to create post";
        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    [addLocalActivity, addLocalPoints, refreshActivities]
  );

  const deletePost = useCallback(async (id: string) => {
    try {
      const res = await axios.delete(`/api/createpost/${id}`);
      const json = res.data;
      if (!json.success) throw new Error(json.error);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete post";
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  // ── Vote on poll ──────────────────────────────────────────────────────────
  const votePoll = useCallback(async (postId: string, optionId: string, voterId: string) => {
    try {
      const res = await axios.post(`/api/createpost/polls/${postId}`, { optionId, voterId });
      const json = res.data;
      if (!json.success) throw new Error(json.error);
      setPosts((prev) => prev.map((p) => (p.id === postId ? (json.data as Post) : p)));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to cast vote";
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  // ── Like a post ───────────────────────────────────────────────────────────
  const postsRef = useRef(posts);
  postsRef.current = posts;

//   const togglePostLike = useCallback(async (postId: string, userId: string) => {
//     const postSnapshot = postsRef.current.find((p) => p.id === postId);
//     const wasLiked = postSnapshot?.likedBy?.includes(userId) ?? false;

//     // Optimistic update
//     setPosts((prev) =>
//       prev.map((p) => {
//         if (p.id !== postId) return p;
//         const likedBy = p.likedBy || [];
//         const alreadyLiked = likedBy.includes(userId);
//         return {
//           ...p,
//           likes: (p.likes || 0) + (alreadyLiked ? -1 : 1),
//           likedBy: alreadyLiked
//             ? likedBy.filter((id) => id !== userId)
//             : [...likedBy, userId],
//         };
//       })
//     );

//     try {
//       await axios.patch(`/api/createpost/${postId}`, {
//         likeAction: wasLiked ? "unlike" : "like",
//         userId,
//       });
//     } catch (err) {
//       // Revert on failure
//       setPosts((prev) =>
//         prev.map((p) => {
//           if (p.id !== postId) return p;
//           const likedBy = p.likedBy || [];
//           const isLiked = likedBy.includes(userId);
//           return {
//             ...p,
//             likes: (p.likes || 0) + (isLiked ? -1 : 1),
//             likedBy: isLiked
//               ? likedBy.filter((id) => id !== userId)
//               : [...likedBy, userId],
//           };
//         })
//       );
//       console.error("[usePosts] Like failed:", err);
//     }
//   }, []);
// AFTER — paste this in its place
type ReactionId = "like" | "love" | "haha" | "wow" | "sad" | "angry";

const togglePostLike = useCallback(async (
  postId: string,
  userId: string,
  reaction?: ReactionId
) => {
  const postSnapshot = postsRef.current.find((p) => p.id === postId);
  const wasLiked = postSnapshot?.likedBy?.includes(userId) ?? false;
  const isRemoving = wasLiked && !reaction;

  // Optimistic update — also update reactions map
  setPosts((prev) =>
    prev.map((p) => {
      if (p.id !== postId) return p;
      const likedBy = p.likedBy || [];
      const alreadyLiked = likedBy.includes(userId);
      const prevReactions = (p.reactions as Record<string, string>) || {};

      const newReactions = isRemoving
        ? Object.fromEntries(Object.entries(prevReactions).filter(([k]) => k !== userId))
        : { ...prevReactions, [userId]: reaction ?? "like" };

      return {
        ...p,
        likes: isRemoving
          ? Math.max(0, (p.likes || 0) - 1)
          : alreadyLiked ? p.likes : (p.likes || 0) + 1,
        likedBy: isRemoving
          ? likedBy.filter((id) => id !== userId)
          : alreadyLiked ? likedBy : [...likedBy, userId],
        reactions: newReactions,
      };
    })
  );

  try {
    await axios.patch(`/api/createpost/${postId}`, {
      likeAction: isRemoving ? "unlike" : "like",
      userId,
      reaction,
    });
  } catch (err) {
    // Revert on failure by re-fetching
    fetchPosts(false);
    console.error("[usePosts] Like failed:", err);
  }
}, [fetchPosts]);

  // ── Comment count helpers ─────────────────────────────────────────────────
  const incrementCommentCount = useCallback((postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p
      )
    );
  }, []);

  const decrementCommentCount = useCallback((postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, commentCount: Math.max(0, (p.commentCount || 0) - 1) }
          : p
      )
    );
  }, []);

  return {
    posts,
    loading,
    error,
    hasMore,
    fetchPosts,
    createPost,
    deletePost,
    votePoll,
    togglePostLike,
    incrementCommentCount,
    decrementCommentCount,
  };
}

async function awardPostPoints(
  userId: string,
  userName: string,
  userEmail: string | undefined,
  postId: string
) 
{
  await axios.post("/api/user-points", {
    actualUserId: userId,
    userName,
    userEmail: userEmail || "",
    points: 12,
    reason: "CREATE_POST",
    transactionId: `${userId}_${postId}_CREATE_POST`,
    metadata: { postId },
  });
}
