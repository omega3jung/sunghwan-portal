"use client";

import { usePathname, useSearchParams } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

import { NS } from "@/lib/application/i18n";

import { RouteLoadingOverlay } from "./RouteLoadingOverlay";

type RouteLoadingContextValue = {
  isRouteLoading: boolean;
  startRouteLoading: () => void;
  startRouteLoadingForHref: (href: string) => boolean;
  stopRouteLoading: () => void;
};

const RouteLoadingContext = createContext<RouteLoadingContextValue | null>(
  null,
);

const ROUTE_LOADING_TIMEOUT_MS = 10_000;
const SHOW_DELAY_MS = 150;
// Allow 200ms to fill, then 150ms to fade (see RouteLoadingOverlay.module.css).
const COMPLETION_MS = 350;
const PROGRESS_STEPS = [
  [200, 0.35],
  [600, 0.55],
  [1_300, 0.7],
  [2_600, 0.82],
  [5_000, 0.9],
] as const;

type ProgressState = {
  phase: "idle" | "waiting" | "loading" | "completing";
  progress: number;
};

const IDLE: ProgressState = { phase: "idle", progress: 0 };

const normalizePathname = (pathname: string) => {
  if (!pathname || pathname === "/") {
    return "/";
  }

  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
};

function isInternalRouteNavigation(href: string): boolean {
  const url = new URL(href, window.location.href);
  const isHttpProtocol = url.protocol === "http:" || url.protocol === "https:";
  if (!isHttpProtocol) {
    return false;
  }

  if (url.origin !== window.location.origin) {
    return false;
  }

  const targetPathname = normalizePathname(url.pathname);
  const currentPathname = normalizePathname(window.location.pathname);

  return !(
    targetPathname === currentPathname &&
    url.searchParams.toString() === new URLSearchParams(window.location.search).toString()
  );
}

/**
 * Client-side navigation feedback; completion means pathname/search commit.
 * Destination data belongs to local skeletons, mutations to their initiating controls.
 * Simulated progress is visual feedback, never a measured completion percentage.
 */
export function RouteLoadingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams.toString();
  const { t } = useTranslation(NS.common);
  const [state, setState] = useState<ProgressState>(IDLE);
  const stateRef = useRef<ProgressState>(IDLE);
  const timersRef = useRef(new Set<number>());
  const routeKey = `${normalizePathname(pathname)}?${searchParamsKey}`;
  const currentRouteKeyRef = useRef(routeKey);
  const isRouteLoading = state.phase === "waiting" || state.phase === "loading";

  const updateState = useCallback((next: ProgressState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(window.clearTimeout);
    timersRef.current.clear();
  }, []);

  const schedule = useCallback((callback: () => void, delay: number) => {
    const timer = window.setTimeout(() => {
      timersRef.current.delete(timer);
      callback();
    }, delay);
    timersRef.current.add(timer);
  }, []);

  const stopRouteLoading = useCallback(() => {
    const { phase } = stateRef.current;
    if (phase === "idle" || phase === "completing") return;

    clearTimers();
    if (phase === "waiting") {
      updateState(IDLE);
      return;
    }

    updateState({ phase: "completing", progress: 1 });
    schedule(() => updateState(IDLE), COMPLETION_MS);
  }, [clearTimers, schedule, updateState]);

  const startRouteLoading = useCallback(() => {
    // Cancel every previous delay, progress step, fade and safety timeout.
    clearTimers();
    const previous = stateRef.current;
    const alreadyVisible = previous.phase === "loading" || previous.phase === "completing";
    const showProgress = () => {
      const progress = alreadyVisible ? Math.min(previous.progress, 0.9) : 0.1;
      updateState({ phase: "loading", progress });
      for (const [delay, nextProgress] of PROGRESS_STEPS) {
        schedule(() => {
          updateState({
            phase: "loading",
            progress: Math.max(stateRef.current.progress, nextProgress),
          });
        }, delay);
      }
    };

    if (alreadyVisible) {
      showProgress();
    } else {
      updateState({ phase: "waiting", progress: 0 });
      schedule(showProgress, SHOW_DELAY_MS);
    }

    // Stale UI cleanup only: a timeout is not a successful navigation commit.
    schedule(() => {
      clearTimers();
      updateState(IDLE);
    }, ROUTE_LOADING_TIMEOUT_MS);
  }, [clearTimers, schedule, updateState]);

  const startRouteLoadingForHref = useCallback(
    (href: string) => {
      if (typeof window === "undefined") {
        return false;
      }

      try {
        if (!isInternalRouteNavigation(href)) {
          return false;
        }
      } catch {
        return false;
      }

      startRouteLoading();
      return true;
    },
    [startRouteLoading],
  );

  useEffect(() => {
    if (routeKey === currentRouteKeyRef.current) return;
    currentRouteKeyRef.current = routeKey;
    stopRouteLoading();
  }, [routeKey, stopRouteLoading]);

  useEffect(() => {
    const handlePopState = () => {
      const nextSearchParamsKey = new URLSearchParams(
        window.location.search,
      ).toString();
      const nextRouteKey = `${normalizePathname(window.location.pathname)}?${nextSearchParamsKey}`;
      if (nextRouteKey === currentRouteKeyRef.current) {
        return;
      }

      startRouteLoading();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [startRouteLoading]);

  useEffect(() => clearTimers, [clearTimers]);

  const value = useMemo<RouteLoadingContextValue>(
    () => ({
      isRouteLoading,
      startRouteLoading,
      startRouteLoadingForHref,
      stopRouteLoading,
    }),
    [
      isRouteLoading,
      startRouteLoading,
      startRouteLoadingForHref,
      stopRouteLoading,
    ],
  );

  return (
    <RouteLoadingContext.Provider value={value}>
      {children}
      <RouteLoadingOverlay
        visible={state.phase === "loading" || state.phase === "completing"}
        progress={state.progress}
        completing={state.phase === "completing"}
        label={t("navigation.loading", { defaultValue: "Navigating…" })}
      />
    </RouteLoadingContext.Provider>
  );
}

// Links also render in isolated stories; navigation remains usable without the provider.
export function useOptionalRouteLoading() {
  return useContext(RouteLoadingContext);
}

export function useRouteLoading() {
  const context = useContext(RouteLoadingContext);

  if (!context) {
    throw new Error(
      "useRouteLoading must be used within RouteLoadingProvider.",
    );
  }

  return context;
}
