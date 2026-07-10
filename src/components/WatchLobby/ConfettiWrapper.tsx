"use client";

import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

interface ConfettiWrapperProps {
    trigger: number;
    duration?: number;
    text?: string;
}

interface EmojiParticle {
    id: number;
    emoji: string;
    left: string;
    delay: string;
    duration: string;
    size: string;
    rotation: string;
    drift: string;
}

export default function ConfettiWrapper({ trigger, duration = 4000, text }: ConfettiWrapperProps) {
    const { width, height } = useWindowSize();
    const [isActive, setIsActive] = useState(false);
    const [particles, setParticles] = useState<EmojiParticle[]>([]);

    useEffect(() => {
        if (trigger > 0) {
            setIsActive(true);

            // Generate custom emoji particles if the triggered reaction is FIRE, HEART, or CLAP
            if (text && ["FIRE", "HEART", "CLAP"].includes(text)) {
                const emoji = text === "FIRE" ? "🔥" : text === "HEART" ? "❤️" : "👏";
                const count = 45;
                const newParticles = Array.from({ length: count }).map((_, i) => ({
                    id: i + Date.now(),
                    emoji,
                    left: `${Math.random() * 100}%`,
                    delay: `${Math.random() * 1.5}s`,
                    duration: `${2 + Math.random() * 2.5}s`,
                    size: `${24 + Math.random() * 36}px`,
                    rotation: `${-60 + Math.random() * 120}deg`,
                    drift: `${-80 + Math.random() * 160}px`
                }));
                setParticles(newParticles);
            } else {
                setParticles([]);
            }

            const timer = setTimeout(() => {
                setIsActive(false);
                setParticles([]);
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [trigger, duration, text]);

    if (!isActive) return null;

    // Check if we should render custom emoji flurries instead of regular confetti
    const isCustomEmojiShower = text && ["FIRE", "HEART", "CLAP"].includes(text);

    return (
        <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center overflow-hidden">
            {isCustomEmojiShower ? (
                // Custom Fullscreen Emoji Particles
                <div className="absolute inset-0 w-full h-full pointer-events-none">
                    {particles.map((p) => (
                        <span
                            key={p.id}
                            className="absolute animate-emoji-float select-none filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
                            style={{
                                left: p.left,
                                bottom: "-10vh",
                                fontSize: p.size,
                                animationDelay: p.delay,
                                animationDuration: p.duration,
                                "--rot": p.rotation,
                                "--drift": p.drift,
                            } as any}
                        >
                            {p.emoji}
                        </span>
                    ))}
                </div>
            ) : (
                // Standard Confetti for major match moments
                text !== "WOW" && text !== "LINK COPIED" && (
                    <Confetti 
                        width={width} 
                        height={height} 
                        recycle={false} 
                        numberOfPieces={400} 
                        gravity={0.15}
                    />
                )
            )}

            {/* Glowing text overlays for major cricket moments */}
            {text && text !== "FIRE" && text !== "HEART" && text !== "CLAP" && text !== "LINK COPIED" && (
                <div className="absolute animate-bounce z-50 pointer-events-auto">
                    <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 uppercase tracking-widest drop-shadow-[0_8px_8px_rgba(0,0,0,0.9)] scale-95 hover:scale-100 transition-all select-none">
                        {text}!
                    </h1>
                </div>
            )}

            <style jsx global>{`
                @keyframes emojiFloatUp {
                    0% {
                        transform: translateY(0) scale(0.3) rotate(0deg);
                        opacity: 0;
                    }
                    15% {
                        opacity: 1;
                        transform: translateY(-15vh) scale(1) translateX(calc(var(--drift) * 0.2));
                    }
                    80% {
                        opacity: 0.95;
                    }
                    100% {
                        transform: translateY(-120vh) scale(1.1) rotate(var(--rot)) translateX(var(--drift));
                        opacity: 0;
                    }
                }
                .animate-emoji-float {
                    animation: emojiFloatUp 3s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
}
