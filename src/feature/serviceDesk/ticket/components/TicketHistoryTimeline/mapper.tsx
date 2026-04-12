import { TFunction } from "i18next";
import {
  Bot,
  Check,
  CircleDot,
  Clock3,
  MessageSquare,
  Pencil,
  RefreshCcw,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";

import type { TimelineItemData } from "@/components/custom/Timeline";
import type { TicketHistory } from "@/domain/serviceDesk";
import { statusLocaleKey } from "@/shared/ui/StatusBadge/locales";
import type { SystemStatus } from "@/shared/ui/StatusBadge/types";

import { formatHistoryMeta } from "./utils";

type HistoryTimelineMapperTranslation = {
  t: TFunction;
  tHistory: TFunction;
  tStatus: TFunction;
};

export function resolveHistoryBadge(
  history: TicketHistory,
  t: TFunction,
): string {
  switch (history.type) {
    case "STATUS":
      return t("historyTimeline.badge.status");
    case "FIELD":
      return t("historyTimeline.badge.field");
    case "ASSIGNMENT":
      return t("historyTimeline.badge.assignment");
    case "APPROVAL":
      return t("historyTimeline.badge.approval");
    case "COMMENT":
      return t("historyTimeline.badge.comment");
    case "TRACK_TIME":
      return t("historyTimeline.badge.trackTime");
    case "SLA":
      return t("historyTimeline.badge.sla");
    case "SYSTEM":
      return t("historyTimeline.badge.system");
    default:
      return t("historyTimeline.badge.default");
  }
}

export function getHistorySummary(
  history: {
    action: string;
    fromValue?: unknown;
    toValue?: unknown;
  },
  t: TFunction,
  tStatus: TFunction,
) {
  switch (history.action) {
    case "DELETED":
      return t("history.DELETED");
    case "STATUS_CHANGED":
      if (history.fromValue && history.toValue) {
        return t("history.STATUS_CHANGED", {
          from: resolveHistoryStatusLabel(history.fromValue, tStatus),
          to: resolveHistoryStatusLabel(history.toValue, tStatus),
        });
      }
      return t("history.STATUS_CHANGED_SIMPLE");
    case "ASSIGNEE_CHANGED":
      return t("history.ASSIGNEE_CHANGED");
    case "APPROVAL_REQUESTED":
      return t("history.APPROVAL_REQUESTED");
    case "APPROVAL_APPROVED":
      return t("history.APPROVAL_APPROVED");
    case "APPROVAL_DECLINED":
      return t("history.APPROVAL_DECLINED");
    case "COMMENT_CREATED":
      return t("history.COMMENT_CREATED");
    case "COMMENT_UPDATED":
      return t("history.COMMENT_UPDATED");
    case "COMMENT_DELETED":
      return t("history.COMMENT_DELETED");
    case "TRACK_TIME_UPDATED":
      return t("history.TRACK_TIME_UPDATED");
    case "UPDATED":
      return t("history.UPDATED");
    case "CREATED":
      return t("history.CREATED");
    default:
      return t("history.DEFAULT");
  }
}

function isSystemStatus(value: unknown): value is SystemStatus {
  return typeof value === "string" && value in statusLocaleKey;
}

function resolveHistoryStatusLabel(value: unknown, tStatus: TFunction): string {
  if (isSystemStatus(value)) {
    return tStatus(statusLocaleKey[value]);
  }

  return String(value);
}

export function resolveHistoryIcon(history: TicketHistory) {
  switch (history.action) {
    case "CREATED":
      return <CircleDot className="h-3 w-3" />;

    case "UPDATED":
    case "STATUS_CHANGED":
    case "ASSIGNEE_CHANGED":
    case "COMMENT_UPDATED":
    case "TRACK_TIME_UPDATED":
      return <RefreshCcw className="h-3 w-3" />;

    case "DELETED":
    case "COMMENT_DELETED":
      return <Trash2 className="h-3 w-3" />;

    case "APPROVAL_REQUESTED":
      return <Clock3 className="h-3 w-3" />;

    case "APPROVAL_APPROVED":
      return <Check className="h-3 w-3" />;

    case "APPROVAL_DECLINED":
      return <X className="h-3 w-3" />;

    case "COMMENT_CREATED":
      return <MessageSquare className="h-3 w-3" />;

    default:
      break;
  }

  switch (history.type) {
    case "ASSIGNMENT":
      return <UserPlus className="h-3 w-3" />;
    case "FIELD":
      return <Pencil className="h-3 w-3" />;
    case "TRACK_TIME":
    case "SLA":
      return <Clock3 className="h-3 w-3" />;
    case "SYSTEM":
      return <Bot className="h-3 w-3" />;
    case "COMMENT":
      return <MessageSquare className="h-3 w-3" />;
    case "APPROVAL":
      return <Check className="h-3 w-3" />;
    default:
      return <CircleDot className="h-3 w-3" />;
  }
}

export function resolveHistoryDescription(
  history: TicketHistory,
  t: TFunction,
): string | undefined {
  if (
    history.type === "FIELD" &&
    history.fromValue !== undefined &&
    history.toValue !== undefined
  ) {
    return t("historyTimeline.valueChanged", {
      from: String(history.fromValue),
      to: String(history.toValue),
    });
  }

  if (history.metadata && typeof history.metadata === "object") {
    const reason =
      "reason" in history.metadata &&
      typeof history.metadata.reason === "string"
        ? history.metadata.reason
        : undefined;

    const note =
      "note" in history.metadata && typeof history.metadata.note === "string"
        ? history.metadata.note
        : undefined;

    return reason ?? note;
  }

  return undefined;
}

export function mapTicketHistoryToTimelineItem(
  history: TicketHistory,
  { t, tHistory, tStatus }: HistoryTimelineMapperTranslation,
): TimelineItemData {
  return {
    id: `${history.ticketId}:${history.historyNo}`,
    title: getHistorySummary(history, tHistory, tStatus),
    description: resolveHistoryDescription(history, t),
    meta: formatHistoryMeta(history),
    badge: resolveHistoryBadge(history, t),
    markerIcon: resolveHistoryIcon(history),
    palette: undefined,
  };
}
