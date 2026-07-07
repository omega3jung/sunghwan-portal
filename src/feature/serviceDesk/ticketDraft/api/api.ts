import client from "@/lib/api";

import {
  mapTicketDraftPayload,
  type TicketDraftFormPayload,
} from "./mapper";
import type { TicketDraftResource } from "./types";

export const serviceDeskTicketDraftApi = {
  get: async (): Promise<TicketDraftFormPayload | null> => {
    const res = await client.api.get<TicketDraftResource | null>(
      `/api/service-desk/tickets/draft`,
    );

    return mapTicketDraftPayload(res.data);
  },

  create: async (
    data: TicketDraftFormPayload,
  ): Promise<TicketDraftFormPayload> => {
    const res = await client.api.post<TicketDraftResource>(
      `/api/service-desk/tickets/draft`,
      data,
    );

    return mapTicketDraftPayload(res.data) ?? data;
  },

  update: async (
    data: TicketDraftFormPayload,
  ): Promise<TicketDraftFormPayload> => {
    if (!data.id) {
      throw new Error("Ticket draft id is required.");
    }

    const res = await client.api.put<TicketDraftResource>(
      `/api/service-desk/tickets/draft/${data.id}`,
      data,
    );

    return mapTicketDraftPayload(res.data) ?? data;
  },

  discard: async (ticketId: string): Promise<null> => {
    await client.api.delete(`/api/service-desk/tickets/draft/${ticketId}`);
    return null;
  },
};
