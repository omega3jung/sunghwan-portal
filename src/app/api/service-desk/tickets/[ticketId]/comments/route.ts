import { NextRequest, NextResponse } from "next/server";

import {
  camelTicketCommentMapper,
  DbTicketComment,
  mapTicketCommentListPayload,
  mapTicketCommentPayload,
} from "@/api/serviceDesk/ticket/comment";
import { internalCommentsMocks } from "@/app/_mocks/scenarios/serviceDesk/comments/internalCommentsMock";
import {
  clientTicketsMocks,
  internalTicketsMocks,
} from "@/app/_mocks/scenarios/serviceDesk/tickets";
import {
  getEffectiveUserId,
  isInternalUser,
  isRemoteRequest,
  proxyJson,
} from "@/app/api/_helpers";
import { TicketIdRouteContext } from "@/app/api/_helpers/types";
import { Attach } from "@/domain/serviceDesk";
import { TicketCommentFormValues } from "@/feature/serviceDesk/ticket/forms/comment";

export async function GET(request: NextRequest, context: TicketIdRouteContext) {
  const { ticketId } = context.params;
  const isRemote = await isRemoteRequest(request);

  if (!isRemote) {
    const isInternal = await isInternalUser(request);
    const tickets = isInternal ? internalTicketsMocks : clientTicketsMocks;
    const ticket = tickets.find((item) => item.id === ticketId);

    if (!ticket) {
      return NextResponse.json(
        { message: "Ticket not found" },
        { status: 404 },
      );
    }

    const items = (isInternal ? internalCommentsMocks : []).filter(
      (item) => item.ticket_id === ticketId,
    );

    return NextResponse.json({
      items: camelTicketCommentMapper(items),
      total: items.length,
    });
  }

  return proxyJson(request, {
    path: `/service-desk/tickets/${ticketId}/comments`,
    errorMessage: "Failed to fetch ticket comments",
    mapData: mapTicketCommentListPayload,
  });
}

export async function POST(
  request: NextRequest,
  context: TicketIdRouteContext,
) {
  const { ticketId } = context.params;
  const isRemote = await isRemoteRequest(request);
  const body = (await request.json()) as TicketCommentFormValues;

  if (!isRemote) {
    const isInternal = await isInternalUser(request);
    const tickets = isInternal ? internalTicketsMocks : clientTicketsMocks;
    const ticket = tickets.find((item) => item.id === ticketId);

    if (!ticket) {
      return NextResponse.json(
        { message: "Ticket not found" },
        { status: 404 },
      );
    }

    const existingItems = (isInternal ? internalCommentsMocks : []).filter(
      (item) => item.ticket_id === ticketId,
    );

    const comment = toMockTicketComment({
      ticketId,
      values: body,
      ownerId:
        body.id ||
        (await getEffectiveUserId(request)) ||
        resolveTicketRequesterId(ticket),
      commentNo: getNextCommentNo(existingItems),
    });

    return NextResponse.json(camelTicketCommentMapper([comment])[0], {
      status: 201,
    });
  }

  return proxyJson(request, {
    method: "POST",
    path: `/service-desk/tickets/${ticketId}/comments`,
    body,
    errorMessage: "Failed to create ticket comment",
    mapData: mapTicketCommentPayload,
  });
}

function getNextCommentNo(items: DbTicketComment[]) {
  return items.reduce((max, item) => Math.max(max, item.comment_no), 0) + 1;
}

function resolveTicketRequesterId(
  ticket:
    | (typeof internalTicketsMocks)[number]
    | (typeof clientTicketsMocks)[number],
) {
  return "requester_id" in ticket ? ticket.requester_id : ticket.requesterId;
}

function toMockTicketComment({
  ticketId,
  values,
  ownerId,
  commentNo,
}: {
  ticketId: string;
  values: TicketCommentFormValues;
  ownerId: string;
  commentNo: number;
}): DbTicketComment {
  const now = new Date().toISOString();

  return {
    ticket_id: ticketId,
    comment_no: commentNo,
    body: values.body,
    owner_id: ownerId,
    visibility: values.visibility,
    created_at: now,
    updated_at: null,
    active: true,
    files: toAttachList(values.files, "file"),
    images: toAttachList(values.images, "image"),
  };
}

function toAttachList(
  items: Array<{ name: string; url?: string }>,
  type: Attach["type"],
): Attach[] {
  return items.map((item, index) => ({
    index: index + 1,
    type,
    name: item.name,
    url: item.url ?? "",
    active: true,
  }));
}
