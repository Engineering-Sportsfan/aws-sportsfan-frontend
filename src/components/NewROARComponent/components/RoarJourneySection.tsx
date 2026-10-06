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

    userId?: string | null;
    username?: string | null;
    badgeSrcs: string[];
    badgeNames?: string[];
    onToast: (m: string) => void;
}

function resolveProfileShareUrl(propUserId?: string | null, propUsername?: string | null): string {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://sportsfan-frontend.vercel.app";

    const sanitize = (id: any): string | null => {
        if (!id) return null;
        const s = String(id).trim();
        if (!s || s === "undefined" || s === "null") return null;
        return s.replace(/^@/, "");
    };

    // 1. Explicit propUserId passed from parent (e.g. Profile.tsx)
    const fromProp = sanitize(propUserId);
    if (fromProp) {
        return `${origin}/MainModules/Profile?userId=${encodeURIComponent(fromProp)}&profile=${encodeURIComponent(fromProp)}`;
    }

    if (typeof window !== "undefined") {
        // 2. Query params in current URL (if already on a profile page with query params)
        try {
            const params = new URLSearchParams(window.location.search);
            const queryId = sanitize(
                params.get("userId") ||
                params.get("profile") ||
                params.get("profileUserId") ||
                params.get("id") ||
                params.get("username")
            );
            if (queryId) {
                return `${origin}/MainModules/Profile?userId=${encodeURIComponent(queryId)}&profile=${encodeURIComponent(queryId)}`;
            }
        } catch { }

        // 3. Stored auth user in localStorage
        try {
            const stored = localStorage.getItem("auth_user");
            if (stored) {
                const parsed = JSON.parse(stored);
                const authId = sanitize(parsed?.actualUserId || parsed?.userId || parsed?.email);
                if (authId) {
                    return `${origin}/MainModules/Profile?userId=${encodeURIComponent(authId)}&profile=${encodeURIComponent(authId)}`;
                }
            }
        } catch { }

        // 4. Stored userId in localStorage
        try {
            const storedUid = sanitize(localStorage.getItem("userId"));
            if (storedUid) {
                return `${origin}/MainModules/Profile?userId=${encodeURIComponent(storedUid)}&profile=${encodeURIComponent(storedUid)}`;
            }
        } catch { }

        // 5. Stored username in localStorage (if not generic placeholder)
        try {
            const storedUsername = sanitize(localStorage.getItem("roar_username"));
            if (storedUsername && !["Fan", "RoarUser", "ROARFAN", "ROAR fan", "ROAR Fan"].includes(storedUsername)) {
                return `${origin}/MainModules/Profile?userId=${encodeURIComponent(storedUsername)}&profile=${encodeURIComponent(storedUsername)}`;
            }
        } catch { }
    }

    // 6. Fallback to propUsername if valid
    const fromUsername = sanitize(propUsername);
    if (fromUsername && !["Fan", "RoarUser", "ROARFAN", "ROAR fan", "ROAR Fan"].includes(fromUsername)) {
        return `${origin}/MainModules/Profile?userId=${encodeURIComponent(fromUsername)}&profile=${encodeURIComponent(fromUsername)}`;
    }

    // 7. Ultimate fallback
    return `${origin}/MainModules/Profile`;
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
    badgeSrcs: string[] = [],
    shareUrl?: string | null,
    username?: string | null
) {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://sportsfan-frontend.vercel.app";
    const url = shareUrl || `${origin}/MainModules/Profile`;
    
    const ROOKIE_FAN_BADGE_SRC = "/images/badges/rookiefan.png";
    const ROOKIE_FAN_BADGE_NAME = "Rookie Fan";

    // Find badges that are not rookie fan
    const otherBadgeIndices = badgeSrcs
        .map((src, idx) => ({ src, idx }))
        .filter(({ src }) => src && !src.toLowerCase().includes("rookiefan"));

    let latestName = ROOKIE_FAN_BADGE_NAME;
    let latestSrc = ROOKIE_FAN_BADGE_SRC;

    if (otherBadgeIndices.length > 0) {
        const last = otherBadgeIndices[otherBadgeIndices.length - 1];
        latestSrc = last.src || ROOKIE_FAN_BADGE_SRC;
        latestName = badgeNames[last.idx] || "Badge";
    } else if (badgeNames.length > 0 && badgeSrcs.length > 0) {
        const rookieIdx = badgeSrcs.findIndex((s) => s && s.toLowerCase().includes("rookiefan"));
        if (rookieIdx !== -1) {
            latestName = badgeNames[rookieIdx] || ROOKIE_FAN_BADGE_NAME;
            latestSrc = badgeSrcs[rookieIdx] || ROOKIE_FAN_BADGE_SRC;
        } else {
            latestName = badgeNames[badgeNames.length - 1] || ROOKIE_FAN_BADGE_NAME;
            latestSrc = badgeSrcs[badgeSrcs.length - 1] || ROOKIE_FAN_BADGE_SRC;
        }
    }

    const fullSrc = latestSrc ? (latestSrc.startsWith("http") ? latestSrc : `${origin}${latestSrc.startsWith("/") ? "" : "/"}${latestSrc}`) : "";

    const badgesSection = [
        "🏅 Badge Earned:",
        fullSrc ? `  🎖️ ${latestName}: ${fullSrc}` : `  🎖️ ${latestName}`,
    ];

    const titleLine = username ? `🔥 ${username}'s Sportsfan360 Journey` : "🔥 My Sportsfan360 Journey";

    return [
        titleLine,
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
        `Check out my profile 👉 ${url}`,
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
    userId,
    username,
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

    const shareUrl = resolveProfileShareUrl(userId, username);

    const ROOKIE_FAN_BADGE_SRC = "/images/badges/rookiefan.png";
    const otherBadges = (badgeSrcs || []).filter(
        (src) => src && !src.toLowerCase().includes("rookiefan")
    );
    const latestBadgeSrc =
        otherBadges.length > 0
            ? otherBadges[otherBadges.length - 1]
            : (badgeSrcs?.find((src) => src && src.toLowerCase().includes("rookiefan")) || ROOKIE_FAN_BADGE_SRC);

    const displayedBadges = latestBadgeSrc ? [latestBadgeSrc] : [ROOKIE_FAN_BADGE_SRC];

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
        badgeSrcs,
        shareUrl,
        username
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
        window.open(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
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

        // Draw crisp white rounded card covering the full template area including bottom labels
        const cardX = 96;
        const cardY = 448;
        const cardW = 1148;
        const cardH = 208;
        const cardR = 24;

        ctx.fillStyle = "#FFFFFF";
        if (typeof ctx.roundRect === "function") {
            ctx.beginPath();
            ctx.roundRect(cardX, cardY, cardW, cardH, cardR);
            ctx.fill();
        } else {
            ctx.fillRect(cardX, cardY, cardW, cardH);
        }

        // ── 1. Section 1: FlipARENA Title & Tabs Data ──
        ctx.font = "900 10.5px Arial, sans-serif";
        ctx.fillStyle = "#E91E8C";
        ctx.textAlign = "center";
        ctx.fillText("FLIPARENA", cardX + cardW / 2, cardY + 16);

        const arenaStats = [
            { label: "POLLS", value: polls, color: "#38BDF8" },
            { label: "PREDICTIONS", value: arenaPredictions, color: "#A855F7" },
            { label: "FAN BATTLES", value: fanBattles, color: "#EF4444" },
            { label: "QUIZZES", value: quiz, color: "#F59E0B" },
            { label: "MEMES", value: meme, color: "#10B981" },
        ];

        const arenaColW = cardW / arenaStats.length;
        arenaStats.forEach((stat, idx) => {
            const cx = cardX + (idx + 0.5) * arenaColW;

            // Value
            ctx.font = "bold 20px Arial, sans-serif";
            ctx.fillStyle = stat.color;
            ctx.textAlign = "center";
            ctx.fillText(String(stat.value), cx, cardY + 38);

            // Label
            ctx.font = "bold 8px Arial, sans-serif";
            ctx.fillStyle = "#64748B";
            ctx.textAlign = "center";
            ctx.fillText(stat.label, cx, cardY + 50);
        });

        // Subtle divider between FlipARENA and ROAR
        ctx.strokeStyle = "rgba(0, 0, 0, 0.06)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cardX + 40, cardY + 59);
        ctx.lineTo(cardX + cardW - 40, cardY + 59);
        ctx.stroke();

        // ── 2. Section 2: ROAR Title & Tabs Data ──
        ctx.font = "900 10.5px Arial, sans-serif";
        ctx.fillStyle = "#FF6B35";
        ctx.textAlign = "center";
        ctx.fillText("ROAR", cardX + cardW / 2, cardY + 74);

        const roarStats = [
            { label: "PREDICTIONS", value: predictions, color: "#9333EA" },
            { label: "DEBATES", value: debates, color: "#FF6B35" },
            { label: "POSTS", value: posts, color: "#14B8A6" },
        ];

        const roarColW = cardW / roarStats.length;
        roarStats.forEach((stat, idx) => {
            const cx = cardX + (idx + 0.5) * roarColW;

            // Value
            ctx.font = "bold 20px Arial, sans-serif";
            ctx.fillStyle = stat.color;
            ctx.textAlign = "center";
            ctx.fillText(String(stat.value), cx, cardY + 96);

            // Label
            ctx.font = "bold 8px Arial, sans-serif";
            ctx.fillStyle = "#64748B";
            ctx.textAlign = "center";
            ctx.fillText(stat.label, cx, cardY + 108);
        });

        // Subtle divider between ROAR and Badges
        ctx.strokeStyle = "rgba(0, 0, 0, 0.06)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cardX + 40, cardY + 117);
        ctx.lineTo(cardX + cardW - 40, cardY + 117);
        ctx.stroke();

        // ── 3. Section 3: Badges Earned Title & Direct Badge Images ──
        ctx.font = "900 10.5px Arial, sans-serif";
        ctx.fillStyle = "#475569";
        ctx.textAlign = "center";
        ctx.fillText("BADGES EARNED", cardX + cardW / 2, cardY + 132);

        const validBadgeSrcs = displayedBadges.filter(Boolean);
        if (validBadgeSrcs.length > 0) {
            const loadedBadgeImages = await Promise.all(
                validBadgeSrcs.map((src) => loadCanvasImage(src))
            );
            const validImages = loadedBadgeImages.filter((img): img is HTMLImageElement => img !== null);

            if (validImages.length > 0) {
                const badgeSize = 42;
                const badgeGap = 16;
                const totalWidth = validImages.length * badgeSize + (validImages.length - 1) * badgeGap;
                let startX = cardX + (cardW - totalWidth) / 2;
                const badgeY = cardY + 144;

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
            // Generate single summary card with FlipARENA, ROAR, and Badges drawn directly
            const cardBlob = await generateShareCard();
            const shareFiles: File[] = [];
            if (cardBlob) {
                const cardFile = new File([cardBlob], "my-sportsfan-journey.png", {
                    type: "image/png",
                });
                shareFiles.push(cardFile);
            }

            // Share single journey card directly via native share
            if (
                shareFiles.length > 0 &&
                typeof navigator !== "undefined" &&
                navigator.canShare?.({ files: shareFiles })
            ) {
                try {
                    await navigator.share({
                        files: shareFiles,
                        title: "My Sportsfan Journey",
                        text: `Hey! Check out my journey on Sportsfan360 👉 ${shareUrl}`,
                    });
                    return;
                } catch (shareErr: any) {
                    if (shareErr?.name === "AbortError") return;
                    console.error("[RoarJourneySection] navigator.share threw:", shareErr);
                }
            }

            // Fallback download if single file share not supported
            if (shareFiles.length > 0) {
                const url = URL.createObjectURL(shareFiles[0]);
                const a = document.createElement("a");
                a.href = url;
                a.download = shareFiles[0].name;
                a.click();
                URL.revokeObjectURL(url);
                onToast("Journey image saved! Share it from your gallery.");
            } else {
                if (bgFailed) {
                    onToast("Couldn't load share image.");
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
