"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { TicketAction } from "@/domain/serviceDesk";

import { ticketQueryKeys } from "../../ticket/api/queryKeys";
import { ticketHistoryQueryKeys } from "../../ticketHistory/api";
import { ticketWorkSessionQueryKeys } from "../../ticketWorkSession/api";
import { serviceDeskTicketActionApi } from "./api";
import { ticketActionQueryKeys } from "./queryKeys";

type RemoveTicketActionParams = {
  ticketId: string;
  actionNo: string;
};

/**
 * Refreshes every server projection a ticket action may affect.
 * Actions can change ticket state, routing, and running work sessions, so the
 * action response alone is insufficient to update those caches safely.
 */
const invalidateTicketActionQueries = (
  queryClient: ReturnType<typeof useQueryClient>,
  ticketId: string,
  actionNo?: string,
) => {
  queryClient.invalidateQueries({
    queryKey: ticketActionQueryKeys.list(ticketId),
  });

  if (actionNo) {
    queryClient.invalidateQueries({
      queryKey: ticketActionQueryKeys.detail(ticketId, actionNo),
    });
  }

  queryClient.invalidateQueries({
    queryKey: ticketQueryKeys.detail(ticketId),
  });

  queryClient.invalidateQueries({
    queryKey: ticketQueryKeys.lists(),
  });

  queryClient.invalidateQueries({
    queryKey: ticketWorkSessionQueryKeys.list(ticketId),
  });
};

/** Provides the client mutation hook for ticket action mutation and invalidates affected cached data. */
export const useTicketActionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: serviceDeskTicketActionApi.execute,

    onSuccess: (newAction, variables) => {
      const { ticketId } = variables;
      const actionNo = String(newAction.actionNo);

      // Show the committed action immediately, then refetch all affected
      // projections. The server remains authoritative if its mapper differs.
      queryClient.setQueryData<TicketAction[]>(
        ticketActionQueryKeys.list(ticketId),
        (old = []) => [...old, newAction],
      );

      queryClient.setQueryData(
        ticketActionQueryKeys.detail(ticketId, actionNo),
        newAction,
      );

      invalidateTicketActionQueries(queryClient, ticketId, actionNo);

      // History is never synthesized from the action response; immutable server
      // events are refetched so their ordering and metadata remain authoritative.
      queryClient.invalidateQueries({
        queryKey: ticketHistoryQueryKeys.list(ticketId),
      });
    },
  });
};

/** Provides the client mutation hook for delete service desk ticket action and invalidates affected cached data. */
export const useDeleteServiceDeskTicketAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, actionNo }: RemoveTicketActionParams) =>
      serviceDeskTicketActionApi.remove({ ticketId, actionNo }),
    onSuccess: (_data, variables) => {
      invalidateTicketActionQueries(
        queryClient,
        variables.ticketId,
        variables.actionNo,
      );
    },
  });
};
