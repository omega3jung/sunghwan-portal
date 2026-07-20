import { TicketDetail } from "@/domain/serviceDesk";
import type { PaginatedSearchResponse } from "@/lib/application/api";
import {
  applyRuleGroupFilter,
  normalizePagination,
  paginateItems,
} from "@/lib/application/api/query";
import { camelTicketDetailMapper } from "@/lib/application/contracts/serviceDesk";
import { TicketSearchRequest } from "@/lib/application/contracts/serviceDesk";

import {
  filterAccessibleLocalDemoTickets,
  type LocalTicketAccessContext,
} from "./access";
import { sortTickets } from "./sort";
import { getLocalDemoTickets } from "./state";
import { withAssigneeFilterField } from "./ticketAssignment";

export function localSearchTickets({
  access,
  request,
}: {
  access: LocalTicketAccessContext;
  request: TicketSearchRequest;
}): PaginatedSearchResponse<TicketDetail> {
  /* return only active tickets.
   *
   * TODO.
   * Admin/audit views may need access to inactive tickets.
   * Keep this as not-found for the current local demo user-facing flow.
   */
  const activeTickets = filterAccessibleLocalDemoTickets(
    getLocalDemoTickets(),
    access,
  ).filter(
    (ticket) => ticket.active !== false,
  );
  const tickets = camelTicketDetailMapper(activeTickets).map(
    withAssigneeFilterField,
  );

  const filtered = applyRuleGroupFilter(tickets, request.filter);
  const sorted = sortTickets(
    filtered,
    request.sortField && request.sortDirection
      ? {
          field: request.sortField,
          direction: request.sortDirection,
        }
      : undefined,
  );
  const pagination = normalizePagination(request);
  const items = paginateItems(sorted, pagination);

  return {
    items,
    totalCount: filtered.length,
    page: pagination.page,
    pageSize: pagination.pageSize,
  };
}
