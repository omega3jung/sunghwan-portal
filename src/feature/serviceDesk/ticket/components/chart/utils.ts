import { endOfDay, endOfWeek, isBefore, isValid, startOfDay } from "date-fns";

import { TicketSummary } from "@/domain/serviceDesk";
import { selectTicketAssigneeIds } from "@/feature/serviceDesk/ticket/utils";
import { ImageValueLabel, LocalizedText } from "@/shared/types";

import { ChartSummaryItem, SlaBucketValue } from "./types";

const UNASSIGNED_VALUE = "__unassigned__";

const sortSummaryItems = (items: ChartSummaryItem[]): ChartSummaryItem[] => {
  return items.sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count;
    }

    return a.label.localeCompare(b.label);
  });
};

const toSummaryItems = (
  values: Array<{ value: string; label: string }>,
): ChartSummaryItem[] => {
  const map = new Map<string, ChartSummaryItem>();

  values.forEach((item) => {
    const key = item.value;
    const existing = map.get(key);

    if (existing) {
      existing.count += 1;
      return;
    }

    map.set(key, {
      value: item.value,
      label: item.label,
      count: 1,
    });
  });

  return sortSummaryItems(Array.from(map.values()));
};

/** Documents the build status summary responsibility exposed by this client feature module. */
export const buildStatusSummary = (
  tickets: TicketSummary[],
  statusLabelMap: Map<string, string>,
): ChartSummaryItem[] => {
  return toSummaryItems(
    tickets.map((ticket) => ({
      value: ticket.status,
      label: statusLabelMap.get(ticket.status) ?? ticket.status,
    })),
  );
};

/** Documents the build category summary responsibility exposed by this client feature module. */
export const buildCategorySummary = (
  tickets: TicketSummary[],
  getCategoryLabel: (ticket: TicketSummary) => string,
): ChartSummaryItem[] => {
  return toSummaryItems(
    tickets.map((ticket) => {
      const label = getCategoryLabel(ticket);

      return {
        value: label,
        label,
      };
    }),
  );
};

/** Documents the build department summary responsibility exposed by this client feature module. */
export const buildDepartmentSummary = (
  tickets: TicketSummary[],
  getDepartmentLabel: (name: LocalizedText) => string,
  fallbackLabel: string,
): ChartSummaryItem[] => {
  return toSummaryItems(
    tickets.map((ticket) => {
      if (
        !ticket.requesterDepartmentId ||
        !ticket.requesterDepartmentName
      ) {
        return {
          value: fallbackLabel,
          label: fallbackLabel,
        };
      }

      const label = getDepartmentLabel(ticket.requesterDepartmentName);

      return {
        value: ticket.requesterDepartmentId,
        label,
      };
    }),
  );
};

/** Documents the build tenant summary responsibility exposed by this client feature module. */
export const buildTenantSummary = (
  tickets: TicketSummary[],
  getTenantLabel: (name: LocalizedText) => string,
  fallbackLabel: string,
): ChartSummaryItem[] => {
  return toSummaryItems(
    tickets.map((ticket) => {
      if (!ticket.tenantId || !ticket.tenantName) {
        return {
          value: fallbackLabel,
          label: fallbackLabel,
        };
      }

      return {
        value: ticket.tenantId,
        label: getTenantLabel(ticket.tenantName),
      };
    }),
  );
};

/** Documents the build assignee summary responsibility exposed by this client feature module. */
export const buildAssigneeSummary = (
  tickets: TicketSummary[],
  usersById: Map<string, ImageValueLabel>,
  unassignedLabel: string,
): ChartSummaryItem[] => {
  const values: Array<{ value: string; label: string }> = [];

  tickets.forEach((ticket) => {
    const assigneeUsernames = selectTicketAssigneeIds(ticket);

    if (!assigneeUsernames.length) {
      values.push({
        value: UNASSIGNED_VALUE,
        label: unassignedLabel,
      });
      return;
    }

    assigneeUsernames.forEach((assigneeUsername) => {
      const assignee = usersById.get(assigneeUsername);

      values.push({
        value: assigneeUsername,
        label: assignee?.label ?? assigneeUsername,
      });
    });
  });

  return toSummaryItems(values);
};

/** Documents the get sla bucket responsibility exposed by this client feature module. */
export const getSlaBucket = (
  dueAt: string,
  now: Date = new Date(),
): SlaBucketValue => {
  const dueDate = new Date(dueAt);

  if (!isValid(dueDate)) {
    return "later";
  }

  const dayStart = startOfDay(now);
  const dayEnd = endOfDay(now);

  if (isBefore(dueDate, dayStart)) {
    return "overdue";
  }

  if (!isBefore(dayEnd, dueDate)) {
    return "dueToday";
  }

  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  if (!isBefore(weekEnd, dueDate)) {
    return "dueThisWeek";
  }

  return "later";
};

/** Documents the build sla summary responsibility exposed by this client feature module. */
export const buildSlaSummary = (
  tickets: TicketSummary[],
  labels: Record<SlaBucketValue, string>,
): ChartSummaryItem[] => {
  const initialOrder: SlaBucketValue[] = [
    "overdue",
    "dueToday",
    "dueThisWeek",
    "later",
  ];

  const map = new Map<SlaBucketValue, ChartSummaryItem>(
    initialOrder.map((bucket) => [
      bucket,
      {
        value: bucket,
        label: labels[bucket],
        count: 0,
      },
    ]),
  );

  tickets.forEach((ticket) => {
    const bucket = getSlaBucket(ticket.dueAt);
    const item = map.get(bucket);

    if (!item) {
      return;
    }

    item.count += 1;
  });

  return initialOrder
    .map((bucket) => map.get(bucket))
    .filter((item): item is ChartSummaryItem => Boolean(item));
};

/** Reports whether unassigned assignee value satisfies the feature policy. */
export const isUnassignedAssigneeValue = (value: string) => {
  return value === UNASSIGNED_VALUE;
};
