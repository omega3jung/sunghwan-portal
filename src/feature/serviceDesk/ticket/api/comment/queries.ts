import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { serviceDeskTicketCommentApi } from "@/api/serviceDesk/ticket/comment";
import { DYNAMIC_QUERY_OPTIONS } from "@/lib/reactQuery";

import { ticketCommentQueryKeys } from "./queryKeys";

export const useServiceDeskTicketCommentListQuery = (ticketId: string) => {
  return useQuery({
    queryKey: ticketCommentQueryKeys.list(ticketId),
    queryFn: () => serviceDeskTicketCommentApi.list(ticketId),
    placeholderData: keepPreviousData,
    enabled: !!ticketId,
    ...DYNAMIC_QUERY_OPTIONS,
  });
};

export const useServiceDeskTicketCommentQuery = (
  ticketId: string,
  commentNo: string,
) => {
  return useQuery({
    queryKey: ticketCommentQueryKeys.detail(ticketId, commentNo),
    queryFn: () => serviceDeskTicketCommentApi.get(ticketId, commentNo),
    enabled: !!ticketId && !!commentNo,
    ...DYNAMIC_QUERY_OPTIONS,
  });
};
