// import type {
//   CurrentUser,
//   FeedPost,
//   RoomPost,
//   Notification,
//   LeaderboardEntry,
//   BadgeEntry,
//   UserPrediction,
//   UserHotTake,
// } from "../types";

// export const avatarUrl = (u: string) =>
//   `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u)}&backgroundColor=0E0E14`;

// export const BADGE_LABELS: Record<string, string> = {
//   ORACLE: "Oracle 👁",
//   BOLD_CALLER: "Bold Caller ⚡",
//   CRICKET_HEAD: "Cricket Head 🏏",
//   CONTRARIAN: "Contrarian 🔥",
//   OG_FAN: "OG Fan 👑",
//   SEASONED_FAN: "Seasoned Fan 🏅",
//   RISING_FAN: "Rising Fan ⭐",
// };

// export const BADGE_CONFIG: Record<string, any> = {
//   ORACLE: {
//     gradient: ["#FFB800", "#FF9800", "#FFB800"],
//     icon: "👁",
//     iconBg: "#FFB800",
//     glow: "0 0 24px rgba(255,184,0,0.65)",
//     animated: true,
//     name: "Oracle",
//   },
//   BOLD_CALLER: {
//     gradient: ["#E91E8C", "#FF6B35"],
//     icon: "⚡",
//     iconBg: "#E91E8C",
//     glow: "0 0 20px rgba(233,30,140,0.55)",
//     animated: false,
//     name: "Bold Caller",
//   },
//   CRICKET_HEAD: {
//     gradient: ["#1565C0", "#00BCD4"],
//     icon: "🏏",
//     iconBg: "#1565C0",
//     glow: "none",
//     animated: false,
//     name: "Cricket Head",
//   },
//   CONTRARIAN: {
//     gradient: ["#7B1FA2", "#E040FB"],
//     icon: "🔥",
//     iconBg: "#7B1FA2",
//     glow: "none",
//     dashed: true,
//     animated: false,
//     name: "Contrarian",
//   },
//   OG_FAN: {
//     gradient: ["#B87333", "#CD7F32", "#8B4513"],
//     icon: "👑",
//     iconBg: "#B87333",
//     glow: "none",
//     animated: false,
//     name: "OG Fan",
//   },
//   SEASONED_FAN: {
//     gradient: ["#8888A0", "#666680"],
//     icon: "🏅",
//     iconBg: "#666680",
//     glow: "none",
//     animated: false,
//     name: "Seasoned Fan",
//   },
//   RISING_FAN: {
//     gradient: null,
//     icon: "⭐",
//     iconBg: "#44445A",
//     glow: "none",
//     borderOnly: true,
//     animated: false,
//     name: "Rising Fan",
//   },
// };

// export const BADGE_DETAIL: Record<string, any> = {
//   ORACLE: {
//     name: "Oracle",
//     description: "Top 5% prediction accuracy over 30+ predictions.",
//     rarity: "Legendary · Top 3%",
//     howTo: "Get 75%+ accuracy over 30 predictions",
//     gradient: "linear-gradient(135deg,#FFB800,#FF9800)",
//   },
//   BOLD_CALLER: {
//     name: "Bold Caller",
//     description: "You call the unexpected and get it right.",
//     rarity: "Rare · Top 12%",
//     howTo: "Make 3 correct bold predictions",
//     gradient: "linear-gradient(135deg,#E91E8C,#FF6B35)",
//   },
//   CRICKET_HEAD: {
//     name: "Cricket Head",
//     description: "All-in on cricket. The game is your religion.",
//     rarity: "Common",
//     howTo: "Vote on 20 cricket debates",
//     gradient: "linear-gradient(135deg,#1565C0,#00BCD4)",
//   },
//   CONTRARIAN: {
//     name: "Contrarian",
//     description: "Always on the other side. And often right.",
//     rarity: "Uncommon · Top 22%",
//     howTo: "Disagree on 10 majority positions",
//     gradient: "linear-gradient(135deg,#7B1FA2,#E040FB)",
//   },
//   OG_FAN: {
//     name: "OG Fan",
//     description: "Before 2010. True fandom runs deep.",
//     rarity: "Epic · Top 8%",
//     howTo: "Set tenure to before 2010",
//     gradient: "linear-gradient(135deg,#B87333,#CD7F32)",
//   },
//   SEASONED_FAN: {
//     name: "Seasoned Fan",
//     description: "You've seen the highs and lows. Still here.",
//     rarity: "Uncommon",
//     howTo: "Set tenure to 2010-2022",
//     gradient: "linear-gradient(135deg,#8888A0,#666680)",
//   },
//   RISING_FAN: {
//     name: "Rising Fan",
//     description: "Welcome to ROAR. Your legacy starts now.",
//     rarity: "Common",
//     howTo: "Complete onboarding",
//     gradient: "linear-gradient(135deg,#44445A,#6B6B8A)",
//   },
// };

// export const TENURE_OPTIONS = [
//   {
//     id: "rising",
//     label: "Just getting started",
//     sub: "2023+",
//     badge: "RISING_FAN",
//     chip: "Rising Fan ⭐",
//     desc: "New to the game — fresh opinions, fresh takes.",
//   },
//   {
//     id: "seasoned",
//     label: "Been here a while",
//     sub: "2010–2022",
//     badge: "SEASONED_FAN",
//     chip: "Seasoned Fan 🏅",
//     desc: "You've seen the highs and the lows. Still here.",
//   },
//   {
//     id: "og",
//     label: "OG Fan",
//     sub: "Before 2010",
//     badge: "OG_FAN",
//     chip: "OG Fan 👑",
//     desc: "Before the IPL, before T20. True fandom runs deep.",
//   },
// ];

