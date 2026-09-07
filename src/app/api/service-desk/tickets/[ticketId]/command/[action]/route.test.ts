import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentEmployeeUserName: vi.fn(),
  isRemoteRequest: vi.fn(),
  portalApiJson: vi.fn(),
  getLocalAccess: vi.fn(),
  getLocalRole: vi.fn(),
  localGetTicket: vi.fn(),
  localPost: vi.fn(),
}));

vi.mock("@/app/api/_adapters", () => ({
  getCurrentEmployeeUserName: mocks.getCurrentEmployeeUserName,
  isRemoteRequest: mocks.isRemoteRequest,
}));
vi.mock("@/app/api/_adapters/backend", () => ({ portalApiJson: mocks.portalApiJson }));
vi.mock("@/app/api/_adapters/localDemo/auth", () => ({
  getCurrentLocalTicketAccessContext: mocks.getLocalAccess,
  getCurrentLocalUserRole: mocks.getLocalRole,
}));
vi.mock("@/app/api/_adapters/localDemo/serviceDesk/ticket", () => ({
  localGetTicket: mocks.localGetTicket,
}));
vi.mock("@/app/api/_adapters/localDemo/serviceDesk/ticket/command", () => ({
  localPost: mocks.localPost,
}));
vi.mock("@/app/api/_adapters/serviceDesk", () => ({
  resolveApiErrorMessage: (key: string) => key,
  toCurrentUsernameProxyHeaders: (username: string) => ({
    "X-Current-Username": username,
  }),
}));

import { POST } from "./route";

const access = {
  username: "effective.employee",
  userScope: "INTERNAL" as const,
  tenantId: "tenant-1",
};

describe("Ticket command route orchestration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCurrentEmployeeUserName.mockResolvedValue("effective.employee");
    mocks.isRemoteRequest.mockResolvedValue(false);
    mocks.getLocalAccess.mockResolvedValue(access);
    mocks.getLocalRole.mockResolvedValue("ADMIN");
    mocks.localGetTicket.mockReturnValue({ id: "ticket-1" });
    mocks.localPost.mockResolvedValue(new Response(null, { status: 201 }));
    mocks.portalApiJson.mockResolvedValue(new Response(null, { status: 201 }));
  });

  it("rejects an invalid action path before resolving runtime context", async () => {
    const response = await POST(createRequest({}), createContext("unknown"));
    expect(response.status).toBe(404);
    expect(mocks.isRemoteRequest).not.toHaveBeenCalled();
  });

  it("rejects a missing effective employee identity", async () => {
    mocks.getCurrentEmployeeUserName.mockResolvedValue(null);
    const response = await POST(createRequest({ content: "note" }), createContext("comment"));
    expect(response.status).toBe(401);
    expect(mocks.localPost).not.toHaveBeenCalled();
  });

  it.each([
    ["missing target", { content: "merge" }],
    ["self merge", { content: "merge", targetTicketId: "ticket-1" }],
  ])("rejects merge with %s", async (_label, body) => {
    const response = await POST(createRequest(body), createContext("merge"));
    expect(response.status).toBe(400);
    expect(mocks.localPost).not.toHaveBeenCalled();
  });

  it("conceals a merge target that is outside local ticket visibility", async () => {
    mocks.localGetTicket.mockImplementation(({ id }: { id: string }) =>
      id === "ticket-1" ? { id } : null,
    );
    const response = await POST(
      createRequest({ content: "merge", targetTicketId: "hidden-ticket" }),
      createContext("merge"),
    );
    expect(response.status).toBe(404);
    expect(mocks.localPost).not.toHaveBeenCalled();
  });

  it("passes effective identity and canonical local capability to the command adapter", async () => {
    await POST(
      createRequest({ id: "draft", actionType: "COMMENT", content: "hello" }),
      createContext("comment"),
    );

    expect(mocks.localPost).toHaveBeenCalledWith({
      ticketId: "ticket-1",
      employeeUserName: "effective.employee",
      action: "comment",
      isAdmin: true,
      isInternal: true,
      content: {
        id: "draft",
        actionType: "COMMENT",
        content: "hello",
        files: [],
        images: [],
      },
    });
  });

  it("normalizes approval commands to the same text-only remote contract", async () => {
    mocks.isRemoteRequest.mockResolvedValue(true);
    await POST(
      createRequest({
        id: "client-id",
        actionType: "COMMENT",
        content: "approved",
        files: [{ name: "unsafe.txt" }],
        images: [{ url: "data:image/png;base64,AAAA" }],
      }),
      createContext("approve"),
    );

    expect(mocks.portalApiJson).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        method: "POST",
        path: "/service-desk/tickets/ticket-1/command/approve",
        headers: { "X-Current-Username": "effective.employee" },
        body: { content: "approved" },
      }),
    );
  });
});

function createRequest(body: object) {
  return new NextRequest("http://localhost/api/service-desk/tickets/ticket-1/command/comment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function createContext(action: string) {
  return { params: Promise.resolve({ ticketId: "ticket-1", action }) };
}
