

// // lib/roarApi.ts

// import type { Reaction } from "../src/components/NewROARComponent/components/ReactionPicker";

// const BASE = "/api/roar";

// async function apiFetch<T>(
//   path: string,
//   options: RequestInit = {}
// ): Promise<T> {
//   const res = await fetch(`${BASE}${path}`, {
//     headers: { "Content-Type": "application/json" },
//     credentials: "include",
//     ...options,
//   });
//   const data = await res.json();
//   if (!res.ok) throw new Error(data.error ?? "Request failed");
//   return data as T;
// }

// export const roarApi = {
//   // ── Onboarding ──────────────────────────────────────────────────────────────
//   completeOnboarding: (body: object) =>
//     apiFetch("/onboarding", { method: "POST", body: JSON.stringify(body) }),

//   // ── Feed ─────────────────────────────────────────────────────────────────────
//   getFeed: (filter = "For You", lastCreatedAt?: number) =>
//     apiFetch<{ posts: any[] }>(
//       `/feed?filter=${encodeURIComponent(filter)}${lastCreatedAt ? `&lastCreatedAt=${lastCreatedAt}` : ""}`
//     ),

//   // ── Posts ─────────────────────────────────────────────────────────────────────
//   createPost: (body: object) =>
//     apiFetch<{ postId: string }>("/posts", { method: "POST", body: JSON.stringify(body) }),

//   castVote: (postId: string, vote: "agree" | "disagree" | null) =>
//     apiFetch(`/posts/${postId}/vote`, { method: "POST", body: JSON.stringify({ vote }) }),

//   // ── Reactions (replaces the old bare likePost) ────────────────────────────────
//   //
//   // POST   /api/roar/posts/:id/likesection  { reaction }
//   //   → adds or switches reaction; returns { success, action, reaction, likeCount }
//   //
//   // DELETE /api/roar/posts/:id/likesection
//   //   → removes reaction; returns { success, action: "removed", reaction: null }
//   //
//   // The old likePost() is kept as a convenience wrapper that always sends "heart",
//   // so any existing call-sites don't break.
//   //
//   reactPost: (
//     postId: string,
//     reaction: Reaction                              // "heart"|"fire"|"laugh"|"sad"|"thumb"
//   ) =>
//     apiFetch<{ success: boolean; action: string; reaction: Reaction; likeCount: number }>(
//       `/posts/${postId}/likesection`,
//       { method: "POST", body: JSON.stringify({ reaction }) }
//     ),

//   unreactPost: (postId: string) =>
//     apiFetch<{ success: boolean; action: string; reaction: null }>(
//       `/posts/${postId}/likesection`,
//       { method: "DELETE" }
//     ),

//   // Backward-compat shim: callers that used likePost() get a ❤️ reaction.
//   likePost: (postId: string) =>
//     roarApi.reactPost(postId, "heart"),

//   // ── Room ─────────────────────────────────────────────────────────────────────
//   getRoomMessages: (roomId: string, lastCreatedAt?: number) =>
//     apiFetch<{ messages: any[] }>(
//       `/rooms/${roomId}/messages${lastCreatedAt ? `?lastCreatedAt=${lastCreatedAt}` : ""}`
//     ),

//   sendRoomMessage: (roomId: string, body: object) =>
//     apiFetch(`/rooms/${roomId}/messages`, { method: "POST", body: JSON.stringify(body) }),

//   reactToMessage: (roomId: string, msgId: string, reaction: "fire" | "noChance" | "heart") =>
//     apiFetch(`/rooms/${roomId}/messages/${msgId}/react`, {
//       method: "POST",
//       body: JSON.stringify({ reaction }),
//     }),

//   // ── Notifications ─────────────────────────────────────────────────────────────
//   getNotifications: (unreadOnly = false) =>
//     apiFetch<{ notifications: any[]; unreadCount: number }>(
//       `/notifications${unreadOnly ? "?unreadOnly=true" : ""}`
//     ),

//   markNotificationRead: (notifId: string) =>
//     apiFetch("/notifications", { method: "PATCH", body: JSON.stringify({ notifId }) }),

//   markAllNotificationsRead: () =>
//     apiFetch("/notifications", { method: "PATCH", body: JSON.stringify({ markAll: true }) }),

//   // ── Leaderboard ───────────────────────────────────────────────────────────────
//   getLeaderboard: (period = "all_time") =>
//     apiFetch<{ leaderboard: any; currentUserEntry: any }>(`/leaderboard?period=${period}`),

//   // ── Profile ───────────────────────────────────────────────────────────────────
//   getProfile: () =>
//     apiFetch<{ user: any; badges: any[]; predictions: any[]; hotTakes: any[]; rival: any }>("/profile"),

//   updateProfile: (body: object) =>
//     apiFetch("/profile", { method: "PATCH", body: JSON.stringify(body) }),
// };



// lib/roarApi.ts

import type { Reaction } from "../src/components/NewROARComponent/components/ReactionPicker";

const BASE = "/api/roar";

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data as T;
}

