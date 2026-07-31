import {
  SERVICE_DESK_APPROVAL_STEP_KEY,
  SERVICE_DESK_KEY,
} from "@/feature/serviceDesk/shared/keys";
import type { ServiceDeskApprovalStepListParams } from "@/lib/application/contracts/serviceDesk";

/** Builds stable TanStack Query keys for approval step cache entries. */
export const approvalStepQueryKeys = {
  all: [SERVICE_DESK_KEY, SERVICE_DESK_APPROVAL_STEP_KEY] as const,

  lists: () => [...approvalStepQueryKeys.all, "list"] as const,
  list: (params?: ServiceDeskApprovalStepListParams) =>
    [...approvalStepQueryKeys.lists(), params] as const,
};
