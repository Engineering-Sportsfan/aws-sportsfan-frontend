// "use client";

// import Image from "next/image";
// import React, { useEffect, useMemo, useState } from "react";
// import axios from "axios";
// import { useAuth } from "@/context/AuthContext";

// type BattlePlayer = {
//   id: string;
//   name: string;
//   team: string;
//   role: string;
//   image?: string;
// };

// type BattleClub = {
//   id: string;
//   name: string;
//   team: string;
//   city: string;
//   avatar?: string;
//   overview?: {
//     captain: string;
//     coach: string;
//     owner: string;
//     venue: string;
//   };
//   stats?: {
//     runs: string;
//     sr: string;
//     avg: string;
//   };
// };

// interface CreateBattleProps {
//   onClose: () => void;
//   players?: BattlePlayer[];
//   clubs?: BattleClub[];
// }

// type ApiPlayerItem = {
//   playerProfilesId?: string;
//   id?: string;
//   playerName?: string;
//   profile?: { name?: string; team?: string; role?: string };
//   player?: { name?: string };
//   name?: string;
//   title?: string;
//   team?: string;
//   logo?: string;
//   role?: string;
// };

// type ApiClubItem = {
//   id: string;
//   name: string;
//   team: string;
//   battingStyle?: string;
//   bowlingStyle?: string;
//   about?: string;
//   avatar?: string;
//   overview?: {
//     captain: string;
//     coach: string;
//     owner: string;
//     venue: string;
//   };
//   stats?: {
//     runs: string;
//     sr: string;
//     avg: string;
//   };
// };

// const fallbackPlayers: BattlePlayer[] = [
//   { id: "p1", name: "Rohit Sharma", team: "MI", role: "Batter" },
//   { id: "p2", name: "Suryakumar Yadav", team: "MI", role: "Batter" },
//   { id: "p3", name: "Jasprit Bumrah", team: "MI", role: "Bowler" },
//   { id: "p4", name: "Hardik Pandya", team: "MI", role: "All-rounder" },
//   { id: "p5", name: "Virat Kohli", team: "RCB", role: "Batter" },
//   { id: "p6", name: "MS Dhoni", team: "CSK", role: "Wicketkeeper" },
// ];

// const fallbackClubs: BattleClub[] = [
//   { id: "1", name: "Mumbai Indians", team: "MI", city: "Mumbai" },
//   { id: "2", name: "Chennai Super Kings", team: "CSK", city: "Chennai" },
//   { id: "3", name: "Royal Challengers Bengaluru", team: "RCB", city: "Bengaluru" },
//   { id: "4", name: "Kolkata Knight Riders", team: "KKR", city: "Kolkata" },
//   { id: "5", name: "Delhi Capitals", team: "DC", city: "Delhi" },
// ];

// const MAX_PLAYERS = 5;
// const MAX_CLUBS = 5;
// const MAX_DISPLAYED_PLAYERS = 5;
// const MAX_DISPLAYED_CLUBS = 10;

// const normalizeText = (value: string) =>
//   value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

// const scoreClubMatch = (name: string, city: string, query: string) => {
//   const normalizedName = normalizeText(name);
//   const normalizedCity = normalizeText(city);
//   const normalizedQuery = normalizeText(query);
//   if (!normalizedQuery) return 0;
//   if (normalizedName === normalizedQuery) return 0;
//   if (normalizedName.startsWith(normalizedQuery)) return 1;
//   if (normalizedName.includes(normalizedQuery)) return 2 + normalizedName.indexOf(normalizedQuery) / 100;
//   if (normalizedCity === normalizedQuery) return 5;
//   if (normalizedCity.startsWith(normalizedQuery)) return 6;
//   if (normalizedCity.includes(normalizedQuery)) return 7 + normalizedCity.indexOf(normalizedQuery) / 100;
//   return Number.POSITIVE_INFINITY;
// };

// const scorePlayerMatch = (name: string, query: string) => {
//   const normalizedName = normalizeText(name);
//   const normalizedQuery = normalizeText(query);
//   if (!normalizedQuery) return 0;
//   if (normalizedName === normalizedQuery) return 0;
//   if (normalizedName.startsWith(normalizedQuery)) return 1;
//   const words = normalizedName.split(" ");
//   if (words.some((word) => word.startsWith(normalizedQuery))) return 2;
//   const containsIndex = normalizedName.indexOf(normalizedQuery);
//   if (containsIndex >= 0) return 3 + containsIndex / 100;
//   return Number.POSITIVE_INFINITY;
// };

// const nameFromEmail = (email: string): string => {
//   const local = email.split("@")[0] ?? email;
//   return local.replace(/[._\-+]/g, " ").replace(/\s+/g, " ").trim();
// };

// const PlayersIcon = () => (
//   <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
//     <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
//   </svg>
// );

// const ClubsIcon = () => (
//   <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
//     <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
//   </svg>
// );

// const CloseIcon = () => (
//   <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
//     <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
//   </svg>
// );

// const PlusIcon = () => (
//   <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
//     <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
//   </svg>
// );

// const CreateBattle: React.FC<CreateBattleProps> = ({ onClose, players, clubs }) => {
//   const { user, getUserName } = useAuth();

//   const [playerData, setPlayerData] = useState<BattlePlayer[]>(fallbackPlayers);
//   const [clubData, setClubData] = useState<BattleClub[]>(fallbackClubs);
//   const [loading, setLoading] = useState(true);

