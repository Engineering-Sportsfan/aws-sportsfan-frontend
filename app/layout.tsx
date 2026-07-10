import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PostHogProvider } from "@/context/PostHogContext";
import "./globals.css";
import { ClubProfileProvider } from "@/context/ClubProfileContext";
import { WatchAlongProvider } from "@/context/WatchAlongContext";
import { SessionProvider } from "next-auth/react";
import { PlayerProfile360Provider } from "@/context/PlayerProfile360Context";
import { GlobalSearchProvider } from "@/context/GlobalSearchContext";
import { AudioProvider } from "@/context/AudioContext";
import { AuthProvider } from "@/context/AuthContext";
import { VideoProvider } from "@/context/VideoContext";
import { PlaysProvider } from "@/context/PlaysContext";
import { ScriptsProvider } from "@/context/ScriptsContext";
import { LeaderboardProvider } from "@/context/LeaderboardContext";
import { AIChatProvider } from "@/context/AskAIChatContext";
import { WPLPlayerProfileProvider } from "@/context/Wplplayerprofilecontext";
import { FifaPlayerProfileProvider } from "@/context/FifaPlayerProfileContext";
import { RoarNotificationsProvider } from "@/context/RoarNotificationsContext";
import { ActivityProvider } from "@/context/ActivityContext";
import { RoarRoomProvider } from "@/context/RoarRoomContext";
import { RoarProfileProvider } from "@/context/RoarProfileContext";
import { Suspense } from "react";
import { UserProfileProvider } from "@/context/UserProfileContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SportsFan360",
  description: "Your Ultimate Sports Destination",
  icons: {
    icon: "/images/logo.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  interactiveWidget: "resizes-content",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>

      {/* <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased !p-0 overflow-x-hidden`}
        suppressHydrationWarning
      > */}
      <body
  className={`${geistSans.variable} ${geistMono.variable} antialiased !p-0 overflow-hidden h-full`}
  suppressHydrationWarning
>
        <PostHogProvider>
        <SessionProvider>
          <AuthProvider>
            <ClubProfileProvider>
              <WatchAlongProvider>
                <PlayerProfile360Provider>
                  <GlobalSearchProvider>
                    <AudioProvider>
                      <LeaderboardProvider>
                        <ActivityProvider>
                          <VideoProvider>
                            <PlaysProvider>
                              <ScriptsProvider>
                                <AIChatProvider>
                                  <WPLPlayerProfileProvider>
                                    <FifaPlayerProfileProvider>
                                      <RoarNotificationsProvider>
                                        <Suspense fallback={<div>Loading...</div>}>
                                          <RoarProfileProvider>
                                            <UserProfileProvider>
                                            <main className="h-full flex flex-col">{children}</main>
                                            </UserProfileProvider>
                                          </RoarProfileProvider>
                                        </Suspense>
                                      </RoarNotificationsProvider>
                                    </FifaPlayerProfileProvider>
                                  </WPLPlayerProfileProvider>
                                </AIChatProvider>
                              </ScriptsProvider>
                            </PlaysProvider>
                          </VideoProvider>
                        </ActivityProvider>
                      </LeaderboardProvider>
                    </AudioProvider>
                  </GlobalSearchProvider>
                </PlayerProfile360Provider>
              </WatchAlongProvider>
            </ClubProfileProvider>
          </AuthProvider>
        </SessionProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}