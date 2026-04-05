// TicketListItem.tsx

import { AvatarMultiComboBox } from "@/components/custom/AvatarMultiComboBox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SupportedLanguage } from "@/domain/config";
import { TicketSummary } from "@/domain/serviceDesk";
import { dateLocaleMap } from "@/shared/mapper/dateLocaleMap";
import { ImageValueLabel } from "@/shared/types";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { initials } from "@/shared/utils";
import { formatTimeDistanceFromNow } from "@/shared/utils/date";

interface TicketListItemProps {
  ticket: TicketSummary;
  users: ImageValueLabel[];
  language: SupportedLanguage;
  onClick: () => void;
}

export const TicketListItem = ({
  ticket,
  users,
  language,
  onClick,
}: TicketListItemProps) => {
  const requester = users.find((user) => user.value === ticket.requesterId);
  const requesterName = requester?.label ?? ticket.requesterId;

  return (
    <div
      onClick={onClick}
      className="cursor-pointer flex flex-col gap-3 border-b px-4 py-2 hover:bg-muted"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-primary">#{ticket.id}</span>
            <span className="truncate font-semibold">{ticket.subject}</span>
          </div>

          <div className="text-xs text-muted-foreground">
            {requesterName} ·{" "}
            {formatTimeDistanceFromNow(
              ticket.createdAt,
              dateLocaleMap[language],
            )}
          </div>
        </div>

        <StatusBadge status={ticket.status} />
      </div>

      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={requester?.image} />
            <AvatarFallback>{initials(requesterName)}</AvatarFallback>
          </Avatar>

          <span className="text-xs text-muted-foreground">
            Due{" "}
            {formatTimeDistanceFromNow(ticket.dueAt, dateLocaleMap[language])}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <AvatarMultiComboBox
            variant="ghost"
            value={ticket.assigneeIds}
            options={users}
            maxImages={3}
            readOnly={true}
          />
        </div>
      </div>
    </div>
  );
};
