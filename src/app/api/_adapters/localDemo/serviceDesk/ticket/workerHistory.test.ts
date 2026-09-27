import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type { DbTicketHistory } from "@/lib/application/contracts/serviceDesk";

import { getLocalDemoHistories, resetLocalDemoTicketState } from "./state";
import { hasLocalTicketWorkAssignmentHistory } from "./workerHistory";

const history = (patch: Partial<DbTicketHistory>): DbTicketHistory => ({
  ticket_id: "t", history_no: 1, type: "ASSIGNMENT", event: "ASSIGNMENT_RESOLVED",
  source: "ASSIGNMENT_RULE", actor_username: "actor", action_no: null,
  created_at: "2026-09-25T00:00:00Z", ...patch,
});
const hasWorked = (username: string) => hasLocalTicketWorkAssignmentHistory({
  isInternal: true, ticketId: "t", username,
});

describe("LOCAL actual work assignment evidence", () => {
  beforeEach(() => { resetLocalDemoTicketState(); getLocalDemoHistories().splice(0); });
  afterEach(resetLocalDemoTicketState);

  it("does not promote a final approver to a previous worker", () => {
    getLocalDemoHistories().push(history({
      from_value: { assigneeUsernames: ["approver"] },
      to_value: { assigneeUsernames: ["worker"] },
      metadata: { previousAssigneeUsernames: ["approver"], nextAssigneeUsernames: ["worker"] },
    }));
    expect(hasWorked("approver")).toBe(false);
    expect(hasWorked("worker")).toBe(true);
    expect(hasWorked("actor")).toBe(false);
  });

  it.each([{ assignmentPhase: "WORK" }, { actionType: "ASSIGN_SELF" }])(
    "preserves both actual workers during work reassignment: %j", (metadata) => {
      getLocalDemoHistories().push(history({ event: "ASSIGNMENT_UPDATED",
        from_value: { assigneeUsernames: ["old"] }, to_value: { assigneeUsernames: ["new"] }, metadata }));
      expect(hasWorked("old")).toBe(true);
      expect(hasWorked("new")).toBe(true);
    },
  );

  it.each([{ assignmentPhase: "APPROVAL" }, {}])("rejects approval or unknown-phase updates: %j", (metadata) => {
    getLocalDemoHistories().push(history({ event: "ASSIGNMENT_UPDATED",
      from_value: { assigneeUsernames: ["old"] }, to_value: { assigneeUsernames: ["new"] }, metadata }));
    expect(hasWorked("old")).toBe(false);
    expect(hasWorked("new")).toBe(false);
  });

  it("recognizes requester reset metadata across work -> approval -> work", () => {
    getLocalDemoHistories().push(history({ type: "TICKET", event: "ROUTING_RESET", metadata: {
      previousApprovalStepId: null, previousAssigneeUsernames: ["old-worker"],
      nextApprovalStepId: "7", nextAssigneeUsernames: ["approver"],
    } }), history({ type: "TICKET", event: "ROUTING_RESET", metadata: {
      previousApprovalStepId: "7", previousAssigneeUsernames: ["approver"],
      nextApprovalStepId: null, nextAssigneeUsernames: ["new-worker"],
    } }));
    expect(hasWorked("old-worker")).toBe(true);
    expect(hasWorked("new-worker")).toBe(true);
    expect(hasWorked("approver")).toBe(false);
  });

  it("recognizes the settings force-save snapshots without counting approvers", () => {
    getLocalDemoHistories().push(history({ type: "TICKET", event: "ROUTING_RESET",
      from_value: { approvalStepId: "7", assigneeUsernames: ["approver"] },
      to_value: { approvalStepId: null, assigneeUsernames: ["worker"] },
      metadata: { reason: "APPROVAL_CONFIGURATION_CHANGED" },
    }));
    expect(hasWorked("worker")).toBe(true);
    expect(hasWorked("approver")).toBe(false);
  });

  it("requires an explicit null phase in the same snapshot and the same Ticket", () => {
    getLocalDemoHistories().push(history({ type: "TICKET", event: "ROUTING_RESET",
      metadata: { previousAssigneeUsernames: ["unknown"] },
      to_value: { approvalStepId: "null", assigneeUsernames: ["unknown"] },
    }), history({ ticket_id: "other", to_value: { assigneeUsernames: ["unknown"] } }));
    expect(hasWorked("unknown")).toBe(false);
  });
});
