import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ServiceDeskTicketViewRow } from "../ticket/ticketRow";
import type { WorkSessionRow } from "./workSessionRow";

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
  hasTicketWorkAssignmentHistory: vi.fn(),
}));
const updates = vi.hoisted(() => ({
  updateTicketWorkProgressById: vi.fn(),
}));
const history = vi.hoisted(() => ({
  createHistoryOfStatusChange: vi.fn(),
}));
const sessions = vi.hoisted(() => ({
  createWorkSessionRow: vi.fn(),
  findWorkSessionRowsByTicketId: vi.fn(),
  finishRunningWorkSessionRowsByTicketId: vi.fn(),
}));

vi.mock("@/server/shared/supabase/portalApiClient", () => transaction);
vi.mock("../ticket/ticketRepository", () => tickets);
vi.mock("../ticket/ticketUpdateRepository", () => updates);
vi.mock("../ticketHistory", () => history);
vi.mock("./workSessionRepository", () => sessions);

import { createWorkSession } from "./workSessionService";

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
    tk_status: "Assigned",
    tk_priority: "medium",
    tk_risk_level: "medium",
    tk_assignee_usernames: ["worker"],
    tk_assignees: [],
    tk_work_minutes: 0,
    tka_last_comment_at: null,
    tka_last_comment_email: null,
    tka_last_user_activity_at: null,
    tka_last_user_activity_email: null,
    tk_close_reason: null,
    tk_merged_into_ticket_id: null,
    tk_merged_into_ticket_no: null,
    tkh_closed_at: null,
    tk_due_at: "2026-01-10T00:00:00.000Z",
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

const createdSession: WorkSessionRow = {
  ws_id: 1,
  ws_ticket_id: "ticket-1",
  ws_assignee_username: "worker",
  ws_start_at: null,
  ws_end_at: null,
  ws_duration_minutes: 30,
  ws_note: "investigated",
  ws_created_at: "2026-01-01T01:00:00.000Z",
  ws_updated_at: null,
};

describe("work session workflow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tickets.findActiveTicketViewRowById.mockResolvedValue(ticketRow());
    tickets.hasTicketWorkAssignmentHistory.mockResolvedValue(false);
    updates.updateTicketWorkProgressById.mockResolvedValue(
      ticketRow({ tk_status: "Working" }),
    );
    sessions.createWorkSessionRow.mockResolvedValue(createdSession);
    sessions.finishRunningWorkSessionRowsByTicketId.mockResolvedValue([]);
  });

  it("rejects a user with no current or historical work assignment before any mutation", async () => {
    await expect(
      createWorkSession({
        ticketId: "ticket-1",
        inputMode: "duration",
        durationMinutes: 30,
        currentUserName: "outsider",
      }),
    ).rejects.toMatchObject({ status: 403 });

    expect(updates.updateTicketWorkProgressById).not.toHaveBeenCalled();
    expect(sessions.createWorkSessionRow).not.toHaveBeenCalled();
    expect(history.createHistoryOfStatusChange).not.toHaveBeenCalled();
  });

  it("requires a current assignee to move an Assigned ticket into Working", async () => {
    await expect(
      createWorkSession({
        ticketId: "ticket-1",
        inputMode: "duration",
        durationMinutes: 30,
        currentUserName: "worker",
      }),
    ).rejects.toMatchObject({ status: 409 });

    expect(sessions.createWorkSessionRow).not.toHaveBeenCalled();
  });

  it("records work, advances status, and creates matching immutable history", async () => {
    const result = await createWorkSession({
      ticketId: "ticket-1",
      inputMode: "duration",
      durationMinutes: 30,
      nextStatus: "Working",
      note: "  investigated  ",
      currentUserName: "worker",
    });

    expect(result).toMatchObject({
      ticket_id: "ticket-1",
      assignee_username: "worker",
      duration_minutes: 30,
    });
    expect(updates.updateTicketWorkProgressById).toHaveBeenCalledWith(
      "ticket-1",
      { status: "Working", assigneeUsername: "worker" },
      { query: transaction.query },
    );
    expect(sessions.createWorkSessionRow).toHaveBeenCalledWith(
      expect.objectContaining({ durationMinutes: 30, note: "investigated" }),
      { query: transaction.query },
    );
    expect(history.createHistoryOfStatusChange).toHaveBeenCalledWith(
      {
        ticketId: "ticket-1",
        actionNo: null,
        actorUsername: "worker",
        fromStatus: "Assigned",
        toStatus: "Working",
        metadata: {
          previousStatus: "Assigned",
          nextStatus: "Working",
          trackedMinutes: 30,
        },
      },
      { query: transaction.query },
    );
  });

  it("lets a previous assignee add evidence but not change current status", async () => {
    tickets.findActiveTicketViewRowById.mockResolvedValue(
      ticketRow({
        tk_status: "Working",
        tk_assignee_usernames: ["current-worker"],
      }),
    );
    tickets.hasTicketWorkAssignmentHistory.mockResolvedValue(true);

    await createWorkSession({
      ticketId: "ticket-1",
      inputMode: "duration",
      durationMinutes: 15,
      currentUserName: "previous-worker",
    });

    expect(updates.updateTicketWorkProgressById).not.toHaveBeenCalled();
    expect(history.createHistoryOfStatusChange).not.toHaveBeenCalled();

    await expect(
      createWorkSession({
        ticketId: "ticket-1",
        inputMode: "duration",
        durationMinutes: 15,
        nextStatus: "Pending",
        currentUserName: "previous-worker",
      }),
    ).rejects.toMatchObject({ status: 403 });
  });

  it("normalizes a time range and finishes running sessions when resolving", async () => {
    tickets.findActiveTicketViewRowById.mockResolvedValue(
      ticketRow({ tk_status: "Working" }),
    );
    sessions.createWorkSessionRow.mockResolvedValue({
      ...createdSession,
      ws_start_at: "2026-01-01T01:00:00.000Z",
      ws_end_at: "2026-01-01T02:30:59.000Z",
      ws_duration_minutes: 90,
    });

    await createWorkSession({
      ticketId: "ticket-1",
      inputMode: "range",
      startAt: "2026-01-01T01:00:00.000Z",
      endAt: "2026-01-01T02:30:59.000Z",
      nextStatus: "Resolved",
      currentUserName: "worker",
    });

    expect(sessions.createWorkSessionRow).toHaveBeenCalledWith(
      expect.objectContaining({ durationMinutes: 90 }),
      { query: transaction.query },
    );
    expect(
      sessions.finishRunningWorkSessionRowsByTicketId,
    ).toHaveBeenCalledWith(
      "ticket-1",
      expect.any(String),
      { query: transaction.query },
    );
  });
});
