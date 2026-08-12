import { NextRequest } from "next/server";

import {
  getAuthToken,
  getUserAccessLevel,
} from "@/app/api/_adapters/auth/requestAuth";
import { portalApiJson } from "@/app/api/_adapters/backend";
import { getLocalDemoTenants } from "@/app/api/_adapters/localDemo/serviceDesk/settings/state";
import { ACCESS_LEVEL, type DataScope } from "@/domain/auth";
import { isOwnerCompany } from "@/domain/organization";
import { type CategoryScope } from "@/domain/serviceDesk";
import type { AppUser } from "@/domain/user";
import type { ServiceDeskSettingsTenantContext } from "@/lib/application/contracts/serviceDesk";
import {
  canManageServiceDeskSettings,
  canReadServiceDeskSettings,
  getServiceDeskAdminType,
  resolveSettingsAccess,
  type ServiceDeskSettingsResource,
} from "@/lib/application/serviceDesk";
import { allCompaniesMock } from "@/mocks/domain/organization/companies";
import { resolveDemoProfile } from "@/mocks/domain/user";

/** Captures the authenticated principal and scope used to authorize settings operations. */
export type ServiceDeskSettingsPrincipalContext = {
  principal: AppUser;
  dataScope: DataScope;
  originalUsername: string;
  effectiveUsername: string;
};

async function getServiceDeskSettingsTenantContext(
  request: NextRequest,
  dataScope: DataScope,
  tenantId: string | number,
) {
  if (dataScope === "REMOTE") {
    const response = await portalApiJson(request, {
      method: "GET",
      path: `/service-desk/tenants/${encodeURIComponent(String(tenantId))}/context`,
      errorMessage: "Failed to fetch Service Desk tenant context",
    });

    return readTenantContextResponse(response);
  }

  const tenant = getLocalDemoTenants().find(
    (item) => String(item.tenant_id) === String(tenantId),
  );

  return tenant ? toLocalTenantContext(tenant) : null;
}

async function getServiceDeskSettingsTenantContextByCompanyId(
  request: NextRequest,
  dataScope: DataScope,
  companyId: string | number,
) {
  if (dataScope === "REMOTE") {
    const response = await portalApiJson(request, {
      method: "GET",
      path: "/service-desk/tenants/context",
      query: { companyId },
      errorMessage: "Failed to fetch Service Desk tenant context",
    });

    return readTenantContextResponse(response);
  }

  const tenant = getLocalDemoTenants().find(
    (item) => String(item.tenant_company_id) === String(companyId),
  );

  return tenant ? toLocalTenantContext(tenant) : null;
}

function toLocalTenantContext(
  tenant: ReturnType<typeof getLocalDemoTenants>[number],
): ServiceDeskSettingsTenantContext {
  const company = allCompaniesMock.find(
    (item) => String(item.company_id) === String(tenant.tenant_company_id),
  );
  const active = tenant.tenant_active !== false;

  return {
    id: String(tenant.tenant_id),
    companyId: Number(tenant.tenant_company_id),
    isOwnerTenant: isOwnerCompany(tenant.tenant_company_id),
    active,
    operational: active && company?.company_active === true,
  };
}

/** Rejects settings routes unless the session is authenticated and belongs to an internal administrator. */
export async function requireServiceDeskSettingsRouteAccess(
  request: NextRequest,
) {
  const token = await getAuthToken(request);

  if (!token) {
    throw createSettingsAuthorizationError("Authentication is required.", 401);
  }

  const accessLevel = await getUserAccessLevel(request);

  if (accessLevel < ACCESS_LEVEL.ADMIN) {
    throw createSettingsAuthorizationError(
      "Service Desk Settings administrator access is required.",
      403,
    );
  }
}

/**
 * Resolves the canonical acting profile for the selected data runtime.
 * LOCAL reads the fixed demo profile set; REMOTE asks the trusted portal API.
 * The signed token chooses the runtime and retains both original audit identity
 * and effective impersonated identity.
 */
