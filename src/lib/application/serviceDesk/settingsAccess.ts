import { ACCESS_LEVEL, type AccessLevel, type UserScope } from "@/domain/auth";
import { isOwnerCompany } from "@/domain/organization";
import type { CategoryScope } from "@/domain/serviceDesk/category";

/** Represents service desk admin type within shared Service Desk policy. */
export type ServiceDeskAdminType = "OWNER_ADMIN" | "TENANT_ADMIN" | null;

/** Represents service desk settings access within shared Service Desk policy. */
export type ServiceDeskSettingsAccess = "manage" | "read" | "none";

/** Represents service desk settings resource within shared Service Desk policy. */
export type ServiceDeskSettingsResource =
  | "TENANT"
  | "CATEGORY"
  | "APPROVAL_STEP"
  | "ASSIGNMENT_RULE";

/** Represents service desk settings principal within shared Service Desk policy. */
export type ServiceDeskSettingsPrincipal = {
  permission: AccessLevel | number;
  userScope: UserScope;
  companyId: string | number;
};

/** Represents service desk settings resource context within shared Service Desk policy. */
export type ServiceDeskSettingsResourceContext = {
  resource: ServiceDeskSettingsResource;
  tenantCompanyId?: string | number;
  isOwnerTenant?: boolean;
  scope?: CategoryScope;
};

/**
 * Classifies an authenticated application user for settings policy evaluation.
 *
 * Admin permission is necessary but not sufficient: owner-company membership
 * determines whether the principal is an owner or tenant administrator.
 */
export function getServiceDeskAdminType(
  user:
    | Pick<ServiceDeskSettingsPrincipal, "permission" | "companyId">
    | null
    | undefined,
): ServiceDeskAdminType {
  if (!user || user.permission < ACCESS_LEVEL.ADMIN) {
    return null;
  }

  return isOwnerCompany(user.companyId) ? "OWNER_ADMIN" : "TENANT_ADMIN";
}

/**
 * Resolves the read/manage capability for one tenant-scoped settings resource.
 *
 * Missing relationship context fails closed. Owner Tenant, customer Tenant,
 * INTERNAL/PORTAL scope, and resource type deliberately have different policy
 * matrices; a client-visible tenant ID alone is never sufficient authority.
 */
export function resolveSettingsAccess(
  principal: ServiceDeskSettingsPrincipal | null | undefined,
  context: ServiceDeskSettingsResourceContext,
): ServiceDeskSettingsAccess {
  const adminType = getServiceDeskAdminType(principal);

  if (!principal || !adminType) {
    return "none";
  }

  if (context.resource === "TENANT") {
    return adminType === "OWNER_ADMIN" ? "manage" : "none";
  }

  if (
    context.tenantCompanyId === undefined ||
    context.isOwnerTenant === undefined ||
    context.scope === undefined
  ) {
    return "none";
  }

  if (context.isOwnerTenant) {
    return adminType === "OWNER_ADMIN" ? "manage" : "none";
  }

  const isTenantCompanyAdmin =
    adminType === "TENANT_ADMIN" &&
    String(principal.companyId) === String(context.tenantCompanyId);

  if (context.scope === "INTERNAL") {
    return isTenantCompanyAdmin ? "manage" : "none";
  }

  switch (context.resource) {
    case "CATEGORY":
      return adminType === "OWNER_ADMIN"
        ? "manage"
        : isTenantCompanyAdmin
          ? "read"
          : "none";
    case "APPROVAL_STEP":
      return adminType === "OWNER_ADMIN"
        ? "read"
        : isTenantCompanyAdmin
          ? "manage"
          : "none";
    case "ASSIGNMENT_RULE":
      return adminType === "OWNER_ADMIN"
        ? "manage"
        : isTenantCompanyAdmin
          ? "read"
          : "none";
  }
}

/** Returns whether read service desk settings applies in shared Service Desk policy. */
export function canReadServiceDeskSettings(
  access: ServiceDeskSettingsAccess,
) {
  return access === "read" || access === "manage";
}

/** Returns whether manage service desk settings applies in shared Service Desk policy. */
export function canManageServiceDeskSettings(
  access: ServiceDeskSettingsAccess,
) {
  return access === "manage";
}
