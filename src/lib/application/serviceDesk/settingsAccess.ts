import { ACCESS_LEVEL, type AccessLevel, type UserScope } from "@/domain/auth";
import { isOwnerCompany } from "@/domain/organization";
import type { CategoryScope } from "@/domain/serviceDesk/category";

export type ServiceDeskAdminType = "OWNER_ADMIN" | "TENANT_ADMIN" | null;

export type ServiceDeskSettingsAccess = "manage" | "read" | "none";

export type ServiceDeskSettingsResource =
  | "TENANT"
  | "CATEGORY"
  | "APPROVAL_STEP"
  | "ASSIGNMENT_RULE";

export type ServiceDeskSettingsPrincipal = {
  permission: AccessLevel | number;
  userScope: UserScope;
  companyId: string | number;
};

export type ServiceDeskSettingsResourceContext = {
  resource: ServiceDeskSettingsResource;
  tenantCompanyId?: string | number;
  isOwnerTenant?: boolean;
  scope?: CategoryScope;
};

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

export function canReadServiceDeskSettings(
  access: ServiceDeskSettingsAccess,
) {
  return access === "read" || access === "manage";
}

export function canManageServiceDeskSettings(
  access: ServiceDeskSettingsAccess,
) {
  return access === "manage";
}
