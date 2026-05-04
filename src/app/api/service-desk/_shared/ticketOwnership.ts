import { TicketDetail } from "@/domain/serviceDesk";

type TicketOwnershipResource = Pick<
  TicketDetail,
  "requesterId" | "assigneeIds" | "owner" | "assigned"
>;

const CURRENT_USERNAME_HEADER = "X-Current-Username";

export function withDerivedTicketOwnership<T extends TicketOwnershipResource>(
  ticket: T,
  currentUserName: string | null,
): T {
  const normalizedUserName = normalizeCurrentUserName(currentUserName);

  return {
    ...ticket,
    owner:
      normalizedUserName !== null && ticket.requesterId === normalizedUserName,
    assigned:
      normalizedUserName !== null &&
      ticket.assigneeIds.includes(normalizedUserName),
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
): HeadersInit | undefined {
  const normalizedUserName = normalizeCurrentUserName(currentUserName);

  if (normalizedUserName === null) {
    return undefined;
  }

  return {
    [CURRENT_USERNAME_HEADER]: normalizedUserName,
  };
}

function normalizeCurrentUserName(value: string | null) {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();
  return normalizedValue.length > 0 ? normalizedValue : null;
}
