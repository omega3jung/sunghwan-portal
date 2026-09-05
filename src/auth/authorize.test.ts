import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthUser } from "@/domain/auth";

const loginApi = vi.hoisted(() => vi.fn());

vi.mock("./credentials", () => ({ loginApi }));

import { authorize } from "./authorize";

const user: AuthUser = {
  id: "account-1",
  username: "employee.one",
  displayName: { en: "Employee One" },
  email: "employee.one@example.com",
  accessToken: "token",
  dataScope: "REMOTE",
  userScope: "INTERNAL",
  companyId: 1,
  permission: 9,
  role: "ADMIN",
};

describe("Credentials authorization boundary", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns only the trusted authenticated projection", async () => {
    loginApi.mockResolvedValue({ ...user, ignored: "value" });

    await expect(
      authorize({ username: "login-name", password: "secret" }),
    ).resolves.toEqual(user);
  });

  it.each([
    ["missing credentials", undefined, null],
    ["missing account", { username: "missing", password: "bad" }, null],
  ])("fails closed for %s", async (_label, credentials, expected) => {
    loginApi.mockResolvedValue(null);
    await expect(authorize(credentials)).resolves.toBe(expected);
  });

  it("fails closed when the authentication service throws", async () => {
    loginApi.mockRejectedValue(new Error("upstream unavailable"));

    await expect(
      authorize({ username: "employee.one", password: "secret" }),
    ).resolves.toBeNull();
  });
});
