"use client";

/**
 * utils/backButton.ts
 *
 * Comprehensive intelligent back navigation and robust scroll position preservation & restoration
 * across all Next.js pages, custom scroll containers (.roar-content-area, main, overflow containers),
 * specific section anchors, and individual content cards.
 *
 * Behavior:
 *  - Forward Navigation (e.g. User clicks View All or any card/link):
 *      -> ALWAYS opens at the TOP (scrollTop = 0) of the destination page.
 *  - Back Navigation (e.g. User clicks Back on FlipLong / VideoDrop):
 *      -> Restores the exact scroll position and section/card anchor on the previous page.
 *  - Desktop & Mobile optimized:
 *      -> Authoritative page scroll y is tied purely to the primary layout container (.roar-content-area / window).
 *      -> Ignores trackpad momentum wheel events (800ms grace period, deltaY > 25 threshold).
 *      -> Ignores residual mobile touch starts (350ms grace period, Math.abs(deltaY) > 18 threshold).
 *      -> Uses ResizeObserver, MutationObserver & polling loop with hard timeout (~3.5s).
 */

import React, { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const SCROLL_PREFIX = "sf360_scroll_state_";
const BACK_NAV_KEY = "sf360_back_nav_flag";
const LAST_GLOBAL_KEY = "sf360_last_global_scroll";

export interface ContainerScrollEntry {
  selector: string;
  scrollTop: number;
}

export interface ElementAnchor {
  id?: string;
  section?: string;
  selector?: string;
  dropId?: string;
  offsetTop?: number; // absolute content offset inside scroll container
  viewportOffset?: number; // offset relative to top of scroll container at click time
}

export interface PageScrollState {
  y: number; // Authoritative page scroll position (.roar-content-area / window)
  windowY: number;
  containers: ContainerScrollEntry[];
  anchor?: ElementAnchor;
  timestamp: number;
}

// In-memory route scroll snapshot map for ultra-fast zero-latency retrieval
const memoryScrollMap = new Map<string, PageScrollState>();

// Back navigation tracking state
let isBackNavigation = false;

// Active restoration controller states
let isRestoring = false;
let restorationTargetKey = "";
let restorationStartTime = 0;
let activeRestorationTimer: NodeJS.Timeout | null = null;
let activeObserver: MutationObserver | null = null;
let activeResizeObserver: ResizeObserver | null = null;
let userInteracted = false;

/**
 * Marks that a back navigation was initiated
 */
export function markBackNavigation(): void {
  isBackNavigation = true;
  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem(BACK_NAV_KEY, String(Date.now()));
    } catch {
      // ignore
    }
  }
}

/**
 * Checks if a back navigation is currently active
 */
export function isBackNavActive(): boolean {
  if (isBackNavigation) return true;
  if (typeof window !== "undefined") {
    try {
      const flag = sessionStorage.getItem(BACK_NAV_KEY);
      if (flag) {
        const ts = parseInt(flag, 10);
        // Valid if marked within the last 10 seconds
        if (!isNaN(ts) && Date.now() - ts < 10000) {
          return true;
        }
      }
    } catch {
      // ignore
    }
  }
  return false;
}

/**
 * Clears the back navigation flag
 */
export function clearBackNavFlag(): void {
  isBackNavigation = false;
  if (typeof window !== "undefined") {
    try {
      sessionStorage.removeItem(BACK_NAV_KEY);
    } catch {
      // ignore
    }
  }
}

/**
 * Normalizes URL / path to storage key
 */
export function normalizeScrollKey(path?: string): string {
  if (typeof window === "undefined") return "";
  let target = path || `${window.location.pathname}${window.location.search}`;
  target = target.trim();
  if (!target.startsWith("/")) target = `/${target}`;
  return `${SCROLL_PREFIX}${target}`;
}

/**
 * Helper to extract selector for an element
 */
