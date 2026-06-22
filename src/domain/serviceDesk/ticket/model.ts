import { Priority, RiskLevel } from "@/domain/common";
import { LocalizedText } from "@/shared/types";
import { ISODateString } from "@/shared/types/date";

import { CategoryScope } from "../category";
import { Attach } from "../types";
import { TicketResolutionReason, TicketStatus } from "../types/enums";

/**
 * Ticket core identifiers and audit fields.
 */
interface TicketBase {
  id: string;
  ticketNumber: string;

  createdAt: ISODateString;
  updatedAt?: ISODateString;

  requesterUsername: string;
}

/**
 * Ticket workflow state.
 * These fields represent the current processing state of a ticket.
 */
interface TicketWorkflowState {
  status: TicketStatus;
  priority: Priority;
  riskLevel: RiskLevel;
  assigneeUsernames: string[];
  closeReason?: TicketResolutionReason;
}

/**
 * Ticket metrics or derived operational state.
 * These values are useful for domain-level summary/detail reads.
 */
interface TicketMetrics {
  workMinutes: number;

  lastCommentAt?: ISODateString;
  lastCommenterEmail?: string;
  lastUserActivityAt?: ISODateString;
  lastUserActivityEmail?: string;
  closedAt?: ISODateString;
}

/**
 * Shared ticket flags and due-date state.
 */
interface TicketViewState {
  dueAt: ISODateString;

  // Derived in the response for the current authenticated user.
  owner: boolean;
  // Derived in the response for the current authenticated user.
  assigned: boolean;
  active: boolean;
}

/**
 * Ticket scope fields.
 * These are the key fields for determining the ticket classification.
 */
interface TicketScopeContext {
  scope: CategoryScope;
  categoryParentId?: string;
}

/**
 * Ticket content fields.
 * These are the main editable fields of a ticket.
 */
interface TicketContent {
  categoryId: string;
  approvalStepId?: string;

  subject: string;
  content: string;

  email: {
    to: string[];
    cc: string[];
    bcc: string[];
  };

  files: Attach[];
  images: Attach[];
}

/**
 * Ticket merge info fields.
 */
interface TicketRelation {
  mergedIntoTicketId?: string | null;
  mergedIntoTicketNo?: string | null;
}

/**
 * Ticket summary for list/read use.
 * Uses display-friendly fields where appropriate.
 */
export interface TicketSummary
  extends
    TicketBase,
    TicketWorkflowState,
    TicketMetrics,
    TicketViewState,
    TicketScopeContext,
    TicketRelation {
  categoryName: LocalizedText;
  categoryId?: string;
  approvalStepId?: string;
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
    TicketScopeContext,
    TicketContent,
    TicketRelation {
  categoryName: LocalizedText;
}
