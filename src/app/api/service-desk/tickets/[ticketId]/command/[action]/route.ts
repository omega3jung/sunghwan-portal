import { NextRequest, NextResponse } from "next/server";

import {
  getCurrentEmployeeUserName,
  getUserRole,
  isInternalUser,
  isRemoteRequest,
} from "@/app/api/_helpers";
import { portalApiJson } from "@/app/api/_helpers/portalApiJson";
import { RouteContext } from "@/app/api/_helpers/types";
import {
  toCurrentUsernameProxyHeaders,
  tServiceDeskApi,
} from "@/app/api/service-desk/_shared";
import {
  TICKET_ACTION_PATH_TO_TYPE as TICKET_ACTION_TYPE_BY_PATH,
  TicketActionFormValues,
} from "@/feature/serviceDesk/ticketAction";
import { mapTicketActionPayload } from "@/feature/serviceDesk/ticketAction/api";
import { localPost } from "@/server/serviceDesk/ticket/command/localDemo";
import {
  ACTION_PATH_BY_TYPE,
  type TicketActionApiType,
} from "@/server/serviceDesk/ticket/command/types";

type TicketActionRouteContext = RouteContext<{
  ticketId: string;
  action: TicketActionApiType;
}>;
type ApprovalActionApiType = Extract<
  TicketActionApiType,
  "approve" | "decline"
>;

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
      { message: tServiceDeskApi("api.ticketCommand.mergeTargetRequired") },
      { status: 400 },
    );
  }

  if (targetTicketId === ticketId) {
    return NextResponse.json(
      { message: tServiceDeskApi("api.ticketCommand.mergeSameTicket") },
      { status: 400 },
    );
  }

  return null;
};

export async function POST(
  request: NextRequest,
  context: TicketActionRouteContext,
) {
  const { ticketId, action } = context.params;
  const isRemote = await isRemoteRequest(request);
  const rawContent = (await request.json()) as Partial<TicketActionFormValues>;
  const content = normalizeTicketActionContent(action, rawContent);
  const role = await getUserRole(request);
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
      { message: tServiceDeskApi("api.ticketCommand.employeeUnavailable") },
      { status: 401 },
    );
  }

  if (!isRemote) {
    const isInternal = await isInternalUser(request);

    if (ACTION_PATH_BY_TYPE[content.actionType] !== action) {
      return NextResponse.json(
        { message: tServiceDeskApi("api.ticketCommand.actionMismatch") },
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
    headers: toCurrentUsernameProxyHeaders(employeeUserName, role),
    body: toRemoteCommandBody(action, content),
    errorMessage: tServiceDeskApi("api.ticketCommand.execute"),
    mapData: mapTicketActionPayload,
  });
}
