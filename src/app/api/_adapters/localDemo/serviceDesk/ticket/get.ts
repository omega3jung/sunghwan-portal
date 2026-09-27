import {
  canAccessLocalDemoTicket,
  type LocalTicketAccessContext,
} from "./access";
import { getLocalDemoTickets } from "./state";
import { toTicketMockDetailResource } from "./ticketResourceMapper";

/** Returns ticket from the server-side LOCAL ticket adapter. */
export const localGetTicket = ({
  access,
  id,
}: {
  access: LocalTicketAccessContext;
  id: string;
}) => {
  const ticket = getLocalDemoTickets().find((item) => item.id === id);

  if (
    !ticket ||
    ticket.active === false ||
    !canAccessLocalDemoTicket(ticket, access)
  ) {
    return null;
  }

  return toTicketMockDetailResource(ticket);
};
