import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { DateRange } from "react-day-picker";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";

import { DateRangePicker } from "@/components/custom/DatePicker";
import { DEFAULT_DATE_RANGE_PRESETS } from "@/shared/constants";

const initialRange: DateRange = {
  from: new Date(2026, 8, 1),
  to: new Date(2026, 8, 9),
};

const meta = {
  title: "Custom/DateRangePicker",
  component: DateRangePicker,
  args: {
    className: "w-80",
    onPeriodChange: fn(),
    onRangeChange: fn(),
    options: ["today", "this_week", "this_month", "range"],
    period: "this_month",
    range: initialRange,
    showTextType: "text",
  },
  argTypes: {
    defaultPeriod: { table: { disable: true } },
    options: { control: "check", options: DEFAULT_DATE_RANGE_PRESETS },
    period: { control: "select", options: DEFAULT_DATE_RANGE_PRESETS },
    showTextType: { control: "select", options: ["text", "range", "all"] },
    variant: { control: "select", options: ["default", "ghost"] },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Controlled semantic period and concrete date range. Preset and calendar interactions update Storybook args together.",
      },
    },
  },
} satisfies Meta<typeof DateRangePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function Render(args) {
    const [, updateArgs] = useArgs<typeof args>();

    return (
      <div className="space-y-3">
        <DateRangePicker
          className={args.className}
          modal={args.modal}
          options={args.options}
          period={args.period}
          range={args.range}
          showTextType={args.showTextType}
          variant={args.variant}
          onPeriodChange={(period) => {
            updateArgs({ period });
            args.onPeriodChange?.(period);
          }}
          onRangeChange={(range) => {
            updateArgs({ range });
            args.onRangeChange(range);
          }}
        />
        <output className="block rounded-md bg-muted px-3 py-2 font-mono text-xs">
          {JSON.stringify({ period: args.period, range: args.range })}
        </output>
      </div>
    );
  },
};

export const Empty: Story = {
  args: { period: undefined, range: undefined },
  render: Default.render,
};

export const CustomRange: Story = {
  args: { period: "range", range: initialRange, showTextType: "all" },
  render: Default.render,
};
