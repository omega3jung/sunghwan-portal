import { NextRequest, NextResponse } from "next/server";

import { mapTicketActionPayload } from "@/api/serviceDesk/ticket/action";
import { isInternalUser, isRemoteRequest, proxyJson } from "@/app/api/_helpers";
import { RouteContext } from "@/app/api/_helpers/types";
import { TicketActionFormValues } from "@/feature/serviceDesk/ticket/action/forms";
import type { TicketActionMode } from "@/feature/serviceDesk/ticket/action/types";

import {
  isManagerLevelTicketActionAllowed,
  resolveActionAuthorizationContext,
} from "./authz";
import { localPost } from "./localDemo";
import { ACTION_PATH_BY_TYPE, TicketActionApiType } from "./types";

type TicketActionRouteContext = RouteContext<{
  ticketId: string;
  action: TicketActionApiType;
}>;

const MANAGER_ACTION_MODE_BY_PATH: Partial<
  Record<TicketActionApiType, TicketActionMode>
> = {
  assign: "assignManager",
  adjust: "adjustManager",
  merge: "mergeManager",
  reject: "rejectManager",
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

const resolveActionMode = (
  action: TicketActionApiType,
  isManager: boolean,
): TicketActionMode => {
  if (!isManager) {
    return action;
  }

  return MANAGER_ACTION_MODE_BY_PATH[action] ?? action;
};

export async function POST(
  request: NextRequest,
  context: TicketActionRouteContext,
) {
  const { ticketId, action } = context.params;
  const isRemote = await isRemoteRequest(request);
  const content = (await request.json()) as TicketActionFormValues;

  const mergeValidationResponse = validateMergeRequest(
    ticketId,
    action,
    content,
  );
  const authzContext = await resolveActionAuthorizationContext(request);

  if (mergeValidationResponse) {
    return mergeValidationResponse;
  }

  const actionMode = resolveActionMode(
    action,
    isManagerLevelTicketActionAllowed(authzContext),
  );

  if (!isRemote) {
    const userId = authzContext?.userId;

    if (!userId) {
      return NextResponse.json({ message: "No user data" }, { status: 503 });
    }

    const isInternal = await isInternalUser(request);

    if (ACTION_PATH_BY_TYPE[content.actionType] !== action) {
      return NextResponse.json(
        { message: "Action path and payload do not match." },
        { status: 400 },
      );
    }

    return localPost({
      ticketId,
      userId,
      action,
      actionMode,
      content,
      isInternal,
    });
  }

  return proxyJson(request, {
    method: "POST",
    path: `/service-desk/tickets/${ticketId}/command/${actionMode}`,
    body: content,
    errorMessage: "Failed to execute ticket command",
    mapData: mapTicketActionPayload,
  });
}