export const roarApi = {
  // ── Onboarding ──────────────────────────────────────────────────────────────
  completeOnboarding: (body: object) =>
    apiFetch("/onboarding", { method: "POST", body: JSON.stringify(body) }),

  // ── Feed ─────────────────────────────────────────────────────────────────────
  getFeed: (filter = "For You", lastCreatedAt?: number) =>
    apiFetch<{ posts: any[] }>(
      `/feed?filter=${encodeURIComponent(filter)}${lastCreatedAt ? `&lastCreatedAt=${lastCreatedAt}` : ""}`
    ),

  // ── Posts ─────────────────────────────────────────────────────────────────────
  createPost: (body: object) =>
    apiFetch<{ postId: string }>("/posts", { method: "POST", body: JSON.stringify(body) }),

  castVote: (postId: string, vote: "agree" | "disagree" | null) =>
    apiFetch(`/posts/${postId}/vote`, { method: "POST", body: JSON.stringify({ vote }) }),

  // ── Reactions (replaces the old bare likePost) ────────────────────────────────
  //
  // POST   /api/roar/posts/:id/likesection  { reaction, roomId? }
  //   → adds or switches reaction; returns { success, action, reaction, likeCount }
  //   → when roomId is provided, targets roarRooms/{roomId}/messages/{id}
  //     instead of roarPosts/{id} (see likesection/route.ts for the branch).
  //     This is what lets DiscussionRoom.tsx reuse the same reaction system
  //     as HomeFeed.tsx instead of the old separate fire/noChance endpoint.
  //
  // DELETE /api/roar/posts/:id/likesection?roomId=xyz
  //   → removes reaction; returns { success, action: "removed", reaction: null }
  //   → roomId goes on the query string here (DELETE bodies aren't used
  //     elsewhere in this file's fetch wrapper).
  //
  // The old likePost() is kept as a convenience wrapper that always sends "heart",
  // so any existing call-sites don't break.
  //
  reactPost: (
    postId: string,
    reaction: Reaction,                              // "heart"|"fire"|"laugh"|"sad"|"thumb"
    roomId?: string                                   // NEW — pass for room messages
  ) =>
    apiFetch<{ success: boolean; action: string; reaction: Reaction; likeCount: number }>(
      `/posts/${postId}/likesection`,
      { method: "POST", body: JSON.stringify({ reaction, ...(roomId && { roomId }) }) }
    ),

  unreactPost: (postId: string, roomId?: string) =>
    apiFetch<{ success: boolean; action: string; reaction: null }>(
      `/posts/${postId}/likesection${roomId ? `?roomId=${encodeURIComponent(roomId)}` : ""}`,
      { method: "DELETE" }
    ),

  // Backward-compat shim: callers that used likePost() get a ❤️ reaction.
  likePost: (postId: string) =>
    roarApi.reactPost(postId, "heart"),

  // ── Reactions list (who reacted) ──────────────────────────────────────────────
  // GET /api/roar/posts/:id/reactions?roomId=xyz
  // Used by ReactionsDialog. roomId optional, same branch as likesection above.
  getReactions: (postId: string, roomId?: string) =>
    apiFetch<{ success: boolean; reactors: any[]; total: number }>(
      `/posts/${postId}/reactions${roomId ? `?roomId=${encodeURIComponent(roomId)}` : ""}`
    ),

  // ── Room ─────────────────────────────────────────────────────────────────────
  getRoomMessages: (roomId: string, lastCreatedAt?: number) =>
    apiFetch<{ messages: any[] }>(
      `/rooms/${roomId}/messages${lastCreatedAt ? `?lastCreatedAt=${lastCreatedAt}` : ""}`
    ),

  sendRoomMessage: (roomId: string, body: object) =>
    apiFetch(`/rooms/${roomId}/messages`, { method: "POST", body: JSON.stringify(body) }),

  // DEPRECATED: room messages now use reactPost/unreactPost (above) with the
  // same 5-emoji vocabulary as HomeFeed, via the room-aware likesection
  // endpoint. This old fire/noChance/heart path is no longer called by
  // DiscussionRoom.tsx but is left here in case anything else still uses it.
  reactToMessage: (roomId: string, msgId: string, reaction: "fire" | "noChance" | "heart") =>
    apiFetch(`/rooms/${roomId}/messages/${msgId}/react`, {
      method: "POST",
      body: JSON.stringify({ reaction }),
    }),

  // ── Notifications ─────────────────────────────────────────────────────────────
  getNotifications: (unreadOnly = false) =>
    apiFetch<{ notifications: any[]; unreadCount: number }>(
      `/notifications${unreadOnly ? "?unreadOnly=true" : ""}`
    ),

  markNotificationRead: (notifId: string) =>
    apiFetch("/notifications", { method: "PATCH", body: JSON.stringify({ notifId }) }),

  markAllNotificationsRead: () =>
    apiFetch("/notifications", { method: "PATCH", body: JSON.stringify({ markAll: true }) }),

  // ── Leaderboard ───────────────────────────────────────────────────────────────
  getLeaderboard: (period = "all_time") =>
    apiFetch<{ leaderboard: any; currentUserEntry: any }>(`/leaderboard?period=${period}`),

  // ── Profile ───────────────────────────────────────────────────────────────────
  getProfile: () =>
    apiFetch<{ user: any; badges: any[]; predictions: any[]; hotTakes: any[]; rival: any }>("/profile"),

  updateProfile: (body: object) =>
    apiFetch("/profile", { method: "PATCH", body: JSON.stringify(body) }),
};