function getElementSelector(el: HTMLElement): string {
  if (el.id) return `#${el.id}`;
  const dropId = el.getAttribute("data-drop-id");
  if (dropId) return `[data-drop-id="${dropId}"]`;
  const dataSection = el.getAttribute("data-section");
  if (dataSection) return `[data-section="${dataSection}"]`;
  const dataNav = el.getAttribute("data-nav");
  if (dataNav) return `[data-nav="${dataNav}"]`;

  if (el.classList && el.classList.length > 0) {
    const validClasses = Array.from(el.classList).filter(
      (c) =>
        !c.includes(":") &&
        !c.includes("/") &&
        !c.includes("[") &&
        !c.includes("]") &&
        !c.startsWith("hover") &&
        !c.startsWith("focus") &&
        !c.startsWith("active")
    );
    if (validClasses.length > 0) {
      return `.${validClasses.slice(0, 3).join(".")}`;
    }
  }
  return el.tagName.toLowerCase();
}

/**
 * Extracts element anchor details when a user clicks a button, card, or section
 */
function extractAnchor(el: HTMLElement | null): ElementAnchor | undefined {
  if (!el || typeof window === "undefined") return undefined;

  try {
    // 1. Check for specific card or item
    const cardEl = el.closest<HTMLElement>(
      "[data-drop-id], [data-nav], [id^='playbook-drop-'], [id^='video-drop-'], [id^='roar-room-'], [id^='card-']"
    );
    const targetEl = cardEl || el.closest<HTMLElement>("button, a, [role='button'], section, article, div[id]") || el;

    // 2. Check for parent section
    const sectionEl = targetEl.closest<HTMLElement>("[data-section], section, [id$='-section'], #playbook-drops, #roar-rooms-section");

    const scrollContainer =
      document.querySelector<HTMLElement>(".roar-content-area") ||
      document.documentElement;

    const targetRect = targetEl.getBoundingClientRect();
    const containerRect = scrollContainer ? scrollContainer.getBoundingClientRect() : { top: 0, left: 0 };
    
    const viewportOffset = targetRect.top - containerRect.top;
    const offsetTop = viewportOffset + (scrollContainer.scrollTop || 0);

    const anchor: ElementAnchor = {
      id: targetEl.id || undefined,
      section: sectionEl?.getAttribute("data-section") || sectionEl?.id || undefined,
      selector: getElementSelector(targetEl),
      dropId: targetEl.getAttribute("data-drop-id") || undefined,
      offsetTop: Math.round(offsetTop),
      viewportOffset: Math.round(viewportOffset),
    };

    return anchor;
  } catch {
    return undefined;
  }
}

/**
 * Scans document to find authoritative page scroll position and scrollable containers
 */
export function findScrollPositions(clickedEl?: HTMLElement | null): PageScrollState {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return { y: 0, windowY: 0, containers: [], timestamp: Date.now() };
  }

  const windowY =
    window.scrollY ||
    window.pageYOffset ||
    document.documentElement?.scrollTop ||
    document.body?.scrollTop ||
    0;

  // Authoritative page scroll position: .roar-content-area is primary layout container
  const roarArea = document.querySelector(".roar-content-area") as HTMLElement | null;
  const pageY = roarArea && roarArea.scrollTop > 0 ? roarArea.scrollTop : windowY;

  const containers: ContainerScrollEntry[] = [];
  if (roarArea && roarArea.scrollTop > 0) {
    containers.push({ selector: ".roar-content-area", scrollTop: roarArea.scrollTop });
  }

  const anchor = clickedEl ? extractAnchor(clickedEl) : undefined;

  return {
    y: pageY,
    windowY,
    containers,
    anchor,
    timestamp: Date.now(),
  };
}

/**
 * Save current scroll position to sessionStorage & memory map
 */
