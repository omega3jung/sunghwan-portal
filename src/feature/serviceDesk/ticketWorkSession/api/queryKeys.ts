import {
  SERVICE_DESK_KEY,
  SERVICE_DESK_TICKET_KEY,
} from "@/feature/serviceDesk/shared/keys";

const SERVICE_DESK_TICKET_WORK_SESSION_KEY = "work-session";

export const ticketWorkSessionQueryKeys = {
  all: [
    SERVICE_DESK_KEY,
    SERVICE_DESK_TICKET_KEY,
    SERVICE_DESK_TICKET_WORK_SESSION_KEY,
  ] as const,

  lists: () => [...ticketWorkSessionQueryKeys.all, "list"] as const,
  list: (ticketId: string) =>
    [...ticketWorkSessionQueryKeys.lists(), ticketId] as const,

  details: () => [...ticketWorkSessionQueryKeys.all, "detail"] as const,
  detail: (ticketId: string, workSessionNo: string) =>
    [...ticketWorkSessionQueryKeys.details(), ticketId, workSessionNo] as const,
};
