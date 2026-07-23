import type { NextRequest } from "next/server";

import { getAuthToken } from "@/app/api/_adapters/auth/requestAuth";
import type { Role, UserScope } from "@/domain/auth";
import { resolveDemoAuth } from "@/mocks/domain/user";

import { getLocalDemoTenants } from "./serviceDesk/settings/state";
import type { LocalTicketAccessContext } from "./serviceDesk/ticket/access";

/** Resolves the effective local demo user's role, including impersonation. */
export async function getCurrentLocalUserRole(
  request: NextRequest,
): Promise<Role> {
  return (await resolveCurrentLocalAuth(request))?.role ?? "NONE";
}

/** Resolves the effective local demo user's scope, including impersonation. */
export async function getCurrentLocalUserScope(
  request: NextRequest,
): Promise<UserScope | null> {
  return (await resolveCurrentLocalAuth(request))?.userScope ?? null;
}

/** Resolves whether the effective local demo user belongs to the internal scope. */
export async function isCurrentLocalUserInternal(
  request: NextRequest,
): Promise<boolean | null> {
  const scope = await getCurrentLocalUserScope(request);
  return scope === null ? null : scope === "INTERNAL";
}

/** Resolves the tenant-aware context used to project the canonical ticket state. */
export async function getCurrentLocalTicketAccessContext(
  request: NextRequest,
): Promise<LocalTicketAccessContext | null> {
  const auth = await resolveCurrentLocalAuth(request);

  if (!auth) {
    return null;
  }

  const tenant = getLocalDemoTenants().find(
    (item) => String(item.tenant_company_id) === String(auth.companyId),
  );

  if (!tenant || tenant.tenant_active === false) {
    return null;
  }

  return {
    userScope: auth.userScope,
    tenantId: String(tenant.tenant_id),
  };
}

async function resolveCurrentLocalAuth(request: NextRequest) {
  const token = await getAuthToken(request);
  const currentUserName =
    token?.impersonation?.impersonatedUser.username ?? token?.username;

  if (!token || token.dataScope !== "LOCAL" || !currentUserName) {
    return null;
  }

  return resolveDemoAuth(currentUserName);
}
