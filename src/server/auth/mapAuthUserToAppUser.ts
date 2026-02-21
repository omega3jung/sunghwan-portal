import { AuthUser } from "@/domain/auth";
import { AppUser } from "@/domain/user";

export function mapAuthUserToAppUser(auth: AuthUser): AppUser {
  return {
    id: auth.id,
    username: auth.username,
    displayName: auth.displayName,
    email: auth.email ?? null,

    userScope: auth.userScope,
    tenantId: auth.tenantId,

    permission: auth.permission,
    role: auth.role,

    canUseSuperUser: null,
    canUseImpersonation: null,
  };
}
