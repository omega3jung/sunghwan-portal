import { camelTicketDetailMapper } from "@/lib/application/contracts/serviceDesk";

import {
  canAccessLocalDemoTicket,
  type LocalTicketAccessContext,
} from "./access";
import { getLocalDemoTickets } from "./state";

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

  return camelTicketDetailMapper([ticket])[0];
};
