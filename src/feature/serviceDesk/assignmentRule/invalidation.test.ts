import { describe, expect, it, vi } from "vitest";

import { invalidateAssignmentRuleRecommendations } from "./invalidation";
import { assignmentRuleQueryKeys } from "./queryKeys";

describe("Assignment Rule recommendation invalidation", () => {
  it("invalidates recommendations when organization dependencies change", async () => {
    const invalidateQueries = vi.fn().mockResolvedValue(undefined);

    await invalidateAssignmentRuleRecommendations({ invalidateQueries });

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: assignmentRuleQueryKeys.recommendations(),
    });
    expect(invalidateQueries).toHaveBeenCalledOnce();
  });
});
