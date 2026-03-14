import { addMonths, endOfDay, endOfMonth, endOfWeek } from "date-fns";

import { DueDate } from "@/domain/common";

export const convertDueDate = (value: DueDate) => {
  const now = new Date();

  switch (value) {
    case "today":
      return { from: now, to: endOfDay(now) };

    case "thisWeek":
      return { from: now, to: endOfWeek(now, { weekStartsOn: 1 }) };

    case "thisMonth":
      return { from: now, to: endOfMonth(now) };

    case "withinMonth":
      return { from: now, to: new Date(addMonths(now, 1)) };

    case "overdue":
      return { to: now };

    case "all":
    default:
      return undefined;
  }
};
