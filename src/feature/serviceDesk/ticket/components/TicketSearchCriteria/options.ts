import type { SearchDateFilterOption } from "@/components/custom/DatePicker";
import type { TreeMultiComboBoxOption } from "@/components/custom/MultiComboBox";
import type { DueDate } from "@/domain/common";
import type { Category } from "@/domain/serviceDesk";
import type { DateRangePreset } from "@/shared/types";

type CategoryLabelResolver = (name: Category["name"]) => string;
type Translate = (key: string) => string;

export const TICKET_PERIOD_OPTIONS: DateRangePreset[] = [
  "today",
  "this_week",
  "this_month",
  "last_week",
  "last_2week",
  "last_month",
  "last_2month",
  "range",
];

export const createTicketCategoryOptions = (
  categories: Category[],
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
): SearchDateFilterOption<DueDate>[] => {
  return [
    { value: "all", label: tDomain("enum.dueDate.options.all") },
    { value: "overdue", label: tDomain("enum.dueDate.options.overDue") },
    { value: "today", label: tDomain("enum.dueDate.options.today") },
    {
      value: "thisWeek",
      label: tDomain("enum.dueDate.options.thisWeek"),
    },
    {
      value: "this2Week",
      label: tDomain("enum.dueDate.options.this2Week"),
    },
    {
      value: "thisMonth",
      label: tDomain("enum.dueDate.options.thisMonth"),
    },
    {
      value: "withinWeek",
      label: tDomain("enum.dueDate.options.withinWeek"),
    },
    {
      value: "within2Week",
      label: tDomain("enum.dueDate.options.within2Week"),
    },
    {
      value: "withinMonth",
      label: tDomain("enum.dueDate.options.withinMonth"),
    },
    { value: "range", label: tDomain("enum.dueDate.options.custom") },
  ];
};
