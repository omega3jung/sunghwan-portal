import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => ({ username: "requester", tenantId: "1" }));
vi.mock("@/app/api/_adapters", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/app/api/_adapters")>(),
  isRemoteRequest: async () => false,
  getCurrentEmployeeUserName: async () => auth.username,
}));
vi.mock("@/app/api/_adapters/localDemo/auth", () => ({
  getCurrentLocalUserRole: async () => "USER",
  getCurrentLocalTicketAccessContext: async () => ({ username: auth.username, tenantId: auth.tenantId, userScope: "INTERNAL" }),
}));

import { localGetTicket } from "@/app/api/_adapters/localDemo/serviceDesk/ticket/get";
import { localListTickets } from "@/app/api/_adapters/localDemo/serviceDesk/ticket/list";
import { localSearchTickets } from "@/app/api/_adapters/localDemo/serviceDesk/ticket/search";
import { getLocalDemoActions, getLocalDemoHistories, getLocalDemoTickets, resetLocalDemoTicketState } from "@/app/api/_adapters/localDemo/serviceDesk/ticket/state";

import { GET as getAction, PATCH as deleteAction } from "./[ticketId]/actions/[actionNo]/route";
import { GET as getActions } from "./[ticketId]/actions/route";
import { POST as command } from "./[ticketId]/command/[action]/route";
import { GET as getHistories } from "./[ticketId]/histories/route";

const ticketId = "note-access-test";
const context = () => ({ params: Promise.resolve({ ticketId }) });
const actionContext = (actionNo = "1") => ({ params: Promise.resolve({ ticketId, actionNo }) });
function request(method = "GET", body?: unknown) {
  return new NextRequest("http://localhost/api/service-desk/tickets/note-access-test", {
    method, ...(body ? { body: JSON.stringify(body), headers: { "Content-Type": "application/json" } } : {}),
  });
}

