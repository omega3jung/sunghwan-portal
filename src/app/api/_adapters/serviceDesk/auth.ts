import { NextRequest } from "next/server";
import type { Session } from "next-auth";

import { getAuthToken } from "@/app/api/_adapters/auth/requestAuth";
import { getLocalDemoTenants } from "@/app/api/_adapters/localDemo/serviceDesk/settings/state";
import type { DataScope } from "@/domain/auth";
import { isOwnerCompany } from "@/domain/organization";
import { type CategoryScope } from "@/domain/serviceDesk";
import type { AppUser } from "@/domain/user";
import {
  canManageServiceDeskSettings,
  canReadServiceDeskSettings,
  getServiceDeskAdminType,
  resolveSettingsAccess,
  type ServiceDeskSettingsResource,
} from "@/lib/application/serviceDesk";
import { resolveDemoProfile } from "@/mocks/domain/user";
import {
  getServiceDeskSettingsTenantContext as getRemoteServiceDeskSettingsTenantContext,
  getServiceDeskSettingsTenantContextByCompanyId as getRemoteServiceDeskSettingsTenantContextByCompanyId,
  type ServiceDeskSettingsTenantContext,
} from "@/server/data/serviceDesk/tenant";
import { getUserProfileDtoByUsername } from "@/server/data/users";

export type ServiceDeskSettingsPrincipalContext = {
  principal: AppUser;
  dataScope: DataScope;
  originalUsername: string;
  effectiveUsername: string;
};

async function getServiceDeskSettingsTenantContext(
  dataScope: DataScope,
  tenantId: string | number,
) {
  if (dataScope === "REMOTE") {
    return getRemoteServiceDeskSettingsTenantContext(tenantId);
  }

  const tenant = getLocalDemoTenants().find(
    (item) => String(item.tenant_id) === String(tenantId),
  );

  return tenant ? toLocalTenantContext(tenant) : null;
}

async function getServiceDeskSettingsTenantContextByCompanyId(
  dataScope: DataScope,
  companyId: string | number,
) {
  if (dataScope === "REMOTE") {
    return getRemoteServiceDeskSettingsTenantContextByCompanyId(companyId);
  }

  const tenant = getLocalDemoTenants().find(
    (item) => String(item.tenant_company_id) === String(companyId),
  );

  return tenant ? toLocalTenantContext(tenant) : null;
}

function toLocalTenantContext(
  tenant: ReturnType<typeof getLocalDemoTenants>[number],
): ServiceDeskSettingsTenantContext {
  return {
    id: String(tenant.tenant_id),
    companyId: Number(tenant.tenant_company_id),
    isOwnerTenant: isOwnerCompany(tenant.tenant_company_id),
    active: tenant.tenant_active !== false,
  };
}

export async function resolveServiceDeskSettingsPrincipal(
  request: NextRequest,
): Promise<ServiceDeskSettingsPrincipalContext> {
  const token = await getAuthToken(request);

  if (!token) {
    throw createAuthorizationError("Authentication is required.", 401);
  }

  const originalUsername = normalizeUsername(token.username);
  const effectiveUsername = normalizeUsername(
    token.impersonation?.impersonatedUser.username ?? token.username,
  );

  if (!originalUsername || !effectiveUsername) {
    throw createAuthorizationError("User identity is unavailable.", 401);
  }

  const dataScope = token.dataScope;
  const principal = await resolveCanonicalAppUser(effectiveUsername, dataScope);

  if (!principal) {
    throw createAuthorizationError("User profile is unavailable.", 403);
  }

  return {
    principal,
    dataScope,
    originalUsername,
    effectiveUsername,
  };
}

export async function resolveServiceDeskSettingsPrincipalFromSession(
  session: Session | null,
): Promise<ServiceDeskSettingsPrincipalContext> {
  if (!session?.user) {
    throw createAuthorizationError("Authentication is required.", 401);
  }

  const originalUsername = normalizeUsername(session.user.username);
  const effectiveUsername = normalizeUsername(
    session.impersonation?.impersonatedUser.username ?? session.user.username,
  );

  if (!originalUsername || !effectiveUsername) {
    throw createAuthorizationError("User identity is unavailable.", 401);
  }

  const dataScope = session.user.dataScope;
  const principal = await resolveCanonicalAppUser(effectiveUsername, dataScope);

  if (!principal) {
    throw createAuthorizationError("User profile is unavailable.", 403);
  }

  return {
    principal,
    dataScope,
    originalUsername,
    effectiveUsername,
  };
}

export const SERVICE_DESK_SETTINGS_QUERY_VALUE = "settings";

export function isServiceDeskSettingsRequest(request: NextRequest) {
  return (
    request.nextUrl.searchParams.get("context") ===
      SERVICE_DESK_SETTINGS_QUERY_VALUE ||
    request.nextUrl.searchParams.get("settings") === "true"
  );
}

export function parseCategoryScope(value: unknown): CategoryScope | null {
  return value === "INTERNAL" || value === "PORTAL" ? value : null;
}

export async function requireServiceDeskSettingsAdmin(request: NextRequest) {
  const principalContext = await resolveServiceDeskSettingsPrincipal(request);
  const adminType = getServiceDeskAdminType(principalContext.principal);

  if (!adminType) {
    throw createSettingsAuthorizationError(
      "Service Desk Settings administrator access is required.",
      403,
    );
  }

  return {
    ...principalContext,
    adminType,
  };
}

