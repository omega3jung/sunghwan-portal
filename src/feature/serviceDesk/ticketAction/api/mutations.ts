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

export const useTicketActionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: serviceDeskTicketActionApi.execute,

    onSuccess: (newAction, variables) => {
      const { ticketId } = variables;
      const actionNo = String(newAction.actionNo);

      queryClient.setQueryData<TicketAction[]>(
        ticketActionQueryKeys.list(ticketId),
        (old = []) => [...old, newAction],
      );

      queryClient.setQueryData(
        ticketActionQueryKeys.detail(ticketId, actionNo),
        newAction,
      );

      invalidateTicketActionQueries(queryClient, ticketId, actionNo);

      queryClient.invalidateQueries({
        queryKey: ticketHistoryQueryKeys.list(ticketId),
      });
    },
  });
};

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
