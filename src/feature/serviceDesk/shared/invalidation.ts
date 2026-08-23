import type { QueryClient } from "@tanstack/react-query";

import { approvalStepQueryKeys } from "../approvalStep/queryKeys";
import { assignmentRuleQueryKeys } from "../assignmentRule/queryKeys";
import { categoryQueryKeys } from "../category/queryKeys";
import { tenantQueryKeys } from "../tenant/queryKeys";

/** Invalidates only Service Desk families whose target tenant relationship changed. */
export function invalidateServiceDeskTenantDependencies(
  queryClient: QueryClient,
) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: tenantQueryKeys.lists() }),
    queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all }),
    queryClient.invalidateQueries({ queryKey: approvalStepQueryKeys.all }),
    queryClient.invalidateQueries({ queryKey: assignmentRuleQueryKeys.all }),
  ]);
}

/** Organization members and fields affect only assignment recommendations. */
export function invalidateServiceDeskOrganizationDependencies(
  queryClient: QueryClient,
) {
  return queryClient.invalidateQueries({
    queryKey: assignmentRuleQueryKeys.recommendations(),
  });
}
