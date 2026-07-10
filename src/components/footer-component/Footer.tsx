// SportsFan360Footer.tsx
// Next.js + TypeScript + Tailwind CSS (inline classes only, no style tags)

import { Globe, Pencil } from "lucide-react";
import Link from "next/link";
import React from "react";

// ─── SVG Icon Components ────────────────────────────────────────────────────

const RocketIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-pink-500" stroke="currentColor" strokeWidth={1.8}>
    <path d="M12 2C12 2 7 6 7 13H17C17 6 12 2 12 2Z" strokeLinejoin="round" />
    <path d="M7 13L5 17H19L17 13" strokeLinejoin="round" />
    <circle cx="12" cy="10" r="1.5" fill="currentColor" stroke="none" />
    <path d="M9 17L8 21M15 17L16 21" strokeLinecap="round" />
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L2.25 2.25h6.919l4.259 5.632 4.816-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-3 h-3">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4 text-pink-500">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── Divider with glow 

const GlowDivider = () => (
  <div className="relative w-full h-px my-6">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-600 to-transparent opacity-60" />
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-400 to-transparent opacity-20 blur-sm" />
  </div>
);

// ─── Social Button 

interface SocialBtnProps {
  href: string;
  label: string;
  color: string; // tailwind ring/border color class
  children: React.ReactNode;
}

const SocialBtn: React.FC<SocialBtnProps> = ({ href, label, color, children }) => (
  <a
    href={href}
    aria-label={label}
    target="_blank"
    rel="noopener noreferrer"
    className={`
      group relative flex items-center justify-center
      w-8 h-8 md:w-14 md:h-14 lg:w-10 lg:h-10
      rounded-full border border-zinc-700 bg-zinc-900
      transition-all duration-300
      hover:scale-110 hover:border-pink-500
      ${color}
    `}
  >
    <span className="transition-colors duration-300 text-zinc-400 group-hover:text-white">
      {children}
    </span>
    {/* Glow halo on hover */}
    <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-pink-600/10 blur-sm" />
  </a>
);

// ─── Main Footer ──────────────────────────────────────────────────────────────

const SportsFan360Footer: React.FC = () => {
  const quickLinks = [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Use", href: "#" },
    { label: "Refund Policy", href: "#" },
    { label: "Contact Us", href: "#" },
  ];

  const socials = [
    { label: "LinkedIn", href: "https://www.linkedin.com/company/sportsfan360/", icon: <LinkedInIcon /> },
    { label: "X (Twitter)", href: "https://x.com/sportsfan_360", icon: <XIcon /> },
    { label: "Instagram", href: "https://www.instagram.com/sportsfan_360/", icon: <InstagramIcon /> },
    { label: "YouTube", href: "https://www.youtube.com/@sportsfan_360", icon: <YouTubeIcon /> },
    { label: "Website", href: "https://www.sportsfan360.com", icon: <Globe size={12} /> },
  ];

  return (
    <footer className="w-full bg-[#111114] text-white pb-14 md:pb-2 font-sans selection:bg-pink-700 selection:text-white">
      {/* Top accent line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-pink-600 to-transparent" />

      {/* <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-6 py-10 lg:py-10"> */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-4 py-2 lg:py-6">

        {/* ── Desktop: 3-column grid / Mobile: stacked ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 lg:gap-12">


          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-pink-500 mb-1">
              Quick Links
            </p>

          
            <div className="flex flex-wrap gap-x-2 gap-y-1">
              {quickLinks.map((link, i) => (
                <div key={link.label} className="flex items-center gap-x-2 whitespace-nowrap">
                  <a
                    href={link.href}
                    className="text-xs text-zinc-400 hover:text-pink-400 transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                  {/* Only add bullet if it's not the last item */}
                  {i < quickLinks.length - 1 && (
                    <span className="text-pink-700 text-xs">•</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── Col 3: Follow Us  */}
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-pink-500 mb-1">
              Follow Us
            </p>

            <div className="flex items-center gap-3">
              {socials.map((s) => (
                <SocialBtn key={s.label} href={s.href} label={s.label} color="">
                  {s.icon}
                </SocialBtn>
              ))}
            </div>
          </div>
        </div>

        {/* <GlowDivider /> */}

        {/* ── Bottom Bar ──────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between lg:justify-center gap-4 md:gap-8 lg:gap-6">

          {/* <div>
            <Link href="/MainModules/Feedback">
              <button
                className="group relative flex items-center justify-center w-7 h-7 md:w-7 md:h-7 lg:w-14 lg:h-14 rounded-full bg-gradient-to-r from-[#C9115F] to-[#e85d04] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95"
                aria-label="Give Feedback"
                title="Give Feedback"
              >
                <span className="absolute right-full mr-3 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#C9115F] to-[#e85d04]  text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  Give Feedback
                </span>
                <Pencil className="text-white w-3 h-3 md:w-4 md:h-4 lg:w-6 lg:h-6" />
              <span className="text-xs">Feedback</span>
                <span className="absolute inset-0 rounded-full animate-ping bg-[#C9115F] opacity-40" />
              </button>
            </Link>
          </div> */}

          <div className="flex flex-row justify-between items-center mt-4 md:mt-0 lg:mt-4 gap-2 lg:gap-14">
            <div className="flex items-center gap-2.5 md:mt-0">
              {/* <RocketIcon /> */}
              <div>
                <p className="text-xs font-medium text-zinc-300 whitespace-nowrap">
                  Beta Build v0.0.02
                </p>
                <p className="text-[11px] text-zinc-600 whitespace-nowrap">We&apos;re improving every day.</p>
              </div>
            </div>

            {/* Left: copyright */}
            <div className="flex items-center gap-2.5">
              {/* <div className="w-4 h-4">
                  <ShieldIcon  />
              </div> */}

              <div>
                <p className="flex whitespace-nowrap text-xs font-medium text-zinc-300">
                  © 2026 SportsFan360
                </p>
                <p className="text-[11px] text-zinc-600">All rights reserved.</p>
              </div>
            </div>
          </div>


        </div>


      </div>


    </footer>
  );
};

export default SportsFan360Footer;