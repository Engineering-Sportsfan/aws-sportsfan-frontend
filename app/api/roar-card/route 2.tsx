import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

// ── Config ──────────────────────────────────────────────────────────────────
// Must match the design size used when generating profilecard.png so stat
// positions line up the same way they do in the client-side canvas version.
const BASE_WIDTH = 1536;
const BASE_HEIGHT = 1024;

// Same x/y/color values as the client-side canvas overlay in
// RoarJourneySection-fixed.tsx — keep these two in sync if you ever move
// the stat panel in profilecard.png.
const STAT_POSITIONS = [
  { key: "predictions", x: 285, color: "#5B21B6" },
  { key: "debates", x: 620, color: "#EA580C" },
  { key: "posts", x: 932, color: "#0D9488" },
  { key: "badges", x: 1255, color: "#DB2777" },
] as const;
const STAT_Y = 745;

function clampInt(value: string | null, fallback = 0, max = 999999) {
  const n = parseInt(value ?? "", 10);
  if (Number.isNaN(n) || n < 0) return fallback;
  return Math.min(n, max);
}

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);

  const predictions = clampInt(searchParams.get("predictions"));
  const debates = clampInt(searchParams.get("debates"));
  const posts = clampInt(searchParams.get("posts"));
  const badges = clampInt(searchParams.get("badges"));

  const values: Record<string, number> = { predictions, debates, posts, badges };

  // The background image needs to be fetched as an absolute URL inside an
  // Edge route — relative "/images/profilecard.png" won't resolve here the
  // way it does in a browser <img src>.
  const backgroundUrl = `${origin}/images/profilecard.png`;

  return new ImageResponse(
    (
      <div
        style={{
          width: BASE_WIDTH,
          height: BASE_HEIGHT,
          display: "flex",
          position: "relative",
        }}
      >
        {/* Background image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={backgroundUrl}
          width={BASE_WIDTH}
          height={BASE_HEIGHT}
          style={{ position: "absolute", top: 0, left: 0 }}
        />

        {/* Stat numbers, positioned to match the client-side canvas overlay */}
        {STAT_POSITIONS.map(({ key, x, color }) => (
          <div
            key={key}
            style={{
              position: "absolute",
              left: x - 120,
              top: STAT_Y - 50,
              width: 240,
              height: 100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 64,
              fontWeight: 900,
              color,
              fontFamily: "Arial, sans-serif",
            }}
          >
            {values[key]}
          </div>
        ))}
      </div>
    ),
    {
      width: BASE_WIDTH,
      height: BASE_HEIGHT,
    }
  );
}