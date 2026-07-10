// components/HomeComponents/Sidebar.tsx
import Link from "next/link";

export default function Sidebar() {
  return (
    <div className="absolute inset-0 w-full h-full border-r border-pink-500/20 p-4 overflow-y-auto">
      <Link href="/MainModules/ROAR" className="block w-full">
        <div className="text-xl font-bold mb-6 cursor-pointer hover:text-pink-500 transition text-white">
          SportsFan360
        </div>
      </Link>

      {["Feed", "Watch Along", "Fan Battle", "Store", "Fan Zone"].map((item) => (
        <div key={item} className="mb-4 text-gray-400 hover:text-pink-500 cursor-pointer">
          {item}
        </div>
      ))}
    </div>
  );
}