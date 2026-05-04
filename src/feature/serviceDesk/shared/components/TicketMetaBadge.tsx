import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/shared/utils/presentation";

const ticketMetaBadgeClassMap = {
  ticket: "bg-primary/10 text-primary",
  scope: "bg-slate-100 text-slate-700",
  urgent: "bg-rose-100 text-rose-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-sky-100 text-sky-700",
  neutral: "bg-muted text-foreground",
  merge: "bg-violet-50 text-violet-700",
} as const;

export type MetaBadgeTone = keyof typeof ticketMetaBadgeClassMap;

type MetaBadgeProps = {
  tone: MetaBadgeTone;
  size?: "sm" | "md";
  className?: string;
  children: ReactNode;
};

export function MetaBadge({
  tone,
  size = "md",
  className,
  children,
}: MetaBadgeProps) {
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

const priorityToneMap = {
  urgent: "urgent",
  high: "high",
  medium: "medium",
  low: "low",
} as const satisfies Record<string, MetaBadgeTone>;

type PriorityBadgeProps = {
  priority: string;
};

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <MetaBadge className="capitalize" tone={resolvePriorityTone(priority)}>
      {priority}
    </MetaBadge>
  );
}

function resolvePriorityTone(priority: string): MetaBadgeTone {
  const normalized = priority.toLowerCase();

  if (normalized in priorityToneMap) {
    return priorityToneMap[normalized as keyof typeof priorityToneMap];
  }

  return "neutral";
}

type RecipientGroupProps = {
  label: string;
  values: string[];
};

export function RecipientGroup({ label, values }: RecipientGroupProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      {values.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {values.map((value) => (
            <MetaBadge
              className="max-w-full truncate px-2 py-1 font-normal"
              key={`${label}-${value}`}
              tone="neutral"
            >
              {value}
            </MetaBadge>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">-</p>
      )}
    </div>
  );
}