export function saveScrollPosition(customPath?: string, clickedEl?: HTMLElement | null): void {
  if (typeof window === "undefined") return;

  const currentFullKey = normalizeScrollKey(customPath);
  const currentPlainKey = normalizeScrollKey(customPath ? customPath.split("?")[0] : window.location.pathname);

  // During active restoration lock, do NOT allow intermediate/clamped scroll values to overwrite the target
  if (isRestoring && Date.now() - restorationStartTime < 3500) {
    if (currentFullKey === restorationTargetKey || currentPlainKey === restorationTargetKey) {
      return;
    }
  }

  try {
    const state = findScrollPositions(clickedEl);

    // Guard: Avoid overwriting a valid non-zero scroll position with 0 during page transition/unmount
    if (state.y <= 0 && state.windowY <= 0 && !state.anchor) {
      const existing = memoryScrollMap.get(currentFullKey) || memoryScrollMap.get(currentPlainKey);
      if (existing && (existing.y > 0 || existing.anchor) && Date.now() - existing.timestamp < 300000) {
        return;
      }
      const rawStored = sessionStorage.getItem(currentFullKey) || sessionStorage.getItem(currentPlainKey);
      if (rawStored) {
        try {
          const parsed = JSON.parse(rawStored);
          if (parsed && (parsed.y > 0 || parsed.anchor) && Date.now() - parsed.timestamp < 300000) {
            return;
          }
        } catch {
          // ignore
        }
      }
    }

    const payload = JSON.stringify(state);
    sessionStorage.setItem(currentFullKey, payload);
    sessionStorage.setItem(currentPlainKey, payload);
    sessionStorage.setItem(LAST_GLOBAL_KEY, payload);

    memoryScrollMap.set(currentFullKey, state);
    memoryScrollMap.set(currentPlainKey, state);
  } catch {
    // Ignore storage quota or security errors
  }
}

/**
 * Resets all scroll containers and window to the top (scrollTop = 0)
 * Used on fresh forward navigations (e.g. clicking View All or any link)
 */
export function resetScrollToTop(): void {
  if (typeof window === "undefined") return;
  cancelScrollRestoration();

  const resetAll = () => {
    // 1. Primary layout container (.roar-content-area)
    const roarArea = document.querySelector(".roar-content-area") as HTMLElement;
    if (roarArea) {
      roarArea.scrollTop = 0;
    }
    // 2. Window and document
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  };

  resetAll();
  requestAnimationFrame(resetAll);
  setTimeout(resetAll, 20);
  setTimeout(resetAll, 60);
  setTimeout(resetAll, 150);
}

/**
 * Cancels any ongoing scroll restoration loops & releases restoration lock
 */
export function cancelScrollRestoration(): void {
  if (activeRestorationTimer) {
    clearInterval(activeRestorationTimer);
    activeRestorationTimer = null;
  }
  if (activeObserver) {
    activeObserver.disconnect();
    activeObserver = null;
  }
  if (activeResizeObserver) {
    activeResizeObserver.disconnect();
    activeResizeObserver = null;
  }
  isRestoring = false;
  restorationTargetKey = "";
}

/**
 * Restore scroll position and specific section/card anchor for the current route
 */
