import {
  IT_SERVICE_DESK_ASSIGNMENT_RULE_KEY,
  IT_SERVICE_DESK_KEY,
} from "@/feature/itServiceDesk/keys";
import { DbParams } from "@/shared/types/api";

export const assignmentRuleQueryKeys = {
  all: [IT_SERVICE_DESK_KEY, IT_SERVICE_DESK_ASSIGNMENT_RULE_KEY] as const,
  list: (params: DbParams) =>
    [...assignmentRuleQueryKeys.all, "list", JSON.stringify(params)] as const,
};
