// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { ChevronRight } from "lucide-react";

// const tabs = ["All", "Cricket", "Football"];

// type CardItem = {
//   id: number;
//   title: string;
//   subtitle: string;
//   image: string;
//   url: string;
// };

// type QuickLink = {
//   label: string;
//   icon: string;
//   badge: string | null;
//   badgeColor: string;
//   href: string;
// };

// const quickLinks: QuickLink[] = [
//   { label: "Match Centre", icon: "🏟️", badge: "LIVE", badgeColor: "bg-red-500", href: "/MainModules/Matchcenter" },
//   { label: "Predictions", icon: "🎯", badge: "New", badgeColor: "bg-orange-500", href: "/MainModules/Predictions" },
//   { label: "Community Groups", icon: "👥", badge: null, badgeColor: "", href: "/MainModules/CommunityGroups" },
//   { label: "Fan Battle", icon: "⚔️", badge: null, badgeColor: "", href: "/MainModules/FanBattle" },
// ];

// const cards: CardItem[] = [
//   {
//     id: 1,
//     title: "IPL T20 2026 360World",
//     subtitle: "Exclusive content from all 10 teams",
//     image: "/images/ipl360.jpg",
//     url: "/MainModules/MatchesDropContent",
//   },
//   {
//     id: 2,
//     title: "FIFA World Cup 2026",
//     subtitle: "The world's biggest football tournament",
//     image: "/images/fifa2026.png",
//     url: "/MainModules/MatchesDropContent?team=FIFA",
//   },
//   {
//     id: 3,
//     title: "Women's T20 2026",
//     subtitle: "Exclusive coverage of women's cricket",
//     image: "/images/womens_t20.jpg",
//     url: "/MainModules/MatchesDropContent?team=Women%20T20",
//   },
//   {
//     id: 4,
//     title: "SportsFan360",
//     subtitle: "Your ultimate sports companion",
//     image: "/images/sportsfan360.jpeg",
//     url: "/MainModules/CricketArticles",
//   },
//   {
//     id: 5,
//     title: "My Playlists",
//     subtitle: "All your favorite sports content in one place",
//     image: "/images/cricketarticlessecond.jpg",
//     url: "/MainModules/Playlists",
//   },
// ];

// export default function NewHomePage() {
//   const [activeTab, setActiveTab] = useState("All");

//   return (
//     <div className="bg-black text-white">
//       <div className="max-w-6xl mx-auto px-0.5 pb-6 pt-5">

//         {/* Tab Bar */}
//         <div className="flex gap-2 overflow-x-auto pb-2 mb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
//           {tabs.map((tab) => (
//             <button
//               key={tab}
//               onClick={() => setActiveTab(tab)}
//               className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${activeTab === tab
//                   ? "bg-[#7a2000] text-white"
//                   : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
//                 }`}
//             >
//               {tab}
//             </button>
//           ))}
//         </div>

//         {/* Cards Row */}
//         <div className="flex gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory">
//           {cards.map((card, index) => (
//             <Link
//               key={card.id}
//               href={card.url}
//               className="snap-start flex-shrink-0 w-[calc(100%-24px)] lg:w-[260px]"
//             >
//               <div className="relative bg-[#111] rounded-2xl overflow-hidden hover:scale-[1.01] transition-transform duration-200">
//                 <div className="relative w-full h-[190px] lg:h-[165px]">
//                   <Image
//                     src={card.image}
//                     alt={card.title}
//                     fill
//                     className="object-cover"
//                   />
//                   {/* Gradient overlay */}
//                   <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

//                   {/* Arrow icon — mobile only, top right */}
//                   <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center lg:hidden">
//                     <ChevronRight size={16} className="text-white" />
//                   </div>

//                   {/* Card counter — mobile only, top left */}
//                   <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm rounded-full px-2 py-0.5 lg:hidden">
//                     <span className="text-white text-[10px] font-semibold">{index + 1}/{cards.length}</span>
//                   </div>

//                   {/* Text */}
//                   <div className="absolute bottom-0 left-0 right-0 p-4">
//                     <h2 className="text-[15px] lg:text-[16px] font-bold leading-tight">{card.title}</h2>
//                     <p className="text-[11px] text-gray-300 mt-1">{card.subtitle}</p>
//                   </div>
//                 </div>
//               </div>
//             </Link>
//           ))}
//         </div>

