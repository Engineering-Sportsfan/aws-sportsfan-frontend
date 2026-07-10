"use client";

import { Link2, MessageCircleMore, Share2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface InviteFriendModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    headline?: string;
    description?: string;
    shareUrl?: string;
    shareText?: string;
}

const FALLBACK_TITLE = "Invite Fans";
const FALLBACK_HEADLINE = "Grow the SportsFan360 community";
const FALLBACK_DESCRIPTION = "Help your friends get the ultimate fandom experience with SportsFan360.";

export default function InviteFriendModal({
    open,
    onClose,
    title = FALLBACK_TITLE,
    headline = FALLBACK_HEADLINE,
    description = FALLBACK_DESCRIPTION,
    shareUrl,
    shareText,
}: InviteFriendModalProps) {
    const [copied, setCopied] = useState(false);
    const [isShareOpen, setIsShareOpen] = useState(false);

    const resolvedShareUrl = useMemo(() => {
        if (typeof window === "undefined") return "";
        if (!shareUrl) return window.location.href;
        if (/^https?:\/\//i.test(shareUrl)) return shareUrl;
        return new URL(shareUrl, window.location.origin).toString();
    }, [shareUrl]);

    const resolvedShareText = useMemo(() => {
        if (shareText) return shareText;

        const shareLines = [
            headline,
            description,
            `Link: ${resolvedShareUrl}`,
        ].filter(Boolean);

        return shareLines.join("\n");
    }, [description, headline, resolvedShareUrl, shareText]);

    useEffect(() => {
        if (!open) {
            setCopied(false);
            setIsShareOpen(false);
        }
    }, [open]);

    const copyLink = async () => {
        if (!resolvedShareUrl) return;
        try {
            await navigator.clipboard.writeText(resolvedShareUrl);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
        } catch {
            const input = document.createElement("textarea");
            input.value = resolvedShareUrl;
            input.style.position = "fixed";
            input.style.opacity = "0";
            document.body.appendChild(input);
            input.focus();
            input.select();
            document.execCommand("copy");
            document.body.removeChild(input);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
        }
    };

    const openSharePopup = () => {
        setCopied(false);
        setIsShareOpen(true);
    };

    const closeSharePopup = () => {
        setIsShareOpen(false);
        setCopied(false);
    };

    const handleSms = () => {
        if (!resolvedShareUrl) return;
        const body = encodeURIComponent(resolvedShareText);
        window.location.href = `sms:?&body=${body}`;
    };

    const handleShareToWhatsApp = () => {
        if (!resolvedShareUrl) return;
        const whatsappAppUrl = `whatsapp://send?text=${encodeURIComponent(resolvedShareText)}`;
        const whatsappWebFallbackUrl = `https://wa.me/?text=${encodeURIComponent(resolvedShareText)}`;
        const opened = window.open(whatsappAppUrl, "_self");
        if (!opened) {
            window.location.href = whatsappWebFallbackUrl;
        }
    };

    const handleShareToThreads = () => {
        if (!resolvedShareUrl) return;
        window.open(`https://www.threads.net/intent/post?text=${encodeURIComponent(resolvedShareText)}`, "_blank", "noopener,noreferrer");
    };

   const handleShareToInstagram = async () => {
    if (!resolvedShareUrl) return;
    await copyLink();
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
};

    const handleShareToLinkedIn = () => {
        if (!resolvedShareUrl) return;
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(resolvedShareUrl)}`, "_blank", "noopener,noreferrer");
    };

    const handleShareToX = () => {
        if (!resolvedShareUrl) return;
        window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(resolvedShareText)}`, "_blank", "noopener,noreferrer");
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/88 backdrop-blur-[4px] p-3 sm:p-4">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(232,93,4,0.06),transparent_24%),radial-gradient(circle_at_50%_18%,rgba(201,17,95,0.05),transparent_34%)] opacity-60" />

            <div className="relative w-full max-w-[370px] overflow-visible text-white">
                <div className="relative overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(30,18,20,0.97)_0%,rgba(22,20,24,0.985)_34%,rgba(16,16,20,0.992)_68%,rgba(11,11,14,1)_100%)] shadow-[0_32px_110px_rgba(0,0,0,0.74)] before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_92%_-8%,rgba(232,93,4,0.18),transparent_34%),radial-gradient(circle_at_8%_-8%,rgba(201,17,95,0.12),transparent_36%),linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.06)_100%)] before:content-['']">
                <div className="absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(201,17,95,0.18)_0%,rgba(232,93,4,0.12)_42%,rgba(12,12,15,0)_100%)]" />
                <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_20%_22%,rgba(255,255,255,0.05),transparent_40%),linear-gradient(90deg,rgba(255,255,255,0.015),transparent_44%)]" />

                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close invite popup"
                    className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/28 text-white/80 transition hover:bg-black/48 hover:text-white"
                >
                    <X className="h-4 w-4" />
                </button>

                <div className="relative p-5 sm:p-6 pt-10 sm:pt-8">
                    <div className="mb-5 inline-flex rounded-lg bg-[#8a1744]/62 px-3 py-1 text-sm font-semibold text-[#ff77ad] shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
                        {title}
                    </div>

                    <h3 className="max-w-[320px] text-[1.45rem] font-semibold leading-[1.12] tracking-[-0.03em] text-white sm:text-[1.7rem]">
                        {headline}
                    </h3>

                    <p className="mt-3 max-w-[310px] text-sm leading-6 text-white/42">
                        {description}
                    </p>

                    <div className="my-5 h-px w-full bg-white/10" />

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={handleSms}
                            className="flex h-12 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.04] text-sm font-medium text-white transition hover:bg-white/10 active:scale-[0.99]"
                        >
                            <MessageCircleMore className="h-4 w-4" />
                            SMS
                        </button>
                        <button
                            type="button"
                            onClick={openSharePopup}
                            className="flex h-12 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.04] text-sm font-medium text-white transition hover:bg-white/10 active:scale-[0.99]"
                        >
                            <Share2 className="h-4 w-4" />
                            Share
                        </button>
                    </div>

                    <p className="mt-5 text-center text-sm text-white/74">Or copy your link</p>

                    <div className="mt-3 flex h-12 items-center overflow-hidden rounded-full border border-white/12 bg-[#141419] pl-4 pr-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                        <div className="flex min-w-0 flex-1 items-center gap-2 text-sm text-white/70">
                            <Link2 className="h-4 w-4 shrink-0 text-white/45" />
                            <span className="truncate">{resolvedShareUrl || "https://sportsfan360.com"}</span>
                        </div>

                        <button
                            type="button"
                            onClick={copyLink}
                            className="ml-3 inline-flex h-9 items-center justify-center rounded-full bg-gradient-to-r from-[#ff2d7a] to-[#f06b00] px-4 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(239,106,0,0.25)] transition hover:brightness-110"
                        >
                            {copied ? "Copied" : "Copy Link"}
                        </button>
                    </div>
                </div>
                </div>

            {isShareOpen && (
                <>
                    <button
                        type="button"
                        aria-label="Close invite share popup"
                        className="fixed inset-0 z-[60] bg-black/70"
                        onClick={closeSharePopup}
                    />
                    <div
                        className="fixed bottom-16 inset-x-4 z-[60] mx-auto w-full max-w-[260px] rounded-2xl border border-white/10 bg-[#1a1a1e] p-3 shadow-2xl lg:hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-white text-sm font-semibold">Share Invite</p>
                            <button onClick={closeSharePopup} className="text-gray-400 hover:text-white transition" aria-label="Close share popup">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                                    <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex flex-row flex-nowrap items-center gap-1.5 mb-2 overflow-x-auto -ml-1">
                            {[
                                { handler: handleShareToWhatsApp, src: "/images/share_whatsapp.png", alt: "WhatsApp" },
                                { handler: handleShareToThreads, src: "/images/share_thread.png", alt: "Threads" },
                                { handler: handleShareToInstagram, src: "/images/share_insta.png", alt: "Instagram" },
                                { handler: handleShareToLinkedIn, src: "/images/Share_linkedin.png", alt: "LinkedIn" },
                                { handler: handleShareToX, src: "/images/Share_X.png", alt: "X" },
                                { handler: copyLink, src: "/images/share_copy_link.png", alt: "Copy link" },
                            ].map(({ handler, src, alt }) => (
                                <button
                                    key={alt}
                                    onClick={handler}
                                    className="w-8 h-8 shrink-0 rounded-full overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 p-0 flex items-center justify-center"
                                    aria-label={`Share on ${alt}`}
                                >
                                    <img src={src} alt={alt} className="w-full h-full object-cover rounded-full" />
                                </button>
                            ))}
                        </div>

                        <div className="rounded-xl border border-white/10 bg-[#111114] p-3 mb-2">
                            <p className="text-white text-sm font-semibold line-clamp-2">{headline}</p>
                            <p className="text-white/65 text-xs mt-1 line-clamp-2">{description}</p>
                            <p className="text-white/45 text-[11px] mt-2 line-clamp-2 break-all">{resolvedShareUrl}</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <button onClick={closeSharePopup} className="flex-1 h-9 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-white hover:bg-white/10 transition">
                                Close
                            </button>
                            <button onClick={copyLink} className="flex-1 h-9 rounded-full bg-gradient-to-r from-[#ff2d7a] to-[#f06b00] text-xs font-semibold text-white hover:brightness-110 transition">
                                {copied ? "Copied" : "Copy Link"}
                            </button>
                        </div>

                        {copied && <p className="text-xs text-emerald-400 mt-2">Copied to clipboard</p>}
                    </div>

                    <div className="hidden lg:block absolute left-[calc(100%+8px)] top-2 z-[60] w-[260px] rounded-2xl border border-white/10 bg-[#1a1a1e] p-3 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-white text-sm font-semibold">Share Invite</p>
                            <button onClick={closeSharePopup} className="text-gray-400 hover:text-white transition" aria-label="Close share panel">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                                    <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </button>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-[#111114] p-3 mb-2">
                            <p className="text-white text-sm font-semibold line-clamp-2">{headline}</p>
                            <p className="text-white/65 text-xs mt-1 line-clamp-2">{description}</p>
                            <p className="text-white/45 text-[11px] mt-2 line-clamp-2 break-all">{resolvedShareUrl}</p>
                        </div>

                        <div className="flex flex-row flex-nowrap items-center gap-1.5 mb-2 -ml-1">
                            {[
                                { handler: handleShareToWhatsApp, src: "/images/share_whatsapp.png", alt: "WhatsApp" },
                                { handler: handleShareToThreads, src: "/images/share_thread.png", alt: "Threads" },
                                { handler: handleShareToInstagram, src: "/images/share_insta.png", alt: "Instagram" },
                                { handler: handleShareToLinkedIn, src: "/images/Share_linkedin.png", alt: "LinkedIn" },
                                { handler: handleShareToX, src: "/images/Share_X.png", alt: "X" },
                                { handler: copyLink, src: "/images/share_copy_link.png", alt: "Copy link" },
                            ].map(({ handler, src, alt }) => (
                                <button
                                    key={alt}
                                    onClick={handler}
                                    className="w-9 h-9 shrink-0 rounded-full overflow-hidden bg-white/5 hover:bg-white/10 border border-white/10 p-0 flex items-center justify-center"
                                    aria-label={`Share on ${alt}`}
                                >
                                    <img src={src} alt={alt} className="w-full h-full object-cover rounded-full" />
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-2">
                            <button onClick={closeSharePopup} className="flex-1 h-9 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-white hover:bg-white/10 transition">
                                Close
                            </button>
                            <button onClick={copyLink} className="flex-1 h-9 rounded-full bg-gradient-to-r from-[#ff2d7a] to-[#f06b00] text-xs font-semibold text-white hover:brightness-110 transition">
                                {copied ? "Copied" : "Copy Link"}
                            </button>
                        </div>

                        {copied && <p className="text-xs text-emerald-400 mt-2">Copied to clipboard</p>}
                    </div>
                </>
            )}
            </div>
        </div>
    );
}