//   const [battleName, setBattleName] = useState("");
//   const [battleType, setBattleType] = useState<"players" | "clubs">("players");
//   const [playerSearch, setPlayerSearch] = useState("");
//   const [clubSearch, setClubSearch] = useState("");
//   const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
//   const [selectedClubs, setSelectedClubs] = useState<string[]>([]);
//   const [submitting, setSubmitting] = useState(false);
//   const [submitError, setSubmitError] = useState<string | null>(null);

//   // Invite state
//   const [inviteInput, setInviteInput] = useState("");
//   const [invitedFriends, setInvitedFriends] = useState<{ email: string; name: string }[]>([]);
//   const [emailSuggestions, setEmailSuggestions] = useState<string[]>([]);
//   const [showSuggestions, setShowSuggestions] = useState(false);

//   const existingEmails = [
//     "john@example.com",
//     "jane@example.com",
//     "mike@example.com",
//     "sarah@example.com",
//     "david@example.com",
//     "emma@example.com",
//     "alex@example.com",
//     "rachel@example.com",
//     "chris@example.com",
//     "lisa@example.com",
//   ];

//   // Fetch players and clubs data
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);

//         // Fetch players
//         try {
//           const ppRes = await axios.get<{ posts?: ApiPlayerItem[]; data?: ApiPlayerItem[] }>(
//             "/api/player-profile/home",
//             { params: { limit: 250 } }
//           );
//           const posts = ppRes.data.posts || ppRes.data.data || [];
//           const mappedPlayers = posts.map((p, idx) => ({
//             id: p.playerProfilesId || p.id || `pp_${idx}`,
//             name: p.playerName || p.profile?.name || p.player?.name || p.name || p.title || "Unknown",
//             team: p.team || p.logo || p.profile?.team || "",
//             role: p.role || p.profile?.role || "",
//           }));
//           setPlayerData(mappedPlayers.length ? mappedPlayers : (players?.length ? players : fallbackPlayers));
//         } catch {
//           setPlayerData(players?.length ? players : fallbackPlayers);
//         }

//         // Fetch clubs from API
//         try {
//           const clubRes = await axios.get<{ success: boolean; profiles: ApiClubItem[] }>(
//             "/api/club-profile"
//           );
//           if (clubRes.data.success && clubRes.data.profiles) {
//             const mappedClubs = clubRes.data.profiles.map((club) => ({
//               id: club.id,
//               name: club.name,
//               team: club.team,
//               city: club.overview?.venue || club.team || "",
//               avatar: club.avatar,
//               overview: club.overview,
//               stats: club.stats,
//             }));
//             setClubData(mappedClubs.length ? mappedClubs : (clubs?.length ? clubs : fallbackClubs));
//           } else {
//             setClubData(clubs?.length ? clubs : fallbackClubs);
//           }
//         } catch (err) {
//           console.error("Error fetching club profiles:", err);
//           setClubData(clubs?.length ? clubs : fallbackClubs);
//         }
//       } catch (error) {
//         console.error("Error fetching battle data:", error);
//         setPlayerData(players?.length ? players : fallbackPlayers);
//         setClubData(clubs?.length ? clubs : fallbackClubs);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [players, clubs]);

//   const filteredPlayers = useMemo(() => {
//     const q = playerSearch.trim();
//     const matches = q
//       ? playerData
//           .map((player) => ({ player, score: scorePlayerMatch(player.name || "", q) }))
//           .filter(({ score }) => Number.isFinite(score))
//           .sort((a, b) => (a.score !== b.score ? a.score - b.score : a.player.name.localeCompare(b.player.name)))
//           .map(({ player }) => player)
//       : playerData;
//     return matches.slice(0, MAX_DISPLAYED_PLAYERS);
//   }, [playerData, playerSearch]);

//   const filteredClubs = useMemo(() => {
//     const q = clubSearch.trim();
//     const matches = q
//       ? clubData
//           .map((club) => ({ club, score: scoreClubMatch(club.name, club.city, q) }))
//           .filter(({ score }) => Number.isFinite(score))
//           .sort((a, b) => (a.score !== b.score ? a.score - b.score : a.club.name.localeCompare(b.club.name)))
//           .map(({ club }) => club)
//       : clubData;
//     return matches.slice(0, MAX_DISPLAYED_CLUBS);
//   }, [clubData, clubSearch]);

//   const togglePlayer = (playerId: string) => {
//     setSelectedPlayers((current) => {
//       if (current.includes(playerId)) return current.filter((id) => id !== playerId);
//       if (current.length >= MAX_PLAYERS) return current;
//       return [...current, playerId];
//     });
//   };

//   const toggleClub = (clubId: string) => {
//     setSelectedClubs((current) => {
//       if (current.includes(clubId)) return current.filter((id) => id !== clubId);
//       if (current.length >= MAX_CLUBS) return current;
//       return [...current, clubId];
//     });
//   };

//   const currentPlayers = playerData.filter((p) => selectedPlayers.includes(p.id));
//   const currentClubs = clubData.filter((c) => selectedClubs.includes(c.id));
//   const selectedItems = battleType === "players" ? currentPlayers : currentClubs;
//   const selectedCount = battleType === "players" ? selectedPlayers.length : selectedClubs.length;
//   const maxCount = battleType === "players" ? MAX_PLAYERS : MAX_CLUBS;

