
// "use client";

// import Link from "next/link";
// import Image from "next/image";
// import { usePathname } from "next/navigation";
// import { useAuth } from "@/context/AuthContext";
// import { Sparkles } from "lucide-react";

// // type NavItem = {
// //   name: string;
// //   logo: string | React.ReactElement;  // changed from string
// //   url?: string;
// // };

// type NavItem = {
//   name: string;
//   logo?: string | React.ReactElement;
//   icon?: React.ReactElement;
//   url?: string;
//   href?: string;
// };

// export default function BottomNav() {
//   const pathname = usePathname();
//   const { user } = useAuth();

//   const bottomNavData: NavItem[] = [
//     // { name: "Feed", logo: "/images/feed.png", url: "/MainModules/HomePage" },
   
//     // { name: "Fan Battle", logo: "/images/battle.png", url: "/MainModules/Fantasy" },
//     { 
//       name: "Roar", 
//       // logo: "/images/roar.png",
//        logo: (
//         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5 shrink-0">
//           <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c4.4 0 8 3.6 8 8 0 3.8-2.7 7-6.3 7.8-.6.1-1 .6-1 1.2v.5c0 .8-.7 1.5-1.5 1.5S9.7 21.3 9.7 20.5V20c0-.6-.4-1.1-1-1.2C5.1 18 2.4 14.8 2.4 11c0-4.4 3.6-8 8-8h1.6Z" />
//           <path strokeLinecap="round" strokeLinejoin="round" d="M9 9.5c.6-.9 1.5-1.5 3-1.5 1.8 0 3 1.1 3 2.7 0 2.6-3.2 2.7-3.2 5.3" />
//           <circle cx="12" cy="17.5" r="0.8" fill="currentColor" stroke="none" />
//         </svg>
//       ),
//       url: "/MainModules/ROAR" 
//     },
//      { name: "Watch Along", logo: "/images/watchalong2.png", url: "/MainModules/WatchAlong" },
//       { 
//       name: "Ask AI", 
//       logo: <Sparkles className="w-5 h-5 text-gradient" />,
//       url: "/MainModules/AskAI" 
//     },
//     { name: "Fan Zone",
//       //  logo: "/images/profile.png", 
//       logo: (
//     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
//       <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
//       <circle cx="9" cy="7" r="4"/>
//       <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
//       <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
//     </svg>
//   ),
//        url: "/MainModules/Fanszone" },
//   ];

//   return (
//     <div className="fixed bottom-0 left-0 w-full bg-black border-t border-pink-500/30 py-2 flex justify-around z-40 overflow-x-hidden">
//       {bottomNavData.map((item, i) => {
//         const isActive = item.url ? pathname.startsWith(item.url) : false;

//         return (
//           <Link
//             key={i}
//             href={item.url || "#"}
//             className="flex-1 min-w-0 flex flex-col items-center text-[10px] sm:text-xs"
//           >
//             <div className={`mb-1 transition-opacity ${isActive ? "opacity-100" : "opacity-50"}`}>
//               {typeof item.logo === "string" ? (  // changed: branch on type
//                 <Image
//                   src={item.logo}
//                   alt={item.name}
//                   width={18}
//                   height={18}
//                   className={`object-contain transition-all ${isActive ? "drop-shadow-[0_0_6px_rgba(244,114,182,0.7)]" : ""}`}
//                 />
//               ) : (
//                 <span className={`transition-all ${isActive ? "text-pink-500 drop-shadow-[0_0_6px_rgba(244,114,182,0.7)]" : "text-gray-400"}`}>
//                   {item.logo}
//                 </span>
//               )}
//             </div>
//             <span className={`transition-colors truncate max-w-[72px] ${isActive ? "text-pink-500 font-semibold" : "text-gray-400"}`}>
//               {item.name}
//             </span>
//           </Link>
//         );
//       })}
//     </div>
//   );
// }





"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Sparkles } from "lucide-react";

