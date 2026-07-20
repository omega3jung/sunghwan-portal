import { Pickaxe, Timer } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  isEscalatedTicket,
  isMergedChildTicket,
  type TicketDetail,
} from "@/domain/serviceDesk";
import {
  MetaBadge,
  PriorityBadge,
  TicketStatusBadge,
} from "@/feature/serviceDesk/shared/client";
import { selectTicketIsAssigned } from "@/feature/serviceDesk/ticket/utils";
import { NS } from "@/lib/application/i18n";
import { ROUTES } from "@/lib/config/routing";
import { ImageValueLabel, ISODateString } from "@/shared/types";
import {
  formatCompactDurationFromMinutes,
  formatCompactTimeDistanceFromNow,
} from "@/shared/utils/format";
import { initials } from "@/shared/utils/presentation";

type TicketSummaryProps = {
  ticket: TicketDetail;
  requester?: ImageValueLabel;
};

export function TicketSummary({ ticket, requester }: TicketSummaryProps) {
  const { t } = useTranslation(NS.serviceDesk);
  const mergedIntoTicketHref = ticket.mergedIntoTicketId
    ? `${ROUTES.SERVICE_DESK}/${ticket.mergedIntoTicketId}`
    : null;
  const isAssigned = selectTicketIsAssigned(ticket);
  const isEscalated = isEscalatedTicket(ticket);

  return (
    <section className="flex min-w-0 max-w-full flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row">
        <aside className="flex shrink-0 gap-2 sm:flex-col sm:space-y-3 sm:gap-0">
          <Avatar className="h-12 w-12">
            <AvatarImage src={requester?.image} />
            <AvatarFallback>{initials(requester?.label || "")}</AvatarFallback>
          </Avatar>

          <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center gap-0.5 rounded-full bg-cyan-50/70 whitespace-nowrap hover:bg-cyan-100/70">
            <Timer className="text-cyan-600" />
            <p className="text-[11px] font-medium text-cyan-700">
              {formatCompactTimeDistanceFromNow(ticket.createdAt) || "-"}
            </p>
          </div>

          <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center gap-0.5 rounded-full bg-amber-50/70 whitespace-nowrap hover:bg-amber-100/70">
            <Pickaxe className="text-amber-600" />
            <p className="text-[11px] font-medium text-amber-700">
              {formatCompactDurationFromMinutes(ticket.workMinutes) || "-"}
            </p>
          </div>
        </aside>

        <section className="min-w-0 space-y-3">
          <h1 className="max-w-full break-words text-xl font-semibold leading-tight tracking-[-0.01em] sm:text-2xl">
            {ticket.subject}
          </h1>

          <ul className="flex min-w-0 flex-wrap items-center gap-2">
            <li>
              <MetaBadge tone="ticket">{ticket.ticketNumber}</MetaBadge>
            </li>
            <li>
              <MetaBadge tone="scope" className="capitalize">
                {ticket.scope}
              </MetaBadge>
            </li>
            <li>
              <TicketStatusBadge status={ticket.status} />
            </li>
            <li>
              <PriorityBadge priority={ticket.priority} />
            </li>
            {isAssigned && (
              <li>
                <Badge className="bg-primary/10 text-primary border border-primary/20">
                  {t("detailAside.assignedBadge")}
                </Badge>
              </li>
            )}

            {isMergedChildTicket(ticket) ? (
              <li>
                <MetaBadge tone="merge">
                  {t(isEscalated ? "merge.escalatedBadge" : "merge.badge")}
                </MetaBadge>
              </li>
            ) : null}
          </ul>

          {isMergedChildTicket(ticket) && mergedIntoTicketHref ? (
            <p className="break-words text-sm text-muted-foreground">
              <Link
                className="text-primary underline-offset-4 hover:underline"
                href={mergedIntoTicketHref}
              >
                {t(isEscalated ? "merge.escalatedInto" : "merge.into", {
                  ticketId: ticket.mergedIntoTicketNo,
                })}
              </Link>
            </p>
          ) : null}
        </section>
      </div>

      <dl className="grid min-w-0 max-w-full grid-cols-2 gap-x-5 gap-y-3 rounded-lg border border-border/50 p-3 text-sm lg:min-w-[290px]">
        <DateStack
          label={t("common.create.title", { ns: NS.message })}
          value={ticket.createdAt}
        />
        <DateStack
          label={t("field.dueAt", { ns: NS.common })}
          value={ticket.dueAt}
        />
        <DateStack
          label={t("common.update.title", { ns: NS.message })}
          value={ticket.updatedAt}
        />
        <DateStack
          label={t("message.lastComment")}
          value={ticket.lastCommentAt}
        />
      </dl>
    </section>
  );
}

type DateStackProps = {
  label: string;
  value?: ISODateString;
};

export function DateStack({ label, value }: DateStackProps) {
  const parts = formatDateStack(value);

  return (
    <div className="min-w-0 space-y-0.5" key={label}>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground/70">
        {label}
      </p>

      {parts ? (
        <div className="leading-tight">
          <p className="break-words text-sm font-medium text-foreground">
            {parts.date}
          </p>
          <p className="break-words text-sm text-muted-foreground">
            {parts.time}
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">-</p>
      )}
    </div>
  );
}

function formatDateStack(value?: ISODateString) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return {
    date: new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(date),
    time: new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date),
  };
}
