"use client";

function HeartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function RetweetIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}

export default function TrendingAdsCard() {
  return (
    <div className="flex flex-col justify-between bg-[#111111] border border-gray-800 rounded-xl p-4 w-full h-full min-h-[400px]">
      <h3 className="text-white font-bold text-lg mb-3">Trending Ads</h3>

      {/* Two ad panels */}
      <div className="flex gap-2 mb-4">
        {/* Spiking */}
        <div className="flex-1 bg-[#1a1a1a] rounded-xl p-3">
          <p className="text-[#ffeb3b] text-[10px] font-bold mb-1 uppercase tracking-wide">
            Spiking
          </p>
          <p className="text-white text-xs font-semibold mb-0.5 leading-tight">Orange</p>
          <p className="text-gray-400 text-[10px] mb-2 leading-tight">
            &lsquo;French footballers as terrible actors&rsquo;
          </p>
          <div className="w-full h-20 rounded-lg overflow-hidden mb-3">
            <img
              src="/images/ad-football-shoe.jpg"
              alt="Orange ad"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex justify-between items-center text-[9px] font-bold mb-1">
            <span className="text-green-500 tracking-wider">VIRALITY</span>
            <span className="text-green-500">92%</span>
          </div>
          <div className="w-full bg-gray-800 h-1 rounded-full">
            <div className="bg-green-500 h-1 rounded-full" style={{ width: "92%" }} />
          </div>
        </div>

        {/* Misfired */}
        <div className="flex-1 bg-[#1a1a1a] rounded-xl p-3">
          <p className="text-[#ff2a5f] text-[10px] font-bold mb-1 uppercase tracking-wide">
            Misfired
          </p>
          <p className="text-white text-xs font-semibold mb-0.5 leading-tight">
            American Airlines
          </p>
          <p className="text-gray-400 text-[10px] mb-2 leading-tight">
            &lsquo;French footballers as terrible actors&rsquo;
          </p>
          <div className="w-full h-20 rounded-lg overflow-hidden mb-3">
            <img
              src="/images/ad-football-shoe-2.jpg"
              alt="American Airlines ad"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex justify-between items-center text-[9px] font-bold mb-1">
            <span className="text-[#ff2a5f] tracking-wider">FAN AWARENESS</span>
            <span className="text-[#ff2a5f]">18%</span>
          </div>
          <div className="w-full bg-gray-800 h-1 rounded-full">
            <div className="bg-[#ff2a5f] h-1 rounded-full" style={{ width: "18%" }} />
          </div>
        </div>
      </div>

      {/* Poll section */}
      <div className="bg-[#1a1a1a] rounded-xl p-3 flex-grow">
        <p className="text-white text-xs font-semibold mb-3">
          Which brand understood football culture better?
        </p>
        <div className="space-y-2 mb-3">
          {/* Orange bar */}
          <div className="relative w-full h-7 bg-gray-800 rounded-lg overflow-hidden flex items-center">
            <div
              className="absolute top-0 left-0 h-full rounded-lg"
              style={{ width: "70%", backgroundColor: "#8b5a2b" }}
            />
            <div className="relative z-10 w-full flex justify-between items-center px-3">
              <span className="text-white text-[11px] font-bold">Orange</span>
              <span className="text-white text-[11px] font-bold">70%</span>
            </div>
          </div>
          {/* American Airlines bar */}
          <div className="relative w-full h-7 bg-gray-800 rounded-lg overflow-hidden flex items-center">
            <div
              className="absolute top-0 left-0 h-full bg-gray-600 rounded-lg"
              style={{ width: "30%" }}
            />
            <div className="relative z-10 w-full flex justify-between items-center px-3">
              <span className="text-white text-[11px] font-bold">American Airlines</span>
              <span className="text-white text-[11px] font-bold">30%</span>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-xs">1.2K votes</span>
          <button className="bg-gradient-to-r from-[#ff2a5f] to-orange-500 text-white text-[11px] font-bold px-4 py-1.5 rounded-full hover:opacity-90 transition-opacity">
            VOTE
          </button>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between text-gray-500 mt-4 px-1">
        <div className="flex gap-5">
          <button className="flex items-center gap-1.5 hover:text-[#ff2a5f] transition-colors">
            <HeartIcon />
            <span className="text-xs">276</span>
          </button>
          <button className="flex items-center gap-1.5 hover:text-white transition-colors">
            <CommentIcon />
            <span className="text-xs">43</span>
          </button>
          <button className="flex items-center gap-1.5 hover:text-green-500 transition-colors">
            <RetweetIcon />
            <span className="text-xs">31</span>
          </button>
        </div>
        <button className="flex items-center gap-1.5 hover:text-white transition-colors">
          <ShareIcon />
          <span className="text-xs">Share</span>
        </button>
      </div>
    </div>
  );
}