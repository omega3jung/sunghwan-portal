import { addMonths } from "date-fns";

import { TicketSearchCriteriaFormValues } from "./types";

export const ticketSearchCriteriaFormDefaultValues: TicketSearchCriteriaFormValues =
  {
    category: [],
    status: [],
    assignee: [],
    requester: [],
    period: {
      type: "lastMonth",
      dateRange: {
        from: addMonths(new Date(), -1),
        to: new Date(),
      },
    },
    dueBy: {
      type: "within2Week",
      dateRange: {
        from: addMonths(new Date(), -1),
        to: new Date(),
      },
    },
    priority: [],
    riskLevel: [],
    keyword: "",
  };
