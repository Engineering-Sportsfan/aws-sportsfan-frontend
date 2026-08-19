// src/components/NewROARComponent/mockRoom/mockRoomData/indEng5thT20i.ts
//
// Transcribed from roar_mockplay_ind_eng_5th_T20i.html. Illustrative
// simulation on top of a real match result — dialogue/reactions are
// invented, no line is an actual quote from any real person.

import type { MockRoomMeta, RawMockEntry } from "../mockRoomTypes";

export const IND_ENG_5TH_T20I_ROOM_ID = "KEbTZRyohcQb8l1zvwoq";

export const IND_ENG_5TH_T20I_META: MockRoomMeta = {
  roomId: IND_ENG_5TH_T20I_ROOM_ID,
  title: "England vs India — 5th T20I",
  eyebrow: "Mock Simulation · Real Match, Fictional Chat",
  subtitle:
    "14 human fans + 2 partisan AI bots (Krishna – IND, Radha – ENG) + Dolly, the neutral platform bot. Dolly runs three structured analysis reads (pre-match / mid-innings / post-match) plus four story-arc drops woven into the innings. Timeline: pre-match team news through the captain's post-match presentation.",
  resultFact:
    "Result was real: England won by 56 runs (257/3 vs 201/8) to complete a 4–0 series sweep and reclaim the ICC No.1 T20I ranking. Dialogue, reactions and the \"captain's speech\" recap below are an invented mock-up on top of that real match; no line is an actual quote from any real person.",
  tickerText:
    "ROAR MATCH ROOM · ENG vs IND · 5th T20I (series decider on pride) · The Rose Bowl, Southampton · 11 July 2026 — mock replay, 18 participants",
  score: "ENG 257/3",
  scoreSubtitle: "IND 201/8 · ENG won by 56 runs",
  roomSports: "cricket",
  campColors: { ind: "#14D8A0", eng: "#3D8BFF", neu: "#F2B705" },
  campLabels: { ind: "IND", eng: "ENG", neu: "" },
  roster: [
    {
      members: [
        "Hari", "Pooja", "Rahul", "Drishti", "Manan", "Sree", "Piyush", "Aastha",
        "Michael", "Venu", "Deba", "Varuna", "Preeti", "Alisha",
        "Krishna·AI", "Radha·AI", "Dolly·AI",
      ],
    },
  ],
};

