import { ticketSearchCriteriaFormDefaultValues } from "@/feature/serviceDesk/ticketSearch";
import type { DateRangePreset } from "@/shared/types";

import type { InsightsSearchState } from "./types";

export const INSIGHTS_PAGE = 1;
export const INSIGHTS_PAGE_SIZE = 500;
export const INSIGHTS_SORT = "ticketNumber";
export const INSIGHTS_ORDER = "desc";
export const DEFAULT_INSIGHTS_PERIOD: DateRangePreset = "last_3month";

export const INSIGHTS_SEARCH_STATE_DEFAULT_VALUES: InsightsSearchState = {
  ...ticketSearchCriteriaFormDefaultValues,
  scope: "INTERNAL",
};
