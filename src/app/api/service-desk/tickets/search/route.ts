import { NextRequest, NextResponse } from "next/server";

import {
  getCurrentEmployeeUserName,
  isInternalUser,
  isRemoteRequest,
  toApiErrorResponse,
} from "@/app/api/_helpers";
import { portalApiJson } from "@/app/api/_helpers/portalApiJson";
import {
  toCurrentUsernameProxyHeaders,
  tServiceDeskApi,
  withDerivedTicketOwnershipList,
} from "@/app/api/service-desk/_shared";
import type { TicketSearchRequest } from "@/feature/serviceDesk/ticket/api";
import { mapTicketSummaryListPayload } from "@/feature/serviceDesk/ticket/api/mapper";
import { toTicketMockSummaryResource } from "@/feature/serviceDesk/ticketAction/mock";
import { localSearchTickets } from "@/server/serviceDesk/ticket/localDemo";

type TicketSearchQuery = {
  filter?: string;
  sort?: string;
  page: number;
  pageSize: number;
};

export async function GET(request: NextRequest) {
  const searchRequest = parseTicketSearchQuery(request.nextUrl.searchParams);

  if (!searchRequest) {
    return NextResponse.json(
      { message: "Invalid search query" },
      { status: 400 },
    );
  }

  return handleTicketSearch(request, searchRequest, "GET");
}

export async function POST(request: NextRequest) {
  let body: TicketSearchRequest;

  try {
    body = (await request.json()) as TicketSearchRequest;
  } catch {
    return NextResponse.json(
      { message: "Invalid request body" },
      { status: 400 },
    );
  }

  return handleTicketSearch(request, body, "POST");
}

async function handleTicketSearch(
  request: NextRequest,
  body: TicketSearchRequest,
  method: "GET" | "POST",
) {
  const isRemote = await isRemoteRequest(request);
  const currentUserName = await getCurrentEmployeeUserName(request);

  if (!isRemote) {
    try {
      if (currentUserName === null) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }

      const isInternal = await isInternalUser(request);

      const result = localSearchTickets({
        isInternal,
        request: body,
      });

      const items = withDerivedTicketOwnershipList(
        result.items.map(toTicketMockSummaryResource),
        currentUserName,
      );

      return NextResponse.json({
        items,
        totalCount: result.totalCount,
        page: result.page,
        pageSize: result.pageSize,
      });
    } catch (error) {
      return toApiErrorResponse(error, {
        fallbackMessage: tServiceDeskApi("api.tickets.fetchList"),
      });
    }
  }

  return portalApiJson(request, {
    method,
    path: "/service-desk/tickets/search",
    headers: toCurrentUsernameProxyHeaders(currentUserName),
    ...(method === "GET"
      ? { query: toTicketSearchQuery(body) }
      : { body }),
    errorMessage: tServiceDeskApi("api.tickets.fetchList"),
    mapData: mapTicketSummaryListPayload,
  });
}

function parseTicketSearchQuery(
  searchParams: URLSearchParams,
): TicketSearchRequest | null {
  try {
    return {
      filter: parseJsonQueryValue<TicketSearchRequest["filter"]>(
        searchParams.get("filter"),
      ),
      sort: parseJsonQueryValue<TicketSearchRequest["sort"]>(
        searchParams.get("sort"),
      ),
      page: parseNumberQueryValue(searchParams.get("page")) ?? 1,
      pageSize:
        parseNumberQueryValue(searchParams.get("pageSize")) ??
        parseNumberQueryValue(searchParams.get("size")) ??
        10,
    };
  } catch {
    return null;
  }
}

function toTicketSearchQuery(request: TicketSearchRequest): TicketSearchQuery {
  return {
    ...(request.filter ? { filter: JSON.stringify(request.filter) } : {}),
    ...(request.sort ? { sort: JSON.stringify(request.sort) } : {}),
    page: request.page,
    pageSize: request.pageSize,
  };
}

function parseJsonQueryValue<T>(value: string | null): T | undefined {
  if (!value) {
    return undefined;
  }

  return JSON.parse(value) as T;
}

function parseNumberQueryValue(value: string | null): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : undefined;
}
