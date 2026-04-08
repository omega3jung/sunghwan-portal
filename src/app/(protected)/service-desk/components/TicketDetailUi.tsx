"use client";

import type { ReactNode } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/shared/utils";
import { initials } from "@/shared/utils/string";

export function InfoCard({
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

export function PersonRow({
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

export function RecipientGroup({
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

export function InfoLine({ label, value }: { label: string; value?: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="break-words text-sm">{value || "-"}</p>
    </div>
  );
}

export function InfoMini({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium">{value || "-"}</p>
    </div>
  );
}

export function EmptyText({ value }: { value: string }) {
  return <p className="text-sm text-muted-foreground">{value}</p>;
}

export function TicketMetaBadge({
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

export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <TicketMetaBadge
      className="capitalize"
      tone={resolvePriorityTone(priority)}
    >
      {priority}
    </TicketMetaBadge>
  );
}

export function formatDateTime(value?: string | Date) {
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
