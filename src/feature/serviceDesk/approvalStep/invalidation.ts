import type { QueryClient } from "@tanstack/react-query";

import { employeeQueryKeys } from "@/feature/organization/employee";
import { ticketQueryKeys } from "@/feature/serviceDesk/ticket/api/queryKeys";
import { ticketHistoryQueryKeys } from "@/feature/serviceDesk/ticketHistory/api/queryKeys";

import { approvalStepQueryKeys } from "./queryKeys";

/** Invalidates settings and ticket state changed by Approval force apply. */
export async function invalidateApprovalStepMutationQueries(
  queryClient: Pick<QueryClient, "invalidateQueries">,
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: approvalStepQueryKeys.all }),
    queryClient.invalidateQueries({ queryKey: employeeQueryKeys.lists() }),
    queryClient.invalidateQueries({ queryKey: ticketQueryKeys.all }),
    queryClient.invalidateQueries({ queryKey: ticketHistoryQueryKeys.all }),
  ]);
}
