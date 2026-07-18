"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";

interface UserProfile {
  actualUserId?: string; 
   username?: string;  
  avatarUrl?: string;
  avatar?: string;   // Google photo URL fallback
  name?: string;
  badge?: string;
  email?:string;
}

interface UserProfileContextType {
  userProfile: UserProfile | null;
  profileLoading: boolean;
  refreshProfile: () => void;
   loading: boolean;    
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export const useUserProfile = () => {
  const ctx = useContext(UserProfileContext);
  if (!ctx) throw new Error("useUserProfile must be inside UserProfileProvider");
  return ctx;
};

export const UserProfileProvider = ({ children }: { children: ReactNode }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await axios.get("/api/roar/profile");
      const data = res.data;
      console.log("profile data:", data);
      if (data?.user) {
        setUserProfile({
          actualUserId: data.user.actualUserId,
           username: data.user.username,
          avatarUrl: data.user.avatarUrl,   // base64 data URI
          avatar: data.user.avatar,          // Google CDN URL (fallback)
          name: data.user.name,
          badge: data.user.badge,
        });
      }
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <UserProfileContext.Provider value={{ userProfile, profileLoading, loading: profileLoading, refreshProfile: fetchProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
};