export async function resolveServiceDeskRequestContext(
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
  const principal = await resolveCanonicalAppUser(
    request,
    effectiveUsername,
    dataScope,
  );

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

/** Query flag that explicitly selects the privileged Service Desk settings context. */
export const SERVICE_DESK_SETTINGS_QUERY_VALUE = "settings";

/** Distinguishes settings reads from ordinary operational Service Desk reads. */
export function isServiceDeskSettingsRequest(request: NextRequest) {
  return (
    request.nextUrl.searchParams.get("context") ===
      SERVICE_DESK_SETTINGS_QUERY_VALUE ||
    request.nextUrl.searchParams.get("settings") === "true"
  );
}

/** Parses category scope from the untrusted request representation. */
export function parseCategoryScope(value: unknown): CategoryScope | null {
  return value === "INTERNAL" || value === "PORTAL" ? value : null;
}

/** Resolves service desk settings admin context from the current server-side context and policy. */
export async function resolveServiceDeskSettingsAdminContext(
  request: NextRequest,
) {
  const principalContext = await resolveServiceDeskRequestContext(request);
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

/** Resolves the tenant/company target for operational reads without granting settings write access. */
export async function resolveOperationalServiceDeskReadTarget({
  request,
  principalContext,
  requestedTenantId,
  requestedScope,
}: {
  request: NextRequest;
  principalContext: ServiceDeskSettingsPrincipalContext;
  requestedTenantId?: string | number | null;
  requestedScope?: CategoryScope | null;
}) {
  const { dataScope, principal } = principalContext;
  const ownTenant = await getServiceDeskSettingsTenantContextByCompanyId(
    request,
    dataScope,
    principal.companyId,
  );

  if (!ownTenant || !ownTenant.operational) {
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
      : await getServiceDeskSettingsTenantContext(
          request,
          dataScope,
          requestedTenantId,
        );

  if (!targetTenant || !targetTenant.operational) {
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

/** Resolves authorized settings tenant from the current server-side context and policy. */
export async function resolveAuthorizedSettingsTenant({
  request,
  requestedTenantId,
}: {
  request: NextRequest;
  requestedTenantId?: string | number | null;
}) {
  const principalContext =
    await resolveServiceDeskSettingsAdminContext(request);
  const { adminType, dataScope, principal } = principalContext;

  if (adminType === "TENANT_ADMIN") {
    const ownTenant = await getServiceDeskSettingsTenantContextByCompanyId(
      request,
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
    request,
    dataScope,
    requestedTenantId,
  );

  if (!tenant) {
    throw createSettingsAuthorizationError(
      "Service Desk tenant not found.",
      404,
    );
  }

  return {
    ...principalContext,
    tenant,
  };
}

/**
 * Applies settings policy only after resolving the runtime-specific tenant.
 * Client-supplied tenant and scope values are treated as requests; the returned
 * access projection is derived from the canonical user and tenant relationship.
 */
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

/** Combines principal scope and tenant ownership to decide whether a resource may be accessed. */
export function resolveTenantResourceAccess(
  principal: Parameters<typeof resolveSettingsAccess>[0],
) {
  return resolveSettingsAccess(principal, { resource: "TENANT" });
}

/** Creates an authorization error whose status is retained by both local and remote adapters. */
export function createSettingsAuthorizationError(
  message: string,
  status: number,
) {
  return Object.assign(new Error(message), { status });
}

/** Converts settings resource context to the representation required by this server boundary. */
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
  request: NextRequest,
  username: string,
  dataScope: DataScope,
): Promise<AppUser | null> {
  if (dataScope === "LOCAL") {
    return resolveDemoProfile(username);
  }

  const response = await portalApiJson(request, {
    method: "GET",
    path: `/users/${encodeURIComponent(username)}/profile`,
    errorMessage: "Failed to fetch user profile",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw Object.assign(new Error("Failed to fetch user profile"), {
      status: response.status,
    });
  }

  const payload = (await response.json()) as { data?: AppUser | null };

  return payload.data ?? null;
}

async function readTenantContextResponse(
  response: Response,
): Promise<ServiceDeskSettingsTenantContext | null> {
  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw Object.assign(
      new Error("Failed to fetch Service Desk tenant context"),
      { status: response.status },
    );
  }

  return (await response.json()) as ServiceDeskSettingsTenantContext;
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
