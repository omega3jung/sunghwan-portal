// src/server/auth/mapAuthUserToAppUser.ts
import { AppUser, AuthUser } from "@/types";

export function mapAuthUserToAppUser(auth: AuthUser): AppUser {
  return {
    id: auth.id,
    name: auth.name,
    email: auth.email ?? null,

    userScope: auth.userScope,
    tenantId: auth.tenantId,

    permission: auth.permission,
    role: auth.role,

    preference: null,

    canUseSuperUser: null,
    canUseImpersonation: null,
  };
}
