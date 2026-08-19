import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, Share2, Play, Volume2, Sparkles } from 'lucide-react';
import asianGamesHero from '../../../public/asian_games_banner.png';
import rajaramanPhoto from '../../../public/image-21.png';
import anandVasuPhoto from '../../../public/image-23.png';
import gallePhoto from '../../../public/image30.png';
type FlipCard = {
  id: number; type: 'analyst' | 'fan' | 'official';
  sport: 'cricket' | 'football' | 'athletics';
  sportEmoji: string; sportLabel: string;
  day: string; time: string; timeMs: number;
  author: string; handle?: string; source: string;
  authorPhoto?: any;
  content: string; emoji?: string; mediaType?: 'audio' | 'video';
  image?: any;
  likes: number; isKey: boolean; tags?: string[];
  scoreChip?: ScoreChip;
  fomoMsg: string; fomoCount: number;
  ctaType: 'room' | 'watchalong' | 'drop';
  flipResponse: string;
};
/* ─── FlipLine shared data ─────────────────────────────────────────── */
type ScoreChip = {
  score: string;
  status: string;
  statusType: 'live' | 'final' | 'break' | 'upcoming' | 'delay' | 'info';
};

const FL_CARDS: FlipCard[] = [
  { id: 1, type: 'analyst', sport: 'cricket', sportEmoji: '🏏', sportLabel: 'IND vs SL',
    day: 'Day 1 · Morning', timeMs: 642, time: '10:42 AM',
    author: 'Anand Vasu', handle: '@anandvasu', source: 'Watch Along', authorPhoto: anandVasuPhoto,
    content: "Rohit Sharma looks in excellent touch at the top. His intent to attack the spinners early is exactly what India need on this Galle surface. Watch that sweep shot — he's been working on it.",
    emoji: '🎙️', likes: 1243, isKey: true, tags: ['#RohitSharma', '#IndvsSL'],
    scoreChip: { score: 'IND 48/0 (11 ov)', status: 'Live', statusType: 'live' },
    fomoMsg: "Anand's analysis is getting wild reactions — 312 fans debating in Watch Along right now",
    fomoCount: 312, ctaType: 'watchalong',
    flipResponse: "Rohit's sweep has been his go-to at Galle historically — 68% of his runs against spin here come through that shot. India are targeting the left-arm spinner gap at mid-wicket. Teams batting first here score 15–20% more on Day 1 than Day 3 📊" },

  { id: 2, type: 'fan', sport: 'cricket', sportEmoji: '🏏', sportLabel: 'IND vs SL',
    day: 'Day 1 · Morning', timeMs: 655, time: '10:55 AM',
    author: 'CricketCrazy_Rohan', handle: '@rohancric22', source: 'ROAR Room',
    content: '🔥🔥 BUMRAH IS UNREAL!!!! That inswinger to dismiss Karunaratne was CINEMA. Someone get this man an Oscar 😤',
    emoji: '😤', likes: 892, isKey: true, tags: [],
    scoreChip: { score: 'SL 22/1 (6.3 ov)', status: 'Live — Wicket!', statusType: 'live' },
    fomoMsg: "892 fans are celebrating Bumrah's wicket right now — the room is going insane",
    fomoCount: 892, ctaType: 'room',
    flipResponse: "Bumrah's inswinger to left-handers has a 78% success rate in Asia over the last 3 years. He pitched it on a perfect 7.5m length from over the wicket — Karunaratne had no answer. This is why he's ranked #1 in Test bowling 🎯" },

  { id: 3, type: 'official', sport: 'cricket', sportEmoji: '🏏', sportLabel: 'IND vs SL',
    day: 'Day 1 · Morning', timeMs: 675, time: '11:15 AM',
    author: 'SF360', source: 'Official Drop',
    content: "Bumrah's 5th wicket — a classic inswinger that shattered the stumps. Watch the full clip.",
    emoji: '🎬', mediaType: 'video', likes: 5671, isKey: true, tags: [],
    scoreChip: { score: 'SL 76/5 (24 ov)', status: 'Live', statusType: 'live' },
    fomoMsg: "5.6K fans watched this drop in 10 mins — you're missing out on the conversation",
    fomoCount: 5671, ctaType: 'drop',
    flipResponse: "Bumrah's 5-wicket hauls at Galle: this is his 2nd. Historically when India bowl out the opposition under 180 here, they win 89% of the time. Sri Lanka are in serious trouble heading to lunch 📊" },

  { id: 13, type: 'analyst', sport: 'athletics', sportEmoji: '🏃', sportLabel: 'Delhi State Athletics',
    day: 'Day 1 · Morning', timeMs: 676, time: '11:15 AM',
    author: 'Rajaraman G', handle: '@g_rajaraman', source: 'via X', authorPhoto: rajaramanPhoto,
    content: "The Jawaharlal Nehru Stadium was bereft of spectators, media & influences who throng international sports events. But it was heartening to watch athletes combat the elements – rain on Friday & humidity on Sunday – to deliver their best in the Delhi State Athletics Championships",
    emoji: '🏟️', likes: 1876, isKey: false, tags: ['#DelhiAthletics', '#Athletics'],
    scoreChip: { score: 'Delhi State Athletics', status: 'Completed', statusType: 'final' },
    fomoMsg: "Rajaraman's ground report from JN Stadium is resonating with 245 fans in Athletics room",
    fomoCount: 245, ctaType: 'watchalong',
    flipResponse: "Delhi State Athletics is the breeding ground for national-level talent. Competing in rain and humidity builds mental toughness. Several athletes here will represent India in the Asian Athletics Championships next month 🏆" },

  { id: 8, type: 'analyst', sport: 'athletics', sportEmoji: '🏃', sportLabel: 'Asian Athletics',
    day: 'Day 1 · Morning', timeMs: 677, time: '11:16 AM',
    author: 'Rajaraman G', handle: '@g_rajaraman', source: 'Watch Along', authorPhoto: rajaramanPhoto,
    content: "Neeraj Chopra is warming up and he looks incredibly focused. His approach run has a different energy today — that step count adjustment he made in training is visible. This could be a massive throw.",
    emoji: '🏟️', likes: 677, isKey: false, tags: ['#NeerajChopra', '#AsianAthletics'],
    scoreChip: { score: 'Javelin Final · Attempt 1', status: 'Upcoming', statusType: 'upcoming' },
    fomoMsg: "Rajaraman's preview is pulling 200+ fans into the Athletics Watch Along — join the room",
    fomoCount: 200, ctaType: 'watchalong',
    flipResponse: "Neeraj's personal best is 89.94m. At this venue, athletes have thrown 1.8% better on average due to altitude. His 2026 form: 3 competitions, 3 wins, avg 87.6m. If he hits 88m+ today, he's on World Championship medal pace 🏆" },

  { id: 4, type: 'analyst', sport: 'cricket', sportEmoji: '🏏', sportLabel: 'IND vs SL',
    day: 'Day 1 · Morning', timeMs: 690, time: '11:30 AM',
    author: 'Anand Vasu', handle: '@anandvasu', source: 'via X', authorPhoto: anandVasuPhoto,
    content: 'Sri Lanka 87/4 at lunch. India bowling has been clinical but the pitch has eased. Second session crucial — Chandimal and Dickwella could change this match.',
    emoji: '📊', likes: 2109, isKey: true, tags: ['#GalleTest'],
    scoreChip: { score: 'SL 87/4 (30 ov)', status: 'Lunch Break', statusType: 'break' },
    fomoMsg: "Anand's lunch take sparked a huge debate — 400+ fans arguing about it in Watch Along",
    fomoCount: 400, ctaType: 'watchalong',
    flipResponse: 'Chandimal has a 58 average in the second session at Galle — he thrives when the pitch eases. India need 2 more wickets before tea or Sri Lanka could come back. The key battle: Bumrah vs Chandimal in the first over post-lunch 🎯' },

  { id: 14, type: 'official', sport: 'cricket', sportEmoji: '🏏', sportLabel: 'IND vs SL',
    day: 'Day 1 · Afternoon', timeMs: 800, time: '1:20 PM',
    author: 'SF360', source: 'Official Drop',
    content: "India's fielding masterclass — Jadeja's direct hit run-out off just 1 stump visible. Sri Lanka 115/5. Watch the full throw →",
    emoji: '🎬', mediaType: 'video', likes: 4102, isKey: true, tags: [],
    scoreChip: { score: 'SL 115/5 (38 ov)', status: 'Live', statusType: 'live' },
    fomoMsg: "4.1K fans are replaying this run-out on loop — join the Watch Along for Jadeja breakdown",
    fomoCount: 4102, ctaType: 'watchalong',
    flipResponse: "Jadeja's direct hit: estimated throw distance of 38m, hit the single stump at 85kph. He only has 1 stump to aim at and still nails it. His run-out rate this year: 7 direct hits from 14 attempts (50%) — elite standard 🎯" },

  { id: 5, type: 'fan', sport: 'cricket', sportEmoji: '🏏', sportLabel: 'IND vs SL',
    day: 'Day 1 · Afternoon', timeMs: 850, time: '2:10 PM',
    author: 'SriLankaPride', handle: '@sl_superfan', source: 'ROAR Room',
    content: 'Chandimal bhai keeping the ship steady 💪 40 off 88 balls is exactly what they need right now.',
    emoji: '🫡', likes: 344, isKey: false, tags: [],
    scoreChip: { score: 'SL 142/5 (44 ov)', status: 'Live', statusType: 'live' },
    fomoMsg: 'SL fans and India fans are going at it hard in the ROAR Room — 267 fans live',
    fomoCount: 267, ctaType: 'room',
    flipResponse: "Chandimal's 40 off 88 is actually above his usual SR at Galle (39.2). He's converting at 45.4 SR right now — if he stays till tea, Sri Lanka could push 220+. India need to break this partnership in the next 8 overs 📊" },

  { id: 9, type: 'fan', sport: 'football', sportEmoji: '⚽', sportLabel: 'IND vs JPN',
    day: 'Day 1 · Afternoon', timeMs: 851, time: '2:10 PM',
    author: 'GoalMachine_Dev', handle: '@dev_football', source: 'ROAR Room',
    content: 'SUNIL CHHETRI IS BACK AND HE JUST SCORED 😭😭😭 India 1-0 Japan!! The crowd is ERUPTING!! ⚽🇮🇳🔥',
    emoji: '⚽', likes: 1893, isKey: true, tags: ['#IndiaFootball', '#Chhetri'],
    scoreChip: { score: 'IND 1 – 0 JPN', status: 'Live · 67\'', statusType: 'live' },
    fomoMsg: "1.8K fans are going absolutely wild in Football ROAR Room — massive goal!!",
    fomoCount: 1893, ctaType: 'room',
    flipResponse: "Chhetri's 91st international goal! At 41, scoring in a competitive fixture is remarkable. India's win probability just jumped from 28% to 61%. Japan haven't conceded to India since 2019 — this is historic ⚽🏆" },

//   { id: 12, type: 'analyst', sport: 'cricket', sportEmoji: '🏏', sportLabel: 'IND vs SL',
//     day: 'Day 1 · Afternoon', timeMs: 940, time: '3:40 PM',
//     author: 'Anand Vasu', handle: '@anandvasu', source: 'via X', authorPhoto: anandVasuPhoto,
//     content: "A wall of dark cloud comes off the sea and with it the covers are on. The end of the Sri Lanka innings may well be the end of the day's play. #INDvSL",
//     emoji: '🌧️', likes: 3421, isKey: true, tags: ['#INDvSL'],
//     image: galleRainPhoto,
//     scoreChip: { score: 'SL 180/9 (48.3 ov)', status: 'Rain Delay ⛈', statusType: 'delay' },
//     fomoMsg: "Rain delay! 600+ fans discussing DLS & what happens next in Watch Along right now",
//     fomoCount: 600, ctaType: 'watchalong',
//     flipResponse: "DLS method may come into play if play is abandoned. Sri Lanka at 180/9 with 2 balls left — they're essentially all out. India's revised target if DLS applies will depend on overs remaining. Weather radar shows 2-3 hours of rain — game-changing situation 🌧️" },

  { id: 6, type: 'official', sport: 'cricket', sportEmoji: '🏏', sportLabel: 'IND vs SL',
    day: 'Day 1 · Afternoon', timeMs: 945, time: '3:45 PM',
    author: 'SF360', source: 'Official Drop',
    content: 'Shami breaks through with a sharp off-cutter. Sri Lanka 142/6. India firmly in control. Listen to Shami explain the dismissal himself.',
    emoji: '🎙️', mediaType: 'audio', likes: 3211, isKey: false, tags: [],
    scoreChip: { score: 'SL 142/6 (44.2 ov)', status: 'Live', statusType: 'live' },
    fomoMsg: '3.2K fans reacted to this drop in 4 minutes — join the conversation before it dies',
    fomoCount: 3211, ctaType: 'drop',
    flipResponse: "Shami's off-cutter: released at 134kph, pitched on a good length, cut back sharply. Dickwella went for a drive — classic dismissal. At 142/6, Sri Lanka are likely under 200. India batting target: expect 190–205 💯" },

  { id: 10, type: 'analyst', sport: 'cricket', sportEmoji: '🏏', sportLabel: 'IND vs SL',
    day: 'Day 1 · Afternoon', timeMs: 946, time: '3:45 PM',
    author: 'Anand Vasu', handle: '@anandvasu', source: 'Watch Along', authorPhoto: anandVasuPhoto,
    content: "Shami's off-cutter is simply magnificent. The way he disguises it from his outswinger grip — Dickwella never picked it. India's pace attack now has 6 wickets between them. Complete bowling performance.",
    emoji: '📊', likes: 1876, isKey: true, tags: ['#Shami', '#IndvsSL'],
    scoreChip: { score: 'SL 142/6 (44.2 ov)', status: 'Live', statusType: 'live' },
    fomoMsg: "Anand's breakdown of Shami's grip is causing a riot — 500 fans live in Watch Along",
    fomoCount: 500, ctaType: 'watchalong',
    flipResponse: "Shami's off-cutter is the same one he used to dismantle NZ in 2021. He only bowls it after prepping the batsman with 3 outswingers — pure chess. His off-cutter success rate this year: 4 wickets from 9 attempts (44%) 🎯" },

  { id: 11, type: 'official', sport: 'athletics', sportEmoji: '🏃', sportLabel: 'Asian Athletics',
    day: 'Day 1 · Afternoon', timeMs: 947, time: '3:45 PM',
    author: 'SF360', source: 'Official Drop',
    content: "NEERAJ CHOPRA THROWS 88.72M! 🏆 NEW ASIAN GAMES RECORD! India's golden boy does it again. Watch the throw →",
    emoji: '🏆', mediaType: 'video', likes: 8934, isKey: true, tags: ['#NeerajChopra'],
    image: asianGamesHero,
    scoreChip: { score: 'Neeraj · 88.72m 🥇', status: 'Asian Games Record!', statusType: 'final' },
    fomoMsg: "8.9K fans reacted to Neeraj's record throw — biggest Athletics moment of the year",
    fomoCount: 8934, ctaType: 'drop',
    flipResponse: "88.72m is Neeraj's 3rd-best throw ever! This betters the previous Asian Games record by 1.24m. His next target: 90m at Worlds. Release angle was 33.2° — near-perfect for javelin at this altitude. Absolute specimen 🏆" },

  { id: 15, type: 'fan', sport: 'football', sportEmoji: '⚽', sportLabel: 'IND vs JPN',
    day: 'Day 1 · Evening', timeMs: 1020, time: '5:00 PM',
    author: 'BlueTigers_Fan', handle: '@bluetigers_in', source: 'ROAR Room',
    content: "FULL TIME. INDIA 1-0 JAPAN. I can't believe what I just witnessed 😭🇮🇳 Chhetri you absolute LEGEND. History made tonight!",
    emoji: '🏆', likes: 4291, isKey: true, tags: ['#BlueTigers', '#INDvJPN'],
    scoreChip: { score: 'IND 1 – 0 JPN', status: 'Full Time', statusType: 'final' },
    fomoMsg: "4.2K fans celebrating in Football ROAR — biggest India football moment in years",
    fomoCount: 4291, ctaType: 'room',
    flipResponse: "India's first competitive win over Japan since 2011. Chhetri's goal was India's 91st international goal. Full-time stats: India 38% possession, 6 shots, 3 on target. A classic counter-attack performance by Igor Stimac's men 🏆" },

  { id: 16, type: 'official', sport: 'cricket', sportEmoji: '🏏', sportLabel: 'IND vs SL',
    day: 'Day 1 · Evening', timeMs: 1080, time: '6:00 PM',
    author: 'SF360', source: 'Official Drop',
    content: 'SRI LANKA ALL OUT FOR 183. India need 184 to win the Galle Test. Play resumes tomorrow 9:30 AM. Key stat: India have never lost chasing under 200 at Galle. SF360 full scorecard →',
    emoji: '📋', likes: 6543, isKey: true, tags: ['#GalleTest', '#INDvSL'],
    scoreChip: { score: 'SL 183 All Out', status: 'Innings Complete', statusType: 'final' },
    fomoMsg: "6.5K fans digesting the scorecard — Anand Vasu's post-day analysis is LIVE in Watch Along",
    fomoCount: 6543, ctaType: 'drop',
    flipResponse: "India's chase of 184 at Galle — historical record: 4 wins from 4 chases under 200. Rohit and Gill open tomorrow. Expected DLS target if rain returns: 165 from 40 overs. The pitch will have more variable bounce on Day 2 📊" },

  {
    id: 17,
    type: 'analyst',
    sport: 'cricket',
    sportEmoji: '🏏',
    sportLabel: 'IND vs SL',
    day: 'Day 1 · Evening',
    timeMs: 1110,
    time: '6:30 PM',
    author: 'Anand Vasu',
    handle: '@anandvasu',
    source: 'Watch Along',
    authorPhoto: anandVasuPhoto,
    content: "Right. And now this one is hitting the stumps apparently. Gill sweeps and misses. He's bending as he plays the shot. And is hit in the stomach/midriff. But ball tracking shows it's low enough to not go over the stumps. Even Prabhat Jayasuriya has a wry smile after watching the...",
    emoji: '🎙️',
    likes: 205,
    isKey: true,
    tags: ['#INDvSL', '#Gill', '#Jayasuriya'],
    scoreChip: { score: 'IND vs SL', status: 'Live', statusType: 'live' },
    fomoMsg: "Anand's live DRS analysis is drawing big reactions — fans debating in Watch Along right now",
    fomoCount: 205,
    ctaType: 'watchalong',
    flipResponse: "Ball-tracking confirms height was low enough despite hitting him high on the midriff during the sweep shot bending forward. Jayasuriya continues to create problems."
  },
  {
    id: 18,
    type: 'analyst',
    sport: 'cricket',
    sportEmoji: '🏏',
    sportLabel: 'IND vs SL',
    day: 'Day 1 · Evening',
    timeMs: 1140,
    time: '7:00 PM',
    author: 'Anand Vasu',
    handle: '@anandvasu',
    source: 'Watch Along',
    authorPhoto: anandVasuPhoto,
    content: "No review can reprieve Rahul this time. Comes down the track and looks to clear mid on. Doesn't get to the pitch. Prabhat Jayasuriya has the last laugh and the wicket. #INDvSL",
    emoji: '☝️',
    likes: 197,
    isKey: true,
    tags: ['#INDvSL', '#KLRahul', '#Wicket'],
    scoreChip: { score: 'IND vs SL', status: 'Live', statusType: 'live' },
    fomoMsg: "Fans are reacting to KL Rahul's dismissal — Join the breakdown in Watch Along",
    fomoCount: 197,
    ctaType: 'watchalong',
    flipResponse: "KL Rahul tried stepping down to break the pressure against Jayasuriya, but failed to reach the pitch of the ball, leading to a simple catch at mid-on."
  },
  {
    id: 19,
    type: 'analyst',
    sport: 'cricket',
    sportEmoji: '🏏',
    sportLabel: 'IND vs SL',
    day: 'Day 1 · Evening',
    timeMs: 1150,
    time: '7:10 PM',
    author: 'Anand Vasu',
    handle: '@anandvasu',
    source: 'Watch Along',
    authorPhoto: anandVasuPhoto,
    content: "That looked like it was out for all the money in the world. KL Rahul looked set to walk off when Devdutt Padikkal stopped him and told him to review. In the dressing-room Shubman Gill had pulled his gloves on and was ready to walk out. And technology says the ball would have gone...",
    emoji: '📺',
    likes: 1200,
    isKey: true,
    tags: ['#INDvSL', '#DRS', '#KLRahul'],
    scoreChip: { score: 'IND vs SL', status: 'Live', statusType: 'live' },
    fomoMsg: "Over 1.2K fans reacting to that dramatic DRS call saved by Padikkal",
    fomoCount: 1200,
    ctaType: 'watchalong',
    flipResponse: "Padikkal's intervention saved Rahul after he was given out on-field. Replays showed missing, prompting Gill to unpack his gloves back in the pavilion."
  },
  {
    id: 20,
    type: 'analyst',
    sport: 'cricket',
    sportEmoji: '🏏',
    sportLabel: 'IND vs SL',
    day: 'Day 1 · Evening',
    timeMs: 1169,
    time: '7:29 PM',
    author: 'Anand Vasu',
    handle: '@anandvasu',
    source: 'Watch Along',
    authorPhoto: anandVasuPhoto,
    content: "Another day where the weather has defied prediction and the cricket has followed suit. Bright sunshine and Yashasvi Jaiswal gives it away early, nicking off. He plays only one format -- not out of choice -- and Jaiswal would have wanted time out in the middle. The runs would have...",
    emoji: '☀️',
    likes: 540,
    isKey: true,
    tags: ['#INDvSL', '#Jaiswal', '#EarlyWicket'],
    scoreChip: { score: 'IND vs SL', status: 'Live', statusType: 'live' },
    fomoMsg: "540 fans discussing Jaiswal's early dismissal in Watch Along",
    fomoCount: 540,
    ctaType: 'watchalong',
    flipResponse: "Clear weather conditions didn't prevent an early setback as Jaiswal edged behind early in the session, missing out on valuable time at the crease."
  },
  {
    id: 21,
    type: 'analyst',
    sport: 'cricket',
    sportEmoji: '🏏',
    sportLabel: 'Galle Travel',
    day: 'Day 1 · Evening',
    timeMs: 1180,
    time: '7:40 PM',
    author: 'Anand Vasu',
    handle: '@anandvasu',
    source: 'Watch Along',
    authorPhoto: anandVasuPhoto,
    content: "There is no shortage of places to visit in Galle. Allow me to add The South Ceylon Bakery. It's owned by Athula Samarasekara, a hard-hitting batsman and handy medium pacer who played 4 Tests and 39 ODIs for Sri Lanka from 1988-1994. Ironic that he should run a bakery given this...",
    image: gallePhoto,
    emoji: '🥐',
    likes: 161,
    isKey: false,
    tags: ['#Galle', '#CricketHistory', '#SriLanka'],
    scoreChip: { score: 'Galle Spotlight', status: 'Pinned', statusType: 'info' },
    fomoMsg: "161 fans loving Anand's recommendation on Galle heritage spot",
    fomoCount: 161,
    ctaType: 'watchalong',
    flipResponse: "Athula Samarasekara played for Sri Lanka between 1988-1994, known for aggressive hitting. He now runs The South Ceylon Bakery in Galle."
  }


];

