// import NextAuth from "next-auth";
// import GoogleProvider from "next-auth/providers/google";

// export const { handlers, auth, signIn, signOut } = NextAuth({
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     }),
//   ],

//   callbacks: {
//     async signIn({ user }) {
//       console.log("[SIGNIN CALLBACK] allowing:", user?.email);
//       return true;
//     },

//     async jwt({ token, account, user }) {
//       if (account?.provider === "google" && user) {
//         token.email = user.email;
//         token.name = user.name;
//         token.picture = user.image;
//       }
//       return token;
//     },

//     async session({ session, token }) {
//       return session;
//     },
//   },

//   pages: {
//     signIn: "/auth/login",
//     error: "/auth/error",
//   },

//   session: { strategy: "jwt" },
// });














// //lib/auth.config.ts - Frontend

// import NextAuth from "next-auth";
// import GoogleProvider from "next-auth/providers/google";

// export const { handlers, auth, signIn, signOut } = NextAuth({
//     providers: [
//         GoogleProvider({
//             clientId: process.env.GOOGLE_CLIENT_ID!,
//             clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//         }),
//     ],

//     callbacks: {
//         async signIn({ user }) {
//             try {
//                 const adminUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.sportsfan360.com";
//                 const res = await fetch(`${adminUrl}/api/auth/google-signup`, {
//                     method: "POST",
//                     headers: { "Content-Type": "application/json" },
//                     body: JSON.stringify({
//                         email: user.email,
//                         name: user.name,
//                         avatar: user.image,
//                     }),
//                 });
//                 if (res.status === 403) return false;
//                 return true;
//             } catch (error) {
//                 console.error("[Google signIn] error:", error);
//                 return true;
//             }
//         },

//         async jwt({ token, user, account }) {
//             if (account?.provider === "google" && user?.email) {
//                 try {
//                     const adminUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.sportsfan360.com";
//                     const res = await fetch(`${adminUrl}/api/auth/google-signup`, {
//                         method: "POST",
//                         headers: { "Content-Type": "application/json" },
//                         body: JSON.stringify({
//                             email: user.email,
//                             name: user.name,
//                             avatar: user.image,
//                         }),
//                     });
//                     const data = await res.json();
//                     token.dbUser = {
//                         email: user.email,
//                         userId: data.userId,
//                         firstName: data.firstName,
//                         lastName: data.lastName,
//                         role: data.role || "user",
//                         status: data.status || "active",
//                     };
//                 } catch (error) {
//                     console.error("[JWT] error:", error);
//                 }
//             }
//             return token;
//         },

//         async session({ session, token }) {
//             if (token.dbUser) {
//                 session.user = {
//                     ...session.user,
//                     ...(token.dbUser as object),
//                 };
//             }
//             return session;
//         },
//     },

//     pages: {
//         signIn: "/auth/login",
//         error: "/auth/login",
//     },

//     session: { strategy: "jwt" },
// });




// // lib/auth.config.ts - Frontend (HARDCODED for master branch)

// import NextAuth from "next-auth";
// import GoogleProvider from "next-auth/providers/google";

// // HARDCODE MASTER BRANCH URL
// const MASTER_URL = 'https://sportsfan360.com';

// export const { handlers, auth, signIn, signOut } = NextAuth({
//     providers: [
//         GoogleProvider({
//             clientId: process.env.GOOGLE_CLIENT_ID!,
//             clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//         }),
//     ],

//     callbacks: {
//         async signIn({ user }) {
//             try {
//                 const adminUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.sportsfan360.com";
//                 const res = await fetch(`${adminUrl}/api/auth/google-signup`, {
//                     method: "POST",
//                     headers: { "Content-Type": "application/json" },
//                     body: JSON.stringify({
//                         email: user.email,
//                         name: user.name,
//                         avatar: user.image,
//                     }),
//                 });
//                 if (res.status === 403) return false;
//                 return true;
//             } catch (error) {
//                 console.error("[Google signIn] error:", error);
//                 return true;
//             }
//         },

