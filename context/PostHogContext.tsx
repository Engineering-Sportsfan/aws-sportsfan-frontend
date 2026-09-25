'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

if (typeof window !== 'undefined') {
  console.log("Initializing PostHog with reverse proxy...");
  posthog.init('phc_AHSjFWHPWvbFSQaGBTTGAni9KjyVQyTVjDrwCSHY5kwa', {
    api_host: '/ingest',
    ui_host: 'https://us.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: true, // Let's enable this as a fallback for the initial load!
  });
}

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();

  useEffect(() => {
    // Track pageviews
    if (pathname && posthog) {
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url = url + `?${searchParams.toString()}`;
      }
      console.log("Sending PostHog $pageview event for:", url);
      posthog.capture('$pageview', {
        $current_url: url,
      });

      // L1 KPI: Routing - Track Reaching Recommended Features
      // Temporarily disabled (KPI 04 is yet to be fully confirmed)
      /*
      const recommendedFeatures: Record<string, string> = {
        '/MainModules/ROAR': 'ROAR',
        '/MainModules/WatchAlong': 'WatchAlong',
        '/MainModules/AtheletePlaybook': 'Playbook',
        '/MainModules/Store': 'Store',
        '/MainModules/Matchcenter': 'Matchcenter',
        '/MainModules/FanBattle': 'FanBattle',
        '/MainModules/FlipLine': 'FlipLine',
        '/MainModules/FlipArena': 'FlipArena',
      };

      const lowerPath = pathname.toLowerCase();
      for (const [route, featName] of Object.entries(recommendedFeatures)) {
        if (lowerPath.startsWith(route.toLowerCase()) || lowerPath.startsWith(('/' + featName).toLowerCase())) {
          posthog.capture('recommended_feature_visited', {
            feature_name: featName,
            route: pathname,
            $current_url: url,
          });
          break;
        }
      }
      */
    }
  }, [pathname, searchParams, posthog]);

  return null;
}

function SuspendedPostHogPageView() {
  return (
    <Suspense fallback={null}>
      <PostHogPageView />
    </Suspense>
  );
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <PHProvider client={posthog}>
      <SuspendedPostHogPageView />
      {children}
    </PHProvider>
  );
}
