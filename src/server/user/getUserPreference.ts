// src/server/user/getUserProfile.ts
import { defaultPreference, demoProfiles, tenantProfiles } from "@/domain/user";
import fetcher from "@/services/fetcher";
import { AuthUser, Preference } from "@/types";

export async function getUserPreference(
  authUser: AuthUser
): Promise<Preference> {
  // demo / tenant (LOCAL)
  if (authUser.dataScope === "LOCAL") {
    const profiles = [...demoProfiles, ...tenantProfiles];
    const profile = profiles.find((p) => p.id === authUser.id);

    if (!profile) {
      throw new Error("Profile not found");
    }

    return defaultPreference;
  }

  // remote backend
  const res = await fetcher.api.get<Preference>(
    `/user/${authUser.id}/preference`
  );
  return res.data;
}
