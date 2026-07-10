


// "use client";

// import axios from "axios";
// import {
//   createContext,
//   useContext,
//   useState,
//   ReactNode,
// } from "react";

// // === PROFILE TYPES ===
// type PlayerProfile = {
//   id: string;
//   name: string;
//   team: string;
//   battingStyle: string;
//   bowlingStyle: string;
//   about: string;
//   avatar: string;
//   stats: {
//     runs: string;
//     sr: string;
//     avg: string;
//   };
//   overview: {
//     iplDebut: string;
//     specialization: string;
//     dob: string;
//     matches: string;
//   };
//   createdAt: number;
//   updatedAt: number;
// };

// // === HOME CARD TYPES ===
// type CatLogo = {
//   label: string;
//   logo: string;
// };

// type Category = {
//   title: string;
//   image: string;
// };

// type HomeItem = {
//   id: string;
//   playerProfilesId: string;
//   playerName: string;
//   hasVideo: boolean;
//   createdAt: number;
//   shares: number;
//   image: string;
//   comments: number;
//   catlogo: CatLogo[];
//   logo: string;
//   title: string;
//   category: Category[];
//   live: number;
//   likes: number;
//   updatedAt: number;
// };

// // === SEASON STATS TYPES ===
// type SeasonStats = {
//   fiftiesAndHundreds: string;
//   threeW_fiveW_Hauls: number;
//   year: string;
//   runs: string;
//   strikeRate: string;
//   average: string;
//   fifties: number;
//   hundreds: number;
//   highestScore: string;
//   fours: number;
//   sixes: number;
//   award: string;
//   awardSub: string;
//   wickets: number;
//   deliveries: number;
//   bowlingAvg: string;
//   bowlingSR: string;
//   economy: string;
//   bestBowling: string;
//   threeWicketHauls: number;
//   fiveWicketHauls: number;
//   foursConceded: number;
//   sixesConceded: number;
// };

// type SeasonData = {
//   id: string;
//   playerProfilesId: string;
//   season: SeasonStats;
//   createdAt: number;
//   updatedAt: number;
// };

// // === INSIGHTS TYPES ===
// type Insight = {
//   title: string;
//   description: string;
// };

// type InsightsData = {
//   id: string;
//   playerProfilesId: string;
//   insights: Insight[];
//   strengths: string[];
//   createdAt: number;
//   updatedAt: number;
// };

// // === MEDIA TYPES ===
// type MediaItem = {
//   title: string;
//   views: string;
//   time: string;
//   thumbnail: string;
// };

// type MediaData = {
//   id: string;
//   playerProfileId: string;
//   mediaItems: MediaItem[];
//   createdAt: number;
//   updatedAt: number;
// };

// // === MAIN API RESPONSE TYPES ===
// type Player360Data = {
//   profile: PlayerProfile;
//   home: HomeItem[];
//   season: SeasonData;
//   insights: InsightsData;
//   media: MediaData;
// };

// type PlayerHomeData = {
//   home: HomeItem[];
// };

// type ApiResponse = {
//   success: boolean;
//   data: Player360Data;
// };

// type HomeApiResponse = {
//   success: boolean;
//   posts: HomeItem[];
// };

// type ContextType = {
//   data: Player360Data | null;
//   homeData: PlayerHomeData | null;
//   loading: boolean;
//   fetchPlayer360: (id: string) => Promise<void>;
//   fetchPlayerHome: () => Promise<void>;
//   setPlayer360Data: (data: Partial<Player360Data>) => void;
// };

// const PlayerProfile360Context = createContext<ContextType | undefined>(
//   undefined
// );

// export function PlayerProfile360Provider({
//   children,
// }: {
//   children: ReactNode;
// }) {
//   const [data, setData] = useState<Player360Data | null>(null);
//   const [homeData, setHomeData] = useState<PlayerHomeData | null>(null);
//   const [loading, setLoading] = useState(false);

//   // FULL 360 API
//   const fetchPlayer360 = async (id: string) => {
//     try {
//       setLoading(true);

//       const res = await axios.get<ApiResponse>(
//         `/api/player-profile/search/${id}`
//       );

//       console.log("player360 data:", res.data);
//       if (res.data.success) {
//         setData(res.data.data);
//       }
//     } catch (error) {
//       console.error("Failed to fetch player360 data", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // HOME CARDS API
//   // const fetchPlayerHome = async () => {
//   //   try {
//   //     setLoading(true);

