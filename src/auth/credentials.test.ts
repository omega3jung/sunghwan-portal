import { beforeEach, describe, expect, it, vi } from "vitest";

const authApiJson = vi.hoisted(() => vi.fn());
const resolveDemoAuth = vi.hoisted(() => vi.fn());

vi.mock("@/auth/api", () => ({ authApiJson }));
vi.mock("@/mocks/domain/user", () => ({ resolveDemoAuth }));

import { loginApi } from "./credentials";

const user = {
  id: "account-1",
  username: "employee.one",
  displayName: { en: "Employee One" },
  email: "employee.one@example.com",
  accessToken: "token",
  dataScope: "REMOTE" as const,
  userScope: "INTERNAL" as const,
  companyId: 1,
  permission: 9 as const,
  role: "ADMIN" as const,
};

describe("Login runtime boundary", () => {
  beforeEach(() => vi.clearAllMocks());

  it("uses the demo identity resolver only in demo mode", async () => {
    resolveDemoAuth.mockReturnValue({ ...user, dataScope: "LOCAL" });

    await expect(
      loginApi({ username: "demo", password: "ignored", mode: "demo" }),
    ).resolves.toMatchObject({ username: "employee.one", dataScope: "LOCAL" });
    expect(authApiJson).not.toHaveBeenCalled();
  });

  it("rejects an unknown demo identity", async () => {
    resolveDemoAuth.mockReturnValue(null);

    await expect(
      loginApi({ username: "missing", password: "ignored", mode: "demo" }),
    ).rejects.toThrow("INVALID_CREDENTIALS");
  });

  it("returns the remote trusted identity", async () => {
    authApiJson.mockResolvedValue(
      new Response(JSON.stringify({ data: user }), { status: 200 }),
    );

    await expect(
      loginApi({ username: "login-name", password: "secret" }),
    ).resolves.toEqual(user);
    expect(authApiJson).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "POST",
        path: "/auth/login",
        body: { username: "login-name", password: "secret" },
      }),
    );
  });

  it.each([
    ["upstream rejection", new Response(null, { status: 401 })],
    ["missing data", new Response(JSON.stringify({ data: null }), { status: 200 })],
    ["malformed payload", new Response(JSON.stringify({ result: user }), { status: 200 })],
  ])("fails closed for %s", async (_label, response) => {
    authApiJson.mockResolvedValue(response);

    await expect(
      loginApi({ username: "login-name", password: "secret" }),
    ).rejects.toThrow("INVALID_CREDENTIALS");
  });
});
