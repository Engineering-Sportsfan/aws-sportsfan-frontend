"use client";

export default function FanPollCard() {
  return (
    <div className="flex flex-col justify-between bg-[#111111] border border-gray-800 rounded-xl p-4 w-full h-full min-h-[340px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-bold text-lg">Fan Poll</h3>
        <span className="text-[#ff2a5f] text-sm font-medium cursor-pointer">See all</span>
      </div>

      <div className="bg-[#1a1a1a] rounded-lg p-4 flex-grow">
        <p className="text-white text-sm font-semibold mb-4">Which team will Harmanpreet lead to the semi-finals?</p>
        
        <div className="space-y-2 mb-4">
          <div className="relative w-full h-10 bg-[#2a2a2a] rounded-lg overflow-hidden flex items-center px-3 cursor-pointer">
            <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#e91e63] to-[#ff9800]" style={{width: '65%'}}></div>
            <span className="relative text-white text-sm font-medium z-10 w-full flex justify-between">
              <span>India</span> <span>65%</span>
            </span>
          </div>
          
          <div className="relative w-full h-10 bg-[#2a2a2a] rounded-lg overflow-hidden flex items-center px-3 cursor-pointer hover:bg-gray-700 transition-colors">
            <div className="absolute top-0 left-0 h-full bg-[#333333]" style={{width: '15%'}}></div>
            <span className="relative text-white text-sm font-medium z-10 w-full flex justify-between">
              <span>Australia</span> <span>15%</span>
            </span>
          </div>

          <div className="relative w-full h-10 bg-[#2a2a2a] rounded-lg overflow-hidden flex items-center px-3 cursor-pointer hover:bg-gray-700 transition-colors">
            <div className="absolute top-0 left-0 h-full bg-[#333333]" style={{width: '12%'}}></div>
            <span className="relative text-white text-sm font-medium z-10 w-full flex justify-between">
              <span>England</span> <span>12%</span>
            </span>
          </div>

          <div className="relative w-full h-10 bg-[#2a2a2a] rounded-lg overflow-hidden flex items-center px-3 cursor-pointer hover:bg-gray-700 transition-colors">
            <div className="absolute top-0 left-0 h-full bg-[#333333]" style={{width: '8%'}}></div>
            <span className="relative text-white text-sm font-medium z-10 w-full flex justify-between">
              <span>New Zealand</span> <span>8%</span>
            </span>
          </div>
        </div>

        <p className="text-gray-400 text-xs">1.8K votes &nbsp;.&nbsp; 1h left</p>
      </div>

      <div className="flex items-center justify-between text-gray-500 mt-4 px-1">
        <div className="flex gap-4">
          <button className="flex items-center gap-1 hover:text-[#ff2a5f] transition-colors"><span className="text-sm">♡</span> <span className="text-xs">412</span></button>
          <button className="flex items-center gap-1 hover:text-white transition-colors"><span className="text-sm">💬</span> <span className="text-xs">78</span></button>
          <button className="flex items-center gap-1 hover:text-green-500 transition-colors"><span className="text-sm">🔁</span> <span className="text-xs">56</span></button>
        </div>
        <button className="flex items-center gap-1 hover:text-white transition-colors"><span className="text-sm">📤</span> <span className="text-xs">Share</span></button>
      </div>
    </div>
  );
}
