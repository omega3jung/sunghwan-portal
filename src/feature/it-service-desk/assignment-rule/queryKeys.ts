import {
  IT_SERVICE_DESK_ASSIGNMENT_RULE_KEY,
  IT_SERVICE_DESK_KEY,
} from "@/feature/it-service-desk/keys";
import { DbParams } from "@/types";

export const assignmentRuleQueryKeys = {
  all: [IT_SERVICE_DESK_KEY, IT_SERVICE_DESK_ASSIGNMENT_RULE_KEY] as const,
  list: (params: DbParams) =>
    [...assignmentRuleQueryKeys.all, "list", params] as const,
};
