import { Priority, RiskLevel } from "@/domain/common";
import { LocalizedName } from "@/domain/organization";
import { LocalizedText } from "@/shared/types";
import { ISODateString } from "@/shared/types/date";

import { CategoryScope } from "../category";
import { TicketAttachmentMetadata } from "../types";
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
  requester: TicketRequester;
  requesterDepartmentId: string | null;
  requesterDepartmentName: LocalizedText | null;
}

/**
 * Ticket workflow state.
 * These fields represent the current processing state of a ticket.
 */
interface TicketWorkflowState {
  status: TicketStatus;
  priority: Priority;
  riskLevel: RiskLevel;
  closeReason?: TicketResolutionReason;
}

export type TicketAssignmentPhase = "APPROVAL" | "WORK";

export type TicketUser = {
  username: string;
  name: LocalizedName;
  image: string | null;
};

export type TicketRequester = TicketUser & {
  email: string | null;
};

/**
 * Ticket assignment state.
 * The persisted assignee column stores the current responsible users, whose
 * meaning depends on whether the ticket is in approval or work phase.
 */
export interface TicketCurrentAssignmentState {
  assignmentPhase: TicketAssignmentPhase;
  approvalAssignees: TicketUser[];
  workAssignees: TicketUser[];
  approvalAssigneeUsernames: string[];
  workAssigneeUsernames: string[];
  isCurrentApprover: boolean;
  isCurrentWorker: boolean;
}

/**
 * Whether the current user has been assigned as a work assignee
 * at any point, including the current assignment.
 */
export interface TicketAssignmentState extends TicketCurrentAssignmentState {
  hasBeenWorker: boolean;
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
  active: boolean;
}

/**
 * Ticket scope fields.
 * These are the key fields for determining the ticket classification.
 */
interface TicketScopeContext {
  tenantId: string | null;
  tenantName: LocalizedText | null;
  scope: CategoryScope;
  categoryParentId?: string;
}

/**
 * Ticket content fields.
 * These are the main editable fields of a ticket.
 */
interface TicketContent {
  categoryId: string;
  approvalStepId: string | null;

  subject: string;
  content: string;

  email: {
    to: string[];
    cc: string[];
    bcc: string[];
  };

  files: TicketAttachmentMetadata[];
  images: TicketAttachmentMetadata[];
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
    TicketCurrentAssignmentState,
    TicketMetrics,
    TicketViewState,
    TicketScopeContext,
    TicketRelation {
  categoryName: LocalizedText;
  categoryId?: string;
  approvalStepId: string | null;
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
    TicketAssignmentState,
    TicketMetrics,
    TicketViewState,
    TicketScopeContext,
    TicketContent,
    TicketRelation {
  categoryName: LocalizedText;
}
