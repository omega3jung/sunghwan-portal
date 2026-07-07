import type { SearchDateFilterOption } from "@/components/custom/DatePicker";
import type { TreeMultiComboBoxOption } from "@/components/custom/MultiComboBox";
import { statusBadgeLocales } from "@/components/custom/StatusBadge/locales";
import type { SystemStatus } from "@/components/custom/StatusBadge/types";
import type { dueAt } from "@/domain/common";
import type { MainCategory } from "@/domain/serviceDesk";
import {
  OPEN_TICKET_STATUS_FILTER_VALUE,
  OPEN_TICKET_STATUS_FILTER_VALUES,
} from "@/feature/serviceDesk/ticketSearch/statusFilter";
import type { DateRangePreset, Locale, ValueLabel } from "@/shared/types";

type CategoryLabelResolver = (name: MainCategory["name"]) => string;
type Translate = (key: string) => string;

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

export const createTicketStatusFilterOptions = (
  statusOptions: ValueLabel<SystemStatus>[],
  locale: Locale,
): TreeMultiComboBoxOption[] => {
  const statusLabelMap = new Map(
    statusOptions.map((option) => [option.value, option.label]),
  );
  const localizedLabels = statusBadgeLocales[locale] ?? statusBadgeLocales.en;
  const fallbackLabels = statusBadgeLocales.en;
  const openLabel =
    localizedLabels.open ??
    fallbackLabels.open ??
    OPEN_TICKET_STATUS_FILTER_VALUE;

  return [
    {
      value: OPEN_TICKET_STATUS_FILTER_VALUE,
      label: openLabel,
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

export const createTicketDueByOptions = (
  tDomain: Translate,
): SearchDateFilterOption<dueAt>[] => {
  return [
    { value: "all", label: tDomain("enum.dueAt.options.all") },
    { value: "overdue", label: tDomain("enum.dueAt.options.overDue") },
    { value: "today", label: tDomain("enum.dueAt.options.today") },
    {
      value: "this_week",
      label: tDomain("enum.dueAt.options.thisWeek"),
    },
    {
      value: "this_2week",
      label: tDomain("enum.dueAt.options.this2Week"),
    },
    {
      value: "this_month",
      label: tDomain("enum.dueAt.options.thisMonth"),
    },
    {
      value: "within_week",
      label: tDomain("enum.dueAt.options.withinWeek"),
    },
    {
      value: "within_2week",
      label: tDomain("enum.dueAt.options.within2Week"),
    },
    {
      value: "within_month",
      label: tDomain("enum.dueAt.options.withinMonth"),
    },
    { value: "range", label: tDomain("enum.dueAt.options.custom") },
  ];
};
