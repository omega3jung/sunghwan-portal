"use client";

import { useQuery } from "@tanstack/react-query";

import { useServiceDeskQueryOptions } from "../shared/hooks/useServiceDeskQueryOptions";
import { serviceDeskApprovalStepApi } from "./api";
import { approvalStepQueryKeys } from "./queryKeys";
import { ServiceDeskApprovalStepListParams } from "./types";

export const useServiceDeskApprovalStepListQuery = (
  params?: ServiceDeskApprovalStepListParams,
) => {
  const { dataScope, queryOptions } = useServiceDeskQueryOptions();

  return useQuery({
    queryKey: approvalStepQueryKeys.list(params),
    queryFn: () => serviceDeskApprovalStepApi.list(params),
    enabled: params !== undefined && !!dataScope,
    ...queryOptions,
  });
};
