import { Priority, RiskLevel } from "@/domain/common";
import { LocalizedName } from "@/domain/organization";
import { LocalizedText } from "@/shared/types";
import { ISODateString } from "@/shared/types/date";

import { CategoryScope } from "../category";
import { TicketAttachmentMetadata } from "../types";
import { TicketResolutionReason, TicketStatus } from "../types/enums";

/** Identifiers, requester snapshot, and audit timestamps shared by read projections. */
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

/** Current workflow state used for routing and resolution. */
interface TicketWorkflowState {
  status: TicketStatus;
  priority: Priority;
  riskLevel: RiskLevel;
  closeReason?: TicketResolutionReason;
}

/** Determines whether current assignees are approvers or work assignees. */
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

export interface TicketAssignmentState extends TicketCurrentAssignmentState {
  /** Includes both previous and current work assignments. */
  hasBeenWorker: boolean;
}

/** Accumulated work and latest activity timestamps shared by read projections. */
interface TicketMetrics {
  workMinutes: number;

  lastCommentAt?: ISODateString;
  lastCommenterEmail?: string;
  lastUserActivityAt?: ISODateString;
  lastUserActivityEmail?: string;
  closedAt?: ISODateString;
}

/** Ticket due date and current-user view projections. */
interface TicketViewState {
  dueAt: ISODateString;

  owner: boolean;
  active: boolean;
}

/** Tenant and category fields that determine the ticket's operating scope. */
interface TicketScopeContext {
  tenantId: string | null;
  tenantName: LocalizedText | null;
  scope: CategoryScope;
  categoryParentId?: string;
}

/** Editable request content and its attachment metadata. */
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

/** Target identity recorded when a ticket is merged or escalated. */
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
