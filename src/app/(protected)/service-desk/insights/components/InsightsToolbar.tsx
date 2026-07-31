import {
  BarChart3,
  Building2,
  ChevronDown,
  EyeOff,
  Globe,
  LayoutGrid,
  RefreshCw,
  Rows3,
} from "lucide-react";
import type { ReactElement } from "react";
import type { DateRange } from "react-day-picker";
import { useTranslation } from "react-i18next";

import { DateRangePicker } from "@/components/custom/DatePicker";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TICKET_PERIOD_OPTIONS } from "@/feature/serviceDesk/ticketSearch/client";
import { NS } from "@/lib/application/i18n";
import type { DateRangePreset } from "@/shared/types";

import type { ChartViewMode, ViewOption } from "../types";

type OptionItem<T> = {
  value: T;
  icon: ReactElement;
};

const viewOption: OptionItem<ViewOption>[] = [
  // { value: "portal", icon: <Globe className="h-4 w-4" /> },
  {
    value: "INTERNAL",
    icon: <Building2 className="h-4 w-4" />,
  },
  {
    value: "PORTAL",
    icon: <Globe className="h-4 w-4" />,
  },
];

const chartViewOption: OptionItem<ChartViewMode>[] = [
  {
    value: "full",
    icon: <LayoutGrid className="h-4 w-4" />,
  },
  {
    value: "compact",
    icon: <Rows3 className="h-4 w-4" />,
  },
  {
    value: "hidden",
    icon: <EyeOff className="h-4 w-4" />,
  },
];

const checkboxItemRightCheckClass =
  "gap-2 pl-2 pr-8 [&>span]:left-auto [&>span]:right-2";

type InsightsToolbarProps = {
  scope: ViewOption;
  currentPeriodType: DateRangePreset;
  pickerRange: DateRange | undefined;
  chartViewMode: ChartViewMode;
  onScopeChange: (scope: ViewOption) => void;
  onPeriodChange: (period?: DateRangePreset) => void;
  onRangeChange: (range: DateRange | undefined) => void;
  onChartViewModeChange: (mode: ChartViewMode) => void;
  onRefresh: () => void;
};

export function InsightsToolbar({
  scope,
  currentPeriodType,
  pickerRange,
  chartViewMode,
  onScopeChange,
  onPeriodChange,
  onRangeChange,
  onChartViewModeChange,
  onRefresh,
}: InsightsToolbarProps) {
  const { t } = useTranslation(NS.serviceDesk);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold">{t("insights.title")}</h1>
        <p className="text-sm text-muted-foreground sm:max-w-prose">
          {t("insights.description")}
        </p>
      </div>

      <div className="flex w-full flex-wrap items-stretch gap-2 sm:w-auto sm:items-center sm:justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button className="min-w-0 justify-end" />}
          >
            <span className="truncate">
              {t(`viewOption.${scope.toLowerCase()}`)}
            </span>
            <ChevronDown className="transition-transform" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-40">
            <DropdownMenuGroup>
              <DropdownMenuLabel>{t("viewOption.title")}</DropdownMenuLabel>
              {viewOption.map((option) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={option.value}
                    className={checkboxItemRightCheckClass}
                    checked={option.value === scope}
                    onClick={() => onScopeChange(option.value)}
                  >
                    {option.icon}
                    {t(`viewOption.${option.value.toLowerCase()}`)}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          className="w-full p-2 lg:w-auto"
          variant="default"
          onClick={onRefresh}
        >
          <RefreshCw />
        </Button>

        <DateRangePicker
          className="w-full min-w-0 sm:w-72"
          period={currentPeriodType}
          onPeriodChange={onPeriodChange}
          range={pickerRange}
          onRangeChange={onRangeChange}
          showTextType="all"
          options={TICKET_PERIOD_OPTIONS}
        />

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                className="w-full min-w-0 justify-between sm:w-auto sm:justify-center"
              />
            }
          >
            <BarChart3 className="h-4 w-4" />
            <span className="truncate">
              {t("insights.chartView.label")}:{" "}
              {t(`insights.chartView.${chartViewMode}`)}
            </span>
            <ChevronDown className="transition-transform" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                {t("insights.chartView.label")}
              </DropdownMenuLabel>
              {chartViewOption.map((option) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={option.value}
                    className={checkboxItemRightCheckClass}
                    checked={option.value === chartViewMode}
                    onClick={() => onChartViewModeChange(option.value)}
                  >
                    {option.icon}
                    {t(`insights.chartView.${option.value}`)}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
