import type { UserScope } from "@/domain/auth";
import { ApiError } from "@/lib/application/api";
import type { DbTicketDetail } from "@/lib/application/contracts/serviceDesk";

/** Describes local ticket access context used by the server-side LOCAL ticket adapter. */
export type LocalTicketAccessContext = {
  username: string;
  userScope: UserScope;
  tenantId: string;
};

/**
 * Client users see their tenant's tickets. Internal users see their own
 * tenant's tickets and PORTAL tickets exposed by customer tenants.
 */
export function canAccessLocalDemoTicket(
  ticket: Pick<
    DbTicketDetail,
    "tenant_id" | "scope" | "requester_username" | "assignee_usernames"
  >,
  access: LocalTicketAccessContext,
) {
  if (
    ticket.requester_username === access.username ||
    ticket.assignee_usernames.includes(access.username)
  ) {
    return true;
  }

  if (String(ticket.tenant_id) === access.tenantId) {
    return true;
  }

  return access.userScope === "INTERNAL" && ticket.scope === "PORTAL";
}

/** Filters accessible local demo tickets by the server-side LOCAL ticket adapter scope rules. */
export function filterAccessibleLocalDemoTickets(
  tickets: DbTicketDetail[],
  access: LocalTicketAccessContext,
) {
  return tickets.filter((ticket) => canAccessLocalDemoTicket(ticket, access));
}

/** Returns whether access local demo category under the server-side LOCAL ticket adapter policy. */
export function canAccessLocalDemoCategory(
  category: { tenantId: string; scope: DbTicketDetail["scope"] },
  access: LocalTicketAccessContext,
) {
  return canAccessLocalDemoTicket(
    {
      tenant_id: category.tenantId,
      scope: category.scope,
      requester_username: "",
      assignee_usernames: [],
    },
    access,
  );
}

/** Enforces local demo ticket access before LOCAL state is exposed or mutated. */
export function requireLocalDemoTicketAccess(
  ticket: Pick<
    DbTicketDetail,
    "tenant_id" | "scope" | "requester_username" | "assignee_usernames"
  >,
  access: LocalTicketAccessContext,
) {
  // Return not-found rather than forbidden so callers cannot probe tickets
  // outside the tenant/scope visibility boundary.
  if (!canAccessLocalDemoTicket(ticket, access)) {
    throw new ApiError("serviceDesk.common.notFound", 404);
  }
}

/** Enforces local demo category access before LOCAL state is exposed or mutated. */
export function requireLocalDemoCategoryAccess(
  category: { tenantId: string; scope: DbTicketDetail["scope"] },
  access: LocalTicketAccessContext,
) {
  if (!canAccessLocalDemoCategory(category, access)) {
    throw new ApiError("serviceDesk.tickets.localDemo.categoryNotFound", 404);
  }
}
