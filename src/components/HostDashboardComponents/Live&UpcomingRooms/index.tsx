// "use client";

// import { useState, useEffect } from "react";
// import axios from "axios";
// import { useRouter } from "next/navigation";

// // ─── Types 
// type RoomStatus = "LIVE" | "SCHEDULED" | "published" | "draft";

// interface RoomAsset {
//   type: string;
//   url: string;
//   name: string;
//   size?: number;
// }

// interface RoomDetails {
//   title: string;
//   description: string;
//   thumbnail: string;
//   capacity: number;
//   primaryLanguage: string;
//   tags: string[];
//   moderators: string[];
//   schedule: string;
// }

// interface RoomPricing {
//   pricePerFan: number;
//   currency: string;
// }

// interface RoomEvent {
//   selectedEvent: {
//     id: string;
//     name: string;
//   };
//   roomType: string;
// }

// interface ApiRoom {
//   id: string;
//   userId: string;
//   firebaseUid: string;
//   status: string;
//   currentStep: number;
//   event: RoomEvent;
//   details: RoomDetails;
//   content: {
//     assets: RoomAsset[];
//   };
//   pricing: RoomPricing;
//   createdAt: number;
//   updatedAt: number;
//   publishedAt?: number;
// }

// interface LiveRoom {
//   id: string;
//   status: "LIVE";
//   roomType: string;
//   title: string;
//   tags: string[];
//   watching: number;
//   active: number;
//   minutesLive: number;
//   earnings: number;
//   currency: string;
// }

// interface ScheduledRoom {
//   id: string;
//   status: "SCHEDULED";
//   roomType: string;
//   title: string;
//   time: string;
//   tags: string[];
//   capacity: number;
//   rsvps: number;
// }

// type Room = LiveRoom | ScheduledRoom;

// // ─── Helpers 
// function formatNumber(n: number): string {
//   return n.toLocaleString("en-IN");
// }

// function formatRoomType(type: string): string {
//   const typeMap: Record<string, string> = {
//     open: "Open Room",
//     inner: "Inner Room",
//     moment: "Moment Room",
//     reflection: "Reflection Room",
//   };
//   return typeMap[type] || type;
// }

// function formatScheduleTime(schedule: string): string {
//   if (!schedule) return "Date TBD";
//   const date = new Date(schedule);
//   return date.toLocaleString("en-IN", {
//     day: "numeric",
//     month: "short",
//     hour: "numeric",
//     minute: "2-digit",
//     hour12: true,
//   });
// }

// function isRoomLive(schedule: string): boolean {
//   if (!schedule) return false;
//   const scheduleDate = new Date(schedule);
//   const now = new Date();
//   return scheduleDate <= now;
// }

// // ─── Sub-components 
// function LiveBadge() {
//   return (
//     <span className="flex items-center gap-1.5 bg-orange-500 text-white text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full">
//       <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
//       Live
//     </span>
//   );
// }

// function ScheduledBadge() {
//   return (
//     <span className="flex items-center gap-1.5 bg-sky-500/20 text-sky-400 text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border border-sky-500/30">
//       <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
//         <rect x="3" y="4" width="18" height="18" rx="2" />
//         <path d="M16 2v4M8 2v4M3 10h18" />
//       </svg>
//       Scheduled
//     </span>
//   );
// }

// function DraftBadge() {
//   return (
//     <span className="flex items-center gap-1.5 bg-zinc-500/20 text-zinc-400 text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border border-zinc-500/30">
//       <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
//         <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
//       </svg>
//       Draft
//     </span>
//   );
// }

// function ThreeDotMenu({ roomId, onEdit, onDelete }: { roomId: string; onEdit?: (id: string) => void; onDelete?: (id: string) => void }) {
//   const [showMenu, setShowMenu] = useState(false);

