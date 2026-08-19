"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, X } from "lucide-react";

// ─── Global notification toast (event-driven, no polling) ─────────────────
// The code that actually creates a notification (e.g. HomePage's Dolly
// onAsk handler) already knows the moment it succeeds — no need to poll a
// separate endpoint to "discover" something we just caused ourselves.
// That code dispatches window.dispatchEvent(new CustomEvent(
// "sf360:new-notification", { detail: { title, ctaTarget? } })) right after
// a successful, notify-requested response. This component just listens and
// renders the toast.
//
// For notifications caused by OTHER users' actions (replies, mentions,
// reactions — once those ROAR types are wired up), the equivalent trigger
// point is wherever that response/event reaches the client, e.g. inside
// whatever real-time listener or websocket handler picks it up. There is
// intentionally no polling fallback here yet, since none of those types are
// live — add one only if/when a genuinely "someone else did this" case needs
// a way to learn about it without a live connection.

interface NotificationEventDetail {
  title?: string;
  ctaTarget?: string;
}

interface ToastState {
  id: number;
  title: string;
}

export default function NotificationToast() {
  const router = useRouter();
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const toastIdRef = useRef(0);

  useEffect(() => {
    const onNewNotification = (e: Event) => {
      const detail = (e as CustomEvent<NotificationEventDetail>).detail ?? {};
      toastIdRef.current += 1;
      setToast({ id: toastIdRef.current, title: detail.title || "New notification" });

      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => setToast(null), 6000);
    };

    window.addEventListener("sf360:new-notification", onNewNotification);
    return () => {
      window.removeEventListener("sf360:new-notification", onNewNotification);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  if (!toast) return null;

  return (
    <div
      key={toast.id}
      onClick={() => {
        router.push("/MainModules/Notifications");
        setToast(null);
      }}
      className="fixed top-4 right-4 z-[10050] flex items-center gap-3 bg-[#111] border border-pink-500/30 rounded-2xl px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)] cursor-pointer animate-in slide-in-from-top-2 fade-in duration-300 max-w-[320px]"
      role="button"
    >
      <div className="w-9 h-9 rounded-full bg-[#e91e8c]/15 border border-[#e91e8c]/30 flex items-center justify-center shrink-0">
        <Bell size={16} className="text-[#e91e8c]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold leading-tight">{toast.title}</p>
        <p className="text-gray-400 text-xs mt-0.5">Tap to view</p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setToast(null);
        }}
        className="shrink-0 text-gray-500 hover:text-white transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}