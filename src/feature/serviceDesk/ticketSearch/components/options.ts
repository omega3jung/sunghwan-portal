import type { SearchDateFilterOption } from "@/components/custom/DatePicker";
import type { TreeMultiComboBoxOption } from "@/components/custom/MultiComboBox";
import type { dueAt } from "@/domain/common";
import type { MainCategory, TicketStatus } from "@/domain/serviceDesk";
import {
  OPEN_TICKET_STATUS_FILTER_VALUE,
  OPEN_TICKET_STATUS_FILTER_VALUES,
} from "@/feature/serviceDesk/ticketSearch/statusFilter";
import type { DateRangePreset, ValueLabel } from "@/shared/types";

type CategoryLabelResolver = (name: MainCategory["name"]) => string;
type Translate = (key: string) => string;

/** Defines the supported ticket period choices presented by the feature. */
export const TICKET_PERIOD_OPTIONS: DateRangePreset[] = [
  "today",
  "this_week",
  "this_month",
  "last_week",
  "last_2week",
  "last_month",
  "last_2month",
  "last_3month",
  "range",
];

/** Defines the supported create ticket category choices presented by the feature. */
export const createTicketCategoryOptions = (
  categories: MainCategory[],
  getLabel: CategoryLabelResolver,
): TreeMultiComboBoxOption[] => {
  return categories.map((category) => ({
    value: category.id,
    label: getLabel(category.name),
    children: category.subCategories.map((subCategory) => ({
      value: subCategory.id,
      label: getLabel(subCategory.name),
    })),
  }));
};

/** Defines the supported create ticket status filter choices presented by the feature. */
export const createTicketStatusFilterOptions = (
  statusOptions: ValueLabel<TicketStatus>[],
  tStatus: Translate,
): TreeMultiComboBoxOption[] => {
  const statusLabelMap = new Map(
    statusOptions.map((option) => [option.value, option.label]),
  );
  return [
    {
      value: OPEN_TICKET_STATUS_FILTER_VALUE,
      label: tStatus("open"),
      children: OPEN_TICKET_STATUS_FILTER_VALUES.map((status) => ({
        value: status,
        label: statusLabelMap.get(status) ?? status,
      })),
    },
    ...(["Resolved", "Closed"] as const).map((status) => ({
      value: status,
      label: statusLabelMap.get(status) ?? status,
      children: [],
    })),
  ];
};

/** Defines the supported create ticket due by choices presented by the feature. */
export const createTicketDueByOptions = (
  tShared: Translate,
): SearchDateFilterOption<dueAt>[] => {
  return [
    { value: "all", label: tShared("enum.dueAt.options.all") },
    { value: "overdue", label: tShared("enum.dueAt.options.overDue") },
    { value: "today", label: tShared("enum.dueAt.options.today") },
    {
      value: "this_week",
      label: tShared("enum.dueAt.options.thisWeek"),
    },
    {
      value: "this_2week",
      label: tShared("enum.dueAt.options.this2Week"),
    },
    {
      value: "this_month",
      label: tShared("enum.dueAt.options.thisMonth"),
    },
    {
      value: "within_week",
      label: tShared("enum.dueAt.options.withinWeek"),
    },
    {
      value: "within_2week",
      label: tShared("enum.dueAt.options.within2Week"),
    },
    {
      value: "within_month",
      label: tShared("enum.dueAt.options.withinMonth"),
    },
    { value: "range", label: tShared("enum.dueAt.options.custom") },
  ];
};
