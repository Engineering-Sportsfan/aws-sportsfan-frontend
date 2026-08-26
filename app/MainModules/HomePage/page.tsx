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


// "use client";

// import ContinueListening from "@/src/components/HomeComponents/ContinueListening/index";
// import HomeBanners from "@/src/components/HomeComponents/HomeBanners/index";
// import HomeCardsSection from "@/src/components/HomeComponents/HomeCards";
// import Player360CardsSection from "@/src/components/HomeComponents/Player360Cards";
// import Team360CardsSection from "@/src/components/HomeComponents/Team360Cards";
// import PollCardsPage from "../PollCards/page";
// import NewsCenter from "@/src/components/HomeComponents/NewsCenter";
// import IPLSpotlight from "../IPLSpotlight/page";
// import SocialFeedSection from "@/src/components/CreatePost-Component/SocialFeedSection";
// import FifaWorldSection from "@/src/components/HomeComponents/FifaWorldSection";
// import NewHomePage from "@/src/components/NewHomePageComponent/newhomepage";

// import WPLPlayerPage from "../Wplplayer360/page";
// import FifaPlayerProfilePage from "../FifaPlayer360/page";
// import WomensT20Section from "@/src/components/HomeComponents/WomensT20Section";
// import FifaClub360Page from "../FifaClub360/page";
// import WT20Club360CardsSection from "../WT20WC360/page";
// import HeroCarousel, { HeroCard } from "@/src/components/NewHomeComponents/SportScoreSection";
// import RoarRooms from "@/src/components/NewHomeComponents/Myroomsstatspreview";
// import type { Room } from "@/src/components/NewROARComponent/types";
// import { useRouter } from "next/navigation";
// import StoreFeedSection from "../AtheleteHome/figma/HomeStore";
// import { useState, useRef, useEffect } from "react";
// import axios from "axios";
// import DollyPanel, { type DollyHistorySession } from "@/src/components/NewROARComponent/components/DollyPanel";
// import SportScoreSection from "@/src/components/NewHomeComponents/SportScoreSection";
// import IndiaHub from "@/src/components/NewHomeComponents/IndiaHub";
// import WatchAlongSessions from "@/src/components/NewHomeComponents/WatchAlongSessions";
// import StoreAndExperiences from "@/src/components/NewHomeComponents/StoreAndExperiences";

// export default function HomePage() {
//   const router = useRouter();
//   const REQUEST_TIMEOUT_MS = 12000;
//   const DOLLY_ROOM_ID = "NMryj1w7t8mJpGzEvF9q"; // same "Open Room" used as openRoomId below

//   const [dollyOpen, setDollyOpen] = useState(false);
//   const [dollyQuestion, setDollyQuestion] = useState("");
//   const [dollyAsking, setDollyAsking] = useState(false);
//   const [dollyReplies, setDollyReplies] = useState<{ id: string; question: string; answer: string; createdAt: number }[]>([]);
//   const [dollyHistory, setDollyHistory] = useState<DollyHistorySession[]>([]);
//   const [dollyHistoryLoading, setDollyHistoryLoading] = useState(false);
//   const [dollyHistoryLoadingMore, setDollyHistoryLoadingMore] = useState(false);
//   const dollyHistoryCursorRef = useRef<number | undefined>(undefined);
//   const dollyHistoryExhaustedRef = useRef(false);
//   const [dollyActiveSessionId, setDollyActiveSessionId] = useState<string | undefined>(undefined);
//   const dollyActiveSessionIdRef = useRef<string | undefined>(undefined);
//   const [dollyRepliesLoading, setDollyRepliesLoading] = useState(false);
//   const dollyFetchTokenRef = useRef<symbol | null>(null);

//   useEffect(() => {
//     dollyActiveSessionIdRef.current = dollyActiveSessionId;
//   }, [dollyActiveSessionId]);


