import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentEmployeeUserName: vi.fn(),
  isRemoteRequest: vi.fn(),
  toApiErrorResponse: vi.fn(),
  portalApiJson: vi.fn(),
  getLocalAccess: vi.fn(),
  localSearchTickets: vi.fn(),
  toSummary: vi.fn(),
  projectOwnership: vi.fn(),
  mapList: vi.fn(),
}));

vi.mock("@/app/api/_adapters", () => ({
  getCurrentEmployeeUserName: mocks.getCurrentEmployeeUserName,
  isRemoteRequest: mocks.isRemoteRequest,
  toApiErrorResponse: mocks.toApiErrorResponse,
}));
vi.mock("@/app/api/_adapters/backend", () => ({
  portalApiJson: mocks.portalApiJson,
}));
vi.mock("@/app/api/_adapters/localDemo/auth", () => ({
  getCurrentLocalTicketAccessContext: mocks.getLocalAccess,
}));
vi.mock("@/app/api/_adapters/localDemo/serviceDesk/ticket", () => ({
  localSearchTickets: mocks.localSearchTickets,
}));
vi.mock(
  "@/app/api/_adapters/localDemo/serviceDesk/ticket/ticketResourceMapper",
  () => ({ toTicketMockSummaryResource: mocks.toSummary }),
);
vi.mock("@/app/api/_adapters/serviceDesk", () => ({
  resolveApiErrorMessage: (key: string) => key,
  toCurrentUsernameProxyHeaders: (username: string | null) =>
    username ? { "X-Current-Username": username.trim() } : undefined,
  withDerivedTicketOwnershipList: mocks.projectOwnership,
}));
vi.mock("@/lib/application/contracts/serviceDesk", () => ({
  mapTicketSummaryListPayload: mocks.mapList,
}));

import { GET, POST } from "./route";

const access = {
  username: "worker",
  userScope: "INTERNAL" as const,
  tenantId: "1",
};

describe("ticket search route orchestration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isRemoteRequest.mockResolvedValue(false);
    mocks.getCurrentEmployeeUserName.mockResolvedValue("worker");
    mocks.getLocalAccess.mockResolvedValue(access);
    mocks.localSearchTickets.mockReturnValue({
      items: [{ id: "raw-ticket" }],
      facets: { status: [] },
      totalCount: 1,
      page: 1,
      pageSize: 10,
    });
    mocks.toSummary.mockImplementation((item) => ({ ...item, mapped: true }));
    mocks.projectOwnership.mockImplementation((items) =>
      items.map((item: object) => ({ ...item, owner: true })),
    );
    mocks.portalApiJson.mockResolvedValue(
      new Response(null, { status: 200 }),
    );
    mocks.toApiErrorResponse.mockImplementation(
      () => Response.json({ message: "mapped error" }, { status: 500 }),
    );
  });

  it.each([
    ["invalid filter", "?filter=%7Bbroken"],
    ["invalid sort field", "?sortField=unknown&sortDirection=asc"],
    ["incomplete sort", "?sortField=status"],
    ["malformed legacy sort", "?sort=%7Bbroken"],
  ])("returns 400 for %s", async (_label, query) => {
    const response = await GET(request("GET", query));

    expect(response.status).toBe(400);
    expect(mocks.isRemoteRequest).not.toHaveBeenCalled();
  });

  it("returns 400 for malformed POST JSON", async () => {
    const response = await POST(
      new NextRequest("http://localhost/api/service-desk/tickets/search", {
        method: "POST",
        body: "{broken",
        headers: { "Content-Type": "application/json" },
      }),
    );

    expect(response.status).toBe(400);
    expect(mocks.isRemoteRequest).not.toHaveBeenCalled();
  });

  it("rejects missing LOCAL identity and missing LOCAL access", async () => {
    mocks.getCurrentEmployeeUserName.mockResolvedValueOnce(null);
    expect((await GET(request("GET"))).status).toBe(401);

    mocks.getLocalAccess.mockResolvedValueOnce(null);
    expect((await GET(request("GET"))).status).toBe(403);
    expect(mocks.localSearchTickets).not.toHaveBeenCalled();
  });

  it("normalizes a LOCAL query, maps resources, and projects current-user ownership", async () => {
    const filter = encodeURIComponent(
      JSON.stringify({ rules: [{ field: "status", operator: "=", value: "Working" }] }),
    );
    const response = await GET(
      request(
        "GET",
        `?filter=${filter}&sortField=updatedAt&sortDirection=desc&page=2&pageSize=25`,
      ),
    );

    expect(mocks.localSearchTickets).toHaveBeenCalledWith({
      access,
      request: {
        filter: { rules: [{ field: "status", operator: "=", value: "Working" }] },
        sortField: "updatedAt",
        sortDirection: "desc",
        page: 2,
        pageSize: 25,
      },
    });
    expect(mocks.projectOwnership).toHaveBeenCalledWith(
      [{ id: "raw-ticket", mapped: true }],
      "worker",
    );
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        items: [expect.objectContaining({ owner: true })],
        totalCount: 1,
      }),
    );
  });

  it("forwards normalized GET query and effective username to REMOTE", async () => {
    mocks.isRemoteRequest.mockResolvedValue(true);

    const response = await GET(
      request("GET", "?sortField=status&sortDirection=asc&page=3&pageSize=5"),
    );

    expect(response.status).toBe(200);
    expect(mocks.portalApiJson).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        method: "GET",
        path: "/service-desk/tickets/search",
        headers: { "X-Current-Username": "worker" },
        query: expect.any(URLSearchParams),
        mapData: mocks.mapList,
      }),
    );
    const forwarded = mocks.portalApiJson.mock.calls[0][1].query as URLSearchParams;
    expect(forwarded.get("sortField")).toBe("status");
    expect(forwarded.get("sortDirection")).toBe("asc");
    expect(forwarded.get("page")).toBe("3");
  });

  it("converts POST sort fields to the legacy REMOTE body and preserves upstream status", async () => {
    mocks.isRemoteRequest.mockResolvedValue(true);
    mocks.portalApiJson.mockResolvedValue(new Response(null, { status: 206 }));

    const response = await POST(
      request("POST", "", {
        sortField: "priority",
        sortDirection: "desc",
        page: 2,
        pageSize: 20,
      }),
    );

    expect(response.status).toBe(206);
    expect(mocks.portalApiJson).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        method: "POST",
        body: {
          filter: undefined,
          sort: { field: "priority", direction: "desc" },
          page: 2,
          pageSize: 20,
        },
      }),
    );
  });
});

function request(method: "GET" | "POST", query = "", body?: object) {
  return new NextRequest(
    `http://localhost/api/service-desk/tickets/search${query}`,
    body === undefined
      ? { method }
      : {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
  );
}
