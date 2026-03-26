import client from "@/api/client";
import { TicketComment } from "@/domain/serviceDesk";
import { TicketCommentInput } from "@/feature/serviceDesk/ticket/forms/comment";
import { OResponse } from "@/shared/types/api";

type TicketCommentResponse = OResponse<TicketComment>;

// feature-scoped API.
export const serviceDeskTicketCommentApi = {
  list: async (ticketId: string): Promise<TicketComment[]> => {
    if (!ticketId) return [];

    const res = await client.api.get<TicketCommentResponse>(
      `/api/service-desk/tickets/${ticketId}/comments`,
    );

    return res.data.items;
  },

  get: async (
    ticketId: string,
    commentNo: string,
  ): Promise<TicketComment | null> => {
    if (!ticketId || !commentNo) return null;

    const res = await client.api.get<TicketComment>(
      `/api/service-desk/tickets/${ticketId}/comments/${commentNo}`,
    );

    return res.data;
  },

  create: async ({
    ticketId,
    values,
  }: TicketCommentInput): Promise<TicketComment> => {
    const res = await client.api.post<TicketComment>(
      `/api/service-desk/tickets/${ticketId}/comments`,
      values,
    );

    return res.data;
  },

  update: async ({
    ticketId,
    commentNo,
    values,
  }: TicketCommentInput): Promise<TicketComment> => {
    // validate comment No.
    if (!commentNo) {
      throw new Error("commentNo is required for update");
    }
    const res = await client.api.put<TicketComment>(
      `/api/service-desk/tickets/${ticketId}/comments/${commentNo}`,
      values,
    );

    return res.data;
  },

  remove: async (ticketId: string, commentNo: string): Promise<null> => {
    // validate comment No.
    if (!commentNo) {
      throw new Error("commentNo is required for remove");
    }
    await client.api.patch(
      `/api/service-desk/tickets/${ticketId}/comments/${commentNo}`,
      {
        active: false,
      },
    );

    return null;
  },
};
