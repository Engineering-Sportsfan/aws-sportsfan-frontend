"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface NotificationEventDetail {
  title?: string;
  body?: string;
  ctaTarget?: string;
  id?: string;
  pk?: string;
  sk?: string;
}

interface ToastState {
  id: string | number;
  title: string;
  body?: string;
  ctaTarget?: string;
  rawNotif?: any;
}

export default function NotificationToast() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasCheckedAppOpenRef = useRef(false);

  // 1. Show toast on app open / initial entry for the last unread notification
  useEffect(() => {
    if (authLoading || hasCheckedAppOpenRef.current) return;

    let email = user?.email || "";
    let uid = user?.userId || user?.actualUserId || user?.uid || "";
    let actualId = user?.actualUserId || user?.userId || "";

    if (!email && !uid && typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("auth_user");
        if (stored) {
          const parsed = JSON.parse(stored);
          email = parsed.email || "";
          uid = parsed.userId || parsed.actualUserId || parsed.uid || "";
          actualId = parsed.actualUserId || parsed.userId || "";
        }
      } catch { }
    }

    if (!email && !uid && !actualId) return;
    hasCheckedAppOpenRef.current = true;

    const checkLastUnread = async () => {
      try {
        const q = new URLSearchParams();
        if (email) q.append("email", email);
        if (uid) q.append("uid", uid);
        if (actualId && actualId !== uid) q.append("actualUserId", actualId);

        const res = await fetch(`/api/notifications?${q.toString()}`, {
          cache: "no-store",
          headers: { Pragma: "no-cache" },
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.notifications)) {
          const lastAllReadAt =
            typeof window !== "undefined"
              ? Number(localStorage.getItem("notifications_all_read_at") || 0)
              : 0;

          const unreadNotifs = data.notifications.filter((n: any) => {
            const isRead = n.isRead !== undefined ? Boolean(n.isRead) : Boolean(n.read);
            if (isRead) return false;
            const notifTime = new Date(n.sent_at || n.createdAt || 0).getTime();
            if (lastAllReadAt > 0 && notifTime > 0 && notifTime <= lastAllReadAt) {
              return false;
            }
            return true;
          });

          if (unreadNotifs.length > 0) {
            const latest = unreadNotifs[0];
            const notifId = String(latest.id || latest.notification_id || latest.SK || "latest");

            // Avoid showing the exact same unread toast multiple times in the same session
            const lastToastedId =
              typeof window !== "undefined"
                ? sessionStorage.getItem("last_toasted_unread_id")
                : null;

            if (lastToastedId !== notifId) {
              if (typeof window !== "undefined") {
                sessionStorage.setItem("last_toasted_unread_id", notifId);
              }

              setToast({
                id: notifId,
                title: latest.title || "FlipARENA",
                body: latest.body || latest.message || "You have a new unread notification",
                ctaTarget: latest.cta_target || latest.ctaTarget || "/MainModules/Notifications",
                rawNotif: latest,
              });

              if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
              toastTimeoutRef.current = setTimeout(() => setToast(null), 7000);
            }
          }
        }
      } catch (err) {
        console.warn("[NotificationToast] App open check notice:", err);
      }
    };

    checkLastUnread();
  }, [user, authLoading]);

  // 2. Real-time event listener for newly dispatched notifications
  useEffect(() => {
    const onNewNotification = (e: Event) => {
      const detail = (e as CustomEvent<NotificationEventDetail>).detail ?? {};
      const newId = detail.id || `toast_${Date.now()}`;

      setToast({
        id: newId,
        title: detail.title || "New notification",
        body: detail.body,
        ctaTarget: detail.ctaTarget || "/MainModules/Notifications",
      });

      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => setToast(null), 7000);
    };

    window.addEventListener("sf360:new-notification", onNewNotification);
    return () => {
      window.removeEventListener("sf360:new-notification", onNewNotification);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  if (!toast) return null;

  const handleToastClick = async () => {
    const target = toast.ctaTarget || "/MainModules/Notifications";
    if (toast.rawNotif) {
      try {
        fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          keepalive: true,
          body: JSON.stringify({
            action: "markRead",
            id: toast.rawNotif.id || toast.rawNotif.notification_id,
            email: user?.email,
            userId: user?.userId || user?.actualUserId,
            pk: toast.rawNotif.PK || toast.rawNotif.pk,
            sk: toast.rawNotif.SK || toast.rawNotif.sk,
            ctaClicked: true,
          }),
        }).catch(() => { });
      } catch { }
    }
    setToast(null);
    router.push(target);
  };

  return (
    <div
      key={toast.id}
      onClick={handleToastClick}
      className="fixed top-4 right-4 z-[10050] flex items-center gap-3 bg-[#111418] border border-pink-500/40  px-4 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.7)] cursor-pointer animate-in slide-in-from-top-2 fade-in duration-300 max-w-[340px] backdrop-blur-xl"
      role="button"
    >
      <div className="w-9 h-9 bg-[#FF2D8A]/15 border border-[#FF2D8A]/30 flex items-center justify-center shrink-0">
        <Bell size={16} className="text-[#FF2D8A]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-xs font-black leading-tight tracking-tight">{toast.title}</p>
        {toast.body && (
          <p className="text-zinc-300 text-[11px] font-medium line-clamp-2 mt-0.5 leading-snug">
            {toast.body}
          </p>
        )}
        <p className="text-pink-400 text-[10px] font-bold mt-1 tracking-wide uppercase">Tap to view →</p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setToast(null);
        }}
        className="shrink-0 text-zinc-500 hover:text-white transition-colors p-1 cursor-pointer"
      >
        <X size={14} />
      </button>
    </div>
  );
}