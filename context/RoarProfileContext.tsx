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

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { useRouter } from "next/navigation";
import { handleGoBack } from "@/utils/backButton";

export interface ProfileContextType {
  viewingUserId: string | null;
  profileData: any | null;
  loading: boolean;
  openProfile: (userId: string) => void;
  closeProfile: () => void;
  setViewingUserId: (userId: string | null) => void;
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

  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const openProfile = useCallback(
    (userId: string) => {
      if (!userId) {
        router.push("/MainModules/Profile");
        return;
      }
      router.push(`/MainModules/Profile?userId=${encodeURIComponent(userId)}`);
    },
    [router]
  );

  const closeProfile = useCallback(() => {
    handleGoBack(router, "/MainModules/ROAR");
  }, [router]);

  return (
    <RoarProfileContext.Provider
      value={{
        viewingUserId,
        profileData,
        loading,
        openProfile,
        closeProfile,
        setViewingUserId,
        setProfileData,
      }}
    >
      {children}
    </RoarProfileContext.Provider>
  );
};