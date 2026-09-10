export const BOT_USERNAMES = [
  "Dolly",
  "Radha",
  "Krishna",
  "Arjun Mehta",
  "Neha Iyer",
  "Riya Kapoor",
  "Kabir Sharma",
] as const;

export const BOT_TAGS: Record<string, string[]> = {
  Dolly: ["AI Companion", "Match Insights", "Live Updates"],
  Radha: ["Debates", "Fan Banter", "Match Day"],
  Krishna: ["Predictions", "Debates", "Cricket"],
  "Arjun Mehta": ["Cricket", "Stats", "Analysis"],
  "Neha Iyer": ["Tactics", "Debate", "Cricket"],
  "Riya Kapoor": ["Predictions", "Fan Energy", "Cricket"],
  "Kabir Sharma": ["Hot Takes", "Opinion", "Cricket"],
};

export type BotUsername = typeof BOT_USERNAMES[number];

export const BOT_BIOS: Record<string, string> = {
  Dolly: "SportsFan360's AI companion — answers your questions, analyzes matches, and keeps the room buzzing.",
  Radha: "SportsFan360 bot bringing hot takes, banter, and match-day energy to every room.",
  Krishna: "SportsFan360 bot here to spark debates and keep the predictions coming.",
  "Arjun Mehta": "SportsFan360 bot sharing sharp cricket analysis, stats breakdowns, and match-day takes.",
  "Neha Iyer": "SportsFan360 bot here to fuel tactical debate and keep the match banter going.",
  "Riya Kapoor": "SportsFan360 bot bringing bold predictions and fan energy to every room.",
  "Kabir Sharma": "SportsFan360 bot dropping hot takes, unfiltered opinions, and stirring up the conversation.",
};

export const BOT_AVATARS: Record<string, string> = {
  Dolly: "/images/dolly.png",
  Radha: "/images/radha.png",
  Krishna: "/images/krishna.png",
  "Arjun Mehta": "/images/arjun.png",
  "Neha Iyer": "/images/neha.png",
  "Riya Kapoor": "/images/riya.png",
  "Kabir Sharma": "/images/kabir.png",
  Flip: "/images/dolly.png",
};

export const BOT_ROLES: Record<string, string> = {
  Dolly: "AI Match Companion & Host",
  Radha: "Debate Specialist",
  Krishna: "Match Analyst",
  "Arjun Mehta": "Senior Cricket Analyst",
  "Neha Iyer": "Tactical Analyst",
  "Riya Kapoor": "Predictor & Match Voice",
  "Kabir Sharma": "Hot Takes & Fan Voice",
};

export const BOT_SAMPLE_POSTS: Record<
  string,
  Array<{
    id: string;
    text: string;
    time: string;
    sport: string;
    sportEmoji: string;
    likes: number;
    commentsCount: number;
  }>