export const IND_ENG_5TH_T20I_RAW: RawMockEntry[] = [
{d:"PRE-MATCH · T–50 min"},
{name:"Dolly", camp:"neu", bot:true, time:"18:20", special:"analysis", title:"Pre-Match Read", pts:[
  "Series is already gone 3–0 — tonight's about pride, not the trophy, but England can hit No.1 in the ICC T20I rankings with a win.",
  "Toss delayed 45 minutes here at the Rose Bowl — no official reason given yet, room's speculating.",
  "Biggest team news: Sanju Samson comes in, Vaibhav Sooryavanshi is rested. Suryansh Shedge replaces Washington Sundar."
]},
{name:"Dolly", camp:"neu", bot:true, time:"18:21", special:"story", title:"Story: the teenager left out", txt:"Sooryavanshi walked into this India side as a teenager on the back of eye-catching, record-setting hitting at domestic level — the kind of prodigy story that made him a talking point before he'd played a game. Resting him for a dead-rubber, after a tough series, is a defensible team-management call. It's still going to be the least popular decision of the night in this room."},
{name:"Dolly", camp:"neu", bot:true, time:"18:22", txt:"Pick your camp for tonight 👇", poll:{type:"camp", opts:[["IND","ind",49],["ENG","eng",51]]}},
{name:"Piyush", camp:"ind", time:"18:23", txt:"4-0 is on the table tonight if we don't turn up. Genuinely can't remember the last time a tour felt this over before it started.", reax:{"💀":9}},
{name:"Michael", camp:"eng", time:"18:23", txt:"as the resident Englishman in this room — respectfully, thank you for the tour, gents. See you at No.1. 🏴", reax:{"😤":11}},
{name:"Rahul", camp:"ind", time:"18:24", txt:"Michael I will be muting you the second Buttler gets out, fair warning", reax:{"😂":14}},
{name:"Venu", camp:"ind", time:"18:25", txt:"back in Dhoni's day we'd have found a way to win this dead rubber out of pure spite. this generation doesn't have that gear anymore.", reax:{"👴":7}},
{name:"Pooja", camp:"ind", time:"18:26", txt:"resting Sooryavanshi for THIS game of all games feels like the wrong game to make the point. let the kid play with nothing to lose.", reax:{"💯":10}},
{name:"Deba", camp:"ind", time:"18:27", txt:"fantasy-wise this is brutal, my captain pick for tonight just got benched an hour before lock. thanks for nothing, team management.", reax:{"😩":6}},
{name:"Varuna", camp:"ind", time:"18:27", txt:"India's think tank: making bold decisions in the one match where bold decisions don't matter since 2019.", reax:{"😂":13}},
{name:"Preeti", camp:"ind", time:"18:28", txt:"can Tilak Varma just bat at 4 tonight and stay there please, he's been criminally underused all series", reax:{"🙏":8}},
{name:"Alisha", camp:"ind", time:"18:29", txt:"watching this one with samosas and low expectations, exactly how cricket should be enjoyed honestly 😌"},
{name:"Hari", camp:"ind", time:"18:30", txt:"Salt, Buttler and Brook have all been among the runs all series — if India don't take early wickets tonight this total gets away fast."},
{name:"Manan", camp:"neu", time:"18:31", txt:"Rose Bowl's a genuine batting paradise under lights. Whoever's set after 10 overs here usually cashes in hard."},
{name:"Krishna", camp:"ind", bot:true, time:"18:32", txt:"Nothing left to lose tonight — sometimes that's when a team plays its freest cricket. Backing India to at least make this competitive. 🇮🇳"},
{name:"Radha", camp:"eng", bot:true, time:"18:32", txt:"England have been the better side in every single department this series. No reason that changes tonight. 🏴"},
{name:"Sree", camp:"neu", time:"18:33", txt:"pub's already read this one as a formality, nobody's even ordering a second pint before the toss", reax:{"😂":6}},
{name:"Dolly", camp:"neu", bot:true, time:"18:35", txt:"Quiz while we wait on the toss 🧠: what's the biggest margin England have ever beaten India by in a T20I?", poll:{type:"quiz", opts:[["Under 20 runs","gold"],["20–40 runs","gold"],["40+ runs","gold"]]}},
{name:"Aastha", camp:"ind", time:"18:36", txt:"guessing 20-40, going in with cautious optimism tonight 🙂"},
{name:"Dolly", camp:"neu", bot:true, time:"18:38", txt:"Lock your predictions — toss call, match winner, and England's final score if they bat first.", poll:{type:"lock", opts:[["Toss call?","gold",null],["Winner?","gold",null],["ENG score if batting?","gold",null]]}},
{name:"Rahul", camp:"ind", time:"18:39", txt:"locking India to bowl first and keep it under 180. manifesting a fight tonight."},
{name:"Piyush", camp:"ind", time:"18:39", txt:"locking 245+ and a chase that's dead by over 12, because I refuse to be surprised again this series.", reax:{"😭":8}},

{d:"THE TOSS"},
{name:"Dolly", camp:"neu", bot:true, time:"18:47", txt:"TOSS: India have won the toss and elected to BOWL first.", poll:{type:"reaction", opts:[["👍 sensible",39],["😬 risky vs this top order",44],["🤷 doesn't matter now",17]]}},
{name:"Manan", camp:"neu", time:"18:48", txt:"Debatable call given how well England's top three have been going — bowling first here means defending a total against in-form batters under lights, tougher gig."},
{name:"Venu", camp:"ind", time:"18:48", txt:"we batted first last game and got bowled out for a below-par total anyway, so I don't think the toss call was ever really the problem this series", reax:{"👀":6}},
{name:"Michael", camp:"eng", time:"18:49", txt:"doesn't matter what India choose tonight honestly, this batting line-up's been in ominous form all series. 🏴"},

{d:"POWERPLAY · England batting, Overs 1–6"},
{name:"Dolly", camp:"neu", bot:true, time:"18:52", txt:"Salt and Buttler out to open for England."},
{name:"Dolly", camp:"neu", bot:true, time:"18:56", txt:"WICKET — 1.4 ov: Salt c Shedge b Krishna. England 8/1.", poll:{type:"reaction", opts:[["🎉 early breakthrough!",68],["😐 one down, two more in form",32]]}},
{name:"Rahul", camp:"ind", time:"18:56", txt:"SALT GONE FOR 6. PRASIDH KRISHNA STRIKES.", reax:{"🔥":17}},
{name:"Drishti", camp:"ind", time:"18:56", txt:"wait KRISHNA got the wicket — which Krishna, the bowler or the bot. I need this room to be very clear about that tonight 😂", reax:{"😂":22}},
{name:"Krishna", camp:"ind", bot:true, time:"18:57", txt:"Just to clarify, that's Prasidh Krishna with the wicket — I only take credit for the vibes. Great start for India though! 🇮🇳", reax:{"😂":15}},
{name:"Piyush", camp:"ind", time:"18:57", txt:"one wicket in and I'm already bracing for Buttler to make us pay for the next three hours", reax:{"😅":9}},
{name:"Deba", camp:"ind", time:"18:58", txt:"Prasidh's early wicket at least salvages my fantasy team a little, small mercies tonight"},

{d:"MIDDLE OVERS · Buttler and Brook take over"},
{name:"Dolly", camp:"neu", bot:true, time:"19:05", txt:"Buttler and Brook building steadily — England 62/1 after 8 overs, both set now."},
{name:"Hari", camp:"ind", time:"19:06", txt:"this is the exact stage of the innings India needed a second wicket. Let this pair get to 15 overs together and it's going to be a very long night."},
{name:"Dolly", camp:"neu", bot:true, time:"19:11", txt:"Brook to fifty — 19 balls. Fastest of his innings this series.", poll:{type:"reaction", opts:[["😮 ridiculous",61],["🏴 just Brook being Brook",39]]}},
{name:"Radha", camp:"eng", bot:true, time:"19:11", txt:"19-ball fifty from the captain. This is what a side that knows it's better than the opposition looks like. 🏴", reax:{"🏴":18}},
{name:"Pooja", camp:"ind", time:"19:12", txt:"genuine hot take: Brook right now might be the most complete white-ball batter on the planet, not just in this series", poll:{type:"battle", opts:[["Agree, he's a different tier","eng",64],["Too soon, one hot series ≠ all-time","ind",36]]}},
{name:"Venu", camp:"ind", time:"19:13", txt:"in my time a 19-ball fifty against India would've been a scandal, now it's a Tuesday", reax:{"😮‍💨":9}},
{name:"Dolly", camp:"neu", bot:true, time:"19:18", txt:"WICKET-less middle overs so far for India — England 150 up in 15.2 overs, momentum reading:", slider:{left:"IND confident",right:"ENG confident", pct:9}},
{name:"Dolly", camp:"neu", bot:true, time:"19:19", special:"story", title:"Story: the rivalry angle", txt:"England have never beaten India in a bilateral T20I series before this tour — tonight's the one that turns a good series for them into a statement one. If the partnership out there keeps growing, this stops being about tonight's scoreline and starts being about how this series gets remembered."},
{name:"Piyush", camp:"ind", time:"19:20", txt:"love that Dolly's here reminding us of the historical significance while we're getting taken apart in real time, exquisite timing", reax:{"😂":11}},
{name:"Manan", camp:"neu", time:"19:22", txt:"Prince Yadav's over just went for a lot there — 24 off it. When a bowling attack's already stretched, one bad over against set batters becomes three."},
{name:"Varuna", camp:"ind", time:"19:22", txt:"Prince Yadav just donated an entire over's worth of humanitarian aid to the England middle order", reax:{"💀":16}},
{name:"Aastha", camp:"ind", time:"19:23", txt:"why does one bad over matter so much, isn't it still just 6 balls?"},
{name:"Hari", camp:"ind", time:"19:24", txt:"@Aastha against set batters, one loose over doesn't just cost runs — it resets their confidence and the required-rate math shifts the bowling captain's whole plan for the rest of the innings."},

{d:"DEATH OVERS · Buttler to a century, England cash in"},
{name:"Dolly", camp:"neu", bot:true, time:"19:31", txt:"CENTURY — Jos Buttler to three figures. England's stand now past 200.", poll:{type:"reaction", opts:[["👏 outstanding knock",70],["😭 here we go again",30]]}},
{name:"Rahul", camp:"ind", time:"19:31", txt:"A HUNDRED. AGAINST US. AGAIN. I need a minute.", reax:{"😭":19}},
{name:"Radha", camp:"eng", bot:true, time:"19:31", txt:"Buttler's just brought up a magnificent century, and this partnership is now a genuine record stand for England against India. 🏴🎉", reax:{"🏴":24}},
{name:"Dolly", camp:"neu", bot:true, time:"19:32", special:"story", title:"Story: a record-breaking stand", txt:"That Buttler–Brook stand has now gone past the previous best partnership England have ever put on against India in a T20I. Two players who've captained England in this series, both compiling career-defining innings on the same night, in the match that confirms the whitewash."},
{name:"Drishti", camp:"ind", time:"19:33", txt:"our bowling attack rn: 🫠🫠🫠", reax:{"😂":12}},
{name:"Preeti", camp:"ind", time:"19:34", txt:"okay I need this innings to end so we can talk about literally anyone in blue for a change", reax:{"🙏":7}},
{name:"Dolly", camp:"neu", bot:true, time:"19:37", txt:"WICKETS — 18.4 & 18.5 ov: Buttler c Iyer b Dube (131 off 64), then Bethell c Tilak b Dube (0). Two in two balls for Shivam Dube.", poll:{type:"reaction", opts:[["🎉 finally, something!",77],["😐 far too little, far too late",23]]}},
{name:"Krishna", camp:"ind", bot:true, time:"19:37", txt:"Two wickets in two balls for Dube! Small consolation in a tough night, but a genuinely brilliant piece of bowling right there. 🇮🇳", reax:{"👏":9}},
{name:"Michael", camp:"eng", time:"19:38", txt:"131 off 64 with 12 fours and 8 sixes, take the two wickets if it makes you feel better lads 🏴", reax:{"😂":10}},
{name:"Dolly", camp:"neu", bot:true, time:"19:41", txt:"INNINGS CLOSED — England 257/3 (20 ov). Brook unbeaten on 95 off 45.", poll:{type:"reaction", opts:[["😭 dead rubber, alive scoreboard",54],["🏴 statement innings",46]]}},
{name:"Piyush", camp:"ind", time:"19:41", txt:"257. two-five-seven. I said 245+ earlier and I still feel like I undersold it.", reax:{"💀":15}},
{name:"Venu", camp:"ind", time:"19:42", txt:"257 in 20 overs. some totals used to be unthinkable in this format, now it's just a Saturday in Southampton.", reax:{"👴":8}},

{d:"INNINGS BREAK"},
{name:"Dolly", camp:"neu", bot:true, time:"19:48", special:"analysis", title:"Mid-Innings Read", pts:[
  "257/3 is England's highest total of the series and comfortably beyond anything India have chased or defended so far this tour.",
  "The Buttler–Brook stand (233) was the difference — India's bowling attack had no answer once both batters were set.",
  "Realistically, tonight is now about individual pride for India's batters rather than the result — Kishan and Tilak Varma both have a chance to salvage something personal here."
]},
{name:"Dolly", camp:"neu", bot:true, time:"19:49", txt:"Defendable or not?", poll:{type:"debate", opts:[["Technically, if IND bat the innings of their lives","ind",14],["Not remotely defendable","eng",86]]}},
{name:"Sree", camp:"neu", time:"19:50", txt:"14% saying defendable feels like pure sporting optimism at this point, respect to them", reax:{"😂":9}},
{name:"Dolly", camp:"neu", bot:true, time:"19:51", txt:"Lock your win-probability call before over 1 of the chase 👇", poll:{type:"lock", opts:[["IND win","ind",8],["ENG win","eng",92]]}},
{name:"Deba", camp:"ind", time:"19:52", txt:"captaining Buttler AND Brook in fantasy tonight would've been the greatest single-match haul of my life. instead I get Sooryavanshi sitting on a bench.", reax:{"😩":8}},

{d:"THE CHASE · India batting, needing 258"},
{name:"Dolly", camp:"neu", bot:true, time:"19:56", txt:"Abhishek Sharma and Sanju Samson out to open the chase for India."},
{name:"Manan", camp:"neu", time:"20:02", txt:"India need something close to the highest chase in T20I history tonight. Realistically this is now about batting time and finishing with some dignity."},
{name:"Alisha", camp:"ind", time:"20:03", txt:"switching my brain off the required-rate maths and just enjoying whatever boundaries show up tonight 😌"},
{name:"Dolly", camp:"neu", bot:true, time:"20:14", txt:"Fifty for Ishan Kishan — the one genuine bright spot in India's chase so far.", poll:{type:"reaction", opts:[["👏 well played in a lost cause",63],["🎉 finally someone showed up",37]]}},
{name:"Preeti", camp:"ind", time:"20:14", txt:"THAT'S MY GUY. give him the gloves and the top order permanently, he's been ready for this role all series.", reax:{"🔥":13}},
{name:"Rahul", camp:"ind", time:"20:15", txt:"Kishan's fifty means absolutely nothing for the result and I still stood up and clapped alone in my room", reax:{"😂":16}},
{name:"Dolly", camp:"neu", bot:true, time:"20:24", txt:"Fifty for Tilak Varma as well — India's two half-centuries tonight, in a losing cause.", poll:{type:"battle", opts:[["Tilak's the more complete knock","ind",55],["Kishan's mattered more, set the tone","ind",45]]}},
{name:"Preeti", camp:"ind", time:"20:24", txt:"TOLD YOU. bat him at 4 every single game from now on, no more debate needed after tonight", reax:{"🙌":11}},
{name:"Hari", camp:"ind", time:"20:25", txt:"Kishan 56, Tilak 53 — genuinely the only two performances from this whole series I'd want to watch again on highlights."},
{name:"Radha", camp:"eng", bot:true, time:"20:26", txt:"Nice individual knocks, but required rate's been in double figures for a while now. This chase was over as a contest a long time ago. 🏴"},
{name:"Varuna", camp:"ind", time:"20:27", txt:"two fifties, zero suspense, this chase has the exact drama of a scheduled train arriving on time", reax:{"😂":14}},
{name:"Krishna", camp:"ind", bot:true, time:"20:28", txt:"Two half-centuries in a chase this steep is still something to build from. Genuinely — that's two batters who showed they belong at this level. 🇮🇳"},
{name:"Dolly", camp:"neu", bot:true, time:"20:35", txt:"Sam Curran into his spell — very tight figures tonight, exactly what England needed to shut the game down for good."},
{name:"Manan", camp:"neu", time:"20:36", txt:"Curran's bowled beautifully in the back half — full, wide yorkers, taken the pace off exactly when India needed boundary balls."},
{name:"Dolly", camp:"neu", bot:true, time:"20:44", txt:"INDIA ALL OUT — 201/8 off 20. England win by 56 runs and complete the series 4–0.", poll:{type:"reaction", opts:[["😭 rough tour, end of story",61],["🏴 dominant, deserved sweep",39]]}},
{name:"Piyush", camp:"ind", time:"20:44", txt:"4-0. not a single match genuinely in the balance across five games. that's the number that should keep the team management up tonight, not any one individual performance.", reax:{"💯":18}},
{name:"Michael", camp:"eng", time:"20:45", txt:"on top of the world, gents. genuinely a pleasure watching this room with you all this series though, good sport 🏴🤝", reax:{"🤝":14}},
{name:"Rahul", camp:"ind", time:"20:45", txt:"unmuting Michael now that it's over, credit where it's due — that was a proper thrashing", reax:{"😅":10}},

{d:"POST-MATCH"},
{name:"Dolly", camp:"neu", bot:true, time:"20:52", special:"analysis", title:"Post-Match Read", pts:[
  "England complete a 4–0 sweep and reclaim the ICC No.1 T20I ranking — their biggest bilateral T20I margin over India in the process.",
  "Sam Curran (3/36) was the pick of the bowlers, with Rashid and Dawson chipping in — England's all-round depth showed up all series.",
  "For India, Kishan (56) and Tilak Varma (53) are the two performances worth carrying forward; expect a genuine selection reset before the next assignment."
]},
{name:"Dolly", camp:"neu", bot:true, time:"20:53", special:"story", title:"Story: a coaching reckoning", txt:"Results like tonight's don't stay on the field for long — a run like this usually forces a hard conversation back home about team selection, batting depth, and whether this group needs fresh ideas or just time to find its feet. Expect that conversation to dominate the headlines over the next few days more than the scoreline itself."},
{name:"Dolly", camp:"neu", bot:true, time:"20:55", txt:"Player of the Match — the room's call, since it's a genuine toss-up:", poll:{type:"battle", opts:[["Buttler — the century","eng",52],["Brook — unbeaten 95, captain's series","eng",48]]}},
{name:"Deba", camp:"ind", time:"20:56", txt:"whichever one it is, both of them won me nothing in fantasy points because I had neither in my final XI. rough end to a rough series.", reax:{"😩":6}},
{name:"Dolly", camp:"neu", bot:true, time:"20:58", txt:"Rate the India XI tonight 👇", poll:{type:"rate", opts:[["Kishan","ind",8.4],["Tilak Varma","ind",8.1],["Dube (2 wkts)","ind",6.8],["Prasidh Krishna","ind",6.5],["Prince Yadav","ind",2.1],["Bowling unit overall","ind",3.2]]}},
{name:"Drishti", camp:"ind", time:"20:59", txt:"Prince Yadav rated a 2.1 by this room and honestly he'd probably agree with us tonight", reax:{"😂":9}},
{name:"Dolly", camp:"neu", bot:true, time:"21:00", txt:"Best Takes from tonight: Drishti's Krishna-vs-Krishna bit, Varuna's 'scheduled train' line, and Piyush's '4-0, not one match in the balance' close. Fan Army standings: ENG camp 5–0 for the series, IND camp 0–5."},
{name:"Radha", camp:"eng", bot:true, time:"21:00", txt:"5 from 5. Perfect series, No.1 ranking back where it belongs. 🏴", reax:{"🏴":19}},
{name:"Dolly", camp:"neu", bot:true, time:"21:05", txt:"Captains' presentations — Harry Brook credited the depth of his batting and bowling across the tour and said the group is enjoying playing under him; Shreyas Iyer acknowledged a difficult series, said the batting group needs to find more consistency, and backed this group to respond on the next tour."},
{name:"Venu", camp:"ind", time:"21:06", txt:"'find more consistency' is doing some heavy lifting in that sentence after a 4-0. but he's not wrong, and I'll say this for him — he never once looked like he stopped competing.", reax:{"👍":10}},
{name:"Pooja", camp:"ind", time:"21:07", txt:"rough tour all round, but genuinely enjoyed this room more than most of the actual cricket this series. see you all next assignment.", reax:{"🫡":15}},
{name:"Aastha", camp:"ind", time:"21:08", txt:"learned so much cricket vocabulary this series honestly, thank you all for being patient with my questions 🥹", reax:{"🥹":12}},
{name:"Sree", camp:"neu", time:"21:09", txt:"pub's paying its tab and heading home happy tonight. good series everyone, brutal as it was 🍻"}
];