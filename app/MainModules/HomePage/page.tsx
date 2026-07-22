// "use client";

// import ContinueListening from "@/src/components/HomeComponents/ContinueListening/index";
// import CricketArticles from "@/src/components/HomeComponents/CricketArticles/index";
// import Header from "@/src/components/HomeComponents/Header/index";
// import HomeBanners from "@/src/components/HomeComponents/HomeBanners/index";
// import HomeCardsSection from "@/src/components/HomeComponents/HomeCards";
// import Player360CardsSection from "@/src/components/HomeComponents/Player360Cards";
// import Team360CardsSection from "@/src/components/HomeComponents/Team360Cards";

// export default function HomePage() {
//   return (
//     <div className="flex flex-col w-full">
//       <Header />
//       <div className="flex flex-col gap-6 px-4 lg:px-6 py-4 w-full">
//         <HomeBanners />
//         {/* <ContinueListening /> */}
//         <HomeCardsSection />
//         <Team360CardsSection />
//         <Player360CardsSection  />
//         <CricketArticles />
//       </div>
//     </div>
//   );
// }


"use client";

import ContinueListening from "@/src/components/HomeComponents/ContinueListening/index";
import HomeBanners from "@/src/components/HomeComponents/HomeBanners/index";
import HomeCardsSection from "@/src/components/HomeComponents/HomeCards";
import Player360CardsSection from "@/src/components/HomeComponents/Player360Cards";
import Team360CardsSection from "@/src/components/HomeComponents/Team360Cards";
import PollCardsPage from "../PollCards/page";
import NewsCenter from "@/src/components/HomeComponents/NewsCenter";
import IPLSpotlight from "../IPLSpotlight/page";
import SocialFeedSection from "@/src/components/CreatePost-Component/SocialFeedSection";
import FifaWorldSection from "@/src/components/HomeComponents/FifaWorldSection";
import NewHomePage from "@/src/components/NewHomePageComponent/newhomepage";

import WPLPlayerPage from "../Wplplayer360/page";
import FifaPlayerProfilePage from "../FifaPlayer360/page";
import WomensT20Section from "@/src/components/HomeComponents/WomensT20Section";
import FifaClub360Page from "../FifaClub360/page";
import WT20Club360CardsSection from "../WT20WC360/page";
import HeroCarousel, { HeroCard } from "@/src/components/NewHomeComponents/SportScoreSection";
import { MyRoomsList } from "@/src/components/NewHomeComponents/Myroomsstatspreview";
import type { Room } from "@/src/components/NewROARComponent/types";
import { useRouter } from "next/navigation";
import StoreFeedSection from "../AtheleteHome/figma/HomeStore";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import DollyPanel, { type DollyHistorySession } from "@/src/components/NewROARComponent/components/DollyPanel";

