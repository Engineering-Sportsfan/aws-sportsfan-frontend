"use client";

import { useState } from "react";
import AskDolly from "./AskDolly";

interface Topic {
  title: string;
  badge: string;
  badgeStyle: string;
}

const topics: Topic[] = [
  {
    title: "Ronaldo\'s 6th WC - Legacy Cemented?",
    badge: "POSITIVE",
    badgeStyle: "bg-transparent border border-green-500 text-green-500",
  },
  {
    title: "Diogo Jota - Portugal\'s Emotional Call",
    badge: "SAD",
    badgeStyle: "bg-[#e91e63] border border-[#e91e63] text-white",
  },
  {
    title: "Germany\'s New Generation",
    badge: "EXCITED",
    badgeStyle: "bg-[#7c3aed] border border-[#7c3aed] text-white",
  },
  {
    title: "Haaland\'s First World Cup",
    badge: "EXCITED",
    badgeStyle: "bg-[#7c3aed] border border-[#7c3aed] text-white",
  },
];

export default function FansDiscussingCard() {
  const [dollyOpen, setDollyOpen] = useState(false);
  const [dollyPrefill, setDollyPrefill] = useState("");

  const openDolly = (prefill: string) => {
    setDollyPrefill(prefill);
    setDollyOpen(true);
  };

  return (
    <>
      <div className="flex flex-col justify-between bg-[#111111] border border-gray-800 rounded-xl p-4 w-full h-full min-h-[340px]">
        <h3 className="text-white font-bold text-lg mb-3">Fans are discussing</h3>

        <div className="flex flex-col gap-2 flex-grow">
          {topics.map((topic, idx) => (
            <div
              key={idx}
              onClick={() => openDolly(topic.title)}
              className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-3 flex items-center justify-between gap-3 cursor-pointer hover:border-gray-600 transition-colors"
            >
              {/* Fire icon container */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0 w-10 h-10 bg-[#1e2d4e] rounded-xl flex items-center justify-center text-lg">
                  🔥
                </div>
                <p className="text-white text-xs font-medium leading-snug">{topic.title}</p>
              </div>

              {/* Badge + Percent */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap ${topic.badgeStyle}`}>
                  {topic.badge}
                </span>
                <span className="text-white text-xs font-bold w-8 text-right">82%</span>
              </div>
            </div>
          ))}
        </div>

        {/* Ask Dolly CTA */}
        <div
          onClick={() => openDolly("")}
          className="mt-4 pt-4 border-t border-gray-800 flex justify-between items-center cursor-pointer hover:bg-gray-800/30 px-1 py-2 rounded-xl transition-colors"
        >
          <span className="text-white text-sm font-medium">Ask Dolly about any topic</span>
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #ff2a5f 0%, #ff6b1a 100%)" }}
          >
            ✨
          </div>
        </div>
      </div>

      {dollyOpen && (
        <AskDolly onClose={() => setDollyOpen(false)} prefill={dollyPrefill} />
      )}
    </>
  );
}