// export const TEAMS = [
//   { id: "India", emoji: "🇮🇳", label: "India", color: "#FF9800", sport: "cricket" },
//   { id: "Pak", emoji: "🇵🇰", label: "Pakistan", color: "#4CAF50", sport: "cricket" },
//   { id: "Aus", emoji: "🇦🇺", label: "Aus", color: "#FFEB3B", sport: "cricket" },
//   { id: "Eng", emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", label: "England", color: "#F44336", sport: "cricket" },
//   { id: "MI", emoji: "💙", label: "MI", color: "#1565C0", sport: "cricket" },
//   { id: "CSK", emoji: "💛", label: "CSK", color: "#FFCC00", sport: "cricket" },
//   { id: "RCB", emoji: "❤️", label: "RCB", color: "#B71C1C", sport: "cricket" },
//   { id: "KKR", emoji: "💜", label: "KKR", color: "#6A1B9A", sport: "cricket" },
//   { id: "MCFC", emoji: "🔵", label: "MCFC", color: "#1E88E5", sport: "football" },
//   { id: "BFC", emoji: "🔴", label: "BFC", color: "#E53935", sport: "football" },
//   { id: "MohanB", emoji: "🟢", label: "Mohun B", color: "#43A047", sport: "football" },
//   { id: "Kerala", emoji: "🟡", label: "Kerala", color: "#FDD835", sport: "football" },
// ];

// export const FEED_POSTS: FeedPost[] = [
//   {
//     id: "ht1",
//     type: "hot_take",
//     sport: "cricket",
//     fan: { username: "Arjun_80s", badge: "OG_FAN", team: "India" },
//     text: "Virat Kohli in 2025 is better than Sachin Tendulkar ever was. Change my mind.",
//     agreePercent: 24,
//     fanCount: 8821,
//     replies: 234,
//     following: false,
//     isLive: false,
//   },
//   {
//     id: "ht2",
//     type: "hot_take",
//     sport: "football",
//     fan: { username: "MumbaiCity_Fan", badge: "BOLD_CALLER", team: "MCFC" },
//     text: "ISL is genuinely world-class football now. The quality this season has been incredible.",
//     agreePercent: 68,
//     fanCount: 1230,
//     replies: 89,
//     following: true,
//     isLive: true,
//   },
//   {
//     id: "pr1",
//     type: "prediction",
//     sport: "cricket",
//     fan: { username: "StatsKing_99", badge: "ORACLE", team: "India" },
//     text: "Bumrah takes 5+ wickets in today's first innings.",
//     match: "IND vs AUS · 3rd Test",
//     samePredictionCount: 1240,
//     counterCount: 89,
//   },
//   {
//     id: "pr2",
//     type: "prediction",
//     sport: "football",
//     fan: { username: "GoalMachine_9", badge: "BOLD_CALLER", team: "MCFC" },
//     text: "Mumbai City FC wins the ISL title this season. Book it.",
//     match: "ISL 2025",
//     samePredictionCount: 567,
//     counterCount: 200,
//   },
//   {
//     id: "ht3",
//     type: "hot_take",
//     sport: "cricket",
//     fan: { username: "PakFan_K", badge: "CONTRARIAN", team: "Pak" },
//     text: "India vs Pakistan is the greatest sporting rivalry in the world. Super Bowl, El Clásico — all secondary.",
//     agreePercent: 82,
//     fanCount: 15200,
//     replies: 903,
//     following: false,
//     isLive: false,
//   },
//   {
//     id: "ht4",
//     type: "hot_take",
//     sport: "football",
//     fan: { username: "KeralaFan_12", badge: "CRICKET_HEAD", team: "Kerala" },
//     text: "Kerala Blasters fans are the best football supporters in Asia. Jawaharlal Nehru Stadium atmosphere is unreal.",
//     agreePercent: 77,
//     fanCount: 4100,
//     replies: 312,
//     following: false,
//     isLive: false,
//   },
//   {
//     id: "ht5",
//     type: "hot_take",
//     sport: "cricket",
//     fan: { username: "DelhiDaredevil", badge: "RISING_FAN", team: "RCB" },
//     text: "RCB has the most loyal fanbase of any team in any sport in India. The loyalty despite the trophies is unmatched.",
//     agreePercent: 61,
//     fanCount: 6300,
//     replies: 512,
//     following: false,
//     isLive: false,
//   },
//   {
//     id: "ht6",
//     type: "hot_take",
//     sport: "football",
//     fan: { username: "BFCArmy", badge: "SEASONED_FAN", team: "BFC" },
//     text: "Bengaluru FC era is over. New generation clubs will dominate ISL by 2027.",
//     agreePercent: 44,
//     fanCount: 890,
//     replies: 78,
//     following: false,
//     isLive: false,
//   },
// ];

// export const ROOM_POSTS: RoomPost[] = [
//   {
//     id: "rp1",
//     fan: { username: "Rahul_77", badge: "BOLD_CALLER" },
//     text: "Kohli is going to smash this bowling attack today. 80+ guaranteed.",
//     fireCount: 14,
//     nochanceCount: 3,
//     timeAgo: "2m",
//     type: "prediction",
//   },
//   {
//     id: "rp2",
//     fan: { username: "SportsMumbai", badge: "CONTRARIAN" },
//     text: "This pitch looks dry. Spinners will dominate by innings 2. Bumrah is a back-up plan today.",
//     fireCount: 31,
//     nochanceCount: 8,
//     timeAgo: "4m",
//     type: "hottake",
//   },
//   {
//     id: "rp3",
//     fan: { username: "CricketGuru", badge: "ORACLE" },
//     text: "Bumrah is the GOAT. No debate. Anyone who disagrees hasn't watched real cricket.",
//     fireCount: 89,
//     nochanceCount: 12,
//     timeAgo: "6m",
//     type: "chat",
//   },
//   {
//     id: "rp4",
//     fan: { username: "StatsKing_99", badge: "ORACLE" },
//     text: "India has never lost a day-night test at home. That streak ends today or it doesn't.",
//     fireCount: 45,
//     nochanceCount: 5,
//     timeAgo: "9m",
//     type: "hottake",
//   },
//   {
//     id: "rp5",
//     fan: { username: "Priya_Cricket", badge: "RISING_FAN" },
//     text: "My prediction: Jadeja takes 4 wickets. Writing this here so you all remember.",
//     fireCount: 7,
//     nochanceCount: 22,
//     timeAgo: "12m",
//     type: "prediction",
//   },
// ];

