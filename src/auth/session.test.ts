import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthUser, ImpersonationInfo } from "@/domain/auth";

const mocks = vi.hoisted(() => ({ resolveDemoAuth: vi.fn(), authApiJson: vi.fn() }));
vi.mock("@/mocks/domain/user", () => ({ resolveDemoAuth: mocks.resolveDemoAuth }));
vi.mock("./api", () => ({ authApiJson: mocks.authApiJson }));

import { authSession } from "./session";

const user: AuthUser = {
  id: "account-1",
  username: "employee.one",
  displayName: { en: "Employee One" },
  email: "employee.one@example.com",
  accessToken: "server-token",
  dataScope: "REMOTE",
  userScope: "INTERNAL",
  companyId: 7,
  permission: 9,
  role: "ADMIN",
};

const impersonation: ImpersonationInfo = {
  originalUser: { id: user.id, username: user.username },
  impersonatedUser: { username: "client.user" },
  activatedAt: 123,
};

describe("Auth session identity boundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Date, "now").mockReturnValue(123);
    const target = { username: "client.user", permission: 3, userScope: "CLIENT" };
    mocks.resolveDemoAuth.mockReturnValue(target);
    mocks.authApiJson.mockImplementation(async () =>
      new Response(JSON.stringify({ data: target })),
    );
  });

  it.each(["LOCAL", "REMOTE"] as const)("rejects direct impersonation updates from a non-admin in %s", async (dataScope) => {
    const token = { ...user, dataScope, permission: 3, role: "USER" } as JWT;
    await expect(authSession.jwt!({
      token, trigger: "update", session: { impersonation },
    } as never)).rejects.toMatchObject({ status: 403 });
    expect(token).not.toHaveProperty("impersonation");
    expect(mocks.resolveDemoAuth).not.toHaveBeenCalled();
    expect(mocks.authApiJson).not.toHaveBeenCalled();
  });

  it("rejects a client administrator bypassing the impersonation API", async () => {
    await expect(authSession.jwt!({
      token: { ...user, userScope: "CLIENT" },
      trigger: "update", session: { impersonation },
    } as never)).rejects.toMatchObject({ status: 403 });
  });

  it("rejects an equal-permission target resolved by the server", async () => {
    mocks.resolveDemoAuth.mockReturnValue({ username: "other.admin", permission: 9, userScope: "INTERNAL" });
    await expect(authSession.jwt!({
      token: { ...user, dataScope: "LOCAL" },
      trigger: "update", session: { impersonation },
    } as never)).rejects.toMatchObject({ status: 403 });
  });

  it("rebuilds audit identity and activation time instead of trusting update metadata", async () => {
    const token = await authSession.jwt!({
      token: { ...user, dataScope: "LOCAL" },
      trigger: "update",
      session: { impersonation: { ...impersonation, originalUser: { id: "forged", username: "forged" }, activatedAt: -1 } },
    } as never);
    expect(token.impersonation).toEqual(impersonation);
  });

  it("fails closed when the remote target cannot be verified", async () => {
    mocks.authApiJson.mockResolvedValue(new Response("{}", { status: 503 }));
    await expect(authSession.jwt!({
      token: { ...user }, trigger: "update", session: { impersonation },
    } as never)).rejects.toMatchObject({ status: 500 });
  });
  it("stores the complete trusted identity on initial sign-in", async () => {
    const token = await authSession.jwt!({ token: {}, user } as never);

    expect(token).toMatchObject(user);
  });

  it("starts and stops impersonation without replacing the original identity", async () => {
    const originalToken = { ...user } as JWT;
    const impersonatedToken = await authSession.jwt!({
      token: originalToken,
      trigger: "update",
      session: { impersonation },
    } as never);

    expect(impersonatedToken).toMatchObject({
      id: user.id,
      username: user.username,
      impersonation,
    });

    const restoredToken = await authSession.jwt!({
      token: impersonatedToken,
      trigger: "update",
      session: { impersonation: null },
    } as never);

    expect(restoredToken).not.toHaveProperty("impersonation");
    expect(restoredToken).toMatchObject({ id: user.id, username: user.username });
  });

  it("projects the original session user and exposes impersonation separately", async () => {
    const session = { expires: "2099-01-01" } as Session;
    const result = (await authSession.session!({
      session,
      token: { ...user, impersonation } as JWT,
    } as never)) as Session;

    expect(result.user).toEqual({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      dataScope: user.dataScope,
      userScope: user.userScope,
      companyId: user.companyId,
      permission: user.permission,
      role: user.role,
    });
    expect(result.impersonation).toEqual(impersonation);
  });
});
