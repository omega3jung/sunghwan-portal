// TicketListItem.tsx

import Link from "next/link";
import { useTranslation } from "react-i18next";

import { AvatarMultiComboBox } from "@/components/custom/AvatarMultiComboBox";
import { StatusBadge } from "@/components/custom/StatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SupportedLanguage } from "@/domain/config";
import { isMergedChildTicket, TicketSummary } from "@/domain/serviceDesk";
import { MetaBadge } from "@/feature/serviceDesk/shared";
import { NS } from "@/lib/i18n";
import { ROUTES } from "@/lib/routes";
import { dateLocaleMap } from "@/shared/mapper/dateLocaleMap";
import { ImageValueLabel } from "@/shared/types";
import { cn, initials } from "@/shared/utils";
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
  const { t } = useTranslation(NS.serviceDesk);
  const requester = users.find((user) => user.value === ticket.requesterId);
  const requesterName =
    requester?.label ||
    t("ticketList.unknownRequester", { defaultValue: "Unknown requester" });
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

  return (
    <div
      onClick={onClick}
      className={cn(
        "cursor-pointer flex flex-col gap-3 border-b px-4 py-2 hover:bg-muted",
        ticket.assigned && "border-l-primary border-l-4",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-primary">#{ticket.id}</span>
            <span className="truncate font-semibold">{ticket.subject}</span>
          </div>

          <div className="text-xs text-muted-foreground">
            {t("ticketList.requesterMeta", {
              name: requesterName,
              time: createdTime,
            })}
          </div>

          {isMergedChildTicket(ticket) && mergedIntoTicketHref ? (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <MetaBadge tone="merge">{t("merge.badge")}</MetaBadge>
              <Link
                className="text-primary underline-offset-4 hover:underline"
                href={mergedIntoTicketHref}
                onClick={(event) => {
                  event.stopPropagation();
                }}
              >
                {t("merge.into", {
                  ticketId: ticket.mergedIntoTicketId,
                })}
              </Link>
            </div>
          ) : null}
        </div>

        <div className="flex gap-2">
          {ticket.assigned && (
            <Badge className="bg-primary/10 text-primary border border-primary/20">
              {t("detailAside.assignedBadge")}
            </Badge>
          )}
          <StatusBadge status={ticket.status} />
        </div>
      </div>

      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={requester?.image} />
            <AvatarFallback>{initials(requesterName)}</AvatarFallback>
          </Avatar>

          <span className="text-xs text-muted-foreground">
            {t("ticketList.dueMeta", { time: dueTime })}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <AvatarMultiComboBox
            variant="ghost"
            value={ticket.assigneeIds}
            options={users}
            maxImages={5}
            readOnly={true}
          />
        </div>
      </div>
    </div>
  );
};
