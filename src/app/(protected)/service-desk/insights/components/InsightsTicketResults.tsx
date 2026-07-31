import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { TicketSummary } from "@/domain/serviceDesk";
import { TicketList } from "@/feature/serviceDesk/ticket/client";
import type { SupportedLanguage } from "@/lib/application/i18n";
import { NS } from "@/lib/application/i18n";

type InsightsTicketResultsProps = {
  tickets: TicketSummary[];
  isLoading: boolean;
  language: SupportedLanguage;
  showFilteredEmpty: boolean;
  onTicketSelected: (ticketId: string) => void;
  onClearFilter: () => void;
};

export function InsightsTicketResults({
  tickets,
  isLoading,
  language,
  showFilteredEmpty,
  onTicketSelected,
  onClearFilter,
}: InsightsTicketResultsProps) {
  const { t } = useTranslation(NS.serviceDesk);

  return (
    <ScrollArea className="flex-1 overflow-hidden rounded-md border bg-background">
      {showFilteredEmpty ? (
        <div className="flex h-48 flex-col items-center justify-center gap-3 px-4 text-center">
          <p className="text-sm text-muted-foreground">
            {t("insights.emptyFilteredTickets")}
          </p>
          <Button variant="outline" size="sm" onClick={onClearFilter}>
            {t("insights.clearFilter")}
          </Button>
        </div>
      ) : (
        <TicketList
          tickets={tickets}
          onTicketSelected={onTicketSelected}
          language={language}
          isLoading={isLoading}
        />
      )}
    </ScrollArea>
  );
}
