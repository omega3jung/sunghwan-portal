import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => ({
  checkAdmin: vi.fn(),
  checkAdminOrSelf: vi.fn(),
}));

vi.mock("./requestAuth", () => auth);

import {
  getAdminErrorResponse,
  getAdminOrSelfErrorResponse,
  toAuthErrorResponse,
} from "./authResponse";

describe("getAdminErrorResponse", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns null for an authenticated administrator", async () => {
    auth.checkAdmin.mockResolvedValue({ ok: true, token: {} });

    await expect(getAdminErrorResponse(createRequest())).resolves.toBeNull();
  });

  it.each([
    [401, "Unauthorized"],
    [403, "Forbidden"],
  ] as const)("maps an authorization failure to HTTP %s", async (status, message) => {
    auth.checkAdmin.mockResolvedValue({ ok: false, status });

    const response = await getAdminErrorResponse(createRequest());

    expect(response?.status).toBe(status);
    await expect(response?.json()).resolves.toEqual({ message });
  });

  it("delegates user-scoped authorization and returns its shared error response", async () => {
    auth.checkAdminOrSelf.mockResolvedValue({ ok: false, status: 403 });

    const response = await getAdminOrSelfErrorResponse(
      createRequest(),
      "user-1",
    );

    expect(auth.checkAdminOrSelf).toHaveBeenCalledWith(
      expect.any(NextRequest),
      "user-1",
    );
    expect(response?.status).toBe(403);
    await expect(response?.json()).resolves.toEqual({ message: "Forbidden" });
  });

  it("maps a failed authentication result independently from its policy check", async () => {
    const response = toAuthErrorResponse({ ok: false, status: 401 });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ message: "Unauthorized" });
  });
});

function createRequest() {
  return new NextRequest("http://localhost/api/employees");
}
