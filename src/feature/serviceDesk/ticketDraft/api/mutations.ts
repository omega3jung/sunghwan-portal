"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { TicketDraftFormPayload } from "./mapper";
import { ticketDraftQueryKeys } from "./queryKeys";
import { serviceDeskTicketDraftRepo, useTicketDraftRepoContext } from "./repo";

/** Provides the client mutation hook for create service desk ticket draft and invalidates affected cached data. */
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

/** Provides the client mutation hook for update service desk ticket draft and invalidates affected cached data. */
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

/** Provides the client mutation hook for discard service desk ticket draft and invalidates affected cached data. */
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
