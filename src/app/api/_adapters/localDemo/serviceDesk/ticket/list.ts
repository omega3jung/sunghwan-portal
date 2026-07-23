import { filterItemsByQuery } from "@/lib/application/api/query";
import { camelTicketDetailMapper } from "@/lib/application/contracts/serviceDesk";

import {
  filterAccessibleLocalDemoTickets,
  type LocalTicketAccessContext,
} from "./access";
import { getLocalDemoTickets } from "./state";
import { withAssigneeFilterField } from "./ticketAssignment";

export const localListTickets = ({
  access,
  searchParams,
}: {
  access: LocalTicketAccessContext;
  searchParams: URLSearchParams;
}) => {
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
  const items = filterItemsByQuery(
    searchParams,
    camelTicketDetailMapper(activeTickets).map(withAssigneeFilterField),
  );

  return {
    items,
    total: items.length,
  };
};
