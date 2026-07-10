"use client";

export default function MetricOfTheDayCard() {
  return (
    <div className="flex flex-col justify-between bg-[#111111] border border-gray-800 rounded-xl p-4 w-full h-full min-h-[340px]">
      <h3 className="text-white font-bold text-lg mb-4">Metric of the Day</h3>

      <div className="flex-grow flex flex-col justify-center items-center">
        <div className="bg-gradient-to-r from-[#111111] to-[#800f45] border border-gray-800 rounded-2xl w-full p-6 flex items-center justify-center gap-6 relative overflow-hidden">
          {/* Subtle background zig-zag pattern simulation */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px' }}></div>
          
          <div className="z-10 flex items-center gap-6 w-full max-w-[280px]">
            <h2 className="text-white text-6xl font-black tracking-tighter">67%</h2>
            <div className="h-16 w-[2px] bg-white/80 rounded-full"></div>
            <p className="text-white text-sm font-medium leading-snug">
              Portugal have won 67% of their matches when Ronaldo scores.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-gray-500 mt-6 pt-4 border-t border-gray-800 px-1">
        <div className="flex gap-4">
          <button className="flex items-center gap-1 hover:text-[#ff2a5f] transition-colors"><span className="text-sm">♡</span> <span className="text-xs">276</span></button>
          <button className="flex items-center gap-1 hover:text-white transition-colors"><span className="text-sm">💬</span> <span className="text-xs">43</span></button>
          <button className="flex items-center gap-1 hover:text-green-500 transition-colors"><span className="text-sm">🔁</span> <span className="text-xs">31</span></button>
        </div>
        <button className="flex items-center gap-1 hover:text-white transition-colors"><span className="text-sm">📤</span> <span className="text-xs">Share</span></button>
      </div>
    </div>
  );
}