// export const JOIN_FANS = [
//   "Rahul_K", "Sanjay_MI", "Priya77", "CricFan_Delhi",
//   "TheRealRohan", "MumbaiMagic", "FootyFirst", "KohliArmy",
// ];

// export const NOTIFICATIONS_DATA: Notification[] = [
//   {
//     id: "n1",
//     type: "PREDICTION_OK",
//     title: "You called it! 🎯",
//     subtitle: "Your prediction 'Kohli 80+' vs Australia was CORRECT. +50 rep points.",
//     time: "2m",
//     read: false,
//     fan: { username: "StatsKing_99", badge: "ORACLE" },
//     cta: "See your accuracy",
//   },
//   {
//     id: "n2",
//     type: "CHALLENGE",
//     title: "StatsKing_99 challenged your take.",
//     subtitle: "They said Rohit is more consistent than Kohli in tests. Reply now.",
//     time: "8m",
//     read: false,
//     fan: { username: "StatsKing_99", badge: "ORACLE" },
//     cta: null,
//   },
//   {
//     id: "n5",
//     type: "BADGE",
//     title: "Badge Unlocked: Bold Caller ⚡",
//     subtitle: "You called 3 unexpected outcomes correctly. Rare badge earned.",
//     time: "2h",
//     read: true,
//     fan: null,
//     cta: null,
//   },
//   {
//     id: "n6",
//     type: "PREDICTION_FAIL",
//     title: "Wrong call — but a bold one 💪",
//     subtitle: "Your prediction 'Jadeja 4 wickets' was incorrect. It stays on profile.",
//     time: "3h",
//     read: true,
//     fan: { username: "Priya_Cricket", badge: "RISING_FAN" },
//     cta: null,
//   },
//   {
//     id: "n7",
//     type: "RIVAL",
//     title: "Your rival won a debate.",
//     subtitle: "Arjun_80s was right about Kohli vs AUS. Your score: 2 wins, 5 losses.",
//     time: "5h",
//     read: true,
//     fan: { username: "Arjun_80s", badge: "OG_FAN" },
//     cta: "Challenge them",
//   },
//   {
//     id: "n8",
//     type: "FAN_OF_WEEK",
//     title: "Fan of the Week: Arjun_80s 🏆",
//     subtitle: "82% accuracy this week. 47 correct predictions.",
//     time: "1d",
//     read: true,
//     fan: { username: "Arjun_80s", badge: "OG_FAN" },
//     cta: null,
//   },
//   {
//     id: "n9",
//     type: "WEEKLY",
//     title: "Monday Bold Call is live!",
//     subtitle: "This week: Will India win the series vs AUS? 3,200 fans voted.",
//     time: "1d",
//     read: true,
//     fan: null,
//     cta: "Cast your call",
//   },
// ];

// export const LEADERBOARD_DATA: LeaderboardEntry[] = [
//   { rank: 1, username: "OracleKing_IND", badge: "ORACLE", accuracy: 84, predictions: 127, team: "India", reputationScore: 9800 },
//   { rank: 2, username: "Arjun_80s", badge: "OG_FAN", accuracy: 79, predictions: 98, team: "India", reputationScore: 8200 },
//   { rank: 3, username: "StatsKing_99", badge: "ORACLE", accuracy: 77, predictions: 143, team: "India", reputationScore: 7900 },
//   { rank: 4, username: "CricFanatic", badge: "CRICKET_HEAD", accuracy: 74, predictions: 61, team: "MI", reputationScore: 6100 },
//   { rank: 5, username: "PakFan_K", badge: "CONTRARIAN", accuracy: 71, predictions: 89, team: "Pak", reputationScore: 5400 },
//   { rank: 6, username: "MumbaiCity_Fan", badge: "BOLD_CALLER", accuracy: 69, predictions: 54, team: "MCFC", reputationScore: 4300 },
//   { rank: 7, username: "KeralaFan_12", badge: "CRICKET_HEAD", accuracy: 67, predictions: 72, team: "Kerala", reputationScore: 3700 },
//   { rank: 8, username: "GoalMachine_9", badge: "BOLD_CALLER", accuracy: 65, predictions: 38, team: "MCFC", reputationScore: 3100 },
//   { rank: 9, username: "DelhiDaredevil", badge: "RISING_FAN", accuracy: 62, predictions: 29, team: "RCB", reputationScore: 2100 },
//   { rank: 10, username: "BFCArmy", badge: "SEASONED_FAN", accuracy: 60, predictions: 45, team: "BFC", reputationScore: 1800 },
//   { rank: 23, username: "RoarUser", badge: "RISING_FAN", accuracy: 55, predictions: 12, team: "India", reputationScore: 520 },
// ];

// export const CURRENT_USER = {
//   username: "RoarUser",
//   handle: "roaruser",
//   badge: "RISING_FAN" as string,
//   fanSince: "2019",
//   yearsFandom: 6,
//   accuracy: 55,
//   predictionCount: 12,
//   hotTakeCount: 8,
//   reputationScore: 520,
//   teams: ["India", "MI"],
//   rank: 23,
// };

