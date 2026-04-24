import { NextRequest, NextResponse } from "next/server";

import {
  camelTicketTrackTimeMapper,
  DbTicketTrackTime,
  mapTicketTrackTimeListPayload,
  mapTicketTrackTimePayload,
} from "@/api/serviceDesk/ticket/trackTime";
import { internalHistoriesMocks } from "@/app/_mocks/scenarios/serviceDesk/internalHistoriesMock";
import {
  getCurrentEmployeeUserName,
  isInternalUser,
  isRemoteRequest,
  proxyJson,
} from "@/app/api/_helpers";
import { TicketIdRouteContext } from "@/app/api/_helpers/types";
import {
  ServiceDeskApiError,
  tServiceDeskApi,
} from "@/app/api/service-desk/_shared/messages";
import {
  canChangeStatus,
  getCurrentTrackedMinutes,
} from "@/feature/serviceDesk/ticket/trackTime/components/TrackTimeTool/payload";
import { TICKET_TRACK_TIME_STATUS_OPTIONS } from "@/feature/serviceDesk/ticket/trackTime/constants";
import type {
  TicketTrackTimeStatus,
  TicketTrackTimeSubmitPayload,
} from "@/feature/serviceDesk/ticket/trackTime/types";

import {
  createUpdatedTicket,
  getMaxHistoryNo,
  getTicketContext,
} from "../command/[action]/utils";

const localTrackTimes: DbTicketTrackTime[] = [];

const isTrackTimeStatus = (value: unknown): value is TicketTrackTimeStatus =>
  TICKET_TRACK_TIME_STATUS_OPTIONS.includes(value as TicketTrackTimeStatus);

const getNextTrackTimeNo = (ticketId: string) => {
  const items = localTrackTimes
    .filter((item) => item.ticket_id === ticketId)
    .map((item) => item.track_time_no);

  return items.length ? Math.max(...items) + 1 : 1;
};

const resolveServerTrackedMinutes = (payload: TicketTrackTimeSubmitPayload) => {
  return getCurrentTrackedMinutes({
    inputMode: payload.inputMode,
    durationValues: { durationMinutes: payload.durationMinutes },
    rangeValues: { startAt: payload.startAt, endAt: payload.endAt },
  });
};

const validatePayload = (
  ticketId: string,
  payload: TicketTrackTimeSubmitPayload,
) => {
  if (payload.ticketId !== ticketId) {
    throw new ServiceDeskApiError(
      "api.ticketTrackTime.localDemo.ticketMismatch",
      400,
    );
  }

  if (payload.nextStatus && !isTrackTimeStatus(payload.nextStatus)) {
    throw new ServiceDeskApiError(
      "api.ticketTrackTime.localDemo.invalidStatus",
      400,
      { value: payload.nextStatus },
    );
  }

  const trackedMinutes = resolveServerTrackedMinutes(payload);

  if (trackedMinutes <= 0) {
    throw new ServiceDeskApiError(
      "api.ticketTrackTime.localDemo.invalidTrackedMinutes",
      400,
    );
  }

  return trackedMinutes;
};

export async function GET(request: NextRequest, context: TicketIdRouteContext) {
  const { ticketId } = context.params;
  const isRemote = await isRemoteRequest(request);

  if (!isRemote) {
    const items = localTrackTimes.filter((item) => item.ticket_id === ticketId);

    return NextResponse.json({
      items: camelTicketTrackTimeMapper(items),
    });
  }

  return proxyJson(request, {
    path: `/service-desk/tickets/${ticketId}/track-time`,
    errorMessage: tServiceDeskApi("api.ticketTrackTime.fetchList"),
    mapData: mapTicketTrackTimeListPayload,
  });
}

export async function POST(
  request: NextRequest,
  context: TicketIdRouteContext,
) {
  const { ticketId } = context.params;
  const isRemote = await isRemoteRequest(request);
  const payload = (await request.json()) as TicketTrackTimeSubmitPayload;

  if (isRemote) {
    return proxyJson(request, {
      method: "POST",
      path: `/service-desk/tickets/${ticketId}/track-time`,
      body: payload,
      errorMessage: tServiceDeskApi("api.ticketTrackTime.create"),
      mapData: mapTicketTrackTimePayload,
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
        previousTrackedMinutes: ticket.track_time_minutes,
        currentTrackedMinutes: trackedMinutes,
      })
    ) {
      throw new ServiceDeskApiError(
        "api.ticketTrackTime.localDemo.statusRequiresTime",
        400,
      );
    }

    const createdAt = new Date().toISOString();
    const trackTime: DbTicketTrackTime = {
      ticket_id: ticketId,
      track_time_no: getNextTrackTimeNo(ticketId),
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
        track_time_minutes: ticket.track_time_minutes + trackedMinutes,
        ...(nextStatus ? { status: nextStatus } : {}),
      },
      createdAt,
    );

    localTrackTimes.push(trackTime);
    internalHistoriesMocks.push({
      ticket_id: ticketId,
      history_no: getMaxHistoryNo(ticketId),
      type: "TRACK_TIME",
      action: "UPDATED",
      actor_id: employeeUserName,
      action_no: null,
      from_value: ticket.track_time_minutes,
      to_value: updatedTicket.track_time_minutes,
      metadata: payload,
      created_at: createdAt,
    });

    if (nextStatus) {
      internalHistoriesMocks.push({
        ticket_id: ticketId,
        history_no: getMaxHistoryNo(ticketId),
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

    return NextResponse.json(camelTicketTrackTimeMapper([trackTime])[0], {
      status: 201,
    });
  } catch (error) {
    const message =
      error instanceof ServiceDeskApiError
        ? error.message
        : error instanceof Error
          ? error.message
          : tServiceDeskApi("api.ticketTrackTime.create");
    const status = error instanceof ServiceDeskApiError ? error.status : 500;

    return NextResponse.json({ message }, { status });
  }
}
