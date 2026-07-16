import { NextRequest, NextResponse } from "next/server";

import {
  resolveApiErrorMessage,
  toCurrentUsernameProxyHeaders,
} from "@/app/api/_adapters/serviceDesk";
import {
  getCurrentEmployeeUserName,
  isRemoteRequest,
  toApiErrorResponse,
} from "@/app/api/_adapters";
import { portalApiJson } from "@/app/api/_adapters/backend";
import { toTicketDraftWritePayloadFromFormValues } from "@/feature/serviceDesk/ticketDraft/api/mapper";
import {
  ticketDraftFormSchema,
  type TicketDraftFormValues,
} from "@/feature/serviceDesk/ticketDraft/forms";

export async function GET(request: NextRequest) {
  const currentUserName = await getCurrentEmployeeUserName(request);

  if (currentUserName === null) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!(await isRemoteRequest(request))) {
    return NextResponse.json(null);
  }

  return portalApiJson(request, {
    path: "/service-desk/tickets/draft",
    headers: toCurrentUsernameProxyHeaders(currentUserName),
    errorMessage: resolveApiErrorMessage("serviceDesk.tickets.fetch"),
  });
}

export async function POST(request: NextRequest) {
  const currentUserName = await getCurrentEmployeeUserName(request);

  if (currentUserName === null) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let rawBody: unknown;

  try {
    rawBody = await request.json();
  } catch (error) {
    return toApiErrorResponse(error, {
      fallbackMessage: resolveApiErrorMessage("serviceDesk.tickets.localDemo.invalidPayload"),
      fallbackStatus: 400,
    });
  }

  const parsedBody = ticketDraftFormSchema.safeParse(rawBody);

  if (!parsedBody.success) {
    return NextResponse.json(
      { message: resolveApiErrorMessage("serviceDesk.tickets.localDemo.invalidPayload") },
      { status: 400 },
    );
  }

  const form: TicketDraftFormValues = parsedBody.data;

  if (!(await isRemoteRequest(request))) {
    return NextResponse.json(form, { status: 201 });
  }

  return portalApiJson(request, {
    method: "POST",
    path: "/service-desk/tickets/draft",
    headers: toCurrentUsernameProxyHeaders(currentUserName),
    body: toTicketDraftWritePayloadFromFormValues(form),
    errorMessage: resolveApiErrorMessage("serviceDesk.tickets.create"),
  });
}
