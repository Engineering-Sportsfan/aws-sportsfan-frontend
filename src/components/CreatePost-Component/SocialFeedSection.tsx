


// // SocialFeedSection.tsx — updated with repost + quote-repost support

// "use client";

// import { useEffect, useState, useCallback } from "react";
// import axios from "axios";
// import PostFeed from "./PostFeed";
// import { usePosts } from "../../../hooks/Useposts";
// import { useAuth } from "@/context/AuthContext";
// import type { Post } from "@/types/PostPolls";

// type ReactionId = "like" | "love" | "haha" | "wow" | "sad" | "angry";

// const REACTION_LABELS: Record<ReactionId, string> = {
//   like:  "liked",
//   love:  "loved",
//   haha:  "laughed at",
//   wow:   "reacted wow to",
//   sad:   "reacted sad to",
//   angry: "reacted angry to",
// };

// async function sendNotification(payload: {
//   recipientEmail: string;
//   type: string;
//   message: string;
// }) {
//   try {
//     await axios.post("/api/notifications", { ...payload, isRead: false });
//   } catch (err) {
//     console.error("Failed to send notification:", err);
//   }
// }

// function getVoterId(): string {
//   if (typeof window === "undefined") return "anon";
//   let id = sessionStorage.getItem("voterId");
//   if (!id) {
//     id = `user_${Math.random().toString(36).slice(2, 10)}`;
//     sessionStorage.setItem("voterId", id);
//   }
//   return id;
// }

// export default function SocialFeedSection() {
//   const { posts, loading, hasMore, fetchPosts, deletePost, votePoll, togglePostLike, error } =
//     usePosts();
//   const { user, getUserDisplayName } = useAuth();
//   const [voterId] = useState<string>(getVoterId);
//   const currentUserName = user ? getUserDisplayName() : "Anonymous";
//   const [filterType, setFilterType] = useState<"top" | "recent">("recent");

//   const [postMap, setPostMap] = useState<Record<string, Post>>({});
//   useEffect(() => {
//     setPostMap((prev) => {
//       const next = { ...prev };
//       posts.forEach((p) => { if (p.id) next[p.id] = p; });
//       return next;
//     });
//   }, [posts]);

//   // Sort posts based on filter
//   const sortedPosts = [...posts].sort((a, b) => {
//     if (filterType === "top") {
//       return (b.likes || 0) - (a.likes || 0);
//     } else {
//       return (b.createdAt || 0) - (a.createdAt || 0);
//     }
//   });

//   useEffect(() => { fetchPosts(true); }, []); // eslint-disable-line

//   // ── Like handler ──────────────────────────────────────────────────────────
//   const handleLike = useCallback(
//     (postId: string, userId: string, reaction?: ReactionId) => {
//       togglePostLike(postId, userId, reaction);
//       if (!reaction) return;
//       const post = postMap[postId];
//       if (!post) return;
//       const postOwnerEmail = post.userEmail;
//       if (!postOwnerEmail || postOwnerEmail === user?.email) return;
//       const verb = REACTION_LABELS[reaction] ?? "reacted to";
//       sendNotification({
//         recipientEmail: postOwnerEmail,
//         type: "post_reaction",
//         message: `${currentUserName} ${verb} your post`,
//       });
//     },
//     [togglePostLike, postMap, user, currentUserName]
//   );

//   // ── Comment handler ───────────────────────────────────────────────────────
//   const handleCommentAdded = useCallback(
//     (postId: string) => {
//       const post = postMap[postId];
//       if (!post) return;
//       const postOwnerEmail = post.userEmail;
//       if (!postOwnerEmail || postOwnerEmail === user?.email) return;
//       sendNotification({
//         recipientEmail: postOwnerEmail,
//         type: "post_comment",
//         message: `${currentUserName} commented on your post`,
//       });
//     },
//     [postMap, user, currentUserName]
//   );

//   const handleCommentDeleted = useCallback(
//     (postId: string) => console.log("Comment deleted from post:", postId),
//     []
//   );

//   // ── Repost handler ────────────────────────────────────────────────────────
//   const handleRepost = useCallback(
//     async (postId: string) => {
//       if (!user && !voterId) return;
//       await axios.post("/api/createpost/repost", {
//         postId,
//         userId: user?.userId ?? voterId,
//         userName: currentUserName,
//         userEmail: user?.email ?? "",
//       });
//       // Optionally re-fetch to show the new repost in the feed
//       // fetchPosts(true);
//     },
//     [user, voterId, currentUserName]
//   );

//   // ── Quote-repost handler ──────────────────────────────────────────────────
//   const handleQuoteRepost = useCallback(
//     async (postId: string, quoteText: string) => {
//       if (!user && !voterId) return;
//       await axios.post("/api/createpost/repost", {
//         postId,
//         userId: user?.userId ?? voterId,
//         userName: currentUserName,
//         userEmail: user?.email ?? "",
//         quoteText,
//       });
//       // Prepend new quote-repost to feed — or simply re-fetch
//       // fetchPosts(true);

//       // Notify original post owner
//       const post = postMap[postId];
//       if (post?.userEmail && post.userEmail !== user?.email) {
//         sendNotification({
//           recipientEmail: post.userEmail,
//           type: "post_quote",
//           message: `${currentUserName} quoted your post`,
//         });
//       }
//     },
//     [user, voterId, currentUserName, postMap]
//   );

