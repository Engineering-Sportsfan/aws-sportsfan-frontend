// components\NewHomeComponents\WatchAlongSessions.tsx

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default function WatchAlongSessions() {
  return (
    <div className="w-full mt-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[17px] font-extrabold text-white">Watch Along Sessions</h3>
        <button
          type="button"
          className="flex items-center gap-0.5 text-[12px] font-bold"
          style={{ color: "#E91E8C" }}
        >
          View all
          <ChevronRight size={14} />
        </button>
      </div>

      <div
        className="rounded-2xl overflow-hidden p-4"
        style={{ background: "linear-gradient(160deg,#2a0f3d,#12071f)" }}
      >
        <div className="flex gap-3.5">
          <div className="relative w-[92px] h-[92px] rounded-2xl overflow-hidden shrink-0 border border-white/10">
            <img
              src="/images/with_ananad.png"
              alt="indvssl"
              className="w-full h-full object-cover"
            />
            {/* <span className="absolute top-1.5 left-1.5 flex items-center gap-1 text-[9px] font-extrabold text-emerald-300 bg-black/50 px-1.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE
            </span> */}
          </div>

          <div className="min-w-0">
            <h4 className="text-[16px] font-extrabold text-white leading-tight mb-1">
              Watch India vs Sri Lanka 
            </h4>
            <p className="text-[13px] font-bold text-violet-400 mb-2">With Anand Vasu</p>
            <p className="text-[12px] text-white/50 leading-snug">
              Join expert Anand Vasu and hundreds of fans. Live reactions, insights &amp; more!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 mt-3">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-[11px] font-semibold text-white/50">
            Starts on 23 Aug 2026
          </span>
        </div>

        {/* <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-2">
              <img
                src="/images/avatars/fan-1.jpg"
                alt=""
                className="w-6 h-6 rounded-full border-2 border-[#1a0a2b] object-cover"
              />
              <img
                src="/images/avatars/fan-2.jpg"
                alt=""
                className="w-6 h-6 rounded-full border-2 border-[#1a0a2b] object-cover"
              />
              <img
                src="/images/avatars/fan-3.jpg"
                alt=""
                className="w-6 h-6 rounded-full border-2 border-[#1a0a2b] object-cover"
              />
            </div>
            <span className="text-[11px] font-semibold text-white/50">1.2K</span>
          </div>
        </div> */}

        <motion.button
          whileTap={{ scale: 0.97 }}
          className="w-full mt-3 py-3.5 rounded-full font-extrabold text-white text-[14px]"
          style={{ background: "linear-gradient(135deg,#E91E8C,#FF6B35)" }}
        >
          <Link href="/MainModules/WatchAlong/room/9caf8851-4ab2-4240-8e2d-b35238f3855c">
            Join Session
          </Link>
        
        </motion.button>
      </div>
    </div>
  );
}