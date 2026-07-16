import { Locale } from "date-fns";
import { MessageSquareText } from "lucide-react";
import { useTranslation } from "react-i18next";

import { TicketAction, TicketHistory } from "@/domain/serviceDesk";
import { getHistorySummary } from "@/feature/serviceDesk/ticketHistory/client";
import { NS } from "@/lib/application/i18n";
import { formatTimeDistanceFromNow } from "@/shared/utils/format";

type TicketRecentActivityProps = {
  latestHistory: TicketHistory;
  activeActions: TicketAction[];
  latestAction: TicketAction;
  latestActionName?: string;
  latestActionEmail?: string;
  dateLocale: Locale;
};

export function TicketRecentActivity({
  latestHistory,
  activeActions,
  latestAction,
  latestActionName,
  latestActionEmail,
  dateLocale,
}: TicketRecentActivityProps) {
  const { t } = useTranslation(NS.serviceDesk, {
    keyPrefix: "recentActivity",
  });
  const { t: tStatus } = useTranslation("TicketStatusBadge");

  return (
    <div className="space-y-4 border-b border-border/40 pb-6">
      <h3 className="text-sm font-semibold tracking-[-0.01em] text-foreground/90">
        {t("title")}
      </h3>

      <div className="grid gap-3 md:grid-cols-3">
        <ActivityPreview
          label={t("latestUpdate.label")}
          value={
            latestHistory
              ? getHistorySummary(latestHistory, t, tStatus)
              : t("latestUpdate.empty")
          }
          meta={
            latestHistory
              ? formatTimeDistanceFromNow(latestHistory.createdAt, dateLocale)
              : t("latestUpdate.fallbackMeta")
          }
        />
        <ActivityPreview
          label={t("conversation.label")}
          value={
            activeActions.length > 0
              ? t("conversation.count", { count: activeActions.length })
              : t("conversation.empty")
          }
          meta={
            latestAction
              ? `${t("conversation.latestPrefix")} ${formatTimeDistanceFromNow(
                  latestAction.createdAt,
                  dateLocale,
                )}`
              : t("conversation.start")
          }
        />
        <ActivityPreview
          label={t("lastCommenter.label")}
          value={latestActionName || t("lastCommenter.emptyName")}
          meta={latestActionEmail || t("lastCommenter.emptyEmail")}
        />
      </div>
    </div>
  );
}

function ActivityPreview({
  label,
  value,
  meta,
}: {
  label: string;
  value: string;
  meta?: string;
}) {
  return (
    <article className="min-w-0 rounded-lg bg-muted/40 px-3 py-3">
      <header className="flex items-start gap-2">
        <MessageSquareText className="mt-0.5 h-4 w-4 text-muted-foreground" />
        <div className="min-w-0 space-y-1">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground/80">
            {label}
          </p>
          <p className="break-words text-sm font-medium leading-5 text-foreground/90">
            {value}
          </p>
          <p className="break-words text-xs leading-5 text-muted-foreground/75">
            {meta || "-"}
          </p>
        </div>
      </header>
    </article>
  );
}
