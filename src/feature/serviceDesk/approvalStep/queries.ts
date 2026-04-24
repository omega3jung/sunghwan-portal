import { useQuery } from "@tanstack/react-query";

import { STATIC_QUERY_OPTIONS } from "@/lib/reactQuery";

import { serviceDeskApprovalStepApi } from "./api";
import { approvalStepQueryKeys } from "./queryKeys";
import { ServiceDeskApprovalStepListParams } from "./types";

export const useServiceDeskApprovalStepListQuery = (
  params?: ServiceDeskApprovalStepListParams,
) => {
  return useQuery({
    queryKey: approvalStepQueryKeys.list(params),
    queryFn: () => serviceDeskApprovalStepApi.list(params),
    enabled: params !== undefined,
    ...STATIC_QUERY_OPTIONS,
  });
};

export const useServiceDeskApprovalStepQuery = (id: string | number) => {
  return useQuery({
    queryKey: approvalStepQueryKeys.detail(id),
    queryFn: () => serviceDeskApprovalStepApi.get(id),
    enabled: !!id,
    ...STATIC_QUERY_OPTIONS,
  });
};