// export const USER_PREDICTIONS: UserPrediction[] = [
//   { id: "up1", text: "Kohli scores 80+ against Australia in the 3rd Test.", matchId: "IND vs AUS 3rd Test", status: "CORRECT", createdAt: "2 days ago" },
//   { id: "up2", text: "India wins the series 3-1 vs England.", matchId: "IND vs ENG Series", status: "WRONG", createdAt: "1 week ago" },
//   { id: "up3", text: "Bumrah takes 5+ wickets in first innings.", matchId: "IND vs AUS 3rd Test", status: "PENDING", createdAt: "Today" },
//   { id: "up4", text: "CSK lifts IPL trophy 2025.", matchId: "IPL 2025 Final", status: "CORRECT", createdAt: "2 months ago" },
// ];

// export const USER_HOT_TAKES: UserHotTake[] = [
//   { id: "uht1", text: "Jadeja is the most complete cricketer India has ever produced.", agreePercent: 72, controversial: false, top: true },
//   { id: "uht2", text: "ISL will overtake IPL in viewership by 2028.", agreePercent: 29, controversial: true, top: false },
//   { id: "uht3", text: "RCB will never win the IPL. Scientifically impossible.", agreePercent: 61, controversial: false, top: false },
// ];

// export const BADGES_LIST: BadgeEntry[] = [
//   { id: "ORACLE", unlocked: false, progress: 62 },
//   { id: "BOLD_CALLER", unlocked: true, progress: 100, earnedDate: "Earned 3 days ago" },
//   { id: "CRICKET_HEAD", unlocked: true, progress: 100, earnedDate: "Earned 2 weeks ago" },
//   { id: "CONTRARIAN", unlocked: false, progress: 40 },
//   { id: "OG_FAN", unlocked: false, progress: 0 },
//   { id: "SEASONED_FAN", unlocked: false, progress: 0 },
//   { id: "RISING_FAN", unlocked: true, progress: 100, earnedDate: "Earned on signup" },
// ];

// export const RIVAL = {
//   fan: { username: "Arjun_80s", badge: "OG_FAN" },
//   badge: "OG_FAN",
//   disagreements: 7,
//   rivalWins: 5,
//   yourWins: 2,
//   topDisagreement: '"Sachin was better than Kohli in all formats" — still debating this one.',
// };

// export const HOT_TAKE_PREVIEWS = [
//   { id: "lp1", fan: { username: "Arjun_80s", badge: "OG_FAN" }, text: "Sachin vs Kohli debate is over. It was never close." },
//   { id: "lp2", fan: { username: "PakFan_K", badge: "CONTRARIAN" }, text: "India vs Pakistan is must-watch. Forget the Champions Trophy." },
//   { id: "lp3", fan: { username: "CricGuru", badge: "ORACLE" }, text: "Bumrah is the best bowler alive. Not even debatable." },
// ];

// export const UPCOMING_MATCHES = [
//   "IND vs AUS 3rd Test",
//   "IND vs ENG ODI Series",
//   "ISL: MCFC vs BFC",
//   "ISL: Kerala vs Mohun B",
// ];

// export const COMPOSE_OPTIONS = [
//   { id: "hot_take", emoji: "🔥", title: "Drop a Hot Take", desc: "Say what others won't" },
//   { id: "prediction", emoji: "📊", title: "Make a Prediction", desc: "Put your reputation on the line" },
//   { id: "debate", emoji: "⚡", title: "Start a Debate", desc: "Two sides. One winner." },
//   { id: "memory", emoji: "🕰", title: "Share a Memory", desc: "Flashback moment" },
//   { id: "post", emoji: "✏️", title: "Post", desc: "Share photos, videos or GIFs" },
// ];

// export const RADIAL_OPTS = [
//   { id: "hot_take", label: "Hot Take", emoji: "🔥" },
//   { id: "prediction", label: "Predict", emoji: "📊" },
//   { id: "debate", label: "Debate", emoji: "⚡" },
//   { id: "memory", label: "Memory", emoji: "🕰" },
//   { id: "post", label: "Post", emoji: "✏️" },
// ];

// export const FEED_FILTERS = ["For You", "Cricket", "Football", "Live", "Predictions"];

// export const NAV_TABS = [
//   { id: "home", label: "Home", icon: "🏠" },
//   { id: "discuss", label: "Discuss", icon: "💬" },
//   { id: "compose", label: "", icon: "+" },
//   { id: "profile", label: "You", icon: "👤" },
//   { id: "alerts", label: "Alerts", icon: "🔔" },
// ];

// export const NOTIF_FILTERS = ["All", "Predictions", "Challenges", "Badges", "Match"];

// export const TYPE_STYLES: Record<string, any> = {
//   PREDICTION_OK: { color: "var(--correct-green)", label: "PREDICTION ✓", pulse: false },
//   PREDICTION_FAIL: { color: "var(--wrong-red)", label: "PREDICTION ✗", pulse: false },
//   CHALLENGE: { color: "var(--accent-magenta)", label: "CHALLENGE", pulse: false },
//   HEATING_UP: { color: "var(--accent-orange)", label: "HEATING UP", pulse: false },
//   MATCH_LIVE: { color: "var(--live-green)", label: "MATCH LIVE", pulse: true },
//   BADGE: { color: "var(--gold)", label: "BADGE", pulse: false },
//   RIVAL: { color: "var(--accent-magenta)", label: "RIVAL", pulse: false },
//   FAN_OF_WEEK: { color: "var(--gold)", label: "FAN OF WEEK", pulse: false },
//   WEEKLY: { color: "#9C27B0", label: "BOLD CALL", pulse: false },
// };

// export const LB_TABS = ["All Time", "This Month", "Cricket", "Football"];






import type {
  CurrentUser,
  FeedPost,
  RoomPost,
  Notification,
  LeaderboardEntry,
  BadgeEntry,
  UserPrediction,
  UserHotTake,
} from "../types";

