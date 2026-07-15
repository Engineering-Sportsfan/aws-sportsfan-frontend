/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    AUTH_TRUST_HOST: "true",
    AUTH_URL: process.env.AUTH_URL || process.env.NEXTAUTH_URL || "",
    AUTH_SECRET: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "",
  },
  skipTrailingSlashRedirect: true,
  async rewrites() {
    const apiTarget =
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      process.env.NEXT_PUBLIC_ADMIN_URL ||
      "https://api.sportsfan360.com";

    return {
      beforeFiles: [
        // ── PostHog Reverse Proxy ──
        {
          source: "/ingest/static/:path*",
          destination: "https://us-assets.i.posthog.com/static/:path*",
        },
        {
          source: "/ingest/:path*",
          destination: "https://us.i.posthog.com/:path*",
        },
        {
          source: "/ingest/decide",
          destination: "https://us.i.posthog.com/decide",
        },
        // ── Auth routes → proxy to admin panel ──
        {
          source: "/api/auth/login",
          destination: `${apiTarget}/api/auth/login`,
        },
        {
          source: "/api/auth/register",
          destination: `${apiTarget}/api/auth/register`,
        },
        {
          source: "/api/auth/send-otp",
          destination: `${apiTarget}/api/auth/send-otp`,
        },
        {
          source: "/api/auth/verify-otp",
          destination: `${apiTarget}/api/auth/verify-otp`,
        },
        {
          source: "/api/auth/set-password",
          destination: `${apiTarget}/api/auth/set-password`,
        },
        {
          source: "/api/auth/host/:path*",
          destination: `${apiTarget}/api/auth/host/:path*`,
        },
        {
          source: "/api/auth/forgot-password",
          destination: `${apiTarget}/api/auth/forgot-password`,
        },
      ],

      afterFiles: [
        // Team360
        { source: "/api/team360", destination: `${apiTarget}/api/team360` },
        {
          source: "/api/team360/:path*",
          destination: `${apiTarget}/api/team360/:path*`,
        },
        {
          source: "/api/team360-playlist",
          destination: `${apiTarget}/api/team360-playlist`,
        },
        {
          source: "/api/team360-playlist/:path*",
          destination: `${apiTarget}/api/team360-playlist/:path*`,
        },

        // Cricket Articles
        {
          source: "/api/cricket-articles",
          destination: `${apiTarget}/api/cricket-articles`,
        },
        {
          source: "/api/cricket-articles/:path*",
          destination: `${apiTarget}/api/cricket-articles/:path*`,
        },

        // Player Profile
        {
          source: "/api/player-profile",
          destination: `${apiTarget}/api/player-profile`,
        },
        {
          source: "/api/player-profile/:path*",
          destination: `${apiTarget}/api/player-profile/:path*`,
        },
        {
          source: "/api/playersprofile-playlist",
          destination: `${apiTarget}/api/playersprofile-playlist`,
        },
        {
          source: "/api/playersprofile-playlist/:path*",
          destination: `${apiTarget}/api/playersprofile-playlist/:path*`,
        },
        // Following API (backend)
        { source: "/api/following", destination: `${apiTarget}/api/following` },
        {
          source: "/api/following/:path*",
          destination: `${apiTarget}/api/following/:path*`,
        },

        // Club Profile
        {
          source: "/api/club-profile",
          destination: `${apiTarget}/api/club-profile`,
        },
        {
          source: "/api/club-profile/:path*",
          destination: `${apiTarget}/api/club-profile/:path*`,
        },

        // Events
        { source: "/api/events", destination: `${apiTarget}/api/events` },
        {
          source: "/api/events/:path*",
          destination: `${apiTarget}/api/events/:path*`,
        },

        //Globalleaderboard
        {
          source: "/api/user-points",
          destination: `${apiTarget}/api/user-points`,
        },
        {
          source: "/api/user-points/:path*",
          destination: `${apiTarget}/api/user-points/:path*`,
        },
        {
          source: "/api/user-activity",
          destination: `${apiTarget}/api/user-activity`,
        },
        {
          source: "/api/user-activity/:path*",
          destination: `${apiTarget}/api/user-activity/:path*`,
        },

        //Users
        { source: "/api/users", destination: `${apiTarget}/api/users` },
        {
          source: "/api/users/:path*",
          destination: `${apiTarget}/api/users/:path*`,
        },


        //Profile Settings
        { source: "/api/profile", destination: `${apiTarget}/api/profile` },
        {
          source: "/api/profile/:path*",
          destination: `${apiTarget}/api/profile/:path*`,
        },

        //Notifications
        {
          source: "/api/notifications",
          destination: `${apiTarget}/api/notifications`,
        },
        {
          source: "/api/notifications/:path*",
          destination: `${apiTarget}/api/notifications/:path*`,
        },

        // Follow Requests
        {
          source: "/api/follow-request",
          destination: `${apiTarget}/api/follow-request`,
        },
        {
          source: "/api/follow-request/:path*",
          destination: `${apiTarget}/api/follow-request/:path*`,
        },
        {
          source: "/api/follow-request/status",
          destination: `${apiTarget}/api/follow-request/status`,
        },
        {
          source: "/api/follow-request/accept",
          destination: `${apiTarget}/api/follow-request/accept`,
        },
        {
          source: "/api/follow-request/reject",
          destination: `${apiTarget}/api/follow-request/reject`,
        },
        //User-Activity
        {
          source: "/api/user-activity",
          destination: `${apiTarget}/api/user-activity`,
        },
        {
          source: "/api/user-activity/:path*",
          destination: `${apiTarget}/api/user-activity/:path*`,
        },

        // Cloudinary
        {
          source: "/api/cloudinary/drops/seen",
          destination: `${apiTarget}/api/cloudinary/drops/seen`,
        },
        {
          source: "/api/cloudinary/audio",
          destination: `${apiTarget}/api/cloudinary/audio`,
        },
        {
          source: "/api/cloudinary/video",
          destination: `${apiTarget}/api/cloudinary/video`,
        },
        {
          source: "/api/cloudinary/plays",
          destination: `${apiTarget}/api/cloudinary/plays`,
        },
        {
          source: "/api/cloudinary/scripts",
          destination: `${apiTarget}/api/cloudinary/scripts`,
        },
        {
          source: "/api/cloudinary/iplpulse",
          destination: `${apiTarget}/api/cloudinary/iplpulse`,
        },
        {
          source: "/api/cloudinary/:path*",
          destination: `${apiTarget}/api/cloudinary/:path*`,
        },

        // Plays
        { source: "/api/plays", destination: `${apiTarget}/api/plays` },
        {
          source: "/api/plays/:path*",
          destination: `${apiTarget}/api/plays/:path*`,
        },

        {
          source: "/api/cloudinary/plays",
          destination: `${apiTarget}/api/cloudinary/plays`,
        },
        {
          source: "/api/cloudinary/plays/:path*",
          destination: `${apiTarget}/api/cloudinary/plays/:path*`,
        },

        {
          source: "/api/ipl-pulse/spotlight",
          destination: `${apiTarget}/api/ipl-pulse/spotlight`,
        },
        {
          source: "/api/ipl-pulse/spotlight/:path*",
          destination: `${apiTarget}/api/ipl-pulse/spotlight/:path*`,
        },

        // Global Search
        {
          source: "/api/global-search",
          destination: `${apiTarget}/api/global-search`,
        },
        {
          source: "/api/global-search/:path*",
          destination: `${apiTarget}/api/global-search/:path*`,
        },

        // Static content
        {
          source: "/Content/:path*",
          destination: `${apiTarget}/Content/:path*`,
        },

        // Preferences
        {
          source: "/api/preferences",
          destination: `${apiTarget}/api/preferences`,
        },
        {
          source: "/api/preferences/:path*",
          destination: `${apiTarget}/api/preferences/:path*`,
        },

        // Host Rooms
        { source: "/api/hostrooms", destination: `${apiTarget}/api/hostrooms` },
        {
          source: "/api/hostrooms/:path*",
          destination: `${apiTarget}/api/hostrooms/:path*`,
        },

        // create post and polls
        {
          source: "/api/createpost",
          destination: `${apiTarget}/api/createpost`,
        },
        {
          source: "/api/createpost/:path*",
          destination: `${apiTarget}/api/createpost/:path*`,
        },
        {
          source: "/api/createpost/polls",
          destination: `${apiTarget}/api/createpost/polls`,
        },
        {
          source: "/api/createpost/polls/:path*",
          destination: `${apiTarget}/api/createpost/polls/:path*`,
        },
        {
          source: "/api/createpost/repost",
          destination: `${apiTarget}/api/createpost/repost`,
        },
        {
          source: "/api/createpost/repost/:path*",
          destination: `${apiTarget}/api/createpost/repost/:path*`,
        },

        // Audio Signals
        {
          source: "/api/audio-messages",
          destination: `${apiTarget}/api/audio-messages`,
        },
        {
          source: "/api/audio-messages/:path*",
          destination: `${apiTarget}/api/audio-messages/:path*`,
        },

        //Video Signals
        {
          source: "/api/video-messages",
          destination: `${apiTarget}/api/video-messages`,
        },
        {
          source: "/api/video-messages/:path*",
          destination: `${apiTarget}/api/video-messages/:path*`,
        },

        // Video Progress
        {
          source: "/api/video-progress",
          destination: `${apiTarget}/api/video-progress`,
        },
        {
          source: "/api/video-progress/:path*",
          destination: `${apiTarget}/api/video-progress/:path*`,
        },

        // Audio Progress
        {
          source: "/api/audio-progress",
          destination: `${apiTarget}/api/audio-progress`,
        },
        {
          source: "/api/audio-progress/:path*",
          destination: `${apiTarget}/api/audio-progress/:path*`,
        },

        // Audio Drops
        {
          source: "/api/request-drop",
          destination: `${apiTarget}/api/request-drop`,
        },
        {
          source: "/api/request-drop/:path*",
          destination: `${apiTarget}/api/request-drop/:path*`,
        },

        // Sportsfan360 Profile
        {
          source: "/api/sportsfan360card",
          destination: `${apiTarget}/api/sportsfan360card`,
        },

        // Ask AI
        { source: "/api/ask-ai", destination: `${apiTarget}/api/ask-ai` },
        {
          source: "/api/ask-ai/:path*",
          destination: `${apiTarget}/api/ask-ai/:path*`,
        },

        // Playlists
        { source: "/api/playlists", destination: `${apiTarget}/api/playlists` },
        {
          source: "/api/playlists/:path*",
          destination: `${apiTarget}/api/playlists/:path*`,
        },

        //Polls
        {
          source: "/api/polls/:id/vote",
          destination: `${apiTarget}/api/polls/:id/vote`,
        },
        { source: "/api/polls/:id", destination: `${apiTarget}/api/polls/:id` },
        { source: "/api/polls", destination: `${apiTarget}/api/polls` },
        {
          source: "/api/polls/:path*",
          destination: `${apiTarget}/api/polls/:path*`,
        },

        // Leaderboard
        {
          source: "/api/leaderboard",
          destination: `${apiTarget}/api/leaderboard`,
        },
        {
          source: "/api/leaderboard/:path*",
          destination: `${apiTarget}/api/leaderboard/:path*`,
        },

        // Fan Battle Arena
        { source: "/api/battle", destination: `${apiTarget}/api/battle` },
        {
          source: "/api/battle/:path*",
          destination: `${apiTarget}/api/battle/:path*`,
        },
        {
          source: "/api/battle/battle-vote",
          destination: `${apiTarget}/api/battle/battle-vote`,
        },
        {
          source: "/api/battle/battle-vote/:path*",
          destination: `${apiTarget}/api/battle/battle-vote/:path*`,
        },
        {
          source: "/api/battle/battle-session",
          destination: `${apiTarget}/api/battle/battle-session`,
        },
        {
          source: "/api/battle/battle-session/:path*",
          destination: `${apiTarget}/api/battle/battle-session/:path*`,
        },

        //Chat & Community
        {
          source: "/api/chats/:id/messages",
          destination: `${apiTarget}/api/chats/:id/messages`,
        },
        { source: "/api/chats/:id", destination: `${apiTarget}/api/chats/:id` },
        { source: "/api/chats", destination: `${apiTarget}/api/chats` },
        {
          source: "/api/chats/:path*",
          destination: `${apiTarget}/api/chats/:path*`,
        },
        {
          source: "/api/communities",
          destination: `${apiTarget}/api/communities`,
        },
        {
          source: "/api/communities/:id",
          destination: `${apiTarget}/api/communities/:id`,
        },
        {
          source: "/api/communities/:id/join",
          destination: `${apiTarget}/api/communities/:id/join`,
        },
        {
          source: "/api/communities/:path*",
          destination: `${apiTarget}/api/communities/:path*`,
        },

        //Groups & Community
        {
          source: "/api/groups/:id/join",
          destination: `${apiTarget}/api/groups/:id/join`,
        },
        {
          source: "/api/groups/:id/members",
          destination: `${apiTarget}/api/groups/:id/members`,
        },
        {
          source: "/api/groups/:id",
          destination: `${apiTarget}/api/groups/:id`,
        },
        { source: "/api/groups", destination: `${apiTarget}/api/groups` },
        {
          source: "/api/groups/:path*",
          destination: `${apiTarget}/api/groups/:path*`,
        },

        //Jersey Numbers
        {
          source:
            "/api/player-profile/seasonstats/playerProfilesId=:playerProfilesId",
          destination: `${apiTarget}/api/player-profile/seasonstats/playerProfilesId=:playerProfilesId`,
        },

        // Fan Battle
        {
          source: "/api/fanbattle/quiz",
          destination: `${apiTarget}/api/fanbattle/quiz`,
        },
        {
          source: "/api/fanbattle/quiz/:path*",
          destination: `${apiTarget}/api/fanbattle/quiz/:path*`,
        },
        {
          source: "/api/fanbattle/response",
          destination: `${apiTarget}/api/fanbattle/response`,
        },
        {
          source: "/api/fanbattle/response/:path*",
          destination: `${apiTarget}/api/fanbattle/response/:path*`,
        },

        // Sessions
        {
          source: "/api/fanbattle/session",
          destination: `${apiTarget}/api/fanbattle/session`,
        },
        {
          source: "/api/fanbattle/session/:path*",
          destination: `${apiTarget}/api/fanbattle/session/:path*`,
        },

        // Reports & Preferences
        {
          source: "/api/post-report",
          destination: `${apiTarget}/api/post-report`,
        },
        {
          source: "/api/post-report/:path*",
          destination: `${apiTarget}/api/post-report/:path*`,
        },
        {
          source: "/api/post-preference",
          destination: `${apiTarget}/api/post-preference`,
        },
        {
          source: "/api/post-preference/:path*",
          destination: `${apiTarget}/api/post-preference/:path*`,
        },

        //Comments
        { source: "/api/comments", destination: `${apiTarget}/api/comments` },

        { source: "/api/ipl-stats", destination: `${apiTarget}/api/ipl-stats` },

        {
          source: "/api/auth/host/me",
          destination: `${apiTarget}/api/auth/host/me`,
        },

        // Feedback
        {
          source: "/api/feedback/questions",
          destination: `${apiTarget}/api/feedback/questions`,
        },
        {
          source: "/api/feedback/questions/:path*",
          destination: `${apiTarget}/api/feedback/questions/:path*`,
        },
        {
          source: "/api/feedback/submissions",
          destination: `${apiTarget}/api/feedback/submissions`,
        },
        {
          source: "/api/feedback/submissions/:path*",
          destination: `${apiTarget}/api/feedback/submissions/:path*`,
        },

        {
          source: "/api/auth/google-signup",
          destination: `${apiTarget}/api/auth/google-signup`,
        },

        { source: "/api/upload", destination: `${apiTarget}/api/upload` },
        {
          source: "/api/upload/:path*",
          destination: `${apiTarget}/api/upload/:path*`,
        },

        // Watch Along APIs
        {
          source: "/api/watch-along",
          destination: `${apiTarget}/api/watch-along`,
        },
        {
          source: "/api/watch-along/:path*",
          destination: `${apiTarget}/api/watch-along/:path*`,
        },
        // wpl players
        {
          source: "/api/player-stats",
          destination: `${apiTarget}/api/player-stats`,
        },
        {
          source: "/api/player-stats/:path*",
          destination: `${apiTarget}/api/player-stats/:path*`,
        },
        // Fifa players
        {
          source: "/api/fifa-player-stats",
          destination: `${apiTarget}/api/fifa-player-stats`,
        },
        {
          source: "/api/fifa-player-stats/:path*",
          destination: `${apiTarget}/api/fifa-player-stats/:path*`,
        },
        // Fifa Clus
        {
          source: "/api/fifa-clubs",
          destination: `${apiTarget}/api/fifa-clubs`,
        },
        {
          source: "/api/fifa-clubs/:path*",
          destination: `${apiTarget}/api/fifa-clubs/:path*`,
        },
        // WT2O WC Clus
        {
          source: "/api/wt20-clubs",
          destination: `${apiTarget}/api/wt20-clubs`,
        },
        {
          source: "/api/wt20-clubs/:path*",
          destination: `${apiTarget}/api/wt20-clubs/:path*`,
        },
        // roar apis

        {
          source: "/api/roar/:path((?!rooms/[^/]+/dolly).*)",
          destination: `${apiTarget}/api/roar/:path*`,
        },

        // {
        //   source: "/api/roar/:path*",
        //   destination: `${apiTarget}/api/roar/:path*`,
        //   // destination: `https://api.sportsfan360.com/api/roar/:path*`,
        // },
        //  {
        //   source: "/api/roar/rooms/[roomId]/dolly/:path*",
        //   destination: `${apiTarget}/api/roar/rooms/[roomId]/dolly/:path*`,
        //   // destination: `https://api.sportsfan360.com/api/roar/:path*`,
        // },
        // {
        //   source: "/api/roar/posts/:path*",
        //   destination: `${apiTarget}/api/roar/posts/:path*`,
        //   // destination: `https://api.sportsfan360.com/api/roar/:path*`,
        // },


        // ── v2 APIs (Athlete Home / Store / Playbook / Articles / Records) ──
        { source: "/api/v2/health", destination: `${apiTarget}/api/v2/health` },

        { source: "/api/v2/athletes", destination: `${apiTarget}/api/v2/athletes` },
        {
          source: "/api/v2/athletes/:path*",
          destination: `${apiTarget}/api/v2/athletes/:path*`,
        },

        { source: "/api/v2/articles", destination: `${apiTarget}/api/v2/articles` },
        {
          source: "/api/v2/articles/:path*",
          destination: `${apiTarget}/api/v2/articles/:path*`,
        },

        { source: "/api/v2/store", destination: `${apiTarget}/api/v2/store` },
        {
          source: "/api/v2/store/:path*",
          destination: `${apiTarget}/api/v2/store/:path*`,
        },

        { source: "/api/v2/playbook", destination: `${apiTarget}/api/v2/playbook` },
        {
          source: "/api/v2/playbook/:path*",
          destination: `${apiTarget}/api/v2/playbook/:path*`,
        },

        { source: "/api/v2/records", destination: `${apiTarget}/api/v2/records` },
        {
          source: "/api/v2/records/:path*",
          destination: `${apiTarget}/api/v2/records/:path*`,
        },

      ],
    };
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Cross-Origin-Resource-Policy", value: "cross-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "unsafe-none" },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sportsfan360.vercel.app",
        port: "",
        pathname: "/Content/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "documents.iplt20.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
