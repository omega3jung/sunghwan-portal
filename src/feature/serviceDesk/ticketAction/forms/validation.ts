import type { TicketDetail } from "@/domain/serviceDesk";

import type { TicketActionDraftFormValues } from "./types";

/** Defines the stable cache or persistence key for action adjust no changes data. */
export const ACTION_ADJUST_NO_CHANGES_KEY =
  "actionTool.validation.adjustNoChanges";

const normalizeDateValue = (value?: Date | string) => {
  if (!value) {
    return undefined;
  }

  const timeValue = new Date(value).getTime();
  return Number.isNaN(timeValue) ? undefined : timeValue;
};

/** Reports whether an adjust command changes at least one planning field. */
export function hasTicketActionAdjustChanges(
  values: TicketActionDraftFormValues,
  ticket?: TicketDetail | null,
) {
  return (
    values.priority !== (ticket?.priority ?? "") ||
    values.riskLevel !== (ticket?.riskLevel ?? "") ||
    normalizeDateValue(values.dueAt) !== normalizeDateValue(ticket?.dueAt)
  );
}
