import {
  IT_SERVICE_DESK_APPROVAL_STEP_KEY,
  IT_SERVICE_DESK_KEY,
} from "@/feature/itServiceDesk/keys";
import { DbParams } from "@/shared/types/api";

export const approvalStepQueryKeys = {
  all: [IT_SERVICE_DESK_KEY, IT_SERVICE_DESK_APPROVAL_STEP_KEY] as const,
  list: (params: DbParams) =>
    [...approvalStepQueryKeys.all, "list", JSON.stringify(params)] as const,
};
