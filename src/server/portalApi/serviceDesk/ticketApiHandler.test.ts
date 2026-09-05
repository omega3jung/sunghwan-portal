import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  ticket: {
    createTicket: vi.fn(),
    getTicketDetail: vi.fn(),
    getTicketListItems: vi.fn(),
    searchTicketListItems: vi.fn(),
    startTicketWork: vi.fn(),
    updateRequesterTicket: vi.fn(),
    requesterUpdateTicketRequestSchema: { safeParse: vi.fn() },
  },
  action: {
    executeTicketAction: vi.fn(),
    executeTicketApprovalAction: vi.fn(),
    getTicketActionByTicketIdAndNo: vi.fn(),
    getTicketActionsByTicketId: vi.fn(),
    softDeleteTicketAction: vi.fn(),
  },
  draft: {
    createTicketDraft: vi.fn(),
    discardTicketDraft: vi.fn(),
    getTicketDraft: vi.fn(),
    updateTicketDraft: vi.fn(),
  },
  getHistories: vi.fn(),
  work: {
    createWorkSession: vi.fn(),
    getWorkSessionsByTicketId: vi.fn(),
  },
  getProfile: vi.fn(),
}));

vi.mock("@/server/data/serviceDesk/ticket", () => mocks.ticket);
vi.mock("@/server/data/serviceDesk/ticketAction", () => mocks.action);
vi.mock("@/server/data/serviceDesk/ticketDraft", () => mocks.draft);
vi.mock("@/server/data/serviceDesk/ticketHistory", () => ({
  getTicketHistoriesByTicketId: mocks.getHistories,
}));
vi.mock("@/server/data/serviceDesk/workSession", () => mocks.work);
vi.mock("@/server/data/users", () => ({
  getUserProfileDtoByUsername: mocks.getProfile,
}));

import { handleTicketPortalApi } from "./ticketApiHandler";

const principal = {
  username: "effective.employee",
  role: "USER",
  userScope: "CLIENT",
};

describe("Ticket portal API orchestration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getProfile.mockResolvedValue(principal);
    mocks.ticket.getTicketDetail.mockResolvedValue({ id: "ticket-1" });
    mocks.action.getTicketActionsByTicketId.mockResolvedValue([]);
    mocks.getHistories.mockResolvedValue([]);
    mocks.ticket.startTicketWork.mockResolvedValue({ id: "ticket-1", status: "In Progress" });
    mocks.action.executeTicketAction.mockResolvedValue({ actionNo: 1 });
    mocks.draft.getTicketDraft.mockResolvedValue({ id: "draft-1" });
  });

  it("rejects a missing effective username before loading a principal", async () => {
    const response = await handleTicketPortalApi(createContext("/service-desk/tickets"));
    expect(response.status).toBe(401);
    expect(mocks.getProfile).not.toHaveBeenCalled();
  });

  it("rejects an unknown canonical server principal", async () => {
    mocks.getProfile.mockResolvedValue(null);
    const response = await handleTicketPortalApi(
      createContext("/service-desk/tickets", "GET", undefined, "unknown"),
    );
    expect(response.status).toBe(403);
  });

  it.each([
    ["actions", mocks.action.getTicketActionsByTicketId],
    ["histories", mocks.getHistories],
  ])("checks ticket visibility before reading %s", async (resource, loader) => {
    mocks.ticket.getTicketDetail.mockResolvedValue(null);
    const response = await handleTicketPortalApi(
      createContext(`/service-desk/tickets/ticket-1/${resource}`, "GET", undefined, "effective.employee"),
    );

    expect(response.status).toBe(404);
    expect(loader).not.toHaveBeenCalled();
  });

  it("derives command capabilities from the canonical profile", async () => {
    await handleTicketPortalApi(
      createContext(
        "/service-desk/tickets/ticket-1/command/comment",
        "POST",
        { id: "action", actionType: "COMMENT", content: "hello", files: [], images: [] },
        "effective.employee",
      ),
    );

    expect(mocks.action.executeTicketAction).toHaveBeenCalledWith(
      expect.objectContaining({
        ticketId: "ticket-1",
        action: "comment",
        currentUserName: "effective.employee",
        isAdmin: false,
        isInternal: false,
      }),
    );
  });

  it("binds draft access directly to the effective username", async () => {
    await handleTicketPortalApi(
      createContext("/service-desk/tickets/draft", "GET", undefined, "effective.employee"),
    );

    expect(mocks.draft.getTicketDraft).toHaveBeenCalledWith("effective.employee");
    expect(mocks.getProfile).not.toHaveBeenCalled();
  });

  it("routes start-work with the effective username", async () => {
    await handleTicketPortalApi(
      createContext(
        "/service-desk/tickets/ticket-1/command/start-work",
        "POST",
        {},
        "effective.employee",
      ),
    );

    expect(mocks.ticket.startTicketWork).toHaveBeenCalledWith(
      "ticket-1",
      "effective.employee",
    );
  });

  it("returns 404 for an invalid command path without entering an executor", async () => {
    const response = await handleTicketPortalApi(
      createContext(
        "/service-desk/tickets/ticket-1/command/not-a-command",
        "POST",
        {},
        "effective.employee",
      ),
    );

    expect(response.status).toBe(404);
    expect(mocks.action.executeTicketAction).not.toHaveBeenCalled();
  });
});

function createContext(
  path: string,
  method = "GET",
  body?: unknown,
  username?: string,
) {
  return {
    request: new NextRequest(`http://localhost${path}`),
    path,
    method,
    options: {
      path,
      errorMessage: "failed",
      method: method as "GET" | "POST",
      body,
      headers: username ? { "X-Current-Username": username } : undefined,
    },
  };
}
