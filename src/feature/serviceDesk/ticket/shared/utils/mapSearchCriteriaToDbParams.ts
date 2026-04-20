import type { RuleGroupTypeIC } from "react-querybuilder";

import type { TicketSearchCriteriaFormValues } from "@/feature/serviceDesk/ticket/search/forms";
import type { DbParams } from "@/shared/types/api";

const createKeywordFilter = (keyword: string): RuleGroupTypeIC | undefined => {
  const trimmed = keyword.trim();

  if (!trimmed) {
    return undefined;
  }

  return {
    rules: [
      {
        field: "ticketNumber",
        operator: "contains",
        value: trimmed,
      },
      "or",
      {
        field: "subject",
        operator: "contains",
        value: trimmed,
      },
    ],
  };
};

export const mapSearchCriteriaToDbParams = (
  values: TicketSearchCriteriaFormValues,
): DbParams => {
  // TODO: refine mapping for period, dueBy, assignee/requester, status, category.
  // TODO: align field names/operators with the final service desk ticket API contract.
  return {
    filter: createKeywordFilter(values.keyword),
  };
};
