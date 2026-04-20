import { useMutation, useQueryClient } from "@tanstack/react-query";

import { serviceDeskTicketTrackTimeApi } from "@/api/serviceDesk/ticket/trackTime";

import { ticketHistoryQueryKeys } from "../../history/api/queryKeys";
import { ticketQueryKeys } from "../../ticket/api/queryKeys";
import { ticketTrackTimeQueryKeys } from "./queryKeys";

const invalidateTicketTrackTimeQueries = (
  queryClient: ReturnType<typeof useQueryClient>,
  ticketId: string,
  trackTimeNo?: string,
) => {
  queryClient.invalidateQueries({
    queryKey: ticketTrackTimeQueryKeys.list(ticketId),
  });

  if (trackTimeNo) {
    queryClient.invalidateQueries({
      queryKey: ticketTrackTimeQueryKeys.detail(ticketId, trackTimeNo),
    });
  }

  queryClient.invalidateQueries({
    queryKey: ticketHistoryQueryKeys.list(ticketId),
  });

  queryClient.invalidateQueries({
    queryKey: ticketQueryKeys.detail(ticketId),
  });

  queryClient.invalidateQueries({
    queryKey: ticketQueryKeys.lists(),
  });
};

export const useCreateTicketTrackTimeByRange = () => {
  const queryClient = useQueryClient();

  // message will be handeled where call mutation by useMutationToast.
  return useMutation({
    mutationFn: serviceDeskTicketTrackTimeApi.range.create,
    onSuccess: (data, variables) => {
      invalidateTicketTrackTimeQueries(
        queryClient,
        variables.ticketId,
        String(data.trackTimeNo),
      );
    },
  });
};

export const useUpdateTicketTrackTimeByRange = () => {
  const queryClient = useQueryClient();

  // message will be handeled where call mutation by useMutationToast.
  return useMutation({
    mutationFn: serviceDeskTicketTrackTimeApi.range.update,
    onSuccess: (_data, variables) => {
      invalidateTicketTrackTimeQueries(
        queryClient,
        variables.ticketId,
        variables.trackTimeNo,
      );
    },
  });
};

export const useCreateTicketTrackTimeByDuration = () => {
  const queryClient = useQueryClient();

  // message will be handeled where call mutation by useMutationToast.
  return useMutation({
    mutationFn: serviceDeskTicketTrackTimeApi.duration.create,
    onSuccess: (data, variables) => {
      invalidateTicketTrackTimeQueries(
        queryClient,
        variables.ticketId,
        String(data.trackTimeNo),
      );
    },
  });
};

export const useUpdateTicketTrackTimeByDuration = () => {
  const queryClient = useQueryClient();

  // message will be handeled where call mutation by useMutationToast.
  return useMutation({
    mutationFn: serviceDeskTicketTrackTimeApi.duration.update,
    onSuccess: (_data, variables) => {
      invalidateTicketTrackTimeQueries(
        queryClient,
        variables.ticketId,
        variables.trackTimeNo,
      );
    },
  });
};

export const useDeleteTicketTrackTime = () => {
  const queryClient = useQueryClient();

  // message will be handeled where call mutation by useMutationToast.
  return useMutation({
    mutationFn: ({
      ticketId,
      trackTimeNo,
    }: {
      ticketId: string;
      trackTimeNo: string;
    }) => serviceDeskTicketTrackTimeApi.remove(ticketId, trackTimeNo),
    onSuccess: (_data, variables) => {
      invalidateTicketTrackTimeQueries(
        queryClient,
        variables.ticketId,
        variables.trackTimeNo,
      );
    },
  });
};

export const useStartTicketTrackTimer = () => {
  const queryClient = useQueryClient();

  // message will be handeled where call mutation by useMutationToast.
  return useMutation({
    mutationFn: serviceDeskTicketTrackTimeApi.timer.start,
    onSuccess: (data, ticketId) => {
      invalidateTicketTrackTimeQueries(
        queryClient,
        ticketId,
        String(data.trackTimeNo),
      );
    },
  });
};

export const useFinishTicketTrackTimer = () => {
  const queryClient = useQueryClient();

  // message will be handeled where call mutation by useMutationToast.
  return useMutation({
    mutationFn: serviceDeskTicketTrackTimeApi.timer.finish,
    onSuccess: (data, ticketId) => {
      invalidateTicketTrackTimeQueries(
        queryClient,
        ticketId,
        String(data.trackTimeNo),
      );
    },
  });
};

export const useSwitchTicketTrackTimer = () => {
  const queryClient = useQueryClient();

  // message will be handeled where call mutation by useMutationToast.
  return useMutation({
    mutationFn: serviceDeskTicketTrackTimeApi.timer.switch,
    onSuccess: (data, ticketId) => {
      invalidateTicketTrackTimeQueries(
        queryClient,
        ticketId,
        String(data.trackTimeNo),
      );
    },
  });
};
