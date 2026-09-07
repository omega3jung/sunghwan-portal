import { beforeEach, describe, expect, it, vi } from "vitest";

const createTicketHistory = vi.hoisted(() => vi.fn());

vi.mock("./ticketHistoryService", () => ({ createTicketHistory }));

import {
  createHistoryOfApprovalApproved,
  createHistoryOfAssignmentResolvedByRule,
  createHistoryOfStatusChange,
  createHistoryOfSystemResolutionClose,
  createHistoryOfTicketCreate,
  createHistoryOfTicketMerged,
} from "./ticketHistoryEventService";

describe("Immutable ticket history event contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createTicketHistory.mockResolvedValue({ historyNo: 1 });
  });

  it("records ticket submission as user-authored audit evidence", async () => {
    await createHistoryOfTicketCreate({
      ticketId: "ticket-1",
      actorUsername: "requester",
      ticketNumber: "T-1",
      categoryId: 10,
      status: "Approval",
    });

    expectLastHistory({
      ticketId: "ticket-1",
      actionNo: null,
      historyType: "TICKET",
      source: "USER_ACTION",
      event: "TICKET_SUBMITTED",
      actorUsername: "requester",
      fromValue: null,
      toValue: { ticketNumber: "T-1", categoryId: 10, status: "Approval" },
      metadata: null,
    });
  });

  it("links approval evidence to its command action", async () => {
    await createHistoryOfApprovalApproved({
      ticketId: "ticket-1",
      actionNo: 4,
      actorUsername: "approver",
      approvalStepId: 10,
      nextApprovalStepId: 11,
    });

    expectLastHistory(
      expect.objectContaining({
        actionNo: 4,
        historyType: "APPROVAL",
        event: "APPROVAL_APPROVED",
        actorUsername: "approver",
        fromValue: { approvalStepId: 10 },
        toValue: { nextApprovalStepId: 11 },
      }),
    );
  });

  it("records assignment-rule effects with immutable before and after values", async () => {
    await createHistoryOfAssignmentResolvedByRule({
      ticketId: "ticket-1",
      actorUsername: "requester",
      fromAssigneeUsernames: [],
      toAssigneeUsernames: ["worker"],
    });

    expectLastHistory(
      expect.objectContaining({
        historyType: "ASSIGNMENT",
        source: "ASSIGNMENT_RULE",
        event: "ASSIGNMENT_RESOLVED",
        fromValue: { assigneeUsernames: [] },
        toValue: { assigneeUsernames: ["worker"] },
      }),
    );
  });

  it("records merge target and tenant/scope evidence", async () => {
    await createHistoryOfTicketMerged({
      ticketId: "ticket-1",
      actionNo: 8,
      actorUsername: "admin",
      fromStatus: "Working",
      targetTicketId: "ticket-2",
      targetTicketNo: "T-2",
      closeReason: "Merged",
      sourceTenantId: "7",
      targetTenantId: "7",
      sourceScope: "PORTAL",
      targetScope: "PORTAL",
      reason: "duplicate",
    });

    expectLastHistory(
      expect.objectContaining({
        actionNo: 8,
        historyType: "TICKET",
        event: "TICKET_MERGED",
        toValue: expect.objectContaining({
          status: "Closed",
          mergedIntoTicketId: "ticket-2",
        }),
        metadata: expect.objectContaining({
          sourceTenantId: "7",
          targetTenantId: "7",
          reason: "duplicate",
        }),
      }),
    );
  });

  it("records automatic close with no actor or command reference", async () => {
    await createHistoryOfSystemResolutionClose({
      ticketId: "ticket-1",
      fromStatus: "Resolved",
      resolvedGraceDays: 7,
    });

    expectLastHistory({
      ticketId: "ticket-1",
      actionNo: null,
      historyType: "STATUS",
      source: "SYSTEM_AUTO",
      event: "RESOLUTION_CLOSE",
      actorUsername: null,
      fromValue: { status: "Resolved" },
      toValue: { status: "Closed", closeReason: "Completed" },
      metadata: { closeReason: "Completed", resolvedGraceDays: 7 },
    });
  });

  it("keeps work-session status metadata but strips caller-supplied event identity", async () => {
    await createHistoryOfStatusChange({
      ticketId: "ticket-1",
      actorUsername: "worker",
      fromStatus: "Working",
      toStatus: "Resolved",
      metadata: {
        source: "USER_ACTION",
        event: "STATUS_UPDATED",
        trackedMinutes: 30,
      },
    });

    expectLastHistory(
      expect.objectContaining({
        source: "USER_ACTION",
        event: "STATUS_UPDATED",
        fromValue: { status: "Working" },
        toValue: { status: "Resolved" },
        metadata: { trackedMinutes: 30 },
      }),
    );
  });
});

function expectLastHistory(expected: unknown) {
  expect(createTicketHistory).toHaveBeenLastCalledWith(expected, undefined);
}
