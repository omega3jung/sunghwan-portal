import { TicketDetail } from "@/domain/serviceDesk";

type TicketOwnershipResource = Pick<
  TicketDetail,
  | "requesterUsername"
  | "assignmentPhase"
  | "approvalAssigneeUsernames"
  | "workAssigneeUsernames"
  | "owner"
  | "assignedApprover"
  | "assignedWorker"
>;

const CURRENT_USERNAME_HEADER = "X-Current-Username";
const CURRENT_USER_ROLE_HEADER = "X-Current-User-Role";

export function withDerivedTicketOwnership<T extends TicketOwnershipResource>(
  ticket: T,
  currentUserName: string | null,
): T {
  const normalizedUserName = normalizeCurrentUserName(currentUserName);

  return {
    ...ticket,
    owner:
      normalizedUserName !== null && ticket.requesterUsername === normalizedUserName,
    assignedApprover:
      normalizedUserName !== null &&
      ticket.assignmentPhase === "APPROVAL" &&
      ticket.approvalAssigneeUsernames.includes(normalizedUserName),
    assignedWorker:
      normalizedUserName !== null &&
      ticket.assignmentPhase === "WORK" &&
      ticket.workAssigneeUsernames.includes(normalizedUserName),
  };
}

export function withDerivedTicketOwnershipList<
  T extends TicketOwnershipResource,
>(tickets: readonly T[], currentUserName: string | null): T[] {
  return tickets.map((ticket) =>
    withDerivedTicketOwnership(ticket, currentUserName),
  );
}

export function toCurrentUsernameProxyHeaders(
  currentUserName: string | null,
  currentUserRole?: string | null,
): HeadersInit | undefined {
  const normalizedUserName = normalizeCurrentUserName(currentUserName);

  if (normalizedUserName === null) {
    return undefined;
  }

  return {
    [CURRENT_USERNAME_HEADER]: normalizedUserName,
    ...(currentUserRole ? { [CURRENT_USER_ROLE_HEADER]: currentUserRole } : {}),
  };
}

function normalizeCurrentUserName(value: string | null) {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();
  return normalizedValue.length > 0 ? normalizedValue : null;
}