//   // TODO: replace with real API data (e.g. from your existing
//   // presence-preview / rooms endpoints, same as RoomsHome.tsx)
//   const heroCards: HeroCard[] = [
//     {
//       type: "live",
//       id: "ind-vs-pak-live",
//       status: "LIVE",
//       competition: "ODI · Champions Trophy",
//       teamAName: "INDIA",
//       teamAShort: "IN",
//       teamAScore: "204/32.4",
//       teamBName: "PAKISTAN",
//       teamBShort: "PK",
//       overSummary: [
//         { label: "4", kind: "four" },
//         { label: "W", kind: "wicket" },
//         { label: "1", kind: "run" },
//         { label: "6", kind: "six" },
//         { label: "2", kind: "run" },
//         { label: "1", kind: "run" },
//       ],
//       rrr: "RRR 7.2",
//       oversLabel: "Ov 32.4",
//       fanCount: 8200,
//       onJoin: () => router.push("/MainModules/ROAR?room=3XRaFu2Dueyhnamou0Ie"),
//     },
//     {
//       type: "upcoming",
//       id: "ind-vs-sl-upcoming",
//       competition: "T20 · Asia Cup",
//       teamAName: "INDIA",
//       teamAShort: "IN",
//       teamBName: "SRI LANKA",
//       teamBShort: "LK",
//       venue: "R.Premadasa Stadium · Colombo",
//       time: "7:30 PM IST",
//       startsInMs: Date.now() + 2 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000,
//       onNotify: () => console.log("Set reminder"),
//     },
//     {
//       type: "vip",
//       id: "neeraj-chopra-vip",
//       tag: "VIP EXPERIENCE",
//       eventTag: "Asian Games · Nagoya",
//       scarcityTag: "FEW LEFT",
//       title: "Breakfast with Neeraj Chopra",
//       subtitle: "Exclusive 1-on-1 session · ITC Maurya · New Delhi",
//       ctaLabel: "Book Experience",
//       price: "₹12,500",
//       priceSuffix: "/ person",
//       onBook: () => console.log("Book experience"),
//     },
//   ];

//   // TODO: replace with your real rooms/presence/counts state
//   // (same shape as RoomsHome.tsx: allRooms, presenceByRoom, countsByRoom)
//   const rooms: Room[] = [
//     {
//       roomId: "3XRaFu2Dueyhnamou0Ie",
//       name: "IND vs PAK",
//       sport: "cricket",
//       description: "Champions Trophy · 8.2K active",
//       status: "live",
//     } as Room,
//     {
//       roomId: "commonwealth-games",
//       name: "Commonwealth Games",
//       sport: "default",
//       description: "1.2K members · 234 active",
//     } as Room,
//   ];

//   const presenceByRoom = {
//     "3XRaFu2Dueyhnamou0Ie": { fanCount: 8200, totalJoinCount: 12000 },
//     "commonwealth-games": { fanCount: 234, totalJoinCount: 1200 },
//   };

//   const countsByRoom = {
//     "3XRaFu2Dueyhnamou0Ie": { post: 120, debate: 40, prediction: 30, trivia: 10, battle: 5 },
//     "commonwealth-games": { post: 8, debate: 4, prediction: 0, trivia: 0, battle: 0 },
//   };

//   const loadDollyHistory = async () => {
//     setDollyHistoryLoading(true);
//     dollyHistoryCursorRef.current = undefined;
//     dollyHistoryExhaustedRef.current = false;
//     try {
//       const res = await axios.get(`/api/roar/rooms/${DOLLY_ROOM_ID}/dolly/sessions`, { timeout: REQUEST_TIMEOUT_MS });
//       const sessions = res.data?.sessions ?? [];
//       setDollyHistory(sessions.map((s: any) => ({
//         sessionId: s.sessionId, roomId: DOLLY_ROOM_ID, title: s.title, subtitle: "", dateLabel: s.dateLabel,
//       })));
//       dollyHistoryCursorRef.current = res.data?.nextBefore;
//       if (sessions.length === 0) dollyHistoryExhaustedRef.current = true;
//     } catch {
//       setDollyHistory([]);
//     } finally {
//       setDollyHistoryLoading(false);
//     }
//   };

