"use client";

import { useQuery } from "@tanstack/react-query";

import type { ServiceDeskApprovalStepListParams } from "@/lib/application/contracts/serviceDesk";

import { useServiceDeskQueryOptions } from "../shared/hooks/useServiceDeskQueryOptions";
import { serviceDeskApprovalStepApi } from "./api";
import { approvalStepQueryKeys } from "./queryKeys";

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
