import {
  addMonths,
  addWeeks,
  endOfDay,
  endOfMonth,
  endOfWeek,
} from "date-fns";
import { DateRange } from "react-day-picker";

import { DueDate } from "@/domain/common";

export const convertDueDate = (value: DueDate): DateRange | undefined => {
  const now = new Date();

  switch (value) {
    case "today":
      return { from: now, to: endOfDay(now) };

    case "this_week":
      return { from: now, to: endOfWeek(now, { weekStartsOn: 1 }) };

    case "this_2week":
      return {
        from: now,
        to: endOfWeek(addWeeks(now, 1), { weekStartsOn: 1 }),
      };

    case "this_month":
      return { from: now, to: endOfMonth(now) };

    case "within_week":
      return { from: now, to: addWeeks(now, 1) };

    case "within_2week":
      return { from: now, to: addWeeks(now, 2) };

    case "within_month":
      return { from: now, to: new Date(addMonths(now, 1)) };

    case "overdue":
    case "all":
    default:
      return undefined;
  }
};
