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

import { formatHistoryMeta } from "./utils";

export function resolveHistoryBadge(history: TicketHistory): string {
  switch (history.type) {
    case "STATUS":
      return "Status";
    case "FIELD":
      return "Field";
    case "ASSIGNMENT":
      return "Assignment";
    case "APPROVAL":
      return "Approval";
    case "COMMENT":
      return "Comment";
    case "TRACK_TIME":
      return "Track Time";
    case "SLA":
      return "SLA";
    case "SYSTEM":
      return "System";
    default:
      return "History";
  }
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

export function resolveHistoryTitle(history: TicketHistory): string {
  switch (history.action) {
    case "CREATED":
      return "Ticket created";

    case "UPDATED":
      return "Ticket updated";

    case "DELETED":
      return "Ticket deleted";

    case "STATUS_CHANGED": {
      if (history.fromValue && history.toValue) {
        return `Status changed from ${String(history.fromValue)} to ${String(history.toValue)}`;
      }
      return "Status changed";
    }

    case "ASSIGNEE_CHANGED":
      return "Assignee changed";

    case "APPROVAL_REQUESTED":
      return "Approval requested";

    case "APPROVAL_APPROVED":
      return "Approval approved";

    case "APPROVAL_DECLINED":
      return "Approval declined";

    case "COMMENT_CREATED":
      return "Comment added";

    case "COMMENT_UPDATED":
      return "Comment updated";

    case "COMMENT_DELETED":
      return "Comment deleted";

    case "TRACK_TIME_UPDATED":
      return "Track time updated";

    default:
      return "History updated";
  }
}

export function resolveHistoryDescription(
  history: TicketHistory,
): string | undefined {
  if (
    history.type === "FIELD" &&
    history.fromValue !== undefined &&
    history.toValue !== undefined
  ) {
    return `${String(history.fromValue)} ??${String(history.toValue)}`;
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
): TimelineItemData {
  return {
    id: `${history.ticketId}:${history.historyNo}`,
    title: resolveHistoryTitle(history),
    description: resolveHistoryDescription(history),
    meta: formatHistoryMeta(history),
    badge: resolveHistoryBadge(history),
    markerIcon: resolveHistoryIcon(history),
    palette: undefined,
  };
}
