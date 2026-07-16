import { NextResponse } from "next/server";

import {
  ApiError,
  resolveApiErrorMessage,
} from "@/lib/application/api";
import { camelTicketActionMapper } from "@/lib/application/contracts/serviceDesk";

import { getLocalDemoActions, getLocalDemoHistories } from "../state";
import { createTicketAction } from "./actionRecord";
import { executeLocalAction } from "./execute";
import { DbTicketActionLocalContext } from "./types";
import { getNextActionNo, getTicketContext } from "./utils";

export async function localPost({
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
    const { histories: createdHistories, updatedTicket } =
      await executeLocalAction({
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
    histories.push(...createdHistories);

    if (updatedTicket) {
      const { targetMock, index } = getTicketContext(ticketId, isInternal);
      targetMock.splice(index, 1, updatedTicket);
    }

    return NextResponse.json(camelTicketActionMapper([ticketAction])[0], {
      status: 201,
    });
  } catch (error) {
    const message =
      error instanceof ApiError
        ? resolveApiErrorMessage(error.messageKey, error.options)
        : error instanceof Error
          ? error.message
          : resolveApiErrorMessage("serviceDesk.ticketCommand.localDemo.createFailed");
    const status = error instanceof ApiError ? error.status : 500;

    return NextResponse.json({ message }, { status });
  }
}