//   const handleInviteInputChange = (value: string) => {
//     setInviteInput(value);
//     if (value.trim()) {
//       const lastEmail = value.split(",").pop()?.trim() || "";
//       const filtered = existingEmails.filter(
//         (email) =>
//           email.toLowerCase().includes(lastEmail.toLowerCase()) && 
//           !invitedFriends.some(f => f.email === email)
//       );
//       setEmailSuggestions(filtered.slice(0, 5));
//       setShowSuggestions(filtered.length > 0);
//     } else {
//       setEmailSuggestions([]);
//       setShowSuggestions(false);
//     }
//   };

//   const addEmail = (email: string) => {
//     const trimmedEmail = email.trim();
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
//     if (!emailRegex.test(trimmedEmail)) { 
//       alert("Please enter a valid email address"); 
//       return; 
//     }
    
//     if (invitedFriends.some(f => f.email === trimmedEmail)) { 
//       alert("Email already added"); 
//       return; 
//     }
    
//     setInvitedFriends([...invitedFriends, { 
//       email: trimmedEmail, 
//       name: nameFromEmail(trimmedEmail) 
//     }]);
//     setInviteInput("");
//     setEmailSuggestions([]);
//     setShowSuggestions(false);
//   };

//   const removeEmail = (email: string) => {
//     setInvitedFriends(invitedFriends.filter(f => f.email !== email));
//   };

//   const handleInviteKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === "Enter" || e.key === ",") {
//       e.preventDefault();
//       const email = inviteInput.split(",").pop()?.trim();
//       if (email) addEmail(email);
//     }
//   };

//   const handleCreate = async () => {
//     setSubmitError(null);

//     if (!battleName.trim()) { alert("Please enter a battle name"); return; }
//     if (selectedCount === 0) { alert("Please select at least one item"); return; }

//     const userId = user?.userId;
//     const userName = getUserName() || user?.email || "Guest";

//     if (!userId) {
//       alert("You must be logged in to create a battle.");
//       return;
//     }

//     const apiBattleType = battleType === "players" ? "PLAYERS" : "CLUBS";

//     const payload = {
//       battleName: battleName.trim(),
//       battleType: apiBattleType,
//       ...(apiBattleType === "PLAYERS"
//         ? { selectedPlayers }
//         : { selectedClubs }),
//       invitedFriends,
//       userId,
//       userName,
//     };

//     console.log("Sending payload:", payload);

//     setSubmitting(true);
//     try {
//       await axios.post("/api/battle", payload);
//       onClose();
//     } catch (err: unknown) {
//       if (axios.isAxiosError(err)) {
//         const message = err.response?.data?.error || "Failed to create battle";
//         setSubmitError(message);
//         alert(message);
//       } else {
//         console.error(err);
//         setSubmitError("Failed to create battle");
//         alert("Failed to create battle");
//       }
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="min-h-screen w-full bg-[#07070f] flex items-start justify-center py-6 px-4">
//       <div
//         className="w-full max-w-sm flex flex-col rounded-2xl bg-[#1a1a1e] text-white shadow-2xl border border-white/10"
//         style={{ maxHeight: "calc(100vh - 48px)" }}
//       >
//         <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between shrink-0">
//           <div className="flex items-center gap-3">
//             <div className="h-10 w-10 rounded-lg overflow-hidden bg-[#d75a2d] flex-shrink-0 flex items-center justify-center text-xl">
//               ⚔️
//             </div>
//             <h2 className="text-xl font-bold">Create Battle</h2>
//           </div>
//           <button
//             onClick={onClose}
//             className="text-white hover:opacity-70 transition-opacity flex-shrink-0"
//             aria-label="Close"
//           >
//             <CloseIcon />
//           </button>
//         </div>

//         <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
//           <div>
//             <label className="block text-sm font-semibold text-white mb-2">Battle Name</label>
//             <input
//               type="text"
//               value={battleName}
//               onChange={(e) => setBattleName(e.target.value)}
//               placeholder="e.g., Epic Showdown 2024"
//               className="w-full rounded-lg border border-white/15 bg-white/8 px-4 py-2.5 text-sm text-white outline-none placeholder:text-[#666] focus:border-white/30 focus:bg-white/12 transition-colors"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-semibold text-white mb-3">Battle Type</label>
//             <div className="flex gap-3">
//               <button
//                 onClick={() => setBattleType("players")}
//                 className={`flex-1 flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
//                   battleType === "players"
//                     ? "border-[#d75a2d] bg-[#d75a2d]/20 text-[#d75a2d]"
//                     : "border-white/15 bg-white/5 text-[#8a8a8a] hover:border-white/25"
//                 }`}
//               >
//                 <PlayersIcon />
//                 <div className="text-left">
//                   <div className="text-xs font-semibold">Players</div>
//                   <div className="text-[10px] opacity-70">Max 5</div>
//                 </div>
//               </button>
//               <button
//                 onClick={() => setBattleType("clubs")}
//                 className={`flex-1 flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
//                   battleType === "clubs"
//                     ? "border-[#d75a2d] bg-[#d75a2d]/20 text-[#d75a2d]"
//                     : "border-white/15 bg-white/5 text-[#8a8a8a] hover:border-white/25"
//                 }`}
//               >
//                 <ClubsIcon />
//                 <div className="text-left">
//                   <div className="text-xs font-semibold">Clubs</div>
//                   <div className="text-[10px] opacity-70">Max 2</div>
//                 </div>
//               </button>
//             </div>
//           </div>