function FlipLineSection({ selectedSport, onViewFull }: { selectedSport: string; onViewFull: () => void }) {
  const [density, setDensity] = useState<'full' | 'key'>('full');
  const [likedCards, setLikedCards] = useState<Set<number>>(new Set());
  const [askOpen, setAskOpen] = useState<number | null>(null);

  let displayCards = density === 'key' ? FL_CARDS.filter(c => c.isKey) : FL_CARDS;
  if (selectedSport && selectedSport !== 'mixed') {
    displayCards = displayCards.filter(c => c.sport === selectedSport);
  }

  return (
    <div className="mb-5">
      {/* Header */}
      <div className="flex items-center justify-between px-4 mb-3">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 16, fontWeight: 900, color: 'rgb(245,245,250)', letterSpacing: -0.4 }}>FlipLine</span>
          <span style={{ fontSize: 8, fontWeight: 900, background: 'linear-gradient(90deg,rgb(255,45,85),rgb(255,122,0))', color: 'white', padding: '2px 8px', borderRadius: 99, letterSpacing: 0.5 }}>LIVE</span>
        </div>
        <div className="flex items-center rounded-full p-[2px]" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}>
          {(['full', 'key'] as const).map(d => (
            <button key={d} onClick={() => setDensity(d)} className="px-[10px] py-[3px] rounded-full transition-all cursor-pointer"
              style={{ fontSize: 9.5, fontWeight: 800, background: density === d ? 'rgba(168,85,247,0.85)' : 'transparent', color: density === d ? 'white' : 'rgba(255,255,255,0.38)', border: 'none' }}>
              {d === 'full' ? 'Full' : 'Key Moments'}
            </button>
          ))}
        </div>
      </div>
      {/* Multi-sport legend */}
      <div className="flex items-center gap-4 px-4 mb-4">
        {([{e:'🏏',l:'Cricket',c:'rgb(34,197,94)'},{e:'⚽',l:'Football',c:'rgb(96,165,250)'},{e:'🏃',l:'Athletics',c:'rgb(251,191,36)'}] as const).map(({e,l,c}) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: c, boxShadow: `0 0 5px ${c}99` }} />
            <span style={{ fontSize: 9.5, fontWeight: 700, color: 'rgba(255,255,255,0.38)' }}>{e} {l}</span>
          </div>
        ))}
      </div>
      {/* Timeline — show latest 4 moments on home */}
      <FlipTimeline cards={displayCards} previewLimit={4} likedCards={likedCards} setLikedCards={setLikedCards} askOpen={askOpen} setAskOpen={setAskOpen} />
      {/* View Full button */}
      <div style={{ paddingLeft: 14, paddingRight: 14, marginTop: 6 }}>
        <button onClick={onViewFull}
          className="w-full py-[11px] rounded-[14px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <span style={{ fontSize: 11.5, fontWeight: 800, color: 'rgba(255,255,255,0.55)' }}>View Full FlipLine</span>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
    </div>
  );
}

