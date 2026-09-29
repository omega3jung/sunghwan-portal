import { filterItemsByQuery } from "@/lib/application/api/query";

import {
  filterAccessibleLocalDemoTickets,
  type LocalTicketAccessContext,
} from "./access";
import { getLocalDemoTickets } from "./state";
import { withAssigneeFilterField } from "./ticketAssignment";
import { toTicketMockDetailResource } from "./ticketResourceMapper";

/** Returns tickets from the server-side LOCAL ticket adapter. */
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
    activeTickets.map(toTicketMockDetailResource).map(withAssigneeFilterField),
  );

  return {
    items,
    total: items.length,
  };
};
