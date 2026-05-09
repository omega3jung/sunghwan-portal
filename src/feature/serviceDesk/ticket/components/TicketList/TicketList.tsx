// TicketList.tsx

import { useTranslation } from "react-i18next";

import { SupportedLanguage } from "@/domain/config";
import { TicketSummary } from "@/domain/serviceDesk";
import { NS } from "@/lib/i18n";
import { ImageValueLabel } from "@/shared/types";

import { TicketListItem } from "./TicketListItem";
import { TicketListMobileItem } from "./TicketListMobileItem";
import { TicketListSkeleton } from "./TicketListSkeleton";

interface TicketListProps {
  tickets: TicketSummary[];
  onTicketSelected: (ticketId: string) => void;
  users: ImageValueLabel[];
  language: SupportedLanguage;
  isLoading: boolean;
}

export const TicketList = ({
  tickets,
  onTicketSelected,
  users,
  language,
  isLoading,
}: TicketListProps) => {
  const { t } = useTranslation(NS.serviceDesk);

  if (isLoading) return <TicketListSkeleton />;

  if (!tickets.length)
    return (
      <div className="flex h-40 items-center justify-center text-muted-foreground">
        {t("ticketList.empty")}
      </div>
    );

  return (
    <div className="min-w-0 max-w-full divide-y overflow-x-hidden">
      {tickets.map((ticket) => (
        <div key={ticket.id}>
          <div className="hidden md:block">
            <TicketListItem
              ticket={ticket}
              users={users}
              language={language}
              onClick={() => onTicketSelected(ticket.id)}
            />
          </div>

          <div className="block md:hidden">
            <TicketListMobileItem
              ticket={ticket}
              users={users}
              language={language}
              onClick={() => onTicketSelected(ticket.id)}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
