import { DbParams } from "@/shared/types";
import {
  combineRuleGroups,
  createArrayContainsAnyFilter,
  createDateRangeFilter,
  createEqualsAnyFilter,
  createKeywordFilter,
} from "@/shared/utils/routing";

import { TicketSearchCriteriaFormValues } from "./forms";

export const mapSearchCriteriaToDbParams = (
  values: TicketSearchCriteriaFormValues,
): DbParams => {
  const filter = combineRuleGroups([
    createKeywordFilter({
      fields: ["ticketNumber", "subject"],
      keyword: values.keyword,
    }),

    createEqualsAnyFilter({
      field: "categoryId",
      values: values.category,
    }),

    createEqualsAnyFilter({
      field: "status",
      values: values.status,
    }),

    createEqualsAnyFilter({
      field: "riskLevel",
      values: values.riskLevel,
    }),

    createEqualsAnyFilter({
      field: "priority",
      values: values.priority,
    }),

    createArrayContainsAnyFilter({
      field: "assigneeUsernames",
      values: values.assignee,
    }),

    createEqualsAnyFilter({
      field: "requesterUsername",
      values: values.requester,
    }),

    createDateRangeFilter({
      field: "createdAt",
      dateRange: values.period.dateRange,
    }),

    createDateRangeFilter({
      field: "dueAt",
      dateRange: values.dueBy?.dateRange,
    }),
  ]);

  return {
    filter,
  };
};
