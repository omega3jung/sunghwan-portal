import { describe, expect, it, vi } from "vitest";

import { employeeQueryKeys } from "@/feature/organization/employee";
import { ticketQueryKeys } from "@/feature/serviceDesk/ticket/api/queryKeys";
import { ticketHistoryQueryKeys } from "@/feature/serviceDesk/ticketHistory/api/queryKeys";

import { invalidateApprovalStepMutationQueries } from "./invalidation";
import { approvalStepQueryKeys } from "./queryKeys";

describe("Approval Step mutation invalidation", () => {
  it("invalidates configuration, tickets, and routing-reset history", async () => {
    const invalidateQueries = vi.fn().mockResolvedValue(undefined);

    await invalidateApprovalStepMutationQueries({ invalidateQueries });

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: approvalStepQueryKeys.all,
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: employeeQueryKeys.lists(),
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ticketQueryKeys.all,
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: ticketHistoryQueryKeys.all,
    });
  });
});
