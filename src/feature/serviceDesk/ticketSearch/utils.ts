import { DbParams } from "@/shared/types";
import {
  combineRuleGroups,
  createArrayContainsAnyFilter,
  createDateRangeFilter,
  createEqualsAnyFilter,
  createFieldFilter,
  createKeywordFilter,
} from "@/shared/utils/routing";

import { TicketSearchCriteriaFormValues } from "./forms";
import {
  expandTicketStatusFilters,
  normalizeTicketStatusFilterValues,
} from "./statusFilter";

export const normalizeTicketSearchCriteriaFormValues = (
  values: TicketSearchCriteriaFormValues,
): TicketSearchCriteriaFormValues => ({
  ...values,
  status: normalizeTicketStatusFilterValues(values.status),
});

export const mapSearchCriteriaToDbParams = (
  values: TicketSearchCriteriaFormValues,
): DbParams => {
  const statusValues = expandTicketStatusFilters(values.status);

  const filter = combineRuleGroups([
    createFieldFilter({
      field: "active",
      value: true,
    }),

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
      values: statusValues,
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
