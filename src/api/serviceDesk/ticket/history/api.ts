import client from "@/api/client";
import { TicketHistory } from "@/domain/serviceDesk";
import { OResponse } from "@/shared/types/api";

type TicketHistoryResponse = OResponse<TicketHistory>;

// feature-scoped API.
export const serviceDeskTicketHistoryApi = {
  list: async (ticketId: string): Promise<TicketHistory[]> => {
    if (!ticketId) return [];

    const res = await client.api.get<TicketHistoryResponse>(
      `/api/service-desk/tickets/${ticketId}/histories`,
    );

    return res.data.items;
  },
};
