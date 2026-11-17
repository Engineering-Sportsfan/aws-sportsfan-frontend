"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { handleGoBack } from "@/utils/backButton";
import { MyScoreCards } from "@/src/components/NewROARComponent/components/MyScoreCards";

/** All of the user's match scorecards. Each card opens /MainModules/FanScorecard/<matchId>. */
export default function FanScorecardListPage() {
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.actualUserId || user?.userId || user?.email || "";
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!userId) return;
    let off = false;
    const profileId = user?.actualUserId || user?.userId?.replace(/[@.]/g, "_") || user?.email?.replace(/[@.]/g, "_") || userId;
    axios.get(`/api/roar/profile?userId=${encodeURIComponent(profileId)}`, { withCredentials: true })
      .then((r) => { if (!off && r.data?.success) setProfile(r.data.user); })
      .catch(() => {});
    axios.get(`/api/user-activity?userId=${encodeURIComponent(userId)}&limit=200`)
      .then((r) => { if (!off) setActivities(r.data?.activities || []); })
      .catch(() => {})
      .finally(() => { if (!off) setLoading(false); });
    return () => { off = true; };
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const name = profile?.username || profile?.displayName || (user as any)?.username || user?.email?.split("@")[0] || "You";
  const avatar = profile?.avatarUrl || profile?.avatar || (user as any)?.avatarUrl || null;

  return (
    <div style={{ minHeight: "100%", background: "#070b14", color: "#fff", padding: "14px 0 calc(var(--roar-bottom-nav-height, 72px) + 32px + env(safe-area-inset-bottom))" }}>
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 14px" }}>
          <button type="button" onClick={() => handleGoBack(router, "/MainModules/Profile")} aria-label="Back"
            style={{ background: "none", border: "none", color: "#fff", fontSize: 24, cursor: "pointer" }}>‹</button>
          <div style={{ flex: 1, textAlign: "center", marginRight: 24, fontSize: 20, fontWeight: 800 }}>My Fan Scorecards</div>
        </div>
        <MyScoreCards activities={activities} loading={loading} username={name} avatarSrc={avatar} layout="list" />
      </div>
    </div>
  );
}
