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

import type { TimelineItemData } from "@/components/custom/Timeline";
import type {
  TicketHistory,
  TicketHistoryDisplayMetadata,
  TicketStatus,
} from "@/domain/serviceDesk";
import { ticketStatusLocaleKey } from "@/feature/serviceDesk/shared";

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
    case "PLANNING":
      return t("historyTimeline.badge.planning");
    default:
      return tCommon("field.history");
  }
}

export function getHistorySummary(
  history: {
    type?: string;
    event: TicketHistory["event"];
    fromValue?: unknown;
    toValue?: unknown;
    metadata?: TicketHistoryDisplayMetadata | null;
  },
  t: TFunction,
  tStatus: TFunction,
) {
  const eventSummary = getHistoryEventSummary(history, t, tStatus);
  if (eventSummary) {
    return eventSummary;
  }

  return t("history.DEFAULT");
}

function getHistoryEventSummary(
  history: {
    event: TicketHistory["event"];
    fromValue?: unknown;
    toValue?: unknown;
    metadata?: TicketHistoryDisplayMetadata | null;
  },
  t: TFunction,
  tStatus: TFunction,
) {
  switch (history.event) {
    case "TICKET_SUBMITTED":
      return t("history.TICKET_SUBMITTED");
    case "TICKET_UPDATED":
      return t("history.TICKET_UPDATED");
    case "CATEGORY_UPDATED":
      return t("history.CATEGORY_UPDATED");
    case "STATUS_UPDATED":
      return history.fromValue && history.toValue
        ? t("history.STATUS_UPDATED", {
            from: resolveHistoryStatusLabel(history.fromValue, tStatus),
            to: resolveHistoryStatusLabel(history.toValue, tStatus),
          })
        : t("history.STATUS_UPDATED_SIMPLE");
    case "APPROVAL_REQUESTED":
      return t("history.APPROVAL_REQUESTED");
    case "APPROVAL_APPROVED":
      return t("history.APPROVAL_APPROVED");
    case "APPROVAL_DECLINED":
      return t("history.APPROVAL_DECLINED");
    case "TICKET_MERGED":
      return t("history.MERGED", {
        target: resolveMergeTargetLabel(history.metadata),
      });
    case "TICKET_REJECTED":
      return t("history.TICKET_REJECTED");
    case "TICKET_CANCELED":
      return t("history.TICKET_CANCELED");
    case "RESOLUTION_CLOSE":
      return history.fromValue && history.toValue
        ? t("history.RESOLUTION_CLOSE", {
            from: resolveHistoryStatusLabel(history.fromValue, tStatus),
            to: resolveHistoryStatusLabel(history.toValue, tStatus),
          })
        : t("history.RESOLUTION_CLOSE_SIMPLE");
    case "ASSIGNMENT_RESOLVED":
      return t("history.ASSIGNMENT_RESOLVED");
    case "ASSIGNMENT_UPDATED":
      return t("history.ASSIGNMENT_UPDATED");
    case "COMMENT_CREATED":
      return t("history.COMMENT_CREATED");
    case "COMMENT_UPDATED":
      return t("history.COMMENT_UPDATED");
    case "COMMENT_DELETED":
      return t("history.COMMENT_DELETED");
    case "NOTE_CREATED":
      return t("history.NOTE_CREATED");
    case "NOTE_UPDATED":
      return t("history.NOTE_UPDATED");
    case "NOTE_DELETED":
      return t("history.NOTE_DELETED");
    case "PLANNING_UPDATED":
      return t("history.PLANNING_UPDATED");
    case "WORK_SESSION_STARTED":
      return t("history.WORK_SESSION_STARTED");
    case "WORK_SESSION_STOPPED":
      return t("history.WORK_SESSION_STOPPED");
    case "WORK_SESSION_UPDATED":
      return t("history.WORK_SESSION_UPDATED");
    case "WORK_SESSION_DELETED":
      return t("history.WORK_SESSION_DELETED");
    case "ROUTING_RESET":
      return t("history.ROUTING_RESET");
    case "ROUTING_PRESERVED":
      return t("history.ROUTING_PRESERVED");
    default:
      return undefined;
  }
}

function isTicketStatus(value: unknown): value is TicketStatus {
  return typeof value === "string" && value in ticketStatusLocaleKey;
}

function resolveHistoryStatusLabel(value: unknown, tStatus: TFunction): string {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    "status" in value
  ) {
    const status = (value as { status?: unknown }).status;

    if (isTicketStatus(status)) {
      return tStatus(ticketStatusLocaleKey[status]);
    }

    if (typeof status === "string") {
      return status;
    }
  }

  if (isTicketStatus(value)) {
    return tStatus(ticketStatusLocaleKey[value]);
  }

  return String(value);
}

export function resolveHistoryIcon(history: TicketHistory) {
  if (history.source === "SYSTEM_AUTO") {
    return <Bot className="h-3 w-3" />;
  }

  switch (history.event) {
    case "TICKET_MERGED":
      return <GitMerge className="h-3 w-3" />;
    case "TICKET_REJECTED":
    case "TICKET_CANCELED":
    case "APPROVAL_DECLINED":
      return <X className="h-3 w-3" />;
    case "APPROVAL_REQUESTED":
      return <Clock3 className="h-3 w-3" />;
    case "APPROVAL_APPROVED":
      return <Check className="h-3 w-3" />;
    case "STATUS_UPDATED":
    case "ASSIGNMENT_UPDATED":
    case "TICKET_UPDATED":
    case "CATEGORY_UPDATED":
    case "ROUTING_RESET":
    case "ROUTING_PRESERVED":
      return <RefreshCcw className="h-3 w-3" />;
    case "COMMENT_CREATED":
      return <MessageSquare className="h-3 w-3" />;
    case "NOTE_CREATED":
      return <StickyNote className="h-3 w-3" />;
    case "COMMENT_DELETED":
    case "NOTE_DELETED":
    case "WORK_SESSION_DELETED":
      return <Trash2 className="h-3 w-3" />;
    case "PLANNING_UPDATED":
    case "WORK_SESSION_STARTED":
    case "WORK_SESSION_STOPPED":
    case "WORK_SESSION_UPDATED":
      return <Clock3 className="h-3 w-3" />;
    default:
      break;
  }

  switch (history.type) {
    case "ASSIGNMENT":
      return <UserPlus className="h-3 w-3" />;
    case "CATEGORY":
      return <Pencil className="h-3 w-3" />;
    case "PLANNING":
      return <Clock3 className="h-3 w-3" />;
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

function resolveMergeTargetLabel(
  metadata?: TicketHistoryDisplayMetadata | null,
): string {
  return (
    metadata?.mergedIntoTicketNo ??
    metadata?.mergedIntoTicketId ??
    "-"
  );
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

  return history.metadata?.reason ?? history.metadata?.note;
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
