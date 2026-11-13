"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useUserProfile } from "@/context/UserProfileContext";

export interface ResolvedViewer {
  userId: string;
  userName: string;
  userAvatar: string;
  isGuest: boolean;
}

const VIEWER_STORAGE_KEY = "sf_viewer_id";

function getOrCreateGuestViewerId(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = window.localStorage.getItem(VIEWER_STORAGE_KEY);
    if (existing && existing.trim()) return existing.trim();
    const generated = `guest_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    window.localStorage.setItem(VIEWER_STORAGE_KEY, generated);
    return generated;
  } catch {
    return `guest_${Date.now().toString(36)}`;
  }
}

function readStoredAuthUser(): { userId: string; userName: string; userAvatar: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const directId =
      window.localStorage.getItem("roar_actual_user_id") ||
      window.localStorage.getItem("roar_user_id") ||
      window.localStorage.getItem("sf_user_id");
    const rawJson = window.localStorage.getItem("auth_user");
    const parsed = rawJson ? JSON.parse(rawJson) : null;
    const uid = String(
      directId || parsed?.actualUserId || parsed?.userId || parsed?.uid || parsed?.email || ""
    ).trim();
    if (!uid || uid === "fan_guest" || uid === "guest" || uid === "guest_fan") return null;
    return {
      userId: uid,
      userName: String(parsed?.username || parsed?.name || uid.split("@")[0] || "Fan").trim(),
      userAvatar: String(parsed?.avatarUrl || parsed?.avatar || "").trim(),
    };
  } catch {
    return null;
  }
}

/**
 * Resolves the current viewer across UserProfileContext, AuthContext, and localStorage,
 * falling back to a persistent anonymous viewer ID (never dropping valid views as "fan_guest").
 */
export function resolveEngagementViewer(
  userProfile?: any,
  authUser?: any,
  authReady: boolean = true
): ResolvedViewer {
  const profileId = String(userProfile?.actualUserId || userProfile?.email || "").trim();
  const profileValid =
    profileId && profileId !== "fan_guest" && profileId !== "guest" && profileId !== "guest_fan";

  if (profileValid) {
    return {
      userId: profileId,
      userName: String(userProfile?.username || userProfile?.name || "Fan").trim(),
      userAvatar: String(userProfile?.avatarUrl || userProfile?.avatar || "").trim(),
      isGuest: false,
    };
  }

  const authId = String(
    authUser?.actualUserId || authUser?.userId || authUser?.email || ""
  ).trim();
  const authValid =
    authId && authId !== "fan_guest" && authId !== "guest" && authId !== "guest_fan";

  if (authValid) {
    return {
      userId: authId,
      userName: String(authUser?.username || authUser?.name || "Fan").trim(),
      userAvatar: String(authUser?.avatarUrl || authUser?.avatar || "").trim(),
      isGuest: false,
    };
  }

  const stored = readStoredAuthUser();
  if (stored) {
    return { ...stored, isGuest: false };
  }

  if (!authReady) {
    return { userId: "", userName: "Fan", userAvatar: "", isGuest: true };
  }

  return {
    userId: getOrCreateGuestViewerId(),
    userName: "Guest Fan",
    userAvatar: "",
    isGuest: true,
  };
}

/**
 * Computes how much of `el` is actually visible inside the browser viewport and every
 * clipping scroll/overflow ancestor. Returns `isFullyVisible` when the full engagement
 * appears on screen (or >=90% of the visible viewport height for extra-tall cards).
 */
function computeVisibleCoverage(el: HTMLElement): {
  isInView: boolean;
  isFullyVisible: boolean;
  visibleRatio: number;
} {
  const rect = el.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) {
    return { isInView: false, isFullyVisible: false, visibleRatio: 0 };
  }

  let clipTop = 0;
  let clipLeft = 0;
  let clipRight = window.innerWidth || document.documentElement.clientWidth;
  let clipBottom = window.innerHeight || document.documentElement.clientHeight;

  let parent = el.parentElement;
  while (parent && parent !== document.body && parent !== document.documentElement) {
    const style = window.getComputedStyle(parent);
    const ovY = style.overflowY;
    const ovX = style.overflowX;
    if (ovY === "auto" || ovY === "scroll" || ovY === "hidden" || ovY === "clip") {
      const pRect = parent.getBoundingClientRect();
      clipTop = Math.max(clipTop, pRect.top);
      clipBottom = Math.min(clipBottom, pRect.bottom);
    }
    if (ovX === "auto" || ovX === "scroll" || ovX === "hidden" || ovX === "clip") {
      const pRect = parent.getBoundingClientRect();
      clipLeft = Math.max(clipLeft, pRect.left);
      clipRight = Math.min(clipRight, pRect.right);
    }
    parent = parent.parentElement;
  }

  const visibleW = Math.max(0, Math.min(rect.right, clipRight) - Math.max(rect.left, clipLeft));
  const visibleH = Math.max(0, Math.min(rect.bottom, clipBottom) - Math.max(rect.top, clipTop));
  const viewportH = Math.max(0, clipBottom - clipTop);
  const viewportW = Math.max(0, clipRight - clipLeft);

  if (visibleW <= 0 || visibleH <= 0 || viewportH <= 0 || viewportW <= 0) {
    return { isInView: false, isFullyVisible: false, visibleRatio: 0 };
  }

  const heightRatio = visibleH / rect.height;
  const widthRatio = visibleW / rect.width;
  const visibleRatio = Math.min(heightRatio, widthRatio);

  const fitsContainer = rect.height <= viewportH + 4;
  const horizontallyFull = widthRatio >= 0.92 || visibleW >= Math.min(rect.width, viewportW) - 6;

  const isFullyVisible = fitsContainer
    ? horizontallyFull && (heightRatio >= 0.95 || rect.height - visibleH <= 6)
    : horizontallyFull && visibleH >= viewportH * 0.9;

  const isInView = visibleH > 4 && visibleW > 4;
  return { isInView, isFullyVisible, visibleRatio };
}

function findNearestScrollParent(el: HTMLElement): HTMLElement | null {
  let parent = el.parentElement;
  while (parent && parent !== document.body && parent !== document.documentElement) {
    const style = window.getComputedStyle(parent);
    if (style.overflowY === "auto" || style.overflowY === "scroll" || style.overflowY === "overlay") {
      return parent;
    }
    parent = parent.parentElement;
  }
  return null;
}

export interface UseEngagementImpressionOptions {
  engagementId?: string | null;
  matchId?: string | null;
  momentId?: string | null;
  seriesId?: string | null;
  userId?: string | null;
  userName?: string | null;
  userAvatar?: string | null;
  enabled?: boolean;
  onRecorded?: (impressions: number) => void;
}

/**
 * Tracks non-unique full-screen engagement impressions:
 * fires POST /api/engagements/[id]/impression whenever the engagement card appears
 * fully on screen, resets when scrolled out of view, and increments +1 again upon re-view.
 */
export function useEngagementImpression({
  engagementId,
  matchId,
  momentId,
  seriesId,
  userId: explicitUserId,
  userName: explicitUserName,
  userAvatar: explicitUserAvatar,
  enabled = true,
  onRecorded,
}: UseEngagementImpressionOptions) {
  const { userProfile } = useUserProfile();
  const { user: authUser, authReady } = useAuth();

  const [targetEl, setTargetEl] = useState<HTMLElement | null>(null);
  const inFullViewRef = useRef(false);
  const lastFiredAtRef = useRef(0);
  const inFlightRef = useRef(false);
  const onRecordedRef = useRef(onRecorded);
  onRecordedRef.current = onRecorded;

  const viewer = React.useMemo(() => {
    const cleanExplicit = String(explicitUserId || "").trim();
    if (
      cleanExplicit &&
      cleanExplicit !== "fan_guest" &&
      cleanExplicit !== "guest" &&
      cleanExplicit !== "guest_fan"
    ) {
      return {
        userId: cleanExplicit,
        userName: String(explicitUserName || "Fan").trim(),
        userAvatar: String(explicitUserAvatar || "").trim(),
        isGuest: false,
      };
    }
    return resolveEngagementViewer(userProfile, authUser, authReady);
  }, [explicitUserId, explicitUserName, explicitUserAvatar, userProfile, authUser, authReady]);

  const ref = useCallback((node: HTMLElement | null) => {
    setTargetEl(node);
  }, []);

  useEffect(() => {
    if (!enabled || !engagementId || !targetEl || !viewer.userId) return;

    const cleanEngId = String(engagementId).replace(/^ENGAGEMENT#/i, "").replace(/^LOOP#/i, "").trim();
    if (!cleanEngId) return;

    let rafId: number | null = null;
    inFullViewRef.current = false;

    const recordImpression = () => {
      const now = Date.now();
      if (inFlightRef.current || now - lastFiredAtRef.current < 1200) return;
      inFlightRef.current = true;
      lastFiredAtRef.current = now;

      fetch(`/api/engagements/${encodeURIComponent(cleanEngId)}/impression`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: viewer.userId,
          userName: viewer.userName,
          userAvatar: viewer.userAvatar,
          matchId: matchId || undefined,
          momentId: momentId || undefined,
          seriesId: seriesId || undefined,
        }),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.success && typeof data.impressions === "number") {
            onRecordedRef.current?.(data.impressions);
          }
        })
        .catch(() => {})
        .finally(() => {
          inFlightRef.current = false;
        });
    };

    const evaluate = () => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        inFullViewRef.current = false;
        return;
      }
      const { isInView, isFullyVisible, visibleRatio } = computeVisibleCoverage(targetEl);
      if (isFullyVisible) {
        if (!inFullViewRef.current) {
          inFullViewRef.current = true;
          recordImpression();
        }
      } else if (!isInView || visibleRatio <= 0.12) {
        // Reset once scrolled off screen so returning counts +1 again (non-unique view)
        inFullViewRef.current = false;
      }
    };

    const scheduleEvaluate = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        evaluate();
      });
    };

    const scrollParent = findNearestScrollParent(targetEl);
    const observers: IntersectionObserver[] = [];

    if (typeof IntersectionObserver !== "undefined") {
      const thresholds = [0, 0.05, 0.12, 0.25, 0.5, 0.75, 0.9, 0.95, 0.98, 1];
      const winObserver = new IntersectionObserver(scheduleEvaluate, { threshold: thresholds });
      winObserver.observe(targetEl);
      observers.push(winObserver);

      if (scrollParent) {
        const scrollerObserver = new IntersectionObserver(scheduleEvaluate, {
          root: scrollParent,
          threshold: thresholds,
        });
        scrollerObserver.observe(targetEl);
        observers.push(scrollerObserver);
      }
    }

    if (scrollParent) {
      scrollParent.addEventListener("scroll", scheduleEvaluate, { passive: true });
    }
    window.addEventListener("scroll", scheduleEvaluate, { passive: true });
    window.addEventListener("resize", scheduleEvaluate, { passive: true });
    document.addEventListener("visibilitychange", scheduleEvaluate);

    scheduleEvaluate();

    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      observers.forEach((o) => o.disconnect());
      if (scrollParent) {
        scrollParent.removeEventListener("scroll", scheduleEvaluate);
      }
      window.removeEventListener("scroll", scheduleEvaluate);
      window.removeEventListener("resize", scheduleEvaluate);
      document.removeEventListener("visibilitychange", scheduleEvaluate);
    };
  }, [enabled, engagementId, targetEl, viewer.userId, viewer.userName, viewer.userAvatar, matchId, momentId, seriesId]);

  return { ref, viewer };
}

interface EngagementImpressionWrapperProps extends UseEngagementImpressionOptions {
  children: React.ReactNode;
  className?: string;
}

/** Lightweight wrapper for FlipArena / Watchroom engagement cards to record full-screen impressions. */
export function EngagementImpressionWrapper({
  children,
  className,
  ...options
}: EngagementImpressionWrapperProps) {
  const { ref } = useEngagementImpression(options);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

