import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAuthToken: vi.fn(),
  isAdmin: vi.fn(),
  listLocal: vi.fn(),
  authApiJson: vi.fn(),
}));

vi.mock("@/app/api/_adapters", () => ({
  getAuthToken: mocks.getAuthToken,
  isAdmin: mocks.isAdmin,
}));
vi.mock("@/app/api/_adapters/localDemo/user", () => ({
  listLocalEligibleImpersonationEmployees: mocks.listLocal,
}));
vi.mock("@/auth/api", () => ({ authApiJson: mocks.authApiJson }));

import { GET } from "./route";

describe("Impersonation employee-list boundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthToken.mockResolvedValue({
      id: "admin",
      dataScope: "LOCAL",
      role: "ADMIN",
    });
    mocks.isAdmin.mockReturnValue(true);
    mocks.listLocal.mockReturnValue([{ username: "client.employee" }]);
  });

  it("rejects missing authentication before resolving company data", async () => {
    mocks.getAuthToken.mockResolvedValue(null);
    const response = await GET(createRequest("1"));
    expect(response.status).toBe(401);
    expect(mocks.listLocal).not.toHaveBeenCalled();
  });

  it("rejects non-admin and invalid company ids", async () => {
    mocks.isAdmin.mockReturnValue(false);
    expect((await GET(createRequest("1"))).status).toBe(403);

    mocks.isAdmin.mockReturnValue(true);
    expect((await GET(createRequest("0"))).status).toBe(400);
    expect((await GET(createRequest("not-a-number"))).status).toBe(400);
  });

  it("pins the local lookup to the validated company id", async () => {
    const response = await GET(createRequest("7"));
    expect(mocks.listLocal).toHaveBeenCalledWith(7);
    await expect(response.json()).resolves.toEqual({
      data: [{ username: "client.employee" }],
    });
  });

  it("proxies the same validated company id in remote mode", async () => {
    mocks.getAuthToken.mockResolvedValue({
      id: "admin",
      dataScope: "REMOTE",
      role: "ADMIN",
    });
    mocks.authApiJson.mockResolvedValue(new Response(null, { status: 204 }));

    await GET(createRequest("7"));
    expect(mocks.authApiJson).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "GET",
        path: "/auth/impersonation/employees/7",
      }),
    );
  });
});

function createRequest(companyId: string) {
  return new NextRequest(
    `http://localhost/api/auth/impersonation/employees?companyId=${companyId}`,
  );
}