//           <div>
//             <input
//               type="text"
//               value={battleType === "players" ? playerSearch : clubSearch}
//               onChange={(e) => {
//                 if (battleType === "players") setPlayerSearch(e.target.value);
//                 else setClubSearch(e.target.value);
//               }}
//               placeholder={`Search ${battleType}...`}
//               className="w-full rounded-lg border border-white/15 bg-white/8 px-4 py-2.5 text-sm text-white outline-none placeholder:text-[#666] focus:border-white/30 focus:bg-white/12 transition-colors"
//             />
//           </div>

//           <div className="flex items-center justify-between pt-2">
//             <h3 className="text-sm font-semibold text-white">
//               Select {battleType === "players" ? "Players" : "Clubs"}
//             </h3>
//             <span className="text-xs font-medium text-[#8a8a8a]">
//               {selectedCount}/{maxCount} selected
//             </span>
//           </div>

//           <div className="space-y-2 pr-1">
//             {loading ? (
//               <div className="flex items-center justify-center py-8 text-sm text-[#8a8a8a]">
//                 Loading...
//               </div>
//             ) : (battleType === "players" ? filteredPlayers : filteredClubs).length > 0 ? (
//               (battleType === "players" ? filteredPlayers : filteredClubs).map((item) => {
//                 const isSelected =
//                   battleType === "players"
//                     ? selectedPlayers.includes(item.id)
//                     : selectedClubs.includes(item.id);
//                 const isLimitReached = selectedCount >= maxCount;
//                 const isBlocked = !isSelected && isLimitReached;

//                 return (
//                   <div
//                     key={item.id}
//                     className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 cursor-pointer transition-all ${
//                       isSelected
//                         ? "border-white/25 bg-white/8"
//                         : isBlocked
//                         ? "border-white/10 bg-white/3 opacity-60 cursor-not-allowed"
//                         : "border-white/12 bg-white/4 hover:border-white/20 hover:bg-white/6"
//                     }`}
//                     onClick={() => {
//                       if (isBlocked) return;
//                       if (battleType === "players") togglePlayer(item.id);
//                       else toggleClub(item.id);
//                     }}
//                   >
//                     <input
//                       type="checkbox"
//                       checked={isSelected}
//                       onChange={() => {}}
//                       disabled={isBlocked}
//                       className={`h-5 w-5 rounded accent-[#d75a2d] shrink-0 ${
//                         isBlocked ? "cursor-not-allowed opacity-50" : "cursor-pointer"
//                       }`}
//                     />
//                     <div className="flex-1 min-w-0">
//                       <p className="text-sm font-semibold text-white truncate">{item.name}</p>
//                       {battleType === "clubs" && (item as BattleClub).city && (
//                         <p className="text-xs text-[#888]">{(item as BattleClub).city}</p>
//                       )}
//                       {battleType === "players" && (item as BattlePlayer).role && (
//                         <p className="text-xs text-[#888]">{(item as BattlePlayer).role}</p>
//                       )}
//                       {isBlocked && (
//                         <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-[#ff8a80]">
//                           Blocked — max {maxCount} selected
//                         </p>
//                       )}
//                     </div>
//                     {(battleType === "clubs" && (item as BattleClub).avatar) && (
//                       <img
//                         src={(item as BattleClub).avatar}
//                         alt={item.name}
//                         className="w-8 h-8 rounded-full object-cover"
//                       />
//                     )}
//                   </div>
//                 );
//               })
//             ) : (
//               <div className="rounded-lg border border-dashed border-white/15 bg-white/5 px-4 py-6 text-center text-sm text-[#888]">
//                 No {battleType} found
//               </div>
//             )}
//           </div>

//           {selectedItems.length > 0 && (
//             <div className="flex flex-wrap gap-2 pt-2">
//               {selectedItems.map((item) => (
//                 <span
//                   key={item.id}
//                   className="inline-flex items-center gap-2 rounded-full border border-[#d75a2d]/40 bg-[#d75a2d]/15 px-3 py-1.5 text-xs font-medium text-[#ff9a6c]"
//                 >
//                   {item.name}
//                   <button
//                     onClick={() => {
//                       if (battleType === "players") togglePlayer(item.id);
//                       else toggleClub(item.id);
//                     }}
//                     className="text-[#d75a2d]/70 hover:text-[#d75a2d]"
//                   >
//                     ×
//                   </button>
//                 </span>
//               ))}
//             </div>
//           )}

//           <div>
//             <label className="block text-sm font-semibold text-white mb-2">Invite Friends</label>
//             <div className="relative">
//               <input
//                 type="text"
//                 value={inviteInput}
//                 onChange={(e) => handleInviteInputChange(e.target.value)}
//                 onKeyDown={handleInviteKeyDown}
//                 onFocus={() =>
//                   inviteInput.trim() && emailSuggestions.length > 0 && setShowSuggestions(true)
//                 }
//                 placeholder="friend@email.com (press Enter or comma to add)"
//                 className="w-full rounded-lg border border-white/15 bg-white/8 px-4 py-2.5 text-sm text-white outline-none placeholder:text-[#666] focus:border-white/30 focus:bg-white/12 transition-colors"
//               />
//               {showSuggestions && emailSuggestions.length > 0 && (
//                 <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-white/15 bg-[#1a1a1e] z-10 shadow-lg">
//                   {emailSuggestions.map((email) => (
//                     <button
//                       key={email}
//                       type="button"
//                       onClick={() => addEmail(email)}
//                       className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-white/10 transition-colors first:rounded-t-lg last:rounded-b-lg"
//                     >
//                       {email}
//                     </button>
//                   ))}
//                 </div>
//               )}
//             </div>
            
