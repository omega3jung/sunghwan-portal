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

interface Props {
  ticket: TicketSummary;
  users: ImageValueLabel[];
  language: SupportedLanguage;
  onClick: () => void;
}

export const TicketListItem = ({ ticket, users, language, onClick }: Props) => {
  return (
    <div
      onClick={onClick}
      className="flex flex-col gap-3 border-b p-4 hover:bg-muted cursor-pointer"
    >
      {/* 상단 영역 */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-primary">#{ticket.id}</span>
            <span className="font-semibold truncate">{ticket.subject}</span>
          </div>

          <div className="text-xs text-muted-foreground">
            {ticket.requester.name} ·{" "}
            {formatTimeDistanceFromNow(
              ticket.createdDate,
              dateLocaleMap[language],
            )}
          </div>
        </div>

        <StatusBadge status={ticket.status} />
      </div>

      {/* 하단 영역 (반응형) */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={ticket.requester.imageUrl} />
            <AvatarFallback>{initials(ticket.requester.name)}</AvatarFallback>
          </Avatar>

          <span className="text-xs text-muted-foreground">
            Due{" "}
            {formatTimeDistanceFromNow(ticket.dueDate, dateLocaleMap[language])}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <AvatarMultiComboBox
            variant={"ghost"}
            value={ticket.assignee}
            options={users}
            maxImages={3}
            readOnly={true}
          />
        </div>
      </div>
    </div>
  );
};
