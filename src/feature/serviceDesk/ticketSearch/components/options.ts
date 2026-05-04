import type { SearchDateFilterOption } from "@/components/custom/DatePicker";
import type { TreeMultiComboBoxOption } from "@/components/custom/MultiComboBox";
import type { dueAt } from "@/domain/common";
import type { MainCategory } from "@/domain/serviceDesk";
import type { DateRangePreset } from "@/shared/types";

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
