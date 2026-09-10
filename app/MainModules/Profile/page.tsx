"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProfilePageInner from "../../../src/components/NewROARComponent/screens/Profile";
import { GLOBAL_CSS } from "../../../src/components/NewROARComponent/constants/styles";
import { useAuth } from "@/context/AuthContext";
import { getBotCanonicalName, BOT_AVATARS, BOT_BIOS } from "@/src/constants/bots";
import { getExpertCanonicalName, EXPERT_AVATARS, EXPERT_BIOS, EXPERT_ROLES } from "@/src/constants/experts";

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: authUser } = useAuth();

  const targetUserId =
    searchParams.get("profile") ||
    searchParams.get("profileUserId") ||
    searchParams.get("userId") ||
    searchParams.get("id") ||
    searchParams.get("username") ||
    undefined;

  const botName = getBotCanonicalName(targetUserId);
  const expertName = getExpertCanonicalName(targetUserId);

  const effectiveUserId =
    botName ||
    expertName ||
    targetUserId ||
    authUser?.actualUserId ||
    (authUser?.userId
      ? authUser.userId.includes("@") || authUser.userId.includes(".")
        ? authUser.userId.replace(/[@.]/g, "_")
        : authUser.userId
      : undefined) ||
    (authUser?.email ? authUser.email.replace(/[@.]/g, "_") : undefined);

  const [profile, setProfile] = useState<any>(null);
  const [userBadge, setUserBadge] = useState("");

  useEffect(() => {
    if (effectiveUserId) {
      loadProfile();
    }
  }, [effectiveUserId]);

  const loadProfile = async () => {
    if (!effectiveUserId) return;
    if (botName) {
      const botAvatar = BOT_AVATARS[botName] || "/images/dolly.png";
      const botBio = BOT_BIOS[botName] || "SportsFan360 bot — automated fan companion.";
      setUserBadge("BOT");
      setProfile({
        success: true,
        user: {
          username: botName,
          displayName: botName,
          avatarUrl: botAvatar,
          avatar: botAvatar,
          about: botBio,
          badge: "BOT",
          isBot: true,
        },
        predictions: [],
        hotTakes: [],
        debates: [],
        posts: [],
      });
      return;
    }
    if (expertName) {
      const expertAvatar = EXPERT_AVATARS[expertName] || "/images/dolly.png";
      const expertBio = EXPERT_BIOS[expertName] || "SportsFan360 Expert Commentator & Analyst";
      const expertRole = EXPERT_ROLES[expertName] || "Expert";
      setUserBadge(expertRole);
      setProfile({
        success: true,
        user: {
          username: expertName,
          displayName: expertName,
          avatarUrl: expertAvatar,
          avatar: expertAvatar,
          about: expertBio,
          badge: expertRole,
          role: expertRole,
          isExpert: true,
        },
        predictions: [],
        hotTakes: [],
        debates: [],
        posts: [],
      });
      return;
    }
    try {
      const res = await fetch(`/api/roar/profile?userId=${encodeURIComponent(effectiveUserId)}`);
      const data = await res.json();

      if (data?.success) {
        setProfile(data);
        if (data?.user?.badge) {
          setUserBadge(data.user.badge);
        }
      } else {
        setProfile({ success: false, notFound: true });
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
      setProfile({ success: false, notFound: true });
    }
  };

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/MainModules/WatchAlong");
    }
  };

  if (effectiveUserId && !profile) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center text-white/50 text-xs">
        Loading profile...
      </div>
    );
  }

  if (profile?.notFound) {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center gap-3 text-white">
        <p className="text-sm font-bold text-gray-300">User profile not found.</p>
        <button
          onClick={handleBack}
          className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-all cursor-pointer"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="roar-root roar-profile-page">
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      <style dangerouslySetInnerHTML={{
        __html: `
          .roar-profile-page .screen-scroll {
            padding-top: 0 !important;
          }
        `
      }} />

      <ProfilePageInner
        userBadge={userBadge}
        setUserBadge={setUserBadge}
        viewingProfile={targetUserId}
        isViewingOther={!!targetUserId}
        fanData={
          profile?.user
            ? {
                ...profile.user,
                predictions: profile.predictions || [],
                hotTakes: profile.hotTakes || [],
                debates: profile.debates || [],
                posts: profile.posts || [],
              }
            : undefined
        }
        onBack={handleBack}
        onCompose={() => { }}
        onToast={() => { }}
        setOnboarded={() => { }}
        onNavigateTab={() => { }}
      />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070b14] flex items-center justify-center text-white/50 text-xs">
          Loading profile...
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}