type NavItem = {
  name: string;
  logoInactive: string | React.ReactElement;
  logoActive?: string | React.ReactElement;  // Active version (only for images)
  url?: string;
};

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const bottomNavData: NavItem[] = [
    { 
      name: "Roar", 
      // logoInactive: "/images/roar.png",  // Replace with your inactive image URL
       logoInactive: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5 shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c4.4 0 8 3.6 8 8 0 3.8-2.7 7-6.3 7.8-.6.1-1 .6-1 1.2v.5c0 .8-.7 1.5-1.5 1.5S9.7 21.3 9.7 20.5V20c0-.6-.4-1.1-1-1.2C5.1 18 2.4 14.8 2.4 11c0-4.4 3.6-8 8-8h1.6Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 9.5c.6-.9 1.5-1.5 3-1.5 1.8 0 3 1.1 3 2.7 0 2.6-3.2 2.7-3.2 5.3" />
          <circle cx="12" cy="17.5" r="0.8" fill="currentColor" stroke="none" />
        </svg>
      ),
      logoActive: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5 shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c4.4 0 8 3.6 8 8 0 3.8-2.7 7-6.3 7.8-.6.1-1 .6-1 1.2v.5c0 .8-.7 1.5-1.5 1.5S9.7 21.3 9.7 20.5V20c0-.6-.4-1.1-1-1.2C5.1 18 2.4 14.8 2.4 11c0-4.4 3.6-8 8-8h1.6Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 9.5c.6-.9 1.5-1.5 3-1.5 1.8 0 3 1.1 3 2.7 0 2.6-3.2 2.7-3.2 5.3" />
          <circle cx="12" cy="17.5" r="0.8" fill="currentColor" stroke="none" />
        </svg>
      ), // Replace with your active image URL
      url: "/MainModules/ROAR" 
    },
    { 
      name: "Watch Along", 
      logoInactive: "/images/watchalong2.png",  // Replace with your inactive image URL
      logoActive: "/images/watchalongactive.png",  // Replace with your active image URL
      url: "/MainModules/WatchAlong" 
    },
    { 
      name: "Ask AI", 
      logoInactive: <Sparkles className="w-5 h-5 text-gray-400" />,
      logoActive: <Sparkles className="w-5 h-5 text-pink-500 drop-shadow-[0_0_6px_rgba(244,114,182,0.7)]" />,
      url: "/MainModules/AskAI" 
    },
    { 
      name: "Profile",
      logoInactive: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      logoActive: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      url: "/MainModules/Profile" 
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-black border-t border-pink-500/30 py-2 flex justify-around z-40 overflow-x-hidden">
      {bottomNavData.map((item, i) => {
        const isActive = item.url ? pathname.startsWith(item.url) : false;
        
        // Determine which logo to show
        const getLogo = () => {
          if (isActive && item.logoActive) {
            // If active and has active version
            if (typeof item.logoActive === "string") {
              return (
                <Image
                  src={item.logoActive}
                  alt={item.name}
                  width={20}
                  height={20}
                  className="object-contain drop-shadow-[0_0_6px_rgba(244,114,182,0.7)]"
                />
              );
            }
            return (
              <span className="text-pink-500 drop-shadow-[0_0_6px_rgba(244,114,182,0.7)]">
                {item.logoActive}
              </span>
            );
          } else {
            // Inactive state
            if (typeof item.logoInactive === "string") {
              return (
                <Image
                  src={item.logoInactive}
                  alt={item.name}
                  width={20}
                  height={20}
                  className="object-contain opacity-50"
                />
              );
            }
            return (
              <span className="text-gray-400">
                {item.logoInactive}
              </span>
            );
          }
        };

        return (
          <Link
            key={i}
            href={item.url || "#"}
            className="flex-1 min-w-0 flex flex-col items-center text-[10px] sm:text-xs"
          >
            <div className="mb-1">
              {getLogo()}
            </div>
            <span className={`transition-colors flex flex-row whitespace-nowrap max-w-[72px] ${isActive ? "text-pink-500 font-semibold" : "text-gray-400"}`}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}