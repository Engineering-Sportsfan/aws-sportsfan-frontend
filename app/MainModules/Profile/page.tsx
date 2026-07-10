"use client";

import { useEffect, useState } from "react";
import ProfilePageInner from "../../../src/components/NewROARComponent/screens/Profile";
import { GLOBAL_CSS } from "../../../src/components/NewROARComponent/constants/styles";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [userBadge, setUserBadge] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await fetch("/api/roar/profile");
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
        onCompose={() => { }}
        onToast={() => { }}
        setOnboarded={() => { }}
        onNavigateTab={() => { }}
      />
    </div>
  );
}