export function restoreScrollPosition(customPath?: string): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  cancelScrollRestoration();
  userInteracted = false;

  const currentFullKey = normalizeScrollKey(customPath);
  const currentPlainKey = normalizeScrollKey(customPath ? customPath.split("?")[0] : window.location.pathname);

  // Retrieve saved snapshot from Memory Map first (zero latency) or SessionStorage
  let targetState: PageScrollState | null =
    memoryScrollMap.get(currentFullKey) ||
    memoryScrollMap.get(currentPlainKey) ||
    null;

  if (!targetState) {
    let raw = sessionStorage.getItem(currentFullKey) || sessionStorage.getItem(currentPlainKey);
    if (!raw) {
      raw = sessionStorage.getItem(`sf360_scroll_pos_${currentFullKey}`) || sessionStorage.getItem(LAST_GLOBAL_KEY);
    }
    if (raw) {
      try {
        if (raw.startsWith("{")) {
          targetState = JSON.parse(raw);
        } else {
          const num = parseInt(raw, 10);
          if (!isNaN(num) && num > 0) {
            targetState = { y: num, windowY: num, containers: [], timestamp: Date.now() };
          }
        }
      } catch {
        targetState = null;
      }
    }
  }

  if (!targetState || (targetState.y <= 0 && !targetState.anchor)) {
    resetScrollToTop();
    return;
  }

  const targetY = targetState.y || 0;
  const targetAnchor = targetState.anchor;

  // Activate restoration lock
  isRestoring = true;
  restorationTargetKey = currentFullKey;
  restorationStartTime = Date.now();

  /**
   * Applies scroll to target position and checks if position is achievable
   */
  const applyScroll = (): boolean => {
    if (userInteracted) return true;

    let isAchieved = false;

    // 1. Primary layout container (.roar-content-area)
    const roarArea = document.querySelector(".roar-content-area") as HTMLElement;
    if (roarArea) {
      const maxScrollable = Math.max(0, roarArea.scrollHeight - roarArea.clientHeight);

      let anchorApplied = false;

      // A. Try anchor alignment if available
      if (targetAnchor) {
        let anchorEl: HTMLElement | null = null;
        if (targetAnchor.dropId) {
          anchorEl = document.querySelector(`[data-drop-id="${targetAnchor.dropId}"]`);
        }
        if (!anchorEl && targetAnchor.id) {
          anchorEl = document.getElementById(targetAnchor.id);
        }
        if (!anchorEl && targetAnchor.section) {
          anchorEl = document.querySelector(`[data-section="${targetAnchor.section}"], #${targetAnchor.section}`);
        }
        if (!anchorEl && targetAnchor.selector) {
          try {
            anchorEl = document.querySelector(targetAnchor.selector);
          } catch {
            // ignore
          }
        }

        if (anchorEl) {
          const containerRect = roarArea.getBoundingClientRect();
          const elRect = anchorEl.getBoundingClientRect();
          const currentAbsoluteTop = (elRect.top - containerRect.top) + roarArea.scrollTop;
          const targetViewportOffset = targetAnchor.viewportOffset !== undefined ? targetAnchor.viewportOffset : 100;
          const desiredScrollTop = Math.max(0, currentAbsoluteTop - targetViewportOffset);

          if (desiredScrollTop <= maxScrollable + 20) {
            roarArea.scrollTop = desiredScrollTop;
            if (Math.abs(roarArea.scrollTop - desiredScrollTop) < 15) {
              isAchieved = true;
              anchorApplied = true;
            }
          }
        }
      }

      // B. Numeric targetY restoration (if anchor not yet found or not applied)
      if (!anchorApplied && targetY > 0) {
        roarArea.scrollTop = targetY;
        if (Math.abs(roarArea.scrollTop - targetY) < 15) {
          isAchieved = true;
        }
      }
    }

    // 2. Window / Document Level
    if (targetY > 0) {
      window.scrollTo({ top: targetY, behavior: "instant" as ScrollBehavior });
      if (document.documentElement) document.documentElement.scrollTop = targetY;
      if (document.body) document.body.scrollTop = targetY;
    }

    return isAchieved;
  };

  // 1. Immediate requestAnimationFrame execution
  applyScroll();
  requestAnimationFrame(applyScroll);
  requestAnimationFrame(() => requestAnimationFrame(applyScroll));

  // 2. Mobile & Desktop gesture detection to allow intentional user override
  let touchStartY = 0;
  let touchStartX = 0;

  const onTouchStart = (e: TouchEvent) => {
    if (e.touches && e.touches.length > 0) {
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
    }
  };

  const onTouchMove = (e: TouchEvent) => {
    // Ignore residual touchmove events during the first 350ms after navigation
    if (Date.now() - restorationStartTime < 350) return;

    if (e.touches && e.touches.length > 0) {
      const deltaY = e.touches[0].clientY - touchStartY;
      const deltaX = e.touches[0].clientX - touchStartX;

      // Intentional user scroll gesture on mobile using Math.abs(deltaY) > 18
      if (Math.abs(deltaY) > 18 || Math.abs(deltaX) > 24) {
        userInteracted = true;
        cancelScrollRestoration();
        cleanupListeners();
      }
    }
  };

  const onWheel = (e: WheelEvent) => {
    // On desktop, ignore momentum wheel events during the first 800ms after navigation
    if (Date.now() - restorationStartTime < 800) return;

    // Only intentional large wheel actions cancel restoration
    if (Math.abs(e.deltaY) > 25) {
      userInteracted = true;
      cancelScrollRestoration();
      cleanupListeners();
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (Date.now() - restorationStartTime < 300) return;
    const scrollKeys = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Space", "Home", "End"];
    if (scrollKeys.includes(e.key)) {
      userInteracted = true;
      cancelScrollRestoration();
      cleanupListeners();
    }
  };

  const cleanupListeners = () => {
    window.removeEventListener("touchstart", onTouchStart);
    window.removeEventListener("touchmove", onTouchMove);
    window.removeEventListener("wheel", onWheel);
    window.removeEventListener("keydown", onKeyDown);
  };

  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchmove", onTouchMove, { passive: true });
  window.addEventListener("wheel", onWheel, { passive: true });
  window.addEventListener("keydown", onKeyDown, { passive: true });

  // 3. Polling interval to apply scroll as async components (FlipLONG, scores, rooms) hydrate
  let ticks = 0;
  const maxTicks = 100; // 100 * 35ms = 3500ms (Hard safety timeout)
  let stableTicks = 0;

  activeRestorationTimer = setInterval(() => {
    ticks++;
    const isApplied = applyScroll();

    if (isApplied) {
      stableTicks++;
      // Stop when target position is achievable and verified stable for 8 ticks after min 400ms
      if (stableTicks >= 8 && Date.now() - restorationStartTime > 400) {
        cancelScrollRestoration();
        cleanupListeners();
        return;
      }
    } else {
      stableTicks = 0;
    }

    if (ticks >= maxTicks || userInteracted) {
      cancelScrollRestoration();
      cleanupListeners();
    }
  }, 35);

  // 4. MutationObserver to immediately re-apply scroll when new DOM cards render
  if (typeof MutationObserver !== "undefined" && document.body) {
    activeObserver = new MutationObserver(() => {
      if (!userInteracted) {
        applyScroll();
      }
    });
    activeObserver.observe(document.body, { childList: true, subtree: true });
  }

  // 5. ResizeObserver to re-apply scroll when container content height expands
  if (typeof ResizeObserver !== "undefined") {
    const roarArea = document.querySelector(".roar-content-area") as HTMLElement;
    const targetElementToObserve = roarArea || document.body;
    if (targetElementToObserve) {
      activeResizeObserver = new ResizeObserver(() => {
        if (!userInteracted) {
          applyScroll();
        }
      });
      activeResizeObserver.observe(targetElementToObserve);
    }
  }
}

