import { TicketDetail, TicketSummary } from "@/domain/serviceDesk";
import { TicketFormValues } from "@/feature/serviceDesk/ticket/forms";
import {
  PrepareTicketAttachmentsInput,
  PrepareTicketAttachmentsResponse,
  toTicketMutateRequestPayloadFromFormValues,
} from "@/feature/serviceDesk/ticket/write";
import client from "@/lib/api";
import { PaginatedSearchResponse } from "@/server/shared/types/api";
import { DbParams, OResponse } from "@/shared/types/api";

import { TicketSearchRequest } from "./types";

type TicketSummaryResponse = OResponse<TicketSummary>;
type TicketSearchQuery = {
  filter?: string;
  sort?: string;
  page: number;
  pageSize: number;
};

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

  search: async (
    request: TicketSearchRequest,
  ): Promise<PaginatedSearchResponse<TicketSummary>> => {
    const res = await client.api.get<
      PaginatedSearchResponse<TicketSummary>,
      TicketSearchQuery
    >(
      "/api/service-desk/tickets/search",
      { params: toTicketSearchQuery(request) },
    );

    return res.data;
  },

  get: async (id: string): Promise<TicketDetail | null> => {
    if (!id) return null;

    const res = await client.api.get<TicketDetail>(
      `/api/service-desk/tickets/${id}`,
    );
    return res.data;
  },

  prepareAttachments: async ({
    body,
    files,
  }: PrepareTicketAttachmentsInput): Promise<PrepareTicketAttachmentsResponse> => {
    const formData = new FormData();

    formData.append("body", body);
    files.forEach((file) => {
      formData.append("files", file);
    });

    const res = await client.api.post<PrepareTicketAttachmentsResponse>(
      `/api/service-desk/tickets/attachments/prepare`,
      formData,
    );

    return res.data;
  },

  create: async (data: TicketFormValues): Promise<TicketDetail> => {
    const prepared = await serviceDeskTicketApi.prepareAttachments({
      body: data.body,
      files: data.attachment,
    });
    const res = await client.api.post<TicketDetail>(
      `/api/service-desk/tickets`,
      toTicketMutateRequestPayloadFromFormValues(data, prepared),
    );
    return res.data;
  },

  update: async (data: TicketFormValues): Promise<TicketDetail> => {
    const prepared = await serviceDeskTicketApi.prepareAttachments({
      body: data.body,
      files: data.attachment,
    });
    const res = await client.api.put<TicketDetail>(
      `/api/service-desk/tickets/${data.id}`,
      toTicketMutateRequestPayloadFromFormValues(data, prepared),
    );
    return res.data;
  },

  startWork: async ({
    ticketId,
  }: {
    ticketId: string;
  }): Promise<TicketDetail> => {
    const res = await client.api.post<TicketDetail>(
      `/api/service-desk/tickets/${ticketId}/command/start-work`,
      {},
    );
    return res.data;
  },

  // soft delete. set disabled in db.
  remove: async (id: string): Promise<null> => {
    await client.api.delete(`/api/service-desk/tickets/${id}`);
    return null;
  },
};

function toTicketSearchQuery(request: TicketSearchRequest): TicketSearchQuery {
  return {
    ...(request.filter ? { filter: JSON.stringify(request.filter) } : {}),
    ...(request.sort ? { sort: JSON.stringify(request.sort) } : {}),
    page: request.page,
    pageSize: request.pageSize,
  };
}
