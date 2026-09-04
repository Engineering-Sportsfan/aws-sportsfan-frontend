"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProfilePageInner from "../../../src/components/NewROARComponent/screens/Profile";
import { GLOBAL_CSS } from "../../../src/components/NewROARComponent/constants/styles";

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetUserId =
    searchParams.get("profileUserId") ||
    searchParams.get("userId") ||
    searchParams.get("id") ||
    searchParams.get("username") ||
    undefined;

  useEffect(() => {
    if (targetUserId) {
      router.replace(`/MainModules/ROAR?profileUserId=${encodeURIComponent(targetUserId)}`);
    }
  }, [targetUserId, router]);

  const [profile, setProfile] = useState<any>(null);
  const [userBadge, setUserBadge] = useState("");

  useEffect(() => {
    loadProfile();
  }, [targetUserId]);

  const loadProfile = async () => {
    try {
      const url = targetUserId
        ? `/api/roar/profile?userId=${encodeURIComponent(targetUserId)}`
        : "/api/roar/profile";
      const res = await fetch(url);
      const data = await res.json();

      setProfile(data);
      if (data?.user?.badge) {
        setUserBadge(data.user.badge);
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