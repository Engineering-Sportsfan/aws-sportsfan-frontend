"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { usePosts } from "@/hooks/Useposts";
import PostCard from "@/src/components/CreatePost-Component/PostCard";
import type { Post } from "@/types/PostPolls";

type ReactionId = "like" | "love" | "haha" | "wow" | "sad" | "angry";

const REACTION_LABELS: Record<ReactionId, string> = {
  like: "liked",
  love: "loved",
  haha: "laughed at",
  wow: "reacted wow to",
  sad: "reacted sad to",
  angry: "reacted angry to",
};

function getVoterId() {
  if (typeof window === "undefined") return "anon";
  let id = sessionStorage.getItem("voterId");
  if (!id) {
    id = `user_${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem("voterId", id);
  }
  return id;
}

async function sendNotification(payload: { recipientEmail: string; type: string; message: string }) {
  try {
    await axios.post("/api/notifications", { ...payload, isRead: false });
  } catch (err) {
    console.error("Failed to send notification:", err);
  }
}

export default function AllPostsPage() {
  const { posts, loading, hasMore, fetchPosts, deletePost, votePoll, togglePostLike } = usePosts();
  const { user, getUserDisplayName } = useAuth();
  const [voterId] = useState<string>(getVoterId);
  const currentUserName = user ? getUserDisplayName() : "Anonymous";
  const currentUserId = user?.uid ?? user?.email ?? voterId;

  const [postMap, setPostMap] = useState<Record<string, Post>>({});

  useEffect(() => {
    fetchPosts(true);
  }, [fetchPosts]);

  useEffect(() => {
    setPostMap((prev) => {
      const next = { ...prev };
      posts.forEach((p) => {
        if (p.id) next[p.id] = p;
      });
      return next;
    });
  }, [posts]);

  const handleLike = useCallback(
    (postId: string, userId: string, reaction?: ReactionId) => {
      togglePostLike(postId, userId, reaction);
      if (!reaction) return;
      const post = postMap[postId];
      if (!post?.userEmail || post.userEmail === user?.email) return;
      const verb = REACTION_LABELS[reaction] ?? "reacted to";
      sendNotification({
        recipientEmail: post.userEmail,
        type: "post_reaction",
        message: `${currentUserName} ${verb} your post`,
      });
    },
    [postMap, togglePostLike, user, currentUserName]
  );

  const handleCommentAdded = useCallback(
    (postId: string) => {
      const post = postMap[postId];
      if (!post?.userEmail || post.userEmail === user?.email) return;
      sendNotification({
        recipientEmail: post.userEmail,
        type: "post_comment",
        message: `${currentUserName} commented on your post`,
      });
    },
    [postMap, user, currentUserName]
  );

  const handleRepost = useCallback(async (postId: string) => {
    await axios.post("/api/createpost/repost", {
      postId,
      userId: currentUserId,
      userName: currentUserName,
      userEmail: user?.email ?? "",
    });
  }, [currentUserId, currentUserName, user]);

  const handleQuoteRepost = useCallback(async (postId: string, quoteText: string) => {
    await axios.post("/api/createpost/repost", {
      postId,
      userId: currentUserId,
      userName: currentUserName,
      userEmail: user?.email ?? "",
      quoteText,
    });
    const post = postMap[postId];
    if (post?.userEmail && post.userEmail !== user?.email) {
      sendNotification({
        recipientEmail: post.userEmail,
        type: "post_quote",
        message: `${currentUserName} quoted your post`,
      });
    }
  }, [currentUserId, currentUserName, postMap, user]);

  return (
    <main className="min-h-screen bg-[#0b0b0d] text-white px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="flex items-center justify-between gap-3">
          <Link href="/MainModules/HomePage" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[#C9115F]/80">Feed</p>
            <h1 className="text-2xl font-semibold text-white">All posts</h1>
          </div>
        </div>

        {loading && posts.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/60">Loading posts…</div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              postMap={postMap}
              onDelete={deletePost}
              onVote={votePoll}
              onLike={handleLike}
              onRepost={handleRepost}
              onQuoteRepost={handleQuoteRepost}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              onCommentAdded={handleCommentAdded}
              onCommentDeleted={() => undefined}
            />
          ))}
        </section>

        {hasMore && (
          <button
            type="button"
            onClick={() => fetchPosts(false)}
            disabled={loading}
            className="mx-auto rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 disabled:opacity-50"
          >
            {loading ? "Loading…" : "Load more posts"}
          </button>
        )}
      </div>
    </main>
  );
}
