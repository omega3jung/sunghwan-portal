"use client";

import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/shared/utils";

import { statusLocaleKey } from "./locales";
import { StatusBadgeProps, SystemStatus } from "./types";

export const statusClassMap: Record<SystemStatus, string> = {
  Draft: "bg-muted text-muted-foreground",
  Open: "bg-blue-100 text-blue-600",
  Approved: "bg-blue-50 text-blue-500",
  Declined: "bg-red-100 text-red-500",
  Working: "bg-orange-100 text-orange-500",
  Pending: "bg-gray-100 text-gray-600",
  Resolved: "bg-emerald-100 text-emerald-600",
  Rejected: "bg-red-200 text-red-700",
  Closed: "bg-cyan-100 text-cyan-600",
};

export const StatusBadge = ({ status, size = "md" }: StatusBadgeProps) => {
  const { t } = useTranslation("StatusBadge");

  if (!status) return null;

  return (
    <Badge
      variant="secondary"
      className={cn(
        "font-medium",
        size === "sm" && "text-xs px-2 py-0.5",
        statusClassMap[status],
      )}
    >
      {t(statusLocaleKey[status])}
    </Badge>
  );
};
