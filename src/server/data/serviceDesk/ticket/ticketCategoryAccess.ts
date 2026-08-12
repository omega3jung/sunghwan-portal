import type { AppUser } from "@/domain/user";
import { canAccessOperationalServiceDeskCategory } from "@/lib/application/serviceDesk";

import type { RequesterUpdateCategorySnapshot } from "./ticketUpdateRow";

/** Validates stored Category context and returns its authoritative Tenant ID. */
export function resolveAuthoritativeTicketCategory(
  category: RequesterUpdateCategorySnapshot | null,
  principal: Pick<AppUser, "companyId" | "userScope">,
) {
  if (
    !category ||
    !canAccessOperationalServiceDeskCategory({
      principal,
      category: {
        scope: category.cat_scope,
        tenant: {
          companyId: category.tenant_company_id,
          operational: true,
        },
      },
    })
  ) {
    throw Object.assign(new Error("Ticket category is not available."), {
      status: 404,
    });
  }

  return category;
}
