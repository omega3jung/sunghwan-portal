import { NextRequest, NextResponse } from "next/server";

import {
  getCurrentEmployeeUserName,
  isRemoteRequest,
} from "@/app/api/_adapters";
import { portalApiJson } from "@/app/api/_adapters/backend";
import { RouteContext } from "@/app/api/_adapters/http";
import {
  getCurrentLocalTicketAccessContext,
  getCurrentLocalUserRole,
} from "@/app/api/_adapters/localDemo/auth";
import { localGetTicket } from "@/app/api/_adapters/localDemo/serviceDesk/ticket";
import { localPost } from "@/app/api/_adapters/localDemo/serviceDesk/ticket/command";
import {
  ACTION_PATH_BY_TYPE,
  type TicketActionApiType,
} from "@/app/api/_adapters/localDemo/serviceDesk/ticket/command/types";
import {
  resolveApiErrorMessage,
  toCurrentUsernameProxyHeaders,
} from "@/app/api/_adapters/serviceDesk";
import {
  mapTicketActionPayload,
  TICKET_ACTION_PATH_TO_TYPE as TICKET_ACTION_TYPE_BY_PATH,
  TicketActionFormValues,
} from "@/lib/application/contracts/serviceDesk";

type TicketActionRouteContext = RouteContext<{
  ticketId: string;
  action: string;
}>;
type ApprovalActionApiType = Extract<
  TicketActionApiType,
  "approve" | "decline"
>;

const isTicketActionApiType = (
  action: string,
): action is TicketActionApiType =>
  Object.hasOwn(TICKET_ACTION_TYPE_BY_PATH, action);

const isApprovalAction = (
  action: TicketActionApiType,
): action is ApprovalActionApiType =>
  action === "approve" || action === "decline";

const createApprovalActionContent = (
  action: ApprovalActionApiType,
  rawContent: Partial<TicketActionFormValues>,
): TicketActionFormValues => ({
  id: typeof rawContent.id === "string" ? rawContent.id : "",
  actionType: TICKET_ACTION_TYPE_BY_PATH[action],
  content: typeof rawContent.content === "string" ? rawContent.content : "",
  files: [],
  images: [],
});

const normalizeTicketActionContent = (
  action: TicketActionApiType,
  rawContent: Partial<TicketActionFormValues>,
): TicketActionFormValues => {
  if (isApprovalAction(action)) {
    return createApprovalActionContent(action, rawContent);
  }

  return rawContent as TicketActionFormValues;
};

const toRemoteCommandBody = (
  action: TicketActionApiType,
  content: TicketActionFormValues,
) => {
  if (isApprovalAction(action)) {
    return {
      content: content.content,
    };
  }

  return content;
};

const validateMergeRequest = (
  ticketId: string,
  action: TicketActionApiType,
  content: TicketActionFormValues,
) => {
  if (action !== "merge") {
    return null;
  }

  const targetTicketId = content.targetTicketId?.trim();

  if (!targetTicketId) {
    return NextResponse.json(
      { message: resolveApiErrorMessage("serviceDesk.ticketCommand.mergeTargetRequired") },
      { status: 400 },
    );
  }

  if (targetTicketId === ticketId) {
    return NextResponse.json(
      { message: resolveApiErrorMessage("serviceDesk.ticketCommand.mergeSameTicket") },
      { status: 400 },
    );
  }

  return null;
};

export async function POST(
  request: NextRequest,
  context: TicketActionRouteContext,
) {
  const { ticketId, action } = await context.params;

  if (!isTicketActionApiType(action)) {
    return NextResponse.json({ message: "Not Found" }, { status: 404 });
  }

  const isRemote = await isRemoteRequest(request);
  const rawContent = (await request.json()) as Partial<TicketActionFormValues>;
  const content = normalizeTicketActionContent(action, rawContent);
  const employeeUserName = await getCurrentEmployeeUserName(request);

  const mergeValidationResponse = validateMergeRequest(
    ticketId,
    action,
    content,
  );

  if (mergeValidationResponse) {
    return mergeValidationResponse;
  }

  if (employeeUserName === null) {
    return NextResponse.json(
      { message: resolveApiErrorMessage("serviceDesk.ticketCommand.employeeUnavailable") },
      { status: 401 },
    );
  }

  if (!isRemote) {
    const [role, access] = await Promise.all([
      getCurrentLocalUserRole(request),
      getCurrentLocalTicketAccessContext(request),
    ]);

    if (access === null) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    if (!localGetTicket({ access, id: ticketId })) {
      return NextResponse.json(
        { message: resolveApiErrorMessage("serviceDesk.tickets.notFound") },
        { status: 404 },
      );
    }

    if (
      action === "merge" &&
      content.targetTicketId &&
      !localGetTicket({ access, id: content.targetTicketId })
    ) {
      return NextResponse.json(
        { message: resolveApiErrorMessage("serviceDesk.tickets.notFound") },
        { status: 404 },
      );
    }

    const isInternal = access.userScope === "INTERNAL";

    if (ACTION_PATH_BY_TYPE[content.actionType] !== action) {
      return NextResponse.json(
        { message: resolveApiErrorMessage("serviceDesk.ticketCommand.actionMismatch") },
        { status: 400 },
      );
    }

    return localPost({
      ticketId,
      employeeUserName,
      action,
      isAdmin: role === "ADMIN",
      content,
      isInternal,
    });
  }

  return portalApiJson(request, {
    method: "POST",
    path: `/service-desk/tickets/${ticketId}/command/${action}`,
    headers: toCurrentUsernameProxyHeaders(employeeUserName),
    body: toRemoteCommandBody(action, content),
    errorMessage: resolveApiErrorMessage("serviceDesk.ticketCommand.execute"),
    mapData: mapTicketActionPayload,
  });
}