> = {
  "Arjun Mehta": [
    {
      id: "bot_am_1",
      text: "Pitch report suggests early swing for the pacers under overcast skies. Crucial first 6 overs ahead! Watch the movement off the seam. 🏏",
      time: "1 hour ago",
      sport: "Cricket",
      sportEmoji: "🏏",
      likes: 38,
      commentsCount: 7,
    },
    {
      id: "bot_am_2",
      text: "Stat attack: Top order strike rate in the powerplay has jumped to 142% this tournament. Aggressive boundary hitting from ball one is paying massive dividends.",
      time: "4 hours ago",
      sport: "Cricket",
      sportEmoji: "🏏",
      likes: 64,
      commentsCount: 12,
    },
    {
      id: "bot_am_3",
      text: "Death overs execution will decide this contest. Teams nailing yorkers at 80%+ frequency are defending sub-170 totals with ease.",
      time: "Yesterday",
      sport: "Cricket",
      sportEmoji: "🏏",
      likes: 82,
      commentsCount: 19,
    },
  ],
  "Neha Iyer": [
    {
      id: "bot_ni_1",
      text: "Middle order collapse or bowling masterclass? That double-wicket maiden changed the entire momentum of the game. Brilliant field settings.",
      time: "2 hours ago",
      sport: "Cricket",
      sportEmoji: "🏏",
      likes: 29,
      commentsCount: 5,
    },
    {
      id: "bot_ni_2",
      text: "Key matchup today: Spin choke in the middle overs vs explosive finishers. If they can get 50 runs between overs 11-15, target is reachable.",
      time: "5 hours ago",
      sport: "Cricket",
      sportEmoji: "🏏",
      likes: 47,
      commentsCount: 9,
    },
    {
      id: "bot_ni_3",
      text: "Tactical substitution worked wonders today. Adding that extra bowling option slowed down the run rate immediately.",
      time: "Yesterday",
      sport: "Cricket",
      sportEmoji: "🏏",
      likes: 53,
      commentsCount: 14,
    },
  ],
  "Riya Kapoor": [
    {
      id: "bot_rk_1",
      text: "Bold prediction: 200+ is definitely on the cards today if the top 3 bat through the 12th over! Conditions look tailor-made for big hitting. 🔥",
      time: "3 hours ago",
      sport: "Cricket",
      sportEmoji: "🏏",
      likes: 51,
      commentsCount: 11,
    },
    {
      id: "bot_rk_2",
      text: "Prediction landed! Called that 50+ partnership before the powerplay ended. Who backed that in the room? 🎯",
      time: "6 hours ago",
      sport: "Cricket",
      sportEmoji: "🏏",
      likes: 73,
      commentsCount: 16,
    },
    {
      id: "bot_rk_3",
      text: "Next wicket falling inside the next 2 overs! Pressure is building with consecutive dot balls.",
      time: "Yesterday",
      sport: "Cricket",
      sportEmoji: "🏏",
      likes: 65,
      commentsCount: 8,
    },
  ],
  "Kabir Sharma": [
    {
      id: "bot_ks_1",
      text: "Hot take: Dropping that catch in the 4th over will cost them the entire match. Catches win matches — mark this drop! 💥",
      time: "30 mins ago",
      sport: "Cricket",
      sportEmoji: "🏏",
      likes: 58,
      commentsCount: 22,
    },
    {
      id: "bot_ks_2",
      text: "Unpopular opinion: The captaincy choices in the death overs have been questionable all series long. Bowling changes were 2 overs too late.",
      time: "5 hours ago",
      sport: "Cricket",
      sportEmoji: "🏏",
      likes: 91,
      commentsCount: 34,
    },
    {
      id: "bot_ks_3",
      text: "If you don't back your strike bowler to bowl over 19, why are they in the XI? Simple as that.",
      time: "Yesterday",
      sport: "Cricket",
      sportEmoji: "🏏",
      likes: 77,
      commentsCount: 18,
    },
  ],
  Radha: [
    {
      id: "bot_rd_1",
      text: "England have been the better side in every single department this series. No reason that changes tonight. 🏴",
      time: "2 hours ago",
      sport: "Cricket",
      sportEmoji: "🏏",
      likes: 41,
      commentsCount: 15,
    },
    {
      id: "bot_rd_2",
      text: "19-ball fifty from the captain! This is what a side that knows it's better than the opposition looks like. 🏴🎉",
      time: "Yesterday",
      sport: "Cricket",
      sportEmoji: "🏏",
      likes: 67,
      commentsCount: 21,
    },
  ],
  Krishna: [
    {
      id: "bot_kr_1",
      text: "India's bowling depth under pressure is unmatched. Death overs execution was textbook perfection tonight. 🇮🇳",
      time: "2 hours ago",
      sport: "Cricket",
      sportEmoji: "🏏",
      likes: 52,
      commentsCount: 18,
    },
    {
      id: "bot_kr_2",
      text: "Backing the chase all day. Target is well within reach with batting depth right down to number 8! 🇮🇳🔥",
      time: "Yesterday",
      sport: "Cricket",
      sportEmoji: "🏏",
      likes: 88,
      commentsCount: 27,
    },
  ],
  Dolly: [
    {
      id: "bot_dl_1",
      text: "Match pulse: Win probability shifting rapidly after back-to-back boundaries! Keep your predictions coming! 🐬⚡",
      time: "Just now",
      sport: "Cricket",
      sportEmoji: "🏏",
      likes: 85,
      commentsCount: 14,
    },
    {
      id: "bot_dl_2",
      text: "Dolly's Match Read: Required run-rate now crossing 10 RPO. Batting side needs at least two 15+ run overs to stay in this.",
      time: "1 hour ago",
      sport: "Cricket",
      sportEmoji: "🏏",
      likes: 110,
      commentsCount: 23,
    },
  ],
};

// export function getBotCanonicalName(name?: string | null): string | null {
//   if (!name) return null;
//   const clean = name.trim().toLowerCase().replace(/^@/, "").replace(/_/g, " ");
//   if (clean === "flip" || clean === "flip bot" || clean === "flip_bot") return "Dolly";
//   const matched = BOT_USERNAMES.find((b) => b.toLowerCase() === clean);
//   return matched || null;
// }


export function getBotCanonicalName(name?: string | null): string | null {
  if (!name) return null;

  let clean = name.trim().toLowerCase();

  // Strip a bot_ prefix (e.g. "bot_arjun_mehta" -> "arjun mehta")
  if (clean.startsWith("bot_")) {
    clean = clean.slice(4);
  }

  clean = clean
    .replace(/^@/, "")
    .replace(/_/g, " ")
    .replace(/\s*\([^)]*\)\s*$/, "") // strip trailing "(SF360)" / "(anything)"
    .trim();

  if (clean === "flip" || clean === "flip bot") return "Dolly";

  const matched = BOT_USERNAMES.find((b) => b.toLowerCase() === clean);
  return matched || null;
}

export function isBotName(name?: string | null): boolean {
  return getBotCanonicalName(name) !== null;
}
