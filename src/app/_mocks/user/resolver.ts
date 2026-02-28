import { AuthUser } from "@/domain/auth";
import { AppUser } from "@/domain/user";

import { internalAuths, internalProfiles } from "./data.internal";
import { tenantAuths, tenantProfiles } from "./data.tenant";

export function resolveInternalAuth(
  id: string,
): Omit<AuthUser, "dataScope"> | null {
  return internalAuths.find((u) => u.id === id) ?? null;
}

export function resolveInternalProfile(id: string): AppUser | null {
  return internalProfiles.find((u) => u.id === id) ?? null;
}

export function resolveTenantAuth(
  id: string,
): Omit<AuthUser, "dataScope"> | null {
  return tenantAuths.find((u) => u.id === id) ?? null;
}

export function resolveTenantProfile(id: string): AppUser | null {
  return tenantProfiles.find((u) => u.id === id) ?? null;
}
