"use client";

import Image from "next/image";
import Link from "next/link";

export default function WelcomeCard() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-[#3a0000] via-black to-[#120000] relative">

      {/* Glow overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/30 via-transparent to-orange-600/20 pointer-events-none" />

      <div className="flex flex-col items-center justify-between min-h-screen w-full max-w-md px-6 py-12 text-center z-10">

        {/* Top Content */}
        <div className="flex flex-col items-center pt-8">
          <div className="mb-6">
            <Image
              src="/images/Logo.png"
              alt="logo"
              width={100}
              height={120}
              className="object-contain"
            />
          </div>
          <p className="text-gray-300 text-[25px] lg:text-[32px] mb-4">Welcome to</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-10">
            SPORTSFAN360
          </h1>
          <p className="text-gray-400 text-sm md:text-base max-w-xs">
            Watch, play, and chat with your tribe.
          </p>
        </div>

        {/* Bottom Section */}
        <div className="w-full">
          <Link href="/auth/login">
            <button className="w-full bg-gray-200 text-black py-3 rounded-full font-bold hover:bg-white transition cursor-pointer">
              Start
            </button>
          </Link>

          <button className="w-full text-white mt-4 py-3 border rounded-full font-medium hover:bg-white/10 transition cursor-pointer">
            Use as Guest
          </button>

          <div className="text-xs text-gray-400 mt-6">
            <span className="cursor-pointer hover:text-white">Privacy Policy</span>
            <span className="mx-2">|</span>
            <span className="cursor-pointer hover:text-white">Terms & Conditions</span>
          </div>
        </div>

      </div>
    </div>
  );
}