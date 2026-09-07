import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
  TicketActionCommandRequest,
  TicketGeneralActionPath,
} from "@/lib/application/contracts/serviceDesk";

import type { ServiceDeskTicketViewRow } from "../ticket/ticketRow";

const tickets = vi.hoisted(() => ({
  findApprovalStepAssigneeUsernames: vi.fn(),
  findCategoryAssignmentUsernames: vi.fn(),
  findNextApprovalStepId: vi.fn(),
}));
const updates = vi.hoisted(() => ({
  updateTicketAssigneesById: vi.fn(),
  updateTicketPlanningById: vi.fn(),
  updateTicketStatusById: vi.fn(),
  updateTicketMergeStateById: vi.fn(),
  updateTicketCloseStateById: vi.fn(),
  updateTicketInitialRoutingById: vi.fn(),
}));
const history = vi.hoisted(() => ({
  createHistoryOfApprovalRequested: vi.fn(),
  createHistoryOfAssignmentChange: vi.fn(),
  createHistoryOfAssignmentResolvedByRule: vi.fn(),
  createHistoryOfPlanningChange: vi.fn(),
  createHistoryOfStatusChange: vi.fn(),
  createHistoryOfTicketCanceled: vi.fn(),
  createHistoryOfTicketMerged: vi.fn(),
  createHistoryOfTicketRejected: vi.fn(),
}));
const historyService = vi.hoisted(() => ({ createTicketHistory: vi.fn() }));
const workSessions = vi.hoisted(() => ({
  finishRunningWorkSessionsByTicketId: vi.fn(),
}));

vi.mock("../ticket/ticketRepository", () => tickets);
vi.mock("../ticket/ticketUpdateRepository", () => updates);
vi.mock("../ticketHistory/ticketHistoryEventService", () => history);
vi.mock("../ticketHistory/ticketHistoryService", () => historyService);
vi.mock("../workSession", () => workSessions);

import { executeAdjustTicketAction } from "./execute/adjustTicketAction";
import { executeAssignSelfTicketAction } from "./execute/assignSelfTicketAction";
import { executeAssignTicketAction } from "./execute/assignTicketAction";
import { executeCancelTicketAction } from "./execute/cancelTicketAction";
import { executeMergeTicketAction } from "./execute/mergeTicketAction";
import { executeRejectTicketAction } from "./execute/rejectTicketAction";
import { executeReopenTicketAction } from "./execute/reopenTicketAction";
import { executeResubmitTicketAction } from "./execute/resubmitTicketAction";
import { validateTicketActionPayload } from "./ticketActionRules";

const query = vi.fn();

function ticketRow(
  overrides: Partial<ServiceDeskTicketViewRow> = {},
): ServiceDeskTicketViewRow {
  return {
    tk_id: "ticket-1",
    tk_tenant_id: 20,
    tn_name: { en: "Customer" },
    tk_ticket_no: "T-2026-0001",
    tk_created_at: "2026-01-01T00:00:00.000Z",
    tk_updated_at: null,
    tk_requester_username: "requester",
    tk_requester: {
      username: "requester",
      name: { en: { first: "Request", last: "User" } },
      email: "requester@example.com",
      image: null,
    },
    tk_requester_department_id: 3,
    tk_requester_department_name: { en: "Operations" },
    tk_status: "Working",
    tk_priority: "medium",
    tk_risk_level: "medium",
    tk_assignee_usernames: ["worker"],
    tk_assignees: [],
    tk_work_minutes: 30,
    tka_last_comment_at: null,
    tka_last_comment_email: null,
    tka_last_user_activity_at: null,
    tka_last_user_activity_email: null,
    tk_close_reason: null,
    tk_merged_into_ticket_id: null,
    tk_merged_into_ticket_no: null,
    tkh_closed_at: null,
    tk_due_at: "2026-09-10T00:00:00.000Z",
    cat_scope: "PORTAL",
    cat_id: 10,
    cat_name: { en: "Printer" },
    cat_parent_id: null,
    tk_approval_step_id: null,
    tk_subject: "Printer unavailable",
    tk_content: "The printer is offline.",
    tk_email: { to: [], cc: [], bcc: [] },
    tk_files: [],
    tk_images: [],
    ...overrides,
  };
}

function payload(
  action: TicketGeneralActionPath,
  overrides: Partial<TicketActionCommandRequest> = {},
) {
  return validateTicketActionPayload(action, {
    content: "Administrative action",
    ...overrides,
  });
}

