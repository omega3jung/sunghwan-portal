import {
  SERVICE_DESK_APPROVAL_STEP_KEY,
  SERVICE_DESK_KEY,
} from "@/feature/serviceDesk/keys";

import { ServiceDeskApprovalStepListParams } from "./types";

export const approvalStepQueryKeys = {
  all: [SERVICE_DESK_KEY, SERVICE_DESK_APPROVAL_STEP_KEY] as const,

  lists: () => [...approvalStepQueryKeys.all, "list"] as const,
  list: (params?: ServiceDeskApprovalStepListParams) =>
    [...approvalStepQueryKeys.lists(), params] as const,

  details: () => [...approvalStepQueryKeys.all, "detail"] as const,
  detail: (id: string | number) =>
    [...approvalStepQueryKeys.details(), id] as const,
};
