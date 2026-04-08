import {
  SERVICE_DESK_KEY,
  SERVICE_DESK_TICKET_KEY,
} from "@/feature/serviceDesk/keys";

const SERVICE_DESK_TICKET_COMMENT_KEY = "comment";

export const ticketCommentQueryKeys = {
  all: [
    SERVICE_DESK_KEY,
    SERVICE_DESK_TICKET_KEY,
    SERVICE_DESK_TICKET_COMMENT_KEY,
  ] as const,

  lists: () => [...ticketCommentQueryKeys.all, "list"] as const,
  list: (ticketId: string) =>
    [...ticketCommentQueryKeys.lists(), ticketId] as const,

  details: () => [...ticketCommentQueryKeys.all, "detail"] as const,
  detail: (ticketId: string, commentNo: string) =>
    [...ticketCommentQueryKeys.details(), ticketId, commentNo] as const,
};
