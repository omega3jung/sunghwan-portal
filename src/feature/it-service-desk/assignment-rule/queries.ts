import { useQuery } from "@tanstack/react-query";

import { DbParams } from "@/types";

import { fetchItServiceDeskAssignmentRule } from "./api";
import { assignmentRuleQueryKeys } from "./queryKeys";

export const useFetchItServiceDeskAssignmentRule = (params: DbParams) => {
  return useQuery({
    queryKey: assignmentRuleQueryKeys.list(params),
    queryFn: () => fetchItServiceDeskAssignmentRule(params),
    enabled: true,
    staleTime: 60_000,
  });
};
