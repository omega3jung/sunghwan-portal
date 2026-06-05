import { NextRequest, NextResponse } from "next/server";

import {
  getCurrentEmployeeUserName,
  isInternalUser,
  isRemoteRequest,
} from "@/app/api/_helpers";
import { portalApiJson } from "@/app/api/_helpers/portalApiJson";
import { TicketIdRouteContext } from "@/app/api/_helpers/types";
import {
  ServiceDeskApiError,
  tServiceDeskApi,
} from "@/app/api/service-desk/_shared/messages";
import {
  camelTicketWorkSessionMapper,
  DbTicketWorkSession,
  mapTicketWorkSessionListPayload,
  mapTicketWorkSessionPayload,
  TICKET_WORK_SESSION_STATUS_OPTIONS,
  TicketWorkSessionStatus,
  TicketWorkSessionSubmitPayload,
} from "@/feature/serviceDesk/ticketWorkSession";
import {
  canChangeStatus,
  getCurrentTrackedMinutes,
} from "@/feature/serviceDesk/ticketWorkSession/components/WorkSessionTool/payload";
import {
  createUpdatedTicket,
  getMaxHistoryNo,
  getTicketContext,
} from "@/server/serviceDesk/ticket/command/utils";
import { getLocalDemoHistories } from "@/server/serviceDesk/ticket/state";

const localWorkSessions: DbTicketWorkSession[] = [];

const isWorkSessionStatus = (
  value: unknown,
): value is TicketWorkSessionStatus =>
  TICKET_WORK_SESSION_STATUS_OPTIONS.includes(value as TicketWorkSessionStatus);

const getNextWorkSessionNo = (ticketId: string) => {
  const items = localWorkSessions
    .filter((item) => item.ticket_id === ticketId)
    .map((item) => item.work_session_no);

  return items.length ? Math.max(...items) + 1 : 1;
};

const resolveServerTrackedMinutes = (
  payload: TicketWorkSessionSubmitPayload,
) => {
  return getCurrentTrackedMinutes({
    inputMode: payload.inputMode,
    durationValues: { durationMinutes: payload.durationMinutes },
    rangeValues: { startAt: payload.startAt, endAt: payload.endAt },
  });
};

const validatePayload = (
  ticketId: string,
  payload: TicketWorkSessionSubmitPayload,
) => {
  if (payload.ticketId !== ticketId) {
    throw new ServiceDeskApiError(
      "api.ticketWorkSession.localDemo.ticketMismatch",
      400,
    );
  }

  if (payload.nextStatus && !isWorkSessionStatus(payload.nextStatus)) {
    throw new ServiceDeskApiError(
      "api.ticketWorkSession.localDemo.invalidStatus",
      400,
      { value: payload.nextStatus },
    );
  }

  const trackedMinutes = resolveServerTrackedMinutes(payload);

  if (trackedMinutes <= 0) {
    throw new ServiceDeskApiError(
      "api.ticketWorkSession.localDemo.invalidTrackedMinutes",
      400,
    );
  }

  return trackedMinutes;
};

export async function GET(request: NextRequest, context: TicketIdRouteContext) {
  const { ticketId } = context.params;
  const isRemote = await isRemoteRequest(request);

  if (!isRemote) {
    const items = localWorkSessions.filter(
      (item) => item.ticket_id === ticketId,
    );

    return NextResponse.json({
      items: camelTicketWorkSessionMapper(items),
    });
  }

  return portalApiJson(request, {
    path: `/service-desk/tickets/${ticketId}/work-session`,
    errorMessage: tServiceDeskApi("api.ticketWorkSession.fetchList"),
    mapData: mapTicketWorkSessionListPayload,
  });
}

export async function POST(
  request: NextRequest,
  context: TicketIdRouteContext,
) {
  const { ticketId } = context.params;
  const isRemote = await isRemoteRequest(request);
  const payload = (await request.json()) as TicketWorkSessionSubmitPayload;

  if (isRemote) {
    return portalApiJson(request, {
      method: "POST",
      path: `/service-desk/tickets/${ticketId}/work-session`,
      body: payload,
      errorMessage: tServiceDeskApi("api.ticketWorkSession.create"),
      mapData: mapTicketWorkSessionPayload,
    });
  }

  try {
    const employeeUserName = await getCurrentEmployeeUserName(request);

    if (employeeUserName === null) {
      return NextResponse.json(
        { message: tServiceDeskApi("api.ticketCommand.employeeUnavailable") },
        { status: 401 },
      );
    }

    const isInternal = await isInternalUser(request);
    const { ticket, targetMock, index } = getTicketContext(
      ticketId,
      isInternal,
    );
    const trackedMinutes = validatePayload(ticketId, payload);
    const nextStatus =
      payload.nextStatus && payload.nextStatus !== ticket.status
        ? payload.nextStatus
        : undefined;

    if (
      nextStatus &&
      !canChangeStatus({
        previousTrackedMinutes: ticket.work_minutes,
        currentTrackedMinutes: trackedMinutes,
      })
    ) {
      throw new ServiceDeskApiError(
        "api.ticketWorkSession.localDemo.statusRequiresTime",
        400,
      );
    }

    const createdAt = new Date().toISOString();
    const workSession: DbTicketWorkSession = {
      ticket_id: ticketId,
      work_session_no: getNextWorkSessionNo(ticketId),
      assignee_id: employeeUserName,
      start_at: payload.startAt ?? createdAt,
      end_at: payload.inputMode === "range" ? (payload.endAt ?? null) : null,
      duration_minutes:
        payload.inputMode === "duration" ? trackedMinutes : null,
      note: payload.note?.trim() || null,
      created_at: createdAt,
      updated_at: null,
    };
    const updatedTicket = createUpdatedTicket(
      ticket,
      {
        work_minutes: ticket.work_minutes + trackedMinutes,
        ...(nextStatus ? { status: nextStatus } : {}),
      },
      createdAt,
    );

    localWorkSessions.push(workSession);

    const histories = getLocalDemoHistories(isInternal);

    histories.push({
      ticket_id: ticketId,
      history_no: getMaxHistoryNo(ticketId, isInternal),
      type: "WORK_SESSION",
      action: "UPDATED",
      actor_id: employeeUserName,
      action_no: null,
      from_value: ticket.work_minutes,
      to_value: updatedTicket.work_minutes,
      metadata: payload,
      created_at: createdAt,
    });

    if (nextStatus) {
      histories.push({
        ticket_id: ticketId,
        history_no: getMaxHistoryNo(ticketId, isInternal),
        type: "STATUS",
        action: "UPDATED",
        actor_id: employeeUserName,
        action_no: null,
        from_value: ticket.status,
        to_value: nextStatus,
        metadata: payload,
        created_at: createdAt,
      });
    }

    targetMock.splice(index, 1, updatedTicket);

    return NextResponse.json(camelTicketWorkSessionMapper([workSession])[0], {
      status: 201,
    });
  } catch (error) {
    const message =
      error instanceof ServiceDeskApiError
        ? error.message
        : error instanceof Error
          ? error.message
          : tServiceDeskApi("api.ticketWorkSession.create");
    const status = error instanceof ServiceDeskApiError ? error.status : 500;

    return NextResponse.json({ message }, { status });
  }
}