//   return (
//     <div className="relative">
//       <button 
//         onClick={() => setShowMenu(!showMenu)}
//         className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-zinc-400 hover:text-white"
//       >
//         <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
//           <circle cx="12" cy="5" r="1.5" />
//           <circle cx="12" cy="12" r="1.5" />
//           <circle cx="12" cy="19" r="1.5" />
//         </svg>
//       </button>
//       {showMenu && (
//         <div className="absolute right-0 mt-2 w-32 bg-zinc-800 rounded-lg shadow-lg border border-zinc-700 z-10">
//           <button 
//             onClick={() => {
//               onEdit?.(roomId);
//               setShowMenu(false);
//             }}
//             className="w-full text-left px-4 py-2 text-sm text-white hover:bg-zinc-700 rounded-t-lg"
//           >
//             Edit
//           </button>
//           <button 
//             onClick={() => {
//               onDelete?.(roomId);
//               setShowMenu(false);
//             }}
//             className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-zinc-700 rounded-b-lg"
//           >
//             Delete
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// function LiveRoomCard({ room, onEdit, onDelete }: { room: LiveRoom; onEdit?: (id: string) => void; onDelete?: (id: string) => void }) {
//   return (
//     <div className="rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 overflow-hidden">
//       <div className="flex items-center justify-between px-4 pt-4 pb-3">
//         <div className="flex items-center gap-2">
//           <LiveBadge />
//           <span className="text-zinc-400 text-sm font-medium">{room.roomType}</span>
//         </div>
//         <ThreeDotMenu roomId={room.id} onEdit={onEdit} onDelete={onDelete} />
//       </div>

//       <div className="h-px bg-gradient-to-r from-orange-500/20 via-zinc-700/50 to-transparent mx-4" />

//       <div className="px-4 pt-4 pb-5 space-y-4">
//         <div>
//           <h3 className="text-white font-bold text-lg sm:text-xl leading-snug">{room.title}</h3>
//           <p className="text-zinc-500 text-sm mt-1">{room.tags.join(" • ")}</p>
//         </div>

//         <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
//           <div className="flex items-center gap-2 text-orange-400 text-sm font-medium">
//             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
//               <path d="M1.5 8.5a15 15 0 0 1 21 0" />
//               <path d="M5 12.5a10 10 0 0 1 14 0" />
//               <path d="M8.5 16.5a5 5 0 0 1 7 0" />
//               <circle cx="12" cy="20" r="1" fill="currentColor" />
//             </svg>
//             {formatNumber(room.watching)} watching
//           </div>
//           <div className="flex items-center gap-2 text-zinc-400 text-sm">
//             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
//               <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
//               <circle cx="9" cy="7" r="4" />
//               <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
//               <path d="M16 3.13a4 4 0 0 1 0 7.75" />
//             </svg>
//             {formatNumber(room.active)} active
//           </div>
//         </div>

//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-2 text-zinc-400 text-sm">
//             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
//               <circle cx="12" cy="12" r="10" />
//               <path d="M12 6v6l4 2" />
//             </svg>
//             {room.minutesLive} min live
//           </div>
//           <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-base px-4 py-1.5 rounded-xl tracking-tight">
//             {room.currency}{formatNumber(room.earnings)}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function ScheduledRoomCard({ room, onEdit, onDelete }: { room: ScheduledRoom; onEdit?: (id: string) => void; onDelete?: (id: string) => void }) {
//   return (
//     <div className="rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 overflow-hidden">
//       <div className="flex items-center justify-between px-4 pt-4 pb-3">
//         <div className="flex items-center gap-2">
//           <ScheduledBadge />
//           <span className="text-zinc-400 text-sm font-medium">{room.roomType}</span>
//         </div>
//         <ThreeDotMenu roomId={room.id} onEdit={onEdit} onDelete={onDelete} />
//       </div>

//       <div className="h-px bg-gradient-to-r from-sky-500/20 via-zinc-700/50 to-transparent mx-4" />

//       <div className="px-4 pt-4 space-y-4">
//         <div>
//           <h3 className="text-white font-bold text-lg sm:text-xl leading-snug">{room.title}</h3>
//           <p className="text-zinc-500 text-sm mt-1">{room.time} • {room.tags.join(" • ")}</p>
//         </div>

