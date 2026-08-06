"use client";

import { useTranslation } from "react-i18next";

import { NS } from "@/lib/application/i18n";

type TicketHistoryTimelineHeaderProps = {
  title?: string;
  description?: string;
};

export function TicketHistoryTimelineHeader({
  title,
  description,
}: TicketHistoryTimelineHeaderProps) {
  const { t } = useTranslation(NS.serviceDesk);

  return (
    <div className="min-w-0">
      <h2 className="text-sm font-semibold text-primary">
        {title || t("historySheet.title")}
      </h2>
      <p className="text-xs text-muted-foreground">
        {description || t("historyTimeline.description")}
      </p>
    </div>
  );
}
