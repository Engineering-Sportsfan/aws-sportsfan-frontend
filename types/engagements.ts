// types/engagements.ts — Type definitions for Fan Battles, Quizzes, Polls, Predictions, and Meme Arena
export type EngagementType = "fan_battle" | "quiz" | "poll" | "prediction" | "meme";
export type EngagementStatus = "active" | "inactive" | "expired" | "settled";

// ─── 1. Fan Battle ─────────────────────────────────────────────────────────
export interface Competitor {
  code: string; // e.g. "IN", "PK", "AUS"
  name: string; // e.g. "Virat Kohli", "Babar Azam"
  stat: string; // e.g. "Avg 58.6 in Tests"
  imageUrl?: string;
  votes: number;
}

export interface FanBattlePayload {
  leftCompetitor: Competitor;
  rightCompetitor: Competitor;
  totalVotes: number;
  startTime?: number | string;
  scheduledStartTime?: number | string;
}

// ─── 2. Quiz ───────────────────────────────────────────────────────────────
export interface QuizOption {
  id: string; // "A", "B", "C", "D"
  text: string; // e.g. "29"
}

export interface QuizQuestionItem {
  id: string;
  question: string;
  options: QuizOption[];
  correctOptionId: string;
  pointsReward?: number;
  explanation?: string;
}

export interface QuizPayload {
  question: string;
  options: QuizOption[];
  correctOptionId: string; // "B"
  pointsReward: number; // e.g. 50
  explanation?: string; // e.g. "Correct: 29"
  questions?: QuizQuestionItem[];
  frequencyMinutes?: number;
  startTime?: number | string;
  scheduledStartTime?: number | string;
}

// ─── 3. Poll ───────────────────────────────────────────────────────────────
export interface PollChoice {
  id: string;
  text: string; // e.g. "Jasprit Bumrah 🏏"
  votes: number;
  percentage?: number;
}

export interface PollPayload {
  question: string;
  options: PollChoice[];
  totalVotes: number;
  answer?: string;
  correctAnswer?: string;
  durationMinutes?: number;
  timerMinutes?: number;
  expiresAt?: number;
  startTime?: number | string;
  scheduledStartTime?: number | string;
}

// ─── 4. Prediction ─────────────────────────────────────────────────────────
export interface PredictionChoice {
  id: string; // "left" | "right"
  text: string; // e.g. "Yes, India win"
  code?: string; // e.g. "IN"
  votes: number;
}

export interface PredictionPayload {
  question: string;
  leftChoice: PredictionChoice;
  rightChoice: PredictionChoice;
  coinStake: number; // e.g. 25
  totalVotes: number;
  status?: "open" | "locked" | "settled";
  winningChoiceId?: string | null; // "left" | "right" once settled
  answer?: string;
  correctAnswer?: string;
  durationMinutes?: number;
  timerMinutes?: number;
  expiresAt?: number;
  startTime?: number | string;
  scheduledStartTime?: number | string;
}

// ─── 5. Meme Arena ─────────────────────────────────────────────────────────
export type MemeReactionType = "mild" | "funny" | "hot" | "fire" | "nuclear";

export interface MemeReactions {
  mild: number;
  funny: number;
  hot: number;
  fire: number;
  nuclear: number;
}

export interface MemePayload {
  imageUrl: string;
  authorName?: string;
  authorHandle?: string;
  authorAvatar?: string;
  heatPercentage?: number;
  totalVotes?: number;
  reactions?: MemeReactions;
  commentsCount?: number;
  sharesCount?: number;
  userReaction?: MemeReactionType | null;
  caption?: string;
  createdAt?: number;
}

// ─── Universal Engagement Entity ──────────────────────────────────────────
export interface EngagementItem {
  id: string;
  type: EngagementType;
  title: string; // Display title / banner
  subtitle?: string;
  tags?: string[]; // e.g. ["⚔️ FAN BATTLE", "🔥 TRENDING"] or ["💬 QUIZ", "⭐ 50 PTS"]
  sport?: string; // "cricket" | "football" | "athletics" | "general"
  status: EngagementStatus;
  startTime?: number | string;
  scheduledStartTime?: number | string;
  creatorId?: string;
  creatorEmail?: string;
  creatorName?: string;
  creatorHandle?: string;
  creatorAvatar?: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  userAvatar?: string;

  // Specific data payloads
  fanBattleData?: FanBattlePayload;
  quizData?: QuizPayload;
  pollData?: PollPayload;
  predictionData?: PredictionPayload;
  memeData?: MemePayload;

  // Social / Engagement counters
  likes: number;
  shares: number;
  totalEngaged: number;

  // Hydrated user state
  userLiked?: boolean;
  userVoted?: boolean;
  userVote?: string | null;

  createdAt: number;
  updatedAt: number;
  expiresAt?: number | null;
}

// ─── API Responses ────────────────────────────────────────────────────────
export interface EngagementsListResponse {
  success: boolean;
  engagements: EngagementItem[];
  total: number;
}

export interface FanBattleVoteResponse {
  success: boolean;
  type: "fan_battle";
  selectedOptionId: "left" | "right" | string;
  leftPercentage: number;
  rightPercentage: number;
  leftVotes: number;
  rightVotes: number;
  totalVotes: number;
}

export interface QuizAnswerResponse {
  success: boolean;
  type: "quiz";
  isCorrect: boolean;
  correctOptionId: string;
  pointsAwarded: number;
  explanation: string;
}

export interface PollVoteResponse {
  success: boolean;
  type: "poll";
  selectedOptionId: string;
  options: PollChoice[];
  totalVotes: number;
}

export interface PredictionVoteResponse {
  success: boolean;
  type: "prediction";
  selectedOptionId: "left" | "right" | string;
  leftPercentage: number;
  rightPercentage: number;
  coinsLocked: number;
  totalVotes: number;
}

export type VoteResponse =
  | FanBattleVoteResponse
  | QuizAnswerResponse
  | PollVoteResponse
  | PredictionVoteResponse;

export interface LikeResponse {
  success: boolean;
  liked: boolean;
  likesCount: number;
}

export interface ShareResponse {
  success: boolean;
  sharesCount: number;
  totalEngaged: number;
}

export interface CheckVoteStatusResponse {
  hasVoted: boolean;
  selectedOptionId: string | null;
  vote?: any;
  isExpired?: boolean;
  isCorrect?: boolean | null;
  accuracyBonusAwarded?: boolean;
  wonBonusPoints?: number;
  newlyAwarded?: boolean;
  correctAnswer?: string | null;
  winningChoiceId?: string | null;
}

