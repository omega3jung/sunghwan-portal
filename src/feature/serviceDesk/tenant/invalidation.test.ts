import { describe, expect, it, vi } from "vitest";

import { approvalStepQueryKeys } from "../approvalStep/queryKeys";
import { assignmentRuleQueryKeys } from "../assignmentRule/queryKeys";
import { categoryQueryKeys } from "../category/queryKeys";
import { invalidateTenantMutationQueries } from "./invalidation";
import { tenantQueryKeys } from "./queryKeys";

describe("Tenant mutation invalidation", () => {
  it("invalidates every settings family affected by a tenant relationship change", async () => {
    const invalidateQueries = vi.fn().mockResolvedValue(undefined);

    await invalidateTenantMutationQueries({ invalidateQueries });

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: tenantQueryKeys.lists(),
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: categoryQueryKeys.all,
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: approvalStepQueryKeys.all,
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: assignmentRuleQueryKeys.all,
    });
    expect(invalidateQueries).toHaveBeenCalledTimes(4);
  });
});
