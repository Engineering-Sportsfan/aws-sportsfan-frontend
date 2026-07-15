import svgPaths from "./svg-87hfpu8d82";
import imgImageLockerRoom from "./943ca779db3d125572942a0897c9264dbf03174f.png";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface KeyMoment {
  timestamp: string; // e.g. "03:24"
  label: string;     // e.g. "Captain tactics"
}

export interface AudioDropTag {
  label: string;
  color: string; // hex color for the icon
}

export interface AudioDropData {
  // Header / episode info
  badgeLabel: string;        // e.g. "TACTICAL AUDIO DROP"
  episode: string;           // e.g. "EP 01"
  heroImage?: string;        // optional override image (falls back to default)

  // Main content
  title: string;             // e.g. "Marathon Mindset"
  subtitle: string;          // e.g. "Exclusive tactical briefing"
  descriptionParagraphs: string[];

  // Key moments section
  keyMoments: KeyMoment[];

  // Quote card
  quote: string;
  quoteAttribution: string;

  // Metadata cards
  recordedDate: string;      // e.g. "May 13, 2026"
  location: string;          // e.g. "Team Locker"

  // Stat pills
  listeningCount: string;    // e.g. "1.8k listening"
  trendingLabel: string;     // e.g. "Trending #2"
  categoryLabel: string;     // e.g. "Tactical"

  // Total duration label shown in player (e.g. "15:00")
  totalDuration: string;

  // Chapters count label
  chaptersLabel: string;     // e.g. "3 chapters"

