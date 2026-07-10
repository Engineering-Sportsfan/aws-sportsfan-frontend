


// "use client";


// import { useRouter } from "next/navigation";
// import WatchAlongLobby from "@/src/components/WatchLobby/WatchAlongLobby";
// import IPLPulse from "./pagecontent";
// import { useAuth } from "@/context/AuthContext";


// export default function StorePage() {
//   const router = useRouter();
//   const { user, loading } = useAuth();
//   const hasAccess = user?.email?.endsWith("@sportsfan360.com");

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-black">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
//       </div>
//     );
//   }


//   return (
//     <div className="flex items-center justify-center min-h-screen bg-black">
//       {hasAccess ? (
//         <IPLPulse />
//       ) : (
//         <div className="text-center p-4">
//           <img 
//             src="/images/storesoon.png" 
//             alt="Coming Soon" 
//             className="w-full max-w-[1000px] h-auto object-contain mx-auto"
//           />
          
//         </div>
//       )}
//     </div>
//   );
  
// }




"use client";

import { useRouter } from "next/navigation";
import WatchAlongLobby from "@/src/components/WatchLobby/WatchAlongLobby";
import IPLPulse from "./pagecontent";
import { useAuth } from "@/context/AuthContext";

export default function StorePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const hasAccess = user?.email?.endsWith("@sportsfan360.com");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  // For users with access - render IPL Pulse directly without wrapper styling
  if (hasAccess) {
    return <IPLPulse />;
  }

  // For users without access - show coming soon page
  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="text-center p-4">
        <img 
          src="/images/storesoon.png" 
          alt="Coming Soon" 
          className="w-full max-w-[1000px] h-auto object-contain mx-auto"
        />
      </div>
    </div>
  );
}