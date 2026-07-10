
// "use client";
// // context/ActivityContext.tsx
// //
// // Fetches the user's activity log from /api/user-activity and exposes it to
// // the rest of the app.  Every activity type written by awardUserPoints() flows
// // through unchanged — no filtering is applied here.

// import {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   useCallback,
//   useRef,
//   useMemo,
// } from "react";
// import axios from "axios";
// import { useAuth } from "@/context/AuthContext";
// import { onSxpActivityRefresh } from "@/lib/sxpEvents";
// import type { BadgeEntry } from "@/src/components/NewROARComponent/types/index";
// import { BADGES_LIST } from "@/src/components/NewROARComponent/constants/index";

// // ─── Public types ─────────────────────────────────────────────────────────────
// export interface ActivityItem {
//   id: string;
//   type: string;   // raw enum, e.g. "ROAR_POST", "TRIVIA_CORRECT", "AUDIO_DROP"
//   points: number;
//   label: string;   // human-readable, e.g. "Shared a ROAR Post"
//   metadata: Record<string, unknown>;
//   createdAt: number;   // Unix ms
// }

// export interface ProfileStats {
//   posts: number;
//   predictions: number;
//   hotTakes: number;
//   flashQuiz: number;
//   debates: number;
//   totalActivity: number;
// }

// interface ActivityContextType {
//   activities: ActivityItem[];
//   loading: boolean;
//   profileStats: ProfileStats;
//   badges: BadgeEntry[];
//   refreshActivities: () => Promise<void>;
//   addLocalActivity: (activity: ActivityItem) => void;
// }

// // ─── Module-level cache ───────────────────────────────────────────────────────
// // Survives re-renders; resets on page reload.
// // Keyed by userId so switching accounts always gets fresh data.
// let cache: { ts: number; userId: string; data: ActivityItem[] } | null = null;
// const CACHE_TTL = 30_000; // 30 seconds
// const ACTIVITY_FETCH_LIMIT = 200;

// // ─── Stats Calculation Constants ───────────────────────────────────────────────
// const POST_TYPES = [
//   "ROAR_HOT_TAKE",
//   "ROAR_RAW_REACTIONS",
//   "ROAR_MEMORY",
//   "ROAR_DEBATE",
// ];

// // ─── Post Content Resolver (Content Resolution) ─────────────────────────────────
// export interface PostContentData {
//   id?: string;
//   type?: string;
//   statement?: string;
//   title?: string;
//   caption?: string;
//   description?: string;
//   agreeVotes?: number;
//   disagreeVotes?: number;
//   totalVotes?: number;
//   score?: number;
//   status?: "pending" | "correct" | "incorrect";
//   image?: string;
//   reaction?: string;
//   [key: string]: unknown;
// }

// // Cache to avoid fetching the same post multiple times
// const postCache = new Map<string, PostContentData>();

// /**
//  * Fetch post data from ROAR API using postId
//  */
// export async function resolvePostContent(
//   postId: string,
//   type: string
// ): Promise<PostContentData> {
//   // Check cache first
//   if (postCache.has(postId)) {
//     return postCache.get(postId)!;
//   }

//   try {
//     // Try to fetch from ROAR post API
//     const response = await axios.get(`/api/roar/posts/${postId}`, {
//       timeout: 5000, // 5 second timeout
//     });

//     const data = response.data?.data || response.data;

//     // Cache the result
//     postCache.set(postId, data);

//     return data as PostContentData;
//   } catch (error) {
//     console.warn(`Failed to resolve post ${postId}:`, error);
//     // Return empty object on error - activity will still display
//     return {};
//   }
// }

// /**
//  * Batch resolve multiple post contents
//  */
// export async function resolveBatchPostContents(
//   postIds: string[]
// ): Promise<Map<string, PostContentData>> {
//   const results = new Map<string, PostContentData>();

//   // Filter out already cached items
//   const uncached = postIds.filter((id) => !postCache.has(id));

//   // If all items are cached, return immediately
//   if (uncached.length === 0) {
//     postIds.forEach((id) => {
//       const cached = postCache.get(id);
//       if (cached) results.set(id, cached);
//     });
//     return results;
//   }

//   // Fetch uncached items in parallel (max 5 at a time to avoid overwhelming server)
//   const batchSize = 5;
//   for (let i = 0; i < uncached.length; i += batchSize) {
//     const batch = uncached.slice(i, i + batchSize);
//     const promises = batch.map((id) =>
//       resolvePostContent(id, "").then((data) => ({ id, data }))
//     );

