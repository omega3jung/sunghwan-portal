import { TFunction } from "i18next";
import {
  Bot,
  Check,
  CircleDot,
  Clock3,
  GitMerge,
  MessageSquare,
  Pencil,
  RefreshCcw,
  StickyNote,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";

import { statusLocaleKey } from "@/components/custom/StatusBadge/locales";
import type { SystemStatus } from "@/components/custom/StatusBadge/types";
import type { TimelineItemData } from "@/components/custom/Timeline";
import type { TicketHistory } from "@/domain/serviceDesk";

import { formatHistoryMeta } from "./utils";

type HistoryTimelineMapperTranslation = {
  t: TFunction;
  tCommon: TFunction;
  tHistory: TFunction;
  tStatus: TFunction;
};

export function resolveHistoryBadge(
  history: TicketHistory,
  t: TFunction,
  tCommon: TFunction,
): string {
  switch (history.type) {
    case "STATUS":
      return tCommon("field.status");
    case "CATEGORY":
      return tCommon("field.category");
    case "ASSIGNMENT":
      return t("historyTimeline.badge.assignment");
    case "APPROVAL":
      return t("historyTimeline.badge.approval");
    case "COMMENT":
      return tCommon("field.comment");
    case "NOTE":
      return tCommon("field.note");
    case "WORK_SESSION":
      return t("historyTimeline.badge.workSession");
    case "PLANNING":
      return t("historyTimeline.badge.planning");
    case "SYSTEM":
      return t("historyTimeline.badge.system");
    default:
      return tCommon("field.history");
  }
}

export function getHistorySummary(
  history: {
    type?: string;
    action: string;
    fromValue?: unknown;
    toValue?: unknown;
    metadata?: Record<string, unknown>;
  },
  t: TFunction,
  tStatus: TFunction,
) {
  if (history.type === "STATUS" && history.action === "UPDATED") {
    if (history.fromValue && history.toValue) {
      return t("history.STATUS_CHANGED", {
        from: resolveHistoryStatusLabel(history.fromValue, tStatus),
        to: resolveHistoryStatusLabel(history.toValue, tStatus),
      });
    }

    return t("history.STATUS_CHANGED_SIMPLE");
  }

  if (history.type === "ASSIGNMENT" && history.action === "UPDATED") {
    return t("history.ASSIGNEE_CHANGED");
  }

  if (history.type === "COMMENT") {
    switch (history.action) {
      case "CREATED":
        return t("history.COMMENT_CREATED");
      case "UPDATED":
        return t("history.COMMENT_UPDATED");
      case "DELETED":
        return t("history.COMMENT_DELETED");
      default:
        break;
    }
  }

  if (history.type === "NOTE" && history.action === "CREATED") {
    return t("history.NOTE_CREATED");
  }

  if (history.type === "WORK_SESSION" && history.action === "UPDATED") {
    return t("history.WORK_SESSION_UPDATED");
  }

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
    case "TICKET_MERGED":
    case "MERGED":
      return t("history.MERGED", {
        target: resolveMergeTargetLabel(history.metadata),
      });
    case "TICKET_REJECTED":
      return t("history.TICKET_REJECTED");
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
  if (history.type === "COMMENT" && history.action === "CREATED") {
    return <MessageSquare className="h-3 w-3" />;
  }

  if (history.type === "NOTE" && history.action === "CREATED") {
    return <StickyNote className="h-3 w-3" />;
  }

  if (history.type === "STATUS" && history.action === "UPDATED") {
    return <RefreshCcw className="h-3 w-3" />;
  }

  if (history.type === "ASSIGNMENT" && history.action === "UPDATED") {
    return <RefreshCcw className="h-3 w-3" />;
  }

  if (history.type === "WORK_SESSION" && history.action === "UPDATED") {
    return <RefreshCcw className="h-3 w-3" />;
  }

  switch (history.action) {
    case "CREATED":
      return <CircleDot className="h-3 w-3" />;

    case "UPDATED":
      return <RefreshCcw className="h-3 w-3" />;

    case "TICKET_MERGED":
      return <GitMerge className="h-3 w-3" />;

    case "TICKET_REJECTED":
      return <X className="h-3 w-3" />;

    case "DELETED":
      return <Trash2 className="h-3 w-3" />;

    case "APPROVAL_REQUESTED":
      return <Clock3 className="h-3 w-3" />;

    case "APPROVAL_APPROVED":
      return <Check className="h-3 w-3" />;

    default:
      break;
  }

  switch (history.type) {
    case "ASSIGNMENT":
      return <UserPlus className="h-3 w-3" />;
    case "CATEGORY":
      return <Pencil className="h-3 w-3" />;
    case "WORK_SESSION":
    case "PLANNING":
      return <Clock3 className="h-3 w-3" />;
    case "SYSTEM":
      return <Bot className="h-3 w-3" />;
    case "COMMENT":
      return <MessageSquare className="h-3 w-3" />;
    case "NOTE":
      return <StickyNote className="h-3 w-3" />;
    case "APPROVAL":
      return <Check className="h-3 w-3" />;
    default:
      return <CircleDot className="h-3 w-3" />;
  }
}

function resolveMergeTargetLabel(metadata?: Record<string, unknown>): string {
  if (
    metadata &&
    "targetTicketId" in metadata &&
    typeof metadata.targetTicketId === "string"
  ) {
    return metadata.targetTicketId;
  }

  return "-";
}

export function resolveHistoryDescription(
  history: TicketHistory,
  t: TFunction,
): string | undefined {
  if (
    history.type === "CATEGORY" &&
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
  { t, tCommon, tHistory, tStatus }: HistoryTimelineMapperTranslation,
): TimelineItemData {
  return {
    id: `${history.ticketId}:${history.historyNo}`,
    title: getHistorySummary(history, tHistory, tStatus),
    description: resolveHistoryDescription(history, t),
    meta: formatHistoryMeta(history),
    badge: resolveHistoryBadge(history, t, tCommon),
    markerIcon: resolveHistoryIcon(history),
    palette: undefined,
  };
}
