import { afterEach, describe, expect, it } from "vitest";

import type { DbTicketDetail } from "@/lib/application/contracts/serviceDesk";

import {
  getLocalDemoHistories,
  getLocalDemoTickets,
  resetLocalDemoTicketState,
} from "./state";
import {
  createLocalTicketWorkSession,
  listLocalTicketWorkSessions,
} from "./workSession";

afterEach(resetLocalDemoTicketState);

function installWorkTicket(overrides: Partial<DbTicketDetail> = {}) {
  const ticket: DbTicketDetail = {
    ...structuredClone(getLocalDemoTickets()[0]),
    id: crypto.randomUUID(),
    status: "Assigned",
    assignment_phase: "WORK",
    approval_step_id: null,
    approval_assignee_usernames: [],
    assignee_usernames: ["worker"],
    work_assignee_usernames: ["worker"],
    work_minutes: 10,
    active: true,
    ...overrides,
  };

  getLocalDemoTickets().splice(0, getLocalDemoTickets().length, ticket);
  return ticket;
}

describe("LOCAL ticket work-session workflow", () => {
  it("rejects a user with no current or historical assignment before mutation", () => {
    const ticket = installWorkTicket();
    const ticketBefore = structuredClone(ticket);
    const historyCount = getLocalDemoHistories().length;

    expect(() =>
      createLocalTicketWorkSession({
        ticketId: ticket.id,
        currentUserName: "outsider",
        isInternal: true,
        payload: {
          ticketId: ticket.id,
          inputMode: "duration",
          durationMinutes: 30,
        },
      }),
    ).toThrow(expect.objectContaining({ status: 403 }));

    expect(getLocalDemoTickets()[0]).toEqual(ticketBefore);
    expect(getLocalDemoHistories()).toHaveLength(historyCount);
    expect(listLocalTicketWorkSessions(ticket.id)).toMatchObject({
      items: [],
      total: 0,
    });
  });

  it("requires a current assignee to advance Assigned work to Working", () => {
    const ticket = installWorkTicket();

    expect(() =>
      createLocalTicketWorkSession({
        ticketId: ticket.id,
        currentUserName: "worker",
        isInternal: true,
        payload: {
          ticketId: ticket.id,
          inputMode: "duration",
          durationMinutes: 30,
        },
      }),
    ).toThrow(expect.objectContaining({ status: 409 }));

    expect(listLocalTicketWorkSessions(ticket.id).total).toBe(0);
    expect(getLocalDemoTickets()[0].work_minutes).toBe(10);
  });

  it("records work, accumulates minutes, advances status, and writes matching history", () => {
    const ticket = installWorkTicket();

    const session = createLocalTicketWorkSession({
      ticketId: ticket.id,
      currentUserName: "worker",
      isInternal: true,
      payload: {
        ticketId: ticket.id,
        inputMode: "duration",
        durationMinutes: 30,
        nextStatus: "Working",
        note: "  investigated  ",
      },
    });

    expect(session).toMatchObject({
      ticketId: ticket.id,
      assigneeUsername: "worker",
      durationMinutes: 30,
      note: "investigated",
    });
    expect(getLocalDemoTickets()[0]).toMatchObject({
      status: "Working",
      work_minutes: 40,
    });
    expect(getLocalDemoHistories().at(-1)).toMatchObject({
      ticket_id: ticket.id,
      type: "STATUS",
      event: "STATUS_UPDATED",
      actor_username: "worker",
      from_value: { status: "Assigned" },
      to_value: { status: "Working" },
      metadata: expect.objectContaining({
        previousStatus: "Assigned",
        nextStatus: "Working",
      }),
    });
  });

  it("allows a historical worker to add evidence but not change current status", () => {
    const ticket = installWorkTicket({
      status: "Working",
      assignee_usernames: ["current-worker"],
      work_assignee_usernames: ["current-worker"],
    });
    const historyTemplate = structuredClone(getLocalDemoHistories()[0]);
    getLocalDemoHistories().push({
      ...historyTemplate,
      ticket_id: ticket.id,
      history_no: 1,
      type: "ASSIGNMENT",
      event: "ASSIGNMENT_UPDATED",
      actor_username: "dispatcher",
      from_value: { assigneeUsernames: ["previous-worker"] },
      to_value: { assigneeUsernames: ["current-worker"] },
      metadata: {
        assignmentPhase: "WORK",
        previousAssigneeUsernames: ["previous-worker"],
        nextAssigneeUsernames: ["current-worker"],
      },
    });
    const historyCount = getLocalDemoHistories().length;

    createLocalTicketWorkSession({
      ticketId: ticket.id,
      currentUserName: "previous-worker",
      isInternal: true,
      payload: {
        ticketId: ticket.id,
        inputMode: "duration",
        durationMinutes: 15,
      },
    });

    expect(getLocalDemoTickets()[0]).toMatchObject({
      status: "Working",
      work_minutes: 25,
    });
    expect(getLocalDemoHistories()).toHaveLength(historyCount);
    expect(listLocalTicketWorkSessions(ticket.id).total).toBe(1);

    expect(() =>
      createLocalTicketWorkSession({
        ticketId: ticket.id,
        currentUserName: "previous-worker",
        isInternal: true,
        payload: {
          ticketId: ticket.id,
          inputMode: "duration",
          durationMinutes: 15,
          nextStatus: "Pending",
        },
      }),
    ).toThrow(expect.objectContaining({ status: 403 }));

    expect(listLocalTicketWorkSessions(ticket.id).total).toBe(1);
    expect(getLocalDemoTickets()[0].work_minutes).toBe(25);
  });
});
