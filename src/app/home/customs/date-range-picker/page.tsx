"use client";

import { DateRangePicker } from "@/components/custom/DateRangePicker/DateRangePicker";
import { Period } from "@/components/custom/DateRangePicker/types";
import { MultiComboBox } from "@/components/custom/MultiComboBox";
import { useState } from "react";
import { DateRange } from "react-day-picker";

export default function DateRangePickerPage() {
  const [period, setPeriod] = useState<Period | undefined>("this_month");
  const [range, setRange] = useState<DateRange>();

  const ranges = [
    "today",
    "this_week",
    "this_month",
    "this_year",
    "last_week",
    "last_2week",
    "last_3week",
    "last_4week",
    "last_month",
    "last_2month",
    "last_3month",
    "last_4month",
    "last_5month",
    "last_6month",
    "last_7month",
    "last_8month",
    "last_9month",
    "last_10month",
    "last_11month",
    "last_year",
    "last_2year",
    "range",
  ];

  const testData = ranges.map((range) => {
    return { value: range, label: range };
  });

  const [choise, setChoise] = useState<Array<Period>>([
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
          value={choise}
          onSelect={(selected: string) => {
            setChoise([...choise, selected as Period]);
          }}
          onRemove={(selected: string) => {
            const newChoise = choise?.filter((value) => value !== selected);

            setChoise(newChoise);
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
          options={choise}
        />
      </div>
    </div>
  );
}
