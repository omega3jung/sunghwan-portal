import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";

import { DateTimePicker } from "@/components/custom/DatePicker";

const meta = {
  title: "Custom/DateTimePicker",
  component: DateTimePicker,
  args: {
    className: "w-80",
    compact: false,
    minuteStep: 5,
    onChange: fn(),
    placeholder: "Select date and time",
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

    return (
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