//             {invitedFriends.length > 0 && (
//               <div className="flex flex-wrap gap-2 mt-3">
//                 {invitedFriends.map((friend) => (
//                   <span
//                     key={friend.email}
//                     className="inline-flex items-center gap-2 rounded-full border border-[#d75a2d]/40 bg-[#d75a2d]/15 px-3 py-1.5 text-xs font-medium text-[#ff9a6c]"
//                   >
//                     {friend.name} ({friend.email})
//                     <button
//                       onClick={() => removeEmail(friend.email)}
//                       className="text-[#d75a2d]/70 hover:text-[#d75a2d]"
//                     >
//                       ×
//                     </button>
//                   </span>
//                 ))}
//               </div>
//             )}
            
//             <p className="text-[10px] text-[#666] mt-2">
//               Add email addresses of friends you want to invite to this battle
//             </p>
//           </div>

//           {submitError && (
//             <p className="text-xs text-red-400 text-center">{submitError}</p>
//           )}
//         </div>

//         <div className="border-t border-white/10 px-6 py-5 shrink-0">
//           <button
//             onClick={handleCreate}
//             disabled={submitting}
//             className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold text-white transition-all active:scale-95 ${
//               submitting
//                 ? "bg-gray-600 cursor-not-allowed"
//                 : "bg-gradient-to-r from-[#e91e8c] to-[#d75a2d] hover:shadow-lg hover:shadow-pink-900/40"
//             }`}
//           >
//             <PlusIcon />
//             {submitting ? "Creating..." : "Create & Send Invite"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CreateBattle;











"use client";

import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

type BattlePlayer = {
  id: string;
  name: string;
  team: string;
  role: string;
  image?: string;
};

type BattleClub = {
  id: string;
  name: string;
  team: string;
  city: string;
  avatar?: string;
  overview?: {
    captain: string;
    coach: string;
    owner: string;
    venue: string;
  };
  stats?: {
    runs: string;
    sr: string;
    avg: string;
  };
};

interface CreateBattleProps {
  onClose: () => void;
  players?: BattlePlayer[];
  clubs?: BattleClub[];
}

type ApiPlayerItem = {
  playerProfilesId?: string;
  id?: string;
  playerName?: string;
  profile?: { name?: string; team?: string; role?: string };
  player?: { name?: string };
  name?: string;
  title?: string;
  team?: string;
  logo?: string;
  role?: string;
};

type ApiClubItem = {
  id: string;
  name: string;
  team: string;
  battingStyle?: string;
  bowlingStyle?: string;
  about?: string;
  avatar?: string;
  overview?: {
    captain: string;
    coach: string;
    owner: string;
    venue: string;
  };
  stats?: {
    runs: string;
    sr: string;
    avg: string;
  };
};

const fallbackPlayers: BattlePlayer[] = [
  { id: "p1", name: "Rohit Sharma", team: "MI", role: "Batter" },
  { id: "p2", name: "Suryakumar Yadav", team: "MI", role: "Batter" },
  { id: "p3", name: "Jasprit Bumrah", team: "MI", role: "Bowler" },
  { id: "p4", name: "Hardik Pandya", team: "MI", role: "All-rounder" },
  { id: "p5", name: "Virat Kohli", team: "RCB", role: "Batter" },
  { id: "p6", name: "MS Dhoni", team: "CSK", role: "Wicketkeeper" },
];

const fallbackClubs: BattleClub[] = [
  { id: "1", name: "Mumbai Indians", team: "MI", city: "Mumbai" },
  { id: "2", name: "Chennai Super Kings", team: "CSK", city: "Chennai" },
  { id: "3", name: "Royal Challengers Bengaluru", team: "RCB", city: "Bengaluru" },
  { id: "4", name: "Kolkata Knight Riders", team: "KKR", city: "Kolkata" },
  { id: "5", name: "Delhi Capitals", team: "DC", city: "Delhi" },
];

const MAX_PLAYERS = 5;
const MAX_CLUBS = 5;
const MAX_DISPLAYED_PLAYERS = 5;
const MAX_DISPLAYED_CLUBS = 10;

const normalizeText = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const scoreClubMatch = (name: string, city: string, query: string) => {
  const normalizedName = normalizeText(name);
  const normalizedCity = normalizeText(city);
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return 0;
  if (normalizedName === normalizedQuery) return 0;
  if (normalizedName.startsWith(normalizedQuery)) return 1;
  if (normalizedName.includes(normalizedQuery)) return 2 + normalizedName.indexOf(normalizedQuery) / 100;
  if (normalizedCity === normalizedQuery) return 5;
  if (normalizedCity.startsWith(normalizedQuery)) return 6;
  if (normalizedCity.includes(normalizedQuery)) return 7 + normalizedCity.indexOf(normalizedQuery) / 100;
  return Number.POSITIVE_INFINITY;
};

const scorePlayerMatch = (name: string, query: string) => {
  const normalizedName = normalizeText(name);
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return 0;
  if (normalizedName === normalizedQuery) return 0;
  if (normalizedName.startsWith(normalizedQuery)) return 1;
  const words = normalizedName.split(" ");
  if (words.some((word) => word.startsWith(normalizedQuery))) return 2;
  const containsIndex = normalizedName.indexOf(normalizedQuery);
  if (containsIndex >= 0) return 3 + containsIndex / 100;
  return Number.POSITIVE_INFINITY;
};

