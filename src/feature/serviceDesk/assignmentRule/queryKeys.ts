import {
  SERVICE_DESK_ASSIGNMENT_RULE_KEY,
  SERVICE_DESK_KEY,
} from "@/feature/serviceDesk/keys";
import { DbParams } from "@/shared/types/api";

export const assignmentRuleQueryKeys = {
  all: [SERVICE_DESK_KEY, SERVICE_DESK_ASSIGNMENT_RULE_KEY] as const,
  list: (params: DbParams) =>
    [...assignmentRuleQueryKeys.all, "list", JSON.stringify(params)] as const,
};
