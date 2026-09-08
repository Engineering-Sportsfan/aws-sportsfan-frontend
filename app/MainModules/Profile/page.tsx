"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProfilePageInner from "../../../src/components/NewROARComponent/screens/Profile";
import { GLOBAL_CSS } from "../../../src/components/NewROARComponent/constants/styles";
import { useAuth } from "@/context/AuthContext";
import { getBotCanonicalName, BOT_AVATARS, BOT_BIOS } from "@/src/constants/bots";

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: authUser } = useAuth();

  const targetUserId =
    searchParams.get("profileUserId") ||
    searchParams.get("userId") ||
    searchParams.get("id") ||
    searchParams.get("username") ||
    undefined;

  const botName = getBotCanonicalName(targetUserId);

  const effectiveUserId =
    botName ||
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
    try {
      const res = await fetch(`/api/roar/profile?userId=${encodeURIComponent(effectiveUserId)}`);
      const data = await res.json();

      if (data?.success) {
        setProfile(data);
        if (data?.user?.badge) {
          setUserBadge(data.user.badge);
        }
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    }
  };

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
        onBack={() => router.back()}
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