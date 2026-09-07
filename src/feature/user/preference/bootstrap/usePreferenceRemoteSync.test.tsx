// @vitest-environment jsdom

import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const session = vi.hoisted(() => ({
  status: "authenticated" as "loading" | "authenticated" | "unauthenticated",
  userId: "user-1" as string | undefined,
  dataScope: "REMOTE" as "LOCAL" | "REMOTE" | undefined,
}));
const repo = vi.hoisted(() => ({ get: vi.fn(), create: vi.fn() }));
const store = vi.hoisted(() => ({ setPreference: vi.fn() }));
const defaultPreference = vi.hoisted(() => ({
  menu: "collapsible",
  screenMode: "system",
  colorTheme: "default",
  language: "en",
}));

vi.mock("next-auth/react", () => ({
  useSession: () => ({
    status: session.status,
    data: session.userId
      ? { user: { id: session.userId, dataScope: session.dataScope } }
      : null,
  }),
}));
vi.mock("@/lib/client/preference", () => ({
  createDefaultPreference: () => ({ ...defaultPreference }),
  usePreferenceStore: (selector: (state: typeof store) => unknown) =>
    selector(store),
}));
vi.mock("../repo", () => ({ userPreferenceRepo: repo }));

import { preferenceKeys } from "../preferenceKeys";
import { usePreferenceRemoteSync } from "./usePreferenceRemoteSync";

const preference = (language: "en" | "ko" = "ko") => ({
  ...defaultPreference,
  language,
});

describe("usePreferenceRemoteSync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    session.status = "authenticated";
    session.userId = `user-${Math.random()}`;
    session.dataScope = "REMOTE";
  });

  afterEach(cleanup);

  it("publishes an existing preference envelope for a REMOTE session", async () => {
    repo.get.mockResolvedValue({
      preferenceKey: preferenceKeys.home.preference,
      preferenceMeta: preference("ko"),
    });

    renderHook(() => usePreferenceRemoteSync());

    await waitFor(() => {
      expect(store.setPreference).toHaveBeenCalledWith(preference("ko"));
    });
    expect(repo.get).toHaveBeenCalledWith({
      isRemote: true,
      preferenceKey: preferenceKeys.home.preference,
    });
    expect(repo.create).not.toHaveBeenCalled();
  });

  it("creates and publishes defaults when no preference exists", async () => {
    repo.get.mockResolvedValue(null);
    repo.create.mockResolvedValue(undefined);

    renderHook(() => usePreferenceRemoteSync());

    await waitFor(() => {
      expect(repo.create).toHaveBeenCalledWith({
        isRemote: true,
        data: {
          preferenceKey: preferenceKeys.home.preference,
          preferenceMeta: defaultPreference,
        },
      });
      expect(store.setPreference).toHaveBeenCalledWith(defaultPreference);
    });
  });

  it("uses LOCAL persistence when the signed session selects LOCAL data", async () => {
    session.dataScope = "LOCAL";
    repo.get.mockResolvedValue(preference("en"));

    renderHook(() => usePreferenceRemoteSync());

    await waitFor(() => {
      expect(repo.get).toHaveBeenCalledWith(
        expect.objectContaining({ isRemote: false }),
      );
      expect(store.setPreference).toHaveBeenCalledWith(preference("en"));
    });
  });

  it("deduplicates concurrent mounts for the same user, scope, and preference key", async () => {
    let resolveGet: ((value: ReturnType<typeof preference>) => void) | undefined;
    repo.get.mockImplementation(
      () => new Promise((resolve) => (resolveGet = resolve)),
    );

    renderHook(() => usePreferenceRemoteSync());
    renderHook(() => usePreferenceRemoteSync());

    expect(repo.get).toHaveBeenCalledTimes(1);
    await act(async () => resolveGet?.(preference("ko")));
    await waitFor(() => expect(store.setPreference).toHaveBeenCalledTimes(2));
  });

  it("ignores a stale result after user transition and publishes only the new user result", async () => {
    let resolveOld: ((value: ReturnType<typeof preference>) => void) | undefined;
    repo.get
      .mockImplementationOnce(
        () => new Promise((resolve) => (resolveOld = resolve)),
      )
      .mockResolvedValueOnce(preference("en"));
    const view = renderHook(() => usePreferenceRemoteSync());

    session.userId = `${session.userId}-next`;
    view.rerender();

    await waitFor(() => {
      expect(store.setPreference).toHaveBeenCalledWith(preference("en"));
    });
    await act(async () => resolveOld?.(preference("ko")));

    expect(store.setPreference).not.toHaveBeenCalledWith(preference("ko"));
    expect(repo.get).toHaveBeenCalledTimes(2);
  });

  it("does not start synchronization without a complete authenticated identity", () => {
    session.status = "loading";
    session.userId = undefined;

    renderHook(() => usePreferenceRemoteSync());

    expect(repo.get).not.toHaveBeenCalled();
  });

  it("clears a failed in-flight task so a later mount can retry", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    repo.get.mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce(
      preference("ko"),
    );
    const first = renderHook(() => usePreferenceRemoteSync());
    await waitFor(() => expect(errorSpy).toHaveBeenCalled());
    first.unmount();

    renderHook(() => usePreferenceRemoteSync());
    await waitFor(() => {
      expect(repo.get).toHaveBeenCalledTimes(2);
      expect(store.setPreference).toHaveBeenCalledWith(preference("ko"));
    });
  });
});
