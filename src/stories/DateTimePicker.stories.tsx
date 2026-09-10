import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useTranslation } from "react-i18next";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";

import { DateTimePicker } from "@/components/custom/DatePicker";
import { NS } from "@/lib/application/i18n";

const meta = {
  title: "Custom/DateTimePicker",
  component: DateTimePicker,
  args: {
    className: "w-80",
    compact: false,
    minuteStep: 5,
    onChange: fn(),
    value: new Date(2026, 8, 9, 14, 30),
  },
  argTypes: {
    maxDate: { control: "date" },
    minDate: { control: "date" },
    minuteStep: { control: "select", options: [1, 5, 10, 15, 30] },
    variant: {
      control: "select",
      options: ["default", "outline", "secondary", "ghost", "link"],
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Controlled date-time picker with compact layout, bounded dates, and supported minute increments.",
      },
    },
  },
} satisfies Meta<typeof DateTimePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

function toDate(value: Date | number | undefined) {
  return typeof value === "number" ? new Date(value) : value;
}

export const Default: Story = {
  render: function Render(args) {
    const [, updateArgs] = useArgs<typeof args>();
    const { t } = useTranslation(NS.storybook, { keyPrefix: "datePicker" });

    return (
      <div className="space-y-2">
        <DateTimePicker
          {...args}
          maxDate={toDate(args.maxDate)}
          minDate={toDate(args.minDate)}
          value={toDate(args.value)}
          onChange={(value) => {
            updateArgs({ value });
            args.onChange(value);
          }}
        />
        <p className="max-w-xl text-sm text-muted-foreground">
          {t("cards.dateTime")}
        </p>
      </div>
    );
  },
};

export const Compact: Story = {
  args: { compact: true },
  render: Default.render,
};

export const Bounded: Story = {
  args: {
    maxDate: new Date(2026, 9, 31),
    minDate: new Date(2026, 8, 1),
  },
  render: Default.render,
};

export const Disabled: Story = {
  args: { disabled: true },
  render: Default.render,
};
