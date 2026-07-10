"use client";

import React, { useState } from "react";

type Message = {
  user: string;
  time: string;
  text: string;
  color: string;
};

const messages: Message[] = [
  { user: "Rajesh", time: "00:12", text: "Amazing shot! 🔥", color: "#f97316" },
  { user: "Priya", time: "00:15", text: "What a catch!", color: "#ec4899" },
  { user: "Arjun", time: "00:18", text: "RCB needs wickets here", color: "#3b82f6" },
  { user: "Neha", time: "00:21", text: "Great analysis!", color: "#a855f7" },
  { user: "Vikram", time: "00:24", text: "Rohit on fire 🔥", color: "#10b981" },
];

export default function RightChatPanel() {
  const [tab, setTab] = useState<"all" | "privately">("all");
  const [inputVal, setInputVal] = useState("");

  return (
    <div className="flex flex-col bg-[#111318] border-l border-[#2a2d35]">
      {/* Zone D header */}
      <div className="px-4 pt-3 pb-2 border-b border-[#2a2d35]">
        <p className="text-[9px] font-bold tracking-widest text-[#6b7280] uppercase mb-2">
          Zone D — Live Chat
        </p>
        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setTab("all")}
            className={`flex-1 py-1.5 rounded-full text-[11px] font-semibold transition-colors ${
              tab === "all"
                ? "bg-[#ec4899] text-white"
                : "bg-[#1e2128] text-[#9ca3af] hover:text-white"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setTab("privately")}
            className={`flex-1 py-1.5 rounded-full text-[11px] font-semibold transition-colors ${
              tab === "privately"
                ? "bg-[#ec4899] text-white"
                : "bg-[#1e2128] text-[#9ca3af] hover:text-white"
            }`}
          >
            Privately
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 min-h-0">
        {messages.map((msg, i) => (
          <div key={i} className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span
                className="text-[11px] font-bold"
                style={{ color: msg.color }}
              >
                {msg.user}
              </span>
              <span className="text-[9px] text-[#4b5563]">{msg.time}</span>
            </div>
            <p className="text-[12px] text-[#d1d5db]">{msg.text}</p>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="px-3 pb-3 border-t border-[#2a2d35] pt-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Type message..."
            className="flex-1 bg-[#1e2128] border border-[#2e3340] text-white text-[11px] placeholder-[#4b5563] rounded-lg px-3 py-2 outline-none focus:border-[#ec4899] transition-colors"
          />
          <button className="bg-[#ec4899] hover:bg-[#db2777] text-white text-[11px] font-semibold px-4 py-2 rounded-lg transition-colors">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}