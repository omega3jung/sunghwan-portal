import { addMonths } from "date-fns";

import { TicketSearchCriteriaFormValues } from "./types";

/** Defines stable initial values for the ticket search criteria form form. */
export const ticketSearchCriteriaFormDefaultValues: TicketSearchCriteriaFormValues =
  {
    category: [],
    status: [],
    assignee: [],
    requester: [],
    period: {
      type: "last_3month",
      dateRange: {
        from: addMonths(new Date(), -3),
        to: new Date(),
      },
    },
    dueBy: {
      type: "all",
      dateRange: undefined,
    },
    priority: [],
    riskLevel: [],
    keyword: "",
  };
