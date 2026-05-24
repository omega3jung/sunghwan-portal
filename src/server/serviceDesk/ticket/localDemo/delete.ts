import { ServiceDeskApiError } from "@/app/api/service-desk/_shared/messages";

import { getLocalDemoTickets } from "../state";

export const localDeleteTicket = ({
  isInternal,
  ticketId,
}: {
  isInternal: boolean;
  ticketId: string;
}) => {
  const targetMock = getLocalDemoTickets(isInternal);
  const ticketIndex = targetMock.findIndex((ticket) => ticket.id === ticketId);

  if (ticketIndex < 0) {
    throw new ServiceDeskApiError("api.common.notFound", 404);
  }

  targetMock[ticketIndex] = {
    ...targetMock[ticketIndex],
    active: false,
    updated_at: new Date().toISOString(),
  };
};