//         <div className="flex items-center gap-6">
//           <div className="flex items-center gap-2 text-zinc-400 text-sm">
//             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
//               <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
//               <circle cx="9" cy="7" r="4" />
//               <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
//             </svg>
//             Capacity: {formatNumber(room.capacity)}
//           </div>
//           <div className="flex items-center gap-2 text-sky-400 text-sm font-medium">
//             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
//               <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
//               <circle cx="12" cy="12" r="3" />
//             </svg>
//             {formatNumber(room.rsvps)} RSVPs
//           </div>
//         </div>

//         <div className="flex gap-0 -mx-px pb-0">
//           <button 
//             onClick={() => onEdit?.(room.id)}
//             className="flex-1 bg-zinc-800 hover:bg-zinc-700 transition-colors text-white font-semibold py-3.5 text-sm rounded-bl-2xl border-t border-zinc-700"
//           >
//             Edit
//           </button>
//           <button 
//             onClick={() => onDelete?.(room.id)}
//             className="flex-1 bg-red-500/20 hover:bg-red-500/30 transition-colors text-red-400 font-semibold py-3.5 text-sm rounded-br-2xl border-t border-zinc-700"
//           >
//             Delete
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// function DraftRoomCard({ room, onEdit, onDelete, onPublish }: { room: ApiRoom; onEdit?: (id: string) => void; onDelete?: (id: string) => void; onPublish?: (id: string) => void }) {
//   return (
//     <div className="rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 overflow-hidden opacity-80">
//       <div className="flex items-center justify-between px-4 pt-4 pb-3">
//         <div className="flex items-center gap-2">
//           <DraftBadge />
//           <span className="text-zinc-400 text-sm font-medium">{formatRoomType(room.event.roomType)}</span>
//         </div>
//         <ThreeDotMenu roomId={room.id} onEdit={onEdit} onDelete={onDelete} />
//       </div>

//       <div className="h-px bg-gradient-to-r from-zinc-500/20 via-zinc-700/50 to-transparent mx-4" />

//       <div className="px-4 pt-4 pb-5 space-y-4">
//         <div>
//           <h3 className="text-white font-bold text-lg sm:text-xl leading-snug">{room.details.title}</h3>
//           <p className="text-zinc-500 text-sm mt-1">{room.details.tags.join(" • ")}</p>
//         </div>

//         <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
//           <div className="flex items-center gap-2 text-zinc-400 text-sm">
//             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
//               <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
//               <circle cx="9" cy="7" r="4" />
//               <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
//             </svg>
//             Capacity: {formatNumber(room.details.capacity || 0)}
//           </div>
//           <div className="flex items-center gap-2 text-zinc-400 text-sm">
//             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
//               <circle cx="12" cy="12" r="10" />
//               <path d="M12 6v6l4 2" />
//             </svg>
//             {formatScheduleTime(room.details.schedule)}
//           </div>
//         </div>

//         <div className="flex gap-0 -mx-px pb-0">
//           <button 
//             onClick={() => onEdit?.(room.id)}
//             className="flex-1 bg-zinc-800 hover:bg-zinc-700 transition-colors text-white font-semibold py-3.5 text-sm rounded-bl-2xl border-t border-zinc-700"
//           >
//             Edit Draft
//           </button>
//           <button 
//             onClick={() => onPublish?.(room.id)}
//             className="flex-1 bg-emerald-500 hover:bg-emerald-400 transition-colors text-white font-semibold py-3.5 text-sm rounded-br-2xl"
//           >
//             Publish
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Main Component 
// export default function LiveRoomsCard() {
//   const router = useRouter();
//   const [rooms, setRooms] = useState<Room[]>([]);
//   const [draftRooms, setDraftRooms] = useState<ApiRoom[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

//   // Fetch current user from users API
//   const fetchCurrentUser = async () => {
//     try {
//       // Since we don't have a /api/auth/me endpoint, we'll get all users and find the current one
//       // For a production app, you should have a /api/auth/me endpoint
      
