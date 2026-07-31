import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ticketQueryKeys } from "../../ticket/api/queryKeys";
import { ticketHistoryQueryKeys } from "../../ticketHistory/api";
import { serviceDeskTicketWorkSessionApi } from "./api";
import { ticketWorkSessionQueryKeys } from "./queryKeys";

/**
 * Invalidates all projections that a work-session command may change.
 * A single server transaction can update tracked time, ticket status, history,
 * and running sessions, so these caches must be reconciled together.
 */
const invalidateTicketWorkSessionQueries = (
  queryClient: ReturnType<typeof useQueryClient>,
  ticketId: string,
  workSessionNo?: string,
) => {
  queryClient.invalidateQueries({
    queryKey: ticketWorkSessionQueryKeys.list(ticketId),
  });

  if (workSessionNo) {
    queryClient.invalidateQueries({
      queryKey: ticketWorkSessionQueryKeys.detail(ticketId, workSessionNo),
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

/** Provides the client mutation hook for create ticket work session by range and invalidates affected cached data. */
export const useCreateTicketWorkSessionByRange = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: serviceDeskTicketWorkSessionApi.range.create,
    onSuccess: (data, variables) => {
      invalidateTicketWorkSessionQueries(
        queryClient,
        variables.ticketId,
        String(data.workSessionNo),
      );
    },
  });
};

/** Provides the client mutation hook for submit ticket work session and invalidates affected cached data. */
export const useSubmitTicketWorkSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: serviceDeskTicketWorkSessionApi.submitManual,
    onSuccess: (data, variables) => {
      invalidateTicketWorkSessionQueries(
        queryClient,
        variables.ticketId,
        String(data.workSessionNo),
      );
    },
  });
};

/** Provides the client mutation hook for update ticket work session by range and invalidates affected cached data. */
export const useUpdateTicketWorkSessionByRange = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: serviceDeskTicketWorkSessionApi.range.update,
    onSuccess: (_data, variables) => {
      invalidateTicketWorkSessionQueries(
        queryClient,
        variables.ticketId,
        variables.workSessionNo,
      );
    },
  });
};

/** Provides the client mutation hook for create ticket work session by duration and invalidates affected cached data. */
export const useCreateTicketWorkSessionByDuration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: serviceDeskTicketWorkSessionApi.duration.create,
    onSuccess: (data, variables) => {
      invalidateTicketWorkSessionQueries(
        queryClient,
        variables.ticketId,
        String(data.workSessionNo),
      );
    },
  });
};

/** Provides the client mutation hook for update ticket work session by duration and invalidates affected cached data. */
export const useUpdateTicketWorkSessionByDuration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: serviceDeskTicketWorkSessionApi.duration.update,
    onSuccess: (_data, variables) => {
      invalidateTicketWorkSessionQueries(
        queryClient,
        variables.ticketId,
        variables.workSessionNo,
      );
    },
  });
};

/** Provides the client mutation hook for delete ticket work session and invalidates affected cached data. */
export const useDeleteTicketWorkSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ticketId,
      workSessionNo,
    }: {
      ticketId: string;
      workSessionNo: string;
    }) => serviceDeskTicketWorkSessionApi.remove(ticketId, workSessionNo),
    onSuccess: (_data, variables) => {
      invalidateTicketWorkSessionQueries(
        queryClient,
        variables.ticketId,
        variables.workSessionNo,
      );
    },
  });
};

/** Provides the client mutation hook for start ticket work sessionr and invalidates affected cached data. */
export const useStartTicketWorkSessionr = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: serviceDeskTicketWorkSessionApi.timer.start,
    onSuccess: (data, ticketId) => {
      invalidateTicketWorkSessionQueries(
        queryClient,
        ticketId,
        String(data.workSessionNo),
      );
    },
  });
};

/** Provides the client mutation hook for finish ticket work sessionr and invalidates affected cached data. */
export const useFinishTicketWorkSessionr = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: serviceDeskTicketWorkSessionApi.timer.finish,
    onSuccess: (data, ticketId) => {
      invalidateTicketWorkSessionQueries(
        queryClient,
        ticketId,
        String(data.workSessionNo),
      );
    },
  });
};

/** Provides the client mutation hook for switch ticket work sessionr and invalidates affected cached data. */
export const useSwitchTicketWorkSessionr = () => {
  const queryClient = useQueryClient();

  // message will be handeled where call mutation by useMutationToast.
  return useMutation({
    mutationFn: serviceDeskTicketWorkSessionApi.timer.switch,
    onSuccess: (data, ticketId) => {
      invalidateTicketWorkSessionQueries(
        queryClient,
        ticketId,
        String(data.workSessionNo),
      );
    },
  });
};
