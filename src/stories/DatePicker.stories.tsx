import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useTranslation } from "react-i18next";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";

import { DatePicker } from "@/components/custom/DatePicker";
import { NS } from "@/lib/application/i18n";

const meta = {
  title: "Custom/DatePicker",
  component: DatePicker,
  args: {
    className: "w-72",
    onChange: fn(),
    value: undefined,
  },
  argTypes: {
    maxDate: { control: "date" },
    minDate: { control: "date" },
    variant: {
      control: "select",
      options: ["default", "outline", "secondary", "ghost", "link"],
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Controlled single-date picker with configurable calendar bounds.",
      },
    },
  },
} satisfies Meta<typeof DatePicker>;

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
        <DatePicker
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
          {t("cards.date")}
        </p>
      </div>
    );
  },
};

export const WithValue: Story = {
  args: { value: new Date(2026, 8, 9) },
  render: Default.render,
};

export const Bounded: Story = {
  args: {
    maxDate: new Date(2026, 9, 31),
    minDate: new Date(2026, 8, 1),
    value: new Date(2026, 8, 9),
  },
  render: Default.render,
};

export const Disabled: Story = {
  args: { disabled: true, value: new Date(2026, 8, 9) },
  render: Default.render,
};
