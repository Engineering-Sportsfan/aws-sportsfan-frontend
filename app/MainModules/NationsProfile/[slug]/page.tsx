'use client';

import React, { Suspense } from "react";
import { useParams } from "next/navigation";
import AthleteProfile from "../../AthleteProfile/AthleteProfile";

export default function NationsProfilePage() {
  const params = useParams();
  const slug = params?.slug as string | undefined;

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#08080c] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF0055] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    }>
      <AthleteProfile athleteId={slug} isClub={true} />
    </Suspense>
  );
}