//       // Option 1: If you have user data stored in localStorage after login
//       const storedUser = localStorage.getItem('user');
//       if (storedUser) {
//         try {
//           const user = JSON.parse(storedUser);
//           if (user.email) {
//             return user.email;
//           }
//         } catch (e) {
//           console.error('Failed to parse stored user:', e);
//         }
//       }
      
//       // Option 2: Get from sessionStorage
//       const sessionUser = sessionStorage.getItem('user');
//       if (sessionUser) {
//         try {
//           const user = JSON.parse(sessionUser);
//           if (user.email) {
//             return user.email;
//           }
//         } catch (e) {
//           console.error('Failed to parse session user:', e);
//         }
//       }
      
//       // Option 3: Fetch from API - but you need to know which user is logged in
//       // For now, we'll use the hardcoded email since we know princechandu@gmail.com is the host
//       // In production, you should have a proper /api/auth/me endpoint
//       return "princechandu@gmail.com";
      
//     } catch (error) {
//       console.error("Failed to get current user:", error);
//       return null;
//     }
//   };

//   // Fetch rooms from API
//   const fetchRooms = async () => {
//     try {
//       setLoading(true);
      
//       // Get the current user's email
//       const email = await fetchCurrentUser();
      
//       if (!email) {
//         setError("User not authenticated. Please login again.");
//         setLoading(false);
//         return;
//       }
      
//       setCurrentUserEmail(email);
//       console.log("Fetching rooms for user:", email);
      
//       // Fetch rooms for this specific user
//       const response = await axios.get(`/api/hostrooms?userId=${encodeURIComponent(email)}`, {
//         withCredentials: true,
//       });
//       console.log("Rooms response:", response.data);
      
//       if (response.data?.success && response.data.rooms) {
//         const apiRooms: ApiRoom[] = response.data.rooms;
        
//         // Separate published and draft rooms
//         const published = apiRooms.filter(room => room.status === "published");
//         const drafts = apiRooms.filter(room => room.status === "draft");
        
//         // Transform published rooms to the UI format
//         const transformedRooms: Room[] = published.map((room: ApiRoom) => {
//           const isLive = isRoomLive(room.details.schedule);
          
//           if (isLive) {
//             return {
//               id: room.id,
//               status: "LIVE",
//               roomType: formatRoomType(room.event.roomType),
//               title: room.details.title,
//               tags: room.details.tags,
//               watching: Math.floor(Math.random() * 2000) + 100,
//               active: Math.floor(Math.random() * 1000) + 50,
//               minutesLive: Math.floor((Date.now() - (room.publishedAt || room.createdAt)) / 60000),
//               earnings: (room.pricing.pricePerFan * (Math.floor(Math.random() * 500) + 100)),
//               currency: room.pricing.currency,
//             };
//           } else {
//             return {
//               id: room.id,
//               status: "SCHEDULED",
//               roomType: formatRoomType(room.event.roomType),
//               title: room.details.title,
//               time: formatScheduleTime(room.details.schedule),
//               tags: room.details.tags,
//               capacity: room.details.capacity,
//               rsvps: Math.floor(Math.random() * room.details.capacity),
//             };
//           }
//         });
        
//         setRooms(transformedRooms);
//         setDraftRooms(drafts);
//       }
//     } catch (err) {
//       console.error("Failed to fetch rooms:", err);
//       setError("Failed to load rooms. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchRooms();
//   }, []);

//   const handleEdit = (roomId: string) => {
//     router.push(`/host/rooms/edit/${roomId}`);
//   };

//   const handleDelete = async (roomId: string) => {
//     if (confirm("Are you sure you want to delete this room?")) {
//       try {
//         await axios.delete(`/api/hostrooms/${roomId}`, {
//           withCredentials: true,
//         });
//         fetchRooms(); // Refresh the list
//       } catch (err) {
//         console.error("Failed to delete room:", err);
//         alert("Failed to delete room. Please try again.");
//       }
//     }
//   };

