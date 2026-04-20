import client from "@/api/client";
import { TicketTrackTime } from "@/domain/serviceDesk";
import {
  TicketTrackDurationFormValues,
  TicketTrackRangeFormValues,
} from "@/feature/serviceDesk/ticket/trackTime/forms";
import { OResponse } from "@/shared/types/api";

type TicketTrackTimeResponse = OResponse<TicketTrackTime>;

// feature-scoped API.
export const serviceDeskTicketTrackTimeApi = {
  list: async (ticketId: string): Promise<TicketTrackTime[]> => {
    if (!ticketId) return [];

    const res = await client.api.get<TicketTrackTimeResponse>(
      `/api/service-desk/tickets/${ticketId}/track-time`,
    );

    return res.data.items;
  },

  get: async (
    ticketId: string,
    trackTimeNo: string,
  ): Promise<TicketTrackTime | null> => {
    if (!ticketId || !trackTimeNo) return null;

    const res = await client.api.get<TicketTrackTime>(
      `/api/service-desk/tickets/${ticketId}/track-time/${trackTimeNo}`,
    );

    return res.data;
  },

  remove: async (ticketId: string, trackTimeNo: string): Promise<null> => {
    if (!trackTimeNo) {
      throw new Error("trackTimeNo is required for remove");
    }

    await client.api.delete(
      `/api/service-desk/tickets/${ticketId}/track-time/${trackTimeNo}`,
    );

    return null;
  },

  range: {
    create: async ({
      ticketId,
      values,
    }: {
      ticketId: string;
      values: TicketTrackRangeFormValues;
    }): Promise<TicketTrackTime> => {
      const res = await client.api.post<TicketTrackTime>(
        `/api/service-desk/tickets/${ticketId}/track-time`,
        values,
      );

      return res.data;
    },

    update: async ({
      ticketId,
      trackTimeNo,
      values,
    }: {
      ticketId: string;
      trackTimeNo: string;
      values: TicketTrackRangeFormValues;
    }): Promise<TicketTrackTime> => {
      if (!trackTimeNo) {
        throw new Error("trackTimeNo is required for update");
      }

      const res = await client.api.put<TicketTrackTime>(
        `/api/service-desk/tickets/${ticketId}/track-time/${trackTimeNo}`,
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
    }): Promise<TicketTrackTime> => {
      const res = await client.api.post<TicketTrackTime>(
        `/api/service-desk/tickets/${ticketId}/track-time`,
        values,
      );

      return res.data;
    },

    update: async ({
      ticketId,
      trackTimeNo,
      values,
    }: {
      ticketId: string;
      trackTimeNo: string;
      values: TicketTrackDurationFormValues;
    }): Promise<TicketTrackTime> => {
      if (!trackTimeNo) {
        throw new Error("trackTimeNo is required for update");
      }

      const res = await client.api.put<TicketTrackTime>(
        `/api/service-desk/tickets/${ticketId}/track-time/${trackTimeNo}`,
        values,
      );

      return res.data;
    },
  },

  timer: {
    start: async (ticketId: string): Promise<TicketTrackTime> => {
      if (!ticketId) {
        throw new Error("ticketId is required for start");
      }

      const res = await client.api.post<TicketTrackTime>(
        `/api/service-desk/tickets/${ticketId}/track-time/start`,
      );

      return res.data;
    },

    finish: async (ticketId: string): Promise<TicketTrackTime> => {
      if (!ticketId) {
        throw new Error("ticketId is required for finish");
      }

      const res = await client.api.post<TicketTrackTime>(
        `/api/service-desk/tickets/${ticketId}/track-time/finish`,
      );

      return res.data;
    },

    switch: async (ticketId: string): Promise<TicketTrackTime> => {
      if (!ticketId) {
        throw new Error("ticketId is required for switch");
      }

      const res = await client.api.post<TicketTrackTime>(
        `/api/service-desk/tickets/${ticketId}/track-time/switch`,
      );

      return res.data;
    },
  },
};
