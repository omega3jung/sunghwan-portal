"use client";

import { useState } from "react";
import { DateRange } from "react-day-picker";

import { DateRangePicker } from "@/components/custom/DatePicker/DateRangePicker";
import { MultiComboBox } from "@/components/custom/MultiComboBox";
import { DEFAULT_DATE_RANGE_PRESETS } from "@/shared/constants/date";
import { DateRangePreset } from "@/shared/types";

export default function DateRangePickerPage() {
  const [period, setPeriod] = useState<DateRangePreset | undefined>(
    "this_month",
  );
  const [range, setRange] = useState<DateRange>();

  const testData = DEFAULT_DATE_RANGE_PRESETS.map((range) => {
    return { value: range, label: range };
  });

  const [selectedRanges, setSelectedRanges] = useState<DateRangePreset[]>([
    "today",
    "this_week",
    "this_month",
    "range",
  ]);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h4 className="p-2">Period Variants</h4>

        <MultiComboBox
          options={testData}
          value={selectedRanges}
          onSelect={(selected: string) => {
            const newList = [...selectedRanges, selected as DateRangePreset];

            // sort by ranges order.
            setSelectedRanges(
              newList.sort(
                (a, b) => selectedRanges.indexOf(a) - selectedRanges.indexOf(b),
              ),
            );
          }}
          onRemove={(selected: string) => {
            const newChoice = selectedRanges?.filter(
              (value) => value !== selected,
            );

            setSelectedRanges(newChoice);
          }}
        />
      </div>
      <div>
        <h4 className="p-2">Date Range Picker</h4>

        <DateRangePicker
          variant={"underline"}
          period={period}
          onPeriodChange={setPeriod}
          range={range}
          onRangeChange={setRange}
          showRangeText={true}
          options={selectedRanges}
        />
      </div>
      <div>
        <h6 className="p-2">{`${range?.from} ~ ${range?.to}`}</h6>
      </div>
    </div>
  );
}
