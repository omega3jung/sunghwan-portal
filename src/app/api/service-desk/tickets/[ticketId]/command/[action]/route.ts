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
  resolveApiErrorMessage,
  toCurrentUsernameProxyHeaders,
} from "@/app/api/_adapters/serviceDesk";
import {
  isTicketActionPath,
  mapTicketActionPayload,
  TICKET_ACTION_PATH_TO_TYPE as TICKET_ACTION_TYPE_BY_PATH,
  TICKET_ACTION_TYPE_TO_PATH,
  type TicketActionCommandPayload,
  type TicketActionCommandRequest,
  type TicketApprovalActionPath,
} from "@/lib/application/contracts/serviceDesk";

type TicketActionRouteContext = RouteContext<{
  ticketId: string;
  action: string;
}>;
const isApprovalAction = (
  action: string,
): action is TicketApprovalActionPath =>
  action === "approve" || action === "decline";

const createApprovalActionContent = (
  action: TicketApprovalActionPath,
  rawContent: Partial<TicketActionCommandRequest>,
): TicketActionCommandPayload => ({
  id: typeof rawContent.id === "string" ? rawContent.id : "",
  actionType: TICKET_ACTION_TYPE_BY_PATH[action],
  content: typeof rawContent.content === "string" ? rawContent.content : "",
  files: [],
  images: [],
});

// Normalize once before the LOCAL/REMOTE split so both runtimes receive the
// same route-derived action type and attachment defaults.
const normalizeTicketActionContent = (
  action: keyof typeof TICKET_ACTION_TYPE_BY_PATH,
  rawContent: Partial<TicketActionCommandRequest>,
): TicketActionCommandPayload => {
  if (isApprovalAction(action)) {
    return createApprovalActionContent(action, rawContent);
  }

  return {
    ...rawContent,
    id: typeof rawContent.id === "string" ? rawContent.id : "",
    actionType:
      rawContent.actionType ?? TICKET_ACTION_TYPE_BY_PATH[action],
    content:
      typeof rawContent.content === "string" ? rawContent.content : "",
    files: Array.isArray(rawContent.files) ? rawContent.files : [],
    images: Array.isArray(rawContent.images) ? rawContent.images : [],
  };
};

const toRemoteCommandBody = (
  action: keyof typeof TICKET_ACTION_TYPE_BY_PATH,
  content: TicketActionCommandPayload,
) => {
  if (isApprovalAction(action)) {
    // Approval commands are text-only at the public boundary. The REMOTE server
    // independently enforces the same rule before writing an action.
    return {
      content: content.content,
    };
  }

  return content;
};

const validateMergeRequest = (
  ticketId: string,
  action: keyof typeof TICKET_ACTION_TYPE_BY_PATH,
  content: TicketActionCommandPayload,
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

/** Handles POST /api/service-desk/tickets/[ticketId]/command/[action]; authorization and runtime adapter selection remain at this HTTP boundary. */
export async function POST(
  request: NextRequest,
  context: TicketActionRouteContext,
) {
  const { ticketId, action } = await context.params;

  if (!isTicketActionPath(action)) {
    return NextResponse.json({ message: "Not Found" }, { status: 404 });
  }

  const isRemote = await isRemoteRequest(request);
  const rawContent =
    (await request.json()) as Partial<TicketActionCommandRequest>;
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

    if (TICKET_ACTION_TYPE_TO_PATH[content.actionType] !== action) {
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