//   //     const res = await axios.get<HomeApiResponse>(
//   //       `/api/player-profile/home`
//   //     );
//   //     console.log("player home data:", res.data);

//   //     if (res.data.success) {
//   //       setHomeData({
//   //         home: res.data.posts,
//   //       });
//   //     }
//   //   } catch (error) {
//   //     console.error("Failed to fetch player home data", error);
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };


//   const fetchPlayerHome = async (searchTerm?: string, reset: boolean = true) => {
//   try {
//     setLoading(true);

//     let url = `/api/player-profile/home?limit=20`;
    
//     // Add search parameter if provided
//     if (searchTerm && searchTerm.trim()) {
//       url += `&search=${encodeURIComponent(searchTerm.trim().toLowerCase())}`;
//     }
    
//     // Add cursor for pagination (if not resetting)
//     if (!reset && homeData?.nextCursor) {
//       url += `&lastDocId=${homeData.nextCursor.lastDocId}&lastDocCreatedAt=${homeData.nextCursor.lastDocCreatedAt}`;
//     }

//     const res = await axios.get<HomeApiResponse>(url);
//     console.log("player home data:", res.data);

//     if (res.data.success) {
//       if (reset) {
//         // Reset: replace existing posts
//         setHomeData({
//           home: res.data.posts,
//           hasMore: res.data.pagination?.hasMore,
//           nextCursor: res.data.pagination?.nextCursor,
//         });
//       } else {
//         // Load more: append to existing posts
//         setHomeData((prev) => ({
//           home: [...(prev?.home || []), ...res.data.posts],
//           hasMore: res.data.pagination?.hasMore,
//           nextCursor: res.data.pagination?.nextCursor,
//         }));
//       }
//     }
//   } catch (error) {
//     console.error("Failed to fetch player home data", error);
//   } finally {
//     setLoading(false);
//   }
// };

//   const setPlayer360Data = (updated: Partial<Player360Data>) => {
//     setData((prev) =>
//       prev
//         ? {
//             ...prev,
//             ...updated,
//           }
//         : null
//     );
//   };

//   return (
//     <PlayerProfile360Context.Provider
//       value={{
//         data,
//         homeData,
//         loading,
//         fetchPlayer360,
//         fetchPlayerHome,
//         setPlayer360Data,
//       }}
//     >
//       {children}
//     </PlayerProfile360Context.Provider>
//   );
// }

// export function usePlayerProfile360() {
//   const context = useContext(PlayerProfile360Context);

//   if (!context) {
//     throw new Error(
//       "usePlayerProfile360 must be used inside PlayerProfile360Provider"
//     );
//   }

//   return context;
// }












"use client";

import axios from "axios";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

// === PROFILE TYPES ===
type PlayerProfile = {
  id: string;
  name: string;
  team: string;
  battingStyle: string;
  bowlingStyle: string;
  about: string;
  avatar: string;
  stats: {
    runs: string;
    sr: string;
    avg: string;
  };
  overview: {
    iplDebut: string;
    specialization: string;
    dob: string;
    matches: string;
  };
  createdAt: number;
  updatedAt: number;
};

// === HOME CARD TYPES ===
type CatLogo = {
  label: string;
  logo: string;
};

type Category = {
  title: string;
  image: string;
};

type HomeItem = {
  id: string;
  playerProfilesId: string;
  playerName: string;
  hasVideo: boolean;
  createdAt: number;
  shares: number;
  image: string;
  comments: number;
  catlogo: CatLogo[];
  logo: string;
  title: string;
  category: Category[];
  live: number;
  likes: number;
  updatedAt: number;
};



// === SEASON STATS TYPES ===
type SeasonStats = {
  fiftiesAndHundreds: string;
  threeW_fiveW_Hauls: number;
  year: string;
  runs: string;
  strikeRate: string;
  average: string;
  fifties: number;
  hundreds: number;
  highestScore: string;
  fours: number;
  sixes: number;
  award: string;
  awardSub: string;
  wickets: number;
  deliveries: number;
  bowlingAvg: string;
  bowlingSR: string;
  economy: string;
  bestBowling: string;
  threeWicketHauls: number;
  fiveWicketHauls: number;
  foursConceded: number;
  sixesConceded: number;
};

type SeasonData = {
  id: string;
  playerProfilesId: string;
  season: SeasonStats;
  createdAt: number;
  updatedAt: number;
};

