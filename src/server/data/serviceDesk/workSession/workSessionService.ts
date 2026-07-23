import type { TicketStatus } from "@/domain/serviceDesk";
import { createServiceDeskStatusError as createStatusError } from "@/server/data/serviceDesk/shared";
import { withPortalApiTransaction } from "@/server/shared/supabase/portalApiClient";
import { normalizeNonNegativeInteger } from "@/shared/utils/value";

import {
  findActiveTicketViewRowById,
  hasTicketWorkAssignmentHistory,
} from "../ticket/ticketRepository";
import { updateTicketWorkProgressById } from "../ticket/ticketUpdateRepository";
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
  nextStatus?: WorkSessionStatus;
  note?: string;
  currentUserName: string;
};

const MS_PER_MINUTE = 60 * 1000;

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

    const currentAssigneeUsernames = normalizeAssigneeUsernames(
      ticket.tk_assignee_usernames,
    );
    const isCurrentWorkAssignee =
      ticket.tk_approval_step_id === null &&
      currentAssigneeUsernames.includes(input.currentUserName);
    const hasBeenWorker =
      isCurrentWorkAssignee ||
      (await hasTicketWorkAssignmentHistory(
        input.ticketId,
        input.currentUserName,
        repositoryOptions,
      ));

    if (!hasBeenWorker) {
      throw createStatusError(
        "Only a current or previous work assignee can track work.",
        403,
      );
    }

    const trackedMinutes = resolveTrackedMinutes(input);

    if (trackedMinutes <= 0) {
      throw createStatusError("Tracked minutes must be positive.", 400);
    }

    const nextStatus =
      input.nextStatus && input.nextStatus !== ticket.tk_status
        ? input.nextStatus
        : undefined;

    if (nextStatus && !isCurrentWorkAssignee) {
      throw createStatusError(
        "Only a current work assignee can change status.",
        403,
      );
    }

    if (
      isCurrentWorkAssignee &&
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

    if (nextStatus) {
      const updatedTicket = await updateTicketWorkProgressById(
        input.ticketId,
        {
          status: nextStatus,
          assigneeUsername: input.currentUserName,
        },
        { query },
      );

      if (!updatedTicket) {
        throw createStatusError(
          "Ticket work progress could not be updated.",
          409,
        );
      }
    }

    const row = await createWorkSessionRow(
      {
        ticketId: input.ticketId,
        assigneeUsername: input.currentUserName,
        startAt: input.startAt ?? null,
        endAt: input.endAt ?? null,
        durationMinutes: trackedMinutes,
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
            trackedMinutes,
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

function resolveTrackedMinutes(input: WorkSessionCreateInput) {
  if (input.inputMode === "range") {
    const start = input.startAt ? new Date(input.startAt).getTime() : Number.NaN;
    const end = input.endAt ? new Date(input.endAt).getTime() : Number.NaN;

    if (Number.isFinite(start) && Number.isFinite(end) && end > start) {
      return Math.floor((end - start) / MS_PER_MINUTE);
    }

    return 0;
  }

  return normalizeNonNegativeInteger(input.durationMinutes);
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
