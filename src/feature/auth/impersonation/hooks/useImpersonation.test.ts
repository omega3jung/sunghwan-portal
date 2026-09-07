// @vitest-environment jsdom

import { cleanup, renderHook } from "@testing-library/react";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { AppUser } from "@/domain/user";

import { useImpersonation } from "./useImpersonation";

const impersonationMocks = vi.hoisted(() => ({
  apiStart: vi.fn(),
  apiStop: vi.fn(),
  invalidateQueries: vi.fn(),
  sessionUpdate: vi.fn(),
  syncFromSession: vi.fn(),
  useSession: vi.fn(),
  sessionUser: null as AppUser | null,
  store: {
    originalUser: null as AppUser | null,
    impersonatedUser: null as AppUser | null,
    currentUser: null as AppUser | null,
  },
}));

vi.mock("next-auth/react", () => ({
  useSession: impersonationMocks.useSession,
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({
    invalidateQueries: impersonationMocks.invalidateQueries,
  }),
}));

vi.mock("@/feature/auth/impersonation/api", () => ({
  userImpersonationApi: {
    start: impersonationMocks.apiStart,
    stop: impersonationMocks.apiStop,
  },
}));

vi.mock("@/lib/client/auth", () => ({
  useAuthSessionStore: (selector: (state: { user: AppUser | null }) => unknown) =>
    selector({ user: impersonationMocks.sessionUser }),
  useImpersonationStore: () => ({
    ...impersonationMocks.store,
    syncFromSession: impersonationMocks.syncFromSession,
  }),
}));

afterEach(cleanup);

function createUser(
  username: string,
  overrides: Partial<AppUser> = {},
): AppUser {
  return {
    id: `${username}-id`,
    username,
    displayName: { en: username },
    email: `${username}@example.com`,
    userScope: "INTERNAL",
    companyId: 1,
    permission: 1,
    canUseSuperUser: false,
    canUseImpersonation: false,
    ...overrides,
  };
}

const originalUser = createUser("original");
const impersonatedUser = createUser("target");

function createSessionData(hasImpersonation = false) {
  return {
    user: {
      id: originalUser.id,
      username: originalUser.username,
      displayName: originalUser.displayName,
      email: originalUser.email!,
      accessToken: "token",
      dataScope: "REMOTE" as const,
      userScope: originalUser.userScope,
      companyId: originalUser.companyId,
      permission: originalUser.permission,
      role: "ADMIN" as const,
    },
    impersonation: hasImpersonation
      ? {
          originalUser: { username: originalUser.username },
          impersonatedUser: { username: impersonatedUser.username },
        }
      : null,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  impersonationMocks.sessionUser = originalUser;
  impersonationMocks.store.originalUser = originalUser;
  impersonationMocks.store.impersonatedUser = null;
  impersonationMocks.store.currentUser = originalUser;
  impersonationMocks.useSession.mockReturnValue({
    data: createSessionData(false),
    update: impersonationMocks.sessionUpdate,
  });
  impersonationMocks.invalidateQueries.mockResolvedValue(undefined);
  impersonationMocks.sessionUpdate.mockResolvedValue(undefined);
  impersonationMocks.apiStop.mockResolvedValue(undefined);
});

describe("useImpersonation workflow", () => {
  it("publishes the new session identity before invalidating dependent data", async () => {
    const impersonation = {
      originalUser: { username: "original" },
      impersonatedUser: { username: "target" },
    };
    impersonationMocks.apiStart.mockResolvedValue(impersonation);
    const { result } = renderHook(() => useImpersonation());

    await act(async () => result.current.startImpersonation("target"));

    expect(impersonationMocks.apiStart).toHaveBeenCalledWith("target");
    expect(impersonationMocks.sessionUpdate).toHaveBeenCalledWith({
      impersonation,
    });
    expect(impersonationMocks.invalidateQueries).toHaveBeenCalledTimes(4);
    expect(
      impersonationMocks.sessionUpdate.mock.invocationCallOrder[0],
    ).toBeLessThan(
      impersonationMocks.invalidateQueries.mock.invocationCallOrder[0],
    );
  });

  it("clears the session identity before refreshing data when impersonation stops", async () => {
    const { result } = renderHook(() => useImpersonation());

    await act(async () => result.current.stopImpersonation());

    expect(impersonationMocks.apiStop).toHaveBeenCalledOnce();
    expect(impersonationMocks.sessionUpdate).toHaveBeenCalledWith({
      impersonation: null,
    });
    expect(impersonationMocks.invalidateQueries).toHaveBeenCalledTimes(4);
  });

  it("waits for the fetched profile to match the impersonated session identity", () => {
    impersonationMocks.useSession.mockReturnValue({
      data: createSessionData(true),
      update: impersonationMocks.sessionUpdate,
    });
    impersonationMocks.sessionUser = originalUser;
    impersonationMocks.store.originalUser = null;
    impersonationMocks.store.currentUser = originalUser;

    const { rerender } = renderHook(() => useImpersonation());

    expect(impersonationMocks.syncFromSession).not.toHaveBeenCalled();

    impersonationMocks.sessionUser = impersonatedUser;
    rerender();

    expect(impersonationMocks.syncFromSession).toHaveBeenCalledWith({
      originalUser: expect.objectContaining({ username: "original" }),
      impersonatedUser,
    });
  });

  it("does not resynchronize an already stable non-impersonated identity", () => {
    renderHook(() => useImpersonation());

    expect(impersonationMocks.syncFromSession).not.toHaveBeenCalled();
  });
});