//   const handlePublish = async (roomId: string) => {
//     try {
//       await axios.patch(`/api/hostrooms/${roomId}`, 
//         { status: "published" },
//         { withCredentials: true }
//       );
//       fetchRooms(); // Refresh the list
//     } catch (err) {
//       console.error("Failed to publish room:", err);
//       alert("Failed to publish room. Please try again.");
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center p-4">
//         <div className="text-white">Loading rooms...</div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center p-4">
//         <div className="text-red-400">{error}</div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen p-4 sm:p-6 md:p-2">
//       <div className="w-full max-w-4xl mx-auto">
//         {/* Section Header */}
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-white font-bold text-lg sm:text-xl">
//             Live &amp; Upcoming Rooms
//           </h2>
//           <button 
//             onClick={() => router.push("/host/rooms/create")}
//             className="bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
//           >
//             + Create Room
//           </button>
//         </div>

//         {/* Draft Rooms Section */}
//         {draftRooms.length > 0 && (
//           <div className="mb-6">
//             <h3 className="text-zinc-400 text-sm font-medium mb-3">Drafts</h3>
//             <div className="flex flex-col gap-4">
//               {draftRooms.map((room) => (
//                 <DraftRoomCard 
//                   key={room.id} 
//                   room={room} 
//                   onEdit={handleEdit}
//                   onDelete={handleDelete}
//                   onPublish={handlePublish}
//                 />
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Published Rooms */}
//         <div className="flex flex-col gap-4">
//           {rooms.length === 0 && draftRooms.length === 0 ? (
//             <div className="text-center py-12 bg-zinc-900 rounded-2xl border border-zinc-800">
//               <p className="text-zinc-400">No rooms yet. Create your first room!</p>
//               <button 
//                 onClick={() => router.push("/host/rooms/create")}
//                 className="mt-4 bg-orange-500 hover:bg-orange-400 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
//               >
//                 Create Room
//               </button>
//             </div>
//           ) : (
//             rooms.map((room) =>
//               room.status === "LIVE" ? (
//                 <LiveRoomCard key={room.id} room={room} onEdit={handleEdit} onDelete={handleDelete} />
//               ) : (
//                 <ScheduledRoomCard key={room.id} room={room} onEdit={handleEdit} onDelete={handleDelete} />
//               )
//             )
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }


//components/HostDashboardComponents/Live&UpcomingRooms/index.tsx

"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

// ─── Types 
type RoomStatus = "LIVE" | "SCHEDULED" | "published" | "draft";

interface RoomAsset {
  type: string;
  url: string;
  name: string;
  size?: number;
}

interface RoomDetails {
  title: string;
  description: string;
  thumbnail: string;
  capacity: number;
  primaryLanguage: string;
  tags: string[];
  moderators: string[];
  schedule: string;
}

interface RoomPricing {
  pricePerFan: number;
  currency: string;
}

interface RoomEvent {
  selectedEvent: {
    id: string;
    name: string;
  };
  roomType: string;
}

interface ApiRoom {
  id: string;
  userId: string;
  firebaseUid: string;
  status: string;
  currentStep: number;
  event: RoomEvent;
  details: RoomDetails;
  content: {
    assets: RoomAsset[];
  };
  pricing: RoomPricing;
  createdAt: number;
  updatedAt: number;
  publishedAt?: number;
}

interface LiveRoom {
  id: string;
  status: "LIVE";
  roomType: string;
  title: string;
  tags: string[];
  watching: number;
  active: number;
  minutesLive: number;
  earnings: number;
  currency: string;
}

interface ScheduledRoom {
  id: string;
  status: "SCHEDULED";
  roomType: string;
  title: string;
  time: string;
  tags: string[];
  capacity: number;
  rsvps: number;
}

type Room = LiveRoom | ScheduledRoom;

// ─── Helpers 
function formatNumber(n: number): string {
  return n.toLocaleString("en-IN");
}