//         {/* Quick Links Row — swipeable on mobile, grid on desktop */}
//         <div className="flex gap-3 overflow-x-auto mt-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-4 lg:overflow-visible">
//           {quickLinks.map((link) => (
//             <Link key={link.label} href={link.href} className="flex-shrink-0 lg:flex-shrink block">
//               <div className="relative bg-[#1a0800] border border-[#2e1200] rounded-2xl flex flex-col items-center justify-center gap-2 lg:gap-3 hover:bg-[#261000] transition-colors cursor-pointer w-[120px] h-[105px] lg:w-full lg:h-[110px] lg:p-5">
//                 {link.badge && (
//                   <span className={`absolute -top-2 left-1/2 -translate-x-1/2 ${link.badgeColor} text-white text-[9px] lg:text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap`}>
//                     {link.badge}
//                   </span>
//                 )}
//                 <span className="text-3xl lg:text-3xl">{link.icon}</span>
//                 <span className="text-white text-[11px] lg:text-[12px] font-semibold text-center leading-tight px-1">
//                   {link.label}
//                 </span>
//               </div>
//             </Link>
//           ))}
//         </div>

//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

const tabs = ["All", "Cricket", "Football"];

type CardItem = {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  dropsUrl: string;
  matchCenterUrl: string;
  sport: string;
  buttonBg: string;
  iconType: "football" | "cricket";
  url?: string;
};

type QuickLink = {
  label: string;
  icon: string;
  badge: string | null;
  badgeColor: string;
  href: string;
};

const quickLinks: QuickLink[] = [
  { label: "Match Centre", icon: "🏟️", badge: "LIVE", badgeColor: "bg-red-500", href: "/MainModules/Matchcenter" },
  { label: "Polls & Predictions",      icon: "🎯", badge: "New",  badgeColor: "bg-orange-500", href: "/MainModules/PollCards" },
  { label: "Community Groups", icon: "👥", badge: null, badgeColor: "", href: "/MainModules/Chat" },
  { label: "Fan Battle", icon: "⚔️", badge: null, badgeColor: "", href: "/MainModules/Fantasy" },
];

const cards: CardItem[] = [
  {
    id: 1,
    title: "FIFA World Cup 2026",
    subtitle: "The world's biggest football tournament",
    image: "/images/fifa2026.png",

    dropsUrl: "/MainModules/MatchesDropContent?team=FIFA",
    matchCenterUrl: "/MainModules/FIFAWorldCup/Standings",

    sport: "football",
    buttonBg: "bg-[#041E53]",
    iconType: "football",
  },

  {
    id: 2,
    title: "Women's T20 2026",
    subtitle: "Exclusive coverage of women's cricket",
    image: "/images/womens_t20.jpg",

    dropsUrl: "/MainModules/MatchesDropContent?team=Women%20T20",
    matchCenterUrl: "/MainModules/WomensT20/Matchcenter",

    sport: "cricket",
    buttonBg: "bg-[#5D287F]",
    iconType: "cricket",
  },
];

