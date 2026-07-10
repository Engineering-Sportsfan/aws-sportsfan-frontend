// "use client";

// import { useEffect } from "react";
// import { useSearchParams } from "next/navigation";
// import ClubGamePlan from "@/src/components/ClubProfile-Component/ClubGamePlan/index";
// import ClubProfileActions from "@/src/components/ClubProfile-Component/ClubProfileActions/index";
// import ClubProfileHeader from "@/src/components/ClubProfile-Component/ClubProfileHeader/index";
// import ClubSeasonStats from "@/src/components/ClubProfile-Component/ClubSeasonStats/index";
// import { useClubProfile } from "@/context/ClubProfileContext";

// export default function PlayerProfilePage() {
//   const searchParams = useSearchParams();
//   const teamName = searchParams.get("teamProfile");
  
//   const { 
//     fetchFullProfile, 
//     singleProfile, 
//     seasons,       
//     insights,     
//     strengths,      
//     mediaItems,     
//     loading, 
//     error 
//   } = useClubProfile();

//   useEffect(() => {
//     if (teamName) {
//       fetchFullProfile(teamName);
//     }
//   }, [teamName, fetchFullProfile]);

//   //  Show loading if loading OR no data
//   if (loading || (!singleProfile && !error)) {
//     return (
//       <div className="min-h-screen bg-[#111111] flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
//           <p className="text-gray-400">Loading {teamName} profile...</p>
//         </div>
//       </div>
//     );
//   }


// if (error) {
//   // Check for different error types and show appropriate messages
//   let friendlyMessage = "";
//   let suggestion = "";
  
//   if (error.includes("404") || error.includes("not found")) {
//     friendlyMessage = `"${teamName}" team profile not found`;
//     suggestion = "Please check the team name or try searching for another team.";
//   } else if (error.includes("Network Error") || error.includes("Failed to fetch")) {
//     friendlyMessage = "Unable to connect to the server";
//     suggestion = "Please check your internet connection and try again.";
//   } else if (error.includes("500") || error.includes("Internal Server Error")) {
//     friendlyMessage = "Something went wrong on our end";
//     suggestion = "We're working on fixing this. Please try again in a few moments.";
//   } else if (error.includes("timeout")) {
//     friendlyMessage = "Request timed out";
//     suggestion = "The server is taking too long to respond. Please try again.";
//   } else {
//     friendlyMessage = "Unable to load team profile";
//     suggestion = "Please try again or contact support if the issue persists.";
//   }
  
//   return (
//     <div className="min-h-screen bg-[#111111] flex items-center justify-center p-4">
//       <div className="text-center max-w-md">
//         {/* Error Icon */}
//         <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
//           <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//           </svg>
//         </div>
        
//         {/* Error Message */}
//         <h2 className="text-2xl font-bold text-white mb-2">Oops!</h2>
//         <p className="text-red-400 text-lg mb-2">{friendlyMessage}</p>
//         <p className="text-gray-400 text-sm mb-6">{suggestion}</p>
        
//         {/* Action Buttons */}
//         <div className="flex flex-col sm:flex-row gap-3 justify-center">
//           <button
//             onClick={() => teamName && fetchFullProfile(teamName)}
//             className="bg-red-500 px-6 py-2.5 rounded-lg text-white hover:bg-red-600 transition-colors"
//           >
//             Try Again
//           </button>
//           <button
//             onClick={() => window.location.href = "/MainModules/HomePage"}
//             className="bg-gray-700 px-6 py-2.5 rounded-lg text-white hover:bg-gray-600 transition-colors"
//           >
//             Go to Homepage
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

//   // No data state
//   if (!singleProfile) {
//     return (
//       <div className="min-h-screen bg-[#111111] flex items-center justify-center">
//         <p className="text-gray-400">No profile found for &apos;{teamName}&apos;</p>
//       </div>
//     );
//   }

//   // Prepare club object with all data from context
//   const clubData = {
//     ...singleProfile,
//     season: seasons?.[0] || singleProfile.season,
//     insights: insights?.length ? insights : singleProfile.insights,
//     strengths: strengths?.length ? strengths : singleProfile.strengths,
//     media: mediaItems?.length ? mediaItems : singleProfile.media,
//   };

//   return (
//     <div className="min-h-screen bg-[#111111] font-sans">
//       {/* Sticky Top Nav */}
//       <div className="sticky top-0 z-50 flex items-center px-4 md:px-8 lg:px-12 py-3.5 bg-[#111111]/90 backdrop-blur-md border-b border-[#1f1f1f]">
//         <button
//           className="bg-transparent border-0 p-0 cursor-pointer text-[#e0e0e0] flex items-center hover:text-white transition-colors"
//           onClick={() => window.history.back()}
//         >
//           <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
//             <path d="M19 12H5" />
//             <path d="M12 5l-7 7 7 7" />
//           </svg>
//         </button>
//         <span className="flex-1 text-center text-[17px] md:text-xl font-bold text-white tracking-tight">
//           Teams Profile
//         </span>
//         <div className="w-[22px]" />
//       </div>

//       {/* Content wrapper */}
//       <div className="w-full max-w-[1280px] mx-auto">
//         {/* Mobile + Tablet: single column */}
//         <div className="block lg:hidden">
//           <div className="max-w-[640px] mx-auto">
//             <ClubProfileHeader club={clubData} />
//             <ClubProfileActions club={clubData} />
//             <ClubSeasonStats club={clubData} />
//             <ClubGamePlan club={clubData} />
//           </div>
//         </div>

//         {/* Desktop: two-column layout */}
//         <div className="hidden lg:flex lg:items-start lg:gap-6 xl:gap-8 px-8 xl:px-12 py-6">
//           {/* Left column — sticky sidebar */}
//           <div className="sticky top-[65px] w-[360px] xl:w-[400px] shrink-0 flex flex-col overflow-y-auto max-h-[calc(150vh-65px)] [scrollbar-width:none]">
//             <ClubProfileHeader club={clubData} />
//             <ClubProfileActions club={clubData} />
//           </div>

//           {/* Right column — scrollable content */}
//           <div className="flex-1 min-w-0 flex flex-col pb-10">
//             <ClubSeasonStats club={clubData} />
//             <ClubGamePlan club={clubData} />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }











// app/MainModules/ClubsProfile/page.tsx
import { Suspense } from "react";
import ClubProfileContent from "./ClubProfileContent";

export default function PlayerProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    }>
      <ClubProfileContent />
    </Suspense>
  );
}