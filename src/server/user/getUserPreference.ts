// src/server/user/getUserProfile.ts
import { AuthUser } from "@/domain/auth";
import { Preference } from "@/domain/config";
import { createDefaultPreference } from "@/domain/user/preference";
import client from "@/lib/api";
import { clientProfiles, demoProfiles } from "@/mocks/domain/user";

export async function getUserPreference(
  authUser: AuthUser,
): Promise<Preference> {
  // demo / client (LOCAL)
  if (authUser.dataScope === "LOCAL") {
    const profiles = [...demoProfiles, ...clientProfiles];
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
