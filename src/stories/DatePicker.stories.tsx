import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import type { DateRange } from "react-day-picker";

import {
  DatePicker,
  DateRangePicker,
  DateTimePicker,
  SearchDateFilter,
  type SearchPeriod as SearchPeriodValue,
} from "@/components/custom/DatePicker";

const meta = {
  title: "Custom/DatePicker",
  component: DatePicker,
  args: {
    onChange: () => undefined,
    value: undefined,
  },
  parameters: {
    docs: {
      description: {
        component:
          "The project date-control family: a date, date-time, date range, and semantic search period.",
      },
    },
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

function SingleDateExample({ disabled = false }: { disabled?: boolean }) {
  const [value, setValue] = useState<Date>();

  return (
    <DatePicker
      className="w-72"
      disabled={disabled}
      onChange={setValue}
      value={value}
    />
  );
}

function DateTimeExample() {
  const [value, setValue] = useState<Date | undefined>(
    new Date(2026, 8, 9, 14, 30),
  );

  return (
    <DateTimePicker
      className="w-80"
      minuteStep={15}
      onChange={setValue}
      value={value}
    />
  );
}

function DateRangeExample() {
  const [range, setRange] = useState<DateRange>();

  return (
    <DateRangePicker
      className="w-80"
      onRangeChange={setRange}
      range={range}
      showTextType="all"
    />
  );
}

function SearchPeriodExample() {
  const [value, setValue] = useState<SearchPeriodValue | undefined>("all");
  const [range, setRange] = useState<DateRange>();

  return (
    <SearchDateFilter
      className="w-80"
      onRangeChange={setRange}
      onValueChange={setValue}
      options={[
        { label: "All time", value: "all" },
        { label: "Today", value: "today" },
        { label: "This week", value: "this_week" },
        { label: "Custom range", value: "range" },
      ]}
      range={range}
      rangeValue="range"
      value={value}
    />
  );
}

export const Default: Story = {
  render: () => <SingleDateExample />,
};

export const Disabled: Story = {
  render: () => <SingleDateExample disabled />,
};

export const DateTime: Story = {
  render: () => <DateTimeExample />,
};

export const Range: Story = {
  render: () => <DateRangeExample />,
};

export const SearchPeriod: Story = {
  render: () => <SearchPeriodExample />,
};