//   return (
//     <section className="w-full">
//       {error && (
//         <div className="mb-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
//           {error}
//         </div>
//       )}
//       <PostFeed
//         posts={sortedPosts}
//         loading={loading}
//         hasMore={hasMore}
//         onLoadMore={() => fetchPosts(false)}
//         onDelete={deletePost}
//         onVote={votePoll}
//         onLike={handleLike}
//         onRepost={handleRepost}
//         onQuoteRepost={handleQuoteRepost}
//         onCommentAdded={handleCommentAdded}
//         onCommentDeleted={handleCommentDeleted}
//         currentUserId={user?.userId ?? user?.email ?? voterId}
//         currentUserName={currentUserName}
//         postMap={postMap}
//         filterType={filterType}
//         onFilterChange={setFilterType}
//       />
//     </section>
//   );
// }




"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import PostFeed from "./PostFeed";
import { usePosts } from "../../../hooks/Useposts";
import { useAuth } from "@/context/AuthContext";
import type { Post } from "@/types/PostPolls";

type ReactionId = "like" | "love" | "haha" | "wow" | "sad" | "angry";

const REACTION_LABELS: Record<ReactionId, string> = {
  like:  "liked",
  love:  "loved",
  haha:  "laughed at",
  wow:   "reacted wow to",
  sad:   "reacted sad to",
  angry: "reacted angry to",
};

async function sendNotification(payload: { recipientEmail: string; type: string; message: string }) {
  try { await axios.post("/api/notifications", { ...payload, isRead: false }); }
  catch (err) { console.error("Failed to send notification:", err); }
}

function getVoterId(): string {
  if (typeof window === "undefined") return "anon";
  let id = sessionStorage.getItem("voterId");
  if (!id) { id = `user_${Math.random().toString(36).slice(2, 10)}`; sessionStorage.setItem("voterId", id); }
  return id;
}

export default function SocialFeedSection() {
  const { posts, loading, hasMore, fetchPosts, deletePost, votePoll, togglePostLike, error } = usePosts();
  const { user, getUserDisplayName } = useAuth();
  const [voterId] = useState<string>(getVoterId);
  const currentUserName = user ? getUserDisplayName() : "Anonymous";
  const [filterType, setFilterType] = useState<"top" | "recent">("recent");

  // ── currentUserId: ALWAYS prefer the Firebase uid (user.uid).
  // Posts are stored with userId = user.uid in /api/createpost.
  // Fall back to email, then anonymous voterId for unauthenticated users.
  const currentUserId = user?.uid ?? user?.email ?? voterId;

  const [postMap, setPostMap] = useState<Record<string, Post>>({});
  useEffect(() => {
    setPostMap((prev) => {
      const next = { ...prev };
      posts.forEach((p) => { if (p.id) next[p.id] = p; });
      return next;
    });
  }, [posts]);

  const sortedPosts = [...posts].sort((a, b) =>
    filterType === "top"
      ? (b.likes || 0) - (a.likes || 0)
      : (b.createdAt || 0) - (a.createdAt || 0)
  );

  useEffect(() => { fetchPosts(true); }, []); // eslint-disable-line

  const handleLike = useCallback(
    (postId: string, userId: string, reaction?: ReactionId) => {
      togglePostLike(postId, userId, reaction);
      if (!reaction) return;
      const post = postMap[postId];
      if (!post?.userEmail || post.userEmail === user?.email) return;
      const verb = REACTION_LABELS[reaction] ?? "reacted to";
      sendNotification({ recipientEmail: post.userEmail, type: "post_reaction", message: `${currentUserName} ${verb} your post` });
    },
    [togglePostLike, postMap, user, currentUserName]
  );

  const handleCommentAdded = useCallback(
    (postId: string) => {
      const post = postMap[postId];
      if (!post?.userEmail || post.userEmail === user?.email) return;
      sendNotification({ recipientEmail: post.userEmail, type: "post_comment", message: `${currentUserName} commented on your post` });
    },
    [postMap, user, currentUserName]
  );

  const handleCommentDeleted = useCallback(
    (postId: string) => console.log("Comment deleted from post:", postId), []
  );

  const handleRepost = useCallback(async (postId: string) => {
    await axios.post("/api/createpost/repost", {
      postId, userId: currentUserId, userName: currentUserName, userEmail: user?.email ?? "",
    });
  }, [currentUserId, currentUserName, user]);

  const handleQuoteRepost = useCallback(async (postId: string, quoteText: string) => {
    await axios.post("/api/createpost/repost", {
      postId, userId: currentUserId, userName: currentUserName, userEmail: user?.email ?? "", quoteText,
    });
    const post = postMap[postId];
    if (post?.userEmail && post.userEmail !== user?.email) {
      sendNotification({ recipientEmail: post.userEmail, type: "post_quote", message: `${currentUserName} quoted your post` });
    }
  }, [currentUserId, currentUserName, user, postMap]);

  return (
    <section className="w-full">
      {error && (
        <div className="mb-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
      )}
      <PostFeed
        posts={sortedPosts}
        loading={loading}
        hasMore={hasMore}
        onLoadMore={() => fetchPosts(false)}
        onDelete={deletePost}
        onVote={votePoll}
        onLike={handleLike}
        onRepost={handleRepost}
        onQuoteRepost={handleQuoteRepost}
        onCommentAdded={handleCommentAdded}
        onCommentDeleted={handleCommentDeleted}
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        postMap={postMap}
        filterType={filterType}
        onFilterChange={setFilterType}
      />
    </section>
  );
}