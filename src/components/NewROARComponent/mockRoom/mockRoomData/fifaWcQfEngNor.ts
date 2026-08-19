// src/components/NewROARComponent/mockRoom/mockRoomData/fifaWcQfEngNor.ts
//
// Transcribed from roar_mockplay_FIFA_wc_qf_eng_nor.html. Illustrative
// simulation on top of a real match result — dialogue/reactions are
// invented, no line is an actual quote from any real person.

import type { MockRoomMeta, RawMockEntry } from "../mockRoomTypes";

export const FIFA_WC_QF_ENG_NOR_ROOM_ID = "mKhQoiIJ5NXjSsQ4GDCV";

export const FIFA_WC_QF_ENG_NOR_META: MockRoomMeta = {
  roomId: FIFA_WC_QF_ENG_NOR_ROOM_ID,
  title: "England vs Norway — World Cup Quarter-Final",
  eyebrow: "Mock Simulation · Real Match, Fictional Chat",
  subtitle:
    "18 Master's students across three universities + 2 partisan AI bots (Krishna – England, Radha – Norway) + Dolly, the neutral platform bot running three structured analysis reads and story-arc drops through the match. Timeline: pre-match team news through the captain and coach's post-match remarks.",
  resultFact:
    "Note: the match was actually played 11 July 2026. Result was real: England won 2–1 after extra time (Schjelderup 1–1 Bellingham at half-time, Bellingham's extra-time winner) to reach the semi-final, where they'll face Argentina. Dialogue, reactions and the post-match remarks below are an invented mock-up on top of that real match; no line is an actual quote from any real person.",
  tickerText:
    "ROAR MATCH ROOM · England vs Norway · FIFA World Cup 2026 Quarter-Final · Miami · 11 July 2026 — mock replay, 21 participants",
  score: "ENG 2-1 NOR",
  scoreSubtitle: "After extra time · Bellingham x2, Schjelderup",
  roomSports: "football",
  campColors: { eng: "#3D8BFF", nor: "#F2385A", neu: "#F2B705" },
  campLabels: { eng: "ENG", nor: "NOR", neu: "" },
  roster: [
    { label: "Loughborough University", members: ["Oliver", "Freya", "Jamal", "Chloe", "Ryan", "Priya"] },
    { label: "Nova SBE", members: ["Mateus", "Beatriz", "Henrik", "Inês", "Tomás", "Clara"] },
    { label: "Indian Institute of Sports Management", members: ["Aryan", "Meher", "Nikhil", "Simran", "Kabir", "Ananya"] },
    { label: "Bots", members: ["Krishna·AI", "Radha·AI", "Dolly·AI"] },
  ],
};

