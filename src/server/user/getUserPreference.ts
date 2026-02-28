// src/server/user/getUserProfile.ts
import client from "@/api/client";
import { demoProfiles, tenantProfiles } from "@/app/_mocks/user";
import { AuthUser } from "@/domain/auth";
import { Preference } from "@/domain/config";
import { createDefaultPreference } from "@/domain/user/preference";

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
  const res = await client.api.get<Preference>(
    `/users/${authUser.id}/preference`,
  );
  return res.data;
}
