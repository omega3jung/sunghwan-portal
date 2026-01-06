import { useQuery } from "@tanstack/react-query";

import { DbParams } from "@/types";

import { fetchItServiceDeskApprovalStep } from "./api";
import { approvalStepQueryKeys } from "./queryKeys";

export const useFetchItServiceDeskApprovalStep = (params: DbParams) => {
  return useQuery({
    queryKey: approvalStepQueryKeys.list(params),
    queryFn: () => fetchItServiceDeskApprovalStep(params),
    enabled: true,
    staleTime: 60_000,
  });
};
