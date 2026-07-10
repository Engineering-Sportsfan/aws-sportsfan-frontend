export type PollType = "poll" | "quiz";

export interface PollOption {
  id: string;
  label: string;
  votes: number;
  isCorrect?: boolean;
}

export interface Poll {
  id: string;
  title: string;
  type: PollType;
  options: PollOption[];
  endsAt: string;
  active: boolean;
  createdAt: string;
  points?: number;         // ← NEW: points awarded for correct answer e.g. 50
  locksWhen?: string;      // ← NEW: optional label e.g. "Locks when RCB innings starts"
  matchId?: string;        // ← NEW: tie poll to a match
}

// ─── API payloads ─────────────────────────────────────────────────────────────

export interface CreatePollBody {
  title: string;
  type: PollType;
  options: Array<{ label: string; isCorrect?: boolean }>;
  endsAt: string;
  points?: number;
  locksWhen?: string;
  matchId?: string;
}

export interface UpdatePollBody {
  title?: string;
  endsAt?: string;
  active?: boolean;
  points?: number;
}

export interface VoteBody {
  optionId: string;
  userId?: string;
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  initials: string;
  avatarColor: string;
  totalPoints: number;
  correctPredictions: number;
  totalPredictions: number;
  pointsToday?: number;
  rankChange?: number;
  isCurrentUser?: boolean;
  streak?: string;
}

// ─── User prediction (stored locally or from API) ─────────────────────────────

export interface UserPrediction {
  pollId: string;
  optionId: string;
  optionLabel: string;
  submittedAt: string;
}