//     const batchResults = await Promise.allSettled(promises);

//     batchResults.forEach((result) => {
//       if (result.status === "fulfilled") {
//         const { id, data } = result.value;
//         results.set(id, data);
//       }
//     });
//   }

//   // Add cached items to results
//   postIds.forEach((id) => {
//     if (!results.has(id)) {
//       const cached = postCache.get(id);
//       if (cached) results.set(id, cached);
//     }
//   });

//   return results;
// }


// export function clearPostCache() {
//   postCache.clear();
// }


// export async function preloadPosts(postIds: string[]) {
//   await resolveBatchPostContents(postIds);
// }

// // ─── Helpers ──────────────────────────────────────────────────────────────────
// const sameActivity = (a: ActivityItem, b: ActivityItem): boolean => {
//   const aTx = a.metadata?.transactionId;
//   const bTx = b.metadata?.transactionId;
//   return a.id === b.id || (typeof aTx === "string" && aTx === bTx);
// };

// const mergeActivities = (
//   remote: ActivityItem[],
//   local: ActivityItem[]
// ): ActivityItem[] => {
//   const merged = [...remote];
//   local.forEach((activity) => {
//     if (!merged.some((item) => sameActivity(item, activity))) {
//       merged.unshift(activity);
//     }
//   });
//   return merged.sort((a, b) => b.createdAt - a.createdAt);
// };


// const calculateProfileStats = (activities: ActivityItem[]): ProfileStats => {
//   if (!activities || activities.length === 0) {
//     return {
//       posts: 0,
//       predictions: 0,
//       hotTakes: 0,
//       flashQuiz: 0,
//       debates: 0,
//       totalActivity: 0,
//     };
//   }

//   const debates = activities.filter((a) => a.type === "ROAR_DEBATE").length;
//   const predictions = activities.filter((a) => a.type === "ROAR_PREDICTION").length;
//   const hotTakes = activities.filter((a) => a.type === "ROAR_HOT_TAKE").length;
//   const flashQuiz = activities.filter((a) => a.type === "FLASH_QUIZ").length;
//   // Total = all meaningful activity types (excluding internal types)
//   const totalActivity = debates + predictions + hotTakes + flashQuiz + activities.filter((a) => a.type === "ROAR_MEMORY" || a.type === "ROAR_RAW_REACTIONS").length;

//   // `posts` should represent the total user-created content: posts + debates + predictions.
//   // Build a set of content types (POST_TYPES may include debates/hot-takes) and include predictions.
//   const contentTypes = new Set<string>([...POST_TYPES, "ROAR_PREDICTION"]);
//   const postsCount = activities.filter((a) => contentTypes.has(a.type)).length;

//   return {
//     posts: postsCount,
//     predictions,
//     hotTakes,
//     flashQuiz,
//     debates,
//     totalActivity,
//   };
// };

// // ─── Context ──────────────────────────────────────────────────────────────────
// const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

// export const ActivityProvider: React.FC<{ children: React.ReactNode }> = ({
//   children,
// }) => {
//   const { user, authReady } = useAuth();
//   const [activities, setActivities] = useState<ActivityItem[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [serverCounts, setServerCounts] = useState<Record<string, number>>({});

//   const inFlight = useRef(false);
//   const localActivitiesRef = useRef<ActivityItem[]>([]);

//   // ── Calculate memoized profile stats ────────────────────────────────────────
//   // const profileStats = useMemo(
//   //   () => calculateProfileStats(activities),
//   //   [activities]
//   // );

//  const profileStats = useMemo(() => {
//   const hasServerCounts = Object.keys(serverCounts).length > 0;
//   if (!hasServerCounts) return calculateProfileStats(activities);

//   const debates       = serverCounts["ROAR_DEBATE"] ?? 0;
//   const predictions   = serverCounts["ROAR_PREDICTION"] ?? 0;
//   const hotTakes       = serverCounts["ROAR_HOT_TAKE"] ?? 0;
//   const flashQuiz       = serverCounts["FLASH_QUIZ"] ?? 0;
//   const roarMemory       = serverCounts["ROAR_MEMORY"] ?? 0;
//   const rawReactions     = serverCounts["ROAR_RAW_REACTIONS"] ?? 0;
//   const roarPost           = serverCounts["ROAR_POST"] ?? 0;
//   const roarQuiz             = serverCounts["ROAR_QUIZ"] ?? 0;

