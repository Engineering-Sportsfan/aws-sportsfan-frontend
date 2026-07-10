"use client";

import { useState } from "react";
import AskDolly from "./AskDolly";

const IMG_HARMANPREET_FULL = "/images/IMG_HARMANPREET_FULL.webp";
const IMG_TEAM_INDIA_FULL = "/images/Georgia-Voll.png";
const IMG_YOUNG_TALENT_FULL = "/images/Hayley-Matthews.png";

export default function Intelligence360Card() {
  const [showDolly, setShowDolly] = useState(false);

  const signals = [
    {
      title: "KAUR PARADOX",
      desc: "Critiqued during lean patches, yet irreplaceable for India.",
      label: "SIGNAL 1",
      labelColor: "#ff2a5f",
      bg: "linear-gradient(to right, rgba(127,29,29,0.90) 0%, #111111 65%)",
      img: IMG_HARMANPREET_FULL,
    },
    {
      title: "RUNS OF EMOTION",
      desc: "India's T20I campaign carries millions of dreams.",
      label: "SIGNAL 2",
      labelColor: "#d97706",
      bg: "linear-gradient(to right, rgba(120,80,10,0.90) 0%, #111111 65%)",
      img: IMG_TEAM_INDIA_FULL,
    },
    {
      title: "GENERATION SHIFT",
      desc: "Women's cricket young wave ready to take over in 2026.",
      label: "SIGNAL 3",
      labelColor: "#60a5fa",
      bg: "linear-gradient(to right, rgba(30,58,138,0.90) 0%, #111111 65%)",
      img: IMG_YOUNG_TALENT_FULL,
    },
  ];

  return (
    <>
      {showDolly && <AskDolly onClose={() => setShowDolly(false)} />}

      <div
        className="flex flex-col bg-[#111111] rounded-xl p-4 w-full h-full"
        style={{
          border: "1px solid #1f1f1f",
          minHeight: "340px",
        }}
      >
        {/* Header */}

        <div className="flex justify-between items-center mb-3">
          <h3 className="text-white font-bold text-lg">360° Intelligence</h3>

          <button className="text-sm font-medium" style={{ color: "#ff2a5f" }}>
            See all
          </button>
        </div>

        {/* Signal Cards */}

        <div className="flex flex-col gap-2 flex-grow">
          {signals.map((item) => (
            <div
              key={item.label}
              className="
                rounded-xl
                overflow-hidden
                relative
                cursor-pointer
                hover:opacity-90
                transition-opacity
                flex
                items-stretch
              "
              style={{
                background: item.bg,
                border: "1px solid rgba(255,255,255,0.06)",
                minHeight: "90px",
              }}
            >
              {/* Player Image */}

              <div
                className="
                  relative
                  flex-shrink-0
                  w-[95px]
                  overflow-hidden
                "
              >
                <img
                  src={item.img}
                  alt={item.title}
                  className="
                    absolute
                    bottom-0
                    left-0
                    w-full
                    h-full
                  "
                  style={{
                    objectFit: "contain",
                    objectPosition: "bottom left",
                  }}
                />
              </div>

              {/* Text */}

              <div
                className="
                  flex
                  flex-col
                  justify-center
                  px-3
                  py-3
                  z-10
                  flex-1
                "
              >
                <p
                  className="
                    text-[10px]
                    font-bold
                    tracking-widest
                    uppercase
                    mb-1
                  "
                  style={{
                    color: item.labelColor,
                  }}
                >
                  {item.label}
                </p>

                <h4
                  className="
                    text-white
                    text-sm
                    font-black
                    uppercase
                    leading-tight
                    tracking-wide
                    mb-1
                  "
                >
                  {item.title}
                </h4>

                <p
                  className="
                    text-gray-300
                    text-[11px]
                    leading-snug
                  "
                >
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Button */}

        <button
          onClick={() => setShowDolly(true)}
          className="
            mt-3
            rounded-lg
            py-2
            font-semibold
            text-sm
            transition-all
            hover:opacity-90
          "
          style={{
            background: "linear-gradient(90deg,#ff2a5f,#ff6a00)",
            color: "white",
          }}
        >
          Ask Dolly
        </button>
      </div>
    </>
  );
}
