import type { QueryClient } from "@tanstack/react-query";

import { approvalStepQueryKeys } from "../approvalStep/queryKeys";
import { assignmentRuleQueryKeys } from "../assignmentRule/queryKeys";
import { categoryQueryKeys } from "../category/queryKeys";
import { tenantQueryKeys } from "./queryKeys";

/** Invalidates settings families affected by a tenant relationship change. */
export function invalidateTenantMutationQueries(
  queryClient: Pick<QueryClient, "invalidateQueries">,
) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: tenantQueryKeys.lists() }),
    queryClient.invalidateQueries({ queryKey: categoryQueryKeys.all }),
    queryClient.invalidateQueries({ queryKey: approvalStepQueryKeys.all }),
    queryClient.invalidateQueries({ queryKey: assignmentRuleQueryKeys.all }),
  ]);
}
