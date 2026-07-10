// // context/AuthContext.tsx

// "use client";
// import { createContext, useContext, useEffect, useState, ReactNode } from "react";
// import axios from "axios";
// import { useSession } from "next-auth/react";

// interface User {
//     email: string;
//     name: string;
//     role: string;
//     userId?: string;
//     uid?: string; // For Firebase users, if used in future
// }

// interface AuthContextType {
//     user: User | null;
//     loading: boolean;
//     error: string | null;
//     isAuthenticated: boolean;
//     getUserName: () => string;
//     getUserDisplayName: () => string;
//     refreshUser: () => Promise<void>;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// function getOrCreateGuestName(): string {
//     if (typeof window === "undefined") return "Fan";
//     const stored = localStorage.getItem("guest_display_name");
//     if (stored) return stored;
//     const name = `Fan_${Math.random().toString(36).substr(2, 5)}`;
//     localStorage.setItem("guest_display_name", name);
//     return name;
// }

// export function AuthProvider({ children }: { children: ReactNode }) {
//     const [user, setUser] = useState<User | null>(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);

//     // ── Google session from NextAuth ─────────────────────────────────────────
//     const { data: session, status: sessionStatus } = useSession();

//     const fetchUser = async () => {
//         try {
//             setLoading(true);
//             setError(null);

//             // ── 1. Prefer Google/NextAuth session (fastest for Google users) ──
//             if (session?.user?.email) {
//                 const googleUser: User = {
//                     email: session.user.email,
//                     name: session.user.name || session.user.email.split("@")[0],
//                     role: (session.user as { role?: string }).role || "user",
//                     userId: (session.user as { userId?: string }).userId ?? session.user.email,
//                 };
//                 setUser(googleUser);
//                 localStorage.setItem("auth_user", JSON.stringify(googleUser));
//                 setLoading(false);
//                 return;
//             }

//             // ── 2. Try JWT cookie (email/OTP users) ──────────────────────────
//             try {
//                 const response = await axios.get("/api/auth/host/me");
//                 if (response.data.success && response.data.user) {
//                     const u = response.data.user;
//                     const fullName =
//                         u.name ||
//                         [u.firstName, u.lastName].filter(Boolean).join(" ").trim() ||
//                         "";
//                     const normalised: User = {
//                         email: u.email,
//                         name: fullName,
//                         role: u.role || "user",
//                         userId: u.userId,
//                     };
//                     setUser(normalised);
//                     localStorage.setItem("auth_user", JSON.stringify(normalised));
//                     setLoading(false);
//                     return;
//                 }
//             } catch {
//                 // JWT check failed — fall through to cached user
//             }

//             // ── 3. Fallback: cached user ─────────────────────────────────────
//             const cachedUser = localStorage.getItem("auth_user");
//             if (cachedUser) {
//                 setUser(JSON.parse(cachedUser));
//             } else {
//                 setUser(null);
//             }
//         } catch {
//             setUser(null);
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Re-run when Google session loads
//     useEffect(() => {
//         if (sessionStatus === "loading") return; // wait for session
//         fetchUser();
//     }, [sessionStatus, session?.user?.email]);

//     const refreshUser = async () => {
//         await fetchUser();
//     };

//     const getUserDisplayName = (): string => {
//         if (user?.name) return user.name;
//         if (session?.user?.name) return session.user.name;
//         return getOrCreateGuestName();
//     };

//     const getUserName = (): string => {
//         return getUserDisplayName().toLowerCase().replace(/\s+/g, "_");
//     };

//     return (
//         <AuthContext.Provider
//             value={{
//                 user,
//                 loading,
//                 error,
//                 isAuthenticated: !!user,
//                 getUserName,
//                 getUserDisplayName,
//                 refreshUser,
//             }}
//         >
//             {children}
//         </AuthContext.Provider>
//     );
// }

// export function useAuth() {
//     const context = useContext(AuthContext);
//     if (context === undefined) {
//         throw new Error("useAuth must be used within an AuthProvider");
//     }
//     return context;
// }






// context/AuthContext.tsx  — FRONTEND project

"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";

