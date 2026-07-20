import { ApiError } from "@/lib/application/api";

import {
  type LocalTicketAccessContext,
  requireLocalDemoTicketAccess,
} from "./access";
import { getLocalDemoTickets } from "./state";

export const localDeleteTicket = ({
  access,
  ticketId,
}: {
  access: LocalTicketAccessContext;
  ticketId: string;
}) => {
  const targetMock = getLocalDemoTickets();
  const ticketIndex = targetMock.findIndex((ticket) => ticket.id === ticketId);

  if (ticketIndex < 0) {
    throw new ApiError("serviceDesk.common.notFound", 404);
  }

  requireLocalDemoTicketAccess(targetMock[ticketIndex], access);

  targetMock[ticketIndex] = {
    ...targetMock[ticketIndex],
    active: false,
    updated_at: new Date().toISOString(),
  };
};
