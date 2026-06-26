import { NextRequest, NextResponse } from "next/server";

import {
  getCurrentEmployeeUserName,
  isRemoteRequest,
  toApiErrorResponse,
} from "@/app/api/_helpers";
import { portalApiJson } from "@/app/api/_helpers/portalApiJson";
import {
  toCurrentUsernameProxyHeaders,
  tServiceDeskApi,
} from "@/app/api/service-desk/_shared";
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
    errorMessage: tServiceDeskApi("api.tickets.fetch"),
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
      fallbackMessage: tServiceDeskApi("api.tickets.localDemo.invalidPayload"),
      fallbackStatus: 400,
    });
  }

  const parsedBody = ticketDraftFormSchema.safeParse(rawBody);

  if (!parsedBody.success) {
    return NextResponse.json(
      { message: tServiceDeskApi("api.tickets.localDemo.invalidPayload") },
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
    errorMessage: tServiceDeskApi("api.tickets.create"),
  });
}
