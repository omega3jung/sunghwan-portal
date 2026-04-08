import { useMutation, useQueryClient } from "@tanstack/react-query";

import { serviceDeskTicketCommentApi } from "@/api/serviceDesk/ticket/comment";

import { ticketQueryKeys } from "../ticket/queryKeys";
import { ticketCommentQueryKeys } from "./queryKeys";

type RemoveTicketCommentParams = {
  ticketId: string;
  commentNo: string;
};

const invalidateTicketCommentQueries = (
  queryClient: ReturnType<typeof useQueryClient>,
  ticketId: string,
  commentNo?: string,
) => {
  queryClient.invalidateQueries({
    queryKey: ticketCommentQueryKeys.list(ticketId),
  });

  if (commentNo) {
    queryClient.invalidateQueries({
      queryKey: ticketCommentQueryKeys.detail(ticketId, commentNo),
    });
  }

  queryClient.invalidateQueries({
    queryKey: ticketQueryKeys.detail(ticketId),
  });

  queryClient.invalidateQueries({
    queryKey: ticketQueryKeys.lists(),
  });
};

export const useCreateServiceDeskTicketComment = () => {
  const queryClient = useQueryClient();

  // message will be handled where calling mutation by useMutationToast.
  return useMutation({
    mutationFn: serviceDeskTicketCommentApi.create,
    onSuccess: (_data, variables) => {
      invalidateTicketCommentQueries(queryClient, variables.ticketId);
    },
  });
};

export const useUpdateServiceDeskTicketComment = () => {
  const queryClient = useQueryClient();

  // message will be handled where calling mutation by useMutationToast.
  return useMutation({
    mutationFn: serviceDeskTicketCommentApi.update,
    onSuccess: (_data, variables) => {
      invalidateTicketCommentQueries(
        queryClient,
        variables.ticketId,
        variables.commentNo ?? undefined,
      );
    },
  });
};

export const useDeleteServiceDeskTicketComment = () => {
  const queryClient = useQueryClient();

  // message will be handled where calling mutation by useMutationToast.
  return useMutation({
    mutationFn: ({ ticketId, commentNo }: RemoveTicketCommentParams) =>
      serviceDeskTicketCommentApi.remove(ticketId, commentNo),
    onSuccess: (_data, variables) => {
      invalidateTicketCommentQueries(
        queryClient,
        variables.ticketId,
        variables.commentNo,
      );
    },
  });
};
