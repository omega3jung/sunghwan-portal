import { camelTicketDetailMapper } from "@/feature/serviceDesk/ticket/api";

import { getLocalDemoTickets } from "../state";

export const localGetTicket = ({
  isInternal,
  id,
}: {
  isInternal: boolean;
  id: string;
}) => {
  const ticket = getLocalDemoTickets(isInternal).find((item) => item.id === id);

  if (!ticket || ticket.active === false) {
    return null;
  }

  return camelTicketDetailMapper([ticket])[0];
};
