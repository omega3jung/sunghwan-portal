import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentEmployeeUserName: vi.fn(),
  isRemoteRequest: vi.fn(),
  toApiErrorResponse: vi.fn(),
  portalApiJson: vi.fn(),
  getLocalAccess: vi.fn(),
  localDeleteTicket: vi.fn(),
  localGetTicket: vi.fn(),
  localRequesterUpdateTicket: vi.fn(),
  withLocalTicketWorkerHistory: vi.fn(),
  withDerivedTicketOwnership: vi.fn(),
  mapDetail: vi.fn(),
}));

vi.mock("@/app/api/_adapters", () => ({
  getCurrentEmployeeUserName: mocks.getCurrentEmployeeUserName,
  isRemoteRequest: mocks.isRemoteRequest,
  toApiErrorResponse: mocks.toApiErrorResponse,
}));
vi.mock("@/app/api/_adapters/backend", () => ({ portalApiJson: mocks.portalApiJson }));
vi.mock("@/app/api/_adapters/localDemo/auth", () => ({
  getCurrentLocalTicketAccessContext: mocks.getLocalAccess,
}));
vi.mock("@/app/api/_adapters/localDemo/serviceDesk/ticket", () => ({
  localDeleteTicket: mocks.localDeleteTicket,
  localGetTicket: mocks.localGetTicket,
  localRequesterUpdateTicket: mocks.localRequesterUpdateTicket,
  withLocalTicketWorkerHistory: mocks.withLocalTicketWorkerHistory,
}));
vi.mock("@/app/api/_adapters/serviceDesk", () => ({
  resolveApiErrorMessage: (key: string) => key,
  toCurrentUsernameProxyHeaders: (username: string | null) =>
    username ? { "X-Current-Username": username } : undefined,
  withDerivedTicketOwnership: mocks.withDerivedTicketOwnership,
}));
vi.mock("@/lib/application/contracts/serviceDesk", async (importOriginal) => {
  const actual = await importOriginal<
    typeof import("@/lib/application/contracts/serviceDesk")
  >();
  return { ...actual, mapTicketDetailPayload: mocks.mapDetail };
});

import { DELETE, GET, PUT } from "./route";

const access = {
  username: "worker",
  userScope: "INTERNAL" as const,
  tenantId: "1",
};
const validUpdate = {
  categoryId: "10",
  subject: "  Updated subject  ",
  content: "  Updated content  ",
  dueAt: "2026-02-01T00:00:00.000Z",
  email: { to: ["a@example.com"], cc: [], bcc: [] },
  files: [],
  images: [],
};

describe("ticket detail route orchestration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isRemoteRequest.mockResolvedValue(false);
    mocks.getCurrentEmployeeUserName.mockResolvedValue("worker");
    mocks.getLocalAccess.mockResolvedValue(access);
    mocks.localGetTicket.mockReturnValue({ id: "ticket-1" });
    mocks.localRequesterUpdateTicket.mockResolvedValue({ id: "ticket-1" });
    mocks.withDerivedTicketOwnership.mockImplementation((ticket) => ({
      ...ticket,
      owner: true,
    }));
    mocks.withLocalTicketWorkerHistory.mockImplementation((ticket) => ({
      ...ticket,
      workerHistory: [],
    }));
    mocks.portalApiJson.mockResolvedValue(new Response(null, { status: 200 }));
    mocks.toApiErrorResponse.mockImplementation((error: { status?: number }) =>
      Response.json({ message: "mapped" }, { status: error.status ?? 500 }),
    );
  });

  it("applies LOCAL identity, access, ownership, and worker-history projection", async () => {
    const response = await GET(request("GET"), context());

    expect(mocks.localGetTicket).toHaveBeenCalledWith({ access, id: "ticket-1" });
    expect(mocks.withDerivedTicketOwnership).toHaveBeenCalledWith(
      { id: "ticket-1" },
      "worker",
    );
    expect(mocks.withLocalTicketWorkerHistory).toHaveBeenCalledWith(
      expect.objectContaining({ owner: true }),
      { isInternal: true, currentUserName: "worker" },
    );
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ id: "ticket-1", owner: true, workerHistory: [] }),
    );
  });

  it("rejects missing LOCAL identity, access, and visible ticket", async () => {
    mocks.getCurrentEmployeeUserName.mockResolvedValueOnce(null);
    expect((await GET(request("GET"), context())).status).toBe(401);

    mocks.getLocalAccess.mockResolvedValueOnce(null);
    expect((await GET(request("GET"), context())).status).toBe(403);

    mocks.localGetTicket.mockReturnValueOnce(null);
    expect((await GET(request("GET"), context())).status).toBe(404);
  });

  it("forwards REMOTE detail reads with effective identity and mapping", async () => {
    mocks.isRemoteRequest.mockResolvedValue(true);

    await GET(request("GET"), context("remote ticket"));

    expect(mocks.portalApiJson).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        path: "/service-desk/tickets/remote ticket",
        headers: { "X-Current-Username": "worker" },
        mapData: mocks.mapDetail,
      }),
    );
  });

  it("rejects malformed update bodies before invoking an adapter", async () => {
    const response = await PUT(request("PUT", { subject: "missing fields" }), context());

    expect(response.status).toBe(400);
    expect(mocks.localRequesterUpdateTicket).not.toHaveBeenCalled();
    expect(mocks.portalApiJson).not.toHaveBeenCalled();
  });

  it("passes the canonical LOCAL requester update context and normalized body", async () => {
    await PUT(request("PUT", validUpdate), context());

    expect(mocks.localRequesterUpdateTicket).toHaveBeenCalledWith({
      isInternal: true,
      access,
      ticketId: "ticket-1",
      requesterUsername: "worker",
      input: { ...validUpdate, subject: "Updated subject", content: "Updated content" },
    });
  });

  it("preserves LOCAL service errors and REMOTE update transport options", async () => {
    mocks.localRequesterUpdateTicket.mockRejectedValue(
      Object.assign(new Error("requester only"), { status: 403 }),
    );
    expect((await PUT(request("PUT", validUpdate), context())).status).toBe(403);

    mocks.isRemoteRequest.mockResolvedValue(true);
    await PUT(request("PUT", validUpdate), context());
    expect(mocks.portalApiJson).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({
        method: "PUT",
        path: "/service-desk/tickets/ticket-1",
        headers: { "X-Current-Username": "worker" },
        body: expect.objectContaining({ subject: "Updated subject" }),
      }),
    );
  });

  it("deletes a visible LOCAL ticket and returns 204", async () => {
    const response = await DELETE(request("DELETE"), context());

    expect(response.status).toBe(204);
    expect(mocks.localDeleteTicket).toHaveBeenCalledWith({ access, ticketId: "ticket-1" });
  });

  it("forwards REMOTE DELETE and preserves its status", async () => {
    mocks.isRemoteRequest.mockResolvedValue(true);
    mocks.portalApiJson.mockResolvedValue(new Response(null, { status: 202 }));

    const response = await DELETE(request("DELETE"), context());

    expect(response.status).toBe(202);
    expect(mocks.portalApiJson).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        method: "DELETE",
        path: "/service-desk/tickets/ticket-1",
        headers: { "X-Current-Username": "worker" },
      }),
    );
  });
});

function request(method: "GET" | "PUT" | "DELETE", body?: object) {
  return new NextRequest("http://localhost/api/service-desk/tickets/ticket-1", {
    method,
    ...(body === undefined
      ? {}
      : {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }),
  });
}

function context(ticketId = "ticket-1") {
  return { params: Promise.resolve({ ticketId }) };
}
