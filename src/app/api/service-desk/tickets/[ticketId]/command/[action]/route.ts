import { NextRequest, NextResponse } from "next/server";

import { mapTicketActionPayload } from "@/api/serviceDesk/ticket/action";
import {
  getEffectiveUserId,
  isInternalUser,
  isRemoteRequest,
  proxyJson,
} from "@/app/api/_helpers";
import { RouteContext } from "@/app/api/_helpers/types";
import { TicketActionFormValues } from "@/feature/serviceDesk/ticket/forms/action";

import { localPost } from "./localDemo";
import { ACTION_PATH_BY_TYPE, TicketActionApiType } from "./types";

type TicketActionRouteContext = RouteContext<{
  ticketId: string;
  action: TicketActionApiType;
}>;

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
      { message: "Merge action requires targetTicketId." },
      { status: 400 },
    );
  }

  if (targetTicketId === ticketId) {
    return NextResponse.json(
      { message: "Cannot merge into the same ticket." },
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
  const content = (await request.json()) as TicketActionFormValues;

  if (ACTION_PATH_BY_TYPE[content.actionType] !== action) {
    return NextResponse.json(
      { message: "Action path and payload do not match." },
      { status: 400 },
    );
  }

  const mergeValidationResponse = validateMergeRequest(ticketId, action, content);

  if (mergeValidationResponse) {
    return mergeValidationResponse;
  }

  if (!isRemote) {
    const userId = await getEffectiveUserId(request);

    if (!userId) {
      return NextResponse.json({ message: "No user data" }, { status: 503 });
    }

    const isInternal = await isInternalUser(request);

    return localPost({ ticketId, userId, action, content, isInternal });
  }

  return proxyJson(request, {
    method: "POST",
    path: `/service-desk/tickets/${ticketId}/command/${action}`,
    body: content,
    errorMessage: "Failed to execute ticket command",
    mapData: mapTicketActionPayload,
  });
}
