import {
  camelTicketWorkSessionMapper,
  type DbTicketWorkSession,
} from "@/feature/serviceDesk/ticketWorkSession/api";
import { TICKET_WORK_SESSION_STATUS_OPTIONS } from "@/feature/serviceDesk/ticketWorkSession/constants";
import type {
  TicketWorkSessionStatus,
  TicketWorkSessionSubmitPayload,
} from "@/feature/serviceDesk/ticketWorkSession/types";
import {
  canChangeStatus,
  getCurrentTrackedMinutes,
} from "@/feature/serviceDesk/ticketWorkSession/utils";
import { ApiError } from "@/lib/application/api";
import { normalizeNonNegativeInteger } from "@/shared/utils/value";

import {
  createUpdatedTicket,
  getMaxHistoryNo,
  getTicketContext,
} from "./command/utils";
import { getLocalDemoHistories } from "./state";
import { hasLocalTicketWorkAssignmentHistory } from "./workerHistory";

const localWorkSessions: DbTicketWorkSession[] = [];

export function listLocalTicketWorkSessions(ticketId: string) {
  const items = localWorkSessions.filter((item) => item.ticket_id === ticketId);

  return {
    items: camelTicketWorkSessionMapper(items),
    total: items.length,
  };
}

export function createLocalTicketWorkSession({
  ticketId,
  currentUserName,
  isInternal,
  payload,
}: {
  ticketId: string;
  currentUserName: string;
  isInternal: boolean;
  payload: TicketWorkSessionSubmitPayload;
}) {
  const { ticket, targetMock, index } = getTicketContext(ticketId, isInternal);
  const authorization = resolveWorkSessionAuthorization(
    ticket,
    currentUserName,
    isInternal,
  );
  const trackedMinutes = validatePayload(
    ticketId,
    ticket.status,
    payload,
    authorization,
  );
  const previousTrackedMinutes = normalizeNonNegativeInteger(
    ticket.work_minutes,
  );
  const nextStatus =
    payload.nextStatus && payload.nextStatus !== ticket.status
      ? payload.nextStatus
      : undefined;

  if (
    nextStatus &&
    !canChangeStatus({
      previousTrackedMinutes,
      currentTrackedMinutes: trackedMinutes,
    })
  ) {
    throw new ApiError(
      "serviceDesk.ticketWorkSession.localDemo.statusRequiresTime",
      400,
    );
  }

  const createdAt = new Date().toISOString();
  const workSession: DbTicketWorkSession = {
    ticket_id: ticketId,
    work_session_no: getNextWorkSessionNo(ticketId),
    assignee_username: currentUserName,
    start_at: payload.startAt ?? createdAt,
    end_at: payload.endAt ?? null,
    duration_minutes: trackedMinutes,
    note: payload.note?.trim() || null,
    created_at: createdAt,
    updated_at: null,
  };
  const updatedTicket = createUpdatedTicket(
    ticket,
    {
      work_minutes: previousTrackedMinutes + trackedMinutes,
      ...(nextStatus ? { status: nextStatus } : {}),
    },
    createdAt,
  );

  localWorkSessions.push(workSession);

  if (nextStatus) {
    getLocalDemoHistories(isInternal).push({
      ticket_id: ticketId,
      history_no: getMaxHistoryNo(ticketId, isInternal),
      type: "STATUS",
      event: "STATUS_UPDATED",
      source: "USER_ACTION",
      actor_username: currentUserName,
      action_no: null,
      from_value: { status: ticket.status },
      to_value: { status: nextStatus },
      metadata: {
        ...payload,
        previousStatus: ticket.status,
        nextStatus,
      },
      created_at: createdAt,
    });
  }

  targetMock.splice(index, 1, updatedTicket);
  return camelTicketWorkSessionMapper([workSession])[0];
}

function getNextWorkSessionNo(ticketId: string) {
  const sessionNumbers = localWorkSessions
    .filter((item) => item.ticket_id === ticketId)
    .map((item) => item.work_session_no);

  return sessionNumbers.length ? Math.max(...sessionNumbers) + 1 : 1;
}

