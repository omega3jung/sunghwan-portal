import { TicketWorkSession } from "@/domain/serviceDesk";
import client from "@/lib/api";
import { OResponse } from "@/shared/types/api";

import {
  TicketTrackDurationFormValues,
  TicketTrackRangeFormValues,
} from "../forms";
import { TicketWorkSessionSubmitPayload } from "../types";

type TicketWorkSessionResponse = OResponse<TicketWorkSession>;

// feature-scoped API.
export const serviceDeskTicketWorkSessionApi = {
  list: async (ticketId: string): Promise<TicketWorkSession[]> => {
    if (!ticketId) return [];

    const res = await client.api.get<TicketWorkSessionResponse>(
      `/api/service-desk/tickets/${ticketId}/work-session`,
    );

    return res.data.items;
  },

  get: async (
    ticketId: string,
    workSessionNo: string,
  ): Promise<TicketWorkSession | null> => {
    if (!ticketId || !workSessionNo) return null;

    const res = await client.api.get<TicketWorkSession>(
      `/api/service-desk/tickets/${ticketId}/work-session/${workSessionNo}`,
    );

    return res.data;
  },

  remove: async (ticketId: string, workSessionNo: string): Promise<null> => {
    if (!workSessionNo) {
      throw new Error("workSessionNo is required for remove");
    }

    await client.api.delete(
      `/api/service-desk/tickets/${ticketId}/work-session/${workSessionNo}`,
    );

    return null;
  },

  submitManual: async (
    payload: TicketWorkSessionSubmitPayload,
  ): Promise<TicketWorkSession> => {
    const res = await client.api.post<TicketWorkSession>(
      `/api/service-desk/tickets/${payload.ticketId}/work-session`,
      payload,
    );

    return res.data;
  },

  range: {
    create: async ({
      ticketId,
      values,
    }: {
      ticketId: string;
      values: TicketTrackRangeFormValues;
    }): Promise<TicketWorkSession> => {
      const res = await client.api.post<TicketWorkSession>(
        `/api/service-desk/tickets/${ticketId}/work-session`,
        values,
      );

      return res.data;
    },

    update: async ({
      ticketId,
      workSessionNo,
      values,
    }: {
      ticketId: string;
      workSessionNo: string;
      values: TicketTrackRangeFormValues;
    }): Promise<TicketWorkSession> => {
      if (!workSessionNo) {
        throw new Error("workSessionNo is required for update");
      }

      const res = await client.api.put<TicketWorkSession>(
        `/api/service-desk/tickets/${ticketId}/work-session/${workSessionNo}`,
        values,
      );

      return res.data;
    },
  },

  duration: {
    create: async ({
      ticketId,
      values,
    }: {
      ticketId: string;
      values: TicketTrackDurationFormValues;
    }): Promise<TicketWorkSession> => {
      const res = await client.api.post<TicketWorkSession>(
        `/api/service-desk/tickets/${ticketId}/work-session`,
        values,
      );

      return res.data;
    },

    update: async ({
      ticketId,
      workSessionNo,
      values,
    }: {
      ticketId: string;
      workSessionNo: string;
      values: TicketTrackDurationFormValues;
    }): Promise<TicketWorkSession> => {
      if (!workSessionNo) {
        throw new Error("workSessionNo is required for update");
      }

      const res = await client.api.put<TicketWorkSession>(
        `/api/service-desk/tickets/${ticketId}/work-session/${workSessionNo}`,
        values,
      );

      return res.data;
    },
  },

  timer: {
    start: async (ticketId: string): Promise<TicketWorkSession> => {
      if (!ticketId) {
        throw new Error("ticketId is required for start");
      }

      const res = await client.api.post<TicketWorkSession>(
        `/api/service-desk/tickets/${ticketId}/work-session/start`,
      );

      return res.data;
    },

    finish: async (ticketId: string): Promise<TicketWorkSession> => {
      if (!ticketId) {
        throw new Error("ticketId is required for finish");
      }

      const res = await client.api.post<TicketWorkSession>(
        `/api/service-desk/tickets/${ticketId}/work-session/finish`,
      );

      return res.data;
    },

    switch: async (ticketId: string): Promise<TicketWorkSession> => {
      if (!ticketId) {
        throw new Error("ticketId is required for switch");
      }

      const res = await client.api.post<TicketWorkSession>(
        `/api/service-desk/tickets/${ticketId}/work-session/switch`,
      );

      return res.data;
    },
  },
};
