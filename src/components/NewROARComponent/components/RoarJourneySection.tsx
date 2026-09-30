"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RoarJourneySectionProps {
    // FlipARENA counts (optional with fallback to 0)
    polls?: number;
    arenaPredictions?: number;
    fanBattles?: number;
    quiz?: number;
    meme?: number;

    // ROAR counts
    predictions: number;
    debates: number;
    posts: number;

    badgeSrcs: string[];
    badgeNames?: string[];
    onToast: (m: string) => void;
}

function buildShareText(
    predictions: number,
    debates: number,
    posts: number,
    badgeCount: number,
    polls: number = 0,
    arenaPredictions: number = 0,
    fanBattles: number = 0,
    quiz: number = 0,
    meme: number = 0,
    badgeNames: string[] = [],
    badgeSrcs: string[] = []
) {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://sportsfan-frontend.vercel.app";
    const url = typeof window !== "undefined" ? window.location.href : "https://sportsfan-frontend.vercel.app/MainModules/ROAR";
    
    const badgesSection = badgeNames.length > 0
        ? [
            `🏅 Badges Earned (${badgeNames.length}):`,
            ...badgeNames.map((name, idx) => {
                const src = badgeSrcs[idx];
                const fullSrc = src ? (src.startsWith("http") ? src : `${origin}${src.startsWith("/") ? "" : "/"}${src}`) : "";
                return fullSrc ? `  🎖️ ${name}: ${fullSrc}` : `  🎖️ ${name}`;
            }),
          ]
        : badgeCount > 0
        ? [`🏅 Badges Earned: ${badgeCount}`]
        : [];

    return [
        "🔥 My Sportsfan360 Journey",
        "",
        "⚔️ FlipARENA:",
        `  📊 Polls: ${polls}`,
        `  🎯 Predictions: ${arenaPredictions}`,
        `  🥊 Fan Battles: ${fanBattles}`,
        `  🧠 Quizzes: ${quiz}`,
        `  🎭 Memes: ${meme}`,
        "",
        "🦁 ROAR:",
        `  🔮 Predictions: ${predictions}`,
        `  ⚡ Debates: ${debates}`,
        `  ✏️ Posts: ${posts}`,
        ...badgesSection,
        "",
        `Join us 👉 ${url}`,
        "#StartRoaring #Sportsfan360",
    ]
        .filter((l) => l !== null)
        .join("\n");
}

const SHARE_ACTIONS = [
    { alt: "WhatsApp", src: "/images/share_whatsapp.png" },
    { alt: "Threads", src: "/images/share_thread.png" },
    { alt: "Instagram", src: "/images/share_insta.png" },
    { alt: "LinkedIn", src: "/images/Share_linkedin.png" },
    { alt: "X", src: "/images/Share_X.png" },
    { alt: "Copy", src: "/images/share_copy_link.png" },
];

