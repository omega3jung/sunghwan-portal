import { NextResponse } from "next/server";

import {
  ServiceDeskApiError,
  tServiceDeskApi,
} from "@/app/api/service-desk/_shared/messages";
import { camelTicketActionMapper } from "@/feature/serviceDesk/ticketAction/api";

import { getLocalDemoActions, getLocalDemoHistories } from "../../state";
import { DbTicketActionLocalContext } from "../types";
import { getNextActionNo, getTicketContext } from "../utils";
import { createTicketAction } from "./actionRecord";
import { executeLocalAction } from "./execute";

export function localPost({
  ticketId,
  employeeUserName,
  content,
  action,
  isAdmin = false,
  isInternal = false,
}: DbTicketActionLocalContext) {
  try {
    const actionNo = getNextActionNo(ticketId, isInternal);
    const createdAt = new Date().toISOString();
    const ticketAction = createTicketAction({
      ticketId,
      employeeUserName,
      content,
      actionNo,
      createdAt,
    });
    const { history: createdHistory, updatedTicket } = executeLocalAction({
      ticketId,
      employeeUserName,
      content,
      actionNo,
      createdAt,
      isInternal,
      isAdmin,
      action,
    });

    const actions = getLocalDemoActions(isInternal);
    const histories = getLocalDemoHistories(isInternal);

    actions.push(ticketAction);
    histories.push(createdHistory);

    if (updatedTicket) {
      const { targetMock, index } = getTicketContext(ticketId, isInternal);
      targetMock.splice(index, 1, updatedTicket);
    }

    return NextResponse.json(camelTicketActionMapper([ticketAction])[0], {
      status: 201,
    });
  } catch (error) {
    const message =
      error instanceof ServiceDeskApiError
        ? error.message
        : error instanceof Error
          ? error.message
          : tServiceDeskApi("api.ticketCommand.localDemo.createFailed");
    const status = error instanceof ServiceDeskApiError ? error.status : 500;

    return NextResponse.json({ message }, { status });
  }
}
