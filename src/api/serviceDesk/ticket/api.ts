import client from "@/api/client";
import { TicketDetail, TicketSummary } from "@/domain/serviceDesk";
import { TicketFormValues } from "@/feature/serviceDesk/ticket/forms/ticket";
import { DbParams, OResponse } from "@/shared/types/api";

type TicketSummaryResponse = OResponse<TicketSummary>;

// feature-scoped API.
export const serviceDeskTicketApi = {
  list: async (params: DbParams): Promise<TicketSummary[]> => {
    if (!params) return [];

    const res = await client.api.get<TicketSummaryResponse>(
      "/api/service-desk/tickets",
      { params },
    );
    return res.data.items;
  },

  get: async (id: string): Promise<TicketDetail | null> => {
    if (!id) return null;

    const res = await client.api.get<TicketDetail>(
      `/api/service-desk/tickets/${id}`,
    );
    return res.data;
  },

  create: async (data: TicketFormValues): Promise<TicketDetail> => {
    const res = await client.api.post<TicketDetail>(
      `/api/service-desk/tickets`,
      data,
    );
    return res.data;
  },

  update: async (data: TicketFormValues): Promise<TicketDetail> => {
    const res = await client.api.put<TicketDetail>(
      `/api/service-desk/tickets/${data.id}`,
      data,
    );
    return res.data;
  },

  // soft delete. set disabled in db.
  remove: async (id: string): Promise<null> => {
    await client.api.put(`/api/service-desk/tickets/${id}`, {
      active: false,
    });
    return null;
  },

  draft: {
    get: async (userId?: string | null): Promise<TicketDetail | null> => {
      if (!userId) return null;

      const res = await client.api.get<TicketDetail>(
        `/api/service-desk/tickets/draft`,
        { params: { userId } },
      );
      return res.data;
    },

    create: async (data: TicketFormValues): Promise<TicketDetail> => {
      const res = await client.api.post<TicketDetail>(
        `/api/service-desk/tickets/draft`,
        data,
      );
      return res.data;
    },

    update: async (data: TicketFormValues): Promise<TicketDetail> => {
      const res = await client.api.put<TicketDetail>(
        `/api/service-desk/tickets/draft/${data.id}`,
        data,
      );
      return res.data;
    },

    // real delete draft data in db.
    remove: async (id: string): Promise<null> => {
      await client.api.delete(`/api/service-desk/tickets/draft/${id}`);
      return null;
    },
  },
};