//   // Posts tab = every content-creation type, matching the exact filter
//   // Profile.tsx's "Posts" tab uses: ROAR_POST, ROAR_MEMORY,
//   // ROAR_RAW_REACTIONS, ROAR_QUIZ, ROAR_DEBATE, ROAR_PREDICTION.
//   // NOTE: ROAR_HOT_TAKE is intentionally excluded — Profile.tsx's own
//   // filter list doesn't include it either, even though hotTakes is
//   // tracked as its own stat.
//   const posts = roarPost + roarMemory + rawReactions + roarQuiz + debates + predictions;

//   return {
//     posts,
//     predictions,
//     hotTakes,
//     flashQuiz,
//     debates,
//     totalActivity: debates + predictions + hotTakes + flashQuiz + roarMemory + rawReactions + roarPost + roarQuiz,
//   };
// }, [serverCounts, activities]);

//   // ── Badges ───────────────────────────────────────────────────────────────────
//   // NOTE: this is currently a straight pass-through of the static BADGES_LIST
//   // fixture (id/unlocked/progress hardcoded in constants.ts). It is NOT yet
//   // derived from `activities` or `profileStats` — real per-badge unlock rules
//   // (accuracy thresholds, sport-specific counts, majority-disagreement tracking,
//   // tenure dates, etc.) aren't represented in ActivityItem yet. Wiring this up
//   // to be live will require defining those rules explicitly per badge.
//   const badges = useMemo(() => BADGES_LIST, []);

//   // ── Fetch from API ──────────────────────────────────────────────────────────
//   const fetchActivities = useCallback(async () => {
//     const userId = user?.userId;
//     if (!userId) {
//       setActivities([]);
//       return;
//     }

//     // Serve from cache if still fresh
//     if (
//       cache &&
//       cache.userId === userId &&
//       Date.now() - cache.ts < CACHE_TTL
//     ) {
//       setActivities(cache.data);
//       return;
//     }

//     // Guard against concurrent fetches
//     if (inFlight.current) return;
//     inFlight.current = true;
//     setLoading(true);

//     try {
//       const res = await axios.get(
//         `/api/user-activity?userId=${encodeURIComponent(userId)}&limit=${ACTIVITY_FETCH_LIMIT}`
//       );

//       if (res.data.success) {
//         // Merge server data with any optimistic local additions, sort newest-first
//         const data = mergeActivities(
//           res.data.activities,
//           localActivitiesRef.current
//         );
//         cache = { ts: Date.now(), userId, data };
//         setActivities(data);
//         setServerCounts(res.data.counts ?? {});
//       }
//     } catch (e) {
//       console.error("[ActivityContext] fetch error:", e);
//     } finally {
//       inFlight.current = false;
//       setLoading(false);
//     }
//   }, [user?.userId]);

//   // ── Public API 

  
//   const refreshActivities = useCallback(async () => {
//     cache = null;
//     await fetchActivities();
//   }, [fetchActivities]);

  
//   const addLocalActivity = useCallback(
//     (activity: ActivityItem) => {
//       localActivitiesRef.current = mergeActivities(
//         [activity],
//         localActivitiesRef.current
//       );
//       setActivities((prev) => {
//         const data = mergeActivities(prev, [activity]);
//         if (user?.userId) {
//           cache = { ts: Date.now(), userId: user.userId, data };
//         }
//         return data;
//       });
//     },
//     [user?.userId]
//   );

//   // Trigger fetch once auth is confirmed ready
//   useEffect(() => {
//     if (authReady) fetchActivities();
//   }, [authReady, fetchActivities]);

//   useEffect(() => {
//     return onSxpActivityRefresh(() => {
//       void refreshActivities();
//     });
//   }, [refreshActivities]);

//   return (
//     <ActivityContext.Provider
//       value={{ activities, loading, profileStats, badges, refreshActivities, addLocalActivity }}
//     >
//       {children}
//     </ActivityContext.Provider>
//   );
// };

// export const useActivity = () => {
//   const ctx = useContext(ActivityContext);
//   if (!ctx) throw new Error("useActivity must be used within ActivityProvider");
//   return ctx;

// };




"use client";
// context/ActivityContext.tsx
//
// Fetches the user's activity log from /api/user-activity and exposes it to
// the rest of the app.  Every activity type written by awardUserPoints() flows
// through unchanged — no filtering is applied here.

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { onSxpActivityRefresh } from "@/lib/sxpEvents";
import type { BadgeEntry } from "@/src/components/NewROARComponent/types/index";
import { BADGES_LIST } from "@/src/components/NewROARComponent/constants/index";

