"use client";

import { useQuery } from "@tanstack/react-query";

import { useCurrentSession } from "@/feature/auth/session/client";

import { getServiceDeskQueryOptions } from "../shared/utils/queryOptions";
import { serviceDeskApprovalStepApi } from "./api";
import { approvalStepQueryKeys } from "./queryKeys";
import { ServiceDeskApprovalStepListParams } from "./types";

export const useServiceDeskApprovalStepListQuery = (
  params?: ServiceDeskApprovalStepListParams,
) => {
  const { data: currentSession } = useCurrentSession();
  const dataScope = currentSession?.user.dataScope;
  const ticketQueryOptions = getServiceDeskQueryOptions(dataScope);

  return useQuery({
    queryKey: approvalStepQueryKeys.list(params),
    queryFn: () => serviceDeskApprovalStepApi.list(params),
    enabled: params !== undefined && !!dataScope,
    ...ticketQueryOptions,
  });
};

export const useServiceDeskApprovalStepQuery = (id: string | number) => {
  const { data: currentSession } = useCurrentSession();
  const dataScope = currentSession?.user.dataScope;
  const ticketQueryOptions = getServiceDeskQueryOptions(dataScope);

  return useQuery({
    queryKey: approvalStepQueryKeys.detail(id),
    queryFn: () => serviceDeskApprovalStepApi.get(id),
    enabled: !!id && !!dataScope,
    ...ticketQueryOptions,
  });
};
