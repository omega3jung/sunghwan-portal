import {
  SERVICE_DESK_KEY,
  SERVICE_DESK_TICKET_KEY,
} from "@/feature/serviceDesk/shared/keys";

const SERVICE_DESK_TICKET_TRACK_TIME_KEY = "track-time";

export const ticketTrackTimeQueryKeys = {
  all: [
    SERVICE_DESK_KEY,
    SERVICE_DESK_TICKET_KEY,
    SERVICE_DESK_TICKET_TRACK_TIME_KEY,
  ] as const,

  lists: () => [...ticketTrackTimeQueryKeys.all, "list"] as const,
  list: (ticketId: string) =>
    [...ticketTrackTimeQueryKeys.lists(), ticketId] as const,

  details: () => [...ticketTrackTimeQueryKeys.all, "detail"] as const,
  detail: (ticketId: string, trackTimeNo: string) =>
    [...ticketTrackTimeQueryKeys.details(), ticketId, trackTimeNo] as const,
};