//         async jwt({ token, user, account }) {
//             if (account?.provider === "google" && user?.email) {
//                 try {
//                     const adminUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.sportsfan360.com";
//                     const res = await fetch(`${adminUrl}/api/auth/google-signup`, {
//                         method: "POST",
//                         headers: { "Content-Type": "application/json" },
//                         body: JSON.stringify({
//                             email: user.email,
//                             name: user.name,
//                             avatar: user.image,
//                         }),
//                     });
//                     const data = await res.json();
//                     token.dbUser = {
//                         email: user.email,
//                         userId: data.userId,
//                         firstName: data.firstName,
//                         lastName: data.lastName,
//                         role: data.role || "user",
//                         status: data.status || "active",
//                     };
//                 } catch (error) {
//                     console.error("[JWT] error:", error);
//                 }
//             }
//             return token;
//         },

//         async session({ session, token }) {
//             if (token.dbUser) {
//                 session.user = {
//                     ...session.user,
//                     ...(token.dbUser as object),
//                 };
//             }
//             return session;
//         },

//         // ADD THIS REDIRECT CALLBACK
//         async redirect({ url, baseUrl }) {
//             // Force redirect to master branch homepage
//             console.log('Redirecting to:', `${MASTER_URL}/MainModules/ROAR`);
//             return `${MASTER_URL}/MainModules/ROAR`;
//         },
//     },

//     pages: {
//         signIn: "/auth/login",
//         error: "/auth/login",
//     },

//     session: { strategy: "jwt" },
// });





// lib/auth.config.ts - Frontend (DYNAMIC - works on all environments)

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
    trustHost: true,
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],

    callbacks: {
        async signIn({ user }) {
            try {
                const adminUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.sportsfan360.com";
                const res = await fetch(`${adminUrl}/api/auth/google-signup`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: user.email,
                        name: user.name,
                        avatar: user.image,
                    }),
                });
                if (res.status === 403) return false;
                return true;
            } catch (error) {
                console.error("[Google signIn] error:", error);
                return true;
            }
        },

        async jwt({ token, user, account }) {
            if (account?.provider === "google" && user?.email) {
                try {
                    const adminUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.sportsfan360.com";
                    const res = await fetch(`${adminUrl}/api/auth/google-signup`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            email: user.email,
                            name: user.name,
                            avatar: user.image,
                        }),
                    });
                    const data = await res.json();
                    const sanitizedId = user.email.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_");
                    token.dbUser = {
                        email: user.email,
                        userId: data.userId || sanitizedId,  // ← never falls back to raw email
                        firstName: data.firstName,
                        lastName: data.lastName,
                        role: data.role || "user",
                        status: data.status || "active",
                    };
                } catch (error) {
                    console.error("[JWT] error:", error);
                    token.dbUser = {
                        email: user.email,
                        userId: user.email.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_"),
                        role: "user",
                        status: "active",
                    };
                }
            }
            return token;
        },

        async session({ session, token }) {
            if (token.dbUser) {
                session.user = {
                    ...session.user,
                    ...(token.dbUser as object),
                };
            }
            return session;
        },

        //  FIXED: Dynamic redirect callback
        async redirect({ url, baseUrl }) {
            console.log('Redirect callback - url:', url, 'baseUrl:', baseUrl);

            // Allows relative callback URLs
            if (url.startsWith("/")) {
                return `${baseUrl}${url}`;
            }
            // Allows callback URLs on the same origin
            else if (new URL(url).origin === baseUrl) {
                return url;
            }
            // Default fallback - go to ROAR page on the same domain
            return `${baseUrl}/MainModules/ROAR`;
        },
    },

    pages: {
        signIn: "/auth/login",
        error: "/auth/login",
    },

    session: { strategy: "jwt" },
});