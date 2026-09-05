import type { NextRequest } from "next/server";
import type { JWT } from "next-auth/jwt";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getToken = vi.hoisted(() => vi.fn());

vi.mock("next-auth/jwt", () => ({ getToken }));

import {
  canImpersonate,
  checkAdminOrSelf,
  getCurrentEmployeeUserName,
  getCurrentUserName,
  getOriginalEmployeeUserName,
  isAdmin,
} from "./requestAuth";

const request = {} as NextRequest;
const baseToken = {
  id: "account-1",
  username: "original",
  displayName: { en: "Original User" },
  email: "original@example.com",
  accessToken: "access-token",
  dataScope: "REMOTE",
  userScope: "INTERNAL",
  companyId: 1,
  permission: 9,
  role: "ADMIN",
} satisfies JWT;

describe("server auth original and effective identity", () => {
  beforeEach(() => vi.clearAllMocks());

  it("preserves the authenticated username while exposing the impersonated current username", async () => {
    getToken.mockResolvedValue({
      ...baseToken,
      impersonation: {
        originalUser: { id: "account-1", username: "original" },
        impersonatedUser: { username: "__customer__" },
        activatedAt: 1,
      },
    });

    await expect(getOriginalEmployeeUserName(request)).resolves.toBe(
      "original",
    );
    // Auth account ids and employee usernames may differ. The impersonation
    // metadata already carries the canonical employee username and must not be
    // rewritten by presentation-oriented fixture conventions.
    await expect(getCurrentEmployeeUserName(request)).resolves.toBe(
      "__customer__",
    );
    await expect(getCurrentUserName(request)).resolves.toBe("__customer__");
  });

  it("never grants account ownership from an impersonated identity", async () => {
    getToken.mockResolvedValue({
      ...baseToken,
      role: "USER",
      permission: 3,
      impersonation: {
        originalUser: { id: "account-1", username: "original" },
        impersonatedUser: { username: "target-account" },
        activatedAt: 1,
      },
    });

    await expect(checkAdminOrSelf(request, "target-account")).resolves.toEqual({
      ok: false,
      status: 403,
    });
    await expect(checkAdminOrSelf(request, "account-1")).resolves.toEqual({
      ok: true,
      token: expect.objectContaining({ id: "account-1" }),
    });
  });

  it("treats a populated role as authoritative over legacy permission", () => {
    expect(isAdmin({ role: "USER", permission: 9 })).toBe(false);
    expect(isAdmin({ permission: 9 })).toBe(true);
    expect(isAdmin({ role: "ADMIN", permission: 0 })).toBe(true);
  });

  it.each([
    ["INTERNAL", "INTERNAL", true],
    ["INTERNAL", "CLIENT", true],
    ["CLIENT", "INTERNAL", false],
    ["CLIENT", "CLIENT", false],
  ] as const)(
    "allows %s to impersonate %s: %s",
    (originalScope, targetScope, expected) => {
      expect(canImpersonate(originalScope, targetScope)).toBe(expected);
    },
  );
});
