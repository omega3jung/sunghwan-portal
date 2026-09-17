"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ticketDraftQueryKeys } from "../../ticketDraft/api";
import { ticketHistoryQueryKeys } from "../../ticketHistory/api";
import { serviceDeskTicketApi } from "./api";
import { ticketQueryKeys } from "./queryKeys";

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

export const useUpdateServiceDeskTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: serviceDeskTicketApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketQueryKeys.all });
    },
  });
};

export const useRequesterUpdateServiceDeskTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: serviceDeskTicketApi.updateRequester,
    onSuccess: (_ticket, variables) => {
      queryClient.invalidateQueries({ queryKey: ticketQueryKeys.all });
      queryClient.invalidateQueries({
        queryKey: ticketHistoryQueryKeys.list(variables.ticketId),
      });
    },
  });
};

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
        queryKey: ticketQueryKeys.searches(),
      });
      queryClient.invalidateQueries({
        queryKey: ticketHistoryQueryKeys.list(variables.ticketId),
      });
    },
  });
};

export const usePrepareTicketAttachmentsMutation = () => {
  return useMutation({
    mutationFn: serviceDeskTicketApi.prepareAttachments,
  });
};
