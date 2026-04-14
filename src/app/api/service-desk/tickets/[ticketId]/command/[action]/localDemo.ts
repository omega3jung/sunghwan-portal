import { NextResponse } from "next/server";

import {
  camelTicketActionMapper,
  DbTicketAction,
} from "@/api/serviceDesk/ticket/action";
import { DbTicketHistory } from "@/api/serviceDesk/ticket/history";
import { internalActionsMocks } from "@/app/_mocks/scenarios/serviceDesk/internalActionsMock";
import { internalHistoriesMocks } from "@/app/_mocks/scenarios/serviceDesk/internalHistoriesMock";
import { TicketActionFormValues } from "@/feature/serviceDesk/ticket/forms/action";
import { mapFileToAttach } from "@/feature/serviceDesk/ticket/utils/mapFileToAttach";

import { TicketActionApiType } from "./types";

type DbTicketHistoryLocalContext = {
  ticketId: string;
  userId: string;
  content: TicketActionFormValues;
  actionNo: number;
};

const getMaxHistoryNo = (ticketId: string) => {
  const items = internalHistoriesMocks
    .filter((item) => item.ticket_id === ticketId)
    .map((action) => action.history_no);

  return items.length ? Math.max(...items) + 1 : 1;
};

const getNextActionNo = (ticketId: string) => {
  const items = internalActionsMocks
    .filter((item) => item.ticket_id === ticketId && item.active)
    .map((action) => action.action_no);

  return items.length ? Math.max(...items) + 1 : 1;
};

const createComment = ({
  ticketId,
  userId,
  content,
  actionNo,
}: DbTicketHistoryLocalContext): DbTicketHistory => {
  const historyNo = getMaxHistoryNo(ticketId);

  return {
    ticket_id: ticketId,
    history_no: historyNo,

    type: "COMMENT",
    action: "CREATED",

    actor_id: userId,
    action_no: actionNo.toString(),

    metadata: content,
    created_at: new Date().toISOString(),
  };
};

const createNote = ({
  ticketId,
  userId,
  content,
  actionNo,
}: DbTicketHistoryLocalContext): DbTicketHistory => {
  const historyNo = getMaxHistoryNo(ticketId);

  return {
    ticket_id: ticketId,
    history_no: historyNo,

    type: "NOTE",
    action: "CREATED",

    actor_id: userId,
    action_no: actionNo.toString(),

    metadata: content,
    created_at: new Date().toISOString(),
  };
};

const assignTicket = ({
  ticketId,
  userId,
  content,
  actionNo,
}: DbTicketHistoryLocalContext): DbTicketHistory => {
  const historyNo = getMaxHistoryNo(ticketId);

  return {
    ticket_id: ticketId,
    history_no: historyNo,

    type: "ASSIGNMENT",
    action: "UPDATED",

    actor_id: userId,
    action_no: actionNo.toString(),

    metadata: content,
    created_at: new Date().toISOString(),
  };
};

const rejectTicket = ({
  ticketId,
  userId,
  content,
  actionNo,
}: DbTicketHistoryLocalContext): DbTicketHistory => {
  const historyNo = getMaxHistoryNo(ticketId);

  return {
    ticket_id: ticketId,
    history_no: historyNo,

    type: "TICKET",
    action: "TICKET_REJECTED",

    actor_id: userId,
    action_no: actionNo.toString(),
    to_value: "Rejected",

    metadata: content,
    created_at: new Date().toISOString(),
  };
};

const mergeTicket = ({
  ticketId,
  userId,
  content,
  actionNo,
}: DbTicketHistoryLocalContext): DbTicketHistory => {
  const historyNo = getMaxHistoryNo(ticketId);

  return {
    ticket_id: ticketId,
    history_no: historyNo,

    type: "TICKET",
    action: "TICKET_MERGED",

    actor_id: userId,
    action_no: actionNo.toString(),

    metadata: content,
    created_at: new Date().toISOString(),
  };
};

const adjustTicket = ({
  ticketId,
  userId,
  content,
  actionNo,
}: DbTicketHistoryLocalContext): DbTicketHistory => {
  const historyNo = getMaxHistoryNo(ticketId);

  return {
    ticket_id: ticketId,
    history_no: historyNo,

    type: "PLANNING",
    action: "UPDATED",

    actor_id: userId,
    action_no: actionNo.toString(),

    metadata: content,
    created_at: new Date().toISOString(),
  };
};

const actionHandlerMap: Record<
  TicketActionApiType,
  (values: DbTicketHistoryLocalContext) => DbTicketHistory
> = {
  comment: createComment,
  note: createNote,
  assign: assignTicket,
  reject: rejectTicket,
  merge: mergeTicket,
  adjust: adjustTicket,
};

type DbTicketActionLocalContext = {
  ticketId: string;
  userId: string;
  action: TicketActionApiType;
  content: TicketActionFormValues;
};

export function localPost({
  ticketId,
  userId,
  content,
  action,
}: DbTicketActionLocalContext) {
  try {
    const actionNo = getNextActionNo(ticketId);
    const createdAt = new Date().toISOString();

    const ticketAction: DbTicketAction = {
      ticket_id: ticketId,
      action_no: actionNo,

      action_type: content.actionType,
      content: content.content,
      owner_id: userId,

      created_at: createdAt,
      updated_at: null,
      active: true,

      files: mapFileToAttach(content.files, "file"),
      images: mapFileToAttach(content.images, "image"),
    };

    const createdHistory = actionHandlerMap[action]({
      ticketId,
      userId,
      content,
      actionNo,
    });

    internalActionsMocks.push(ticketAction);
    internalHistoriesMocks.push(createdHistory);

    return NextResponse.json(camelTicketActionMapper([ticketAction])[0], {
      status: 201,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to create action" },
      { status: 500 },
    );
  }
}
