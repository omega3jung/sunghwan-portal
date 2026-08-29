import { beforeEach, describe, expect, it } from "vitest";

import type { AppUser } from "@/domain/user";

import { useImpersonationStore } from "./impersonationStore";

function createUser(id: string, username: string): AppUser {
  return {
    id,
    username,
    displayName: { en: username },
    email: `${username}@example.com`,
    userScope: "INTERNAL",
    companyId: 1,
    permission: 9,
    canUseSuperUser: false,
    canUseImpersonation: true,
  };
}

describe("impersonation client context", () => {
  beforeEach(() => {
    useImpersonationStore.getState().reset();
  });

  it("uses the original user when impersonation is inactive", () => {
    const originalUser = createUser("1", "admin");

    useImpersonationStore
      .getState()
      .syncFromSession({ originalUser, impersonatedUser: null });

    expect(useImpersonationStore.getState()).toMatchObject({
      originalUser,
      impersonatedUser: null,
      currentUser: originalUser,
    });
  });

  it("switches to the impersonated user while preserving the original user", () => {
    const originalUser = createUser("1", "admin");
    const impersonatedUser = createUser("2", "customer");

    useImpersonationStore
      .getState()
      .syncFromSession({ originalUser, impersonatedUser });

    expect(useImpersonationStore.getState()).toMatchObject({
      originalUser,
      impersonatedUser,
      currentUser: impersonatedUser,
    });
  });

  it("clears every identity projection on reset", () => {
    useImpersonationStore.getState().syncFromSession({
      originalUser: createUser("1", "admin"),
      impersonatedUser: createUser("2", "customer"),
    });

    useImpersonationStore.getState().reset();

    expect(useImpersonationStore.getState()).toMatchObject({
      originalUser: null,
      impersonatedUser: null,
      currentUser: null,
    });
  });
});
