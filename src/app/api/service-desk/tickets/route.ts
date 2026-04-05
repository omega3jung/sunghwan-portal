import { NextRequest, NextResponse } from "next/server";

import {
  mapTicketDetailPayload,
  mapTicketSummaryListPayload,
} from "@/api/serviceDesk/ticket/mapper";
import {
  toTicketMockDetail,
  toTicketMockSummaryResource,
} from "@/api/serviceDesk/ticket/mock";
import {
  CreateTicketInput,
  toTicketWritePayload,
} from "@/api/serviceDesk/ticket/write";
import {
  clientTicketsMock,
  internalTicketsMock,
} from "@/app/_mocks/scenarios/serviceDesk/tickets";
import { isInternalUser, isRemoteRequest, proxyJson } from "@/app/api/_helpers";

export async function GET(request: NextRequest) {
  const isRemote = await isRemoteRequest(request);

  // demo mode
  if (!isRemote) {
    const isInternal = await isInternalUser(request);
    const items = (isInternal ? internalTicketsMock : clientTicketsMock).map(
      toTicketMockSummaryResource,
    );

    return NextResponse.json({
      items,
      total: items.length,
    });
  }

  // real backend
  return proxyJson(request, {
    path: "/service-desk/tickets",
    query: request.nextUrl.searchParams,
    errorMessage: "Failed to fetch tickets",
    mapData: mapTicketSummaryListPayload,
  });
}

export async function POST(request: NextRequest) {
  const isRemote = await isRemoteRequest(request);
  const body = (await request.json()) as CreateTicketInput;

  if (!isRemote) {
    return NextResponse.json(toTicketMockDetail(body), { status: 201 });
  }

  return proxyJson(request, {
    method: "POST",
    path: "/service-desk/tickets",
    body: toTicketWritePayload(body),
    errorMessage: "Failed to create ticket",
    mapData: mapTicketDetailPayload,
  });
}
