import type { DateRange } from "react-day-picker";

import type { TicketSummary } from "@/domain/serviceDesk";
import {
  type ChartFilter,
  getSlaBucket,
  isUnassignedAssigneeValue,
} from "@/feature/serviceDesk/ticket/client";
import { selectTicketAssigneeIds } from "@/feature/serviceDesk/ticket/utils";
import { TICKET_PERIOD_OPTIONS } from "@/feature/serviceDesk/ticketSearch/client";
import type { DateRangePreset } from "@/shared/types";

import type { CriteriaPeriodRange } from "./types";

export const isDateRangePreset = (
  value: string,
): value is DateRangePreset => {
  return TICKET_PERIOD_OPTIONS.includes(value as DateRangePreset);
};

export const toCompleteCriteriaPeriodRange = (
  selected: DateRange | undefined,
): CriteriaPeriodRange | null => {
  if (!selected?.from || !selected.to) {
    return null;
  }

  return {
    from: selected.from,
    to: selected.to,
  };
};

export const getChartFilterFieldLabel = (
  filterType: NonNullable<ChartFilter>["type"],
  labels: {
    status: string;
    category: string;
    department: string;
    tenant: string;
    assignee: string;
    sla: string;
  },
) => {
  switch (filterType) {
    case "status":
      return labels.status;
    case "category":
      return labels.category;
    case "department":
      return labels.department;
    case "tenant":
      return labels.tenant;
    case "assignee":
      return labels.assignee;
    case "sla":
      return labels.sla;
    default:
      return filterType;
  }
};

export const isTicketMatchedByChartFilter = ({
  ticket,
  filter,
  getCategoryLabel,
  fallbackDepartmentLabel,
  fallbackTenantLabel,
}: {
  ticket: TicketSummary;
  filter: NonNullable<ChartFilter>;
  getCategoryLabel: (ticket: TicketSummary) => string;
  fallbackDepartmentLabel: string;
  fallbackTenantLabel: string;
}): boolean => {
  switch (filter.type) {
    case "status":
      return ticket.status === filter.value;
    case "category":
      return getCategoryLabel(ticket) === filter.value;
    case "department":
      return (
        (ticket.requesterDepartmentId && ticket.requesterDepartmentName
          ? ticket.requesterDepartmentId
          : fallbackDepartmentLabel) === filter.value
      );
    case "tenant":
      return (
        (ticket.tenantId && ticket.tenantName
          ? ticket.tenantId
          : fallbackTenantLabel) === filter.value
      );
    case "assignee": {
      const assigneeUsernames = selectTicketAssigneeIds(ticket);

      if (isUnassignedAssigneeValue(filter.value)) {
        return assigneeUsernames.length === 0;
      }
      return assigneeUsernames.includes(filter.value);
    }
    case "sla":
      return getSlaBucket(ticket.dueAt) === filter.value;
    default:
      return true;
  }
};
