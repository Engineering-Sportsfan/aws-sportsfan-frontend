// MainModules/PlayersProfile/page.tsx
import { Suspense } from "react";
import FifaPlayer360CardsSection from "./pagecontent";



export default function FifaPlayerProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#111] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        <p className="text-white">Loading player data...</p>
      </div>
    }>
      <FifaPlayer360CardsSection />
    </Suspense>
  );
}