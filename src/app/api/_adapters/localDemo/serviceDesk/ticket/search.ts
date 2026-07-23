import { TicketDetail, TicketUser } from "@/domain/serviceDesk";
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
}): PaginatedSearchResponse<TicketDetail> & {
  facets: {
    requesters: TicketUser[];
    assignees: TicketUser[];
  };
} {
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
  const tickets = camelTicketDetailMapper(activeTickets)
    .map(withAssigneeFilterField)
    .map((ticket) => ({
      ...ticket,
      cat_scope: ticket.scope,
      requesterUsername: ticket.requesterUsername,
    }));

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
    facets: {
      requesters: uniquePeople(
        filtered.map((ticket) => ({
          username: ticket.requesterUsername,
          name: ticket.requester.name,
          image: ticket.requester.image,
        })),
      ),
      assignees: uniquePeople(
        filtered.flatMap((ticket) =>
          ticket.assignmentPhase === "APPROVAL"
            ? ticket.approvalAssignees
            : ticket.workAssignees,
        ),
      ),
    },
    totalCount: filtered.length,
    page: pagination.page,
    pageSize: pagination.pageSize,
  };
}

function uniquePeople(people: TicketUser[]): TicketUser[] {
  return [...new Map(people.map((person) => [person.username, person])).values()]
    .sort((left, right) => left.username.localeCompare(right.username));
}
