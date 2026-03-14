import { useQuery } from "@tanstack/react-query";

import { serviceDeskAssignmentRuleApi } from "@/api/serviceDesk/assignmentRule";
import { STATIC_QUERY_OPTIONS } from "@/lib/reactQuery";
import { DbParams } from "@/shared/types/api";

import { assignmentRuleQueryKeys } from "./queryKeys";

export const useServiceDeskAssignmentRuleListQuery = (params: DbParams) => {
  return useQuery({
    queryKey: assignmentRuleQueryKeys.list(params),
    queryFn: () => serviceDeskAssignmentRuleApi.list(params),
    enabled: !!params,
    ...STATIC_QUERY_OPTIONS,
  });
};

export const useServiceDeskAssignmentRuleQuery = (id: string | number) => {
  return useQuery({
    queryKey: assignmentRuleQueryKeys.detail(id),
    queryFn: () => serviceDeskAssignmentRuleApi.get(id),
    enabled: !!id,
    ...STATIC_QUERY_OPTIONS,
  });
};