const nameFromEmail = (email: string): string => {
  const local = email.split("@")[0] ?? email;
  return local.replace(/[._\-+]/g, " ").replace(/\s+/g, " ").trim();
};
//done
const PlayersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

const ClubsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
  </svg>
);

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
  </svg>
);

const CreateBattle: React.FC<CreateBattleProps> = ({ onClose, players, clubs }) => {
  const { user, getUserName } = useAuth();

  const [playerData, setPlayerData] = useState<BattlePlayer[]>(fallbackPlayers);
  const [clubData, setClubData] = useState<BattleClub[]>(fallbackClubs);
  const [loading, setLoading] = useState(true);

  const [battleName, setBattleName] = useState("");
  const [battleType, setBattleType] = useState<"players" | "clubs">("players");
  const [playerSearch, setPlayerSearch] = useState("");
  const [clubSearch, setClubSearch] = useState("");
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [selectedClubs, setSelectedClubs] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Invite state
  const [inviteInput, setInviteInput] = useState("");
  const [invitedFriends, setInvitedFriends] = useState<{ email: string; name: string }[]>([]);
  const [emailSuggestions, setEmailSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const existingEmails = [
    "john@example.com",
    "jane@example.com",
    "mike@example.com",
    "sarah@example.com",
    "david@example.com",
    "emma@example.com",
    "alex@example.com",
    "rachel@example.com",
    "chris@example.com",
    "lisa@example.com",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        try {
          const ppRes = await axios.get<{ posts?: ApiPlayerItem[]; data?: ApiPlayerItem[] }>(
            "/api/player-profile/home",
            { params: { limit: 250 } }
          );
          const posts = ppRes.data.posts || ppRes.data.data || [];
          const mappedPlayers = posts.map((p, idx) => ({
            id: p.playerProfilesId || p.id || `pp_${idx}`,
            name: p.playerName || p.profile?.name || p.player?.name || p.name || p.title || "Unknown",
            team: p.team || p.logo || p.profile?.team || "",
            role: p.role || p.profile?.role || "",
          }));
          setPlayerData(mappedPlayers.length ? mappedPlayers : players?.length ? players : fallbackPlayers);
        } catch {
          setPlayerData(players?.length ? players : fallbackPlayers);
        }

        try {
          const clubRes = await axios.get<{ success: boolean; profiles: ApiClubItem[] }>(
            "/api/club-profile"
          );
          if (clubRes.data.success && clubRes.data.profiles) {
            const mappedClubs = clubRes.data.profiles.map((club) => ({
              id: club.id,
              name: club.name,
              team: club.team,
              city: club.overview?.venue || club.team || "",
              avatar: club.avatar,
              overview: club.overview,
              stats: club.stats,
            }));
            setClubData(mappedClubs.length ? mappedClubs : clubs?.length ? clubs : fallbackClubs);
          } else {
            setClubData(clubs?.length ? clubs : fallbackClubs);
          }
        } catch (err) {
          console.error("Error fetching club profiles:", err);
          setClubData(clubs?.length ? clubs : fallbackClubs);
        }
      } catch (error) {
        console.error("Error fetching battle data:", error);
        setPlayerData(players?.length ? players : fallbackPlayers);
        setClubData(clubs?.length ? clubs : fallbackClubs);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [players, clubs]);

  const filteredPlayers = useMemo(() => {
    const q = playerSearch.trim();
    const matches = q
      ? playerData
          .map((player) => ({ player, score: scorePlayerMatch(player.name || "", q) }))
          .filter(({ score }) => Number.isFinite(score))
          .sort((a, b) => (a.score !== b.score ? a.score - b.score : a.player.name.localeCompare(b.player.name)))
          .map(({ player }) => player)
      : playerData;
    return matches.slice(0, MAX_DISPLAYED_PLAYERS);
  }, [playerData, playerSearch]);

  const filteredClubs = useMemo(() => {
    const q = clubSearch.trim();
    const matches = q
      ? clubData
          .map((club) => ({ club, score: scoreClubMatch(club.name, club.city, q) }))
          .filter(({ score }) => Number.isFinite(score))
          .sort((a, b) => (a.score !== b.score ? a.score - b.score : a.club.name.localeCompare(b.club.name)))
          .map(({ club }) => club)
      : clubData;
    return matches.slice(0, MAX_DISPLAYED_CLUBS);
  }, [clubData, clubSearch]);

  const togglePlayer = (playerId: string) => {
    setSelectedPlayers((current) => {
      if (current.includes(playerId)) return current.filter((id) => id !== playerId);
      if (current.length >= MAX_PLAYERS) return current;
      return [...current, playerId];
    });
  };

  const toggleClub = (clubId: string) => {
    setSelectedClubs((current) => {
      if (current.includes(clubId)) return current.filter((id) => id !== clubId);
      if (current.length >= MAX_CLUBS) return current;
      return [...current, clubId];
    });
  };

  const currentPlayers = playerData.filter((p) => selectedPlayers.includes(p.id));
  const currentClubs = clubData.filter((c) => selectedClubs.includes(c.id));
  const selectedItems = battleType === "players" ? currentPlayers : currentClubs;
  const selectedCount = battleType === "players" ? selectedPlayers.length : selectedClubs.length;
  const maxCount = battleType === "players" ? MAX_PLAYERS : MAX_CLUBS;

  const handleInviteInputChange = (value: string) => {
    setInviteInput(value);
    if (value.trim()) {
      const lastEmail = value.split(",").pop()?.trim() || "";
      const filtered = existingEmails.filter(
        (email) =>
          email.toLowerCase().includes(lastEmail.toLowerCase()) &&
          !invitedFriends.some((f) => f.email === email)
      );
      setEmailSuggestions(filtered.slice(0, 5));
      setShowSuggestions(filtered.length > 0);
    } else {
      setEmailSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const addEmail = (email: string) => {
    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      alert("Please enter a valid email address");
      return;
    }

    if (invitedFriends.some((f) => f.email === trimmedEmail)) {
      alert("Email already added");
      return;
    }

    setInvitedFriends([
      ...invitedFriends,
      { email: trimmedEmail, name: nameFromEmail(trimmedEmail) },
    ]);
    setInviteInput("");
    setEmailSuggestions([]);
    setShowSuggestions(false);
  };

  const removeEmail = (email: string) => {
    setInvitedFriends(invitedFriends.filter((f) => f.email !== email));
  };

  const handleInviteKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const email = inviteInput.split(",").pop()?.trim();
      if (email) addEmail(email);
    }
  };

  const handleCreate = async () => {
    setSubmitError(null);

    if (!battleName.trim()) { alert("Please enter a battle name"); return; }
    if (selectedCount === 0) { alert("Please select at least one item"); return; }

    const userId = user?.userId;
    const userName = getUserName() || user?.email || "Guest";

    if (!userId) {
      alert("You must be logged in to create a battle.");
      return;
    }

    // ── Flush any email still typed in the input box ──────────────────────
    let finalInvitedFriends = [...invitedFriends];
    const pendingEmail = inviteInput.trim().replace(/,+$/, "");
    if (pendingEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(pendingEmail) && !finalInvitedFriends.some((f) => f.email === pendingEmail)) {
        finalInvitedFriends = [
          ...finalInvitedFriends,
          { email: pendingEmail, name: nameFromEmail(pendingEmail) },
        ];
        setInvitedFriends(finalInvitedFriends);
        setInviteInput("");
      }
    }
    // ─────────────────────────────────────────────────────────────────────

    const apiBattleType = battleType === "players" ? "PLAYERS" : "CLUBS";

    const payload = {
      battleName: battleName.trim(),
      battleType: apiBattleType,
      ...(apiBattleType === "PLAYERS" ? { selectedPlayers } : { selectedClubs }),
      invitedFriends: finalInvitedFriends,
      userId,
      userName,
    };

    console.log("Sending payload:", payload);

    setSubmitting(true);
    try {
      await axios.post("/api/battle", payload);
      onClose();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.error || "Failed to create battle";
        setSubmitError(message);
        alert(message);
      } else {
        console.error(err);
        setSubmitError("Failed to create battle");
        alert("Failed to create battle");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#07070f] flex items-start justify-center py-6 px-4">
      <div
        className="w-full max-w-sm flex flex-col rounded-2xl bg-[#1a1a1e] text-white shadow-2xl border border-white/10"
        style={{ maxHeight: "calc(100vh - 48px)" }}
      >
        <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg overflow-hidden bg-[#d75a2d] flex-shrink-0 flex items-center justify-center text-xl">
              ⚔️
            </div>
            <h2 className="text-xl font-bold">Create Battle</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:opacity-70 transition-opacity flex-shrink-0"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-white mb-2">Battle Name</label>
            <input
              type="text"
              value={battleName}
              onChange={(e) => setBattleName(e.target.value)}
              placeholder="e.g., Epic Showdown 2024"
              className="w-full rounded-lg border border-white/15 bg-white/8 px-4 py-2.5 text-sm text-white outline-none placeholder:text-[#666] focus:border-white/30 focus:bg-white/12 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-3">Battle Type</label>
            <div className="flex gap-3">
              <button
                onClick={() => setBattleType("players")}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
                  battleType === "players"
                    ? "border-[#d75a2d] bg-[#d75a2d]/20 text-[#d75a2d]"
                    : "border-white/15 bg-white/5 text-[#8a8a8a] hover:border-white/25"
                }`}
              >
                <PlayersIcon />
                <div className="text-left">
                  <div className="text-xs font-semibold">Players</div>
                  <div className="text-[10px] opacity-70">Max 5</div>
                </div>
              </button>
              <button
                onClick={() => setBattleType("clubs")}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
                  battleType === "clubs"
                    ? "border-[#d75a2d] bg-[#d75a2d]/20 text-[#d75a2d]"
                    : "border-white/15 bg-white/5 text-[#8a8a8a] hover:border-white/25"
                }`}
              >
                <ClubsIcon />
                <div className="text-left">
                  <div className="text-xs font-semibold">Clubs</div>
                  <div className="text-[10px] opacity-70">Max 5</div>
                </div>
              </button>
            </div>
          </div>

          <div>
            <input
              type="text"
              value={battleType === "players" ? playerSearch : clubSearch}
              onChange={(e) => {
                if (battleType === "players") setPlayerSearch(e.target.value);
                else setClubSearch(e.target.value);
              }}
              placeholder={`Search ${battleType}...`}
              className="w-full rounded-lg border border-white/15 bg-white/8 px-4 py-2.5 text-sm text-white outline-none placeholder:text-[#666] focus:border-white/30 focus:bg-white/12 transition-colors"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <h3 className="text-sm font-semibold text-white">
              Select {battleType === "players" ? "Players" : "Clubs"}
            </h3>
            <span className="text-xs font-medium text-[#8a8a8a]">
              {selectedCount}/{maxCount} selected
            </span>
          </div>

          <div className="space-y-2 pr-1">
            {loading ? (
              <div className="flex items-center justify-center py-8 text-sm text-[#8a8a8a]">
                Loading...
              </div>
            ) : (battleType === "players" ? filteredPlayers : filteredClubs).length > 0 ? (
              (battleType === "players" ? filteredPlayers : filteredClubs).map((item) => {
                const isSelected =
                  battleType === "players"
                    ? selectedPlayers.includes(item.id)
                    : selectedClubs.includes(item.id);
                const isLimitReached = selectedCount >= maxCount;
                const isBlocked = !isSelected && isLimitReached;

                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 cursor-pointer transition-all ${
                      isSelected
                        ? "border-white/25 bg-white/8"
                        : isBlocked
                        ? "border-white/10 bg-white/3 opacity-60 cursor-not-allowed"
                        : "border-white/12 bg-white/4 hover:border-white/20 hover:bg-white/6"
                    }`}
                    onClick={() => {
                      if (isBlocked) return;
                      if (battleType === "players") togglePlayer(item.id);
                      else toggleClub(item.id);
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      disabled={isBlocked}
                      className={`h-5 w-5 rounded accent-[#d75a2d] shrink-0 ${
                        isBlocked ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{item.name}</p>
                      {battleType === "clubs" && (item as BattleClub).city && (
                        <p className="text-xs text-[#888]">{(item as BattleClub).city}</p>
                      )}
                      {battleType === "players" && (item as BattlePlayer).role && (
                        <p className="text-xs text-[#888]">{(item as BattlePlayer).role}</p>
                      )}
                      {isBlocked && (
                        <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-[#ff8a80]">
                          Blocked — max {maxCount} selected
                        </p>
                      )}
                    </div>
                    {battleType === "clubs" && (item as BattleClub).avatar && (
                      <img
                        src={(item as BattleClub).avatar}
                        alt={item.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="rounded-lg border border-dashed border-white/15 bg-white/5 px-4 py-6 text-center text-sm text-[#888]">
                No {battleType} found
              </div>
            )}
          </div>

          {selectedItems.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {selectedItems.map((item) => (
                <span
                  key={item.id}
                  className="inline-flex items-center gap-2 rounded-full border border-[#d75a2d]/40 bg-[#d75a2d]/15 px-3 py-1.5 text-xs font-medium text-[#ff9a6c]"
                >
                  {item.name}
                  <button
                    onClick={() => {
                      if (battleType === "players") togglePlayer(item.id);
                      else toggleClub(item.id);
                    }}
                    className="text-[#d75a2d]/70 hover:text-[#d75a2d]"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-white mb-2">Invite Friends</label>
            <div className="relative">
              <input
                type="email"
                value={inviteInput}
                onChange={(e) => handleInviteInputChange(e.target.value)}
                onKeyDown={handleInviteKeyDown}
                onBlur={() => {
                  // Small delay so suggestion clicks register before blur hides them
                  setTimeout(() => setShowSuggestions(false), 150);
                }}
                onFocus={() =>
                  inviteInput.trim() && emailSuggestions.length > 0 && setShowSuggestions(true)
                }
                placeholder="friend@email.com — press Enter or comma to add"
                className="w-full rounded-lg border border-white/15 bg-white/8 px-4 py-2.5 pr-24 text-sm text-white outline-none placeholder:text-[#666] focus:border-white/30 focus:bg-white/12 transition-colors"
              />
              {/* ── Add button so users don't have to guess about Enter ── */}
              <button
                type="button"
                onClick={() => {
                  const email = inviteInput.trim().replace(/,+$/, "");
                  if (email) addEmail(email);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-[#d75a2d] px-3 py-1 text-xs font-semibold text-white hover:bg-[#c04e26] transition-colors"
              >
                Add
              </button>
              {showSuggestions && emailSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-white/15 bg-[#1a1a1e] z-10 shadow-lg">
                  {emailSuggestions.map((email) => (
                    <button
                      key={email}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()} // prevent blur before click
                      onClick={() => addEmail(email)}
                      className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-white/10 transition-colors first:rounded-t-lg last:rounded-b-lg"
                    >
                      {email}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {invitedFriends.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {invitedFriends.map((friend) => (
                  <span
                    key={friend.email}
                    className="inline-flex items-center gap-2 rounded-full border border-[#d75a2d]/40 bg-[#d75a2d]/15 px-3 py-1.5 text-xs font-medium text-[#ff9a6c]"
                  >
                    {friend.name}
                    <button
                      onClick={() => removeEmail(friend.email)}
                      className="text-[#d75a2d]/70 hover:text-[#d75a2d]"
                      title={friend.email}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            <p className="text-[10px] text-[#666] mt-2">
              Type an email and press <strong className="text-[#888]">Enter</strong>, <strong className="text-[#888]">,</strong> or click <strong className="text-[#888]">Add</strong> — they&apos;ll receive a battle invite link by email.
            </p>
          </div>

          {submitError && (
            <p className="text-xs text-red-400 text-center">{submitError}</p>
          )}
        </div>

        <div className="border-t border-white/10 px-6 py-5 shrink-0">
          <button
            onClick={handleCreate}
            disabled={submitting}
            className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold text-white transition-all active:scale-95 ${
              submitting
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-[#e91e8c] to-[#d75a2d] hover:shadow-lg hover:shadow-pink-900/40"
            }`}
          >
            <PlusIcon />
            {submitting ? "Creating..." : "Create & Send Invite"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateBattle;