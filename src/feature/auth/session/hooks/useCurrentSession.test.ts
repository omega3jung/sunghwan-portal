// @vitest-environment jsdom

import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { AppUser } from "@/domain/user";

const mocks = vi.hoisted(() => ({
  useSession: vi.fn(),
  useProfile: vi.fn(),
  update: vi.fn(),
  setSession: vi.fn(),
  hydrateSession: vi.fn(),
  clearSession: vi.fn(),
  resetImpersonation: vi.fn(),
  store: {
    user: null as AppUser | null,
    isSuperUser: false,
    superUserActivated: null as Date | null,
    security: {
      loginLockedUntil: null as number | null,
      failedAttempts: 0,
      requiresCaptcha: false,
    },
  },
}));

vi.mock("next-auth/react", () => ({ useSession: mocks.useSession }));
vi.mock("@/feature/user/profile/client", () => ({
  useCurrentUserProfileQuery: mocks.useProfile,
}));
vi.mock("@/lib/client/auth", () => ({
  useAuthSessionStore: (selector: (state: unknown) => unknown) =>
    selector({
      ...mocks.store,
      setSession: mocks.setSession,
      hydrateSession: mocks.hydrateSession,
      clearSession: mocks.clearSession,
    }),
  useImpersonationStore: (selector: (state: unknown) => unknown) =>
    selector({ reset: mocks.resetImpersonation }),
}));

import { useCurrentSession } from "./useCurrentSession";

const originalUser = createUser("original", "INTERNAL");
const targetUser = createUser("target", "CLIENT");

afterEach(cleanup);

beforeEach(() => {
  vi.clearAllMocks();
  mocks.store.user = originalUser;
  mocks.useProfile.mockReturnValue({ data: originalUser });
  mocks.useSession.mockReturnValue({
    status: "authenticated",
    data: createSessionData(),
    update: mocks.update,
  });
});

describe("useCurrentSession identity orchestration", () => {
  it("uses the profile that matches the effective session identity", async () => {
    const { result } = renderHook(() => useCurrentSession());

    expect(result.current.current.user).toEqual(originalUser);
    await waitFor(() =>
      expect(mocks.setSession).toHaveBeenCalledWith({ user: originalUser }),
    );
    expect(mocks.hydrateSession).toHaveBeenCalledOnce();
  });

  it("rejects stale profile and store identities during impersonation", () => {
    mocks.useSession.mockReturnValue({
      status: "authenticated",
      data: createSessionData("target"),
      update: mocks.update,
    });
    mocks.useProfile.mockReturnValue({ data: originalUser });
    mocks.store.user = originalUser;

    const { result } = renderHook(() => useCurrentSession());

    expect(result.current.current.user).toBeNull();
    expect(result.current.current.isClient).toBe(false);
  });

  it("switches to a matching impersonated profile", () => {
    mocks.useSession.mockReturnValue({
      status: "authenticated",
      data: createSessionData("target"),
      update: mocks.update,
    });
    mocks.useProfile.mockReturnValue({ data: targetUser });

    const { result } = renderHook(() => useCurrentSession());

    expect(result.current.current.user).toEqual(targetUser);
    expect(result.current.current.isClient).toBe(true);
  });

  it("clears both identity stores after logout", async () => {
    mocks.useSession.mockReturnValue({
      status: "unauthenticated",
      data: null,
      update: mocks.update,
    });
    mocks.useProfile.mockReturnValue({ data: null });

    renderHook(() => useCurrentSession());

    await waitFor(() => expect(mocks.clearSession).toHaveBeenCalledOnce());
    expect(mocks.resetImpersonation).toHaveBeenCalledOnce();
  });

  it("refreshes NextAuth before applying a forced local patch", async () => {
    mocks.update.mockResolvedValue(undefined);
    const { result } = renderHook(() => useCurrentSession());

    await act(async () => {
      await result.current.updateSession({ isSuperUser: true }, true);
    });

    expect(mocks.update).toHaveBeenCalledOnce();
    expect(mocks.setSession).toHaveBeenCalledWith({ isSuperUser: true });
    expect(mocks.update.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.setSession.mock.invocationCallOrder.at(-1) ?? 0,
    );
  });
});

function createUser(username: string, userScope: "INTERNAL" | "CLIENT"): AppUser {
  return {
    id: `${username}-id`,
    username,
    displayName: { en: username },
    email: `${username}@example.com`,
    userScope,
    companyId: 1,
    permission: 3,
    canUseSuperUser: false,
    canUseImpersonation: false,
  };
}

function createSessionData(impersonatedUsername?: string) {
  return {
    expires: "2099-01-01",
    user: {
      id: "original-id",
      username: "original",
      displayName: { en: "original" },
      email: "original@example.com",
      dataScope: "REMOTE" as const,
      userScope: "INTERNAL" as const,
      companyId: 1,
      permission: 9 as const,
      role: "ADMIN" as const,
    },
    ...(impersonatedUsername
      ? {
          impersonation: {
            originalUser: { id: "original-id", username: "original" },
            impersonatedUser: { username: impersonatedUsername },
            activatedAt: 1,
          },
        }
      : {}),
  };
}