//   const loadMoreDollyHistory = async () => {
//     if (dollyHistoryExhaustedRef.current || dollyHistoryLoadingMore) return;
//     setDollyHistoryLoadingMore(true);
//     try {
//       const before = dollyHistoryCursorRef.current;
//       const res = await axios.get(`/api/roar/rooms/${DOLLY_ROOM_ID}/dolly/sessions`, {
//         params: before ? { before } : undefined, timeout: REQUEST_TIMEOUT_MS,
//       });
//       const sessions = res.data?.sessions ?? [];
//       if (sessions.length === 0) {
//         dollyHistoryExhaustedRef.current = true;
//       } else {
//         setDollyHistory(prev => [...prev, ...sessions.map((s: any) => ({
//           sessionId: s.sessionId, roomId: DOLLY_ROOM_ID, title: s.title, subtitle: "", dateLabel: s.dateLabel,
//         }))]);
//         dollyHistoryCursorRef.current = res.data?.nextBefore;
//       }
//     } catch { /* leave as-is */ }
//     finally { setDollyHistoryLoadingMore(false); }
//   };

//   const ensureDollySession = async (): Promise<string | null> => {
//     if (dollyActiveSessionId) return dollyActiveSessionId;
//     try {
//       const res = await axios.post(`/api/roar/rooms/${DOLLY_ROOM_ID}/dolly/sessions`, {}, { timeout: REQUEST_TIMEOUT_MS });
//       const newId = res.data?.sessionId;
//       if (newId) { setDollyActiveSessionId(newId); dollyActiveSessionIdRef.current = newId; }
//       return newId ?? null;
//     } catch {
//       return null;
//     }
//   };

//   const handleNewDollyChat = () => {
//     dollyFetchTokenRef.current = Symbol();
//     setDollyQuestion("");
//     setDollyReplies([]);
//     setDollyActiveSessionId(undefined);
//     dollyActiveSessionIdRef.current = undefined;
//   };

//   const renameDollySession = async (sessionId: string, newTitle: string) => {
//     setDollyHistory(prev => prev.map(s => s.sessionId === sessionId ? { ...s, title: newTitle } : s));
//     try {
//       await axios.patch(`/api/roar/rooms/${DOLLY_ROOM_ID}/dolly/${sessionId}`, { customTitle: newTitle }, { timeout: REQUEST_TIMEOUT_MS });
//     } catch {
//       loadDollyHistory();
//     }
//   };

//   const deleteDollySession = async (sessionId: string) => {
//     setDollyHistory(prev => prev.filter(s => s.sessionId !== sessionId));
//     if (dollyActiveSessionId === sessionId) handleNewDollyChat();
//     try {
//       await axios.delete(`/api/roar/rooms/${DOLLY_ROOM_ID}/dolly/${sessionId}`, { timeout: REQUEST_TIMEOUT_MS });
//     } catch {
//       loadDollyHistory();
//     }
//   };

//   return (
//     <div className="flex flex-col w-full min-h-screen">
//       <div className="flex flex-col gap-6 px-4 lg:px-6 py-4 w-full">
//         {/* <HomeBanners />
//         <IPLSpotlight />
//         <WomensT20Section/>
//         <FifaWorldSection />
//         <ContinueListening /> */}
//         {/* <PollCardsPage /> */}
//         {/* <NewHomePage /> */}
//         {/* <HomeCardsSection /> */}
//         {/* <Team360CardsSection /> */}
//         {/* <WPLPlayerPage />
//         <FifaPlayerProfilePage />
//         <WT20Club360CardsSection />
//         <FifaClub360Page /> */}
//         {/* <Player360CardsSection /> */}
//         {/* <SocialFeedSection />
//         <NewsCenter /> */}

//         {/* <HeroCarousel cards={heroCards} /> */}


//         {/* <MyRoomsList
//           openRoomId="NMryj1w7t8mJpGzEvF9q"
//           onSeeAll={() => router.push("/MainModules/ROAR")}
//           onEnter={(room) => router.push(`/MainModules/ROAR?room=${room.roomId}`)}
//         /> */}

//         <SportScoreSection />
//         <RoarRooms />
//         <WatchAlongSessions />

//         <IndiaHub />
//         <StoreAndExperiences />

