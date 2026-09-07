import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAuthToken: vi.fn(),
  isAdmin: vi.fn(),
  canImpersonate: vi.fn(),
  tokenToOriginalAuthUser: vi.fn(),
  getLocalTarget: vi.fn(),
  authApiJson: vi.fn(),
}));

vi.mock("@/app/api/_adapters", () => ({
  getAuthToken: mocks.getAuthToken,
  isAdmin: mocks.isAdmin,
  canImpersonate: mocks.canImpersonate,
  tokenToOriginalAuthUser: mocks.tokenToOriginalAuthUser,
}));
vi.mock("@/app/api/_adapters/localDemo/user", () => ({
  getLocalImpersonationTarget: mocks.getLocalTarget,
}));
vi.mock("@/auth/api", () => ({ authApiJson: mocks.authApiJson }));

import { DELETE, POST } from "./route";

const original = {
  id: "account-1",
  username: "admin.employee",
  displayName: { en: "Admin" },
  email: "admin@example.com",
  accessToken: "token",
  dataScope: "LOCAL" as const,
  userScope: "INTERNAL" as const,
  companyId: 1,
  permission: 9 as const,
  role: "ADMIN" as const,
};

describe("Impersonation HTTP authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthToken.mockResolvedValue(original);
    mocks.isAdmin.mockReturnValue(true);
    mocks.canImpersonate.mockReturnValue(true);
    mocks.tokenToOriginalAuthUser.mockReturnValue(original);
    mocks.getLocalTarget.mockReturnValue({
      username: "client.employee",
      permission: 3,
      userScope: "CLIENT",
    });
  });

  it.each([
    ["missing session", null, true, 401],
    ["non-admin", original, false, 403],
  ])("rejects %s", async (_label, token, admin, status) => {
    mocks.getAuthToken.mockResolvedValue(token);
    mocks.isAdmin.mockReturnValue(admin);

    const response = await POST(createRequest("client.employee"));
    expect(response.status).toBe(status);
    expect(mocks.getLocalTarget).not.toHaveBeenCalled();
  });

  it.each([
    ["self", { username: " ADMIN.EMPLOYEE ", permission: 3, userScope: "CLIENT" }, 400],
    ["equal permission", { username: "peer", permission: 9, userScope: "CLIENT" }, 403],
    ["higher permission", { username: "higher", permission: 9, userScope: "CLIENT" }, 403],
  ])("rejects a %s target", async (_label, target, status) => {
    mocks.getLocalTarget.mockReturnValue(target);
    const response = await POST(createRequest(target.username));
    expect(response.status).toBe(status);
  });

  it("rejects unknown or inactive targets", async () => {
    mocks.getLocalTarget.mockReturnValue(null);
    const response = await POST(createRequest("missing"));
    expect(response.status).toBe(404);
  });

  it("rejects a target outside the directional scope policy", async () => {
    mocks.canImpersonate.mockReturnValue(false);
    const response = await POST(createRequest("internal.employee"));
    expect(response.status).toBe(403);
  });

  it("returns the same session metadata for a valid local target", async () => {
    vi.spyOn(Date, "now").mockReturnValue(1234);
    const response = await POST(createRequest("client.employee"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      impersonation: {
        originalUser: { id: "account-1", username: "admin.employee" },
        impersonatedUser: { username: "client.employee" },
        activatedAt: 1234,
      },
    });
  });

  it("validates the remote response before publishing session metadata", async () => {
    mocks.tokenToOriginalAuthUser.mockReturnValue({ ...original, dataScope: "REMOTE" });
    mocks.authApiJson.mockResolvedValue(
      new Response(JSON.stringify({ data: { username: "client.employee" } }), {
        status: 200,
      }),
    );

    const response = await POST(createRequest("client.employee"));
    expect(response.status).toBe(500);
  });

  it("allows an authenticated user to stop impersonation", async () => {
    const response = await DELETE(createRequest("ignored"));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ impersonation: null });
  });
});

function createRequest(impersonatedUsername: string) {
  return new NextRequest("http://localhost/api/auth/impersonation", {
    method: "POST",
    body: JSON.stringify({ impersonatedUsername }),
    headers: { "Content-Type": "application/json" },
  });
}
