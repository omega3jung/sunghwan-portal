import { Pickaxe, Timer } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { TicketDetail } from "@/domain/serviceDesk";
import { NS } from "@/lib/i18n";
import { ImageValueLabel, ISODateString } from "@/shared/types";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import {
  formatCompactDurationFromMinutes,
  formatCompactTimeDistanceFromNow,
  initials,
} from "@/shared/utils";

import { MetaBadge, PriorityBadge } from "./TicketMetaBadge";

type TicketSummaryProps = {
  ticket: TicketDetail;
  requester?: ImageValueLabel;
};

export function TicketSummary({ ticket, requester }: TicketSummaryProps) {
  const { t } = useTranslation(NS.serviceDesk);

  return (
    <section className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex min-w-0 gap-4">
        <aside className="space-y-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={requester?.image} />
            <AvatarFallback>
              {initials(requester?.label || ticket.requesterId)}
            </AvatarFallback>
          </Avatar>

          <div className="h-12 w-12 rounded-full bg-cyan-50/70 hover:bg-cyan-100/70 flex flex-col items-center justify-center gap-0.5 whitespace-nowrap">
            <Timer className="text-cyan-600" />
            <p className="text-[11px] font-medium text-cyan-700">
              {formatCompactTimeDistanceFromNow(ticket.createdAt) || "-"}
            </p>
          </div>

          <div className="h-12 w-12 rounded-full bg-amber-50/70 hover:bg-amber-100/70 flex flex-col items-center justify-center gap-0.5 whitespace-nowrap">
            <Pickaxe className="text-amber-600" />
            <p className="text-[11px] font-medium text-amber-700">
              {formatCompactDurationFromMinutes(ticket.trackTimeMinutes) || "-"}
            </p>
          </div>
        </aside>

        <section className="min-w-0 space-y-3">
          <h1 className="text-2xl font-semibold leading-tight tracking-[-0.01em]">
            {ticket.subject}
          </h1>

          <ul className="flex flex-wrap items-center gap-2">
            <li>
              <MetaBadge tone="ticket">{ticket.ticketNumber}</MetaBadge>
            </li>
            <li>
              <MetaBadge tone="scope" className="capitalize">
                {ticket.scope}
              </MetaBadge>
            </li>
            <li>
              <StatusBadge status={ticket.status} />
            </li>
            <li>
              <PriorityBadge priority={ticket.priority} />
            </li>
          </ul>
        </section>
      </div>

      <dl className="grid grid-cols-2 gap-x-5 gap-y-3 rounded-lg border border-border/50 p-3 text-sm lg:min-w-[290px]">
        <DateStack
          label={t("common.created.title", { ns: NS.message })}
          value={ticket.createdAt}
        />
        <DateStack
          label={t("field.dueDate", { ns: NS.common })}
          value={ticket.dueAt}
        />
        <DateStack
          label={t("common.updated.title", { ns: NS.message })}
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
    <div className="space-y-0.5" key={label}>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground/70">
        {label}
      </p>

      {parts ? (
        <div className="leading-tight">
          <p className="text-sm font-medium text-foreground">{parts.date}</p>
          <p className="text-sm text-muted-foreground">{parts.time}</p>
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
