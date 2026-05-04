// TicketList.tsx

import { useTranslation } from "react-i18next";

import { SupportedLanguage } from "@/domain/config";
import { TicketSummary } from "@/domain/serviceDesk";
import { NS } from "@/lib/i18n";
import { ImageValueLabel } from "@/shared/types";

import { TicketListItem } from "./TicketListItem";
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
    <div className="divide-y">
      {tickets.map((ticket) => (
        <TicketListItem
          key={ticket.id}
          ticket={ticket}
          users={users}
          language={language}
          onClick={() => onTicketSelected(ticket.id)}
        />
      ))}
    </div>
  );
};
