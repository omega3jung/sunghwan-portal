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

export const TicketListMobileItem = ({
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
        "cursor-pointer flex flex-col gap-1 overflow-hidden border-b px-2.5 py-1.5 hover:bg-muted",
        isAssigned && "border-l-primary border-l-4",
      )}
    >
      <div className="space-y-0.5 flex flex-col items-start">
        <div className="text-xs font-bold text-primary">#{ticket.id}</div>
        <div className="min-w-0 break-words text-sm font-semibold leading-5 line-clamp-2">
          {ticket.subject}
        </div>
      </div>

      <div className="flex items-center justify-between gap-0.5">
        <div className="text-xs text-muted-foreground">
          {t("ticketList.requesterMeta", {
            name: requesterName,
            time: createdTime,
          })}
        </div>

        <div className="flex gap-2">
          {isMergedChildTicket(ticket) && mergedIntoTicketHref ? (
            <MetaBadge tone="merge">
              {t(isEscalated ? "merge.escalatedBadge" : "merge.badge")}
            </MetaBadge>
          ) : null}

          {isAssigned && (
            <Badge className="bg-primary/10 text-primary border border-primary/20">
              {t("detailAside.assignedBadge")}
            </Badge>
          )}
          <TicketStatusBadge status={ticket.status} />
        </div>
      </div>

      <div className="flex gap-2 items-end justify-between">
        <div className="flex flex-col">
          {isMergedChildTicket(ticket) && mergedIntoTicketHref ? (
            <Link
              className="text-xs text-primary underline-offset-4 hover:underline"
              href={mergedIntoTicketHref}
              onClick={(event) => {
                event.stopPropagation();
              }}
            >
              {`${t(
                isEscalated ? "merge.escalatedBadge" : "merge.badge",
              )} : ${ticket.mergedIntoTicketNo}`}
            </Link>
          ) : null}

          <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={ticket.requester.image ?? undefined} />
                <AvatarFallback>{initials(requesterName)}</AvatarFallback>
            </Avatar>

            <span className="text-xs text-muted-foreground">
              {t("ticketList.dueMeta", { time: dueTime })}
            </span>
          </div>
        </div>
        <AvatarMultiComboBox
          variant="ghost"
          value={assignees.map((assignee) => assignee.username)}
          options={assigneeOptions}
          maxImages={5}
          readOnly={true}
        />
      </div>
    </div>
  );
};
