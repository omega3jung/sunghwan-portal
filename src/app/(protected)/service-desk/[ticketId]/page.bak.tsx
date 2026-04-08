"use client";

import { Separator } from "@radix-ui/react-separator";
import { ChevronLeft, Clock3, Mail, PanelLeft, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ReactNode, useMemo, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { SupportedLanguage } from "@/domain/config";
import { useEmployeeListQuery } from "@/feature/organization/employee";
import { useServiceDeskTicketQuery } from "@/feature/serviceDesk/ticket/api";
import { useServiceDeskTicketHistoryListQuery } from "@/feature/serviceDesk/ticket/api/history";
import { TicketHistoryTimeline } from "@/feature/serviceDesk/ticket/components/TicketHistoryTimeline";
import { useCurrentPreference } from "@/hooks/useCurrentPreference";
import { useLocalizedValue } from "@/shared/hooks";
import { dateLocaleMap } from "@/shared/mapper/dateLocaleMap";
import { ImageValueLabel } from "@/shared/types";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { cn } from "@/shared/utils";
import { formatTimeDistanceFromNow } from "@/shared/utils/date";
import { initials } from "@/shared/utils/string";

type Props = {
  params: {
    ticketId: string;
  };
};

export default function ServiceDeskTicketDetailPage({ params }: Props) {
  const router = useRouter();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const { current: userPreference } = useCurrentPreference();
  const tLocal = useLocalizedValue(userPreference.language);

  const { data: ticket, isLoading: isTicketLoading } =
    useServiceDeskTicketQuery(params.ticketId);

  const { data: ticketHistories, isLoading: isTicketHistoriesLoading } =
    useServiceDeskTicketHistoryListQuery(params.ticketId);
  const { data: employees } = useEmployeeListQuery({});

  const users = useMemo<ImageValueLabel[]>(() => {
    if (!employees) {
      return [];
    }

    return employees.map((employee) => {
      const name = tLocal(employee.name);

      return {
        value: employee.id,
        label: `${name.first} ${name.last}`.trim(),
        displayName: employee.email,
        image: employee.imageUrl,
      };
    });
  }, [employees, tLocal]);

  const requester = users.find((user) => user.value === ticket?.requesterId);
  const assignees = users.filter((user) =>
    ticket?.assigneeIds.includes(user.value),
  );
  const dateLocale =
    dateLocaleMap[userPreference.language as SupportedLanguage];

  return (
    <div className="flex h-full min-h-0 flex-col p-2 pt-1">
      <div className="flex items-center justify-between pb-2 text-foreground pr-4">
        <Button
          type="button"
          variant="ghost"
          className="rounded-xl pl-1"
          onClick={() => {
            router.push(`/service-desk/`);
          }}
        >
          <ChevronLeft className="p-0" />
          List
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="hidden h-7 w-7 rounded-md xl:inline-flex"
          onClick={() => {
            setIsHistoryOpen((previous) => !previous);
          }}
        >
          <PanelLeft
            className={cn(
              "h-4 w-4 transition-transform",
              isHistoryOpen && "rotate-180",
            )}
          />
          <span className="sr-only">Toggle history panel</span>
        </Button>
      </div>

      <Separator className="h-1 rounded bg-primary-muted" />

      <div className="flex min-h-0 flex-1 pt-4">
        <main className="min-w-0 flex-1 pr-4">
          <ScrollArea className="h-full w-full">
            <div className="space-y-6 p-2">
              {isTicketLoading ? (
                <TicketDetailSkeleton />
              ) : ticket ? (
                <>
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
                              <TicketMetaBadge
                                tone="scope"
                                className="capitalize"
                              >
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
                                {formatTimeDistanceFromNow(
                                  ticket.createdAt,
                                  dateLocale,
                                )}{" "}
                                by {requester?.label || ticket.requesterId}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 rounded-xl border bg-muted/30 p-3 text-sm md:min-w-[240px]">
                          <InfoMini
                            label="Due"
                            value={formatDateTime(ticket.dueAt)}
                          />
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

                      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
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

                        <aside className="space-y-4">
                          <InfoCard
                            icon={<UserRound className="h-4 w-4" />}
                            title="Requester"
                          >
                            <PersonRow
                              name={requester?.label || ticket.requesterId}
                              subText={
                                requester?.displayName || ticket.requesterId
                              }
                              image={requester?.image}
                            />
                          </InfoCard>

                          <InfoCard
                            icon={<UserRound className="h-4 w-4" />}
                            title="Assignee"
                          >
                            {assignees.length > 0 ? (
                              <div className="space-y-3">
                                {assignees.map((assignee) => (
                                  <PersonRow
                                    key={assignee.value}
                                    name={assignee.label}
                                    subText={assignee.displayName}
                                    image={assignee.image}
                                  />
                                ))}
                              </div>
                            ) : (
                              <EmptyText value="Unassigned" />
                            )}
                          </InfoCard>

                          <InfoCard
                            icon={<Mail className="h-4 w-4" />}
                            title="Recipients"
                          >
                            <RecipientGroup
                              label="To"
                              values={ticket.email.to}
                            />
                            <RecipientGroup
                              label="Cc"
                              values={ticket.email.cc}
                            />
                            <RecipientGroup
                              label="Bcc"
                              values={ticket.email.bcc}
                            />
                          </InfoCard>

                          <InfoCard
                            icon={<Clock3 className="h-4 w-4" />}
                            title="Details"
                          >
                            <InfoLine label="Ticket ID" value={ticket.id} />
                            <InfoLine
                              label="Category"
                              value={ticket.categoryId}
                            />
                            <InfoLine
                              label="Last commenter"
                              value={ticket.lastCommenterEmail}
                            />
                          </InfoCard>
                        </aside>
                      </div>
                    </div>
                  </section>
                </>
              ) : (
                <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
                  Ticket not found.
                </div>
              )}
            </div>
          </ScrollArea>
        </main>

        <div
          className={cn(
            "hidden overflow-hidden transition-[width] duration-200 ease-linear xl:block",
            isHistoryOpen ? "w-[320px]" : "w-0",
          )}
        >
          <aside
            className={cn(
              "min-h-0 h-full w-[320px] shrink-0 border-l border-primary-muted transition-[opacity,transform] duration-200 ease-linear",
              isHistoryOpen
                ? "translate-x-0 opacity-100"
                : "pointer-events-none translate-x-2 opacity-0",
            )}
          >
            <TicketHistoryTimeline
              className="h-full"
              items={ticketHistories}
              isLoading={isTicketHistoriesLoading}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}

function TicketDetailSkeleton() {
  return (
    <div className="rounded-2xl border bg-background p-5 shadow-sm">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 md:flex-row md:justify-between">
          <div className="flex gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-3">
              <div className="flex gap-2">
                <Skeleton className="h-6 w-28" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
              <Skeleton className="h-8 w-80 max-w-[70vw]" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
          <Skeleton className="h-28 w-full md:w-[240px]" />
        </div>

        <Separator className="h-px bg-primary-muted" />

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="rounded-xl border p-4">
            <Skeleton className="mb-4 h-6 w-28" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="mt-3 h-4 w-[92%]" />
            <Skeleton className="mt-3 h-4 w-[85%]" />
            <Skeleton className="mt-3 h-4 w-[65%]" />
          </div>

          <div className="space-y-4">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-36 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-background">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <span className="text-muted-foreground">{icon}</span>
        <h2 className="font-semibold">{title}</h2>
      </div>
      <div className="space-y-3 px-4 py-4">{children}</div>
    </section>
  );
}

function PersonRow({
  name,
  subText,
  image,
}: {
  name: string;
  subText?: string;
  image?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-9 w-9">
        <AvatarImage src={image} />
        <AvatarFallback>{initials(name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {subText || "-"}
        </p>
      </div>
    </div>
  );
}

function RecipientGroup({
  label,
  values,
}: {
  label: string;
  values: string[];
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      {values.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {values.map((value) => (
            <TicketMetaBadge
              className="max-w-full truncate px-2 py-1 font-normal"
              key={`${label}-${value}`}
              tone="neutral"
            >
              {value}
            </TicketMetaBadge>
          ))}
        </div>
      ) : (
        <EmptyText value="-" />
      )}
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value?: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="break-words text-sm">{value || "-"}</p>
    </div>
  );
}

function InfoMini({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium">{value || "-"}</p>
    </div>
  );
}

function EmptyText({ value }: { value: string }) {
  return <p className="text-sm text-muted-foreground">{value}</p>;
}

function TicketMetaBadge({
  tone,
  size = "md",
  className,
  children,
}: {
  tone: keyof typeof ticketMetaBadgeClassMap;
  size?: "sm" | "md";
  className?: string;
  children: ReactNode;
}) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "font-medium",
        size === "sm" && "px-2 py-0.5 text-xs",
        ticketMetaBadgeClassMap[tone],
        className,
      )}
    >
      {children}
    </Badge>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const tone = resolvePriorityTone(priority);

  return (
    <TicketMetaBadge className="capitalize" tone={tone}>
      {priority}
    </TicketMetaBadge>
  );
}

function formatDateTime(value?: string | Date) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

const ticketMetaBadgeClassMap = {
  ticket: "bg-primary/10 text-primary",
  scope: "bg-slate-100 text-slate-700",
  urgent: "bg-rose-100 text-rose-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-sky-100 text-sky-700",
  neutral: "bg-muted text-foreground",
} as const;

const priorityToneMap = {
  urgent: "urgent",
  high: "high",
  medium: "medium",
  low: "low",
} as const;

function resolvePriorityTone(priority: string) {
  const normalized = priority.toLowerCase();

  if (normalized in priorityToneMap) {
    return priorityToneMap[normalized as keyof typeof priorityToneMap];
  }

  return "neutral" as const;
}
