import { useMutation, useQueryClient } from "@tanstack/react-query";

import { serviceDeskTicketApi } from "@/api/serviceDesk/ticket";

import { ticketQueryKeys } from "./queryKeys";

export const useCreateServiceDeskTicket = () => {
  const queryClient = useQueryClient();

  // message will be handeled where call mutation by useMutationToast.
  return useMutation({
    mutationFn: serviceDeskTicketApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketQueryKeys.all });
    },
  });
};

export const useUpdateServiceDeskTicket = () => {
  const queryClient = useQueryClient();

  // message will be handeled where call mutation by useMutationToast.
  return useMutation({
    mutationFn: serviceDeskTicketApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketQueryKeys.all });
    },
  });
};

export const useDeleteServiceDeskTicket = () => {
  const queryClient = useQueryClient();
  // message will be handeled where call mutation by useMutationToast.
  return useMutation({
    mutationFn: serviceDeskTicketApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketQueryKeys.all });
    },
  });
};

export const useCreateServiceDeskTicketDraft = () => {
  const queryClient = useQueryClient();

  // message will be handeled where call mutation by useMutationToast.
  return useMutation({
    mutationFn: serviceDeskTicketApi.draft.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketQueryKeys.all });
    },
  });
};

export const useUpdateServiceDeskTicketDraft = () => {
  const queryClient = useQueryClient();

  // message will be handeled where call mutation by useMutationToast.
  return useMutation({
    mutationFn: serviceDeskTicketApi.draft.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketQueryKeys.all });
    },
  });
};

export const useDeleteServiceDeskTicketDraft = () => {
  const queryClient = useQueryClient();
  // message will be handeled where call mutation by useMutationToast.
  return useMutation({
    mutationFn: serviceDeskTicketApi.draft.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketQueryKeys.all });
    },
  });
};
