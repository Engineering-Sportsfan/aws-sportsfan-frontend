"use client";
import { createContext, useContext, useState } from "react";

const RoarRoomContext = createContext<{
  isInRoom: boolean;
  setIsInRoom: (v: boolean) => void;
}>({ isInRoom: false, setIsInRoom: () => {} });

export function RoarRoomProvider({ children }: { children: React.ReactNode }) {
  const [isInRoom, setIsInRoom] = useState(false);
  return (
    <RoarRoomContext.Provider value={{ isInRoom, setIsInRoom }}>
      {children}
    </RoarRoomContext.Provider>
  );
}

export const useRoarRoom = () => useContext(RoarRoomContext);