export default function NewHomePage({ sportFilter }: { sportFilter?: string }) {
  const [activeTab, setActiveTab] = useState("All");
  const [activeCard, setActiveCard] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredCards = sportFilter
    ? cards.filter((card) => card.sport.toLowerCase() === sportFilter.toLowerCase())
    : cards;

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.clientWidth - 24; // matches w-[calc(100%-24px)]
    const index = Math.round(el.scrollLeft / (cardWidth + 12)); // 12 = gap-3
    setActiveCard(Math.min(index, filteredCards.length - 1));
  };

  if (filteredCards.length === 0) return null;

  return (
    <div className="bg-black text-white">
      <div className="max-w-8xl mx-auto px-0.5 pt-5">

        {/* Tab Bar */}
        {/* <div className="flex gap-2 overflow-x-auto pb-2 mb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                activeTab === tab
                  ? "bg-[#7a2000] text-white"
                  : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div> */}

        
        {/* Cards Row */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory"
        >
          {filteredCards.map((card) => (
            <div
              key={card.id}
              className="snap-start flex-shrink-0 w-[calc(100%-24px)] lg:w-[260px]"
            >
              <div className="relative bg-[#111] rounded-2xl overflow-hidden hover:scale-[1.01] transition-transform duration-200 h-[280px] lg:h-[260px] group">
                
                {/* 1. Main Card Link (Audio Drops) - Covers the entire background */}
                <Link href={card.dropsUrl} className="absolute inset-0 z-0 block">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    className="object-cover"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                </Link>

                {/* 2. Content Overlay (Text + Button) */}
                {/* pointer-events-none ensures clicks on the text fall through to the drops link */}
                <div className="absolute inset-0 z-10 p-4 flex flex-col justify-end pointer-events-none">
                  <div className="mb-4">
                    <h2 className="text-[15px] lg:text-[17px] font-bold leading-tight text-white">{card.title}</h2>
                    <p className="text-[11px] text-gray-300 mt-1">
                      {card.subtitle}
                    </p>
                  </div>

                  {/* Match Center Button */}
                  {/* pointer-events-auto makes ONLY the button clickable for its specific route */}
                  <Link href={card.matchCenterUrl} className="pointer-events-auto block w-full">
                    <div
                      className={`w-full flex items-center justify-center gap-3 py-3 rounded-xl font-semibold text-white shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-all duration-300 hover:scale-[1.02] ${card.buttonBg}`}
                    >
                      {card.iconType === "football" ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <polygon points="12 6 15 8.5 14 12 10 12 9 8.5 12 6" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="12" r="9" />
                          <path d="M7 7c3 2 7 8 10 10" />
                          <path d="M17 7c-3 2-7 8-10 10" />
                        </svg>
                      )}

                      <span className="text-[17px] font-bold tracking-wide">
                        Match Center
                      </span>
                      <span className="text-lg">→</span>
                    </div>
                  </Link>
                </div>
                
              </div>
            </div>
          ))}
        </div>

        {/* Dot indicators — mobile only */}
        {filteredCards.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-3 lg:hidden">
            {filteredCards.map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-300 ${i === activeCard
                  ? "w-5 h-2 bg-[#C9115F]"
                  : "w-2 h-2 bg-neutral-600"
                  }`}
              />
            ))}
          </div>
        )}

        {/* Quick Links Row — swipeable on mobile, grid on desktop */}
        {/* <div className="flex gap-3 overflow-x-auto mt-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0">
          {quickLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="flex-shrink-0 lg:flex-shrink-[unset] block pt-3"
            >
              <div className="relative bg-[#5C250A] border border-orange-200 rounded-2xl flex flex-col items-center justify-center gap-2 lg:gap-3 hover:bg-[#261000] transition-colors cursor-pointer w-[120px] h-[105px] lg:w-full lg:h-[110px] lg:p-5">
                {link.badge && (
                  <span className={`absolute -top-3 left-1/2 -translate-x-1/2 ${link.badgeColor} text-white text-[9px] lg:text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap z-10`}>
                    {link.badge}
                  </span>
                )}
                <span className="text-3xl">{link.icon}</span>
                <span className="text-white text-[11px] lg:text-[12px] font-semibold text-center leading-tight px-2">
                  {link.label}
                </span>
              </div>
            </Link>
          ))}
        </div> */}


        {/* <div className="flex flex-row gap-3 mt-2 md:mt-6 w-full">
          <Link href="/MainModules/WatchAlong" className="flex-1">
            
            <div className="flex-1 bg-[#3C0922] rounded-2xl p-3 sm:p-4 flex flex-col justify-between min-h-[150px] sm:min-h-[120px]">
              
              <div className="flex items-center justify-between">
                <span className="bg-[#3D2B3E] text-white text-[10px] sm:text-xs font-medium px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full">
                  Watch Along
                </span>
                <button className="bg-[#3D2B3E] hover:bg-[#4D3B4E] text-white rounded-full w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </button>
              </div>

              
              <div className="mt-3 sm:mt-4">
                <h3 className="text-white font-bold text-sm sm:text-lg leading-tight">Live Fan Rooms</h3>
                <p className="text-gray-400 text-[10px] sm:text-sm mt-0.5">Join now</p>
              </div>

              
              <div className="flex items-center justify-between mt-3 sm:mt-4">
                <span className="text-gray-400 text-[10px] sm:text-sm font-medium">2.4K watching</span>
                <button className="bg-[#3D2B3E] hover:bg-[#4D3B4E] text-white rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            </div>
          </Link>

          
            <Link href="/MainModules/ROAR" className="flex-1">
          <div className="flex-1 bg-[#230855] rounded-2xl p-3 sm:p-4 flex flex-col justify-between min-h-[150px] sm:min-h-[120px]">
          
              
              <div className="flex items-center justify-between">
                <span className="bg-[#3D2B3E] text-white text-[10px] sm:text-xs font-medium px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-full">
                  ROAR
                </span>
                <button className="bg-[#3D2B3E] hover:bg-[#4D3B4E] text-white rounded-full w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    <polyline points="17 6 23 6 23 12" />
                  </svg>
                </button>
              </div>

              
              <div className="mt-3 sm:mt-4">
                <h3 className="text-white font-bold text-sm sm:text-lg leading-tight">New prediction</h3>
                <p className="text-gray-400 text-[10px] sm:text-sm mt-0.5">Hot Takes</p>
              </div>

              
              <div className="flex items-center justify-between mt-3 sm:mt-4">
                <span className="text-gray-400 text-[10px] sm:text-sm font-medium">156K active</span>
                <button className="bg-[#3D2B3E] hover:bg-[#4D3B4E] text-white rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
          </div>
          </Link>

        </div> */}

      </div>
    </div>
  );
}