export const FIFA_WC_QF_ENG_NOR_RAW: RawMockEntry[] = [
{d:"PRE-MATCH · T–40 min"},
{name:"Dolly", camp:"neu", bot:true, time:"21:20", special:"analysis", title:"Pre-Match Read", pts:[
  "Norway are back at a World Cup for the first time since 1998 — a 28-year wait ended, with Erling Haaland playing his first-ever major tournament at 25.",
  "England are unbeaten through qualifying and didn't concede a single goal doing it — first European side ever to manage that. Tuchel's side have also survived two knockout scares already, vs DR Congo and a 3-2 thriller away at Mexico.",
  "Subplot worth watching all match: Kane vs Haaland for the tournament's Golden Boot race — both refused to be drawn into direct comparisons pre-match, but this is the shootout everyone's been waiting for."
]},
{name:"Dolly", camp:"neu", bot:true, time:"21:21", special:"spicy", title:"Spicy: the squad snub", txt:"Tuchel left out Phil Foden, Cole Palmer, Trent Alexander-Arnold and Harry Maguire from his World Cup squad back in May — four of England's most recognisable names, gone, for a 'form over reputation' philosophy. If England go out tonight, that decision gets relitigated in every paper tomorrow. If they win, it's genius. No in-between with squad calls like that."},
{name:"Dolly", camp:"neu", bot:true, time:"21:22", txt:"Pick your camp for tonight 👇", poll:{type:"camp", opts:[["ENG","eng",58],["NOR","nor",42]]}},
{name:"Oliver", camp:"eng", time:"21:23", txt:"Loughborough massive checking in, this England squad feels different, no fear in this group at all", reax:{"🔥":8}},
{name:"Henrik", camp:"nor", time:"21:23", txt:"Norwegian at Nova SBE and absolutely buzzing that I get to watch my country at a World Cup for the first time in my life. Whatever happens tonight, this is already a win.", reax:{"🇳🇴":14}},
{name:"Ryan", camp:"eng", time:"21:24", txt:"Henrik mate genuinely happy for you lot being here, right up until kickoff, then it's back to business", reax:{"😂":9}},
{name:"Mateus", camp:"neu", time:"21:25", txt:"as a neutral, or as neutral as a Portuguese guy can be watching England — 'it's coming home' talk this early is always a good sign it won't", reax:{"😏":11}},
{name:"Kabir", camp:"nor", time:"21:26", txt:"IISM boy fully on the Haaland bandwagon tonight, don't care that I've never watched a Norway match in my life before this tournament", reax:{"😂":10}},
{name:"Jamal", camp:"eng", time:"21:27", txt:"tactically this is fascinating — Norway's block has been so compact all tournament, England need Bellingham finding pockets between the lines early or this stays stuck at 0-0 a long time."},
{name:"Beatriz", camp:"neu", time:"21:28", txt:"from a business-of-sport lens, whoever wins tonight basically doubles their broadcast reach overnight going into a semi-final slot. huge night commercially either way."},
{name:"Priya", camp:"eng", time:"21:29", txt:"can we talk about the heat in Miami tonight though, both sets of players are going to be absolutely gassed by hour two"},
{name:"Ananya", camp:"neu", time:"21:30", txt:"the World Cup economic-impact numbers for Miami this month are wild btw, IISM did a whole case study on host-city ROI last term"},
{name:"Aryan", camp:"neu", time:"21:31", txt:"pure neutral tonight, just here for the football and Haaland's socks", reax:{"😂":7}},
{name:"Tomás", camp:"neu", time:"21:32", txt:"calling it now, some decision goes England's way tonight that wouldn't at a different stadium. it always does.", reax:{"👀":6}},
{name:"Krishna", camp:"eng", bot:true, time:"21:33", txt:"England haven't conceded once in this entire qualifying campaign — that defensive foundation is exactly what wins knockout football. Backing the Three Lions. 🏴"},
{name:"Radha", camp:"nor", bot:true, time:"21:33", txt:"Haaland has scored in almost every round this tournament. One moment from him and this whole game changes. Backing Norway. 🇳🇴"},
{name:"Chloe", camp:"eng", time:"21:34", txt:"just here for the vibes and the watch party tbh, someone explain the offside rule to me again before kickoff please 😅"},
{name:"Nikhil", camp:"neu", time:"21:35", txt:"my World Cup fantasy team has Bellingham AND Haaland captained across different rounds, tonight decides who I regret picking"},
{name:"Dolly", camp:"neu", bot:true, time:"21:37", special:"story", title:"Story: the manager who came home", txt:"Norway's coach Ståle Solbakken was in Norway's squad the last time they played a World Cup, back in 1998. He's spent almost two decades since coaching across Europe — Copenhagen, Wolves, Köln — before taking the national job in 2020 specifically to get this generation back to the tournament he once played in himself. Whatever the result tonight, he's already closed that loop."},
{name:"Simran", camp:"neu", time:"21:38", txt:"okay that Solbakken story got me a little emotional not gonna lie", reax:{"🥹":9}},
{name:"Dolly", camp:"neu", bot:true, time:"21:40", txt:"Lock your predictions — first goal scorer, final score, and does it need extra time?", poll:{type:"lock", opts:[["First scorer?","gold",null],["Final score?","gold",null],["Goes to ET?","gold",null]]}},
{name:"Meher", camp:"neu", time:"21:41", txt:"locking a tight 1-0 England, this Norway back line has been really disciplined all tournament though so I could see this going goalless late"},
{name:"Clara", camp:"neu", time:"21:41", txt:"xG data says this should be a low-scoring game on paper — both sides average under 1.3 expected goals per 90 in the knockouts so far"},

{d:"FIRST HALF"},
{name:"Dolly", camp:"neu", bot:true, time:"21:45", txt:"Kickoff at Hard Rock Stadium, Miami. Hot and muggy conditions out there tonight."},
{name:"Dolly", camp:"neu", bot:true, time:"22:04", txt:"GOAL — Norway lead! Andreas Schjelderup finishes off a bouncing ball after a scramble in the box.", poll:{type:"reaction", opts:[["🇳🇴 SCENES",71],["😬 wake-up call for England",29]]}},
{name:"Henrik", camp:"nor", time:"22:04", txt:"SCHJELDERUP. SCHJELDERUP. I am never going to forget where I was for this goal.", reax:{"🇳🇴":22}},
{name:"Kabir", camp:"nor", time:"22:04", txt:"NORWAY LEADING ENGLAND AT A WORLD CUP QUARTER FINAL. someone pinch me.", reax:{"🔥":16}},
{name:"Radha", camp:"nor", bot:true, time:"22:04", txt:"Norway ahead against England, on this stage, in their first World Cup back in 28 years. Whatever happens from here, that's already history. 🇳🇴", reax:{"🇳🇴":13}},
{name:"Oliver", camp:"eng", time:"22:05", txt:"okay everyone stay calm, plenty of game left, deep breaths", reax:{"😬":8}},
{name:"Ryan", camp:"eng", time:"22:05", txt:"'stay calm' he says, we're 60 years into staying calm about this exact feeling", reax:{"😂":15}},
{name:"Jamal", camp:"eng", time:"22:06", txt:"defensively that's a mess more than a Norway masterclass, but credit where due, they've made it count."},
{name:"Krishna", camp:"eng", bot:true, time:"22:06", txt:"Slow start, but England have been here before this tournament and found a way through. Plenty of time to respond. 🏴"},
{name:"Dolly", camp:"neu", bot:true, time:"22:11", special:"story", title:"Story: Haaland's long wait", txt:"Erling Haaland has 55 international goals in 49 caps for Norway and didn't get a single major tournament to show it off until tonight, at 25 years old — most of Europe's elite strikers were at a World Cup or a Euros years earlier. Tonight's the first time the rest of the world gets to see what Norway have known for years, on the stage that actually counts."},
{name:"Freya", camp:"eng", time:"22:12", txt:"from a brand perspective Haaland finally getting World Cup minutes is enormous for the sport regardless of tonight's result, his global commercial value just goes up either way"},
{name:"Dolly", camp:"neu", bot:true, time:"22:26", txt:"GOAL — England level! Jude Bellingham finds the net, 1-1.", poll:{type:"reaction", opts:[["🏴 BACK IN IT",76],["🇳🇴 knew it wouldn't last",24]]}},
{name:"Ryan", camp:"eng", time:"22:26", txt:"BELLINGHAM. OF COURSE IT'S BELLINGHAM. THAT KID DOES NOT KNOW HOW TO NOT SCORE IN A BIG GAME.", reax:{"🔥":24}},
{name:"Oliver", camp:"eng", time:"22:26", txt:"take it back, i said stay calm, i did not stay calm, i am not calm", reax:{"😂":19}},
{name:"Mateus", camp:"neu", time:"22:27", txt:"there it is. knew it was coming the moment Norway went ahead, this is exactly the script England always find a way to write"},
{name:"Dolly", camp:"neu", bot:true, time:"22:28", special:"story", title:"Story: the kid who became the main character", txt:"Bellingham left England as a teenager for Dortmund before most fans had even seen him play a first-team minute, then walked into Real Madrid and became one of the most important players in the world before turning 22. This is now the pattern with him and England at major tournaments — big moment, ball at his feet, goal. Tonight's just the latest chapter."},
{name:"Priya", camp:"eng", time:"22:29", txt:"the way he's basically already the main character of every England knockout game we've had this whole tournament", reax:{"👏":10}},
{name:"Dolly", camp:"neu", bot:true, time:"22:44", txt:"HALF-TIME: Norway 1-1 England."},

{d:"HALF-TIME"},
{name:"Dolly", camp:"neu", bot:true, time:"22:47", special:"analysis", title:"Half-Time Read", pts:[
  "Schjelderup's goal came from exactly the kind of scrambled, second-ball situation England's defence has been vulnerable to all tournament — worth watching if Norway go back to that well.",
  "Bellingham's equaliser was his sixth goal of the tournament — he's now been directly involved in an England goal in every knockout match so far.",
  "Both benches have full changes available — Tuchel's bench is arguably the deeper one on paper, which could matter a lot if this goes past 90 minutes."
]},
{name:"Clara", camp:"neu", time:"22:48", txt:"shot map at the break: even xG for the half, this really could go either way in the second"},
{name:"Ines", camp:"neu", time:"22:49", txt:"my flatmate just said 'this is better than most Champions League finals I've watched' and honestly hard to disagree"},
{name:"Nikhil", camp:"neu", time:"22:50", txt:"fantasy-wise Bellingham captained just made my week, thank you sir"},

{d:"SECOND HALF"},
{name:"Dolly", camp:"neu", bot:true, time:"22:53", txt:"Second half underway. Both sides unchanged at the break."},
{name:"Dolly", camp:"neu", bot:true, time:"23:08", special:"spicy", title:"Spicy: disallowed!", txt:"Norway thought they'd retaken the lead — Torbjørn Heggem bundled in from a corner — but VAR chalks it off after review shows Haaland shoved an England player to the ground just before the ball came in. Big call, and Norway's bench are not happy about it.", poll:{type:"debate", opts:[["Correct call — clear push","eng",64],["Harsh — minimal contact, goal should stand","nor",36]]}},
{name:"Tomás", camp:"neu", time:"23:08", txt:"called it in the pre-match chat. some decision always seems to go England's way in these things, and there it is", reax:{"👀":13}},
{name:"Henrik", camp:"nor", time:"23:09", txt:"that's the softest disallowed goal I've seen all tournament, genuinely gutted for Heggem there", reax:{"😤":11}},
{name:"Radha", camp:"nor", bot:true, time:"23:09", txt:"Marginal contact at best — Norway will feel hard done by, that looked like a goal that should have stood. 🇳🇴"},
{name:"Jamal", camp:"eng", time:"23:10", txt:"Haaland clearly shoves him off balance right before the header, that's a stonewall foul, no real debate for me there"},
{name:"Kabir", camp:"nor", time:"23:10", txt:"as the Haaland stan in the room I have to admit that one looked pretty deliberate, hard to defend it fully", reax:{"😅":8}},
{name:"Dolly", camp:"neu", bot:true, time:"23:24", txt:"90 minutes gone — still 1-1. This one's going to extra time.", slider:{left:"ENG confident",right:"NOR confident", pct:52}},
{name:"Freya", camp:"eng", time:"23:24", txt:"extra time in this heat is going to be absolutely brutal for both sets of legs, fitness could decide this more than tactics now"},
{name:"Beatriz", camp:"neu", time:"23:25", txt:"broadcasters loving this by the way, extra time on a quarter-final slot is exactly the drama every rights-holder wants"},

{d:"EXTRA TIME"},
{name:"Dolly", camp:"neu", bot:true, time:"23:31", special:"story", title:"Story: 60 years of hurt", txt:"England's only major trophy is still the 1966 World Cup, on home soil, six decades ago. Two Euro final defeats since under this same generation of players. Every extra-time minute like this one gets framed the same way back home — not just about tonight, but about whether this is finally the group that ends the wait."},
{name:"Dolly", camp:"neu", bot:true, time:"23:34", txt:"GOAL — England lead for the first time! Bellingham again, pouncing on a loose rebound after Nyland spills a long-range effort from Rogers. 3 minutes into extra time.", poll:{type:"reaction", opts:[["🏴🔥 BELLINGHAM AGAIN",81],["🇳🇴 gutted, keeper error there",19]]}},
{name:"Ryan", camp:"eng", time:"23:34", txt:"HE'S DONE IT AGAIN. TWO GOALS. IN A WORLD CUP QUARTER FINAL. JUDE BELLINGHAM.", reax:{"🔥🔥":27}},
{name:"Oliver", camp:"eng", time:"23:34", txt:"I have never screamed this loud in my flat, my neighbours are going to file a complaint tomorrow and I don't care", reax:{"😂":20}},
{name:"Krishna", camp:"eng", bot:true, time:"23:35", txt:"Two goals from Bellingham in a World Cup quarter-final — that's the kind of moment careers get remembered for. Huge goal for England. 🏴", reax:{"🏴":18}},
{name:"Henrik", camp:"nor", time:"23:35", txt:"Nyland will be gutted with himself there, that's exactly the kind of mistake you can't make on this stage. Still so proud of this run though.", reax:{"🇳🇴":15}},
{name:"Mateus", camp:"neu", time:"23:36", txt:"Bellingham with the second goal, obviously. this tournament has basically been his coming out party on the biggest stage"},
{name:"Dolly", camp:"neu", bot:true, time:"23:52", txt:"Late drama — a Spence penalty shout waved away by the referee in the second period of extra time.", poll:{type:"debate", opts:[["Nothing there, right call","eng",58],["Should've been given, contact clear","nor",42]]}},
{name:"Aryan", camp:"neu", time:"23:52", txt:"honestly could not care less how that shout goes, my heart cannot take another VAR check tonight", reax:{"😅":9}},
{name:"Dolly", camp:"neu", bot:true, time:"23:57", txt:"Stoppage time — Eze breaks forward for England on the counter, but a heavy touch lets Norway recover possession for one last push."},
{name:"Meher", camp:"neu", time:"23:58", txt:"Norway absolutely refusing to go quietly here, monster effort from them right to the very last kick"},
{name:"Dolly", camp:"neu", bot:true, time:"00:01", txt:"FULL-TIME AFTER EXTRA TIME — Norway 1-2 England. The Three Lions are into the semi-final.", poll:{type:"reaction", opts:[["🏴 ONWARDS",69],["🇳🇴 proud despite the result",31]]}},
{name:"Priya", camp:"eng", time:"00:01", txt:"fourth ever World Cup semi-final for England, first one since 2018. absolutely wild night.", reax:{"🏴":21}},
{name:"Henrik", camp:"nor", time:"00:02", txt:"heartbroken obviously, but we came back to a World Cup after 28 years and gave England the game of their tournament. take a bow, Norway.", reax:{"🇳🇴":26}},
{name:"Ryan", camp:"eng", time:"00:02", txt:"Henrik genuinely, take the applause, that was one of the best games I've ever watched regardless of the shirt I'm wearing", reax:{"🤝":19}},

{d:"POST-MATCH"},
{name:"Dolly", camp:"neu", bot:true, time:"00:08", special:"analysis", title:"Post-Match Read", pts:[
  "England reach a fourth-ever World Cup semi-final, and their first since 2018 — Bellingham's double the difference, both goals born from England creating second chances rather than clean buildup play.",
  "Norway leave with the tournament's best redemption story — first World Cup since 1998, a quarter-final finish, and Haaland announcing himself on the stage he'd never had.",
  "England now face Argentina in the semi-final on Wednesday — Julián Álvarez scored the winner as Argentina beat Switzerland 3-1 in their own extra-time thriller earlier tonight."
]},
{name:"Dolly", camp:"neu", bot:true, time:"00:10", txt:"Player of the Match — the room's call:", poll:{type:"battle", opts:[["Bellingham — the obvious pick","eng",83],["Haaland — battled all night regardless","nor",17]]}},
{name:"Nikhil", camp:"neu", time:"00:11", txt:"Bellingham captained in my fantasy team just delivered the best single haul of my whole bracket, no notes"},
{name:"Dolly", camp:"neu", bot:true, time:"00:13", txt:"Best Takes from tonight: Henrik's grace in defeat, Ryan's '60 years of staying calm' line, and Tomás calling the VAR moment before it happened. Fan Army standings updated — ENG camp advance to the semi-final round; NOR camp's run ends at the quarter-final."},
{name:"Dolly", camp:"neu", bot:true, time:"00:17", txt:"Captain and coach remarks — Harry Kane credited the squad's resilience and said the group always believes a way through will appear, even after going behind. Thomas Tuchel said the extra-time goal was built on persistence rather than luck, and that the squad is exactly where he wants it heading into a semi-final."},
{name:"Jamal", camp:"eng", time:"00:18", txt:"'persistence rather than luck' — Tuchel's whole tournament in one line honestly, defensively watertight all campaign, just needed the goals to arrive tonight"},
{name:"Dolly", camp:"neu", bot:true, time:"00:19", txt:"Norway's side — captain Martin Ødegaard said the squad can leave with their heads high after ending a 28-year wait with a quarter-final run, and coach Ståle Solbakken said this group has given the country a squad to build a real future around."},
{name:"Henrik", camp:"nor", time:"00:20", txt:"Solbakken played in our last World Cup and now he's the one who got us back to one. tonight hurts, but I'm not sad about this campaign at all.", reax:{"🇳🇴":24}},
{name:"Chloe", camp:"eng", time:"00:21", txt:"genuinely one of the best watch parties I've been part of, in this room or otherwise. see everyone Wednesday for Argentina", reax:{"👏":16}},
{name:"Ananya", camp:"neu", time:"00:22", txt:"an England vs Argentina World Cup semi-final has some serious storyline potential, IISM group chat is already going wild about this one"},
{name:"Simran", camp:"neu", time:"00:23", txt:"emotionally exhausted, physically still in my chair, see you all for the semi 🍿"}
];