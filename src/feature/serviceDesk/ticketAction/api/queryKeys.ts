export const ticketActionQueryKeys = {
  all: ["serviceDesk", "ticket", "action"] as const,
  lists: () => [...ticketActionQueryKeys.all, "list"] as const,
  list: (ticketId: string) =>
    [...ticketActionQueryKeys.lists(), ticketId] as const,
  details: () => [...ticketActionQueryKeys.all, "detail"] as const,
  detail: (ticketId: string, actionNo: string) =>
    [...ticketActionQueryKeys.details(), ticketId, actionNo] as const,
};