export async function resolveOperationalServiceDeskReadTarget({
  principalContext,
  requestedTenantId,
  requestedScope,
}: {
  principalContext: ServiceDeskSettingsPrincipalContext;
  requestedTenantId?: string | number | null;
  requestedScope?: CategoryScope | null;
}) {
  const { dataScope, principal } = principalContext;
  const ownTenant = await getServiceDeskSettingsTenantContextByCompanyId(
    dataScope,
    principal.companyId,
  );

  if (!ownTenant || !ownTenant.active) {
    throw createSettingsAuthorizationError(
      "An active Service Desk tenant is not configured for this company.",
      403,
    );
  }

  if (principal.userScope === "CLIENT") {
    if (
      requestedTenantId !== null &&
      requestedTenantId !== undefined &&
      String(requestedTenantId) !== ownTenant.id
    ) {
      throw createSettingsAuthorizationError(
        "The requested tenant is outside the current user's scope.",
        403,
      );
    }

    return {
      tenant: ownTenant,
      scope: requestedScope ?? null,
    };
  }

  const targetTenant =
    requestedTenantId === null || requestedTenantId === undefined
      ? ownTenant
      : await getServiceDeskSettingsTenantContext(dataScope, requestedTenantId);

  if (!targetTenant || !targetTenant.active) {
    throw createSettingsAuthorizationError(
      "The requested Service Desk tenant was not found.",
      404,
    );
  }

  if (!targetTenant.isOwnerTenant && requestedScope === "INTERNAL") {
    throw createSettingsAuthorizationError(
      "Customer INTERNAL configuration is outside the service provider scope.",
      403,
    );
  }

  return {
    tenant: targetTenant,
    scope: targetTenant.isOwnerTenant
      ? (requestedScope ?? null)
      : ("PORTAL" as const),
  };
}

export async function resolveAuthorizedSettingsTenant({
  request,
  requestedTenantId,
}: {
  request: NextRequest;
  requestedTenantId?: string | number | null;
}) {
  const principalContext = await requireServiceDeskSettingsAdmin(request);
  const { adminType, dataScope, principal } = principalContext;

  if (adminType === "TENANT_ADMIN") {
    const ownTenant = await getServiceDeskSettingsTenantContextByCompanyId(
      dataScope,
      principal.companyId,
    );

    if (!ownTenant) {
      throw createSettingsAuthorizationError(
        "A Service Desk tenant is not configured for this company.",
        403,
      );
    }

    if (
      requestedTenantId !== null &&
      requestedTenantId !== undefined &&
      String(requestedTenantId) !== ownTenant.id
    ) {
      throw createSettingsAuthorizationError(
        "The requested tenant is outside the current administrator scope.",
        403,
      );
    }

    return {
      ...principalContext,
      tenant: ownTenant,
    };
  }

  if (requestedTenantId === null || requestedTenantId === undefined) {
    return {
      ...principalContext,
      tenant: null,
    };
  }

  const tenant = await getServiceDeskSettingsTenantContext(
    dataScope,
    requestedTenantId,
  );

  if (!tenant) {
    throw createSettingsAuthorizationError("Service Desk tenant not found.", 404);
  }

  return {
    ...principalContext,
    tenant,
  };
}

export async function requireSettingsResourceAccess({
  request,
  requestedTenantId,
  resource,
  scope,
  manage = false,
}: {
  request: NextRequest;
  requestedTenantId?: string | number | null;
  resource: ServiceDeskSettingsResource;
  scope: CategoryScope;
  manage?: boolean;
}) {
  const context = await resolveAuthorizedSettingsTenant({
    request,
    requestedTenantId,
  });
  const tenant = context.tenant;

  if (!tenant) {
    throw createSettingsAuthorizationError(
      "A target tenant is required for this settings resource.",
      400,
    );
  }

  const access = resolveSettingsAccess(context.principal, {
    resource,
    tenantCompanyId: tenant.companyId,
    isOwnerTenant: tenant.isOwnerTenant,
    scope,
  });
  const allowed = manage
    ? canManageServiceDeskSettings(access)
    : canReadServiceDeskSettings(access);

  if (!allowed) {
    throw createSettingsAuthorizationError(
      manage
        ? "This settings resource is read-only or outside the administrator scope."
        : "This settings resource is outside the administrator scope.",
      403,
    );
  }

  return {
    ...context,
    tenant,
    access,
  };
}

export function resolveTenantResourceAccess(
  principal: Parameters<typeof resolveSettingsAccess>[0],
) {
  return resolveSettingsAccess(principal, { resource: "TENANT" });
}

export function createSettingsAuthorizationError(
  message: string,
  status: number,
) {
  return Object.assign(new Error(message), { status });
}

export function toSettingsResourceContext(
  tenant: ServiceDeskSettingsTenantContext,
  resource: ServiceDeskSettingsResource,
  scope: CategoryScope,
) {
  return {
    resource,
    tenantCompanyId: tenant.companyId,
    isOwnerTenant: tenant.isOwnerTenant,
    scope,
  } as const;
}

async function resolveCanonicalAppUser(
  username: string,
  dataScope: DataScope,
): Promise<AppUser | null> {
  if (dataScope === "LOCAL") {
    return resolveDemoProfile(username);
  }

  return getUserProfileDtoByUsername(username);
}

function normalizeUsername(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();

  return normalizedValue.length > 0 ? normalizedValue : null;
}

function createAuthorizationError(message: string, status: 401 | 403) {
  return Object.assign(new Error(message), { status });
}
