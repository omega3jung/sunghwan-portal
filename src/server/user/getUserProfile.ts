// src/server/user/getUserProfile.ts
import { AuthUser } from "@/domain/auth";
import { AppUser } from "@/domain/user";
import client from "@/lib/api";
import { clientProfiles, demoProfiles } from "@/mocks/domain/user";

export async function getUserProfile(
  authUser: AuthUser,
): Promise<Partial<AppUser>> {
  // demo / client (LOCAL)
  if (authUser.dataScope === "LOCAL") {
    const profiles = [...demoProfiles, ...clientProfiles];
    const profile = profiles.find((p) => p.id === authUser.id);

    if (!profile) {
      throw new Error("Profile not found");
    }

    return profile;
  }

  // remote backend
  const res = await client.api.get<Partial<AppUser>>(
    `/users/${authUser.id}/profile`,
  );
  return res.data;
}
