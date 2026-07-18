// app/MainModules/WatchAlong/room/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWatchAlong, Room } from "@/context/WatchAlongContext";
import WatchRoom from "@/src/components/WatchLobby/Watchroom";
import PreJoinLobby from "@/src/components/WatchLobby/PreJoinLobby";

const MOCK_ROOMS: Record<string, Room> = {
  "abhinav-bindra": {
    id: "abhinav-bindra",
    name: "Abhinav Bindra",
    role: "Olympic Gold Medalist & Shooting Legend",
    badge: "Olympic Gold",
    badgeColor: "bg-yellow-500",
    borderColor: "border-yellow-500/50",
    watching: "142",
    engagement: "98",
    active: "9.5",
    isLive: true,
    liveMatchId: "663f22ac71d9d95f87bdf51a",
    displayPicture: ""
  },
  "pullela-gopichand": {
    id: "pullela-gopichand",
    name: "Pullela Gopichand",
    role: "All England Champion & Badminton Coach",
    badge: "Legend",
    badgeColor: "bg-blue-600",
    borderColor: "border-blue-500/50",
    watching: "98",
    engagement: "96",
    active: "8.8",
    isLive: true,
    liveMatchId: "663f22ac71d9d95f87bdf51a",
    displayPicture: ""
  },
  "rajaraman-g": {
    id: "rajaraman-g",
    name: "Rajaraman G",
    role: "Senior Sports Journalist & Analyst",
    badge: "Pro Analyst",
    badgeColor: "bg-pink-600",
    borderColor: "border-pink-500/50",
    watching: "56",
    engagement: "92",
    active: "7.4",
    isLive: true,
    liveMatchId: "663f22ac71d9d95f87bdf51a",
    displayPicture: ""
  },
  "daily-standup": {
    id: "daily-standup",
    name: "Team Standup",
    role: "Internal Staff Meeting",
    badge: "Private",
    badgeColor: "bg-green-600",
    borderColor: "border-green-500/50",
    watching: "12",
    engagement: "100",
    active: "10",
    isLive: true,
    liveMatchId: "663f22ac71d9d95f87bdf51a",
    displayPicture: ""
  }
};

export default function WatchRoomPage() {
  const params = useParams();
  const router = useRouter();
  const rawRoomId = params?.id as string;
  const roomId = rawRoomId ? rawRoomId.split('?')[0] : "";
  
  const [hasJoined, setHasJoined] = useState(false);
  const [hasStartedFetching, setHasStartedFetching] = useState(false);
  
  const { 
    rooms,
    fetchRooms,
    matches,
    fetchMatches,
    currentRoom, 
    fetchRoomById, 
    loading,
    error 
  } = useWatchAlong();

  const isMockRoom = roomId in MOCK_ROOMS;

  useEffect(() => {
    fetchRooms();
    fetchMatches();
  }, [fetchRooms, fetchMatches]);

  useEffect(() => {
    if (roomId && !isMockRoom) {
      fetchRoomById(roomId);
      setHasStartedFetching(true);
    }
  }, [roomId, fetchRoomById, isMockRoom]);

  // Load active match and room details
  const activeMatchId = rooms.find(r => r.liveMatchId)?.liveMatchId 
    || matches[0]?.id 
    || "663f22ac71d9d95f87bdf51a";
      
  const roomDetails = isMockRoom 
    ? { ...MOCK_ROOMS[roomId], liveMatchId: activeMatchId } as Room
    : currentRoom as Room;

  if (isMockRoom) {
    if (!hasJoined) {
      return (
        <PreJoinLobby 
          room={roomDetails} 
          onJoin={() => setHasJoined(true)} 
          onBack={() => router.push("/MainModules/WatchAlong")} 
        />
      );
    }

    return (
      <WatchRoom
        room={roomDetails} 
        onBack={() => router.push("/MainModules/WatchAlong")}
      />
    );
  }

  if (((!isMockRoom && !hasStartedFetching) || loading) && !currentRoom) {
    return (
      <div className="min-h-screen bg-[#111] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error && !currentRoom) {
    return (
      <div className="min-h-screen bg-[#111] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => router.push("/MainModules/WatchAlong")}
            className="text-pink-500 hover:text-pink-400"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!currentRoom) {
    return (
      <div className="min-h-screen bg-[#111] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Room not found</p>
          <button 
            onClick={() => router.push("/MainModules/WatchAlong")}
            className="mt-4 text-pink-500 hover:text-pink-400"
          >
            Go Back 
          </button>
        </div>
      </div>
    );
  }

  if (!hasJoined) {
    return (
      <PreJoinLobby 
        room={roomDetails} 
        onJoin={() => setHasJoined(true)} 
        onBack={() => router.push("/MainModules/WatchAlong")} 
      />
    );
  }

  return (
    <WatchRoom
      room={roomDetails} 
      onBack={() => router.push("/MainModules/WatchAlong")}
    />
  );
}