export function RoarJourneySection({
    polls = 0,
    arenaPredictions = 0,
    fanBattles = 0,
    quiz = 0,
    meme = 0,
    predictions = 0,
    debates = 0,
    posts = 0,
    badgeSrcs = [],
    badgeNames = [],
    onToast,
}: RoarJourneySectionProps) {
    const [isMobile, setIsMobile] = useState(false);

    // ── Desktop state ──
    const [shareOpen, setShareOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    // ── Mobile state ──
    const [sharing, setSharing] = useState(false);
    const bgImageRef = useRef<HTMLImageElement | null>(null);
    const [bgFailed, setBgFailed] = useState(false);

    // Detect mobile
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    // Preload bg image for canvas
    useEffect(() => {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            bgImageRef.current = img;
        };
        img.onerror = () => {
            console.error("[RoarJourneySection] Failed to load /images/profilecard.png");
            setBgFailed(true);
        };
        img.src = "/images/profilecard.png";
    }, []);

    // Lock body scroll when desktop modal is open
    useEffect(() => {
        document.body.style.overflow = shareOpen ? "hidden" : "unset";
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [shareOpen]);

    // ── Desktop share handlers ──
    const text = buildShareText(
        predictions,
        debates,
        posts,
        badgeSrcs.length,
        polls,
        arenaPredictions,
        fanBattles,
        quiz,
        meme,
        badgeNames,
        badgeSrcs
    );

    const handleWhatsApp = () =>
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    const handleThreads = () =>
        window.open(
            `https://www.threads.net/intent/post?text=${encodeURIComponent(text)}`,
            "_blank"
        );
    const handleInstagram = async () => {
        await navigator.clipboard?.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
        window.open("https://www.instagram.com/", "_blank");
    };
    const handleLinkedIn = () => {
        const currentUrl = typeof window !== "undefined" ? window.location.href : "https://sportsfan-frontend.vercel.app/MainModules/ROAR";
        window.open(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
            "_blank"
        );
    };
    const handleX = () =>
        window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
            "_blank"
        );
    const handleCopy = async () => {
        try {
            await navigator.clipboard?.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
            onToast("Copied to clipboard!");
        } catch {
            onToast("Could not copy.");
        }
    };

    const handlerMap: Record<string, () => void> = {
        WhatsApp: handleWhatsApp,
        Threads: handleThreads,
        Instagram: handleInstagram,
        LinkedIn: handleLinkedIn,
        X: handleX,
        Copy: handleCopy,
    };

    // Helper to fetch actual badge image files
    const fetchBadgeImageFiles = async (): Promise<File[]> => {
        const files: File[] = [];
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        for (let i = 0; i < badgeSrcs.length; i++) {
            const src = badgeSrcs[i];
            if (!src) continue;
            try {
                const fullUrl = src.startsWith("http") ? src : `${origin}${src.startsWith("/") ? "" : "/"}${src}`;
                const res = await fetch(fullUrl);
                if (res.ok) {
                    const blob = await res.blob();
                    const name = badgeNames[i]
                        ? `${badgeNames[i].toLowerCase().replace(/[^a-z0-9]/g, "_")}.png`
                        : `badge_${i + 1}.png`;
                    files.push(new File([blob], name, { type: blob.type || "image/png" }));
                }
            } catch (e) {
                console.error("[RoarJourneySection] Could not fetch badge image:", src, e);
            }
        }
        return files;
    };

    const loadCanvasImage = (src: string): Promise<HTMLImageElement | null> => {
        return new Promise((resolve) => {
            const img = new window.Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
            img.src = src;
        });
    };

    // ── Share Card Generator (Draws FlipARENA, ROAR, & Badges on the white card) ──
    const generateShareCard = async (): Promise<Blob | null> => {
        let bg = bgImageRef.current;
        if (!bg) {
            bg = await loadCanvasImage("/images/profilecard.png");
        }
        if (!bg) return null;

        const canvas = document.createElement("canvas");
        canvas.width = 1340;
        canvas.height = 752;
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;

        try {
            ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
        } catch (e) {
            console.error("[RoarJourneySection] Canvas draw failed:", e);
            return null;
        }

        // Draw crisp white rounded card over the template area
        const cardX = 105;
        const cardY = 412;
        const cardW = 1130;
        const cardH = 192;
        const cardR = 24;

        ctx.fillStyle = "#FFFFFF";
        if (typeof ctx.roundRect === "function") {
            ctx.beginPath();
            ctx.roundRect(cardX, cardY, cardW, cardH, cardR);
            ctx.fill();
        } else {
            ctx.fillRect(cardX, cardY, cardW, cardH);
        }

        // ── 1. Row 1: FlipARENA Tabs Data (5 columns) ──
        const arenaStats = [
            { label: "POLLS", value: polls, color: "#E91E8C" },
            { label: "PREDICTIONS", value: arenaPredictions, color: "#F59E0B" },
            { label: "FAN BATTLES", value: fanBattles, color: "#8B5CF6" },
            { label: "QUIZZES", value: quiz, color: "#06B6D4" },
            { label: "MEMES", value: meme, color: "#10B981" },
        ];

        const arenaColW = cardW / arenaStats.length;
        arenaStats.forEach((stat, idx) => {
            const cx = cardX + (idx + 0.5) * arenaColW;

            // Value (minimized & crisp)
            ctx.font = "bold 26px Arial, sans-serif";
            ctx.fillStyle = stat.color;
            ctx.textAlign = "center";
            ctx.fillText(String(stat.value), cx, 444);

            // Label
            ctx.font = "bold 9.5px Arial, sans-serif";
            ctx.fillStyle = "#64748B";
            ctx.textAlign = "center";
            ctx.fillText(stat.label, cx, 458);
        });

        // Subtle divider between Row 1 and Row 2
        ctx.strokeStyle = "rgba(0, 0, 0, 0.05)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cardX + 30, 468);
        ctx.lineTo(cardX + cardW - 30, 468);
        ctx.stroke();

        // ── 2. Row 2: ROAR Tabs Data (3 columns) ──
        const roarStats = [
            { label: "ROAR PREDICTIONS", value: predictions, color: "#9333EA" },
            { label: "ROAR DEBATES", value: debates, color: "#FF6B35" },
            { label: "ROAR POSTS", value: posts, color: "#14B8A6" },
        ];

        const roarColW = cardW / roarStats.length;
        roarStats.forEach((stat, idx) => {
            const cx = cardX + (idx + 0.5) * roarColW;

            // Value (minimized & crisp)
            ctx.font = "bold 25px Arial, sans-serif";
            ctx.fillStyle = stat.color;
            ctx.textAlign = "center";
            ctx.fillText(String(stat.value), cx, 498);

            // Label
            ctx.font = "bold 9.5px Arial, sans-serif";
            ctx.fillStyle = "#64748B";
            ctx.textAlign = "center";
            ctx.fillText(stat.label, cx, 511);
        });

        // ── 3. Row 3: Badges below tabs data (Direct Badge Images) ──
        const validBadgeSrcs = badgeSrcs.filter(Boolean).slice(0, 8);
        if (validBadgeSrcs.length > 0) {
            const loadedBadgeImages = await Promise.all(
                validBadgeSrcs.map((src) => loadCanvasImage(src))
            );
            const validImages = loadedBadgeImages.filter((img): img is HTMLImageElement => img !== null);

            if (validImages.length > 0) {
                const badgeSize = 40;
                const badgeGap = 14;
                const totalWidth = validImages.length * badgeSize + (validImages.length - 1) * badgeGap;
                let startX = cardX + (cardW - totalWidth) / 2;
                const badgeY = 535;

                validImages.forEach((img) => {
                    // Soft circular background for badge icon
                    ctx.fillStyle = "rgba(241, 245, 249, 0.95)";
                    ctx.beginPath();
                    ctx.arc(startX + badgeSize / 2, badgeY + badgeSize / 2, badgeSize / 2 + 2, 0, Math.PI * 2);
                    ctx.fill();

                    // Subtle border around badge icon circle
                    ctx.strokeStyle = "rgba(203, 213, 225, 0.7)";
                    ctx.lineWidth = 1;
                    ctx.stroke();

                    // Draw badge image
                    ctx.drawImage(img, startX, badgeY, badgeSize, badgeSize);
                    startX += badgeSize + badgeGap;
                });
            }
        }

        return new Promise((resolve) => {
            canvas.toBlob((blob) => resolve(blob), "image/png", 0.95);
        });
    };

    const handleMobileShare = async () => {
        if (sharing) return;
        setSharing(true);
        try {
            // 1. Fetch direct badge image files
            const badgeFiles = await fetchBadgeImageFiles();
            const shareFiles: File[] = [...badgeFiles];

            // 2. Also generate summary card if available
            const cardBlob = await generateShareCard();
            if (cardBlob) {
                const cardFile = new File([cardBlob], "my-roar-journey.png", {
                    type: "image/png",
                });
                shareFiles.unshift(cardFile);
            }

            // 3. Share files directly via native share
            if (
                shareFiles.length > 0 &&
                typeof navigator !== "undefined" &&
                navigator.canShare?.({ files: shareFiles })
            ) {
                try {
                    const currentUrl = typeof window !== "undefined" ? window.location.href : "https://sportsfan-frontend.vercel.app/MainModules/ROAR";
                    await navigator.share({
                        files: shareFiles,
                        title: "My Sportsfan Journey & Badges",
                        text: `Hey! Check out my journey & badges on Sportsfan360 👉 ${currentUrl}`,
                    });
                    return;
                } catch (shareErr: any) {
                    if (shareErr?.name === "AbortError") return;
                    console.error("[RoarJourneySection] navigator.share threw:", shareErr);
                }
            }

            // 4. Fallback for single file share if multiple files not supported
            if (
                shareFiles.length > 0 &&
                typeof navigator !== "undefined" &&
                navigator.canShare?.({ files: [shareFiles[0]] })
            ) {
                try {
                    const currentUrl = typeof window !== "undefined" ? window.location.href : "https://sportsfan-frontend.vercel.app/MainModules/ROAR";
                    await navigator.share({
                        files: [shareFiles[0]],
                        title: "My Sportsfan Journey",
                        text: `Hey! Check out my journey on Sportsfan360 👉 ${currentUrl}`,
                    });
                    return;
                } catch (shareErr: any) {
                    if (shareErr?.name === "AbortError") return;
                }
            }

            // 5. Fallback download
            if (shareFiles.length > 0) {
                const url = URL.createObjectURL(shareFiles[0]);
                const a = document.createElement("a");
                a.href = url;
                a.download = shareFiles[0].name;
                a.click();
                URL.revokeObjectURL(url);
                onToast("Badge image saved! Share it from your gallery.");
            } else {
                if (bgFailed) {
                    onToast("Couldn't load share images.");
                } else {
                    await navigator.clipboard?.writeText(text);
                    onToast("Copied to clipboard!");
                }
            }
        } catch (err: any) {
            if (err?.name !== "AbortError") {
                console.error("[RoarJourneySection] handleShare failed:", err);
                onToast("Could not share.");
            }
        } finally {
            setSharing(false);
        }
    };

    const displayedBadges = badgeSrcs.slice(0, 4);

    return (
        <div style={{ padding: "0 14px 18px" }}>
            {/* ── Card ── */}
            <div
                style={{
                    borderRadius: 20,
                    overflow: "hidden",
                    background:
                        "linear-gradient(160deg, #1c1628 0%, #0e0e18 60%, #180e20 100%)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    position: "relative",
                }}
            >
                {/* Glow */}
                <div
                    style={{
                        position: "absolute",
                        top: -40,
                        right: -40,
                        width: 160,
                        height: 160,
                        borderRadius: "50%",
                        background: "rgba(233,30,140,0.1)",
                        filter: "blur(44px)",
                        pointerEvents: "none",
                    }}
                />

                {/* Header */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "14px 16px 8px",
                    }}
                >
                    <span
                        style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#fff",
                            letterSpacing: "0.01em",
                        }}
                    >
                        Your Journey
                    </span>
                </div>

                {/* ── 1. FlipARENA Section ── */}
                <div style={{ padding: "0 14px 12px" }}>
                    <p
                        style={{
                            fontSize: 10,
                            fontWeight: 800,
                            letterSpacing: "0.08em",
                            color: "#F472B6",
                            margin: "0 0 8px 2px",
                           
                        }}
                    >
                        FlipARENA
                    </p>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, 1fr)",
                            gap: 6,
                        }}
                    >
                        {[
                            { label: "POLL", value: polls, icon: "📊", color: "#38BDF8" },
                            { label: "PREDICTION", value: arenaPredictions, icon: "🎯", color: "#A855F7" },
                            { label: "BATTLE", value: fanBattles, icon: "⚔️", color: "#EF4444" },
                            { label: "QUIZ", value: quiz, icon: "🧠", color: "#F59E0B" },
                            { label: "MEME", value: meme, icon: "🎭", color: "#10B981" },
                        ].map(({ label, value, icon, color }) => (
                            <div
                                key={label}
                                style={{
                                    background: "#0a0a14",
                                    border: "1px solid rgba(255,255,255,0.06)",
                                    borderRadius: 12,
                                    padding: "8px 4px 6px",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 4,
                                }}
                            >
                                <div
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 2,
                                        background: "rgba(255,255,255,0.05)",
                                        borderRadius: 999,
                                        padding: "1px 5px",
                                    }}
                                >
                                    <span style={{ fontSize: 8, lineHeight: 1 }}>{icon}</span>
                                    <span
                                        style={{
                                            fontSize: 7,
                                            fontWeight: 800,
                                            letterSpacing: "0.04em",
                                            color: color,
                                            textTransform: "uppercase",
                                        }}
                                    >
                                        {label}
                                    </span>
                                </div>
                                <span
                                    style={{
                                        fontFamily:
                                            "'Bebas Neue','Impact','Arial Narrow',sans-serif",
                                        fontSize: 24,
                                        fontWeight: 900,
                                        color: "#fff",
                                        lineHeight: 1,
                                    }}
                                >
                                    {value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── 2. ROAR Section ── */}
                <div style={{ padding: "0 14px 14px" }}>
                    <p
                        style={{
                            fontSize: 10,
                            fontWeight: 800,
                            letterSpacing: "0.08em",
                            color: "#FF6B35",
                            margin: "0 0 8px 2px",
                            textTransform: "uppercase",
                        }}
                    >
                        ROAR
                    </p>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, 1fr)",
                            gap: 8,
                        }}
                    >
                        {[
                            { label: "PREDICT", value: predictions, icon: "🔮", hot: true },
                            { label: "DEBATE", value: debates, icon: "⚡", hot: false },
                            { label: "POST", value: posts, icon: "✏️", hot: false },
                        ].map(({ label, value, icon, hot }) => (
                            <div
                                key={label}
                                style={{
                                    background: "#0a0a14",
                                    border: `1px solid ${hot
                                            ? "rgba(233,30,140,0.25)"
                                            : "rgba(255,255,255,0.06)"
                                        }`,
                                    borderRadius: 14,
                                    padding: "8px 10px 6px",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "flex-start",
                                    gap: 4,
                                }}
                            >
                                <div
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 3,
                                        background: hot
                                            ? "rgba(233,30,140,0.18)"
                                            : "rgba(255,255,255,0.08)",
                                        borderRadius: 999,
                                        padding: "2px 7px 2px 5px",
                                    }}
                                >
                                    <span style={{ fontSize: 9, lineHeight: 1 }}>{icon}</span>
                                    <span
                                        style={{
                                            fontSize: 8,
                                            fontWeight: 800,
                                            letterSpacing: "0.07em",
                                            color: hot
                                                ? "#E91E8C"
                                                : "rgba(255,255,255,0.6)",
                                            textTransform: "uppercase",
                                        }}
                                    >
                                        {label}
                                    </span>
                                </div>

                                <span
                                    style={{
                                        fontFamily:
                                            "'Bebas Neue','Impact','Arial Narrow',sans-serif",
                                        fontSize: 32,
                                        fontWeight: 900,
                                        color: "#fff",
                                        lineHeight: 1,
                                        paddingLeft: 2,
                                    }}
                                >
                                    {value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Badges ── */}
                <div style={{ padding: "0 14px 14px" }}>
                    <p
                        style={{
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: "0.08em",
                            color: "rgba(255,255,255,0.45)",
                            margin: "0 0 8px 2px",
                            textTransform: "uppercase",
                        }}
                    >
                        Badges Earned
                    </p>
                    <div style={{ display: "flex", gap: 10 }}>
                        {displayedBadges.map((src, i) => (
                            <div
                                key={i}
                                style={{
                                    width: 54,
                                    height: 54,
                                    borderRadius: 14,
                                    background: "rgba(255,255,255,0.04)",
                                    border: "1px solid rgba(255,255,255,0.07)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    overflow: "hidden",
                                    flexShrink: 0,
                                }}
                            >
                                <img
                                    src={src}
                                    alt={`Badge ${i + 1}`}
                                    style={{ width: 44, height: 44, objectFit: "contain" }}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Footer ── */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 14px 16px",
                    }}
                >
                    <div>
                        <p
                            style={{
                                fontSize: 10,
                                color: "rgba(255,255,255,0.35)",
                                margin: "0 0 2px",
                            }}
                        >
                            Join us at Sportsfan360
                        </p>
                        <p
                            style={{
                                fontSize: 10,
                                fontWeight: 800,
                                margin: 0,
                                background: "linear-gradient(90deg,#E91E8C,#FF6B35)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                            }}
                        >
                            #StartRoaring
                        </p>
                    </div>

                    <motion.button
                        whileTap={{ scale: 0.91 }}
                        onClick={() => {
                            if (isMobile) {
                                handleMobileShare();
                            } else {
                                setShareOpen(true);
                                setCopied(false);
                            }
                        }}
                        disabled={sharing}
                        style={{
                            padding: "9px 22px",
                            border: "1.5px solid rgba(255,255,255,0.3)",
                            borderRadius: 999,
                            background: "transparent",
                            color: "#fff",
                            fontSize: 13,
                            fontWeight: 700,
                            cursor: sharing ? "not-allowed" : "pointer",
                            letterSpacing: "0.01em",
                            opacity: sharing ? 0.6 : 1,
                            transition: "opacity 0.15s",
                        }}
                    >
                        {isMobile && sharing ? "Sharing…" : "Share"}
                    </motion.button>
                </div>
            </div>

            {/* ── Desktop Share Modal ── */}
            <AnimatePresence>
                {!isMobile && shareOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShareOpen(false)}
                            style={{
                                position: "fixed",
                                inset: 0,
                                zIndex: 200,
                                background: "rgba(0,0,0,0.75)",
                                backdropFilter: "blur(4px)",
                            }}
                        />

                        {/* Dialog */}
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            transition={{ type: "spring", damping: 28, stiffness: 320 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                position: "fixed",
                                zIndex: 210,
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                width: "calc(100% - 32px)",
                                maxWidth: 320,
                                background: "#1a1a1e",
                                borderRadius: 16,
                                border: "1px solid rgba(255,255,255,0.10)",
                                padding: 16,
                                boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
                                maxHeight: "80vh",
                                overflowY: "auto",
                            }}
                        >
                            {/* Modal Header */}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    marginBottom: 12,
                                }}
                            >
                                <p
                                    style={{
                                        color: "#fff",
                                        fontSize: 14,
                                        fontWeight: 700,
                                        margin: 0,
                                    }}
                                >
                                    Share
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setShareOpen(false)}
                                    style={{
                                        width: 26,
                                        height: 26,
                                        borderRadius: "50%",
                                        background: "rgba(255,255,255,0.06)",
                                        border: "none",
                                        color: "rgba(255,255,255,0.6)",
                                        fontSize: 12,
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Share Icons */}
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(6, 1fr)",
                                    gap: 6,
                                    marginBottom: 4,
                                }}
                            >
                                {SHARE_ACTIONS.map(({ alt, src }) => (
                                    <button
                                        key={alt}
                                        type="button"
                                        onClick={handlerMap[alt]}
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            gap: 4,
                                            background: "transparent",
                                            border: "none",
                                            cursor: "pointer",
                                            padding: 0,
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: "50%",
                                                overflow: "hidden",
                                                background: "rgba(255,255,255,0.05)",
                                                border: "1px solid rgba(255,255,255,0.08)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <img
                                                src={src}
                                                alt={alt}
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "cover",
                                                    borderRadius: "50%",
                                                }}
                                            />
                                        </div>
                                        <span
                                            style={{
                                                fontSize: 7,
                                                color: "rgba(255,255,255,0.35)",
                                                fontWeight: 500,
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {alt}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {copied && (
                                <motion.p
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{
                                        fontSize: 10,
                                        color: "#34d399",
                                        textAlign: "center",
                                        fontWeight: 600,
                                        marginTop: 8,
                                        marginBottom: 0,
                                    }}
                                >
                                    ✓ Copied!
                                </motion.p>
                            )}

                            <button
                                type="button"
                                onClick={() => setShareOpen(false)}
                                style={{
                                    marginTop: 12,
                                    padding: "6px 0",
                                    width: "100%",
                                    background: "rgba(255,255,255,0.04)",
                                    border: "1px solid rgba(255,255,255,0.06)",
                                    borderRadius: 8,
                                    color: "rgba(255,255,255,0.4)",
                                    fontSize: 11,
                                    fontWeight: 500,
                                    cursor: "pointer",
                                }}
                            >
                                Close
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
