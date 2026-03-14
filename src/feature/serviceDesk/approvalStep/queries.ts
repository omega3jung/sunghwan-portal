import { useQuery } from "@tanstack/react-query";

import { serviceDeskApprovalStepApi } from "@/api/serviceDesk/approvalStep";
import { STATIC_QUERY_OPTIONS } from "@/lib/reactQuery";
import { DbParams } from "@/shared/types/api";

import { approvalStepQueryKeys } from "./queryKeys";

export const useServiceDeskApprovalStepListQuery = (params: DbParams) => {
  return useQuery({
    queryKey: approvalStepQueryKeys.list(params),
    queryFn: () => serviceDeskApprovalStepApi.list(params),
    enabled: !!params,
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
