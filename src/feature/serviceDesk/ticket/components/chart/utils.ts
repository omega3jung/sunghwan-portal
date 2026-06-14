import { endOfDay, endOfWeek, isBefore, isValid, startOfDay } from "date-fns";

import { Department } from "@/domain/organization";
import { TicketSummary } from "@/domain/serviceDesk";
import { ImageValueLabel } from "@/shared/types";

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

export const buildDepartmentSummary = (
  tickets: TicketSummary[],
  requesterById: Map<string, { departmentId: string }>,
  departmentsById: Map<string, Department>,
  getDepartmentLabel: (department: Department) => string,
  fallbackLabel: string,
): ChartSummaryItem[] => {
  return toSummaryItems(
    tickets.map((ticket) => {
      const requester = requesterById.get(ticket.requesterUsername);
      const department = requester
        ? departmentsById.get(requester.departmentId)
        : undefined;

      if (!requester || !department) {
        return {
          value: fallbackLabel,
          label: fallbackLabel,
        };
      }

      const label = getDepartmentLabel(department);

      return {
        value: requester.departmentId,
        label,
      };
    }),
  );
};

export const buildAssigneeSummary = (
  tickets: TicketSummary[],
  usersById: Map<string, ImageValueLabel>,
  unassignedLabel: string,
): ChartSummaryItem[] => {
  const values: Array<{ value: string; label: string }> = [];

  tickets.forEach((ticket) => {
    if (!ticket.assigneeUsernames.length) {
      values.push({
        value: UNASSIGNED_VALUE,
        label: unassignedLabel,
      });
      return;
    }

    ticket.assigneeUsernames.forEach((assigneeUsername) => {
      const assignee = usersById.get(assigneeUsername);

      values.push({
        value: assigneeUsername,
        label: assignee?.label ?? assigneeUsername,
      });
    });
  });

  return toSummaryItems(values);
};

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

export const isUnassignedAssigneeValue = (value: string) => {
  return value === UNASSIGNED_VALUE;
};
