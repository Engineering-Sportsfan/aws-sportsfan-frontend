import axios from "axios";

export interface FlipLineReply {
  id: string;
  userId?: string;
  userName: string;
  userHandle?: string;
  userAvatar?: string;
  adminPhoto?: string;
  authorPhoto?: string;
  content: string;
  replyTo?: string;
  time: string;
  createdAt: number;
  likes: number;
  likedBy?: string[];
}

export interface FlipLineComment {
  id: string;
  userId?: string;
  userName: string;
  userHandle?: string;
  userAvatar?: string;
  adminPhoto?: string;
  authorPhoto?: string;
  content: string;
  time: string;
  createdAt: number;
  likes: number;
  likedBy?: string[];
  replies: FlipLineReply[];
}

export interface FlipLineScoreChip {
  score: string;
  status: string;
  statusType: "live" | "upcoming" | "break" | "final" | "info" | "delay";
}

export interface FlipCard {
  id: number | string;
  type: string;
  sport: 'cricket' | 'football' | 'athletics' | 'general' | string;
  channel?: string;
  sportEmoji?: string;
  sportLabel?: string;
  day?: string;
  time: string;
  timeMs: number;
  author: string;
  handle?: string;
  source?: string;
  authorPhoto?: any;
  content: string;
  emoji?: string;
  mediaType?: 'audio' | 'video' | 'image';
  image?: any;
  videoUrl?: string;
  likes: number;
  likedBy?: string[];
  comments?: FlipLineComment[];
  commentsCount?: number;
  isKey?: boolean;
  tags?: string[];
  scoreChip?: FlipLineScoreChip;
  fomoMsg?: string;
  fomoCount?: number;
  ctaType?: 'room' | 'watchalong' | 'drop' | string;
  flipResponse?: string;
  sk?: string;
  userId?: string;
  email?: string;
  isVerified?: boolean;
  adminPhoto?: string;
  overLabel?: string;
  runSymbol?: string;
  createdAt?: number | string;
  isScheduled?: boolean;
  scheduledAt?: number;
  scheduledTimeMs?: number;
}

export const fliplineService = {
  /** Fetch all FlipLine cards */
  fetchFlipCards: async (channelOrSport?: string): Promise<FlipCard[]> => {
    try {
      const url =
        channelOrSport && channelOrSport !== "all"
          ? `/api/flipline?sport=${encodeURIComponent(channelOrSport)}`
          : "/api/flipline";
      const res = await axios.get<{ success: boolean; data: FlipCard[] }>(url);
      return Array.isArray(res.data?.data) ? res.data.data : [];
    } catch (err) {
      console.warn("Failed to fetch flip cards:", err);
      return [];
    }
  },

  /** Create a new FlipLine card (includes file upload support) */
  createFlipCard: async (
    card: Omit<FlipCard, "id" | "timeMs">,
    imageFile: File | null,
    videoFile: File | null
  ): Promise<FlipCard> => {
    const formData = new FormData();
    formData.append("content", card.content);
    formData.append("sport", card.sport);
    formData.append("type", card.type);
    formData.append("author", card.author);
    if (card.handle) formData.append("handle", card.handle);
    formData.append("source", card.source || "FlipLine");
    formData.append("likes", String(card.likes || 0));
    formData.append("isKey", String(card.isKey || false));
    if (card.emoji) formData.append("emoji", card.emoji);
    if (card.fomoMsg) formData.append("fomoMsg", card.fomoMsg);
    formData.append("fomoCount", String(card.fomoCount || 0));
    formData.append("ctaType", card.ctaType || "room");
    if (card.flipResponse) formData.append("flipResponse", card.flipResponse);
    if (card.userId) formData.append("userId", card.userId);
    if (card.email) formData.append("email", card.email);
    if (card.day) formData.append("day", card.day);
    if (card.time) formData.append("time", card.time);
    if (card.isVerified !== undefined) formData.append("isVerified", String(card.isVerified));
    if (card.adminPhoto) formData.append("adminPhoto", card.adminPhoto);
    if (card.authorPhoto) formData.append("authorPhoto", card.authorPhoto);

    if (imageFile) {
      formData.append("media", imageFile);
    }
    if (videoFile) {
      formData.append("media", videoFile);
    }

    const res = await axios.post<{ success: boolean; data: FlipCard }>("/api/flipline", formData);
    return res.data.data;
  },

  /** Like or unlike a FlipLine card in the backend */
  likeFlipCard: async (
    sk: string,
    action: "like" | "unlike",
    userId?: string
  ): Promise<{ success: boolean; likes?: number; likedBy?: string[] }> => {
    const res = await axios.patch("/api/flipline", { sk, action, userId });
    return res.data;
  },

  /** Add a top-level comment to a card */
  addComment: async (
    sk: string,
    data: {
      content: string;
      userId?: string;
      userName: string;
      userHandle?: string;
      userAvatar?: string;
      adminPhoto?: string;
      authorPhoto?: string;
    }
  ): Promise<{ success: boolean; comment: FlipLineComment; comments: FlipLineComment[] }> => {
    const res = await axios.patch("/api/flipline", {
      sk,
      action: "add_comment",
      ...data,
    });
    return res.data;
  },

  /** Delete a comment */
  deleteComment: async (
    sk: string,
    commentId: string
  ): Promise<{ success: boolean; comments: FlipLineComment[] }> => {
    const res = await axios.patch("/api/flipline", {
      sk,
      action: "delete_comment",
      commentId,
    });
    return res.data;
  },

  /** Like or unlike a comment */
  likeComment: async (
    sk: string,
    commentId: string,
    action: "like_comment" | "unlike_comment",
    userId?: string
  ): Promise<{ success: boolean; comment: FlipLineComment; comments: FlipLineComment[] }> => {
    const res = await axios.patch("/api/flipline", {
      sk,
      action,
      commentId,
      userId,
    });
    return res.data;
  },

  /** Add a nested reply to an existing comment */
  addReply: async (
    sk: string,
    data: {
      commentId: string;
      content: string;
      replyTo?: string;
      userId?: string;
      userName: string;
      userHandle?: string;
      userAvatar?: string;
      adminPhoto?: string;
      authorPhoto?: string;
    }
  ): Promise<{ success: boolean; reply: FlipLineReply; comment: FlipLineComment; comments: FlipLineComment[] }> => {
    const res = await axios.patch("/api/flipline", {
      sk,
      action: "add_reply",
      ...data,
    });
    return res.data;
  },

  /** Delete a reply */
  deleteReply: async (
    sk: string,
    commentId: string,
    replyId: string
  ): Promise<{ success: boolean; comments: FlipLineComment[] }> => {
    const res = await axios.patch("/api/flipline", {
      sk,
      action: "delete_reply",
      commentId,
      replyId,
    });
    return res.data;
  },

  /** Like or unlike a reply */
  likeReply: async (
    sk: string,
    commentId: string,
    replyId: string,
    action: "like_reply" | "unlike_reply",
    userId?: string
  ): Promise<{ success: boolean; reply: FlipLineReply; comment: FlipLineComment; comments: FlipLineComment[] }> => {
    const res = await axios.patch("/api/flipline", {
      sk,
      action,
      commentId,
      replyId,
      userId,
    });
    return res.data;
  },
};