/* ─── FlipLine full-page screen ─────────────────────────────────────── */
function FlipLineFullScreen({ onBack, selectedSport = 'mixed' }: { onBack: () => void; selectedSport?: string }) {
  const [density, setDensity] = useState<'full' | 'key'>('full');
  const [likedCards, setLikedCards] = useState<Set<number>>(new Set());
  const [askOpen, setAskOpen] = useState<number | null>(null);

  let displayCards = density === 'key' ? FL_CARDS.filter(c => c.isKey) : FL_CARDS;
  if (selectedSport && selectedSport !== 'mixed') {
    displayCards = displayCards.filter(c => c.sport === selectedSport);
  }

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: 'rgb(7,11,20)' }}>
      {/* Header */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px 11px', background: 'rgba(7,11,20,0.98)', borderBottom: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)' }}>
        <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0, cursor: 'pointer' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18, fontWeight: 900, color: 'white', letterSpacing: -0.5 }}>FlipLine</span>
            <span style={{ fontSize: 8, fontWeight: 900, background: 'linear-gradient(90deg,rgb(255,45,85),rgb(255,122,0))', color: 'white', padding: '2px 8px', borderRadius: 99, letterSpacing: 0.5 }}>LIVE</span>
          </div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🏏 Cricket</span><span>⚽ Football</span><span>🏃 Athletics</span>
          </div>
        </div>
        <div style={{ display: 'flex', borderRadius: 99, padding: 2, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}>
          {(['full', 'key'] as const).map(d => (
            <button key={d} onClick={() => setDensity(d)}
              style={{ padding: '3px 11px', borderRadius: 99, fontSize: 9.5, fontWeight: 800, background: density === d ? 'rgba(168,85,247,0.85)' : 'transparent', color: density === d ? 'white' : 'rgba(255,255,255,0.38)', border: 'none', cursor: 'pointer' }}>
              {d === 'full' ? 'Full' : 'Key'}
            </button>
          ))}
        </div>
      </div>

      {/* Legend strip */}
      <div style={{ flexShrink: 0, display: 'flex', gap: 14, padding: '8px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', alignItems: 'center' }}>
        {([{c:'rgb(168,85,247)',l:'Analyst'},{c:'rgb(233,30,140)',l:'Fan ROAR'},{c:'rgb(255,107,53)',l:'SF360 Drop'}] as const).map(({c,l}) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: c, boxShadow: `0 0 6px ${c}aa` }} />
            <span style={{ fontSize: 8.5, fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>{l}</span>
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.22)', fontWeight: 600 }}>Newest first</span>
      </div>

      {/* Scrollable timeline */}
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: 16, paddingBottom: 32 }}>
        <FlipTimeline cards={displayCards} likedCards={likedCards} setLikedCards={setLikedCards} askOpen={askOpen} setAskOpen={setAskOpen} />
        {/* Start-of-coverage marker */}
        <div style={{ paddingLeft: 14, paddingTop: 8, display: 'flex', alignItems: 'center' }}>
          <div style={{ width: 44, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: '2px solid rgba(255,255,255,0.2)' }} />
          </div>
          <span style={{ paddingLeft: 10, fontSize: 10, color: 'rgba(255,255,255,0.28)', fontWeight: 700 }}>Start of coverage · Day 1 · 10:30 AM</span>
        </div>
      </div>
    </div>
  );
}

