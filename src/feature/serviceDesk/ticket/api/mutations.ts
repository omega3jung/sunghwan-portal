"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ticketHistoryQueryKeys } from "../../ticketHistory/api";
import type { TicketFormValues } from "../forms";
import { serviceDeskTicketApi } from "./api";
import { ticketQueryKeys } from "./queryKeys";
import { serviceDeskTicketDraftRepo, useTicketDraftRepoContext } from "./repo";

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

export const useStartTicketWorkMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: serviceDeskTicketApi.startWork,
    onSuccess: (_ticket, variables) => {
      queryClient.invalidateQueries({
        queryKey: ticketHistoryQueryKeys.list(variables.ticketId),
      });
    },
  });
};

export function useCreateServiceDeskTicketDraft() {
  const queryClient = useQueryClient();
  const context = useTicketDraftRepoContext();

  // message will be handeled where call mutation by useMutationToast.
  return useMutation({
    mutationFn: (data: TicketFormValues) =>
      serviceDeskTicketDraftRepo.create({
        ...context,
        data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketQueryKeys.drafts() });
    },
  });
}

export function useUpdateServiceDeskTicketDraft() {
  const queryClient = useQueryClient();
  const context = useTicketDraftRepoContext();

  // message will be handeled where call mutation by useMutationToast.
  return useMutation({
    mutationFn: (data: TicketFormValues) =>
      serviceDeskTicketDraftRepo.update({
        ...context,
        data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketQueryKeys.drafts() });
    },
  });
}

export function useRemoveServiceDeskTicketDraft() {
  const queryClient = useQueryClient();
  const context = useTicketDraftRepoContext();

  // message will be handeled where call mutation by useMutationToast.
  return useMutation({
    mutationFn: () => serviceDeskTicketDraftRepo.remove(context),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketQueryKeys.drafts() });
    },
  });
}