describe("LOCAL NOTE HTTP authorization with real participation and persistence", () => {
  beforeEach(() => {
    resetLocalDemoTicketState();
    auth.username = "requester";
    const ticket = { ...getLocalDemoTickets()[0], id: ticketId, active: true, status: "Working" as const,
      requester_username: "requester", assignee_usernames: ["requester", "worker"], scope: "INTERNAL" as const };
    auth.tenantId = String(ticket.tenant_id);
    getLocalDemoTickets().splice(0, getLocalDemoTickets().length, ticket);
    const action = { ...getLocalDemoActions()[0], ticket_id: ticketId, active: true, owner_username: "requester", content: "internal secret" };
    getLocalDemoActions().splice(0, getLocalDemoActions().length,
      { ...action, action_no: 1, action_type: "NOTE" },
      { ...action, action_no: 2, action_type: "COMMENT", content: "shared" },
      { ...action, action_no: 3, action_type: "NOTE", active: false },
    );
    const history = { ...getLocalDemoHistories()[0], ticket_id: ticketId, metadata: { note: "internal secret" } };
    getLocalDemoHistories().splice(0, getLocalDemoHistories().length,
      { ...history, history_no: 1, type: "NOTE", event: "NOTE_CREATED", action_no: 1 },
      { ...history, history_no: 2, type: "NOTE", event: "NOTE_UPDATED", action_no: 1 },
      { ...history, history_no: 3, type: "NOTE", event: "NOTE_DELETED", action_no: 3 },
      { ...history, history_no: 4, type: "TICKET", event: "TICKET_UPDATED", action_no: 3 },
      { ...history, history_no: 5, type: "COMMENT", event: "COMMENT_CREATED", action_no: 2, metadata: {} },
    );
  });
  afterEach(resetLocalDemoTicketState);

  it("hides NOTE list/detail/history including deleted action links from a requester/current assignee", async () => {
    const before = structuredClone(getLocalDemoHistories());
    const actions = await (await getActions(request(), context())).json();
    expect(actions.total).toBe(1);
    expect(actions.items[0].actionType).toBe("COMMENT");
    expect((await getAction(request(), actionContext())).status).toBe(404);
    const histories = await (await getHistories(request(), context())).json();
    expect(histories.total).toBe(1);
    expect(histories.items[0].event).toBe("COMMENT_CREATED");
    expect(JSON.stringify(histories)).not.toContain("internal secret");
    expect(getLocalDemoHistories()).toEqual(before);
  });

  it("does not disclose NOTE timestamps or authors through Ticket detail/list/search summaries", () => {
    const ticket = getLocalDemoTickets()[0];
    Object.assign(ticket, {
      last_comment_at: "2099-01-01T00:00:00Z", last_commenter_email: "internal-note@example.com",
      last_user_activity_at: "2099-01-01T00:00:00Z", last_user_activity_email: "internal-note@example.com",
    });
    const actions = getLocalDemoActions();
    actions[0].created_at = "2099-01-01T00:00:00Z";
    actions[1].created_at = "2026-01-01T00:00:00Z";
    const access = { username: "requester", tenantId: auth.tenantId, userScope: "INTERNAL" as const };
    const details = [
      localGetTicket({ access, id: ticketId }),
      localListTickets({ access, searchParams: new URLSearchParams() }).items[0],
      localSearchTickets({ access, request: { page: 1, pageSize: 20 } }).items[0],
    ];
    for (const detail of details) {
      expect(detail).toMatchObject({ lastCommentAt: actions[1].created_at, lastUserActivityAt: actions[1].created_at });
      expect(JSON.stringify(detail)).not.toContain("internal-note@example.com");
    }
    expect(ticket.last_commenter_email).toBe("internal-note@example.com"); // Read projection only.
  });

  it("denies requester NOTE create/delete even with forged capability fields", async () => {
    const response = await command(request("POST", { actionType: "NOTE", content: "internal", isAdmin: true, canViewNote: true, isApprovalParticipant: true }),
      { params: Promise.resolve({ ticketId, action: "note" }) });
    expect(response.status).toBe(403);
    expect((await deleteAction(request("PATCH", { active: false }), actionContext())).status).toBe(403);
    expect(getLocalDemoActions()).toHaveLength(3);
    expect(getLocalDemoActions()[0].active).toBe(true);
    expect(getLocalDemoHistories()).toHaveLength(5);
  });

  it("allows a current assignee NOTE reads and creation but never another author's deletion", async () => {
    auth.username = "worker";
    expect((await getAction(request(), actionContext())).status).toBe(200);
    expect((await (await getActions(request(), context())).json()).total).toBe(2);
    expect((await (await getHistories(request(), context())).json()).total).toBe(5);
    expect((await deleteAction(request("PATCH", { active: false }), actionContext())).status).toBe(403);
    const response = await command(request("POST", { actionType: "NOTE", content: "Internal work", files: [], images: [] }),
      { params: Promise.resolve({ ticketId, action: "note" }) });
    expect(response.status).toBe(201);
    const created = getLocalDemoActions().at(-1)!;
    expect((await deleteAction(request("PATCH", { active: false }), actionContext(String(created.action_no)))).status).toBe(200);
    expect(getLocalDemoHistories().at(-1)?.event).toBe("NOTE_DELETED");
  });

  it("leaves requester COMMENT create/read/delete unchanged", async () => {
    expect((await getAction(request(), actionContext("2"))).status).toBe(200);
    const response = await command(request("POST", { actionType: "COMMENT", content: "Shared response", files: [], images: [] }),
      { params: Promise.resolve({ ticketId, action: "comment" }) });
    expect(response.status).toBe(201);
    expect((await deleteAction(request("PATCH", { active: false }), actionContext("2"))).status).toBe(200);
  });

  it("keeps existing NOTE create/delete status rules", async () => {
    auth.username = "worker";
    getLocalDemoTickets()[0].status = "Closed";
    expect((await getAction(request(), actionContext())).status).toBe(200);
    const response = await command(request("POST", { actionType: "NOTE", content: "Internal work", files: [], images: [] }),
      { params: Promise.resolve({ ticketId, action: "note" }) });
    expect(response.status).toBe(409);
    expect((await deleteAction(request("PATCH", { active: false }), actionContext())).status).toBe(409);
  });
});