interface User {
    email: string;
    name: string;
    role: string;
    userId?: string;
    uid?: string;
    avatar?: string;
    photoURL?: string;
    firstName?: string;
    actualUserId?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    authReady: boolean;   // ← NEW: true once auth + token are fully set up
    error: string | null;
    isAuthenticated: boolean;
    getUserName: () => string;
    getUserDisplayName: () => string;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getOrCreateGuestName(): string {
    if (typeof window === "undefined") return "Fan";
    const stored = localStorage.getItem("guest_display_name");
    if (stored) return stored;
    const name = `Fan_${Math.random().toString(36).substr(2, 5)}`;
    localStorage.setItem("guest_display_name", name);
    return name;
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [authReady, setAuthReady] = useState(false);  // ← NEW
    const [error, setError] = useState<string | null>(null);

    const { data: session, status: sessionStatus } = useSession();

    const fetchUser = async () => {
        try {
            setLoading(true);
            setAuthReady(false);   // reset while re-fetching
            setError(null);

            // ── 1. Google/NextAuth session ───────────────────────────────────
            if (session?.user?.email) {
                try {
                    await axios.post("/api/auth/set-token");
                } catch (e) {
                    console.error("Failed to set token for Google user:", e);
                }

                // Now fetch the actual backend profile to get the correct, normalized userId
                try {
                    const response = await axios.get("/api/auth/host/me");
                    if (response.data.success && response.data.user) {
                        const u = response.data.user;
                        const fullName = u.name || session.user.name || u.email.split("@")[0];
                        const normalised: User = {
                            email: u.email,
                            name: fullName,
                            role: u.role || "user",
                            userId: u.userId || session.user.email,
                            avatar: u.avatar || "",
                            photoURL: u.photoURL || "",
                        };
                        setUser(normalised);
                        console.log("Google user verified via backend, user set:", normalised);
                        localStorage.setItem("auth_user", JSON.stringify(normalised));
                        setLoading(false);
                        setAuthReady(true);
                        return;
                    }
                } catch (e) {
                    console.error("Failed to fetch backend profile for Google user:", e);
                }

                // Fallback if backend fetch fails
                const googleUser: User = {
                    email: session.user.email,
                    name: session.user.name || session.user.email.split("@")[0],
                    role: (session.user as { role?: string }).role || "user",
                    userId: (session.user as { userId?: string }).userId ?? session.user.email,
                };
                setUser(googleUser);
                console.log("Google session detected (fallback), user set:", googleUser);
                localStorage.setItem("auth_user", JSON.stringify(googleUser));

                setLoading(false);
                setAuthReady(true);
                return;
            }

            // ── 2. JWT cookie (email/password users) ─────────────────────────
            if (typeof window !== "undefined") {
                sessionStorage.removeItem("session_token");
            }

            try {
                const response = await axios.get("/api/auth/host/me");
                if (response.data.success && response.data.user) {
                    const u = response.data.user;
                    const fullName =
                        u.name ||
                        [u.firstName, u.lastName].filter(Boolean).join(" ").trim() ||
                        "";
                    const normalised: User = {
                        email: u.email,
                        name: fullName,
                        role: u.role || "user",
                        userId: u.userId,
                    };
                    setUser(normalised);
                    console.log("JWT user detected, user set:", normalised);
                    localStorage.setItem("auth_user", JSON.stringify(normalised));
                    setLoading(false);
                    setAuthReady(true);   // ← cookie is already set by browser
                    return;
                }
            } catch {
                // JWT check failed — fall through to cached user
            }

            // ── 3. Cached user fallback ──────────────────────────────────────
            const cachedUser = localStorage.getItem("auth_user");
            if (cachedUser) {
                setUser(JSON.parse(cachedUser));
            } else {
                setUser(null);
            }
            // Even on fallback, mark ready so UI doesn't hang forever
            setAuthReady(true);
        } catch {
            setUser(null);
            setAuthReady(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (sessionStatus === "loading") return;
        fetchUser();
    }, [sessionStatus, session?.user?.email]);

    const refreshUser = async () => {
        await fetchUser();
    };

    const getUserDisplayName = (): string => {
        if (user?.name) return user.name;
        if (session?.user?.name) return session.user.name;
        return getOrCreateGuestName();
    };

    const getUserName = (): string => {
        return getUserDisplayName().toLowerCase().replace(/\s+/g, "_");
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                authReady,
                error,
                isAuthenticated: !!user,
                getUserName,
                getUserDisplayName,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}