"use client";

import { useState } from "react";
import { DateRange } from "react-day-picker";

import { dateRangeMock } from "@/app/_mocks/pages/demo/date-range-picker";
import { DateRangePicker } from "@/components/custom/DatePicker/DateRangePicker";
import { Period } from "@/components/custom/DatePicker/types";
import { MultiComboBox } from "@/components/custom/MultiComboBox";

export default function DateRangePickerPage() {
  const [period, setPeriod] = useState<Period | undefined>("this_month");
  const [range, setRange] = useState<DateRange>();

  const testData = dateRangeMock.map((range) => {
    return { value: range, label: range };
  });

  const [selectedRanges, setSelectedRanges] = useState<Period[]>([
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
            const newList = [...selectedRanges, selected as Period];

            // sort by ranges order.
            setSelectedRanges(
              newList.sort(
                (a, b) => selectedRanges.indexOf(a) - selectedRanges.indexOf(b),
              ),
            );
          }}
          onRemove={(selected: string) => {
            const newChoise = selectedRanges?.filter(
              (value) => value !== selected,
            );

            setSelectedRanges(newChoise);
          }}
        />
      </div>
      <div>
        <h4 className="p-2">Date Range Picker</h4>

        <DateRangePicker
          variant={"underline"}
          period={period}
          setPeriod={setPeriod}
          range={range}
          setRange={setRange}
          showRange={true}
          options={selectedRanges}
        />
      </div>
    </div>
  );
}
