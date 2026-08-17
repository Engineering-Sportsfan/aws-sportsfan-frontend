// app/MainModules/ClubsProfile/ClubProfileContent.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import ClubGamePlan from "@/src/components/ClubProfile-Component/ClubGamePlan/index";
import ClubProfileActions from "@/src/components/ClubProfile-Component/ClubProfileActions/index";
import ClubProfileHeader from "@/src/components/ClubProfile-Component/ClubProfileHeader/index";
import ClubSeasonStats from "@/src/components/ClubProfile-Component/ClubSeasonStats/index";
import { useClubProfile } from "@/context/ClubProfileContext";

function ensureClubFields(club: any) {
  if (!club) return null;
  return {
    id: club.id ?? "",
    name: club.name ?? "–",
    team: club.team ?? "–",
    avatar: club.avatar ?? null,
    about: club.about ?? "",
    headCoach: club.headCoach ?? "–",
    homeGround: club.homeGround ?? "–",
    country: club.country ?? "–",
    battingStyle: club.battingStyle ?? "–",
    bowlingStyle: club.bowlingStyle ?? "–",
    season: club.season ?? {
      year: "–",
      runs: "0",
      losses: "0",
      wins: "0",
      points: "0",
      position: "–",
      matchesPlayed: "0",
      netRunRate: "0",
    },
    stats: club.stats ?? {
      runs: "–",
      sr: "–",
      avg: "–",
    },
    insights: club.insights ?? [],
    strengths: club.strengths ?? [],
    media: club.media ?? [],
    overview: club.overview ?? {
      captain: club.captain ?? "–",
      coach: club.headCoach ?? club.coach ?? "–",
      owner: club.owner ?? "–",
      venue: club.homeGround ?? club.venue ?? "–",
    },
  };
}