// ─── Public types ─────────────────────────────────────────────────────────────
export interface ActivityItem {
  id: string;
  type: string;   // raw enum, e.g. "ROAR_POST", "TRIVIA_CORRECT", "AUDIO_DROP"
  points: number;
  label: string;   // human-readable, e.g. "Shared a ROAR Post"
  metadata: Record<string, unknown>;
  createdAt: number;   // Unix ms
}

export interface ProfileStats {
  posts: number;
  predictions: number;
  hotTakes: number;
  flashQuiz: number;
  debates: number;
  totalActivity: number;
}

interface ActivityContextType {
  activities: ActivityItem[];
  loading: boolean;
  profileStats: ProfileStats;
  badges: BadgeEntry[];
  refreshActivities: () => Promise<void>;
  addLocalActivity: (activity: ActivityItem) => void;
}

// ─── Module-level cache ───────────────────────────────────────────────────────
// Survives re-renders; resets on page reload.
// Keyed by userId so switching accounts always gets fresh data.
let cache: { ts: number; userId: string; data: ActivityItem[] } | null = null;
const CACHE_TTL = 30_000; // 30 seconds
const ACTIVITY_FETCH_LIMIT = 200;

// ─── Stats Calculation Constants ───────────────────────────────────────────────
// NOTE: ROAR_DEBATE here covers "debate created". Debate *participation*
// (voting on a debate) is tracked under the separate ROAR_DEBATE_PARTICIPATE
// key (see lib/userPoints.ts / lib/roarPoints.ts on the backend) and is
// summed in alongside ROAR_DEBATE wherever a "debates" total is shown to the
// user — both in the calculateProfileStats() raw-log fallback below and in
// the serverCounts-driven branch of the profileStats memo further down.
const POST_TYPES = [
  "ROAR_HOT_TAKE",
  "ROAR_RAW_REACTIONS",
  "ROAR_MEMORY",
  "ROAR_DEBATE",
];

// ─── Post Content Resolver (Content Resolution) ─────────────────────────────────
export interface PostContentData {
  id?: string;
  type?: string;
  statement?: string;
  title?: string;
  caption?: string;
  description?: string;
  agreeVotes?: number;
  disagreeVotes?: number;
  totalVotes?: number;
  score?: number;
  status?: "pending" | "correct" | "incorrect";
  image?: string;
  reaction?: string;
  [key: string]: unknown;
}

// Cache to avoid fetching the same post multiple times
const postCache = new Map<string, PostContentData>();

/**
 * Fetch post data from ROAR API using postId
 */
export async function resolvePostContent(
  postId: string,
  type: string
): Promise<PostContentData> {
  // Check cache first
  if (postCache.has(postId)) {
    return postCache.get(postId)!;
  }

  try {
    // Try to fetch from ROAR post API
    const response = await axios.get(`/api/roar/posts/${postId}`, {
      timeout: 5000, // 5 second timeout
    });

    const data = response.data?.data || response.data;

    // Cache the result
    postCache.set(postId, data);

    return data as PostContentData;
  } catch (error) {
    console.warn(`Failed to resolve post ${postId}:`, error);
    // Return empty object on error - activity will still display
    return {};
  }
}

/**
 * Batch resolve multiple post contents
 */
export async function resolveBatchPostContents(
  postIds: string[]
): Promise<Map<string, PostContentData>> {
  const results = new Map<string, PostContentData>();

  // Filter out already cached items
  const uncached = postIds.filter((id) => !postCache.has(id));

  // If all items are cached, return immediately
  if (uncached.length === 0) {
    postIds.forEach((id) => {
      const cached = postCache.get(id);
      if (cached) results.set(id, cached);
    });
    return results;
  }

  // Fetch uncached items in parallel (max 5 at a time to avoid overwhelming server)
  const batchSize = 5;
  for (let i = 0; i < uncached.length; i += batchSize) {
    const batch = uncached.slice(i, i + batchSize);
    const promises = batch.map((id) =>
      resolvePostContent(id, "").then((data) => ({ id, data }))
    );

    const batchResults = await Promise.allSettled(promises);

    batchResults.forEach((result) => {
      if (result.status === "fulfilled") {
        const { id, data } = result.value;
        results.set(id, data);
      }
    });
  }

  // Add cached items to results
  postIds.forEach((id) => {
    if (!results.has(id)) {
      const cached = postCache.get(id);
      if (cached) results.set(id, cached);
    }
  });

  return results;
}


