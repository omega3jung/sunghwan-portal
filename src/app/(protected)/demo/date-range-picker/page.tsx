"use client";

import { useMemo, useState } from "react";
import { DateRange } from "react-day-picker";

import { DateRangePicker } from "@/components/custom/DatePicker/DateRangePicker";
import { ShowTextType } from "@/components/custom/DatePicker/types";
import { MultiComboBox } from "@/components/custom/MultiComboBox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DEFAULT_DATE_RANGE_PRESETS } from "@/shared/constants/date";
import { DateRangePreset } from "@/shared/types";

export default function DateRangePickerPage() {
  const initialPeriod: DateRangePreset = "this_month";
  const [period, setPeriod] = useState<DateRangePreset | undefined>(
    initialPeriod,
  );
  const [range, setRange] = useState<DateRange | undefined>(undefined);

  const [rangeTextVariant, setRangeTextVariant] =
    useState<ShowTextType>("text");

  const testData = useMemo(
    () => DEFAULT_DATE_RANGE_PRESETS.map((value) => ({ value, label: value })),
    [],
  );
  const variantData: ShowTextType[] = ["text", "range", "all"];

  const [selectedRanges, setSelectedRanges] = useState<DateRangePreset[]>([
    "today",
    "this_week",
    "this_month",
    "range",
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h4 className="p-2">Period Variants</h4>

        <MultiComboBox
          options={testData}
          value={selectedRanges}
          onSelect={(selected: string) => {
            // sort by ranges order.
            const order = DEFAULT_DATE_RANGE_PRESETS;

            setSelectedRanges(
              [...selectedRanges, selected as DateRangePreset].sort(
                (a, b) => order.indexOf(a) - order.indexOf(b),
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
        <h4 className="p-2">Range Text Variants</h4>
        <RadioGroup
          className="flex px-2"
          value={rangeTextVariant as string}
          onValueChange={(value) => setRangeTextVariant(value as ShowTextType)}
        >
          {variantData.map((variant) => (
            <div key={variant} className="flex items-center space-x-2">
              <RadioGroupItem value={variant} />
              <h6>{variant}</h6>
            </div>
          ))}
        </RadioGroup>
      </div>
      <div>
        <h4 className="p-2">Date Range Picker</h4>

        <DateRangePicker
          variant={"underline"}
          period={period}
          onPeriodChange={setPeriod}
          range={range}
          onRangeChange={setRange}
          showTextType={rangeTextVariant}
          options={selectedRanges}
        />
      </div>
      <div>
        <h6 className="p-2">{`${range?.from} ~ ${range?.to}`}</h6>
      </div>
    </div>
  );
}
