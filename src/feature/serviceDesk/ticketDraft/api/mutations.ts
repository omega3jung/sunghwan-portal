"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { TicketDraftFormPayload } from "./mapper";
import { ticketDraftQueryKeys } from "./queryKeys";
import { serviceDeskTicketDraftRepo, useTicketDraftRepoContext } from "./repo";

export function useCreateServiceDeskTicketDraft() {
  const queryClient = useQueryClient();
  const context = useTicketDraftRepoContext();

  return useMutation({
    mutationFn: (data: TicketDraftFormPayload) =>
      serviceDeskTicketDraftRepo.create({
        ...context,
        data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ticketDraftQueryKeys.drafts(),
      });
    },
  });
}

export function useUpdateServiceDeskTicketDraft() {
  const queryClient = useQueryClient();
  const context = useTicketDraftRepoContext();

  return useMutation({
    mutationFn: (data: TicketDraftFormPayload) =>
      serviceDeskTicketDraftRepo.update({
        ...context,
        data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ticketDraftQueryKeys.drafts(),
      });
    },
  });
}

export function useDiscardServiceDeskTicketDraft() {
  const queryClient = useQueryClient();
  const context = useTicketDraftRepoContext();

  return useMutation({
    mutationFn: (ticketId?: string | null) =>
      serviceDeskTicketDraftRepo.discard({ ...context, ticketId }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ticketDraftQueryKeys.drafts(),
      });
    },
  });
}
