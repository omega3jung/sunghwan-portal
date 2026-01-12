// src/server/user/getUserProfile.ts
import { demoProfiles, tenantProfiles } from "@/domain/user";
import fetcher from "@/services/fetcher";
import { AppUser, AuthUser } from "@/types";

export async function getUserProfile(
  authUser: AuthUser
): Promise<Partial<AppUser>> {
  // demo / tenant (LOCAL)
  if (authUser.dataScope === "LOCAL") {
    const profiles = [...demoProfiles, ...tenantProfiles];
    const profile = profiles.find((p) => p.id === authUser.id);

    if (!profile) {
      throw new Error("Profile not found");
    }

    return profile;
  }

  // remote backend
  const res = await fetcher.api.get<Partial<AppUser>>(
    `/user/${authUser.id}/profile`
  );
  return res.data;
}
