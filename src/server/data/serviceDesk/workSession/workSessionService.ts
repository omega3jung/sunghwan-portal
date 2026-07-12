import type { TicketStatus } from "@/domain/serviceDesk";
import { withPortalApiTransaction } from "@/server/shared/supabase/portalApiClient";

import {
  findActiveTicketViewRowById,
  updateTicketWorkProgressById,
} from "../ticket/ticketRepository";
import { createHistoryOfStatusChange } from "../ticketHistory";
import type { WorkSessionDto } from "./workSessionDto";
import { mapWorkSessionRowToDto } from "./workSessionMapper";
import {
  createWorkSessionRow,
  findWorkSessionRowsByTicketId,
  finishRunningWorkSessionRowsByTicketId,
  type WorkSessionRepositoryOptions,
} from "./workSessionRepository";

type WorkSessionServiceOptions = WorkSessionRepositoryOptions;
type WorkSessionStatus = Extract<TicketStatus, "Working" | "Pending" | "Resolved">;
type WorkSessionCreateInput = {
  ticketId: string;
  inputMode: "duration" | "range";
  durationMinutes?: number;
  startAt?: string;
  endAt?: string;
  trackedMinutes: number;
  nextStatus?: WorkSessionStatus;
  note?: string;
  currentUserName: string;
};

export async function getWorkSessionsByTicketId(
  ticketId: string,
  options?: WorkSessionServiceOptions,
): Promise<WorkSessionDto[]> {
  const rows = await findWorkSessionRowsByTicketId(ticketId, options);

  return rows.map(mapWorkSessionRowToDto);
}

export async function finishRunningWorkSessionsByTicketId(
  ticketId: string,
  endedAt: string,
  options?: WorkSessionServiceOptions,
): Promise<WorkSessionDto[]> {
  const rows = await finishRunningWorkSessionRowsByTicketId(
    ticketId,
    endedAt,
    options,
  );

  return rows.map(mapWorkSessionRowToDto);
}

export async function createWorkSession(
  input: WorkSessionCreateInput,
): Promise<WorkSessionDto> {
  return withPortalApiTransaction(async (query) => {
    const repositoryOptions: WorkSessionRepositoryOptions = { query };
    const ticket = await findActiveTicketViewRowById(input.ticketId, { query });

    if (!ticket) {
      throw createStatusError("Ticket not found.", 404);
    }

    if (
      ticket.tk_approval_step_id !== null ||
      !normalizeAssigneeUsernames(ticket.tk_assignee_usernames).includes(
        input.currentUserName,
      )
    ) {
      throw createStatusError("Only a current work assignee can track work.", 403);
    }

    if (!Number.isInteger(input.trackedMinutes) || input.trackedMinutes <= 0) {
      throw createStatusError("Tracked minutes must be positive.", 400);
    }

    const nextStatus =
      input.nextStatus && input.nextStatus !== ticket.tk_status
        ? input.nextStatus
        : undefined;

    if (
      (ticket.tk_status === "Assigned" || ticket.tk_status === "Pending") &&
      !nextStatus
    ) {
      throw createStatusError("A work status transition is required.", 409);
    }

    if (!isWorkSessionSourceStatus(ticket.tk_status)) {
      throw createStatusError("Invalid work session source status.", 409);
    }

    if (
      nextStatus &&
      !isAllowedWorkStatusTransition(ticket.tk_status, nextStatus)
    ) {
      throw createStatusError("Invalid work status transition.", 409);
    }

    const status = nextStatus ?? ticket.tk_status;
    const updatedTicket = await updateTicketWorkProgressById(
      input.ticketId,
      {
        trackedMinutes: input.trackedMinutes,
        status,
        assigneeUsername: input.currentUserName,
      },
      { query },
    );

    if (!updatedTicket) {
      throw createStatusError("Ticket work progress could not be updated.", 409);
    }

    const row = await createWorkSessionRow(
      {
        ticketId: input.ticketId,
        assigneeUsername: input.currentUserName,
        startAt: input.inputMode === "range" ? (input.startAt ?? null) : null,
        endAt: input.inputMode === "range" ? (input.endAt ?? null) : null,
        durationMinutes:
          input.inputMode === "duration" ? input.trackedMinutes : null,
        note: input.note?.trim() || null,
      },
      repositoryOptions,
    );

    if (!row) {
      throw createStatusError("Work session could not be created.", 409);
    }

    if (nextStatus) {
      await createHistoryOfStatusChange(
        {
          ticketId: input.ticketId,
          actionNo: null,
          actorUsername: input.currentUserName,
          fromStatus: ticket.tk_status,
          toStatus: nextStatus,
          metadata: {
            previousStatus: ticket.tk_status,
            nextStatus,
            trackedMinutes: input.trackedMinutes,
          },
        },
        { query },
      );
    }

    if (nextStatus === "Resolved") {
      await finishRunningWorkSessionsByTicketId(
        input.ticketId,
        new Date().toISOString(),
        repositoryOptions,
      );
    }

    return mapWorkSessionRowToDto(row);
  });
}

function isAllowedWorkStatusTransition(
  currentStatus: TicketStatus,
  nextStatus: WorkSessionStatus,
) {
  if (currentStatus === "Assigned") {
    return nextStatus === "Working";
  }

  if (currentStatus === "Working") {
    return nextStatus === "Pending" || nextStatus === "Resolved";
  }

  if (currentStatus === "Pending") {
    return nextStatus === "Working" || nextStatus === "Resolved";
  }

  return false;
}

function isWorkSessionSourceStatus(
  status: TicketStatus,
): status is Extract<TicketStatus, "Assigned" | "Working" | "Pending"> {
  return status === "Assigned" || status === "Working" || status === "Pending";
}

function normalizeAssigneeUsernames(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter(
        (item): item is string => typeof item === "string" && item.length > 0,
      )
    : [];
}

function createStatusError(message: string, status: number) {
  const error = new Error(message) as Error & { status: number };
  error.status = status;
  return error;
}