function validatePayload(
  ticketId: string,
  ticketStatus: string,
  payload: TicketWorkSessionSubmitPayload,
  { isCurrentWorkAssignee }: { isCurrentWorkAssignee: boolean },
) {
  if (payload.ticketId !== ticketId) {
    throw new ApiError(
      "serviceDesk.ticketWorkSession.localDemo.ticketMismatch",
      400,
    );
  }

  if (payload.nextStatus && !isWorkSessionStatus(payload.nextStatus)) {
    throw new ApiError(
      "serviceDesk.ticketWorkSession.localDemo.invalidStatus",
      400,
      { value: payload.nextStatus },
    );
  }

  if (
    payload.nextStatus &&
    payload.nextStatus !== ticketStatus &&
    !isAllowedWorkStatusTransition(ticketStatus, payload.nextStatus)
  ) {
    throw new ApiError(
      "serviceDesk.ticketWorkSession.localDemo.invalidStatusTransition",
      409,
      { from: ticketStatus, to: payload.nextStatus },
    );
  }

  if (payload.nextStatus && !isCurrentWorkAssignee) {
    throw new ApiError(
      "serviceDesk.ticketWorkSession.localDemo.assigneeForbidden",
      403,
    );
  }

  if (
    isCurrentWorkAssignee &&
    (ticketStatus === "Assigned" || ticketStatus === "Pending") &&
    (!payload.nextStatus || payload.nextStatus === ticketStatus)
  ) {
    throw new ApiError(
      "serviceDesk.ticketWorkSession.localDemo.statusTransitionRequired",
      409,
      { status: ticketStatus },
    );
  }

  if (!["Assigned", "Working", "Pending"].includes(ticketStatus)) {
    throw new ApiError(
      "serviceDesk.ticketWorkSession.localDemo.invalidStatusTransition",
      409,
      { from: ticketStatus },
    );
  }

  const trackedMinutes = getCurrentTrackedMinutes({
    inputMode: payload.inputMode,
    durationValues: { durationMinutes: payload.durationMinutes },
    rangeValues: { startAt: payload.startAt, endAt: payload.endAt },
  });

  if (trackedMinutes <= 0) {
    throw new ApiError(
      "serviceDesk.ticketWorkSession.localDemo.invalidTrackedMinutes",
      400,
    );
  }

  return trackedMinutes;
}

function isWorkSessionStatus(value: unknown): value is TicketWorkSessionStatus {
  return TICKET_WORK_SESSION_STATUS_OPTIONS.includes(
    value as TicketWorkSessionStatus,
  );
}

function isAllowedWorkStatusTransition(
  currentStatus: string,
  nextStatus: TicketWorkSessionStatus,
) {
  if (currentStatus === "Assigned") return nextStatus === "Working";
  if (currentStatus === "Working") {
    return nextStatus === "Pending" || nextStatus === "Resolved";
  }
  if (currentStatus === "Pending") {
    return nextStatus === "Working" || nextStatus === "Resolved";
  }
  return false;
}

function resolveWorkSessionAuthorization(
  ticket: ReturnType<typeof getTicketContext>["ticket"],
  currentUserName: string,
  isInternal: boolean,
) {
  const isCurrentWorkAssignee =
    ticket.approval_step_id === null &&
    ticket.assignee_usernames.includes(currentUserName);
  const hasBeenWorker =
    isCurrentWorkAssignee ||
    hasLocalTicketWorkAssignmentHistory({
      isInternal,
      ticketId: ticket.id,
      username: currentUserName,
    });

  if (!hasBeenWorker) {
    throw new ApiError(
      "serviceDesk.ticketWorkSession.localDemo.assigneeForbidden",
      403,
      { ticketId: ticket.id, username: currentUserName },
    );
  }

  return { isCurrentWorkAssignee };
}
