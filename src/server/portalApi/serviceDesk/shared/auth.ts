import { NextRequest } from "next/server";
import type { Session } from "next-auth";

import type { DataScope } from "@/domain/auth";
import { type CategoryScope } from "@/domain/serviceDesk";
import type { AppUser } from "@/domain/user";
import {
  canManageServiceDeskSettings,
  canReadServiceDeskSettings,
  getServiceDeskAdminType,
  resolveSettingsAccess,
  type ServiceDeskSettingsResource,
} from "@/lib/application/serviceDesk";
import {
  getServiceDeskSettingsTenantContext,
  getServiceDeskSettingsTenantContextByCompanyId,
  type ServiceDeskSettingsTenantContext,
} from "@/server/data/serviceDesk/tenant";
import { getUserProfileDtoByUsername } from "@/server/data/users";
import { getAuthToken } from "@/server/portalApi/auth";

/** Captures the authenticated principal and scope used to authorize settings operations. */
export type ServiceDeskSettingsPrincipalContext = {
  principal: AppUser;
  dataScope: DataScope;
  originalUsername: string;
  effectiveUsername: string;
};

/**
 * Resolves both audit and acting identities from the signed auth token.
 *
 * `originalUsername` identifies the authenticated account, while
 * `effectiveUsername` follows an authorized impersonation. Authorization uses
 * a canonical server-side AppUser profile for the effective identity instead
 * of trusting role or organization fields submitted by the browser.
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

/** Builds the Service Desk authorization context from the server session and rejects unauthenticated requests. */
export async function resolveServiceDeskRequestContextFromSession(
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
  principalContext,
  requestedTenantId,
  requestedScope,
}: {
  principalContext: ServiceDeskSettingsPrincipalContext;
  requestedTenantId?: string | number | null;
  requestedScope?: CategoryScope | null;
}) {
  const { principal } = principalContext;
  const ownTenant = await getServiceDeskSettingsTenantContextByCompanyId(
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
      : await getServiceDeskSettingsTenantContext(requestedTenantId);

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

/**
 * Selects the settings tenant within the administrator's allowed boundary.
 * Tenant administrators are locked to their own company; provider system
 * administrators may select a target tenant explicitly.
 */
export async function resolveAuthorizedSettingsTenant({
  request,
  requestedTenantId,
}: {
  request: NextRequest;
  requestedTenantId?: string | number | null;
}) {
  const principalContext =
    await resolveServiceDeskSettingsAdminContext(request);
  const { adminType, principal } = principalContext;

  if (adminType === "TENANT_ADMIN") {
    const ownTenant = await getServiceDeskSettingsTenantContextByCompanyId(
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

  const tenant = await getServiceDeskSettingsTenantContext(requestedTenantId);

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
 * Enforces resource-level settings policy after resolving tenant ownership.
 *
 * The decision combines principal type, tenant relationship, category scope,
 * and read-versus-manage intent. Route handlers should use the returned tenant
 * and access projection rather than reinterpreting client-supplied identifiers.
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

/** Creates an authorization error whose status is preserved by the portal API adapter. */
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
  username: string,
  _dataScope: DataScope,
): Promise<AppUser | null> {
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
