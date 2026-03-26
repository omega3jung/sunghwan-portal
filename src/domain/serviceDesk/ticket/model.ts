import { Priority } from "@/domain/common";
import { ISODateString } from "@/shared/types/date";

import { Attach } from "../types";
import {
  CommentVisibility,
  HistoryType,
  TicketHistoryAction,
  TicketStatus,
} from "../types/enums";

/**
 * Ticket core identifiers and audit fields.
 */
interface TicketBase {
  id: string;
  ticketNumber: string;

  createdAt: ISODateString;
  updatedAt: ISODateString;

  requesterId: string;
}

/**
 * Ticket workflow state.
 * These fields represent the current processing state of a ticket.
 */
interface TicketWorkflowState {
  status: TicketStatus;
  priority: Priority;
  assigneeIds: string[];
}

/**
 * Ticket metrics or derived operational state.
 * These values are useful for domain-level summary/detail reads.
 */
interface TicketMetrics {
  trackTimeMinutes: number;

  lastCommentAt?: ISODateString;
  lastCommenterEmail?: string;
}

/**
 * Shared ticket flags and due-date state.
 */
interface TicketViewState {
  dueAt: ISODateString;

  owner: boolean;
  assigned: boolean;
  active: boolean;
}

/**
 * Ticket content fields.
 * These are the main editable fields of a ticket.
 */
interface TicketContent {
  categoryId: string;
  approvalStepId?: string;

  subject: string;
  body: string;

  email: {
    to: string[];
    cc: string[];
    bcc: string[];
  };

  files: Attach[];
  images: Attach[];
}

/**
 * Ticket summary for list/read use.
 * Uses display-friendly fields where appropriate.
 */
export interface TicketSummary
  extends TicketBase, TicketWorkflowState, TicketMetrics, TicketViewState {
  categoryName: string;
  approvalStepName?: string;

  subject: string;
  age: number;
}

/**
 * Ticket detail for full read/edit use.
 * Uses domain identifiers rather than display labels.
 */
export interface TicketDetail
  extends
    TicketBase,
    TicketWorkflowState,
    TicketMetrics,
    TicketViewState,
    TicketContent {}

/**
 * Ticket comment domain model.
 *
 * commentNo is ticket-scoped, not globally unique.
 * Recommended identity: (ticketId, commentNo)
 */
export interface TicketComment {
  ticketId: string;
  commentNo: string;

  body: string;
  ownerId: string;

  visibility: CommentVisibility;

  createdAt: ISODateString;
  updatedAt: ISODateString;
  active: boolean;

  files: Attach[];
  images: Attach[];
}

/**
 * Ticket time tracking entry.
 *
 * trackTimeNo is ticket-scoped, not globally unique.
 * Recommended identity: (ticketId, trackTimeNo)
 */
export interface TicketTrackTime {
  ticketId: string;
  trackTimeNo: string;

  assigneeId: string;

  startAt: ISODateString;
  endAt: ISODateString | null;

  durationMinutes: number | null;

  note?: string;

  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/**
 * Ticket history domain model.
 *
 * historyNo is ticket-scoped, not globally unique.
 * Recommended identity: (ticketId, historyNo)
 *
 * commentNo:
 * - null   => ticket-level history
 * - string => comment-level history
 */
export interface TicketHistory {
  ticketId: string;
  historyNo: string;

  type: HistoryType;
  action: TicketHistoryAction;

  actorId: string | null;
  commentNo: string | null;

  fromValue?: unknown;
  toValue?: unknown;
  metadata?: Record<string, unknown>;

  createdAt: ISODateString;
}
