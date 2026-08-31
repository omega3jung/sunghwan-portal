import type { QueryClient } from "@tanstack/react-query";

import { assignmentRuleQueryKeys } from "./queryKeys";

/** Organization changes affect assignment recommendations. */
export function invalidateAssignmentRuleRecommendations(
  queryClient: Pick<QueryClient, "invalidateQueries">,
) {
  return queryClient.invalidateQueries({
    queryKey: assignmentRuleQueryKeys.recommendations(),
  });
}
