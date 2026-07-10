"use client";

import LeftSidebar from "@/src/components/LiveControlPanelComponents/Leftsidebar";
import MiddlePanel from "@/src/components/LiveControlPanelComponents/Middlepanel";
import RightChatPanel from "@/src/components/LiveControlPanelComponents/Rightchatpanel";
import RightFansPanel from "@/src/components/LiveControlPanelComponents/Rightfanspanel";
import TopHeader from "@/src/components/LiveControlPanelComponents/Topheader ";
import React from "react";


export default function LiveRoomPage() {
  return (
    <div className="flex flex-col h-screen w-[100%] bg-[#0d0f14] text-white overflow-hidden font-sans">
      {/* Top Header */}
      <TopHeader />

      {/* Main layout: Left | Middle | Right (chat + fans stacked) */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left Sidebar */}
        <LeftSidebar />

        {/* Middle Panel (stream + bottom bar) */}
        <MiddlePanel />

        {/* Right Column: Chat on top, Fans on bottom */}
        <div className="w-[260px] flex flex-col flex-shrink-0 overflow-hidden">
          {/* Zone D — Live Chat (top 60%) */}
          <div className="flex flex-col min-h-0 overflow-hidden" style={{ flex: "6" }}>
            <RightChatPanel />
          </div>
          {/* Top Fans + Super Fan Queue (bottom 40%) */}
          <div className="flex flex-col overflow-y-auto flex-shrink-0" style={{ flex: "4" }}>
            <RightFansPanel />
          </div>
        </div>
      </div>
    </div>
  );
}