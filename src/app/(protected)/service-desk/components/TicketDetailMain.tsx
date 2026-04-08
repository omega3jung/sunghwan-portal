"use client";

import { Separator } from "@radix-ui/react-separator";
import type { Locale } from "date-fns";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { TicketDetail } from "@/domain/serviceDesk";
import { ImageValueLabel } from "@/shared/types";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { formatTimeDistanceFromNow } from "@/shared/utils/date";
import { initials } from "@/shared/utils/string";

import { TicketDetailsAside } from "./TicketDetailsAside";
import {
  formatDateTime,
  InfoMini,
  PriorityBadge,
  TicketMetaBadge,
} from "./TicketDetailUi";

type TicketDetailMainProps = {
  ticket: TicketDetail;
  requester?: ImageValueLabel;
  assignees: ImageValueLabel[];
  dateLocale?: Locale;
};

export function TicketDetailMain({
  ticket,
  requester,
  assignees,
  dateLocale,
}: TicketDetailMainProps) {
  return (
    <section className="rounded-2xl border bg-background shadow-sm">
      <div className="flex flex-col gap-5 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 gap-4">
            <Avatar className="h-12 w-12 ring-2 ring-primary/15">
              <AvatarImage src={requester?.image} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {initials(requester?.label || ticket.requesterId)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <TicketMetaBadge tone="ticket">
                  {ticket.ticketNumber}
                </TicketMetaBadge>
                <TicketMetaBadge tone="scope" className="capitalize">
                  {ticket.scope}
                </TicketMetaBadge>
                <StatusBadge status={ticket.status} />
                <PriorityBadge priority={ticket.priority} />
              </div>

              <div>
                <h1 className="text-2xl font-semibold leading-tight">
                  {ticket.subject}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Created{" "}
                  {formatTimeDistanceFromNow(ticket.createdAt, dateLocale)} by{" "}
                  {requester?.label || ticket.requesterId}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-xl border bg-muted/30 p-3 text-sm md:min-w-[240px]">
            <InfoMini label="Due" value={formatDateTime(ticket.dueAt)} />
            <InfoMini
              label="Tracked"
              value={`${ticket.trackTimeMinutes} min`}
            />
            <InfoMini
              label="Updated"
              value={formatDateTime(ticket.updatedAt)}
            />
            <InfoMini
              label="Last Comment"
              value={formatDateTime(ticket.lastCommentAt)}
            />
          </div>
        </div>

        <Separator className="h-px bg-primary-muted" />

        <section className="rounded-xl border bg-background">
          <div className="border-b px-4 py-3">
            <h2 className="font-semibold">Description</h2>
          </div>
          <div className="px-4 py-4">
            <div
              className="prose prose-sm max-w-none break-words text-foreground prose-p:my-2 prose-a:text-primary prose-img:rounded-lg"
              dangerouslySetInnerHTML={{
                __html: ticket.body || "<p>-</p>",
              }}
            />
          </div>
        </section>

        <section className="rounded-xl border bg-background xl:hidden">
          <div className="border-b px-4 py-3">
            <h2 className="font-semibold">Ticket Details</h2>
          </div>
          <div className="px-4 py-4">
            <TicketDetailsAside
              assignees={assignees}
              requester={requester}
              ticket={ticket}
            />
          </div>
        </section>

        <section className="rounded-xl border border-dashed bg-background">
          <div className="border-b px-4 py-3">
            <h2 className="font-semibold">Recent Activity</h2>
          </div>
          <div className="px-4 py-5 text-sm text-muted-foreground">
            TODO: Place a compact recent activity summary below the description
            when we finalize the ticket detail flow.
          </div>
        </section>
      </div>
    </section>
  );
}
