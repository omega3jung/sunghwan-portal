// src/server/user/getUserProfile.ts
import { demoProfiles, tenantProfiles } from "@/app/_mocks/user";
import { AuthUser } from "@/domain/auth";
import { Preference } from "@/domain/config";
import { createDefaultPreference } from "@/domain/preference";
import fetcher from "@/services/fetcher";

export async function getUserPreference(
  authUser: AuthUser,
): Promise<Preference> {
  // demo / tenant (LOCAL)
  if (authUser.dataScope === "LOCAL") {
    const profiles = [...demoProfiles, ...tenantProfiles];
    const profile = profiles.find((p) => p.id === authUser.id);

    if (!profile) {
      throw new Error("Profile not found");
    }

    return createDefaultPreference();
  }

  // remote backend
  const res = await fetcher.api.get<Preference>(
    `/user/${authUser.id}/preference`,
  );
  return res.data;
}