export function clearPostCache() {
  postCache.clear();
}


export async function preloadPosts(postIds: string[]) {
  await resolveBatchPostContents(postIds);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const sameActivity = (a: ActivityItem, b: ActivityItem): boolean => {
  const aTx = a.metadata?.transactionId;
  const bTx = b.metadata?.transactionId;
  return a.id === b.id || (typeof aTx === "string" && aTx === bTx);
};

const mergeActivities = (
  remote: ActivityItem[],
  local: ActivityItem[]
): ActivityItem[] => {
  const merged = [...remote];
  local.forEach((activity) => {
    if (!merged.some((item) => sameActivity(item, activity))) {
      merged.unshift(activity);
    }
  });
  return merged.sort((a, b) => b.createdAt - a.createdAt);
};


const calculateProfileStats = (activities: ActivityItem[]): ProfileStats => {
  if (!activities || activities.length === 0) {
    return {
      posts: 0,
      predictions: 0,
      hotTakes: 0,
      flashQuiz: 0,
      debates: 0,
      totalActivity: 0,
    };
  }

  // Debates = created (ROAR_DEBATE) + voted on (ROAR_DEBATE_PARTICIPATE).
  // These are two distinct activityLog entry types on the backend; both
  // count toward the "Debates" total shown to the user.
  const debates = activities.filter(
    (a) => a.type === "ROAR_DEBATE" || a.type === "ROAR_DEBATE_PARTICIPATE"
  ).length;
  const predictions = activities.filter((a) => a.type === "ROAR_PREDICTION").length;
  const hotTakes = activities.filter((a) => a.type === "ROAR_HOT_TAKE").length;
  const flashQuiz = activities.filter((a) => a.type === "FLASH_QUIZ").length;
  // Total = all meaningful activity types (excluding internal types)
  const totalActivity = debates + predictions + hotTakes + flashQuiz + activities.filter((a) => a.type === "ROAR_MEMORY" || a.type === "ROAR_RAW_REACTIONS").length;

  // `posts` should represent the total user-created content: posts + debates + predictions.
  // Build a set of content types (POST_TYPES may include debates/hot-takes) and include predictions.
  // NOTE: POST_TYPES intentionally still only contains "ROAR_DEBATE" (debate
  // creation), not "ROAR_DEBATE_PARTICIPATE" — voting on someone else's
  // debate isn't "creating content" for the Posts tab's purposes, even
  // though it does count toward the Debates tab above.
  const contentTypes = new Set<string>([...POST_TYPES, "ROAR_PREDICTION"]);
  const postsCount = activities.filter((a) => contentTypes.has(a.type)).length;

  return {
    posts: postsCount,
    predictions,
    hotTakes,
    flashQuiz,
    debates,
    totalActivity,
  };
};

// ─── Context ──────────────────────────────────────────────────────────────────
const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export const ActivityProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, authReady } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [serverCounts, setServerCounts] = useState<Record<string, number>>({});

  const inFlight = useRef(false);
  const localActivitiesRef = useRef<ActivityItem[]>([]);

  // ── Calculate memoized profile stats ────────────────────────────────────────
  // const profileStats = useMemo(
  //   () => calculateProfileStats(activities),
  //   [activities]
  // );

 const profileStats = useMemo(() => {
  const hasServerCounts = Object.keys(serverCounts).length > 0;
  if (!hasServerCounts) return calculateProfileStats(activities);

  // Debates = created (ROAR_DEBATE) + voted on (ROAR_DEBATE_PARTICIPATE).
  // Two separate activityCounts keys on the backend (see lib/userPoints.ts /
  // lib/roarPoints.ts), summed here so the user sees one combined total.
  const debatesCreated      = serverCounts["ROAR_DEBATE"] ?? 0;
  const debatesParticipated = serverCounts["ROAR_DEBATE_PARTICIPATE"] ?? 0;
  const debates             = debatesCreated + debatesParticipated;

  const predictions   = serverCounts["ROAR_PREDICTION"] ?? 0;
  const hotTakes       = serverCounts["ROAR_HOT_TAKE"] ?? 0;
  const flashQuiz       = serverCounts["FLASH_QUIZ"] ?? 0;
  const roarMemory       = serverCounts["ROAR_MEMORY"] ?? 0;
  const rawReactions     = serverCounts["ROAR_RAW_REACTIONS"] ?? 0;
  const roarPost           = serverCounts["ROAR_POST"] ?? 0;
  const roarQuiz             = serverCounts["ROAR_QUIZ"] ?? 0;

  // Posts tab = every content-creation type, matching the exact filter
  // Profile.tsx's "Posts" tab uses: ROAR_POST, ROAR_MEMORY,
  // ROAR_RAW_REACTIONS, ROAR_QUIZ, ROAR_DEBATE, ROAR_PREDICTION.
  // NOTE: ROAR_HOT_TAKE is intentionally excluded — Profile.tsx's own
  // filter list doesn't include it either, even though hotTakes is
  // tracked as its own stat. ROAR_DEBATE_PARTICIPATE is also intentionally
  // excluded from Posts — voting on a debate isn't content creation, it
  // only counts toward the Debates total above. Posts therefore uses
  // debatesCreated (not the combined `debates`) to avoid double-counting
  // participation as a "post".
  const posts = roarPost + roarMemory + rawReactions + roarQuiz + debatesCreated + predictions;

  return {
    posts,
    predictions,
    hotTakes,
    flashQuiz,
    debates,
    totalActivity: debates + predictions + hotTakes + flashQuiz + roarMemory + rawReactions + roarPost + roarQuiz,
  };
}, [serverCounts, activities]);

  // ── Badges ───────────────────────────────────────────────────────────────────
  // NOTE: this is currently a straight pass-through of the static BADGES_LIST
  // fixture (id/unlocked/progress hardcoded in constants.ts). It is NOT yet
  // derived from `activities` or `profileStats` — real per-badge unlock rules
  // (accuracy thresholds, sport-specific counts, majority-disagreement tracking,
  // tenure dates, etc.) aren't represented in ActivityItem yet. Wiring this up
  // to be live will require defining those rules explicitly per badge.
  const badges = useMemo(() => BADGES_LIST, []);

  // ── Fetch from API ──────────────────────────────────────────────────────────
  const fetchActivities = useCallback(async () => {
    const userId = user?.userId;
    if (!userId) {
      setActivities([]);
      return;
    }

    // Serve from cache if still fresh
    if (
      cache &&
      cache.userId === userId &&
      Date.now() - cache.ts < CACHE_TTL
    ) {
      setActivities(cache.data);
      return;
    }

    // Guard against concurrent fetches
    if (inFlight.current) return;
    inFlight.current = true;
    setLoading(true);

    try {
      const res = await axios.get(
        `/api/user-activity?userId=${encodeURIComponent(userId)}&limit=${ACTIVITY_FETCH_LIMIT}`
      );

      if (res.data.success) {
        // Merge server data with any optimistic local additions, sort newest-first
        const data = mergeActivities(
          res.data.activities,
          localActivitiesRef.current
        );
        cache = { ts: Date.now(), userId, data };
        setActivities(data);
        setServerCounts(res.data.counts ?? {});
      }
    } catch (e) {
      console.error("[ActivityContext] fetch error:", e);
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }, [user?.userId]);

  // ── Public API 

  
  const refreshActivities = useCallback(async () => {
    cache = null;
    await fetchActivities();
  }, [fetchActivities]);

  
  const addLocalActivity = useCallback(
    (activity: ActivityItem) => {
      localActivitiesRef.current = mergeActivities(
        [activity],
        localActivitiesRef.current
      );
      setActivities((prev) => {
        const data = mergeActivities(prev, [activity]);
        if (user?.userId) {
          cache = { ts: Date.now(), userId: user.userId, data };
        }
        return data;
      });
    },
    [user?.userId]
  );

  // Trigger fetch once auth is confirmed ready
  useEffect(() => {
    if (authReady) fetchActivities();
  }, [authReady, fetchActivities]);

  useEffect(() => {
    return onSxpActivityRefresh(() => {
      void refreshActivities();
    });
  }, [refreshActivities]);

  return (
    <ActivityContext.Provider
      value={{ activities, loading, profileStats, badges, refreshActivities, addLocalActivity }}
    >
      {children}
    </ActivityContext.Provider>
  );
};

export const useActivity = () => {
  const ctx = useContext(ActivityContext);
  if (!ctx) throw new Error("useActivity must be used within ActivityProvider");
  return ctx;

};