/* ─── FlipTimeline detailed timeline view ───────────────────────────── */
interface FlipTimelineProps {
  cards: FlipCard[];
  previewLimit?: number;
  likedCards: Set<number>;
  setLikedCards: React.Dispatch<React.SetStateAction<Set<number>>>;
  askOpen: number | null;
  setAskOpen: (id: number | null) => void;
}

const DolphinIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="text-cyan-400 shrink-0 mr-1">
    <path d="M21.9 8.2c-.4-.8-1.1-1.4-1.9-1.8-1.1-.5-2.3-.6-3.5-.5-1.2.1-2.4.5-3.5 1.1-1.6.9-2.9 2.2-3.8 3.8-.5.9-.9 1.9-1.1 3-.1.5-.1 1 0 1.5.1.5.3 1 .6 1.4.3.4.8.7 1.3.8.5.1 1 0 1.5-.1.9-.3 1.7-.8 2.4-1.4.8-.7 1.4-1.5 1.9-2.4.9-1.6 1.3-3.4 1.3-5.2 0-.2 0-.4-.1-.6l1.2-1.2c.4-.4.9-.7 1.5-.8.6-.1 1.2 0 1.7.3.5.3 1 .8 1.2 1.4.2.6.2 1.2 0 1.8-.2.6-.6 1.1-1.1 1.5z" />
  </svg>
);

