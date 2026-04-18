import { addMonths, addWeeks, endOfDay, endOfMonth, endOfWeek } from "date-fns";
import { DateRange } from "react-day-picker";

import { dueAt } from "@/domain/common";
import { MainCategory } from "@/domain/serviceDesk";

/**
 * Service Desk shared domain helpers
 * - category hierarchy resolution
 * - category-driven lookup helpers
 *
 * Do not place ticket-only UI helpers here.
 */

export const convertdueAt = (value: dueAt): DateRange | undefined => {
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

export const findMainCategoryIdByCategoryId = (
  categories: MainCategory[],
  categoryId: string,
) => {
  let result = undefined;

  for (let i = 0; i < categories.length && !result; i++) {
    const subCategory = categories[i].subCategories.find(
      (item) => item.id === categoryId,
    );
    if (subCategory) {
      result = categories[i].id;
    }
  }

  return result;
};
