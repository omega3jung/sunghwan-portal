import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ServiceDeskTicketViewRow } from "../ticket/ticketRow";
import type { CreateTicketActionRowInput } from "./ticketActionRepository";
import type { TicketActionRow } from "./ticketActionRow";

const transaction = vi.hoisted(() => {
  const query = vi.fn();
  return {
    query,
    withPortalApiTransaction: vi.fn(
      async (work: (query: ReturnType<typeof vi.fn>) => Promise<unknown>) =>
        work(query),
    ),
  };
});
const tickets = vi.hoisted(() => ({
  findActiveTicketViewRowById: vi.fn(),
  findActiveTicketViewRowByIdIncludingDraft: vi.fn(),
  findApprovalStepAssigneeUsernames: vi.fn(),
  findCategoryAssignmentUsernames: vi.fn(),
  findNextApprovalStepId: vi.fn(),
}));
const actions = vi.hoisted(() => ({
  createApprovalTicketActionRow: vi.fn(),
  createTicketActionRow: vi.fn(),
  findActiveTicketActionRowByTicketIdAndNo: vi.fn(),
  findActiveTicketActionRowsByTicketId: vi.fn(),
  findNextTicketActionNo: vi.fn(),
  softDeleteTicketActionRow: vi.fn(),
}));
const updates = vi.hoisted(() => ({
  updateTicketApprovalRoutingById: vi.fn(),
  updateTicketAssigneesById: vi.fn(),
  updateTicketPlanningById: vi.fn(),
  updateTicketStatusById: vi.fn(),
  updateTicketMergeStateById: vi.fn(),
  updateTicketCloseStateById: vi.fn(),
  updateTicketInitialRoutingById: vi.fn(),
}));
const history = vi.hoisted(() => ({
  createHistoryOfApprovalApproved: vi.fn(),
  createHistoryOfApprovalDeclined: vi.fn(),
  createHistoryOfApprovalRequested: vi.fn(),
  createHistoryOfAssignmentChange: vi.fn(),
  createHistoryOfAssignmentResolvedByRule: vi.fn(),
  createHistoryOfCommentCreated: vi.fn(),
  createHistoryOfNoteCreated: vi.fn(),
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

vi.mock("@/server/shared/supabase/portalApiClient", () => transaction);
vi.mock("../ticket/ticketRepository", () => tickets);
vi.mock("../ticket/ticketUpdateRepository", () => updates);
vi.mock("./ticketActionRepository", () => actions);
vi.mock("../ticketHistory/ticketHistoryEventService", () => history);
vi.mock("../ticketHistory/ticketHistoryService", () => historyService);
vi.mock("../workSession", () => workSessions);

import {
  executeTicketAction,
  softDeleteTicketAction,
} from "./ticketActionService";

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

function actionRow(
  overrides: Partial<TicketActionRow> = {},
): TicketActionRow {
  return {
    tka_ticket_id: "ticket-1",
    tka_action_no: 5,
    tka_action_type: "NOTE",
    tka_content: "Reason",
    tka_metadata: { source: "ticketActionTool" },
    tka_files: [],
    tka_images: [],
    tka_owner_username: "worker",
    tka_active: true,
    tka_created_at: "2026-01-01T01:00:00.000Z",
    tka_updated_at: null,
    ...overrides,
  };
}

describe("ticket action workflow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const ticket = ticketRow();
    tickets.findActiveTicketViewRowByIdIncludingDraft.mockResolvedValue(ticket);
    tickets.findNextApprovalStepId.mockResolvedValue(null);
    tickets.findCategoryAssignmentUsernames.mockResolvedValue(["worker"]);
    actions.findNextTicketActionNo.mockResolvedValue(5);
    actions.createTicketActionRow.mockImplementation(
      async (input: CreateTicketActionRowInput) =>
        actionRow({
          tka_action_type: input.actionType,
          tka_content: input.content,
          tka_metadata: input.metadata,
          tka_files: input.files,
          tka_images: input.images,
          tka_owner_username: input.ownerUsername,
        }),
    );
    updates.updateTicketAssigneesById.mockResolvedValue(ticket);
    updates.updateTicketPlanningById.mockResolvedValue(ticket);
    updates.updateTicketStatusById.mockResolvedValue(ticket);
    updates.updateTicketMergeStateById.mockResolvedValue(ticket);
    updates.updateTicketCloseStateById.mockResolvedValue(ticket);
    updates.updateTicketInitialRoutingById.mockResolvedValue(ticket);
  });

  it("prevents a tenant user from assigning provider employees on a portal ticket", async () => {
    await expect(
      executeTicketAction({
        ticketId: "ticket-1",
        action: "assign",
        currentUserName: "worker",
        payload: {
          content: "Reassign work",
          assigneeUsernames: ["next-worker"],
        },
      }),
    ).rejects.toMatchObject({ status: 403 });

    expect(actions.createTicketActionRow).not.toHaveBeenCalled();
    expect(updates.updateTicketAssigneesById).not.toHaveBeenCalled();
    expect(history.createHistoryOfAssignmentChange).not.toHaveBeenCalled();
  });

  it("lets a current worker reassign Pending work and advances it to Working", async () => {
    tickets.findActiveTicketViewRowByIdIncludingDraft.mockResolvedValue(
      ticketRow({ tk_status: "Pending" }),
    );

    await executeTicketAction({
      ticketId: "ticket-1",
      action: "assign",
      currentUserName: "worker",
      isInternal: true,
      payload: {
        content: "Route to the network team",
        assigneeUsernames: ["next-worker"],
      },
    });

    expect(updates.updateTicketAssigneesById).toHaveBeenCalledWith(
      "ticket-1",
      { assigneeUsernames: ["next-worker"], status: "Working" },
      { query: transaction.query },
    );
    expect(history.createHistoryOfAssignmentChange).toHaveBeenCalledWith(
      expect.objectContaining({
        fromAssigneeUsernames: ["worker"],
        toAssigneeUsernames: ["next-worker"],
        metadata: expect.objectContaining({
          assignmentPhase: "WORK",
          previousStatus: "Pending",
          nextStatus: "Working",
        }),
      }),
      { query: transaction.query },
    );
  });

  it("lets one of multiple current workers claim the ticket", async () => {
    tickets.findActiveTicketViewRowByIdIncludingDraft.mockResolvedValue(
      ticketRow({ tk_assignee_usernames: ["worker", "peer"] }),
    );

    await executeTicketAction({
      ticketId: "ticket-1",
      action: "assignSelf",
      currentUserName: "worker",
      payload: { content: "I will take ownership" },
    });

    expect(updates.updateTicketAssigneesById).toHaveBeenCalledWith(
      "ticket-1",
      { assigneeUsernames: ["worker"], status: "Working" },
      { query: transaction.query },
    );
    expect(history.createHistoryOfAssignmentChange).toHaveBeenCalledWith(
      expect.objectContaining({
        fromAssigneeUsernames: ["worker", "peer"],
        toAssigneeUsernames: ["worker"],
        metadata: expect.objectContaining({ claimedByUsername: "worker" }),
      }),
      { query: transaction.query },
    );
  });

  it("records only the changed planning fields for a current worker", async () => {
    await executeTicketAction({
      ticketId: "ticket-1",
      action: "adjust",
      currentUserName: "worker",
      payload: { content: "Risk reassessed", riskLevel: "high" },
    });

    expect(updates.updateTicketPlanningById).toHaveBeenCalledWith(
      "ticket-1",
      {
        priority: "medium",
        riskLevel: "high",
        dueAt: "2026-09-10T00:00:00.000Z",
      },
      { query: transaction.query },
    );
    expect(history.createHistoryOfPlanningChange).toHaveBeenCalledWith(
      expect.objectContaining({
        fromPlanning: expect.objectContaining({ risk_level: "medium" }),
        toPlanning: expect.objectContaining({ risk_level: "high" }),
        metadata: expect.objectContaining({ changedFields: ["riskLevel"] }),
      }),
      { query: transaction.query },
    );
  });

  it("rejects work, finishes running sessions, and records immutable history", async () => {
    await executeTicketAction({
      ticketId: "ticket-1",
      action: "reject",
      currentUserName: "worker",
      payload: { content: "Cannot reproduce" },
    });

    expect(updates.updateTicketStatusById).toHaveBeenCalledWith(
      "ticket-1",
      { status: "Rejected" },
      { query: transaction.query },
    );
    expect(workSessions.finishRunningWorkSessionsByTicketId).toHaveBeenCalledWith(
      "ticket-1",
      expect.any(String),
      { query: transaction.query },
    );
    expect(history.createHistoryOfTicketRejected).toHaveBeenCalledWith(
      expect.objectContaining({
        actorUsername: "worker",
        fromStatus: "Working",
        toStatus: "Rejected",
        reason: "Cannot reproduce",
      }),
      { query: transaction.query },
    );
  });

  it("merges a same-tenant ticket, closes work, and records the target relation", async () => {
    const source = ticketRow();
    const target = ticketRow({
      tk_id: "ticket-2",
      tk_ticket_no: "T-2026-0002",
      tk_status: "Resolved",
    });
    tickets.findActiveTicketViewRowByIdIncludingDraft
      .mockResolvedValueOnce(source)
      .mockResolvedValueOnce(target);

    await executeTicketAction({
      ticketId: "ticket-1",
      action: "merge",
      currentUserName: "worker",
      payload: { content: "Duplicate request", targetTicketId: "ticket-2" },
    });

    expect(updates.updateTicketMergeStateById).toHaveBeenCalledWith(
      "ticket-1",
      { query: transaction.query },
    );
    expect(workSessions.finishRunningWorkSessionsByTicketId).toHaveBeenCalledWith(
      "ticket-1",
      expect.any(String),
      { query: transaction.query },
    );
    expect(history.createHistoryOfTicketMerged).toHaveBeenCalledWith(
      expect.objectContaining({
        targetTicketId: "ticket-2",
        targetTicketNo: "T-2026-0002",
        closeReason: "Merged",
        sourceTenantId: "20",
        targetTenantId: "20",
      }),
      { query: transaction.query },
    );
  });

  it("reopens a requester's resolved ticket without changing its assignees", async () => {
    tickets.findActiveTicketViewRowByIdIncludingDraft.mockResolvedValue(
      ticketRow({ tk_status: "Resolved" }),
    );

    await executeTicketAction({
      ticketId: "ticket-1",
      action: "reopen",
      currentUserName: "requester",
      payload: { content: "The issue returned" },
    });

    expect(updates.updateTicketStatusById).toHaveBeenCalledWith(
      "ticket-1",
      { status: "Working" },
      { query: transaction.query },
    );
    expect(history.createHistoryOfStatusChange).toHaveBeenCalledWith(
      expect.objectContaining({
        fromStatus: "Resolved",
        toStatus: "Working",
        metadata: expect.objectContaining({
          event: "TICKET_REOPENED",
          previousAssigneeUsernames: ["worker"],
          nextAssigneeUsernames: ["worker"],
        }),
      }),
      { query: transaction.query },
    );
  });

  it("resubmits a rejected ticket through fresh assignment routing and audit", async () => {
    tickets.findActiveTicketViewRowByIdIncludingDraft.mockResolvedValue(
      ticketRow({
        tk_status: "Rejected",
        tk_assignee_usernames: [],
      }),
    );
    tickets.findCategoryAssignmentUsernames.mockResolvedValue(["new-worker"]);

    await executeTicketAction({
      ticketId: "ticket-1",
      action: "resubmit",
      currentUserName: "requester",
      payload: { content: "Added the missing details" },
    });

    expect(updates.updateTicketInitialRoutingById).toHaveBeenCalledWith(
      "ticket-1",
      {
        approvalStepId: null,
        assigneeUsernames: ["new-worker"],
        status: "Assigned",
      },
      { query: transaction.query },
    );
    expect(historyService.createTicketHistory).toHaveBeenCalledWith(
      expect.objectContaining({
        event: "TICKET_SUBMITTED",
        fromValue: { status: "Rejected" },
        toValue: expect.objectContaining({ status: "Assigned" }),
      }),
      { query: transaction.query },
    );
    expect(history.createHistoryOfAssignmentResolvedByRule).toHaveBeenCalled();
  });

  it("cancels only as the requester and closes every running session", async () => {
    await executeTicketAction({
      ticketId: "ticket-1",
      action: "cancel",
      currentUserName: "requester",
      payload: { content: "No longer needed" },
    });

    expect(updates.updateTicketCloseStateById).toHaveBeenCalledWith(
      "ticket-1",
      { query: transaction.query },
    );
    expect(workSessions.finishRunningWorkSessionsByTicketId).toHaveBeenCalledWith(
      "ticket-1",
      expect.any(String),
      { query: transaction.query },
    );
    expect(history.createHistoryOfTicketCanceled).toHaveBeenCalledWith(
      expect.objectContaining({
        actorUsername: "requester",
        fromStatus: "Working",
        toStatus: "Closed",
        reason: "No longer needed",
      }),
      { query: transaction.query },
    );
  });

  it("keeps operational actions immutable when deletion is requested", async () => {
    actions.findActiveTicketActionRowByTicketIdAndNo.mockResolvedValue(
      actionRow({ tka_action_type: "ASSIGN" }),
    );

    await expect(
      softDeleteTicketAction({
        ticketId: "ticket-1",
        actionNo: 5,
        currentUserName: "worker",
      }),
    ).rejects.toMatchObject({ status: 403 });

    expect(actions.softDeleteTicketActionRow).not.toHaveBeenCalled();
    expect(historyService.createTicketHistory).not.toHaveBeenCalled();
  });

  it("lets a comment writer hide commentary while preserving deletion history", async () => {
    const comment = actionRow({ tka_action_type: "COMMENT" });
    actions.findActiveTicketActionRowByTicketIdAndNo.mockResolvedValue(comment);
    actions.softDeleteTicketActionRow.mockResolvedValue({
      ...comment,
      tka_active: false,
    });

    await softDeleteTicketAction({
      ticketId: "ticket-1",
      actionNo: 5,
      currentUserName: "worker",
    });

    expect(historyService.createTicketHistory).toHaveBeenCalledWith(
      expect.objectContaining({
        historyType: "COMMENT",
        event: "COMMENT_DELETED",
        actorUsername: "worker",
        fromValue: { active: true },
        toValue: { active: false },
      }),
      { query: transaction.query },
    );
  });
});