export function FlipTimeline({
  cards,
  previewLimit,
  likedCards,
  setLikedCards,
  askOpen,
  setAskOpen,
}: FlipTimelineProps) {
  const router = useRouter();

  const handleLike = (cardId: number) => {
    setLikedCards(prev => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  };

  const handleShare = (card: FlipCard) => {
    if (typeof window !== 'undefined' && navigator.share) {
      navigator.share({
        title: `FlipLine from ${card.author}`,
        text: card.content,
        url: window.location.href,
      }).catch(err => console.log(err));
    } else if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(`"${card.content}" - ${card.author} on Sportsfan360`);
      alert('Link copied to clipboard!');
    }
  };

  const handleCtaClick = (ctaType: 'room' | 'watchalong' | 'drop') => {
    if (ctaType === 'room') {
      router.push('/MainModules/ROAR');
    } else if (ctaType === 'watchalong') {
      router.push('/MainModules/WatchAlong');
    } else if (ctaType === 'drop') {
      router.push('/MainModules/FlipCards');
    }
  };

  // Sort chronologically by timeMs descending so newest is at the top
  const displayList = [...cards].sort((a, b) => b.timeMs - a.timeMs);
  const finalCards = previewLimit ? displayList.slice(0, previewLimit) : displayList;

  const typeColorMap = {
    analyst: 'rgb(168, 85, 247)',
    fan: 'rgb(233, 30, 140)',
    official: 'rgb(255, 107, 53)',
  };

  const typeLabelMap = {
    analyst: 'Analyst',
    fan: 'Fan ROAR',
    official: 'SF360 Drop',
  };

  return (
    <div className="flex flex-col w-full relative">
      {finalCards.map((card, index) => {
        const isLiked = likedCards.has(card.id);
        const isExpanded = askOpen === card.id;
        const themeColor = typeColorMap[card.type] || 'rgba(255, 255, 255, 0.4)';
        const themeLabel = typeLabelMap[card.type] || card.type;

        return (
          <div key={card.id} className="flex w-full relative mb-8">
            {/* Left timeline axis */}
            <div className="w-[70px] shrink-0 flex flex-col items-center pt-1 relative">
              {(() => {
                const parts = card.time.split(' ');
                if (parts.length >= 2) {
                  return (
                    <>
                      <span className="text-[15px] font-black text-white leading-none">{parts[0]}</span>
                      <span className="text-[9px] font-bold text-white/40 leading-none mt-1 uppercase tracking-wider">{parts.slice(1).join(' ')}</span>
                    </>
                  );
                }
                return (
                  <span className="text-[12px] font-extrabold text-white leading-tight text-center break-words max-w-[60px]">
                    {card.time}
                  </span>
                );
              })()}
              
              {/* Dot */}
              <div 
                className="w-3 h-3 rounded-full bg-white border border-white/20 relative z-10 mt-3"
                style={{
                  boxShadow: '0 0 8px rgba(255, 255, 255, 0.8)'
                }}
              />

              {/* Vertical Line */}
              {index < finalCards.length - 1 && (
                <div 
                  className="absolute w-[1px] bg-white/10"
                  style={{
                    top: '52px', // starts below the dot
                    bottom: '-32px', // extends to the next card's top
                    left: '50%',
                    transform: 'translateX(-50%)'
                  }}
                />
              )}
            </div>

            {/* Right card container */}
            <div className="flex-1 pr-4 pb-2 min-w-0">
              <div className="transition-all duration-300 relative flex flex-col gap-3.5 w-full">
                
                {/* Row 1: Score & Sport Tag */}
                <div className="flex items-center justify-between w-full min-h-[24px]">
                  {card.scoreChip ? (
                    <div className="flex items-center gap-2">
                      <div 
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold text-[#10b981] bg-[#10b981]/12 border border-[#10b981]/20"
                      >
                        {card.scoreChip.score}
                      </div>
                      <span 
                        className="text-[11px] font-extrabold text-[#10b981]"
                      >
                        {card.scoreChip.status}
                      </span>
                    </div>
                  ) : (
                    <div />
                  )}
                  
                  <div 
                    className="px-2.5 py-1 rounded-full text-[10.5px] font-bold flex items-center gap-1.5"
                    style={{
                      background: 'rgba(15, 23, 42, 0.7)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: 'rgba(255, 255, 255, 0.7)'
                    }}
                  >
                    <span>{card.sportEmoji}</span>
                    <span>{card.sportLabel}</span>
                  </div>
                </div>

                {/* Row 2: Author info */}
                <div className="flex items-center gap-2.5 w-full">
                  {card.authorPhoto ? (
                    <img 
                      src={typeof card.authorPhoto === 'object' ? card.authorPhoto.src : card.authorPhoto} 
                      alt={card.author} 
                      className="w-9 h-9 rounded-full object-cover border border-white/10 shrink-0" 
                    />
                  ) : (
                    <div 
                      className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-[14px] shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${themeColor}, #0f172a)`
                      }}
                    >
                      {card.author[0]}
                    </div>
                  )}
                  
                  <div className="min-w-0 flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-[13.5px] text-white leading-tight truncate">{card.author}</span>
                      {card.handle && (
                        <span className="text-[11px] text-white/40 truncate">{card.handle}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span 
                        className="text-[8.5px] font-black tracking-wider px-1.5 py-0.5 rounded uppercase"
                        style={{ background: `${themeColor}1f`, color: themeColor }}
                      >
                        {themeLabel}
                      </span>
                      <span className="text-[9.5px] text-white/30 font-medium">via {card.source}</span>
                    </div>
                  </div>
                </div>

                {/* Row 3: Card Content */}
                <p className="text-[14px] font-medium text-white/90 leading-relaxed break-words whitespace-pre-line">
                  {card.content}
                </p>

                {/* Inline Image or Video/Audio media */}
                {card.image && (
                  <div className="relative rounded-xl overflow-hidden mt-1 max-h-[220px]">
                    <img 
                      src={typeof card.image === 'object' ? card.image.src : card.image} 
                      alt="Moment media" 
                      className="w-full h-full object-fill" 
                    />
                    
                    {card.mediaType === 'video' && (
                      <div className="absolute inset-0 bg-black/35 flex items-center justify-center cursor-pointer">
                        <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white transition-transform hover:scale-105">
                          <Play size={18} fill="currentColor" className="ml-0.5" />
                        </div>
                      </div>
                    )}
                    
                    {card.mediaType === 'audio' && (
                      <div className="absolute bottom-2 left-2 right-2 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 p-2 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white cursor-pointer">
                          <Volume2 size={13} />
                        </div>
                        <div className="flex-1 flex items-center gap-[2px] h-3 px-1">
                          {[30, 80, 45, 90, 60, 35, 75, 40, 65, 80, 50, 70, 45, 85].map((h, i) => (
                            <div 
                              key={i} 
                              className="flex-1 bg-white/40 rounded-full" 
                              style={{ height: `${h}%` }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Row 4: Tags (if present) */}
                {card.tags && card.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-0.5">
                    {card.tags.map(t => (
                      <span key={t} className="text-[11px] font-bold text-pink-500 hover:underline cursor-pointer">
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Row 5: FOMO Banner */}
                {card.fomoMsg && (
                  <div 
                    className="flex items-center justify-between gap-3 rounded-2xl p-3 bg-[#0d0a14] border border-pink-500/15"
                    style={{
                      borderColor: `${themeColor}2a`,
                      background: `linear-gradient(135deg, rgba(7, 11, 20, 0.98), rgba(15, 10, 25, 0.6))`
                    }}
                  >
                    <p className="text-[12px] font-semibold text-white/85 leading-snug">
                      🔥 {card.fomoMsg}
                    </p>
                    <button
                      onClick={() => handleCtaClick(card.ctaType)}
                      className="shrink-0 px-4 py-2 rounded-xl text-[12px] font-extrabold text-white transition-all active:scale-95 cursor-pointer"
                      style={{
                        background: card.ctaType === 'room'
                          ? 'linear-gradient(135deg, #E91E8C, #FF6B35)'
                          : card.ctaType === 'watchalong'
                          ? 'linear-gradient(135deg, #7c3aed, #E91E8C)'
                          : 'linear-gradient(135deg, #06b6d4, #3b82f6)'
                      }}
                    >
                      {card.ctaType === 'room' && 'Join Room →'}
                      {card.ctaType === 'watchalong' && 'Watch Along →'}
                      {card.ctaType === 'drop' && 'Claim Drop →'}
                    </button>
                  </div>
                )}

                {/* Row 6: Action buttons (Like, Share, Flip) */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => handleLike(card.id)}
                      className="flex items-center gap-2 text-white/40 hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      <Heart 
                        size={16} 
                        fill={isLiked ? 'rgb(244, 63, 94)' : 'none'} 
                        className={`transition-all duration-200 ${isLiked ? 'text-rose-500 scale-110' : ''}`} 
                      />
                      <span className="text-[12.5px] font-extrabold leading-none">{card.likes + (isLiked ? 1 : 0)}</span>
                    </button>
                    
                    <button 
                      onClick={() => handleShare(card)}
                      className="flex items-center gap-2 text-white/40 hover:text-white transition-colors cursor-pointer"
                    >
                      <Share2 size={15} />
                      <span className="text-[12.5px] font-extrabold leading-none">Share</span>
                    </button>
                  </div>

                  <button 
                    onClick={() => setAskOpen(isExpanded ? null : card.id)}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[12px] font-bold border transition-all duration-300 cursor-pointer"
                    style={{
                      background: isExpanded 
                        ? `${themeColor}22` 
                        : 'rgba(255, 255, 255, 0.03)',
                      borderColor: isExpanded ? themeColor : 'rgba(255, 255, 255, 0.1)',
                      color: isExpanded ? themeColor : '#fff',
                      boxShadow: isExpanded ? `0 0 10px ${themeColor}33` : 'none'
                    }}
                  >
                    <DolphinIcon />
                    <span>{isExpanded ? 'Flipped' : 'Ask Flip'}</span>
                  </button>
                </div>

                {/* Expanded AI response */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 pt-3 border-t border-white/[0.08] flex flex-col gap-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center text-[10px]">🤖</div>
                          <span className="text-[11px] font-black text-violet-300 uppercase tracking-widest">Flip AI Insight</span>
                        </div>
                        
                        <p className="text-[13px] text-white/90 leading-relaxed italic bg-violet-950/20 border border-violet-900/30 rounded-xl p-3">
                          {card.flipResponse}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function FlipLine({ selectedSport = 'mixed' }: { selectedSport?: string }) {
  const [showFull, setShowFull] = useState(false);

  if (showFull) {
    return <FlipLineFullScreen onBack={() => setShowFull(false)} selectedSport={selectedSport} />;
  }

  return (
    <FlipLineSection
      selectedSport={selectedSport}
      onViewFull={() => setShowFull(true)}
    />
  );
}