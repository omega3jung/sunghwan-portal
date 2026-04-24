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
import { clientTicketsMocks } from "@/app/_mocks/scenarios/serviceDesk/clientTicketsMock";
import { internalTicketsMocks } from "@/app/_mocks/scenarios/serviceDesk/internalTicketsMock";
import { isInternalUser, isRemoteRequest, proxyJson } from "@/app/api/_helpers";
import { tServiceDeskApi } from "@/app/api/service-desk/_shared/messages";

export async function GET(request: NextRequest) {
  const isRemote = await isRemoteRequest(request);

  // demo mode
  if (!isRemote) {
    const isInternal = await isInternalUser(request);
    const items = (isInternal ? internalTicketsMocks : clientTicketsMocks).map(
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
    errorMessage: tServiceDeskApi("api.tickets.fetchList"),
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
    errorMessage: tServiceDeskApi("api.tickets.create"),
    mapData: mapTicketDetailPayload,
  });
}
