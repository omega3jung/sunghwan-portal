// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RouteLoadingLink } from "./RouteLoadingLink";
import { RouteLoadingProvider, useRouteLoading } from "./RouteLoadingProvider";

const route = vi.hoisted(() => ({ pathname: "/current", search: "" }));
vi.mock("next/navigation", () => ({
  usePathname: () => route.pathname,
  useSearchParams: () => new URLSearchParams(route.search),
}));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: () => "Navigating…" }),
}));

// Model the public Link boundary: accepted navigation calls onNavigate after
// preventDefault on the click. Real Next Link integration is checked in-browser.
vi.mock("next/link", () => ({
  default: ({ href, onClick, onNavigate, ...props }: ComponentProps<typeof import("next/link").default>) => (
    <a
      {...props}
      href={typeof href === "string" ? href : href.pathname ?? undefined}
      onClick={(event) => {
        onClick?.(event);
        const anchor = event.currentTarget;
        const accepted = !event.defaultPrevented && event.button === 0 &&
          !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey &&
          (!anchor.target || anchor.target === "_self") && !anchor.hasAttribute("download") &&
          new URL(anchor.href).origin === window.location.origin;
        event.preventDefault();
        if (accepted) onNavigate?.({ preventDefault: vi.fn() });
      }}
    />
  ),
}));

function Controls() {
  const { startRouteLoadingForHref, stopRouteLoading, isRouteLoading } = useRouteLoading();
  return (
    <>
      <button onClick={() => startRouteLoadingForHref("/next")}>Navigate</button>
      <button onClick={() => startRouteLoadingForHref("/another")}>Navigate again</button>
      <button onClick={stopRouteLoading}>Complete</button>
      <button>Local action</button>
      <div>{isRouteLoading ? "pending" : "idle"}</div>
    </>
  );
}

function App() {
  return <RouteLoadingProvider><Controls /></RouteLoadingProvider>;
}

function advance(ms: number) {
  act(() => { vi.advanceTimersByTime(ms); });
}

function bar() {
  return document.querySelector<HTMLElement>('[aria-hidden="true"]');
}

function progress() {
  return (bar()?.firstElementChild as HTMLElement | null)?.style.transform;
}

function commit(view: ReturnType<typeof render>, pathname = "/next", search = "") {
  route.pathname = pathname;
  route.search = search;
  window.history.replaceState({}, "", pathname + search);
  view.rerender(<App />);
}

beforeEach(() => {
  vi.useFakeTimers();
  route.pathname = "/current";
  route.search = "";
  window.history.replaceState({}, "", "/current");
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("route progress lifecycle", () => {
  it("never displays progress when navigation commits before the delay", () => {
    const view = render(<App />);
    fireEvent.click(screen.getByText("Navigate"));
    expect(screen.getByRole("status").textContent).toBe("");
    expect(screen.getByText("pending")).toBeTruthy();
    advance(100);
    commit(view);
    advance(1_000);
    expect(bar()).toBeNull();
    expect(screen.getByText("idle")).toBeTruthy();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("shows delayed simulated progress, caps it below completion and announces once", () => {
    render(<App />);
    fireEvent.click(screen.getByText("Navigate"));
    advance(100);
    expect(bar()).toBeNull();
    advance(100);
    expect(bar()).not.toBeNull();
    expect(screen.getByRole("status").textContent).toBe("Navigating…");
    const initial = progress();
    advance(6_000);
    expect(progress()).not.toBe(initial);
    expect(progress()).toBe("scaleX(0.9)");
    expect(screen.getAllByRole("status")).toHaveLength(1);
    expect(screen.getByRole("status").textContent).toBe("Navigating…");
    expect(document.querySelector("[aria-valuenow], [aria-busy]")).toBeNull();
  });

  it("fills only at route commit, then hides without waiting for destination data", () => {
    const view = render(<App />);
    fireEvent.click(screen.getByText("Navigate"));
    advance(300);
    commit(view);
    expect(progress()).toBe("scaleX(1)");
    expect(screen.getByText("idle")).toBeTruthy();
    expect(screen.getByRole("status").textContent).toBe("");
    advance(500);
    expect(bar()).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("cancels an earlier completion timer when another navigation starts", () => {
    const view = render(<App />);
    fireEvent.click(screen.getByText("Navigate"));
    advance(300);
    commit(view);
    advance(100);
    fireEvent.click(screen.getByText("Navigate again"));
    advance(500);
    expect(bar()).not.toBeNull();
    expect(progress()).not.toBe("scaleX(1)");
    expect(screen.getByText("pending")).toBeTruthy();
    commit(view, "/another");
    advance(500);
    expect(bar()).toBeNull();
  });

  it("cancels the old safety timeout on consecutive navigation", () => {
    render(<App />);
    fireEvent.click(screen.getByText("Navigate"));
    advance(9_000);
    fireEvent.click(screen.getByText("Navigate again"));
    advance(2_000);
    expect(bar()).not.toBeNull();
    expect(screen.getByText("pending")).toBeTruthy();
  });

  it("cleans up stale UI on timeout without showing successful completion", () => {
    render(<App />);
    fireEvent.click(screen.getByText("Navigate"));
    advance(9_000);
    expect(progress()).not.toBe("scaleX(1)");
    advance(1_000);
    expect(bar()).toBeNull();
    expect(screen.getByText("idle")).toBeTruthy();
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each(["waiting", "loading", "completing"])("cleans up timers on unmount during %s", (phase) => {
    const view = render(<StrictMode><App /></StrictMode>);
    fireEvent.click(screen.getByText("Navigate"));
    if (phase !== "waiting") advance(300);
    if (phase === "completing") fireEvent.click(screen.getByText("Complete"));
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("does not start for local actions or steal focus", () => {
    render(<App />);
    const button = screen.getByText("Local action");
    button.focus();
    fireEvent.click(button);
    advance(300);
    expect(bar()).toBeNull();
    fireEvent.click(screen.getByText("Navigate"));
    advance(300);
    expect(document.activeElement).toBe(button);
  });

  it("completes on query-only route commits", () => {
    const view = render(<App />);
    fireEvent.click(screen.getByText("Navigate"));
    advance(300);
    commit(view, "/current", "?page=2");
    expect(progress()).toBe("scaleX(1)");
    advance(500);
    expect(bar()).toBeNull();
  });

  it("observes back/forward but ignores hash-only history", () => {
    const view = render(<App />);
    window.history.replaceState({}, "", "/current#section");
    act(() => window.dispatchEvent(new PopStateEvent("popstate")));
    advance(300);
    expect(bar()).toBeNull();
    window.history.replaceState({}, "", "/previous");
    act(() => window.dispatchEvent(new PopStateEvent("popstate")));
    advance(300);
    expect(bar()).not.toBeNull();
    commit(view, "/previous");
    advance(500);
    expect(bar()).toBeNull();
  });
});

describe("Link navigation boundary", () => {
  it("starts for accepted Next Link navigation even when the click was prevented by Next", () => {
    render(<RouteLoadingProvider><RouteLoadingLink href="/next">Next</RouteLoadingLink></RouteLoadingProvider>);
    fireEvent.click(screen.getByText("Next"));
    advance(300);
    expect(bar()).not.toBeNull();
  });

  it.each(["/current", "/current/", "#section", "/current#section", "https://example.com/page"])(
    "does not start for %s",
    (href) => {
      render(<RouteLoadingProvider><RouteLoadingLink href={href}>Next</RouteLoadingLink></RouteLoadingProvider>);
      fireEvent.click(screen.getByText("Next"));
      advance(300);
      expect(bar()).toBeNull();
    },
  );

  it.each([
    { target: "_blank" },
    { download: true },
    { "aria-disabled": true as const },
    { onClick: (event: React.MouseEvent<HTMLAnchorElement>) => event.preventDefault() },
    { onNavigate: (event: { preventDefault: () => void }) => event.preventDefault() },
  ])("respects link opt-outs %j", (props) => {
    render(<RouteLoadingProvider><RouteLoadingLink href="/next" {...props}>Next</RouteLoadingLink></RouteLoadingProvider>);
    fireEvent.click(screen.getByText("Next"));
    advance(300);
    expect(bar()).toBeNull();
  });

  it.each(["ctrlKey", "metaKey", "shiftKey", "altKey"])("does not start on %s clicks", (key) => {
    render(<RouteLoadingProvider><RouteLoadingLink href="/next">Next</RouteLoadingLink></RouteLoadingProvider>);
    fireEvent.click(screen.getByText("Next"), { [key]: true });
    advance(300);
    expect(bar()).toBeNull();
  });

  it("starts on query-only navigation", () => {
    render(<RouteLoadingProvider><RouteLoadingLink href="/current?page=2">Next</RouteLoadingLink></RouteLoadingProvider>);
    fireEvent.click(screen.getByText("Next"));
    advance(300);
    expect(bar()).not.toBeNull();
  });

  it("preserves link behavior outside the application provider", () => {
    const onNavigate = vi.fn();
    render(<RouteLoadingLink href="/next" onNavigate={onNavigate}>Next</RouteLoadingLink>);
    fireEvent.click(screen.getByText("Next"));
    expect(onNavigate).toHaveBeenCalledOnce();
    expect(bar()).toBeNull();
  });
});
