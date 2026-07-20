import type { UserScope } from "@/domain/auth";
import { ApiError } from "@/lib/application/api";
import type { DbTicketDetail } from "@/lib/application/contracts/serviceDesk";

export type LocalTicketAccessContext = {
  userScope: UserScope;
  tenantId: string;
};

/**
 * Client users see their tenant's tickets. Internal users see their own
 * tenant's tickets and PORTAL tickets exposed by customer tenants.
 */
export function canAccessLocalDemoTicket(
  ticket: Pick<DbTicketDetail, "tenant_id" | "scope">,
  access: LocalTicketAccessContext,
) {
  if (String(ticket.tenant_id) === access.tenantId) {
    return true;
  }

  return access.userScope === "INTERNAL" && ticket.scope === "PORTAL";
}

export function filterAccessibleLocalDemoTickets(
  tickets: DbTicketDetail[],
  access: LocalTicketAccessContext,
) {
  return tickets.filter((ticket) => canAccessLocalDemoTicket(ticket, access));
}

export function canAccessLocalDemoCategory(
  category: { tenantId: string; scope: DbTicketDetail["scope"] },
  access: LocalTicketAccessContext,
) {
  return canAccessLocalDemoTicket(
    { tenant_id: category.tenantId, scope: category.scope },
    access,
  );
}

export function requireLocalDemoTicketAccess(
  ticket: Pick<DbTicketDetail, "tenant_id" | "scope">,
  access: LocalTicketAccessContext,
) {
  if (!canAccessLocalDemoTicket(ticket, access)) {
    throw new ApiError("serviceDesk.common.notFound", 404);
  }
}

export function requireLocalDemoCategoryAccess(
  category: { tenantId: string; scope: DbTicketDetail["scope"] },
  access: LocalTicketAccessContext,
) {
  if (!canAccessLocalDemoCategory(category, access)) {
    throw new ApiError("serviceDesk.tickets.localDemo.categoryNotFound", 404);
  }
}
