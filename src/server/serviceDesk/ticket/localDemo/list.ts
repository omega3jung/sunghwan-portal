import { filterItemsByQuery } from "@/app/api/_helpers/filter";
import { camelTicketDetailMapper } from "@/feature/serviceDesk/ticket/api";

import { getLocalDemoTickets } from "../state";
import { withAssigneeFilterField } from "./ticketAssignment";

export const localListTickets = ({
  isInternal,
  searchParams,
}: {
  isInternal: boolean;
  searchParams: URLSearchParams;
}) => {
  /* return only active tickets.
   *
   * TODO.
   * Admin/audit views may need access to inactive tickets.
   * Keep this as not-found for the current local demo user-facing flow.
   */
  const activeTickets = getLocalDemoTickets(isInternal).filter(
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
