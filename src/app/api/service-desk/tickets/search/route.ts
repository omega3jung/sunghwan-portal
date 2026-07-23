import { NextRequest, NextResponse } from "next/server";
import type { RuleGroupTypeIC } from "react-querybuilder";

import {
  getCurrentEmployeeUserName,
  isRemoteRequest,
  toApiErrorResponse,
} from "@/app/api/_adapters";
import { portalApiJson } from "@/app/api/_adapters/backend";
import { getCurrentLocalTicketAccessContext } from "@/app/api/_adapters/localDemo/auth";
import { localSearchTickets } from "@/app/api/_adapters/localDemo/serviceDesk/ticket";
import { toTicketMockSummaryResource } from "@/app/api/_adapters/localDemo/serviceDesk/ticket/ticketResourceMapper";
import {
  resolveApiErrorMessage,
  toCurrentUsernameProxyHeaders,
  withDerivedTicketOwnershipList,
} from "@/app/api/_adapters/serviceDesk";
import type {
  TicketSearchRequest,
  TicketSearchSort,
  TicketSortField,
} from "@/lib/application/contracts/serviceDesk";
import { mapTicketSummaryListPayload } from "@/lib/application/contracts/serviceDesk";
import { buildDbSearchParams } from "@/shared/utils/routing";

const TICKET_SORT_FIELDS = new Set<TicketSortField>([
  "ticketNumber",
  "createdAt",
  "updatedAt",
  "dueAt",
  "priority",
  "status",
]);

const SORT_DIRECTIONS = new Set<TicketSearchSort["direction"]>([
  "asc",
  "desc",
]);

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
    body = normalizeTicketSearchRequest(
      (await request.json()) as TicketSearchRequest,
    );
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

      const access = await getCurrentLocalTicketAccessContext(request);

      if (access === null) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }

      const result = localSearchTickets({
        access,
        request: body,
      });

      const items = withDerivedTicketOwnershipList(
        result.items.map(toTicketMockSummaryResource),
        currentUserName,
      );

      return NextResponse.json({
        items,
        facets: result.facets,
        totalCount: result.totalCount,
        page: result.page,
        pageSize: result.pageSize,
      });
    } catch (error) {
      return toApiErrorResponse(error, {
        fallbackMessage: resolveApiErrorMessage("serviceDesk.tickets.fetchList"),
      });
    }
  }

  return portalApiJson(request, {
    method,
    path: "/service-desk/tickets/search",
    headers: toCurrentUsernameProxyHeaders(currentUserName),
    ...(method === "GET"
      ? { query: buildDbSearchParams(body) }
      : { body: toLegacyTicketSearchRequest(body) }),
    errorMessage: resolveApiErrorMessage("serviceDesk.tickets.fetchList"),
    mapData: mapTicketSummaryListPayload,
  });
}

function parseTicketSearchQuery(
  searchParams: URLSearchParams,
): TicketSearchRequest | null {
  try {
    const sort = parseSortQueryValue(searchParams);

    return normalizeTicketSearchRequest({
      filter: parseFilterQueryValue(searchParams.get("filter")),
      sortField: sort?.field,
      sortDirection: sort?.direction,
      page: parseNumberQueryValue(searchParams.get("page")) ?? 1,
      pageSize:
        parseNumberQueryValue(searchParams.get("pageSize")) ?? 10,
    });
  } catch {
    return null;
  }
}

function normalizeTicketSearchRequest(
  request: Partial<TicketSearchRequest> & { sort?: unknown },
): TicketSearchRequest {
  const legacySort = normalizeSortValue(request.sort);
  const sort = normalizeSortValue({
    field: request.sortField ?? legacySort?.field,
    direction: request.sortDirection ?? legacySort?.direction,
  });

  return {
    filter: normalizeFilterValue(request.filter),
    sortField: sort?.field,
    sortDirection: sort?.direction,
    page: request.page ?? 1,
    pageSize: request.pageSize ?? 10,
  };
}

function toLegacyTicketSearchRequest(request: TicketSearchRequest) {
  return {
    filter: request.filter,
    sort:
      request.sortField && request.sortDirection
        ? {
            field: request.sortField,
            direction: request.sortDirection,
          }
        : undefined,
    page: request.page,
    pageSize: request.pageSize,
  };
}

function parseFilterQueryValue(value: string | null): RuleGroupTypeIC | undefined {
  if (!value) {
    return undefined;
  }

  return JSON.parse(value) as RuleGroupTypeIC;
}

function parseSortQueryValue(
  searchParams: URLSearchParams,
): TicketSearchSort | undefined {
  const field = searchParams.get("sortField");
  const direction = searchParams.get("sortDirection");

  if (field || direction) {
    return normalizeSortValue({ field, direction });
  }

  const legacySort = searchParams.get("sort");

  if (!legacySort) {
    return undefined;
  }

  return normalizeSortValue(JSON.parse(legacySort));
}

function normalizeFilterValue(value: unknown): RuleGroupTypeIC | undefined {
  if (!value) {
    return undefined;
  }

  if (typeof value === "string") {
    return parseFilterQueryValue(value);
  }

  return value as RuleGroupTypeIC;
}

function normalizeSortValue(value: unknown): TicketSearchSort | undefined {
  if (!value) {
    return undefined;
  }

  if (typeof value === "string") {
    return normalizeSortValue(JSON.parse(value));
  }

  if (typeof value !== "object") {
    throw new Error("Invalid sort value");
  }

  const sort = value as Partial<TicketSearchSort>;

  if (!sort.field && !sort.direction) {
    return undefined;
  }

  if (!isTicketSortField(sort.field) || !isSortDirection(sort.direction)) {
    throw new Error("Invalid sort value");
  }

  return {
    field: sort.field,
    direction: sort.direction,
  };
}

function isTicketSortField(value: unknown): value is TicketSortField {
  return (
    typeof value === "string" &&
    TICKET_SORT_FIELDS.has(value as TicketSortField)
  );
}

function isSortDirection(
  value: unknown,
): value is TicketSearchSort["direction"] {
  return (
    typeof value === "string" &&
    SORT_DIRECTIONS.has(value as TicketSearchSort["direction"])
  );
}

function parseNumberQueryValue(value: string | null): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : undefined;
}
