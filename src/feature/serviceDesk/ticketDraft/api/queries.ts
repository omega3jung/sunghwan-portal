"use client";

import { useQuery } from "@tanstack/react-query";

import { getServiceDeskQueryOptions } from "../../shared/utils/queryOptions";
import { ticketDraftQueryKeys } from "./queryKeys";
import { serviceDeskTicketDraftRepo, useTicketDraftRepoContext } from "./repo";

export const useServiceDeskTicketDraftQuery = () => {
  const context = useTicketDraftRepoContext();
  const ticketQueryOptions = getServiceDeskQueryOptions(context.dataScope);

  return useQuery({
    queryKey: ticketDraftQueryKeys.draft(context),
    queryFn: () => serviceDeskTicketDraftRepo.get(context),
    enabled: context.isReady,
    ...ticketQueryOptions,
  });
};