export default function ClubProfileContent() {
  const searchParams = useSearchParams();
  const params = useParams();
  
  const slug = params?.slug as string | undefined;
  const teamName = searchParams.get("teamProfile");
  
  const { 
    fetchFullProfile, 
    singleProfile, 
    seasons,       
    insights,     
    strengths,      
    mediaItems,     
    loading, 
    error 
  } = useClubProfile();

  // Local state for direct API fetch (when URL contains slug /MainModules/ClubsProfile/[slug])
  const [localProfile, setLocalProfile] = useState<any>(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (teamName) {
      fetchFullProfile(teamName);
    }
  }, [teamName, fetchFullProfile]);

  useEffect(() => {
    if (!slug) return;
    setLocalLoading(true);
    setLocalError(null);
    fetch(`/api/ms_teams/${slug}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load profile (status ${res.status})`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.success && data.team) {
          const t = data.team;
          setLocalProfile({
            id: t.entityId,
            name: t.clubName ?? "–",
            team: t.shortName ?? "–",
            avatar: t.logoUrl ?? null,
            about: t.bio ?? "",
            headCoach: t.headCoach ?? "–",
            homeGround: t.homeGround ?? "–",
            country: t.country ?? "–",
            captain: t.captain ?? "–",
            owner: t.owner ?? "–",
            season: data.record_highlight ?? {
              year: "–",
              runs: "0",
              losses: "0",
              wins: "0",
              points: "0",
              position: "–",
              matchesPlayed: "0",
              netRunRate: "0",
            },
            insights: t.insights ?? [],
            strengths: t.strengths ?? [],
            media: data.stints ?? [],
            stats: data.analytics ?? {
              runs: "–",
              sr: "–",
              avg: "–",
            },
          });
        } else {
          setLocalError(data.error || "Failed to load club details");
        }
      })
      .catch((err) => setLocalError(err.message))
      .finally(() => setLocalLoading(false));
  }, [slug]);

  // Determine active states
  const activeLoading = slug ? localLoading : (loading || (!singleProfile && !error));
  const activeError = slug ? localError : error;

  // Prepare club object
  const contextClubData = singleProfile ? {
    ...singleProfile,
    season: seasons?.[0] || singleProfile.season,
    insights: insights?.length ? insights : singleProfile.insights,
    strengths: strengths?.length ? strengths : singleProfile.strengths,
    media: mediaItems?.length ? mediaItems : singleProfile.media,
  } : null;

  const rawClubData = slug ? localProfile : contextClubData;
  const clubData = ensureClubFields(rawClubData);

  // Loading state
  if (activeLoading || (slug && !localProfile && !localError)) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error state with friendly messages
  if (activeError) {
    let friendlyMessage = "";
    let suggestion = "";
    const errorStr = activeError;
    
    if (errorStr.includes("404") || errorStr.includes("not found")) {
      friendlyMessage = `Club profile not found`;
      suggestion = "Please check the link or try searching for another club.";
    } else if (errorStr.includes("Network Error") || errorStr.includes("Failed to fetch")) {
      friendlyMessage = "Unable to connect to the server";
      suggestion = "Please check your internet connection and try again.";
    } else if (errorStr.includes("500") || errorStr.includes("Internal Server Error")) {
      friendlyMessage = "Something went wrong on our end";
      suggestion = "We're working on fixing this. Please try again in a few moments.";
    } else if (errorStr.includes("timeout")) {
      friendlyMessage = "Request timed out";
      suggestion = "The server is taking too long to respond. Please try again.";
    } else {
      friendlyMessage = "Unable to load team profile";
      suggestion = "Please try again or contact support if the issue persists.";
    }
    
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">Oops!</h2>
          <p className="text-red-400 text-lg mb-2">{friendlyMessage}</p>
          <p className="text-gray-400 text-sm mb-6">{suggestion}</p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => {
                if (slug) {
                  // Trigger reload by resetting state
                  setLocalLoading(true);
                  setLocalError(null);
                  fetch(`/api/ms_teams/${slug}`)
                    .then((res) => res.json())
                    .then((data) => {
                      if (data.success && data.team) {
                        const t = data.team;
                        setLocalProfile({
                          id: t.entityId,
                          name: t.clubName ?? "–",
                          team: t.shortName ?? "–",
                          avatar: t.logoUrl ?? null,
                          about: t.bio ?? "",
                          headCoach: t.headCoach ?? "–",
                          homeGround: t.homeGround ?? "–",
                          country: t.country ?? "–",
                          captain: t.captain ?? "–",
                          owner: t.owner ?? "–",
                          season: data.record_highlight ?? {
                            year: "–",
                            runs: "0",
                            losses: "0",
                            wins: "0",
                            points: "0",
                            position: "–",
                            matchesPlayed: "0",
                            netRunRate: "0",
                          },
                          insights: t.insights ?? [],
                          strengths: t.strengths ?? [],
                          media: data.stints ?? [],
                          stats: data.analytics ?? {
                            runs: "–",
                            sr: "–",
                            avg: "–",
                          },
                        });
                      } else {
                        setLocalError(data.error || "Failed to load club details");
                      }
                    })
                    .catch((err) => setLocalError(err.message))
                    .finally(() => setLocalLoading(false));
                } else if (teamName) {
                  fetchFullProfile(teamName);
                }
              }}
              className="bg-red-500 px-6 py-2.5 rounded-lg text-white hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.href = "/MainModules/HomePage"}
              className="bg-gray-700 px-6 py-2.5 rounded-lg text-white hover:bg-gray-600 transition-colors"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!clubData) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
        <p className="text-gray-400">No profile found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111111] font-sans">
      {/* Sticky Top Nav */}
      <div className="sticky top-0 z-50 flex items-center px-4 md:px-8 lg:px-12 py-3.5 bg-[#111111]/90 backdrop-blur-md border-b border-[#1f1f1f]">
        <button
          className="bg-transparent border-0 p-0 cursor-pointer text-[#e0e0e0] flex items-center hover:text-white transition-colors"
          onClick={() => window.history.back()}
        >
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path d="M19 12H5" />
            <path d="M12 5l-7 7 7 7" />
          </svg>
        </button>
        <span className="flex-1 text-center text-[17px] md:text-xl font-bold text-white tracking-tight">
          Teams Profile
        </span>
        <div className="w-[22px]" />
      </div>

      {/* Content wrapper */}
      <div className="w-full max-w-[1280px] mx-auto">
        {/* Mobile + Tablet: single column */}
        <div className="block lg:hidden">
          <div className="max-w-[640px] mx-auto">
            <ClubProfileHeader club={clubData} />
            <ClubProfileActions club={clubData} />
            <ClubSeasonStats club={clubData} />
            <ClubGamePlan club={clubData} />
          </div>
        </div>

        {/* Desktop: two-column layout */}
        <div className="hidden lg:flex lg:items-start lg:gap-6 xl:gap-8 px-8 xl:px-12 py-6">
          {/* Left column — sticky sidebar */}
          <div className="sticky top-[65px] w-[360px] xl:w-[400px] shrink-0 flex flex-col overflow-y-auto max-h-[calc(150vh-65px)] [scrollbar-width:none]">
            <ClubProfileHeader club={clubData} />
            <ClubProfileActions club={clubData} />
          </div>

          {/* Right column — scrollable content */}
          <div className="flex-1 min-w-0 flex flex-col pb-10">
            <ClubSeasonStats club={clubData} />
            <ClubGamePlan club={clubData} />
          </div>
        </div>
      </div>
    </div>
  );
}