export const avatarUrl = (u: string) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u)}&backgroundColor=0E0E14`;

export const BADGE_LABELS: Record<string, string> = {
  ORACLE: "Oracle 👁",
  BOLD_CALLER: "Bold Caller ⚡",
  CRICKET_HEAD: "Cricket Head 🏏",
  CONTRARIAN: "Contrarian 🔥",
  OG_FAN: "OG Fan 👑",
  SEASONED_FAN: "Seasoned Fan 🏅",
  RISING_FAN: "Rising Fan ⭐",
};

export const BADGE_CONFIG: Record<string, any> = {
  ORACLE: {
    gradient: ["#FFB800", "#FF9800", "#FFB800"],
    icon: "👁",
    iconBg: "#FFB800",
    glow: "0 0 24px rgba(255,184,0,0.65)",
    animated: true,
    name: "Oracle",
  },
  BOLD_CALLER: {
    gradient: ["#E91E8C", "#FF6B35"],
    icon: "⚡",
    iconBg: "#E91E8C",
    glow: "0 0 20px rgba(233,30,140,0.55)",
    animated: false,
    name: "Bold Caller",
  },
  CRICKET_HEAD: {
    gradient: ["#1565C0", "#00BCD4"],
    icon: "🏏",
    iconBg: "#1565C0",
    glow: "none",
    animated: false,
    name: "Cricket Head",
  },
  CONTRARIAN: {
    gradient: ["#7B1FA2", "#E040FB"],
    icon: "🔥",
    iconBg: "#7B1FA2",
    glow: "none",
    dashed: true,
    animated: false,
    name: "Contrarian",
  },
  OG_FAN: {
    gradient: ["#B87333", "#CD7F32", "#8B4513"],
    icon: "👑",
    iconBg: "#B87333",
    glow: "none",
    animated: false,
    name: "OG Fan",
  },
  SEASONED_FAN: {
    gradient: ["#8888A0", "#666680"],
    icon: "🏅",
    iconBg: "#666680",
    glow: "none",
    animated: false,
    name: "Seasoned Fan",
  },
  RISING_FAN: {
    gradient: null,
    icon: "⭐",
    iconBg: "#44445A",
    glow: "none",
    borderOnly: true,
    animated: false,
    name: "Rising Fan",
  },
};

export const BADGE_DETAIL: Record<string, any> = {
  ORACLE: {
    name: "Oracle",
    description: "Top 5% prediction accuracy over 30+ predictions.",
    rarity: "Legendary · Top 3%",
    howTo: "Get 75%+ accuracy over 30 predictions",
    gradient: "linear-gradient(135deg,#FFB800,#FF9800)",
  },
  BOLD_CALLER: {
    name: "Bold Caller",
    description: "You call the unexpected and get it right.",
    rarity: "Rare · Top 12%",
    howTo: "Make 3 correct bold predictions",
    gradient: "linear-gradient(135deg,#E91E8C,#FF6B35)",
  },
  CRICKET_HEAD: {
    name: "Cricket Head",
    description: "All-in on cricket. The game is your religion.",
    rarity: "Common",
    howTo: "Vote on 20 cricket debates",
    gradient: "linear-gradient(135deg,#1565C0,#00BCD4)",
  },
  CONTRARIAN: {
    name: "Contrarian",
    description: "Always on the other side. And often right.",
    rarity: "Uncommon · Top 22%",
    howTo: "Disagree on 10 majority positions",
    gradient: "linear-gradient(135deg,#7B1FA2,#E040FB)",
  },
  OG_FAN: {
    name: "OG Fan",
    description: "Before 2010. True fandom runs deep.",
    rarity: "Epic · Top 8%",
    howTo: "Set tenure to before 2010",
    gradient: "linear-gradient(135deg,#B87333,#CD7F32)",
  },
  SEASONED_FAN: {
    name: "Seasoned Fan",
    description: "You've seen the highs and lows. Still here.",
    rarity: "Uncommon",
    howTo: "Set tenure to 2010-2022",
    gradient: "linear-gradient(135deg,#8888A0,#666680)",
  },
  RISING_FAN: {
    name: "Rising Fan",
    description: "Welcome to ROAR. Your legacy starts now.",
    rarity: "Common",
    howTo: "Complete onboarding",
    gradient: "linear-gradient(135deg,#44445A,#6B6B8A)",
  },
};

export const TENURE_OPTIONS = [
  {
    id: "rising",
    label: "Just getting started",
    sub: "2023+",
    badge: "RISING_FAN",
    chip: "Rising Fan ⭐",
    desc: "New to the game — fresh opinions, fresh takes.",
  },
  {
    id: "seasoned",
    label: "Been here a while",
    sub: "2010–2022",
    badge: "SEASONED_FAN",
    chip: "Seasoned Fan 🏅",
    desc: "You've seen the highs and the lows. Still here.",
  },
  {
    id: "og",
    label: "OG Fan",
    sub: "Before 2010",
    badge: "OG_FAN",
    chip: "OG Fan 👑",
    desc: "Before the IPL, before T20. True fandom runs deep.",
  },
];

export const TEAMS = [
  { id: "India", emoji: "🇮🇳", label: "India", color: "#FF9800", sport: "cricket" },
  { id: "Pak", emoji: "🇵🇰", label: "Pakistan", color: "#4CAF50", sport: "cricket" },
  { id: "Aus", emoji: "🇦🇺", label: "Aus", color: "#FFEB3B", sport: "cricket" },
  { id: "Eng", emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", label: "England", color: "#F44336", sport: "cricket" },
  { id: "MI", emoji: "💙", label: "MI", color: "#1565C0", sport: "cricket" },
  { id: "CSK", emoji: "💛", label: "CSK", color: "#FFCC00", sport: "cricket" },
  { id: "RCB", emoji: "❤️", label: "RCB", color: "#B71C1C", sport: "cricket" },
  { id: "KKR", emoji: "💜", label: "KKR", color: "#6A1B9A", sport: "cricket" },
  { id: "MCFC", emoji: "🔵", label: "MCFC", color: "#1E88E5", sport: "football" },
  { id: "BFC", emoji: "🔴", label: "BFC", color: "#E53935", sport: "football" },
  { id: "MohanB", emoji: "🟢", label: "Mohun B", color: "#43A047", sport: "football" },
  { id: "Kerala", emoji: "🟡", label: "Kerala", color: "#FDD835", sport: "football" },
];

export const FEED_POSTS: FeedPost[] = [
  {
    id: "ht1",
    type: "hot_take",
    sport: "cricket",
    fan: { username: "Arjun_80s", badge: "OG_FAN", team: "India" },
    text: "Virat Kohli in 2025 is better than Sachin Tendulkar ever was. Change my mind.",
    agreePercent: 24,
    fanCount: 8821,
    replies: 234,
    following: false,
    isLive: false,
  },
  // {
  //   id: "ht2",
  //   type: "hot_take",
  //   sport: "football",
  //   fan: { username: "MumbaiCity_Fan", badge: "BOLD_CALLER", team: "MCFC" },
  //   text: "ISL is genuinely world-class football now. The quality this season has been incredible.",
  //   agreePercent: 68,
  //   fanCount: 1230,
  //   replies: 89,
  //   following: true,
  //   isLive: true,
  // },
  // {
  //   id: "pr1",
  //   type: "prediction",
  //   sport: "cricket",
  //   fan: { username: "StatsKing_99", badge: "ORACLE", team: "India" },
  //   text: "Bumrah takes 5+ wickets in today's first innings.",
  //   match: "IND vs AUS · 3rd Test",
  //   samePredictionCount: 1240,
  //   counterCount: 89,
  // },
  // {
  //   id: "pr2",
  //   type: "prediction",
  //   sport: "football",
  //   fan: { username: "GoalMachine_9", badge: "BOLD_CALLER", team: "MCFC" },
  //   text: "Mumbai City FC wins the ISL title this season. Book it.",
  //   match: "ISL 2025",
  //   samePredictionCount: 567,
  //   counterCount: 200,
  // },
  // {
  //   id: "ht3",
  //   type: "hot_take",
  //   sport: "cricket",
  //   fan: { username: "PakFan_K", badge: "CONTRARIAN", team: "Pak" },
  //   text: "India vs Pakistan is the greatest sporting rivalry in the world. Super Bowl, El Clásico — all secondary.",
  //   agreePercent: 82,
  //   fanCount: 15200,
  //   replies: 903,
  //   following: false,
  //   isLive: false,
  // },
  // {
  //   id: "ht4",
  //   type: "hot_take",
  //   sport: "football",
  //   fan: { username: "KeralaFan_12", badge: "CRICKET_HEAD", team: "Kerala" },
  //   text: "Kerala Blasters fans are the best football supporters in Asia. Jawaharlal Nehru Stadium atmosphere is unreal.",
  //   agreePercent: 77,
  //   fanCount: 4100,
  //   replies: 312,
  //   following: false,
  //   isLive: false,
  // },
  // {
  //   id: "ht5",
  //   type: "hot_take",
  //   sport: "cricket",
  //   fan: { username: "DelhiDaredevil", badge: "RISING_FAN", team: "RCB" },
  //   text: "RCB has the most loyal fanbase of any team in any sport in India. The loyalty despite the trophies is unmatched.",
  //   agreePercent: 61,
  //   fanCount: 6300,
  //   replies: 512,
  //   following: false,
  //   isLive: false,
  // },
  // {
  //   id: "ht6",
  //   type: "hot_take",
  //   sport: "football",
  //   fan: { username: "BFCArmy", badge: "SEASONED_FAN", team: "BFC" },
  //   text: "Bengaluru FC era is over. New generation clubs will dominate ISL by 2027.",
  //   agreePercent: 44,
  //   fanCount: 890,
  //   replies: 78,
  //   following: false,
  //   isLive: false,
  // },
];

export const ROOM_POSTS: RoomPost[] = [
  {
    id: "rp1",
    fan: { username: "Rahul_77", badge: "BOLD_CALLER" },
    text: "Kohli is going to smash this bowling attack today. 80+ guaranteed.",
    fireCount: 14,
    nochanceCount: 3,
    timeAgo: "2m",
    type: "prediction",
  },
  // {
  //   id: "rp2",
  //   fan: { username: "SportsMumbai", badge: "CONTRARIAN" },
  //   text: "This pitch looks dry. Spinners will dominate by innings 2. Bumrah is a back-up plan today.",
  //   fireCount: 31,
  //   nochanceCount: 8,
  //   timeAgo: "4m",
  //   type: "hottake",
  // },
  // {
  //   id: "rp3",
  //   fan: { username: "CricketGuru", badge: "ORACLE" },
  //   text: "Bumrah is the GOAT. No debate. Anyone who disagrees hasn't watched real cricket.",
  //   fireCount: 89,
  //   nochanceCount: 12,
  //   timeAgo: "6m",
  //   type: "chat",
  // },
  // {
  //   id: "rp4",
  //   fan: { username: "StatsKing_99", badge: "ORACLE" },
  //   text: "India has never lost a day-night test at home. That streak ends today or it doesn't.",
  //   fireCount: 45,
  //   nochanceCount: 5,
  //   timeAgo: "9m",
  //   type: "hottake",
  // },
  // {
  //   id: "rp5",
  //   fan: { username: "Priya_Cricket", badge: "RISING_FAN" },
  //   text: "My prediction: Jadeja takes 4 wickets. Writing this here so you all remember.",
  //   fireCount: 7,
  //   nochanceCount: 22,
  //   timeAgo: "12m",
  //   type: "prediction",
  // },
];

export const JOIN_FANS = [
  "Rahul_K", "Sanjay_MI", "Priya77", "CricFan_Delhi",
  "TheRealRohan", "MumbaiMagic", "FootyFirst", "KohliArmy",
];

export const NOTIFICATIONS_DATA: Notification[] = [
  // {
  //   id: "n1",
  //   type: "PREDICTION_OK",
  //   title: "You called it! 🎯",
  //   subtitle: "Your prediction 'Kohli 80+' vs Australia was CORRECT. +50 rep points.",
  //   time: "2m",
  //   read: false,
  //   fan: { username: "StatsKing_99", badge: "ORACLE" },
  //   cta: "See your accuracy",
  // },
  // {
  //   id: "n2",
  //   type: "CHALLENGE",
  //   title: "StatsKing_99 challenged your take.",
  //   subtitle: "They said Rohit is more consistent than Kohli in tests. Reply now.",
  //   time: "8m",
  //   read: false,
  //   fan: { username: "StatsKing_99", badge: "ORACLE" },
  //   cta: null,
  // },
  // {
  //   id: "n5",
  //   type: "BADGE",
  //   title: "Badge Unlocked: Bold Caller ⚡",
  //   subtitle: "You called 3 unexpected outcomes correctly. Rare badge earned.",
  //   time: "2h",
  //   read: true,
  //   fan: null,
  //   cta: null,
  // },
  // {
  //   id: "n6",
  //   type: "PREDICTION_FAIL",
  //   title: "Wrong call — but a bold one 💪",
  //   subtitle: "Your prediction 'Jadeja 4 wickets' was incorrect. It stays on profile.",
  //   time: "3h",
  //   read: true,
  //   fan: { username: "Priya_Cricket", badge: "RISING_FAN" },
  //   cta: null,
  // },
  // {
  //   id: "n7",
  //   type: "RIVAL",
  //   title: "Your rival won a debate.",
  //   subtitle: "Arjun_80s was right about Kohli vs AUS. Your score: 2 wins, 5 losses.",
  //   time: "5h",
  //   read: true,
  //   fan: { username: "Arjun_80s", badge: "OG_FAN" },
  //   cta: "Challenge them",
  // },
  // {
  //   id: "n8",
  //   type: "FAN_OF_WEEK",
  //   title: "Fan of the Week: Arjun_80s 🏆",
  //   subtitle: "82% accuracy this week. 47 correct predictions.",
  //   time: "1d",
  //   read: true,
  //   fan: { username: "Arjun_80s", badge: "OG_FAN" },
  //   cta: null,
  // },
  // {
  //   id: "n9",
  //   type: "WEEKLY",
  //   title: "Monday Bold Call is live!",
  //   subtitle: "This week: Will India win the series vs AUS? 3,200 fans voted.",
  //   time: "1d",
  //   read: true,
  //   fan: null,
  //   cta: "Cast your call",
  // },
];

export const LEADERBOARD_DATA: LeaderboardEntry[] = [
  { rank: 1, username: "OracleKing_IND", badge: "ORACLE", accuracy: 84, predictions: 127, team: "India", reputationScore: 9800 },
  { rank: 2, username: "Arjun_80s", badge: "OG_FAN", accuracy: 79, predictions: 98, team: "India", reputationScore: 8200 },
  { rank: 3, username: "StatsKing_99", badge: "ORACLE", accuracy: 77, predictions: 143, team: "India", reputationScore: 7900 },
  { rank: 4, username: "CricFanatic", badge: "CRICKET_HEAD", accuracy: 74, predictions: 61, team: "MI", reputationScore: 6100 },
  { rank: 5, username: "PakFan_K", badge: "CONTRARIAN", accuracy: 71, predictions: 89, team: "Pak", reputationScore: 5400 },
  { rank: 6, username: "MumbaiCity_Fan", badge: "BOLD_CALLER", accuracy: 69, predictions: 54, team: "MCFC", reputationScore: 4300 },
  { rank: 7, username: "KeralaFan_12", badge: "CRICKET_HEAD", accuracy: 67, predictions: 72, team: "Kerala", reputationScore: 3700 },
  { rank: 8, username: "GoalMachine_9", badge: "BOLD_CALLER", accuracy: 65, predictions: 38, team: "MCFC", reputationScore: 3100 },
  { rank: 9, username: "DelhiDaredevil", badge: "RISING_FAN", accuracy: 62, predictions: 29, team: "RCB", reputationScore: 2100 },
  { rank: 10, username: "BFCArmy", badge: "SEASONED_FAN", accuracy: 60, predictions: 45, team: "BFC", reputationScore: 1800 },
  { rank: 23, username: "RoarUser", badge: "RISING_FAN", accuracy: 55, predictions: 12, team: "India", reputationScore: 520 },
];

export const CURRENT_USER = {
  username: "RoarUser",
  handle: "roaruser",
  badge: "RISING_FAN" as string,
  fanSince: "2019",
  yearsFandom: 6,
  accuracy: 55,
  predictionCount: 12,
  hotTakeCount: 8,
  reputationScore: 520,
  teams: ["India", "MI"],
  rank: 23,
};

export const USER_PREDICTIONS: UserPrediction[] = [
  { id: "up1", text: "Kohli scores 80+ against Australia in the 3rd Test.", matchId: "IND vs AUS 3rd Test", status: "CORRECT", createdAt: "2 days ago" },
  { id: "up2", text: "India wins the series 3-1 vs England.", matchId: "IND vs ENG Series", status: "WRONG", createdAt: "1 week ago" },
  { id: "up3", text: "Bumrah takes 5+ wickets in first innings.", matchId: "IND vs AUS 3rd Test", status: "PENDING", createdAt: "Today" },
  { id: "up4", text: "CSK lifts IPL trophy 2025.", matchId: "IPL 2025 Final", status: "CORRECT", createdAt: "2 months ago" },
];

export const USER_HOT_TAKES: UserHotTake[] = [
  { id: "uht1", text: "Jadeja is the most complete cricketer India has ever produced.", agreePercent: 72, controversial: false, top: true },
  { id: "uht2", text: "ISL will overtake IPL in viewership by 2028.", agreePercent: 29, controversial: true, top: false },
  { id: "uht3", text: "RCB will never win the IPL. Scientifically impossible.", agreePercent: 61, controversial: false, top: false },
];

export const BADGES_LIST: BadgeEntry[] = [
  { id: "ORACLE", unlocked: false, progress: 62 },
  { id: "BOLD_CALLER", unlocked: true, progress: 100, earnedDate: "Earned 3 days ago" },
  { id: "CRICKET_HEAD", unlocked: true, progress: 100, earnedDate: "Earned 2 weeks ago" },
  { id: "CONTRARIAN", unlocked: false, progress: 40 },
  { id: "OG_FAN", unlocked: false, progress: 0 },
  { id: "SEASONED_FAN", unlocked: false, progress: 0 },
  { id: "RISING_FAN", unlocked: true, progress: 100, earnedDate: "Earned on signup" },
];

export const RIVAL = {
  fan: { username: "Arjun_80s", badge: "OG_FAN" },
  badge: "OG_FAN",
  disagreements: 7,
  rivalWins: 5,
  yourWins: 2,
  topDisagreement: '"Sachin was better than Kohli in all formats" — still debating this one.',
};

export const HOT_TAKE_PREVIEWS = [
  { id: "lp1", fan: { username: "Arjun_80s", badge: "OG_FAN" }, text: "Sachin vs Kohli debate is over. It was never close." },
  { id: "lp2", fan: { username: "PakFan_K", badge: "CONTRARIAN" }, text: "India vs Pakistan is must-watch. Forget the Champions Trophy." },
  { id: "lp3", fan: { username: "CricGuru", badge: "ORACLE" }, text: "Bumrah is the best bowler alive. Not even debatable." },
];

export const UPCOMING_MATCHES = [
  "IND vs AUS 3rd Test",
  "IND vs ENG ODI Series",
  "ISL: MCFC vs BFC",
  "ISL: Kerala vs Mohun B",
];

export const COMPOSE_OPTIONS = [
  { id: "hot_take", emoji: "🔥", title: "Drop a Hot Take", desc: "Say what others won't" },
  { id: "prediction", emoji: "📊", title: "Make a Prediction", desc: "Put your reputation on the line" },
  { id: "debate", emoji: "⚡", title: "Start a Debate", desc: "Two sides. One winner." },
  // { id: "memory",    emoji: "🕰", title: "Share a Memory",      desc: "Flashback moment" },
  { id: "raw_reactions", emoji: "🎭", title: "Raw Reactions", desc: "Share your raw reaction to a moment" },
  { id: "post", emoji: "✏️", title: "Post", desc: "Share photos, videos or GIFs" },
  { id: "quiz", emoji: "🧠", title: "Flash Quiz", desc: "Test your fans with a quick quiz" },
];

export const RADIAL_OPTS = [
  { id: "post", label: "Post", emoji: "✏️" },
  // { id: "hot_take", label: "Hot Take", emoji: "🔥" },
  { id: "prediction", label: "Prediction", emoji: "📊" },
  { id: "debate", label: "Debate", emoji: "⚡" },
  // { id: "raw_reactions", label: "Raw Reactions", emoji: "🕰" },
  // { id: "quiz", label: "Flash Quiz", emoji: "🧠" },
];

const QUICK_REACT_OPTS = [
  { id: "qr_wicket",   label: "Wicket!",   emoji: "🎯" },
  { id: "qr_six",      label: "Six!!",     emoji: "💪" },
  { id: "qr_four",     label: "Four!",     emoji: "🏏" },
  { id: "qr_boundary", label: "Boundary!", emoji: "💥" },
];

export const FEED_FILTERS = ["For You", "Cricket", "Football", "Live", "Predictions"];

export const NAV_TABS = [
  { id: "home", label: "Home", icon: "🏠" },
  { id: "discuss", label: "Discuss", icon: "💬" },
  { id: "compose", label: "", icon: "+" },
  { id: "profile", label: "You", icon: "👤" },
  { id: "alerts", label: "Alerts", icon: "🔔" },
];

export const NOTIF_FILTERS = ["All", "Predictions", "Challenges", "Badges", "Match"];

export const TYPE_STYLES: Record<string, any> = {
  PREDICTION_OK: { color: "var(--correct-green)", label: "PREDICTION ✓", pulse: false },
  PREDICTION_FAIL: { color: "var(--wrong-red)", label: "PREDICTION ✗", pulse: false },
  CHALLENGE: { color: "var(--accent-magenta)", label: "CHALLENGE", pulse: false },
  HEATING_UP: { color: "var(--accent-orange)", label: "HEATING UP", pulse: false },
  MATCH_LIVE: { color: "var(--live-green)", label: "MATCH LIVE", pulse: true },
  BADGE: { color: "var(--gold)", label: "BADGE", pulse: false },
  RIVAL: { color: "var(--accent-magenta)", label: "RIVAL", pulse: false },
  FAN_OF_WEEK: { color: "var(--gold)", label: "FAN OF WEEK", pulse: false },
  WEEKLY: { color: "#9C27B0", label: "BOLD CALL", pulse: false },
};

export const LB_TABS = ["All Time", "This Month", "Cricket", "Football"];