describe("admin ticket action workflow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const ticket = ticketRow();
    updates.updateTicketAssigneesById.mockResolvedValue(ticket);
    updates.updateTicketPlanningById.mockResolvedValue(ticket);
    updates.updateTicketStatusById.mockResolvedValue(ticket);
    updates.updateTicketMergeStateById.mockResolvedValue(ticket);
    updates.updateTicketCloseStateById.mockResolvedValue(ticket);
    updates.updateTicketInitialRoutingById.mockResolvedValue(ticket);
  });

  it("allows only an admin to reassign the active approval step", async () => {
    const ticket = ticketRow({
      tk_status: "Approval",
      tk_approval_step_id: 7,
      tk_assignee_usernames: ["approver"],
    });
    const actionPayload = payload("assign", {
      assigneeUsernames: ["next-approver"],
    });

    await expect(
      executeAssignTicketAction({
        ticket,
        ticketId: "ticket-1",
        actionNo: 5,
        currentUserName: "worker",
        isAdmin: false,
        payload: actionPayload,
        actionMode: "assign",
        query,
      }),
    ).rejects.toMatchObject({ status: 403 });

    await executeAssignTicketAction({
      ticket,
      ticketId: "ticket-1",
      actionNo: 5,
      currentUserName: "admin",
      isAdmin: true,
      payload: actionPayload,
      actionMode: "assignAdminOverride",
      query,
    });

    expect(updates.updateTicketAssigneesById).toHaveBeenCalledOnce();
    expect(updates.updateTicketAssigneesById).toHaveBeenCalledWith(
      "ticket-1",
      { assigneeUsernames: ["next-approver"], status: "Approval" },
      { query },
    );
    expect(history.createHistoryOfAssignmentChange).toHaveBeenCalledWith(
      expect.objectContaining({
        actorUsername: "admin",
        fromAssigneeUsernames: ["approver"],
        toAssigneeUsernames: ["next-approver"],
        metadata: expect.objectContaining({
          assignmentPhase: "APPROVAL",
          approvalStepId: 7,
          previousStatus: "Approval",
          nextStatus: "Approval",
        }),
      }),
      { query },
    );
  });

  it("lets an admin reassign work without being a current assignee", async () => {
    await executeAssignTicketAction({
      ticket: ticketRow(),
      ticketId: "ticket-1",
      actionNo: 5,
      currentUserName: "admin",
      isAdmin: true,
      payload: payload("assign", { assigneeUsernames: ["next-worker"] }),
      actionMode: "assignAdminOverride",
      query,
    });

    expect(updates.updateTicketAssigneesById).toHaveBeenCalledWith(
      "ticket-1",
      { assigneeUsernames: ["next-worker"], status: "Working" },
      { query },
    );
  });

  it("records resolved or closed planning edits as admin corrections", async () => {
    const ticket = ticketRow({ tk_status: "Closed" });

    await executeAdjustTicketAction({
      ticket,
      ticketId: "ticket-1",
      actionNo: 5,
      currentUserName: "admin",
      isAdmin: true,
      payload: payload("adjust", { priority: "high" }),
      query,
    });

    expect(updates.updateTicketPlanningById).toHaveBeenCalledWith(
      "ticket-1",
      {
        priority: "high",
        riskLevel: "medium",
        dueAt: "2026-09-10T00:00:00.000Z",
      },
      { query },
    );
    expect(history.createHistoryOfPlanningChange).toHaveBeenCalledWith(
      expect.objectContaining({
        fromPlanning: { priority: "medium", risk_level: "medium" },
        toPlanning: { priority: "high", risk_level: "medium" },
        metadata: expect.objectContaining({
          changedFields: ["priority"],
          isAdminCorrection: true,
        }),
      }),
      { query },
    );
  });

  it("does not let an admin rewrite the due date of a resolved ticket", async () => {
    await expect(
      executeAdjustTicketAction({
        ticket: ticketRow({ tk_status: "Resolved" }),
        ticketId: "ticket-1",
        actionNo: 5,
        currentUserName: "admin",
        isAdmin: true,
        payload: payload("adjust", {
          dueAt: "2026-09-20T00:00:00.000Z",
        }),
        query,
      }),
    ).rejects.toMatchObject({ status: 400 });

    expect(updates.updateTicketPlanningById).not.toHaveBeenCalled();
    expect(history.createHistoryOfPlanningChange).not.toHaveBeenCalled();
  });

  it("lets an admin reject work without being assigned and closes running sessions", async () => {
    await executeRejectTicketAction({
      ticket: ticketRow(),
      ticketId: "ticket-1",
      actionNo: 5,
      currentUserName: "admin",
      isAdmin: true,
      payload: payload("reject", { content: "Invalid request" }),
      actionMode: "rejectAdminOverride",
      query,
    });

    expect(updates.updateTicketStatusById).toHaveBeenCalledWith(
      "ticket-1",
      { status: "Rejected" },
      { query },
    );
    expect(workSessions.finishRunningWorkSessionsByTicketId).toHaveBeenCalledWith(
      "ticket-1",
      expect.any(String),
      { query },
    );
    expect(history.createHistoryOfTicketRejected).toHaveBeenCalledWith(
      expect.objectContaining({ actorUsername: "admin" }),
      { query },
    );
  });

  it("lets an unassigned admin merge an expanded-status ticket", async () => {
    const source = ticketRow({ tk_status: "Declined" });
    const target = ticketRow({
      tk_id: "ticket-2",
      tk_ticket_no: "T-2026-0002",
      tk_status: "Resolved",
    });

    await executeMergeTicketAction({
      ticket: source,
      targetTicket: target,
      ticketId: "ticket-1",
      actionNo: 5,
      currentUserName: "admin",
      isAdmin: true,
      payload: payload("merge", {
        content: "Administrative merge",
        targetTicketId: "ticket-2",
      }),
      query,
    });

    expect(updates.updateTicketMergeStateById).toHaveBeenCalledWith(
      "ticket-1",
      { query },
    );
    expect(history.createHistoryOfTicketMerged).toHaveBeenCalledWith(
      expect.objectContaining({
        actorUsername: "admin",
        fromStatus: "Declined",
        closeReason: "Merged",
      }),
      { query },
    );
  });

  it("does not let admin override cross-tenant merge isolation", async () => {
    await expect(
      executeMergeTicketAction({
        ticket: ticketRow({ tk_tenant_id: 20 }),
        targetTicket: ticketRow({
          tk_id: "ticket-2",
          tk_tenant_id: 21,
        }),
        ticketId: "ticket-1",
        actionNo: 5,
        currentUserName: "admin",
        isAdmin: true,
        payload: payload("merge", {
          targetTicketId: "ticket-2",
        }),
        query,
      }),
    ).rejects.toMatchObject({ status: 400 });

    expect(updates.updateTicketMergeStateById).not.toHaveBeenCalled();
    expect(history.createHistoryOfTicketMerged).not.toHaveBeenCalled();
  });

  it("lets an admin reopen a resolved ticket without requester ownership", async () => {
    await executeReopenTicketAction({
      ticket: ticketRow({ tk_status: "Resolved" }),
      ticketId: "ticket-1",
      actionNo: 5,
      currentUserName: "admin",
      isAdmin: true,
      payload: payload("reopen"),
      actionMode: "reopen",
      query,
    });

    expect(updates.updateTicketStatusById).toHaveBeenCalledWith(
      "ticket-1",
      { status: "Working" },
      { query },
    );
    expect(history.createHistoryOfStatusChange).toHaveBeenCalledWith(
      expect.objectContaining({
        actorUsername: "admin",
        fromStatus: "Resolved",
        toStatus: "Working",
      }),
      { query },
    );
  });

  it("does not broaden admin authority over assign-self, resubmit, or cancel", async () => {
    const ticket = ticketRow({ tk_assignee_usernames: ["worker", "peer"] });

    await expect(
      executeAssignSelfTicketAction({
        ticket,
        ticketId: "ticket-1",
        actionNo: 5,
        currentUserName: "admin",
        isAdmin: true,
        payload: payload("assignSelf"),
        query,
      }),
    ).rejects.toMatchObject({ status: 403 });

    await expect(
      executeResubmitTicketAction({
        ticket: ticketRow({ tk_status: "Rejected" }),
        ticketId: "ticket-1",
        actionNo: 5,
        currentUserName: "admin",
        payload: payload("resubmit"),
        query,
      }),
    ).rejects.toMatchObject({ status: 403 });

    await expect(
      executeCancelTicketAction({
        ticket,
        ticketId: "ticket-1",
        actionNo: 5,
        currentUserName: "admin",
        payload: payload("cancel"),
        actionMode: "cancel",
        query,
      }),
    ).rejects.toMatchObject({ status: 403 });

    expect(updates.updateTicketAssigneesById).not.toHaveBeenCalled();
    expect(updates.updateTicketInitialRoutingById).not.toHaveBeenCalled();
    expect(updates.updateTicketCloseStateById).not.toHaveBeenCalled();
  });
});
