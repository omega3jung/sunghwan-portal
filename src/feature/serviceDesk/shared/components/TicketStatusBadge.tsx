"use client";

import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import type { TicketStatus } from "@/domain/serviceDesk";
import { cn } from "@/shared/utils/presentation";

import { ticketStatusLocaleKey } from "../ticketStatus/locales";
import type { TicketStatusBadgeProps } from "../ticketStatus/types";

export const ticketStatusClassMap: Record<TicketStatus, string> = {
  Draft: "bg-muted text-muted-foreground",
  Approval: "bg-amber-100 text-amber-700",
  Declined: "bg-red-100 text-red-500",
  Assigned: "bg-blue-50 text-blue-600",
  Working: "bg-orange-100 text-orange-500",
  Pending: "bg-gray-100 text-gray-600",
  Resolved: "bg-emerald-100 text-emerald-600",
  Rejected: "bg-red-200 text-red-700",
  Closed: "bg-cyan-100 text-cyan-600",
};

export const TicketStatusBadge = ({
  status,
  size = "md",
}: TicketStatusBadgeProps) => {
  const { t } = useTranslation("TicketStatusBadge");

  if (!status) return null;

  return (
    <Badge
      variant="secondary"
      className={cn(
        "font-medium",
        size === "sm" && "text-xs px-2 py-0.5",
        ticketStatusClassMap[status],
      )}
    >
      {t(ticketStatusLocaleKey[status])}
    </Badge>
  );
};
