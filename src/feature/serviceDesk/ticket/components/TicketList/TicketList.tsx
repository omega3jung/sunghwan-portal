// TicketList.tsx

import { SupportedLanguage } from "@/domain/config";
import { TicketSummary } from "@/domain/serviceDesk";
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
  if (isLoading) return <TicketListSkeleton />;

  if (!tickets.length)
    return (
      <div className="flex h-40 items-center justify-center text-muted-foreground">
        No tickets found
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
