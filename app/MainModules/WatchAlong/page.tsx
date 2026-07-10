


"use client";


import { useRouter } from "next/navigation";
import WatchAlongLobby from "@/src/components/WatchLobby/WatchAlongLobby";


export default function WatchAlongPage() {
  const router = useRouter();
//   const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const handleEnterRoom = (roomId: string) => {
   
    router.push(`/MainModules/WatchAlong/room/${roomId}`);
  };


  return (
    <WatchAlongLobby onEnterRoom={handleEnterRoom} />
  );

  
}



// "use client";

// import Image from "next/image";
// import Link from "next/link";
// import { ChevronLeft } from "lucide-react";

// export default function WatchAlongPage() {
//   return (
//     <div className="relative flex items-center justify-center w-full h-full min-h-screen">
//       <Link
//         href="/MainModules/ROAR"
//         className="absolute top-4 left-4 flex items-center text-gray-400 hover:text-gray-900 transition-colors"
//       >
//         <ChevronLeft className="w-6 h-6" /> Back
//       </Link>

//       <Image
//         src="/images/watchsoon.png"
//         alt="Coming Soon"
//         width={600}
//         height={400}
//         className="object-contain"
//         priority
//       />
//     </div>
//   );
// }