export default function HomePage() {
  const router = useRouter();
  const REQUEST_TIMEOUT_MS = 12000;
const DOLLY_ROOM_ID = "NMryj1w7t8mJpGzEvF9q"; // same "Open Room" used as openRoomId below

const [dollyOpen, setDollyOpen] = useState(false);
const [dollyQuestion, setDollyQuestion] = useState("");
const [dollyAsking, setDollyAsking] = useState(false);
const [dollyReplies, setDollyReplies] = useState<{ id: string; question: string; answer: string; createdAt: number }[]>([]);
const [dollyHistory, setDollyHistory] = useState<DollyHistorySession[]>([]);
const [dollyHistoryLoading, setDollyHistoryLoading] = useState(false);
const [dollyHistoryLoadingMore, setDollyHistoryLoadingMore] = useState(false);
const dollyHistoryCursorRef = useRef<number | undefined>(undefined);
const dollyHistoryExhaustedRef = useRef(false);
const [dollyActiveSessionId, setDollyActiveSessionId] = useState<string | undefined>(undefined);
const dollyActiveSessionIdRef = useRef<string | undefined>(undefined);
const [dollyRepliesLoading, setDollyRepliesLoading] = useState(false);
const dollyFetchTokenRef = useRef<symbol | null>(null);

useEffect(() => {
  dollyActiveSessionIdRef.current = dollyActiveSessionId;
}, [dollyActiveSessionId]);
  

  // TODO: replace with real API data (e.g. from your existing
  // presence-preview / rooms endpoints, same as RoomsHome.tsx)
  const heroCards: HeroCard[] = [
    {
      type: "live",
      id: "ind-vs-pak-live",
      status: "LIVE",
      competition: "ODI · Champions Trophy",
      teamAName: "INDIA",
      teamAShort: "IN",
      teamAScore: "204/32.4",
      teamBName: "PAKISTAN",
      teamBShort: "PK",
      overSummary: [
        { label: "4", kind: "four" },
        { label: "W", kind: "wicket" },
        { label: "1", kind: "run" },
        { label: "6", kind: "six" },
        { label: "2", kind: "run" },
        { label: "1", kind: "run" },
      ],
      rrr: "RRR 7.2",
      oversLabel: "Ov 32.4",
      fanCount: 8200,
      onJoin: () => router.push("/MainModules/ROAR?room=3XRaFu2Dueyhnamou0Ie"),
    },
    {
      type: "upcoming",
      id: "ind-vs-sl-upcoming",
      competition: "T20 · Asia Cup",
      teamAName: "INDIA",
      teamAShort: "IN",
      teamBName: "SRI LANKA",
      teamBShort: "LK",
      venue: "R.Premadasa Stadium · Colombo",
      time: "7:30 PM IST",
      startsInMs: Date.now() + 2 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000,
      onNotify: () => console.log("Set reminder"),
    },
    {
      type: "vip",
      id: "neeraj-chopra-vip",
      tag: "VIP EXPERIENCE",
      eventTag: "Asian Games · Nagoya",
      scarcityTag: "FEW LEFT",
      title: "Breakfast with Neeraj Chopra",
      subtitle: "Exclusive 1-on-1 session · ITC Maurya · New Delhi",
      price: "₹12,500",
      priceSuffix: "/ person",
      onBook: () => console.log("Book experience"),
    },
  ];

  // TODO: replace with your real rooms/presence/counts state
  // (same shape as RoomsHome.tsx: allRooms, presenceByRoom, countsByRoom)
  const rooms: Room[] = [
    {
      roomId: "3XRaFu2Dueyhnamou0Ie",
      name: "IND vs PAK",
      sport: "cricket",
      description: "Champions Trophy · 8.2K active",
      status: "live",
    } as Room,
    {
      roomId: "commonwealth-games",
      name: "Commonwealth Games",
      sport: "default",
      description: "1.2K members · 234 active",
    } as Room,
  ];

  const presenceByRoom = {
    "3XRaFu2Dueyhnamou0Ie": { fanCount: 8200, totalJoinCount: 12000 },
    "commonwealth-games": { fanCount: 234, totalJoinCount: 1200 },
  };

  const countsByRoom = {
    "3XRaFu2Dueyhnamou0Ie": { post: 120, debate: 40, prediction: 30, trivia: 10, battle: 5 },
    "commonwealth-games": { post: 8, debate: 4, prediction: 0, trivia: 0, battle: 0 },
  };

  const loadDollyHistory = async () => {
  setDollyHistoryLoading(true);
  dollyHistoryCursorRef.current = undefined;
  dollyHistoryExhaustedRef.current = false;
  try {
    const res = await axios.get(`/api/roar/rooms/${DOLLY_ROOM_ID}/dolly/sessions`, { timeout: REQUEST_TIMEOUT_MS });
    const sessions = res.data?.sessions ?? [];
    setDollyHistory(sessions.map((s: any) => ({
      sessionId: s.sessionId, roomId: DOLLY_ROOM_ID, title: s.title, subtitle: "", dateLabel: s.dateLabel,
    })));
    dollyHistoryCursorRef.current = res.data?.nextBefore;
    if (sessions.length === 0) dollyHistoryExhaustedRef.current = true;
  } catch {
    setDollyHistory([]);
  } finally {
    setDollyHistoryLoading(false);
  }
};

const loadMoreDollyHistory = async () => {
  if (dollyHistoryExhaustedRef.current || dollyHistoryLoadingMore) return;
  setDollyHistoryLoadingMore(true);
  try {
    const before = dollyHistoryCursorRef.current;
    const res = await axios.get(`/api/roar/rooms/${DOLLY_ROOM_ID}/dolly/sessions`, {
      params: before ? { before } : undefined, timeout: REQUEST_TIMEOUT_MS,
    });
    const sessions = res.data?.sessions ?? [];
    if (sessions.length === 0) {
      dollyHistoryExhaustedRef.current = true;
    } else {
      setDollyHistory(prev => [...prev, ...sessions.map((s: any) => ({
        sessionId: s.sessionId, roomId: DOLLY_ROOM_ID, title: s.title, subtitle: "", dateLabel: s.dateLabel,
      }))]);
      dollyHistoryCursorRef.current = res.data?.nextBefore;
    }
  } catch { /* leave as-is */ }
  finally { setDollyHistoryLoadingMore(false); }
};

const ensureDollySession = async (): Promise<string | null> => {
  if (dollyActiveSessionId) return dollyActiveSessionId;
  try {
    const res = await axios.post(`/api/roar/rooms/${DOLLY_ROOM_ID}/dolly/sessions`, {}, { timeout: REQUEST_TIMEOUT_MS });
    const newId = res.data?.sessionId;
    if (newId) { setDollyActiveSessionId(newId); dollyActiveSessionIdRef.current = newId; }
    return newId ?? null;
  } catch {
    return null;
  }
};

const handleNewDollyChat = () => {
  dollyFetchTokenRef.current = Symbol();
  setDollyQuestion("");
  setDollyReplies([]);
  setDollyActiveSessionId(undefined);
  dollyActiveSessionIdRef.current = undefined;
};

const renameDollySession = async (sessionId: string, newTitle: string) => {
  setDollyHistory(prev => prev.map(s => s.sessionId === sessionId ? { ...s, title: newTitle } : s));
  try {
    await axios.patch(`/api/roar/rooms/${DOLLY_ROOM_ID}/dolly/${sessionId}`, { customTitle: newTitle }, { timeout: REQUEST_TIMEOUT_MS });
  } catch {
    loadDollyHistory();
  }
};

const deleteDollySession = async (sessionId: string) => {
  setDollyHistory(prev => prev.filter(s => s.sessionId !== sessionId));
  if (dollyActiveSessionId === sessionId) handleNewDollyChat();
  try {
    await axios.delete(`/api/roar/rooms/${DOLLY_ROOM_ID}/dolly/${sessionId}`, { timeout: REQUEST_TIMEOUT_MS });
  } catch {
    loadDollyHistory();
  }
};

  return (
    <div className="flex flex-col w-full min-h-screen">
      <div className="flex flex-col gap-6 px-4 lg:px-6 py-4 w-full">
        {/* <HomeBanners />
        <IPLSpotlight />
        <WomensT20Section/>
        <FifaWorldSection />
        <ContinueListening /> */}
        {/* <PollCardsPage /> */}
        {/* <NewHomePage /> */}
        {/* <HomeCardsSection /> */}
        {/* <Team360CardsSection /> */}
        {/* <WPLPlayerPage />
        <FifaPlayerProfilePage />
        <WT20Club360CardsSection />
        <FifaClub360Page /> */}
        {/* <Player360CardsSection /> */}
        {/* <SocialFeedSection />
        <NewsCenter /> */}

        <HeroCarousel cards={heroCards} />

        <MyRoomsList
          rooms={rooms}
          presenceByRoom={presenceByRoom}
          countsByRoom={countsByRoom}
          openRoomId="NMryj1w7t8mJpGzEvF9q"
          onSeeAll={() => router.push("/MainModules/ROAR")}
          onEnter={(room) => router.push(`/MainModules/ROAR?room=${room.roomId}`)}
        />

<DollyPanel
  isOpen={dollyOpen}
  onOpen={() => { setDollyOpen(true); loadDollyHistory(); }}
  onClose={() => setDollyOpen(false)}
  activeSessionId={dollyActiveSessionId}
  onNewChat={handleNewDollyChat}
  question={dollyQuestion}
  setQuestion={setDollyQuestion}
  onRenameSession={renameDollySession}
  onDeleteSession={deleteDollySession}
  asking={dollyAsking}
  onAsk={async () => {
    const q = dollyQuestion.trim();
    if (!q || dollyAsking) return;
    setDollyAsking(true);
    const sessionId = await ensureDollySession();
    if (!sessionId) { setDollyAsking(false); return; }
    const tempId = `temp-dolly-${Date.now()}`;
    setDollyReplies(prev => [...prev, { id: tempId, question: q, answer: "", createdAt: Date.now() }]);
    setDollyQuestion("");
    try {
      const res = await axios.post(`/api/roar/rooms/${DOLLY_ROOM_ID}/dolly/${sessionId}`, { question: q }, { timeout: 30000 });
      if (res.data?.success && dollyActiveSessionIdRef.current === sessionId) {
        setDollyReplies(prev => prev.map(d => d.id === tempId ? res.data.reply : d));
      }
    } catch {
      if (dollyActiveSessionIdRef.current === sessionId) {
        setDollyReplies(prev => prev.map(d => d.id === tempId ? { ...d, answer: "Something went wrong — try again." } : d));
      }
    } finally { setDollyAsking(false); }
  }}
  replies={dollyReplies}
  loadingReplies={dollyRepliesLoading}
  history={dollyHistory}
  loadingHistory={dollyHistoryLoading}
  loadingMoreHistory={dollyHistoryLoadingMore}
  onLoadMoreHistory={loadMoreDollyHistory}
  onSelectHistorySession={async (session) => {
    if (session.sessionId === dollyActiveSessionId) return;
    const requestId = Symbol();
    dollyFetchTokenRef.current = requestId;
    setDollyActiveSessionId(session.sessionId);
    dollyActiveSessionIdRef.current = session.sessionId;
    setDollyRepliesLoading(true);
    try {
      const res = await axios.get(`/api/roar/rooms/${DOLLY_ROOM_ID}/dolly/${session.sessionId}`, { timeout: REQUEST_TIMEOUT_MS });
      if (dollyFetchTokenRef.current !== requestId) return;
      setDollyReplies(res.data?.success ? (res.data.replies ?? []) : []);
    } catch {
      if (dollyFetchTokenRef.current === requestId) setDollyReplies([]);
    } finally {
      if (dollyFetchTokenRef.current === requestId) setDollyRepliesLoading(false);
    }
  }}
  roomKind="lobby"
  constrainedToParent={false}
/>
        
        <StoreFeedSection />
      </div>
    </div>
  );
}