// === INSIGHTS TYPES ===
type Insight = {
  title: string;
  description: string;
};

type InsightsData = {
  id: string;
  playerProfilesId: string;
  insights: Insight[];
  strengths: string[];
  createdAt: number;
  updatedAt: number;
};

// === MEDIA TYPES ===
type MediaItem = {
  title: string;
  views: string;
  time: string;
  thumbnail: string;
};

type MediaData = {
  id: string;
  playerProfileId: string;
  mediaItems: MediaItem[];
  createdAt: number;
  updatedAt: number;
};

// === MAIN API RESPONSE TYPES ===
type Player360Data = {
  profile: PlayerProfile;
  home: HomeItem[];
  season: SeasonData;
  insights: InsightsData;
  media: MediaData;
};

type PlayerHomeData = {
  home: HomeItem[];
  hasMore?: boolean;
  nextCursor?: {
    lastDocId: string;
    lastDocCreatedAt: number;
  } | null;
};

type ApiResponse = {
  success: boolean;
  data: Player360Data;
};

type HomeApiResponse = {
  success: boolean;
  posts: HomeItem[];
  pagination?: {
    limit: number;
    hasMore: boolean;
    nextCursor: {
      lastDocId: string;
      lastDocCreatedAt: number;
    } | null;
  };
};

type ContextType = {
  data: Player360Data | null;
  homeData: PlayerHomeData | null;
  loading: boolean;
  fetchPlayer360: (id: string) => Promise<void>;
  fetchPlayerHome: (searchTerm?: string, reset?: boolean) => Promise<void>;
  setPlayer360Data: (data: Partial<Player360Data>) => void;
};

const PlayerProfile360Context = createContext<ContextType | undefined>(
  undefined
);

export function PlayerProfile360Provider({
  children,
}: {
  children: ReactNode;
}) {
  const [data, setData] = useState<Player360Data | null>(null);
  const [homeData, setHomeData] = useState<PlayerHomeData | null>(null);
  const [loading, setLoading] = useState(false);

  // FULL 360 API
  const fetchPlayer360 = async (id: string) => {
    try {
      setLoading(true);

      const res = await axios.get<ApiResponse>(
        `/api/player-profile/search/${id}`
      );

      console.log("player360 data:", res.data);
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch player360 data", error);
    } finally {
      setLoading(false);
    }
  };

  // HOME CARDS API with search and pagination
  const fetchPlayerHome = async (searchTerm?: string, reset: boolean = true) => {
    try {
      setLoading(true);

      let url = `/api/player-profile/home?limit=20`;
      
      // Add search parameter if provided
      if (searchTerm && searchTerm.trim()) {
        url += `&search=${encodeURIComponent(searchTerm.trim().toLowerCase())}`;
      }
      
      // Add cursor for pagination (if not resetting and cursor exists)
      if (!reset && homeData?.nextCursor) {
        url += `&lastDocId=${homeData.nextCursor.lastDocId}&lastDocCreatedAt=${homeData.nextCursor.lastDocCreatedAt}`;
      }

      const res = await axios.get<HomeApiResponse>(url);
      console.log("player home data:", res.data);

      if (res.data.success) {
        const newPosts = res.data.posts;
        const pagination = res.data.pagination;
        
        if (reset) {
          // Reset: replace existing posts
          setHomeData({
            home: newPosts,
            hasMore: pagination?.hasMore || false,
            nextCursor: pagination?.nextCursor || null,
          });
        } else {
          // Load more: append to existing posts
          setHomeData((prev) => ({
            home: [...(prev?.home || []), ...newPosts],
            hasMore: pagination?.hasMore || false,
            nextCursor: pagination?.nextCursor || null,
          }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch player home data", error);
    } finally {
      setLoading(false);
    }
  };

  const setPlayer360Data = (updated: Partial<Player360Data>) => {
    setData((prev) =>
      prev
        ? {
            ...prev,
            ...updated,
          }
        : null
    );
  };

  return (
    <PlayerProfile360Context.Provider
      value={{
        data,
        homeData,
        loading,
        fetchPlayer360,
        fetchPlayerHome,
        setPlayer360Data,
      }}
    >
      {children}
    </PlayerProfile360Context.Provider>
  );
}

export function usePlayerProfile360() {
  const context = useContext(PlayerProfile360Context);

  if (!context) {
    throw new Error(
      "usePlayerProfile360 must be used inside PlayerProfile360Provider"
    );
  }

  return context;
}