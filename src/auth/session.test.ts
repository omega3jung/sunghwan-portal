import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { describe, expect, it } from "vitest";

import type { AuthUser, ImpersonationInfo } from "@/domain/auth";

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
