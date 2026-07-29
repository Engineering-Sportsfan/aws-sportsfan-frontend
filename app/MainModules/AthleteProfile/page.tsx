import { Suspense } from "react";
import AthleteProfile from "./AthleteProfile";

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
      <AthleteProfile />
    </Suspense>
  );
}