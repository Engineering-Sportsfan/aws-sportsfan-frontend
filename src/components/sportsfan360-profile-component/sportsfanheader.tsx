"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Drop {
  id: string;
  title: string;
  url: string;
}

interface Profile {
  id: string;
  name: string;
  about: string;
  avatar: string;
  drops: Drop[];
  createdAt: number;
  updatedAt: number;
}

interface ApiResponse {
  success: boolean;
  profiles: Profile[]; // Changed from 'profile' to 'profiles' (array)
  pagination: {
    limit: number;
    hasMore: boolean;
    nextCursor: string | null;
  };
}

export default function Sportsfan360ProfileHeader() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get<ApiResponse>(`/api/sportsfan360card`);

      console.log("API Response:", response.data);

      // Check if profiles array exists and has at least one item
      if (response.data.success && response.data.profiles && response.data.profiles.length > 0) {
        setProfile(response.data.profiles[0]); // Take the first profile
      } else {
        setError("Profile not found");
      }
    } catch (error) {
      console.error("Failed to fetch profile data:", error);
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center px-4 md:px-6 pt-6 md:pt-8 pb-2 gap-4 md:gap-5">
        <div className="rounded-full p-[3px] bg-gradient-to-br from-[#e91e8c] to-[#ff5722] w-28 h-28 md:w-36 md:h-36 lg:w-32 lg:h-32">
          <div className="w-full h-full rounded-full overflow-hidden bg-[#111111] animate-pulse" />
        </div>
        <div className="h-8 w-48 bg-gray-800 rounded animate-pulse" />
        <div className="h-4 w-32 bg-gray-800 rounded animate-pulse" />
        <div className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 md:p-5 mt-1">
          <div className="h-4 w-20 bg-gray-800 rounded mb-3 animate-pulse" />
          <div className="space-y-2">
            <div className="h-3 w-full bg-gray-800 rounded animate-pulse" />
            <div className="h-3 w-3/4 bg-gray-800 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center px-4 md:px-6 pt-6 md:pt-8 pb-2">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
          <p className="text-red-400">{error || "Profile not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center  pt-6 md:pt-8 pb-2 gap-4 md:gap-5">
         <Link href="/MainModules/HomePage" className="inline-flex items-center gap-2 text-[#666] hover:text-white mb-6 transition text-sm">
                            <ArrowLeft size={16} />
                            Back
                        </Link>
      {/* Gradient ring avatar */}
      <div className="rounded-full p-[3px] px-4 md:px-6 bg-gradient-to-br from-[#e91e8c] to-[#ff5722] w-28 h-28 md:w-36 md:h-36 lg:w-32 lg:h-32 shrink-0">
        <div className="w-full h-full rounded-full overflow-hidden bg-[#111111]">
          {profile.avatar ? (
            <div className="relative w-full h-full">
              <Image
                src={profile.avatar}
                alt={profile.name}
                fill
                className="object-cover object-top"
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#e91e8c]/20 to-[#ff5722]/20">
              <span className="text-4xl font-bold text-white/50">
                {profile.name.charAt(0)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Name */}
      <div className="flex flex-col items-center gap-1">
        <h1 className="text-[28px] md:text-[36px] lg:text-[32px] font-extrabold text-white tracking-tight leading-none text-center">
          {profile.name}
        </h1>
      </div>

      {/* Stats pills - showing drops count */}
      <div className="flex items-center gap-3">
        {/* <span className="px-4 md:px-5 py-2 rounded-full bg-[#1c1c1c] border border-[#363636] text-[#d4d4d4] text-[13px] md:text-sm font-medium">
           {profile.drops?.length || 0} Audio Drops
        </span> */}
        <span className="px-4 md:px-5 py-2 rounded-full bg-[#e91e8c] text-white text-[13px] md:text-sm font-semibold whitespace-nowrap">
          ⚡ SportsFan360
        </span>
      </div>

      {/* About card */}
      <div className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 md:p-5 mt-1">
        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-[3px] h-5 bg-[#e91e8c] rounded-sm shrink-0" />
          <span className="text-base md:text-lg font-bold text-white">About</span>
        </div>
        <p className="text-[13px] md:text-sm text-[#9a9a9a] leading-[1.75]">
          {profile.about || "No description available for this profile."}
        </p>
      </div>

      {/* Audio Drops Section - Optional */}
      {profile.drops && profile.drops.length > 0 && (
        <div className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 md:p-5 mt-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-[3px] h-5 bg-[#e91e8c] rounded-sm shrink-0" />
            <span className="text-base md:text-lg font-bold text-white">Audio Drops</span>
          </div>
          <div className="space-y-2">
            {profile.drops.slice(0, 5).map((drop) => (
              <a
                key={drop.id}
                href={drop.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 bg-[#0d1117] rounded-lg hover:bg-[#1c1c1c] transition-colors"
              >
                <p className="text-sm font-medium text-white truncate">{drop.title}</p>
                <p className="text-xs text-gray-500 truncate">{drop.url}</p>
              </a>
            ))}
            {profile.drops.length > 5 && (
              <button className="w-full text-center text-[#e91e8c] text-sm py-2 hover:underline">
                View all {profile.drops.length} drops →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}