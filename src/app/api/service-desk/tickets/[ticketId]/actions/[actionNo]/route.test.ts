import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentEmployeeUserName: vi.fn(),
  isRemoteRequest: vi.fn(),
  portalApiJson: vi.fn(),
  getLocalAccess: vi.fn(),
  localGetTicket: vi.fn(),
  getMaxHistoryNo: vi.fn(),
  getTicketContext: vi.fn(),
  actions: [] as Array<Record<string, unknown>>,
  histories: [] as Array<Record<string, unknown>>,
  camelMapper: vi.fn(),
  mapAction: vi.fn(),
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
vi.mock("@/app/api/_adapters/localDemo/serviceDesk/ticket/command/utils", () => ({
  getMaxHistoryNo: mocks.getMaxHistoryNo,
  getTicketContext: mocks.getTicketContext,
}));
vi.mock("@/app/api/_adapters/localDemo/serviceDesk/ticket/state", () => ({
  getLocalDemoActions: () => mocks.actions,
  getLocalDemoHistories: () => mocks.histories,
}));
vi.mock("@/lib/application/contracts/serviceDesk", () => ({
  camelTicketActionMapper: mocks.camelMapper,
  mapTicketActionPayload: mocks.mapAction,
}));

import { GET, PATCH } from "./route";

const access = {
  username: "writer",
  userScope: "INTERNAL" as const,
  tenantId: "1",
};
const action = (overrides: Record<string, unknown> = {}) => ({
  ticket_id: "ticket-1",
  action_no: 2,
  action_type: "COMMENT",
  owner_username: "writer",
  active: true,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

describe("ticket action detail route orchestration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.actions.splice(0, mocks.actions.length, action());
    mocks.histories.splice(0);
    mocks.isRemoteRequest.mockResolvedValue(false);
    mocks.getCurrentEmployeeUserName.mockResolvedValue("writer");
    mocks.getLocalAccess.mockResolvedValue(access);
    mocks.localGetTicket.mockReturnValue({ id: "ticket-1" });
    mocks.getTicketContext.mockReturnValue({ ticket: { status: "Working" } });
    mocks.getMaxHistoryNo.mockReturnValue(3);
    mocks.camelMapper.mockImplementation((items) =>
      items.map((item: Record<string, unknown>) => ({
        actionNo: item.action_no,
        actionType: item.action_type,
        active: item.active,
      })),
    );
    mocks.portalApiJson.mockResolvedValue(new Response(null, { status: 200 }));
  });

  it("requires LOCAL ticket visibility before returning an active action", async () => {
    const response = await GET(request("GET"), context());
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      actionNo: 2,
      actionType: "COMMENT",
      active: true,
    });

    mocks.getLocalAccess.mockResolvedValueOnce(null);
    expect((await GET(request("GET"), context())).status).toBe(403);
    mocks.localGetTicket.mockReturnValueOnce(null);
    expect((await GET(request("GET"), context())).status).toBe(404);
  });

  it("does not return missing, inactive, or mismatched LOCAL actions", async () => {
    expect((await GET(request("GET"), context("ticket-1", "99"))).status).toBe(404);
    mocks.actions[0].active = false;
    expect((await GET(request("GET"), context())).status).toBe(404);
    mocks.actions[0] = action({ ticket_id: "other" });
    expect((await GET(request("GET"), context())).status).toBe(404);
  });

  it("forwards REMOTE reads through the action payload mapper", async () => {
    mocks.isRemoteRequest.mockResolvedValue(true);

    await GET(request("GET"), context());

    expect(mocks.portalApiJson).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        path: "/service-desk/tickets/ticket-1/actions/2",
        mapData: mocks.mapAction,
      }),
    );
  });

  it("requires an authenticated LOCAL writer and an explicit soft-delete body", async () => {
    mocks.getCurrentEmployeeUserName.mockResolvedValueOnce(null);
    expect((await PATCH(request("PATCH", { active: false }), context())).status).toBe(401);

    expect((await PATCH(request("PATCH", { active: true }), context())).status).toBe(400);
    expect(mocks.actions[0].active).toBe(true);
  });

  it.each([
    ["Draft", 409],
    ["Closed", 409],
  ])("blocks deletion while the ticket is %s", async (status, expectedStatus) => {
    mocks.getTicketContext.mockReturnValue({ ticket: { status } });

    const response = await PATCH(request("PATCH", { active: false }), context());

    expect(response.status).toBe(expectedStatus);
    expect(mocks.actions[0].active).toBe(true);
  });

  it("allows only COMMENT or NOTE authors to delete their action", async () => {
    mocks.actions[0] = action({ action_type: "ASSIGN" });
    expect((await PATCH(request("PATCH", { active: false }), context())).status).toBe(403);

    mocks.actions[0] = action({ owner_username: "other" });
    expect((await PATCH(request("PATCH", { active: false }), context())).status).toBe(403);
  });

  it("soft-deletes an authored note and appends immutable audit history", async () => {
    mocks.actions[0] = action({ action_type: "NOTE" });

    const response = await PATCH(request("PATCH", { active: false }), context());

    expect(response.status).toBe(200);
    expect(mocks.actions[0]).toEqual(expect.objectContaining({ active: false }));
    expect(mocks.histories).toEqual([
      expect.objectContaining({
        ticket_id: "ticket-1",
        history_no: 3,
        type: "NOTE",
        event: "NOTE_DELETED",
        actor_username: "writer",
        action_no: 2,
        from_value: { active: true },
        to_value: { active: false },
      }),
    ]);
  });

  it("forwards REMOTE PATCH body and preserves upstream status", async () => {
    mocks.isRemoteRequest.mockResolvedValue(true);
    mocks.portalApiJson.mockResolvedValue(new Response(null, { status: 202 }));

    const response = await PATCH(request("PATCH", { active: false }), context());

    expect(response.status).toBe(202);
    expect(mocks.portalApiJson).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        method: "PATCH",
        path: "/service-desk/tickets/ticket-1/actions/2",
        body: { active: false },
      }),
    );
  });
});

function request(method: "GET" | "PATCH", body?: object) {
  return new NextRequest(
    "http://localhost/api/service-desk/tickets/ticket-1/actions/2",
    body === undefined
      ? { method }
      : {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
  );
}

function context(ticketId = "ticket-1", actionNo = "2") {
  return { params: Promise.resolve({ ticketId, actionNo }) };
}
