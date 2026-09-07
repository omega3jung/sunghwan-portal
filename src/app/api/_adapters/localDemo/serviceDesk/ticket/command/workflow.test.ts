import { afterEach, describe, expect, it } from "vitest";

import type {
  DbTicketDetail,
  TicketActionCommandPayload,
} from "@/lib/application/contracts/serviceDesk";

import {
  getLocalDemoActions,
  getLocalDemoHistories,
  getLocalDemoTickets,
  resetLocalDemoTicketState,
} from "../state";
import { localPost } from "./post";

afterEach(resetLocalDemoTicketState);

function installTicket(overrides: Partial<DbTicketDetail> = {}) {
  const ticket: DbTicketDetail = {
    ...structuredClone(getLocalDemoTickets()[0]),
    id: "local-workflow-ticket",
    ticket_number: "LOCAL-TEST-1",
    requester_username: "requester",
    status: "Working",
    assignment_phase: "WORK",
    approval_step_id: null,
    approval_assignee_usernames: [],
    work_assignee_usernames: ["worker"],
    assignee_usernames: ["worker"],
    close_reason: null,
    merged_into_ticket_id: null,
    merged_into_ticket_no: null,
    active: true,
    scope: "INTERNAL",
    ...overrides,
  };

  getLocalDemoTickets().splice(0, getLocalDemoTickets().length, ticket);
  return ticket;
}

function payload(
  actionType: TicketActionCommandPayload["actionType"],
  overrides: Partial<TicketActionCommandPayload> = {},
): TicketActionCommandPayload {
  return {
    id: "local-action-test",
    actionType,
    content: "Workflow evidence",
    files: [],
    images: [],
    ...overrides,
  };
}

describe("LOCAL ticket action workflow", () => {
  it("reassigns Pending work, advances it to Working, and commits one audit unit", async () => {
    const ticket = installTicket({ status: "Pending" });
    const actionCount = getLocalDemoActions().length;
    const historyCount = getLocalDemoHistories().length;

    const response = await localPost({
      ticketId: ticket.id,
      employeeUserName: "worker",
      action: "assign",
      isInternal: true,
      content: payload("ASSIGN", {
        assigneeUsernames: ["next-worker"],
      }),
    });

    expect(response.status).toBe(201);
    expect(getLocalDemoActions()).toHaveLength(actionCount + 1);
    expect(getLocalDemoHistories()).toHaveLength(historyCount + 1);
    expect(getLocalDemoHistories().at(-1)).toMatchObject({
      ticket_id: ticket.id,
      type: "ASSIGNMENT",
      event: "ASSIGNMENT_UPDATED",
      actor_username: "worker",
      from_value: {
        status: "Pending",
        assigneeUsernames: ["worker"],
      },
      to_value: {
        status: "Working",
        assigneeUsernames: ["next-worker"],
      },
    });
    expect(getLocalDemoTickets()[0]).toMatchObject({
      status: "Working",
      assignment_phase: "WORK",
      assignee_usernames: ["next-worker"],
      work_assignee_usernames: ["next-worker"],
    });
  });

  it("lets one of multiple work assignees claim the ticket", async () => {
    const ticket = installTicket({
      assignee_usernames: ["worker", "peer"],
      work_assignee_usernames: ["worker", "peer"],
    });

    const response = await localPost({
      ticketId: ticket.id,
      employeeUserName: "worker",
      action: "assignSelf",
      content: payload("ASSIGN_SELF"),
    });

    expect(response.status).toBe(201);
    expect(getLocalDemoTickets()[0].assignee_usernames).toEqual(["worker"]);
    expect(getLocalDemoHistories().at(-1)).toMatchObject({
      event: "ASSIGNMENT_UPDATED",
      metadata: expect.objectContaining({ claimedByUsername: "worker" }),
    });
  });

  it("rejects an unrelated worker without partially writing action, history, or ticket state", async () => {
    const ticket = installTicket();
    const actionsBefore = structuredClone(getLocalDemoActions());
    const historiesBefore = structuredClone(getLocalDemoHistories());
    const ticketsBefore = structuredClone(getLocalDemoTickets());

    const response = await localPost({
      ticketId: ticket.id,
      employeeUserName: "outsider",
      action: "reject",
      content: payload("REJECT", { content: "Cannot reproduce" }),
    });

    expect(response.status).toBe(403);
    expect(getLocalDemoActions()).toEqual(actionsBefore);
    expect(getLocalDemoHistories()).toEqual(historiesBefore);
    expect(getLocalDemoTickets()).toEqual(ticketsBefore);
  });

  it("allows only the requester to cancel and records the close reason", async () => {
    const ticket = installTicket();

    const response = await localPost({
      ticketId: ticket.id,
      employeeUserName: "requester",
      action: "cancel",
      content: payload("CANCEL", { content: "No longer needed" }),
    });

    expect(response.status).toBe(201);
    expect(getLocalDemoTickets()[0]).toMatchObject({
      status: "Closed",
      close_reason: "Canceled",
    });
    expect(getLocalDemoHistories().at(-1)).toMatchObject({
      event: "TICKET_CANCELED",
      actor_username: "requester",
      from_value: { status: "Working" },
      to_value: { status: "Closed", closeReason: "Canceled" },
    });
  });
});

describe("LOCAL administrator ticket action workflow", () => {
  it("allows an administrator to reassign an active approval step", async () => {
    const ticket = installTicket({
      status: "Approval",
      assignment_phase: "APPROVAL",
      approval_step_id: "7",
      assignee_usernames: ["approver"],
      approval_assignee_usernames: ["approver"],
      work_assignee_usernames: [],
    });

    const response = await localPost({
      ticketId: ticket.id,
      employeeUserName: "admin",
      action: "assign",
      isAdmin: true,
      isInternal: true,
      content: payload("ASSIGN", {
        assigneeUsernames: ["next-approver"],
      }),
    });

    expect(response.status).toBe(201);
    expect(getLocalDemoTickets()[0]).toMatchObject({
      status: "Approval",
      assignment_phase: "APPROVAL",
      approval_step_id: "7",
      assignee_usernames: ["next-approver"],
      approval_assignee_usernames: ["next-approver"],
    });
    expect(getLocalDemoHistories().at(-1)).toMatchObject({
      event: "ASSIGNMENT_UPDATED",
      metadata: expect.objectContaining({
        assignmentPhase: "APPROVAL",
        approvalStepId: 7,
      }),
    });
  });

  it("does not let an administrator rewrite a closed ticket due date or leave partial audit state", async () => {
    const ticket = installTicket({ status: "Closed" });
    const actionsBefore = structuredClone(getLocalDemoActions());
    const historiesBefore = structuredClone(getLocalDemoHistories());
    const ticketsBefore = structuredClone(getLocalDemoTickets());

    const response = await localPost({
      ticketId: ticket.id,
      employeeUserName: "admin",
      action: "adjust",
      isAdmin: true,
      content: payload("ADJUST", {
        dueAt: "2099-01-01T00:00:00.000Z",
      }),
    });

    expect(response.status).toBe(400);
    expect(getLocalDemoActions()).toEqual(actionsBefore);
    expect(getLocalDemoHistories()).toEqual(historiesBefore);
    expect(getLocalDemoTickets()).toEqual(ticketsBefore);
  });
});