let isGlobalInitialized = false;

/**
 * Initialize global event listeners for continuous scroll tracking & popstate restoration
 */
export function initScrollRestoration(): void {
  if (typeof window === "undefined" || isGlobalInitialized) return;
  isGlobalInitialized = true;

  // 1. Debounced scroll listener capturing all user scroll events
  let scrollTimeout: NodeJS.Timeout | null = null;
  const handleScroll = () => {
    if (isRestoring) return; // Do not save intermediate scroll during restoration
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      if (!isRestoring) {
        saveScrollPosition();
      }
    }, 80);
  };

  window.addEventListener("scroll", handleScroll, { capture: true, passive: true });

  // 2. Capture pointerdown / click on ANY element (button, card, link, section) to snapshot before routing
  const handleInteraction = (e: Event) => {
    const target = e.target as HTMLElement | null;
    if (target) {
      // If clicking back button, mark back navigation
      const isBackBtn = target.closest("button[title*='Back' i], button[aria-label*='Back' i], [data-nav='back']");
      if (isBackBtn) {
        markBackNavigation();
      } else {
        // Forward click: Save current page scroll position and anchor
        saveScrollPosition(undefined, target);
      }
    }
  };

  document.addEventListener("pointerdown", handleInteraction, { capture: true, passive: true });
  document.addEventListener("click", handleInteraction, { capture: true, passive: true });

  // 3. Monkey patch history.pushState and history.replaceState
  const origPushState = window.history.pushState;
  window.history.pushState = function (...args) {
    if (!isBackNavActive()) {
      saveScrollPosition();
    }
    const res = origPushState.apply(this, args);
    return res;
  };

  // 4. Popstate handler (browser back button & router.back())
  window.addEventListener("popstate", () => {
    markBackNavigation();
    setTimeout(() => {
      restoreScrollPosition();
    }, 15);
  });

  // 5. Page lifecycle listeners
  window.addEventListener("beforeunload", () => saveScrollPosition());
  window.addEventListener("pagehide", () => saveScrollPosition());
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      saveScrollPosition();
    }
  });

  // 6. Initial load check
  if (document.readyState === "complete") {
    if (isBackNavActive()) {
      restoreScrollPosition();
    }
  } else {
    window.addEventListener("DOMContentLoaded", () => {
      if (isBackNavActive()) {
        restoreScrollPosition();
      }
    });
  }
}