function formatRoomType(type: string): string {
  const typeMap: Record<string, string> = {
    open: "Open Room",
    inner: "Inner Room",
    moment: "Moment Room",
    reflection: "Reflection Room",
  };
  return typeMap[type] || type;
}

function formatScheduleTime(schedule: string): string {
  if (!schedule) return "Date TBD";
  const date = new Date(schedule);
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function isRoomLive(schedule: string): boolean {
  if (!schedule) return false;
  const scheduleDate = new Date(schedule);
  const now = new Date();
  return scheduleDate <= now;
}

// ─── Sub-components 
function LiveBadge() {
  return (
    <span className="flex items-center gap-1.5 bg-orange-500 text-white text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full">
      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
      Live
    </span>
  );
}

function ScheduledBadge() {
  return (
    <span className="flex items-center gap-1.5 bg-sky-500/20 text-sky-400 text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border border-sky-500/30">
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
      Scheduled
    </span>
  );
}

function DraftBadge() {
  return (
    <span className="flex items-center gap-1.5 bg-zinc-500/20 text-zinc-400 text-[11px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border border-zinc-500/30">
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
      </svg>
      Draft
    </span>
  );
}

function ThreeDotMenu({ roomId, onEdit, onDelete }: { roomId: string; onEdit?: (id: string) => void; onDelete?: (id: string) => void }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setShowMenu(!showMenu)}
        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-zinc-400 hover:text-white"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <circle cx="12" cy="5" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>
      {showMenu && (
        <div className="absolute right-0 mt-2 w-32 bg-zinc-800 rounded-lg shadow-lg border border-zinc-700 z-10">
          <button 
            onClick={() => {
              onEdit?.(roomId);
              setShowMenu(false);
            }}
            className="w-full text-left px-4 py-2 text-sm text-white hover:bg-zinc-700 rounded-t-lg"
          >
            Edit
          </button>
          <button 
            onClick={() => {
              onDelete?.(roomId);
              setShowMenu(false);
            }}
            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-zinc-700 rounded-b-lg"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

function LiveRoomCard({ room, onEdit, onDelete }: { room: LiveRoom; onEdit?: (id: string) => void; onDelete?: (id: string) => void }) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <LiveBadge />
          <span className="text-zinc-400 text-sm font-medium">{room.roomType}</span>
        </div>
        <ThreeDotMenu roomId={room.id} onEdit={onEdit} onDelete={onDelete} />
      </div>

      <div className="h-px bg-gradient-to-r from-orange-500/20 via-zinc-700/50 to-transparent mx-4" />

      <div className="px-4 pt-4 pb-5 space-y-4">
        <div>
          <h3 className="text-white font-bold text-lg sm:text-xl leading-snug">{room.title}</h3>
          <p className="text-zinc-500 text-sm mt-1">{room.tags.join(" • ")}</p>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div className="flex items-center gap-2 text-orange-400 text-sm font-medium">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path d="M1.5 8.5a15 15 0 0 1 21 0" />
              <path d="M5 12.5a10 10 0 0 1 14 0" />
              <path d="M8.5 16.5a5 5 0 0 1 7 0" />
              <circle cx="12" cy="20" r="1" fill="currentColor" />
            </svg>
            {formatNumber(room.watching)} watching
          </div>
          <div className="flex items-center gap-2 text-zinc-400 text-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            {formatNumber(room.active)} active
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-400 text-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            {room.minutesLive} min live
          </div>
          <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-base px-4 py-1.5 rounded-xl tracking-tight">
            {room.currency}{formatNumber(room.earnings)}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScheduledRoomCard({ room, onEdit, onDelete }: { room: ScheduledRoom; onEdit?: (id: string) => void; onDelete?: (id: string) => void }) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <ScheduledBadge />
          <span className="text-zinc-400 text-sm font-medium">{room.roomType}</span>
        </div>
        <ThreeDotMenu roomId={room.id} onEdit={onEdit} onDelete={onDelete} />
      </div>

      <div className="h-px bg-gradient-to-r from-sky-500/20 via-zinc-700/50 to-transparent mx-4" />

      <div className="px-4 pt-4 space-y-4">
        <div>
          <h3 className="text-white font-bold text-lg sm:text-xl leading-snug">{room.title}</h3>
          <p className="text-zinc-500 text-sm mt-1">{room.time} • {room.tags.join(" • ")}</p>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-zinc-400 text-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Capacity: {formatNumber(room.capacity)}
          </div>
          <div className="flex items-center gap-2 text-sky-400 text-sm font-medium">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            {formatNumber(room.rsvps)} RSVPs
          </div>
        </div>

        <div className="flex gap-0 -mx-px pb-6">
          <button 
            onClick={() => onEdit?.(room.id)}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 transition-colors text-white font-semibold py-3.5 text-sm rounded-bl-2xl border-t border-zinc-700"
          >
            Edit
          </button>
          <button 
            onClick={() => onDelete?.(room.id)}
            className="flex-1 bg-red-500/20 hover:bg-red-500/30 transition-colors text-red-400 font-semibold py-3.5 text-sm rounded-br-2xl border-t border-zinc-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function DraftRoomCard({ room, onEdit, onDelete, onPublish }: { room: ApiRoom; onEdit?: (id: string) => void; onDelete?: (id: string) => void; onPublish?: (id: string) => void }) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 overflow-hidden opacity-80">
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <DraftBadge />
          <span className="text-zinc-400 text-sm font-medium">{formatRoomType(room.event.roomType)}</span>
        </div>
        <ThreeDotMenu roomId={room.id} onEdit={onEdit} onDelete={onDelete} />
      </div>

      <div className="h-px bg-gradient-to-r from-zinc-500/20 via-zinc-700/50 to-transparent mx-4" />

      <div className="px-4 pt-4 pb-5 space-y-4">
        <div>
          <h3 className="text-white font-bold text-lg sm:text-xl leading-snug">{room.details.title}</h3>
          <p className="text-zinc-500 text-sm mt-1">{room.details.tags.join(" • ")}</p>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div className="flex items-center gap-2 text-zinc-400 text-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Capacity: {formatNumber(room.details.capacity || 0)}
          </div>
          <div className="flex items-center gap-2 text-zinc-400 text-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            {formatScheduleTime(room.details.schedule)}
          </div>
        </div>

        <div className="flex gap-0 -mx-px pb-0">
          <button 
            onClick={() => onEdit?.(room.id)}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 transition-colors text-white font-semibold py-3.5 text-sm rounded-bl-2xl border-t border-zinc-700"
          >
            Edit Draft
          </button>
          <button 
            onClick={() => onPublish?.(room.id)}
            className="flex-1 bg-emerald-500 hover:bg-emerald-400 transition-colors text-white font-semibold py-3.5 text-sm rounded-br-2xl"
          >
            Publish
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component 
export default function LiveRoomsCard() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [draftRooms, setDraftRooms] = useState<ApiRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch current user from /api/auth/me
  const fetchCurrentUser = async (): Promise<string | null> => {
    try {
      const response = await axios.get("/api/auth/host/me", {
        withCredentials: true,
      });
      
      if (response.data?.success && response.data.user?.email) {
        return response.data.user.email;
      }
      return null;
    } catch (error) {
      console.error("Failed to fetch current user:", error);
      return null;
    }
  };

  // Fetch rooms from API
  const fetchRooms = async () => {
    try {
      setLoading(true);
      
      // Get the current user's email from /
      const email = await fetchCurrentUser();
      
      if (!email) {
        setError("User not authenticated. Please login again.");
        setLoading(false);
        return;
      }
      
      console.log("Fetching rooms for user:", email);
      
      // Fetch rooms for this specific user
      const response = await axios.get(`/api/hostrooms?userId=${encodeURIComponent(email)}`, {
        withCredentials: true,
      });
      console.log("Rooms response:", response.data);
      
      if (response.data?.success && response.data.rooms) {
        const apiRooms: ApiRoom[] = response.data.rooms;
        
        // Separate published and draft rooms
        const published = apiRooms.filter(room => room.status === "published");
        const drafts = apiRooms.filter(room => room.status === "draft");
        
        // Transform published rooms to the UI format
        const transformedRooms: Room[] = published.map((room: ApiRoom) => {
          const isLive = isRoomLive(room.details.schedule);
          
          if (isLive) {
            return {
              id: room.id,
              status: "LIVE",
              roomType: formatRoomType(room.event.roomType),
              title: room.details.title,
              tags: room.details.tags,
              watching: Math.floor(Math.random() * 2000) + 100,
              active: Math.floor(Math.random() * 1000) + 50,
              minutesLive: Math.floor((Date.now() - (room.publishedAt || room.createdAt)) / 60000),
              earnings: (room.pricing.pricePerFan * (Math.floor(Math.random() * 500) + 100)),
              currency: room.pricing.currency,
            };
          } else {
            return {
              id: room.id,
              status: "SCHEDULED",
              roomType: formatRoomType(room.event.roomType),
              title: room.details.title,
              time: formatScheduleTime(room.details.schedule),
              tags: room.details.tags,
              capacity: room.details.capacity,
              rsvps: Math.floor(Math.random() * room.details.capacity),
            };
          }
        });
        
        setRooms(transformedRooms);
        setDraftRooms(drafts);
      }
    } catch (err) {
      console.error("Failed to fetch rooms:", err);
      setError("Failed to load rooms. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleEdit = (roomId: string) => {
    router.push(`/host/rooms/edit/${roomId}`);
  };

  const handleDelete = async (roomId: string) => {
    if (confirm("Are you sure you want to delete this room?")) {
      try {
        await axios.delete(`/api/hostrooms/${roomId}`, {
          withCredentials: true,
        });
        fetchRooms(); // Refresh the list
      } catch (err) {
        console.error("Failed to delete room:", err);
        alert("Failed to delete room. Please try again.");
      }
    }
  };

  const handlePublish = async (roomId: string) => {
    try {
      await axios.patch(`/api/hostrooms/${roomId}`, 
        { status: "published" },
        { withCredentials: true }
      );
      fetchRooms(); // Refresh the list
    } catch (err) {
      console.error("Failed to publish room:", err);
      alert("Failed to publish room. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-white">Loading rooms...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-2 lg:mt-35">
      <div className="w-full max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-lg sm:text-xl">
            Live &amp; Upcoming Rooms
          </h2>
          <button 
            onClick={() => router.push("/host/rooms/create")}
            className="bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            + Create Room
          </button>
        </div>

        {/* Draft Rooms Section */}
        {draftRooms.length > 0 && (
          <div className="mb-6">
            <h3 className="text-zinc-400 text-sm font-medium mb-3">Drafts</h3>
            <div className="flex flex-col gap-4">
              {draftRooms.map((room) => (
                <DraftRoomCard 
                  key={room.id} 
                  room={room} 
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onPublish={handlePublish}
                />
              ))}
            </div>
          </div>
        )}

        {/* Published Rooms */}
        <div className="flex flex-col gap-4">
          {rooms.length === 0 && draftRooms.length === 0 ? (
            <div className="text-center py-12 bg-zinc-900 rounded-2xl border border-zinc-800">
              <p className="text-zinc-400">No rooms yet. Create your first room!</p>
              <button 
                onClick={() => router.push("/host/rooms/create")}
                className="mt-4 bg-orange-500 hover:bg-orange-400 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Create Room
              </button>
            </div>
          ) : (
            rooms.map((room) =>
              room.status === "LIVE" ? (
                <LiveRoomCard key={room.id} room={room} onEdit={handleEdit} onDelete={handleDelete} />
              ) : (
                <ScheduledRoomCard key={room.id} room={room} onEdit={handleEdit} onDelete={handleDelete} />
              )
            )
          )}
        </div>
      </div>
    </div>
  );
}


