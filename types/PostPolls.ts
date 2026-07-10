export type PollOption = {
  id: string;
  text: string;
  votes: number;
};

export type Poll = {
  id?: string;
  options: PollOption[];
  totalVotes: number;
  endsAt: number; // timestamp — 24 hours from creation
  createdAt: number;
  votedBy?: (string | { voterId: string; userName: string })[];
};

export type MediaItem = {
  url: string;
  type: "image" | "video";
  name?: string;
};

export interface QuotedPostSnapshot {
  id: string;
  userName: string;
  userHandle?: string;
  content: string;
  media?: MediaItem[];
  createdAt: number;
}

export type Post = {
  id?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userHandle: string;
  content: string;
  media?: MediaItem[];
  poll?: Poll | null;
  currentUserName: string | null; 
  commentCount?: number;
  repostCount: number;
  reactions?: Record<string, string>;
  userEmail?: string; 
  likes: number;
  likedBy: string[];
  createdAt: number;
  updatedAt: number;
   repostedBy?: string[];        // userIds who plain-reposted
   isRepost?: boolean;
   isQuoteRepost?: boolean;
   originalPostId?: string;
   quotedPost?: QuotedPostSnapshot | null;
};

export type CreatePostPayload = {
  userName: string;
  userAvatar?: string;
  userHandle: string;
  content: string;
  media?: MediaItem[];
  poll?: {
    options: string[]; // just the text strings; server builds full PollOption[]
  } | null;
};

export type UpdatePostPayload = Partial<
  Pick<Post, "content" | "media" | "poll">
>;

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type PaginatedPostsResponse = {
  success: boolean;
  posts: Post[];
  pagination: {
    limit: number;
    hasMore: boolean;
    nextCursor: {
      lastDocId: string;
      lastDocCreatedAt: number;
    } | null;
  };
};



// Convenience re-export for the reaction IDs
export type ReactionId = "like" | "love" | "haha" | "wow" | "sad" | "angry";
 
export const REACTION_META: Record<ReactionId, { emoji: string; label: string }> = {
  like:  { emoji: "👍", label: "Like"  },
  love:  { emoji: "❤️", label: "Love"  },
  haha:  { emoji: "😂", label: "Haha"  },
  wow:   { emoji: "😮", label: "Wow"   },
  sad:   { emoji: "😢", label: "Sad"   },
  angry: { emoji: "😡", label: "Angry" },
};