import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getToken = vi.hoisted(() => vi.fn());

vi.mock("next-auth/jwt", () => ({ getToken }));

import { requireCurrentUserName } from "./requestAuth";

const request = {} as NextRequest;

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
