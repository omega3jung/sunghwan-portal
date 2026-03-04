import {
  SERVICE_DESK_APPROVAL_STEP_KEY,
  SERVICE_DESK_KEY,
} from "@/feature/serviceDesk/keys";
import { DbParams } from "@/shared/types/api";

export const approvalStepQueryKeys = {
  all: [SERVICE_DESK_KEY, SERVICE_DESK_APPROVAL_STEP_KEY] as const,
  list: (params: DbParams) =>
    [...approvalStepQueryKeys.all, "list", JSON.stringify(params)] as const,
};
