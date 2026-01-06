import {
  IT_SERVICE_DESK_APPROVAL_STEP_KEY,
  IT_SERVICE_DESK_KEY,
} from "@/feature/it-service-desk/keys";
import { DbParams } from "@/types";

export const approvalStepQueryKeys = {
  all: [IT_SERVICE_DESK_KEY, IT_SERVICE_DESK_APPROVAL_STEP_KEY] as const,
  list: (params: DbParams) =>
    [...approvalStepQueryKeys.all, "list", params] as const,
};