  // Actual audio file URL for playback
  audioUrl: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

export const audioDropsData: Record<string, AudioDropData> = {

  "tejaswin-shankar": {
    badgeLabel: "QUALIFICATION UPDATE",
    episode: "EP 01",
    heroImage: "/tejaswin-article.jpeg", // TODO: confirm/update hero image

    title: "Decathlon's Renaissance Man 🎧",
    subtitle: "Balancing the Decathlon and High Jump on the road to major championships",

    descriptionParagraphs: [
      "In this exclusive conversation, Indian athletics star Tejaswin Shankar shares his journey towards qualifying for both the Commonwealth Games and the Asian Games. As one of India's most versatile athletes, he explains what it takes to compete in the demanding decathlon while continuing to perform at the highest level in the high jump.",
      "Tejaswin discusses his preparation, competition schedule, and the importance of consistency during the qualification period. He reflects on the pride of representing India, the challenges of balancing two elite events, and his determination to secure qualification for both international championships."
    ],

    keyMoments: [
      { timestamp: "01:12", label: "Road to CWG & Asian Games qualification" },
      { timestamp: "03:48", label: "Managing Decathlon and High Jump together" },
      { timestamp: "07:05", label: "Representing India with pride" },
    ],

    chaptersLabel: "3 chapters",

    quote:
      "Every competition matters. The goal is to qualify, keep improving, and represent India on the biggest stage.",

    quoteAttribution: "— Tejaswin Shankar",

    recordedDate: "July 2025",
    location: "AFI Media Interaction",

    listeningCount: "2.3k listening", // TODO: update count
    trendingLabel: "Trending #1",
    categoryLabel: "Qualification Update",

    totalDuration: "08:20", // TODO: confirm actual duration of new audio

    audioUrl:
      "https://res.cloudinary.com/dflnsufit/video/upload/v1782725153/TJ_wins_silver_in_the_decathlon_with_7618_points_asianathletics2025_asianathleticschampionships_-_N1_Media_Consultancy_Private_Limited_youtube_hbiqgv.mp3",
  },

  "gurindervir-singh": {
    badgeLabel: "ATHLETE SPEAKS",
    episode: "EP 02",
    heroImage: "/Gurindervir-Singh.webp", // TODO: add hero image

    title: "Mental Toughness: Gurindervir Speaks 🎧",
    subtitle: "On focus, pressure, and chasing speed at the highest level", // TODO: update subtitle

    descriptionParagraphs: [
      "Gurindervir Singh opens up about the mental side of sprinting at the elite level — how he stays focused under pressure, manages expectations, and keeps pushing the limits of Indian sprinting.", // TODO: refine
    ],

    keyMoments: [
      { timestamp: "00:00", label: "On mental toughness" }, // TODO: update timestamps
    ],

    chaptersLabel: "1 chapter", // TODO: update

    quote: "", // TODO: add quote
    quoteAttribution: "— Gurindervir Singh",

    recordedDate: "", // TODO
    location: "", // TODO

    listeningCount: "0 listening", // TODO
    trendingLabel: "",
    categoryLabel: "Athlete Speaks",

    totalDuration: "00:00", // TODO

    audioUrl:
      "https://res.cloudinary.com/dflnsufit/video/upload/v1782724656/126052400194-1779604741591_fdrxga.mp3",
  },

  "murali-sreeshankar": {
    badgeLabel: "ATHLETE SPEAKS",
    episode: "EP 03",
    heroImage: "/Sreeshankar-article.jpeg", // TODO: add hero image

    title: "The Long Jump Comeback 🎧",
    subtitle: "Murali Sreeshankar on his road back to the podium", // TODO: update subtitle

    descriptionParagraphs: [
      "Murali Sreeshankar reflects on his comeback journey in long jump, sharing insights from the Asian Games 2023 medal ceremony and the road that led him back to competing at the top level.", // TODO: refine
    ],

    keyMoments: [
      { timestamp: "00:00", label: "On the comeback journey" }, // TODO
    ],

    chaptersLabel: "1 chapter", // TODO

    quote: "", // TODO
    quoteAttribution: "— Murali Sreeshankar",

    recordedDate: "", // TODO
    location: "Asian Games 2023", // TODO: confirm

    listeningCount: "0 listening", // TODO
    trendingLabel: "",
    categoryLabel: "Athlete Speaks",

    totalDuration: "00:00", // TODO

    audioUrl:
      "https://res.cloudinary.com/dflnsufit/video/upload/v1782724754/Exclusive_Interview_Murali_Sreeshankar_Men_s_Long_Jump_Medal_Ceremony_Asian_Games_2023_-_Times_Of_India_youtube_t7jnrc.mp3",
  },

  "neeraj-chopra": {
    badgeLabel: "ATHLETE SPEAKS",
    episode: "EP 04",
    heroImage: "/neeraj.png", // TODO: add hero image

    title: "India's Golden Arm: Tokyo to 90m 🎧",
    subtitle: "Neeraj Chopra on the throw that changed Indian athletics forever", // TODO: update subtitle

    descriptionParagraphs: [
      "Neeraj Chopra revisits the historic gold-winning throw at Tokyo 2020 and his journey since then toward breaking the 90m barrier, reflecting on what that moment meant for Indian sport.", // TODO: refine
    ],

    keyMoments: [
      { timestamp: "00:00", label: "Revisiting the Tokyo throw" }, // TODO
    ],

    chaptersLabel: "1 chapter", // TODO

    quote: "", // TODO
    quoteAttribution: "— Neeraj Chopra",

    recordedDate: "", // TODO
    location: "Tokyo 2020 Olympics", // TODO: confirm

    listeningCount: "0 listening", // TODO
    trendingLabel: "Trending #1", // since he's the headline athlete

    categoryLabel: "Athlete Speaks",

    totalDuration: "00:00", // TODO

    audioUrl:
      "https://res.cloudinary.com/dflnsufit/video/upload/v1782724872/Neeraj_Chopra_s_gold-winning_throw_Tokyo2020_Highlights_-_Olympics_youtube_u5qn38.mp3",
  },

  "parul-chaudhary": {
    badgeLabel: "ATHLETE SPEAKS",
    episode: "EP 05",
    heroImage: "/parul-choudhary.jpg", // TODO: add hero image

    title: "India's Steeplechase Queen 🎧",
    subtitle: "Parul Chaudhary on rewriting India's distance running record books", // TODO: update subtitle

    descriptionParagraphs: [
      "Audio coming soon — Parul Chaudhary's journey as India's leading steeplechase and distance running star.", // TODO: replace once audio is available
    ],

    keyMoments: [],

    chaptersLabel: "0 chapters",

    quote: "", // TODO
    quoteAttribution: "— Parul Chaudhary",

    recordedDate: "", // TODO
    location: "", // TODO

    listeningCount: "0 listening",
    trendingLabel: "",
    categoryLabel: "Athlete Speaks",

    totalDuration: "00:00",

    audioUrl: "", // TODO: audio missing — link provided was a video file (tweeload_0huh67l9_gzq2dy.mp4), not audio
  },

  "pooja-singh": {
    badgeLabel: "ATHLETE SPEAKS",
    episode: "EP 06",
    heroImage: "/Pooja-Singh-article.webp", // TODO: add hero image

    title: "Pooja Singh's Story 🎧", // TODO: update title once available
    subtitle: "", // TODO

    descriptionParagraphs: [
      "Audio coming soon — Pooja Singh's journey in Indian athletics.", // TODO
    ],

    keyMoments: [],

    chaptersLabel: "0 chapters",

    quote: "",
    quoteAttribution: "— Pooja Singh",

    recordedDate: "",
    location: "",

    listeningCount: "0 listening",
    trendingLabel: "",
    categoryLabel: "Athlete Speaks",

    totalDuration: "00:00",

    audioUrl: "", // TODO: audio missing
  },

  "sarvesh-kushare": {
    badgeLabel: "ATHLETE SPEAKS",
    episode: "EP 07",
    heroImage: "/Sarvesh-Kushare-article.avif", // TODO: add hero image

    title: "India's High Jump History Maker 🎧",
    subtitle: "Sarvesh Kushare on reaching the World Championships final", // TODO: update subtitle

    descriptionParagraphs: [
      "Sarvesh Kushare speaks exclusively after becoming one of the few Indian high jumpers to reach a World Championships final, reflecting on his journey and what the achievement means for Indian athletics.", // TODO: refine
    ],

    keyMoments: [
      { timestamp: "00:00", label: "Reaching the World Championships final" }, // TODO
    ],

    chaptersLabel: "1 chapter", // TODO

    quote: "", // TODO
    quoteAttribution: "— Sarvesh Kushare",

    recordedDate: "", // TODO
    location: "World Championships", // TODO: confirm

    listeningCount: "0 listening", // TODO
    trendingLabel: "",
    categoryLabel: "Athlete Speaks",

    totalDuration: "00:00", // TODO

    audioUrl:
      "https://res.cloudinary.com/dflnsufit/video/upload/v1782725239/Exclusive_Sarvesh_Kushare_after_entering_High_Jump_finals_at_World_Championships_-_Sports_Today_youtube_ynte5i.mp3",
  },

  "priyanka-goswami": {
    badgeLabel: "ATHLETE SPEAKS",
    episode: "EP 08",
    heroImage: "/PriyankaGoswami-article.avif", // TODO: add hero image

    title: "The Walk That Changed India 🎧",
    subtitle: "Priyanka Goswami breaks down the discipline of race walking", // TODO: update subtitle

    descriptionParagraphs: [
      "Priyanka Goswami explains the discipline of race walking — what it takes physically and mentally to compete in this unique event, and how it has shaped her journey as one of India's top athletes.", // TODO: refine
    ],

    keyMoments: [
      { timestamp: "00:00", label: "Understanding race walking" }, // TODO
    ],

    chaptersLabel: "1 chapter", // TODO

    quote: "", // TODO
    quoteAttribution: "— Priyanka Goswami",

    recordedDate: "", // TODO
    location: "Jeetega India e-Conclave", // TODO: confirm

    listeningCount: "0 listening", // TODO
    trendingLabel: "",
    categoryLabel: "Athlete Speaks",

    totalDuration: "00:00", // TODO

    audioUrl:
      "https://res.cloudinary.com/dflnsufit/video/upload/v1782725428/Priyanka_Goswami_explains_what_is_race_walking_Jeetega_India_e-Conclave_-_ABP_NEWS_youtube_ts2fy6.mp3",
  },
};

// ─── Props ────────────────────────────────────────────────────────────────────

export interface AudioDropProps {
  data: AudioDropData;
}

// ─── Internal sub-components ──────────────────────────────────────────────────

/** Background blurred image */
function ImageLockerRoom({ src }: { src: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <img alt="" className="absolute inset-0 w-full h-full object-cover opacity-40 blur-[12px] scale-110" src={src} />
    </div>
  );
}

/** Top section: background + controls + cover */
function Container({ data }: { data: AudioDropData }) {
  const imageSrc = data.heroImage ?? imgImageLockerRoom;
  return (
    <div className="relative w-full shrink-0" data-name="Container">
      {/* Background layers */}
      <div className="absolute inset-0 overflow-hidden">
        <ImageLockerRoom src={imageSrc} />
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(11,11,15,0.4)] via-[rgba(11,11,15,0.6)] to-[#0b0b0f]" />
        <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(106.831deg, rgba(130,24,26,0.2) 4.553%, rgba(0,0,0,0) 50%, rgba(89,22,139,0.2) 95.447%)" }} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-5 pt-6 pb-6 gap-4">
        {/* Top row: back button + badge */}
        <div className="flex items-center w-full gap-3">
          <button className="flex-shrink-0 bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] rounded-full w-[44px] h-[44px] flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#ff6467] text-[12px] tracking-[1.2px] uppercase">{data.badgeLabel}</span>
            <div className="bg-[#ff6467] rounded-full w-[4px] h-[4px]" />
            <span className="font-semibold text-[#d1d5dc] text-[12px]">{data.episode}</span>
          </div>
        </div>

        {/* Title */}
        <p className="w-full text-center text-white text-[24px] font-bold leading-[30px] tracking-[0.3px] break-words">
          {data.title}
        </p>

        {/* Subtitle */}
        {data.subtitle ? (
          <p className="w-full text-center text-[#99a1af] text-[13px] leading-[20px] break-words -mt-1">
            {data.subtitle}
          </p>
        ) : null}

        {/* Hero image — square, fills full width */}
        <div className="relative w-full aspect-square overflow-hidden rounded-[12px]">
          <img src={imageSrc} alt="" className="w-full h-full object-cover" />
        </div>

        {/* Waveform card */}
        <div className="w-full bg-[rgba(0,0,0,0.5)] border border-[rgba(255,255,255,0.1)] rounded-[16px] px-3 py-4">
          <div className="flex items-center gap-[3px] h-[48px] overflow-hidden">
            {[40, 48, 54, 53, 47, 37, 23, 9, 4, 16, 29, 39, 45, 46, 42, 35, 28, 22, 19, 19,
              6, 18, 33, 46, 55, 59, 56, 48, 36, 23, 12, 4, 1, 3, 9, 16, 23, 27, 29, 26, 22,
              5, 18, 33, 46, 55, 59, 56, 48, 36, 23, 12, 4].map((h, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 rounded-full w-[3px]"
                  style={{
                    height: `${(h / 60) * 48}px`,
                    background: i < 8
                      ? 'linear-gradient(to top, #dc2626, #f97316)'
                      : i < 20
                        ? '#c9115f'
                        : 'rgba(255,255,255,0.18)',
                  }}
                />
              ))}
          </div>
          <div className="flex justify-between mt-2 px-1">
            <span className="text-[#99a1af] text-[11px]">2:14</span>
            <span className="text-[#99a1af] text-[11px]">{data.totalDuration}</span>
          </div>

          <div className="flex items-center justify-center gap-10 mt-12 ml-4">
            <button className="w-[44px] h-[44px] flex items-center justify-center">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 32 32">
                <path d={svgPaths.p16e60c00} fill="white" />
              </svg>
            </button>
            <button className="w-[56px] h-[56px] bg-[#c9115f] rounded-full flex items-center justify-center shadow-[0px_8px_24px_rgba(201,17,95,0.5)]">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 28 28">
                <path d={svgPaths.p3bbb6a80} fill="white" />
              </svg>
            </button>
            <button className="w-[44px] h-[44px] flex items-center justify-center">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 32 32">
                <path d={svgPaths.p2d3ba680} fill="white" />
              </svg>
            </button>
          </div>
        </div>

        {/* Action buttons row */}
        <div
          className="w-full flex items-center justify-around rounded-[16px] border border-[rgba(255,255,255,0.1)] py-3 px-2"
          style={{ backgroundImage: "linear-gradient(166.35deg, rgb(26,26,38) 0%, rgb(18,18,26) 100%)" }}
        >
          <button className="flex flex-col items-center gap-[5px] flex-1 py-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20">
              <path d="M17.5 12.5V5" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
              <path d={svgPaths.p139fc780} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
              <path d="M10 10H2.5" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
              <path d="M13.3333 5H2.5" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
              <path d="M10 15H2.5" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
            </svg>
            <span className="text-[#99a1af] text-[10px] font-medium">Playlist</span>
          </button>
          <button
            className="flex flex-col items-center gap-[5px] flex-1 py-1 rounded-[14px] border border-[rgba(251,44,54,0.3)]"
            style={{ backgroundImage: "linear-gradient(150.433deg, rgba(231,0,11,0.2) 0%, rgba(245,73,0,0.2) 100%)" }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20">
              <path d={svgPaths.p3a2fa580} stroke="#FF6467" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
            </svg>
            <span className="text-[#ff6467] text-[10px] font-semibold">Signal</span>
          </button>
          <button className="flex flex-col items-center gap-[5px] flex-1 py-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20">
              <path d={svgPaths.p245c2480} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
              <path d={svgPaths.p1b9ecd80} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
              <path d={svgPaths.p30483c80} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
              <path d={svgPaths.p37f93a00} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
              <path d={svgPaths.p26fdf80} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
            </svg>
            <span className="text-[#99a1af] text-[10px] font-medium">Share</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/** Stat pills row */
function StatPills({ data }: { data: AudioDropData }) {
  const pills = [
    { icon: <path d={svgPaths.p2bfd2e80} fill="#FF6467" />, label: data.listeningCount },
    { icon: <path d={svgPaths.p65b000} fill="#05DF72" />, label: data.trendingLabel },
    { icon: <path d={svgPaths.pf7af00} fill="#C27AFF" />, label: data.categoryLabel },
  ].filter(p => p.label);

  if (!pills.length) return null;
  return (
    <div className="flex flex-wrap gap-2 px-5 pt-4">
      {pills.map((pill, i) => (
        <div key={i} className="flex items-center gap-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-full px-3 h-[33px]">
          <svg className="w-[14px] h-[14px] shrink-0" fill="none" viewBox="0 0 14 14">{pill.icon}</svg>
          <span className="text-white text-[10px] whitespace-nowrap">{pill.label}</span>
        </div>
      ))}
    </div>
  );
}

/** Description paragraphs */
function DescriptionSection({ paragraphs }: { paragraphs: string[] }) {
  if (!paragraphs.length) return null;
  return (
    <div className="px-5 pt-5 flex flex-col gap-3">
      {paragraphs.map((text, i) => (
        <p key={i} className="text-[#99a1af] text-[15px] leading-[24px] tracking-[-0.1px]">
          {text}
        </p>
      ))}
    </div>
  );
}

/** Key Moments section */
function KeyMomentsSection({ keyMoments, chaptersLabel }: { keyMoments: KeyMoment[]; chaptersLabel: string }) {
  if (!keyMoments.length) return null;
  return (
    <div className="px-5 pt-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-white font-bold text-[16px] tracking-[-0.3px]">Key Moments</p>
        <span className="text-white text-[10px] tracking-[0.1px]">{chaptersLabel}</span>
      </div>
      <div className="flex flex-col gap-2">
        {keyMoments.map((moment, i) => (
          <div
            key={i}
            className="flex items-center gap-3 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-[14px] px-3 py-3"
          >
            <div className="flex-shrink-0 bg-[rgba(255,89,0,0.2)] rounded-[8px] px-2 py-1">
              <span className="font-bold text-white text-[10px] tracking-[0.1px]">{moment.timestamp}</span>
            </div>
            <span className="text-[#d1d5dc] text-[12px] font-semibold leading-snug">{moment.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Quote card */
function QuoteCard({ quote, attribution }: { quote: string; attribution: string }) {
  if (!quote) return null;
  return (
    <div
      className="mx-5 mt-5 rounded-[16px] border border-[rgba(255,255,255,0.1)] overflow-hidden p-5"
      style={{ backgroundImage: "linear-gradient(159.05deg, rgb(26,26,38) 0%, rgb(18,18,26) 100%)" }}
    >
      <div className="opacity-20 w-[40px] h-[40px] mb-3">
        <svg className="w-full h-full" fill="none" viewBox="0 0 48 48">
          <path d={svgPaths.p2836b900} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
          <path d={svgPaths.p2347a280} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
        </svg>
      </div>
      <p className="text-white font-medium italic text-[15px] leading-[24px] tracking-[-0.3px] mb-3">{quote}</p>
      <p className="text-[#99a1af] text-[13px] leading-[20px]">{attribution}</p>
    </div>
  );
}

/** Metadata cards: recorded date + location */
function MetadataCards({ recordedDate, location }: { recordedDate: string; location: string }) {
  if (!recordedDate && !location) return null;
  return (
    <div className="flex gap-3 px-5 pt-4 pb-8">
      {recordedDate && (
        <div className="flex-1 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-[14px] p-3 flex items-center gap-2">
          <svg className="w-[14px] h-[14px] shrink-0" fill="none" viewBox="0 0 14 14">
            <path d="M4.66666 1.16666V3.5" stroke="#99A1AF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16666" />
            <path d="M9.33336 1.16666V3.5" stroke="#99A1AF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16666" />
            <path d={svgPaths.p32ed7b80} stroke="#99A1AF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16666" />
            <path d="M1.75 5.83334H12.25" stroke="#99A1AF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16666" />
          </svg>
          <div>
            <p className="text-[#6a7282] text-[9px] tracking-[0.16px] uppercase">Recorded</p>
            <p className="text-white font-semibold text-[11px] tracking-[0.06px] mt-0.5">{recordedDate}</p>
          </div>
        </div>
      )}
      {location && (
        <div className="flex-1 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-[14px] p-3 flex items-center gap-2">
          <svg className="w-[14px] h-[14px] shrink-0" fill="none" viewBox="0 0 14 14">
            <path d={svgPaths.p3871b700} stroke="#99A1AF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16666" />
            <path d="M7 3.5V7L9.33336 8.16666" stroke="#99A1AF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16666" />
          </svg>
          <div>
            <p className="text-[#6a7282] text-[9px] tracking-[0.16px] uppercase">Location</p>
            <p className="text-white font-semibold text-[11px] tracking-[0.06px] mt-0.5 line-clamp-1">{location}</p>
          </div>
        </div>
      )}
    </div>
  );
}




/** Bottom section: pills + description + key moments + quote + metadata */
function Container92({ data }: { data: AudioDropData }) {
  return (
    <div className="bg-[#0b0b0f] w-full" data-name="Container">
      <StatPills data={data} />
      <DescriptionSection paragraphs={data.descriptionParagraphs} />
      <KeyMomentsSection keyMoments={data.keyMoments} chaptersLabel={data.chaptersLabel} />
      <QuoteCard quote={data.quote} attribution={data.quoteAttribution} />
      <MetadataCards recordedDate={data.recordedDate} location={data.location} />
    </div>
  );
}

// ─── Default exported component ───────────────────────────────────────────────

export default function AudioDrop({ data }: AudioDropProps) {
  console.log("data", data)
  return (
    <div className="w-full min-h-full bg-[#0b0b0f] flex flex-col" data-name="Audio Drop">
      <Container data={data} />
      <Container92 data={data} />
    </div>
  );
}