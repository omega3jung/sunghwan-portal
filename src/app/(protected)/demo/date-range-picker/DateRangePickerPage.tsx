"use client";

import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { useTranslation } from "react-i18next";

import {
  DatePicker,
  DateRangePicker,
  DateTimePicker,
  type DateTimePickerMinuteStep,
  SearchDateFilter,
  type SearchDateFilterOption,
} from "@/components/custom/DatePicker";
import type { ShowTextType } from "@/components/custom/DatePicker/types";
import {
  formatDateText,
  formatDateTimeText,
  formatRangeText,
  resolvePresetRange,
} from "@/components/custom/DatePicker/utils";
import { MultiComboBox } from "@/components/custom/MultiComboBox";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { NS } from "@/lib/application/i18n";
import {
  DATE_RANGE_PRESET_LABEL_KEYS,
  DEFAULT_DATE_RANGE_PRESETS,
} from "@/shared/constants/date";
import type { DateRangePreset } from "@/shared/types";

const RANGE_TEXT_VARIANTS: ShowTextType[] = ["text", "range", "all"];
const MINUTE_STEPS: DateTimePickerMinuteStep[] = [1, 5, 10, 15, 30];
export function DateRangePickerPage() {
  const { t } = useTranslation(NS.demo, { keyPrefix: "datePicker" });
  const { t: tDatePicker } = useTranslation(NS.component, {
    keyPrefix: "datePicker",
  });
  const bounds = useMemo(() => {
    const minDate = new Date();
    const maxDate = new Date();

    minDate.setDate(minDate.getDate() - 30);
    maxDate.setDate(maxDate.getDate() + 90);

    return { minDate, maxDate };
  }, []);
  const rangeOptions = useMemo(
    () =>
      DEFAULT_DATE_RANGE_PRESETS.map((value) => ({
        value,
        label: tDatePicker(DATE_RANGE_PRESET_LABEL_KEYS[value]),
      })),
    [tDatePicker],
  );
  const searchOptions = useMemo<
    SearchDateFilterOption<DateRangePreset>[]
  >(
    () =>
      (["today", "this_week", "this_month", "range"] as const).map(
        (value) => ({
          value,
          label: tDatePicker(DATE_RANGE_PRESET_LABEL_KEYS[value]),
        }),
      ),
    [tDatePicker],
  );
  const [date, setDate] = useState<Date>();
  const [dateTime, setDateTime] = useState<Date | undefined>(() => new Date());
  const [period, setPeriod] = useState<DateRangePreset | undefined>(
    "this_month",
  );
  const [range, setRange] = useState<DateRange>();
  const [searchPeriod, setSearchPeriod] =
    useState<DateRangePreset>("today");
  const [searchRange, setSearchRange] = useState<DateRange | undefined>(() =>
    resolvePresetRange("today"),
  );
  const [rangeTextVariant, setRangeTextVariant] =
    useState<ShowTextType>("text");
  const [minuteStep, setMinuteStep] =
    useState<DateTimePickerMinuteStep>(5);
  const [compactDateTime, setCompactDateTime] = useState(false);
  const [selectedRanges, setSelectedRanges] = useState<DateRangePreset[]>([
    "today",
    "this_week",
    "this_month",
    "range",
  ]);

  return (
    <div className="flex max-w-7xl flex-col gap-8 p-4">
      <FieldGroup>
        <FieldSet>
          <FieldGroup className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
            <Field className="lg:col-span-2">
              <FieldLabel htmlFor="date-range-options">
                {t("controls.presets")}
              </FieldLabel>
              <MultiComboBox
                id="date-range-options"
                options={rangeOptions}
                value={selectedRanges}
                onSelect={(selected) => {
                  const nextValue = selected as DateRangePreset;

                  setSelectedRanges(
                    [...selectedRanges, nextValue].sort(
                      (left, right) =>
                        DEFAULT_DATE_RANGE_PRESETS.indexOf(left) -
                        DEFAULT_DATE_RANGE_PRESETS.indexOf(right),
                    ),
                  );
                }}
                onRemove={(selected) =>
                  setSelectedRanges((current) =>
                    current.filter((value) => value !== selected),
                  )
                }
              />
              <FieldDescription>
                {t("controls.presetsDescription")}
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="date-text-variants">
                {t("controls.triggerText")}
              </FieldLabel>
              <RadioGroup
                id="date-text-variants"
                className="flex flex-wrap gap-4 px-2"
                value={rangeTextVariant}
                onValueChange={(value) =>
                  setRangeTextVariant(value as ShowTextType)
                }
              >
                {RANGE_TEXT_VARIANTS.map((variant) => (
                  <div key={variant} className="flex items-center space-x-2">
                    <RadioGroupItem value={variant} />
                    <span>{t(`variants.${variant}`)}</span>
                  </div>
                ))}
              </RadioGroup>
            </Field>

            <Field>
              <FieldLabel htmlFor="date-time-minute-step">
                {t("controls.minuteStep")}
              </FieldLabel>
              <RadioGroup
                id="date-time-minute-step"
                className="flex flex-wrap gap-3 px-2"
                value={String(minuteStep)}
                onValueChange={(value) =>
                  setMinuteStep(Number(value) as DateTimePickerMinuteStep)
                }
              >
                {MINUTE_STEPS.map((step) => (
                  <div key={step} className="flex items-center space-x-2">
                    <RadioGroupItem value={String(step)} />
                    <span>{step}</span>
                  </div>
                ))}
              </RadioGroup>
              <label className="mt-2 flex items-center gap-2 text-sm">
                <Checkbox
                  checked={compactDateTime}
                  onCheckedChange={setCompactDateTime}
                />
                {t("controls.compact")}
              </label>
            </Field>
          </FieldGroup>
        </FieldSet>
      </FieldGroup>

      <div className="grid gap-6 lg:grid-cols-2">
        <PickerCard
          title="DatePicker"
          description={t("cards.date")}
          value={formatDateText(date) || t("empty")}
        >
          <DatePicker
            className="w-80 max-w-full"
            maxDate={bounds.maxDate}
            minDate={bounds.minDate}
            value={date}
            onChange={setDate}
          />
        </PickerCard>

        <PickerCard
          title="DateTimePicker"
          description={t("cards.dateTime")}
          value={formatDateTimeText(dateTime) || t("empty")}
        >
          <DateTimePicker
            className="w-80 max-w-full"
            compact={compactDateTime}
            maxDate={bounds.maxDate}
            minDate={bounds.minDate}
            minuteStep={minuteStep}
            value={dateTime}
            onChange={setDateTime}
          />
        </PickerCard>

        <PickerCard
          title="DateRangePicker"
          description={t("cards.dateRange")}
          value={`${period ?? t("noPreset")} · ${formatRangeText(range) || t("empty")}`}
        >
          <DateRangePicker
            className="w-80 max-w-full"
            options={selectedRanges}
            period={period}
            range={range}
            showTextType={rangeTextVariant}
            onPeriodChange={setPeriod}
            onRangeChange={setRange}
          />
        </PickerCard>

        <PickerCard
          title="SearchDateFilter"
          description={t("cards.search")}
          value={`${searchPeriod} · ${formatRangeText(searchRange) || t("empty")}`}
        >
          <SearchDateFilter<DateRangePreset>
            className="w-80 max-w-full"
            options={searchOptions}
            range={searchRange}
            rangeValue="range"
            resolveRange={resolvePresetRange}
            showTextType={rangeTextVariant}
            value={searchPeriod}
            onRangeChange={setSearchRange}
            onValueChange={(value) => setSearchPeriod(value ?? "today")}
          />
        </PickerCard>
      </div>

      <p className="text-xs text-muted-foreground">
        {t("bounds", {
          min: formatDateTimeText(bounds.minDate),
          max: formatDateTimeText(bounds.maxDate),
        })}
      </p>
    </div>
  );
}

function PickerCard({
  title,
  description,
  value,
  children,
}: {
  title: string;
  description: string;
  value: string;
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-0 space-y-4 rounded-xl border bg-card p-4">
      <div>
        <h2 className="font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
      <p className="wrap-break-word rounded-md bg-muted/50 px-3 py-2 font-mono text-xs">
        {value}
      </p>
    </section>
  );
}
