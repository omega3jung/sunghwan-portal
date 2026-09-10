import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useMemo } from "react";
import type { DateRange } from "react-day-picker";
import { useTranslation } from "react-i18next";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";

import {
  SearchDateFilter,
  type SearchDateFilterProps,
} from "@/components/custom/DatePicker";
import { resolvePresetRange } from "@/components/custom/DatePicker/utils";
import { NS } from "@/lib/application/i18n";
import { DATE_RANGE_PRESET_LABEL_KEYS } from "@/shared/constants";
import type { DateRangePreset } from "@/shared/types";

type Props = SearchDateFilterProps<DateRangePreset>;

const options: Props["options"] = [
  { label: "Today", value: "today" },
  { label: "This week", value: "this_week" },
  { label: "This month", value: "this_month" },
  { label: "Custom range", value: "range" },
];

const meta = {
  title: "Custom/SearchDateFilter",
  component: SearchDateFilter,
  args: {
    className: "w-80",
    onRangeChange: fn(),
    onValueChange: fn(),
    options,
    range: resolvePresetRange("today"),
    rangeValue: "range",
    resolveRange: resolvePresetRange,
    showTextType: "text",
    value: "today",
  },
  argTypes: {
    rangeValue: { control: "select", options: ["range"] },
    resolveRange: { control: false },
    showTextType: { control: "select", options: ["text", "range", "all"] },
    value: { control: "select", options: ["today", "this_week", "this_month", "range"] },
    variant: { control: "select", options: ["default", "ghost"] },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Domain-generic date filter whose semantic value and resolved concrete range remain parent-owned.",
      },
    },
  },
} satisfies Meta<Props>;

export default meta;
type Story = StoryObj<Props>;

export const Default: Story = {
  render: function Render(args) {
    const [, updateArgs] = useArgs<typeof args>();
    const { t } = useTranslation(NS.storybook, { keyPrefix: "datePicker" });
    const { t: tDatePicker } = useTranslation(NS.component, {
      keyPrefix: "datePicker",
    });
    const localizedOptions = useMemo(
      () =>
        args.options.map((option) => ({
          ...option,
          label: tDatePicker(DATE_RANGE_PRESET_LABEL_KEYS[option.value]),
        })),
      [args.options, tDatePicker],
    );

    return (
      <div className="space-y-3">
        <SearchDateFilter<DateRangePreset>
          {...args}
          options={localizedOptions}
          onRangeChange={(range: DateRange | undefined) => {
            updateArgs({ range });
            args.onRangeChange(range);
          }}
          onValueChange={(value) => {
            updateArgs({ value });
            args.onValueChange(value);
          }}
        />
        <p className="max-w-xl text-sm text-muted-foreground">
          {t("cards.search")}
        </p>
        <output className="block rounded-md bg-muted px-3 py-2 font-mono text-xs">
          {JSON.stringify({ value: args.value, range: args.range })}
        </output>
      </div>
    );
  },
};

export const CustomRange: Story = {
  args: {
    range: { from: new Date(2026, 8, 1), to: new Date(2026, 8, 9) },
    showTextType: "all",
    value: "range",
  },
  render: Default.render,
};
