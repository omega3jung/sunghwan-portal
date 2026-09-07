import type { NextRequest } from "next/server";
import type { JWT } from "next-auth/jwt";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getToken = vi.hoisted(() => vi.fn());

vi.mock("next-auth/jwt", () => ({ getToken }));

import {
  canImpersonate,
  checkAdmin,
  checkAdminOrSelf,
  getAccessToken,
  getCompanyId,
  getCurrentEmployeeUserName,
  getCurrentUserName,
  getOriginalEmployeeUserName,
  getOriginalUserId,
  getUserAccessLevel,
  getUserRole,
  isAdmin,
  isInternalUser,
  isOwnerCompanyUser,
  isRemoteRequest,
  requireCurrentUserName,
  tokenToOriginalAuthUser,
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

describe("requireCurrentUserName", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns an authentication failure when the token has no account username", async () => {
    getToken.mockResolvedValue({});

    await expect(requireCurrentUserName(request)).resolves.toEqual({
      ok: false,
      status: 401,
    });
  });

  it("returns the original account username", async () => {
    getToken.mockResolvedValue({ username: "original" });

    await expect(requireCurrentUserName(request)).resolves.toEqual({
      ok: true,
      username: "original",
    });
  });

  it("returns the effective impersonated account username", async () => {
    getToken.mockResolvedValue({
      username: "original",
      impersonation: { impersonatedUser: { username: "target" } },
    });

    await expect(requireCurrentUserName(request)).resolves.toEqual({
      ok: true,
      username: "target",
    });
  });
});

describe("App API authentication identity contract", () => {
  beforeEach(() => vi.clearAllMocks());

  it("keeps account identity original while projecting the effective impersonated username", async () => {
    getToken.mockResolvedValue({
      ...baseToken,
      impersonation: {
        originalUser: { id: "account-1", username: "original" },
        impersonatedUser: { username: "  target-user  " },
        activatedAt: 1,
      },
    });

    await expect(getOriginalUserId(request)).resolves.toBe("account-1");
    await expect(getOriginalEmployeeUserName(request)).resolves.toBe(
      "original",
    );
    await expect(getCurrentUserName(request)).resolves.toBe("target-user");
    await expect(getCurrentEmployeeUserName(request)).resolves.toBe(
      "target-user",
    );
  });

  it("falls back to the original employee username when impersonation metadata is malformed", async () => {
    getToken.mockResolvedValue({
      ...baseToken,
      username: "  original  ",
      impersonation: { impersonatedUser: { username: "   " } },
    });

    await expect(getCurrentEmployeeUserName(request)).resolves.toBe(
      "original",
    );
  });

  it("fails closed for missing or malformed token fields", async () => {
    getToken.mockResolvedValue({
      permission: "9",
      role: "SUPERADMIN",
      companyId: "1",
      username: 42,
    });

    await expect(getUserAccessLevel(request)).resolves.toBe(0);
    await expect(getUserRole(request)).resolves.toBe("NONE");
    await expect(getCompanyId(request)).resolves.toBe(0);
    await expect(getOriginalEmployeeUserName(request)).resolves.toBeNull();
    await expect(getCurrentEmployeeUserName(request)).resolves.toBeNull();
    await expect(checkAdmin(request)).resolves.toEqual({
      ok: false,
      status: 403,
    });
  });

  it("projects runtime, scope, company, permission, role, and access token from the signed token", async () => {
    getToken.mockResolvedValue(baseToken);

    await expect(isRemoteRequest(request)).resolves.toBe(true);
    await expect(isInternalUser(request)).resolves.toBe(true);
    await expect(isOwnerCompanyUser(request)).resolves.toBe(true);
    await expect(getUserAccessLevel(request)).resolves.toBe(9);
    await expect(getUserRole(request)).resolves.toBe("ADMIN");
    await expect(getCompanyId(request)).resolves.toBe(1);
    await expect(getAccessToken(request)).resolves.toBe("access-token");
  });

  it("returns safe defaults when authentication is absent", async () => {
    getToken.mockResolvedValue(null);

    await expect(isRemoteRequest(request)).resolves.toBe(false);
    await expect(isInternalUser(request)).resolves.toBe(false);
    await expect(isOwnerCompanyUser(request)).resolves.toBe(false);
    await expect(getUserAccessLevel(request)).resolves.toBe(0);
    await expect(getUserRole(request)).resolves.toBe("NONE");
    await expect(getCompanyId(request)).resolves.toBe(0);
    await expect(getAccessToken(request)).resolves.toBeNull();
    await expect(checkAdmin(request)).resolves.toEqual({
      ok: false,
      status: 401,
    });
  });
});

describe("App API authorization contract", () => {
  beforeEach(() => vi.clearAllMocks());

  it("treats a populated role as authoritative over legacy permission", () => {
    expect(isAdmin({ role: "USER", permission: 9 })).toBe(false);
    expect(isAdmin({ permission: 9 })).toBe(true);
    expect(isAdmin({ role: "ADMIN", permission: 0 })).toBe(true);
    expect(isAdmin(null)).toBe(false);
  });

  it("allows only authenticated administrators", async () => {
    getToken.mockResolvedValueOnce(baseToken).mockResolvedValueOnce({
      ...baseToken,
      role: "USER",
      permission: 9,
    });

    await expect(checkAdmin(request)).resolves.toEqual({
      ok: true,
      token: baseToken,
    });
    await expect(checkAdmin(request)).resolves.toEqual({
      ok: false,
      status: 403,
    });
  });

  it("checks account self access against the original account id, never the impersonated username", async () => {
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

    await expect(checkAdminOrSelf(request, "account-1")).resolves.toEqual({
      ok: true,
      token: expect.objectContaining({ id: "account-1" }),
    });
    await expect(
      checkAdminOrSelf(request, "target-account"),
    ).resolves.toEqual({ ok: false, status: 403 });
  });

  it("lets an administrator access another account and rejects an unauthenticated request", async () => {
    getToken.mockResolvedValueOnce(baseToken).mockResolvedValueOnce(null);

    await expect(checkAdminOrSelf(request, "account-2")).resolves.toEqual({
      ok: true,
      token: baseToken,
    });
    await expect(checkAdminOrSelf(request, "account-1")).resolves.toEqual({
      ok: false,
      status: 401,
    });
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

  it("normalizes a missing token email without changing original identity fields", () => {
    const { email: _email, ...tokenWithoutEmail } = baseToken;

    expect(tokenToOriginalAuthUser(tokenWithoutEmail as JWT)).toEqual({
      ...tokenWithoutEmail,
      email: "",
    });
  });
});
