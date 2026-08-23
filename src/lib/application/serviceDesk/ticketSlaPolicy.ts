import { ApiError } from "@/lib/application/api";

/** Returns the start of the UTC calendar day at the configured SLA offset. */
export function getMinimumTicketDueAt(
  defaultSlaDays: number,
  now: Date = new Date(),
) {
  const minimum = new Date(now);
  minimum.setUTCHours(0, 0, 0, 0);
  minimum.setUTCDate(minimum.getUTCDate() + Math.max(0, defaultSlaDays));
  return minimum;
}

/** Enforces the category-derived minimum due date at the server boundary. */
export function assertTicketDueAtMeetsSla(
  dueAt: Date | string,
  defaultSlaDays: number,
  now: Date = new Date(),
) {
  const due = new Date(dueAt);
  const minimum = getMinimumTicketDueAt(defaultSlaDays, now);

  if (!Number.isFinite(due.getTime()) || due < minimum) {
    throw new ApiError("serviceDesk.tickets.dueBeforeCategorySla", 422, {
      minimumDueAt: minimum.toISOString(),
    });
  }
}

/** Category changes cannot shorten an existing deadline or bypass the new SLA. */
export function resolveCategoryChangeDueAt(
  currentDueAt: Date | string,
  submittedDueAt: Date | string,
  defaultSlaDays: number,
  now: Date = new Date(),
) {
  const minimum = getMinimumTicketDueAt(defaultSlaDays, now);
  const current = new Date(currentDueAt);
  const submitted = new Date(submittedDueAt);
  return new Date(
    Math.max(minimum.getTime(), current.getTime(), submitted.getTime()),
  );
}
