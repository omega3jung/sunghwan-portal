// src/server/auth/mapAuthUserToAppUser.ts
import { AppUser, AuthUser } from "@/types";
import { normalizeNullable } from "@/utils";

export function mapAuthUserToAppUser(
  auth: AuthUser,
  extra: Partial<AppUser>
): AppUser {
  return normalizeNullable(
    {
      ...auth,
      ...extra,
    },
    ["image", "preference", "canUseSuperUser", "canUseImpersonation"] as const
  ) as AppUser;
}