// Auto-initialize in client context
if (typeof window !== "undefined") {
  initScrollRestoration();
}

/**
 * Client Component for Next.js App Router to automatically save and restore
 * scroll positions across client-side route transitions
 */
export function ScrollRestorationWatcher(): React.ReactElement | null {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prevUrlRef = useRef<string>("");

  useEffect(() => {
    const currentUrl = `${pathname}${searchParams ? `?${searchParams.toString()}` : ""}`;
    const wasBack = isBackNavActive();

    if (wasBack) {
      // Clear flag once consumed
      clearBackNavFlag();

      // BACK NAVIGATION: Restore exact scroll position on target page
      const timer = setTimeout(() => {
        restoreScrollPosition(currentUrl);
      }, 15);

      prevUrlRef.current = currentUrl;
      return () => clearTimeout(timer);
    } else {
      // FORWARD NAVIGATION (e.g. User clicked "View All" or any card):
      // ALWAYS reset to the top (scrollTop = 0) of the destination page!
      resetScrollToTop();
      prevUrlRef.current = currentUrl;
    }
  }, [pathname, searchParams]);

  return null;
}

/**
 * Intelligent Go Back Handler:
 *  - Conceptually:
 *      Back clicked
 *           ↓
 *      Is there a previous internal page?
 *           ↓
 *       YES ─────────→ router.back()
 *           │
 *           NO
 *           ↓
 *      HomePage fallback
 */
export function handleGoBack(
  router?: { back: () => void; push: (url: string) => void } | any,
  fallbackUrl: string = "/MainModules/HomePage"
): void {
  if (typeof window === "undefined") return;

  // 1. Mark back navigation active
  markBackNavigation();

  // 2. Check internal history state
  const historyIdx = window.history.state?.idx;
  const hasInternalReferrer =
    document.referrer && document.referrer.startsWith(window.location.origin);
  const hasInternalHistory =
    (typeof historyIdx === "number" && historyIdx > 0) ||
    window.history.length > 1 ||
    Boolean(hasInternalReferrer);

  if (hasInternalHistory) {
    if (router && typeof router.back === "function") {
      router.back();
    } else {
      window.history.back();
    }
    return;
  }

  // 3. Fallback navigation
  if (router && typeof router.push === "function") {
    router.push(fallbackUrl);
  } else {
    window.location.href = fallbackUrl;
  }
}

export default handleGoBack;
