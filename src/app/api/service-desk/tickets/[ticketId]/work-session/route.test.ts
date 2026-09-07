import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentEmployeeUserName: vi.fn(),
  isRemoteRequest: vi.fn(),
  portalApiJson: vi.fn(),
  getLocalAccess: vi.fn(),
  localGetTicket: vi.fn(),
  createLocalTicketWorkSession: vi.fn(),
  listLocalTicketWorkSessions: vi.fn(),
  mapList: vi.fn(),
  mapItem: vi.fn(),
}));

vi.mock("@/app/api/_adapters", () => ({
  getCurrentEmployeeUserName: mocks.getCurrentEmployeeUserName,
  isRemoteRequest: mocks.isRemoteRequest,
}));
vi.mock("@/app/api/_adapters/backend", () => ({ portalApiJson: mocks.portalApiJson }));
vi.mock("@/app/api/_adapters/localDemo/auth", () => ({
  getCurrentLocalTicketAccessContext: mocks.getLocalAccess,
}));
vi.mock("@/app/api/_adapters/localDemo/serviceDesk/ticket", () => ({
  localGetTicket: mocks.localGetTicket,
}));
vi.mock("@/app/api/_adapters/localDemo/serviceDesk/ticket/workSession", () => ({
  createLocalTicketWorkSession: mocks.createLocalTicketWorkSession,
  listLocalTicketWorkSessions: mocks.listLocalTicketWorkSessions,
}));
vi.mock("@/app/api/_adapters/serviceDesk", async (importOriginal) => {
  const actual = await importOriginal<
    typeof import("@/app/api/_adapters/serviceDesk")
  >();
  return {
    ...actual,
    resolveApiErrorMessage: (key: string) => key,
    toCurrentUsernameProxyHeaders: (username: string | null) =>
      username ? { "X-Current-Username": username } : undefined,
  };
});
vi.mock("@/feature/serviceDesk/ticketWorkSession/api", () => ({
  mapTicketWorkSessionListPayload: mocks.mapList,
  mapTicketWorkSessionPayload: mocks.mapItem,
}));

import { ApiError } from "@/app/api/_adapters/serviceDesk";

import { GET, POST } from "./route";

const access = {
  username: "worker",
  userScope: "INTERNAL" as const,
  tenantId: "1",
};
const payload = {
  startedAt: "2026-01-01T00:00:00.000Z",
  endedAt: "2026-01-01T01:00:00.000Z",
  description: "investigation",
};

describe("ticket work-session route orchestration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isRemoteRequest.mockResolvedValue(false);
    mocks.getCurrentEmployeeUserName.mockResolvedValue("worker");
    mocks.getLocalAccess.mockResolvedValue(access);
    mocks.localGetTicket.mockReturnValue({ id: "ticket-1" });
    mocks.listLocalTicketWorkSessions.mockReturnValue([{ id: "session-1" }]);
    mocks.createLocalTicketWorkSession.mockReturnValue({ id: "session-2" });
    mocks.portalApiJson.mockResolvedValue(new Response(null, { status: 200 }));
  });

  it("requires identity, LOCAL access, and ticket visibility for reads", async () => {
    mocks.getCurrentEmployeeUserName.mockResolvedValueOnce(null);
    expect((await GET(request("GET"), context())).status).toBe(401);

    mocks.getLocalAccess.mockResolvedValueOnce(null);
    expect((await GET(request("GET"), context())).status).toBe(403);

    mocks.localGetTicket.mockReturnValueOnce(null);
    expect((await GET(request("GET"), context())).status).toBe(404);
  });

  it("returns visible LOCAL work sessions", async () => {
    const response = await GET(request("GET"), context());

    expect(mocks.listLocalTicketWorkSessions).toHaveBeenCalledWith("ticket-1");
    await expect(response.json()).resolves.toEqual([{ id: "session-1" }]);
  });

  it("forwards REMOTE reads with effective identity and mapping", async () => {
    mocks.isRemoteRequest.mockResolvedValue(true);

    await GET(request("GET"), context());

    expect(mocks.portalApiJson).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        path: "/service-desk/tickets/ticket-1/work-session",
        headers: { "X-Current-Username": "worker" },
        mapData: mocks.mapList,
      }),
    );
  });

  it("passes the canonical LOCAL actor and scope to the work-session service", async () => {
    const response = await POST(request("POST", payload), context());

    expect(response.status).toBe(201);
    expect(mocks.createLocalTicketWorkSession).toHaveBeenCalledWith({
      ticketId: "ticket-1",
      currentUserName: "worker",
      isInternal: true,
      payload,
    });
  });

  it("maps LOCAL authentication, access, visibility, and service failures", async () => {
    mocks.getCurrentEmployeeUserName.mockResolvedValueOnce(null);
    expect((await POST(request("POST", payload), context())).status).toBe(401);

    mocks.getLocalAccess.mockResolvedValueOnce(null);
    expect((await POST(request("POST", payload), context())).status).toBe(403);

    mocks.localGetTicket.mockReturnValueOnce(null);
    expect((await POST(request("POST", payload), context())).status).toBe(404);

    mocks.createLocalTicketWorkSession.mockImplementationOnce(() => {
      throw new ApiError("workerOnly", 403);
    });
    expect((await POST(request("POST", payload), context())).status).toBe(403);
  });

  it("forwards REMOTE writes and preserves upstream status", async () => {
    mocks.isRemoteRequest.mockResolvedValue(true);
    mocks.portalApiJson.mockResolvedValue(new Response(null, { status: 202 }));

    const response = await POST(request("POST", payload), context());

    expect(response.status).toBe(202);
    expect(mocks.portalApiJson).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        method: "POST",
        path: "/service-desk/tickets/ticket-1/work-session",
        headers: { "X-Current-Username": "worker" },
        body: payload,
        mapData: mocks.mapItem,
      }),
    );
  });
});

function request(method: "GET" | "POST", body?: object) {
  return new NextRequest(
    "http://localhost/api/service-desk/tickets/ticket-1/work-session",
    body === undefined
      ? { method }
      : {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
  );
}

function context() {
  return { params: Promise.resolve({ ticketId: "ticket-1" }) };
}
