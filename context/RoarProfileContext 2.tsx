// // context/RoarProfileContext.tsx
// "use client";

// import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
// import { useSearchParams, useRouter, usePathname } from "next/navigation";
// import axios from "axios";

// export interface ProfileContextType {
//   viewingUsername: string | null;
//   profileData: any | null;
//   loading: boolean;
//   openProfile: (username: string) => void;
//   closeProfile: () => void;
//   setViewingUsername: (username: string | null) => void;
//   setProfileData: (data: any) => void;
// }

// const RoarProfileContext = createContext<ProfileContextType | undefined>(undefined);

// export const useRoarProfileContext = () => {
//   const context = useContext(RoarProfileContext);
//   if (!context) {
//     throw new Error("useRoarProfileContext must be used within a RoarProfileProvider");
//   }
//   return context;
// };

// export const RoarProfileProvider = ({ children }: { children: ReactNode }) => {
//   const router = useRouter();
//   const pathname = usePathname();
//   const searchParams = useSearchParams();

//   const [viewingUsername, setViewingUsername] = useState<string | null>(null);
//   const [profileData, setProfileData] = useState<any | null>(null);
//   const [loading, setLoading] = useState(false);

//   // Sync state from URL on mount and when URL changes
//   useEffect(() => {
//     const profileUser = searchParams.get("profileUsername");
//     if (profileUser) {
//       if (profileUser !== viewingUsername) {
//         setViewingUsername(profileUser);
//       }
//     } else {
//       setViewingUsername(null);
//       setProfileData(null);
//     }
//   }, [searchParams]);

//   // Fetch data when viewingUsername changes
//   useEffect(() => {
//     const fetchProfile = async () => {
//       if (!viewingUsername) {
//         setProfileData(null);
//         return;
//       }
//       setLoading(true);
//       try {
//         // const res = await axios.get(`/api/roar/fans/${encodeURIComponent(viewingUsername)}/profile`);
//          const res = await axios.get(`/api/roar/fans/${encodeURIComponent(viewingUsername)}/profile`);
       
//         if (res.data?.success) {
//           setProfileData(res.data);
//         } else {
//           setProfileData(null);
//         }
//       } catch (err) {
//         console.error("Failed to fetch fan profile:", err);
//         setProfileData(null);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchProfile();
//   }, [viewingUsername]);

//   const openProfile = useCallback(
//     (username: string) => {
//       const params = new URLSearchParams(searchParams.toString());
//       params.set("profileUsername", username);
//       router.push(`${pathname}?${params.toString()}`, { scroll: false });
//     },
//     [router, pathname, searchParams]
//   );

//   const closeProfile = useCallback(() => {
//     const params = new URLSearchParams(searchParams.toString());
//     params.delete("profileUsername");
//     router.push(`${pathname}?${params.toString()}`, { scroll: false });
//   }, [router, pathname, searchParams]);

//   return (
//     <RoarProfileContext.Provider
//       value={{
//         viewingUsername,
//         profileData,
//         loading,
//         openProfile,
//         closeProfile,
//         setViewingUsername,
//         setProfileData,
//       }}
//     >
//       {children}
//     </RoarProfileContext.Provider>
//   );
// };




// context/RoarProfileContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import axios from "axios";

export interface ProfileContextType {
  viewingUserId: string | null;          // ← CHANGED: was viewingUsername
  profileData: any | null;
  loading: boolean;
  openProfile: (userId: string) => void; // ← CHANGED: param renamed for clarity
  closeProfile: () => void;
  setViewingUserId: (userId: string | null) => void; // ← CHANGED: renamed
  setProfileData: (data: any) => void;
}

const RoarProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const useRoarProfileContext = () => {
  const context = useContext(RoarProfileContext);
  if (!context) {
    throw new Error("useRoarProfileContext must be used within a RoarProfileProvider");
  }
  return context;
};

export const RoarProfileProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [viewingUserId, setViewingUserId] = useState<string | null>(null); // ← CHANGED
  const [profileData, setProfileData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  // Sync state from URL on mount and when URL changes
  useEffect(() => {
    const profileUserId = searchParams.get("profileUserId"); // ← CHANGED: param name
    if (profileUserId) {
      if (profileUserId !== viewingUserId) {
        setViewingUserId(profileUserId);
      }
    } else {
      setViewingUserId(null);
      setProfileData(null);
    }
  }, [searchParams]);

  // Fetch data when viewingUserId changes
  useEffect(() => {
    const fetchProfile = async () => {
      if (!viewingUserId) {
        setProfileData(null);
        return;
      }
      setLoading(true);
      try {
        // ← CHANGED: roar/fans/[username]/profile → roar/profile?userId=
        const res = await axios.get(`/api/roar/profile?userId=${encodeURIComponent(viewingUserId)}`);

        if (res.data?.success) {
          setProfileData(res.data);
        } else {
          setProfileData(null);
        }
      } catch (err) {
        console.error("Failed to fetch fan profile:", err);
        setProfileData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [viewingUserId]);

  const openProfile = useCallback(
    (userId: string) => { // ← CHANGED: param name
      const params = new URLSearchParams(searchParams.toString());
      params.set("profileUserId", userId); // ← CHANGED: URL param key
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const closeProfile = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("profileUserId"); // ← CHANGED
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, pathname, searchParams]);

  return (
    <RoarProfileContext.Provider
      value={{
        viewingUserId,      //  CHANGED
        profileData,
        loading,
        openProfile,
        closeProfile,
        setViewingUserId,   //  CHANGED
        setProfileData,
      }}
    >
      {children}
    </RoarProfileContext.Provider>
  );
};