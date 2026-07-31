"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ticketDraftQueryKeys } from "../../ticketDraft/api";
import { ticketHistoryQueryKeys } from "../../ticketHistory/api";
import { serviceDeskTicketApi } from "./api";
import { ticketQueryKeys } from "./queryKeys";

/** Provides the client mutation hook for create service desk ticket and invalidates affected cached data. */
export const useCreateServiceDeskTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: serviceDeskTicketApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: ticketDraftQueryKeys.all });
    },
  });
};

/** Provides the client mutation hook for update service desk ticket and invalidates affected cached data. */
export const useUpdateServiceDeskTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: serviceDeskTicketApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketQueryKeys.all });
    },
  });
};

/** Provides the client mutation hook for requester update service desk ticket and invalidates affected cached data. */
export const useRequesterUpdateServiceDeskTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: serviceDeskTicketApi.updateRequester,
    onSuccess: (_ticket, variables) => {
      queryClient.invalidateQueries({ queryKey: ticketQueryKeys.all });
      queryClient.invalidateQueries({
        queryKey: ticketQueryKeys.detail(variables.ticketId),
      });
      queryClient.invalidateQueries({
        queryKey: ticketHistoryQueryKeys.list(variables.ticketId),
      });
    },
  });
};

/** Provides the client mutation hook for delete service desk ticket and invalidates affected cached data. */
export const useDeleteServiceDeskTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: serviceDeskTicketApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketQueryKeys.all });
    },
  });
};

/** Provides the client mutation hook for start ticket work mutation and invalidates affected cached data. */
export const useStartTicketWorkMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: serviceDeskTicketApi.startWork,
    onSuccess: (_ticket, variables) => {
      queryClient.invalidateQueries({
        queryKey: ticketQueryKeys.detail(variables.ticketId),
      });
      queryClient.invalidateQueries({
        queryKey: ticketQueryKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: ticketHistoryQueryKeys.list(variables.ticketId),
      });
    },
  });
};

/** Provides the client mutation hook for prepare ticket attachments mutation and invalidates affected cached data. */
export const usePrepareTicketAttachmentsMutation = () => {
  return useMutation({
    mutationFn: serviceDeskTicketApi.prepareAttachments,
  });
};
