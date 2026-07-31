import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { ChartFilter } from "@/feature/serviceDesk/ticket/client";
import { NS } from "@/lib/application/i18n";

type InsightsActiveFilterProps = {
  chartFilter: ChartFilter;
  filterFieldLabel: string | null;
  ticketCountDescription: string;
  onClearFilter: () => void;
};

export function InsightsActiveFilter({
  chartFilter,
  filterFieldLabel,
  ticketCountDescription,
  onClearFilter,
}: InsightsActiveFilterProps) {
  const { t } = useTranslation(NS.serviceDesk);

  if (!chartFilter) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border bg-background px-3 py-2">
      <div className="w-full px-0 text-sm text-muted-foreground sm:w-auto sm:px-2">
        {ticketCountDescription}
      </div>
      <Separator
        orientation="vertical"
        className="mx-1 hidden h-4 sm:mx-2 sm:block"
      />
      <span className="text-sm text-muted-foreground">
        {t("insights.activeFilter")}
      </span>
      <Badge variant="secondary" className="max-w-full rounded-full pr-1">
        <span className="max-w-[220px] truncate sm:max-w-none">
          {filterFieldLabel}: {chartFilter.label}
        </span>
        <button
          type="button"
          onClick={onClearFilter}
          className="rounded-full p-0.5 hover:bg-background/60"
          aria-label={t("insights.clearFilter")}
        >
          <X className="h-3 w-3" />
        </button>
      </Badge>
      <Button
        variant="ghost"
        size="sm"
        className="px-2"
        onClick={onClearFilter}
      >
        {t("insights.clearAll")}
      </Button>
    </div>
  );
}
