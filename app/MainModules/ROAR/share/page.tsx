import { Metadata } from "next";
import { redirect } from "next/navigation";

// IMPORTANT: replace with your real production domain once deployed.
// OG unfurling requires an absolute, publicly reachable HTTPS URL — it
// cannot be tested on localhost because WhatsApp/X's crawlers fetch this
// server-side from the public internet, not from your browser.
const SITE_URL = "https://sportsfan-frontend.vercel.app";

interface SharePageProps {
  searchParams: Promise<{
    predictions?: string;
    debates?: string;
    posts?: string;
    badges?: string;
  }>;
}

function buildCardUrl(params: Awaited<SharePageProps["searchParams"]>) {
  const qs = new URLSearchParams({
    predictions: params.predictions ?? "0",
    debates: params.debates ?? "0",
    posts: params.posts ?? "0",
    badges: params.badges ?? "0",
  });
  return `${SITE_URL}/api/roar-card?${qs.toString()}`;
}

// generateMetadata runs server-side on every request to this route,
// including when WhatsApp/X/Telegram/etc crawl the link to build a preview.
// That crawl is a plain HTTP GET with no JS execution, so the og:image tag
// must already point at a real image URL in the HTML response — this is
// exactly what makes the preview render inside the chat itself.
export async function generateMetadata({
  searchParams,
}: SharePageProps): Promise<Metadata> {
  const params = await searchParams;
  const cardUrl = buildCardUrl(params);

  const title = "My Roar Journey on Sportsfan360";
  const description = `🔮 Predictions: ${params.predictions ?? 0}  ⚡ Debates: ${params.debates ?? 0}  ✏️ Posts: ${params.posts ?? 0}  🏅 Badges: ${params.badges ?? 0}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: cardUrl,
          width: 1536,
          height: 1024,
          alt: "Roar Journey stat card",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [cardUrl],
    },
  };
}

// Real human visitors who tap the link land here for a split second and get
// redirected to the actual app — only the crawler bots stop at this page to
// read the metadata above. Swap the destination for wherever the Roar
// module actually lives.
export default async function SharePage({ searchParams }: SharePageProps) {
  await searchParams;
  redirect("/MainModules/ROAR");
}