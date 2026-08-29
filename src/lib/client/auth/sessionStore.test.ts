import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AppUser } from "@/domain/user";

import { useAuthSessionStore } from "./sessionStore";

const STORAGE_KEY = "sunghwan_portal_session";

function createStorage(): Storage {
  const values = new Map<string, string>();

  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => Array.from(values.keys())[index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, value),
  };
}

function createUser(): AppUser {
  return {
    id: "user-1",
    username: "alice",
    displayName: { en: "Alice" },
    email: "alice@example.com",
    userScope: "CLIENT",
    companyId: 2,
    permission: 3,
    canUseSuperUser: false,
    canUseImpersonation: false,
  };
}

describe("auth session client cache", () => {
  beforeEach(() => {
    vi.stubGlobal("sessionStorage", createStorage());
    useAuthSessionStore.getState().clearSession();
  });

  it("patches nested user data without losing the authenticated identity", () => {
    const user = createUser();

    useAuthSessionStore.getState().setSession({ user, isClient: true });
    useAuthSessionStore.getState().setSession({
      user: { displayName: { en: "Alice Updated" } },
      isDemoUser: true,
    });

    expect(useAuthSessionStore.getState()).toMatchObject({
      user: { ...user, displayName: { en: "Alice Updated" } },
      isClient: true,
      isDemoUser: true,
    });
    expect(JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "null")).toMatchObject({
      user: { id: "user-1", displayName: { en: "Alice Updated" } },
      isClient: true,
      isDemoUser: true,
    });
  });

  it("rejects a partial user patch when no prior identity exists", () => {
    expect(() =>
      useAuthSessionStore.getState().setSession({
        user: { displayName: { en: "Unknown" } },
      }),
    ).toThrow("Cannot patch user when prev.user is null");
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("hydrates a persisted session and resets malformed JSON or cleared state", () => {
    const user = createUser();
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ user, isClient: true, isDemoUser: true }),
    );

    useAuthSessionStore.getState().hydrateSession();
    expect(useAuthSessionStore.getState()).toMatchObject({
      user,
      isClient: true,
      isDemoUser: true,
    });

    sessionStorage.setItem(STORAGE_KEY, "{invalid-json");
    useAuthSessionStore.getState().hydrateSession();
    expect(useAuthSessionStore.getState()).toMatchObject({
      user: null,
      isClient: false,
      isDemoUser: false,
    });

    useAuthSessionStore.getState().setSession({ user });
    useAuthSessionStore.getState().clearSession();
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(useAuthSessionStore.getState().user).toBeNull();
  });
});