//         <DollyPanel
//           isOpen={dollyOpen}
//           onOpen={() => { setDollyOpen(true); loadDollyHistory(); }}
//           onClose={() => setDollyOpen(false)}
//           activeSessionId={dollyActiveSessionId}
//           onNewChat={handleNewDollyChat}
//           question={dollyQuestion}
//           setQuestion={setDollyQuestion}
//           onRenameSession={renameDollySession}
//           onDeleteSession={deleteDollySession}
//           asking={dollyAsking}
//           onAsk={async () => {
//             const q = dollyQuestion.trim();
//             if (!q || dollyAsking) return;
//             setDollyAsking(true);
//             const sessionId = await ensureDollySession();
//             if (!sessionId) { setDollyAsking(false); return; }
//             const tempId = `temp-dolly-${Date.now()}`;
//             setDollyReplies(prev => [...prev, { id: tempId, question: q, answer: "", createdAt: Date.now() }]);
//             setDollyQuestion("");
//             try {
//               const res = await axios.post(`/api/roar/rooms/${DOLLY_ROOM_ID}/dolly/${sessionId}`, { question: q }, { timeout: 30000 });
//               if (res.data?.success && dollyActiveSessionIdRef.current === sessionId) {
//                 setDollyReplies(prev => prev.map(d => d.id === tempId ? res.data.reply : d));
//               }
//             } catch {
//               if (dollyActiveSessionIdRef.current === sessionId) {
//                 setDollyReplies(prev => prev.map(d => d.id === tempId ? { ...d, answer: "Something went wrong — try again." } : d));
//               }
//             } finally { setDollyAsking(false); }
//           }}
//           replies={dollyReplies}
//           loadingReplies={dollyRepliesLoading}
//           history={dollyHistory}
//           loadingHistory={dollyHistoryLoading}
//           loadingMoreHistory={dollyHistoryLoadingMore}
//           onLoadMoreHistory={loadMoreDollyHistory}
//           onSelectHistorySession={async (session) => {
//             if (session.sessionId === dollyActiveSessionId) return;
//             const requestId = Symbol();
//             dollyFetchTokenRef.current = requestId;
//             setDollyActiveSessionId(session.sessionId);
//             dollyActiveSessionIdRef.current = session.sessionId;
//             setDollyRepliesLoading(true);
//             try {
//               const res = await axios.get(`/api/roar/rooms/${DOLLY_ROOM_ID}/dolly/${session.sessionId}`, { timeout: REQUEST_TIMEOUT_MS });
//               if (dollyFetchTokenRef.current !== requestId) return;
//               setDollyReplies(res.data?.success ? (res.data.replies ?? []) : []);
//             } catch {
//               if (dollyFetchTokenRef.current === requestId) setDollyReplies([]);
//             } finally {
//               if (dollyFetchTokenRef.current === requestId) setDollyRepliesLoading(false);
//             }
//           }}
//           roomKind="lobby"
//           constrainedToParent={false}
//         />

//         {/* <StoreFeedSection /> */}
//       </div>
//     </div>
//   );
// }


//MainModules/Homepage/page.tsx

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
import RoarRooms from "@/src/components/NewHomeComponents/Myroomsstatspreview";
import type { Room } from "@/src/components/NewROARComponent/types";
import { useRouter, useSearchParams } from "next/navigation";
import StoreFeedSection from "../AtheleteHome/figma/HomeStore";
import { useState, useRef, useEffect, Suspense } from "react";
import axios from "axios";
import DollyPanel, { type DollyHistorySession } from "@/src/components/NewROARComponent/components/DollyPanel";
import SportScoreSection from "@/src/components/NewHomeComponents/SportScoreSection";
import IndiaHub from "@/src/components/NewHomeComponents/IndiaHub";
import WatchAlongSessions from "@/src/components/NewHomeComponents/WatchAlongSessions";
import StoreAndExperiences from "@/src/components/NewHomeComponents/StoreAndExperiences";
import PlaybookDrops from "@/src/components/NewHomeComponents/PlaybookDrops";
import AthleticsSpotlight from "@/src/components/NewHomeComponents/AthleticsSpotlight";
import AskFlip from "@/src/components/NewHomeComponents/AskFlip";
import FlipCard from "@/src/components/NewHomeComponents/FlipCard";
import FlipLine from "@/src/components/NewHomeComponents/FlipLine";
import Onboarding from "@/src/components/NewROARComponent/screens/Onboarding";
import { useAuth } from "@/context/AuthContext";

function HomePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, authReady, isAuthenticated } = useAuth();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedSport, setSelectedSport] = useState("mixed");
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
  // Holds a question queued from AskFlip until the Dolly panel has actually
  // opened — avoids a race where askDolly() fires before DollyPanel has
  // mounted/settled, which was silently swallowing the ask.
  const pendingFlipAskRef = useRef<string | null>(null);

  useEffect(() => {
    if (!authReady) return;

    if (!isAuthenticated || !user) {
      setCheckingOnboarding(false);
      setShowOnboarding(false);
      return;
    }

    const checkOnboarding = async () => {
      try {
        const res = await axios.get("/api/roar/onboarding");
        const completed = Boolean(res.data?.onboardingCompleted);
        if (completed) {
          try {
            localStorage.setItem("roar_v2_complete", "1");
          } catch {}
          setShowOnboarding(false);
        } else {
          let localComplete = false;
          try {
            localComplete = localStorage.getItem("roar_v2_complete") === "1";
          } catch {}
          if (!localComplete) {
            setShowOnboarding(true);
          } else {
            setShowOnboarding(false);
          }
        }
      } catch (err) {
        console.error("Failed to check onboarding status on HomePage:", err);
        let localComplete = false;
        try {
          localComplete = localStorage.getItem("roar_v2_complete") === "1";
        } catch {}
        setShowOnboarding(!localComplete);
      } finally {
        setCheckingOnboarding(false);
      }
    };

    checkOnboarding();
  }, [authReady, isAuthenticated, user]);

  useEffect(() => {
    if (showOnboarding) {
      document.body.classList.add("roar-room-active");
    } else {
      document.body.classList.remove("roar-room-active");
    }
    return () => document.body.classList.remove("roar-room-active");
  }, [showOnboarding]);

  const completeOnboarding = (prefs: any) => {
    try {
      localStorage.setItem("roar_v2_complete", "1");
      if (prefs?.username) localStorage.setItem("roar_username", prefs.username);
      if (prefs?.badge) localStorage.setItem("roar_badge", prefs.badge);
    } catch {}
    setShowOnboarding(false);
    if (prefs?.sports && prefs.sports.length > 0) {
      const firstSport = String(prefs.sports[0]).toLowerCase();
      setSelectedSport(firstSport);
    }
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
    dollyActiveSessionIdRef.current = dollyActiveSessionId;
  }, [dollyActiveSessionId]);

  const FEATURED_MATCH_CONTEXT = "India vs Sri Lanka Test Series";

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
      ctaLabel: "Book Experience",
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

  // Loads a specific Dolly session's replies and makes it the active one —
  // shared by history selection and the notification deep-link handler below.
  const loadDollySession = async (sessionId: string) => {
    if (sessionId === dollyActiveSessionIdRef.current) return;
    const requestId = Symbol();
    dollyFetchTokenRef.current = requestId;
    setDollyActiveSessionId(sessionId);
    dollyActiveSessionIdRef.current = sessionId;
    setDollyRepliesLoading(true);
    try {
      const res = await axios.get(`/api/roar/rooms/${DOLLY_ROOM_ID}/dolly/${sessionId}`, { timeout: REQUEST_TIMEOUT_MS });
      if (dollyFetchTokenRef.current !== requestId) return;
      setDollyReplies(res.data?.success ? (res.data.replies ?? []) : []);
    } catch {
      if (dollyFetchTokenRef.current === requestId) setDollyReplies([]);
    } finally {
      if (dollyFetchTokenRef.current === requestId) setDollyRepliesLoading(false);
    }
  };

  // Core "ask Dolly a question" flow — shared by the DollyPanel's own input
  // and by AskFlip's input/quick-prompt pills so both funnel into the same
  // panel + session + reply state instead of navigating to a separate page.
  const askDolly = async (question: string, notify: boolean = false) => {
    const q = question.trim();
    if (!q || dollyAsking) return;
    setDollyAsking(true);
    const sessionId = await ensureDollySession();
    if (!sessionId) { setDollyAsking(false); return; }
    const tempId = `temp-dolly-${Date.now()}`;
    setDollyReplies(prev => [...prev, { id: tempId, question: q, answer: "", createdAt: Date.now() }]);
    setDollyQuestion("");
    try {
      const res = await axios.post(
        `/api/roar/rooms/${DOLLY_ROOM_ID}/dolly/${sessionId}`,
        { question: q, notify },
        { timeout: 30000 }
      );
      if (res.data?.success && dollyActiveSessionIdRef.current === sessionId) {
        setDollyReplies(prev => prev.map(d => d.id === tempId ? res.data.reply : d));

        if (notify) {
          window.dispatchEvent(
            new CustomEvent("sf360:new-notification", {
              detail: { title: "Flip answered your question" },
            })
          );
          window.dispatchEvent(new CustomEvent("sf360:notifications-updated"));
        }
      }
    } catch {
      if (dollyActiveSessionIdRef.current === sessionId) {
        setDollyReplies(prev => prev.map(d => d.id === tempId ? { ...d, answer: "Something went wrong — try again." } : d));
      }
    } finally { setDollyAsking(false); }
  };

  // Handler passed to AskFlip: opens the Dolly panel (loading its history the
  // same way the panel's own onOpen does), shows the question in the panel's
  // input immediately, and queues it to be asked once the panel has
  // confirmed it's open (see the effect below) rather than firing the ask in
  // the same tick as opening the panel.
  const handleAskFromFlip = (question: string) => {
    pendingFlipAskRef.current = question;
    setDollyQuestion(question);
    setDollyOpen(true);
    loadDollyHistory();
  };

  // Fires the queued AskFlip question once dollyOpen has actually flipped to
  // true, so the panel is mounted/ready before we push a reply into it.
  useEffect(() => {
    if (dollyOpen && pendingFlipAskRef.current) {
      const q = pendingFlipAskRef.current;
      pendingFlipAskRef.current = null;
      askDolly(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dollyOpen]);

  // Deep-link support: a notification's "See Dolly's answer" CTA routes here
  // with ?openDolly=1&dollySessionId=<id> (see NotificationsPage's
  // handleSchemaCtaClick). On mount, if those params are present, open the
  // Dolly panel and jump straight to that session's replies.
  useEffect(() => {
    const shouldOpen = searchParams.get("openDolly") === "1";
    const sessionId = searchParams.get("dollySessionId");
    if (!shouldOpen || !sessionId) return;

    setDollyOpen(true);
    loadDollySession(sessionId);

    // Clean the query params so a refresh/back-nav doesn't re-trigger this.
    router.replace("/MainModules/HomePage");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  if (showOnboarding) {
    return (
      <div className="w-full min-h-screen bg-black relative">
        <style dangerouslySetInnerHTML={{ __html: `#global-header-desktop,#global-header-tablet,#global-header-mobile,#live-ticker-container,.roar-header-spacer{display:none!important}` }} />
        <Onboarding onComplete={completeOnboarding} />
      </div>
    );
  }

  if (checkingOnboarding && isAuthenticated) {
    return (
      <div className="w-full min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-gray-700 border-t-[#E91E8C] animate-spin" />
      </div>
    );
  }

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

        {/* <HeroCarousel cards={heroCards} /> */}


        {/* <MyRoomsList
          openRoomId="NMryj1w7t8mJpGzEvF9q"
          onSeeAll={() => router.push("/MainModules/ROAR")}
          onEnter={(room) => router.push(`/MainModules/ROAR?room=${room.roomId}`)}
        /> */}

        <SportScoreSection selectedSport={selectedSport} onSelectSport={setSelectedSport} />
        <FlipLine selectedSport={selectedSport} />
        <WatchAlongSessions />
        {/* <AthleticsSpotlight sport={selectedSport} /> */}
        <RoarRooms />
        <PlaybookDrops />

        <AskFlip onAsk={handleAskFromFlip} matchContext={FEATURED_MATCH_CONTEXT} />
        <FlipCard />

        {/* <IndiaHub sport={selectedSport} /> */}

        {/* <StoreAndExperiences sport={selectedSport} /> */}

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
          onAsk={(notify: boolean) => askDolly(dollyQuestion, notify)}
          replies={dollyReplies}
          loadingReplies={dollyRepliesLoading}
          history={dollyHistory}
          loadingHistory={dollyHistoryLoading}
          loadingMoreHistory={dollyHistoryLoadingMore}
          onLoadMoreHistory={loadMoreDollyHistory}
          onSelectHistorySession={async (session) => {
            await loadDollySession(session.sessionId);
          }}
          roomKind="lobby"
          constrainedToParent={false}
        />

        {/* <StoreFeedSection /> */}
      </div>
    </div>
  );
}

// useSearchParams() requires a Suspense boundary in the App Router — without
// this wrapper Next.js will throw a build error / break static rendering
// for this page.
export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomePageInner />
    </Suspense>
  );
}