import { endOfDay, startOfDay } from "date-fns";

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

/** Match the date picker's calendar days even before the search dialog is opened. */
function normalizeSearchDateRange(range?: { from?: Date; to?: Date }) {
  return {
    from: range?.from ? startOfDay(range.from) : undefined,
    to: range?.to ? endOfDay(range.to) : undefined,
  };
}

/** Normalizes optional form values before the criteria are persisted or submitted. */
export const normalizeTicketSearchCriteriaFormValues = (
  values: TicketSearchCriteriaFormValues,
): TicketSearchCriteriaFormValues => ({
  ...values,
  status: normalizeTicketStatusFilterValues(values.status),
});

/** Maps UI criteria to the recursive filter and sort contract consumed by the ticket API. */
export const mapSearchCriteriaToDbParams = (
  values: TicketSearchCriteriaFormValues,
): DbParams => {
  const statusValues = expandTicketStatusFilters(values.status);

  const filter = combineRuleGroups([
    createFieldFilter({
      field: "active",
      value: true,
    }),

    createFieldFilter({
      field: "cat_scope",
      value: values.cat_scope,
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
      dateRange: normalizeSearchDateRange(values.period.dateRange),
    }),

    createDateRangeFilter({
      field: "dueAt",
      dateRange: normalizeSearchDateRange(values.dueBy?.dateRange),
    }),
  ]);

  return {
    filter,
  };
};
