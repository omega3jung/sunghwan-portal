// TicketListItem.tsx

import Link from "next/link";
import { useTranslation } from "react-i18next";

import { AvatarMultiComboBox } from "@/components/custom/AvatarComboBox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  isEscalatedTicket,
  isMergedChildTicket,
  TicketSummary,
} from "@/domain/serviceDesk";
import {
  MetaBadge,
  TicketStatusBadge,
} from "@/feature/serviceDesk/shared/client";
import {
  selectTicketAssignees,
  selectTicketIsAssigned,
} from "@/feature/serviceDesk/ticket/utils";
import { SupportedLanguage } from "@/lib/application/i18n";
import { NS } from "@/lib/application/i18n";
import { formatDisplayName } from "@/lib/application/organization";
import { useLocalizedValue } from "@/lib/client/i18n";
import { ROUTES } from "@/lib/config/routing";
import { dateLocaleMap } from "@/shared/mapper/dateLocaleMap";
import { formatTimeDistanceFromNow } from "@/shared/utils/format";
import { cn, initials } from "@/shared/utils/presentation";

interface TicketListItemProps {
  ticket: TicketSummary;
  language: SupportedLanguage;
  onClick: () => void;
}

export const TicketListItem = ({
  ticket,
  language,
  onClick,
}: TicketListItemProps) => {
  const { t } = useTranslation(NS.serviceDesk);
  const tLocal = useLocalizedValue(language);
  const requesterName = formatDisplayName(tLocal(ticket.requester.name));
  const createdTime = formatTimeDistanceFromNow(
    ticket.createdAt,
    dateLocaleMap[language],
  );
  const dueTime = formatTimeDistanceFromNow(
    ticket.dueAt,
    dateLocaleMap[language],
  );
  const mergedIntoTicketHref = ticket.mergedIntoTicketId
    ? `${ROUTES.SERVICE_DESK}/${ticket.mergedIntoTicketId}`
    : null;
  const assignees = selectTicketAssignees(ticket);
  const assigneeOptions = assignees.map((assignee) => ({
    value: assignee.username,
    label: formatDisplayName(tLocal(assignee.name)),
    image: assignee.image ?? undefined,
  }));
  const isAssigned = selectTicketIsAssigned(ticket);
  const isEscalated = isEscalatedTicket(ticket);

  return (
    <div
      onClick={onClick}
      className={cn(
        "cursor-pointer flex flex-col gap-2 border-b px-4 py-1.5 hover:bg-muted",
        isAssigned && "border-l-primary border-l-4",
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-primary">
              #{ticket.ticketNumber}
            </span>
            <span className="truncate font-semibold">{ticket.subject}</span>
          </div>

          <div className="flex items-center gap-14">
            <div className="text-xs text-muted-foreground">
              {t("ticketList.requesterMeta", {
                name: requesterName,
                time: createdTime,
              })}
            </div>

            {isMergedChildTicket(ticket) && mergedIntoTicketHref ? (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <MetaBadge tone="merge">
                  {t(isEscalated ? "merge.escalatedBadge" : "merge.badge")}
                </MetaBadge>
                <Link
                  className="text-primary underline-offset-4 hover:underline"
                  href={mergedIntoTicketHref}
                  onClick={(event) => {
                    event.stopPropagation();
                  }}
                >
                  {t(isEscalated ? "merge.escalatedInto" : "merge.into", {
                    ticketId: ticket.mergedIntoTicketNo,
                  })}
                </Link>
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex gap-2">
          {isAssigned && (
            <Badge className="bg-primary/10 text-primary border border-primary/20">
              {t("detailAside.assignedBadge")}
            </Badge>
          )}
          <TicketStatusBadge status={ticket.status} />
        </div>
      </div>

      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={ticket.requester.image ?? undefined} />
            <AvatarFallback>{initials(requesterName)}</AvatarFallback>
          </Avatar>

          <span className="text-xs text-muted-foreground">
            {t("ticketList.dueMeta", { time: dueTime })}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <AvatarMultiComboBox
            variant="ghost"
            value={assignees.map((assignee) => assignee.username)}
            options={assigneeOptions}
            maxImages={5}
            readOnly={true}
          />
        </div>
      </div>
    </div>
  );
};
