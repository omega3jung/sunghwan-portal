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
    targetPathname === currentPathname && url.search === window.location.search
  );
}

export function RouteLoadingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams.toString();
  const { t } = useTranslation(NS.common);
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const currentRouteKeyRef = useRef<string>("/");

  const clearFallbackTimeout = useCallback(() => {
    if (timeoutRef.current === null) {
      return;
    }

    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }, []);

  const stopRouteLoading = useCallback(() => {
    clearFallbackTimeout();
    setIsRouteLoading(false);
  }, [clearFallbackTimeout]);

  const startRouteLoading = useCallback(() => {
    clearFallbackTimeout();
    setIsRouteLoading(true);

    timeoutRef.current = window.setTimeout(() => {
      setIsRouteLoading(false);
      timeoutRef.current = null;
    }, ROUTE_LOADING_TIMEOUT_MS);
  }, [clearFallbackTimeout]);

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
    currentRouteKeyRef.current = `${normalizePathname(pathname)}?${searchParamsKey}`;
  }, [pathname, searchParamsKey]);

  useEffect(() => {
    stopRouteLoading();
  }, [pathname, searchParamsKey, stopRouteLoading]);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) {
        return;
      }

      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest("a");
      if (!anchor) {
        return;
      }

      const targetAttr = anchor.getAttribute("target");
      if (targetAttr && targetAttr.toLowerCase() !== "_self") {
        return;
      }

      if (anchor.hasAttribute("download")) {
        return;
      }

      if (anchor.getAttribute("aria-disabled") === "true") {
        return;
      }

      const hrefAttr = anchor.getAttribute("href");
      if (!hrefAttr || hrefAttr.startsWith("#")) {
        return;
      }

      startRouteLoadingForHref(anchor.href);
    };

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

    document.addEventListener("click", handleDocumentClick);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [startRouteLoading, startRouteLoadingForHref]);

  useEffect(() => {
    return () => {
      clearFallbackTimeout();
    };
  }, [clearFallbackTimeout]);

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
        visible={isRouteLoading}
        label={t("table.loading", { defaultValue: "Loading..." })}
      />
    </RouteLoadingContext.Provider>
  );
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
