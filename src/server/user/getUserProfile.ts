// src/server/user/getUserProfile.ts
import client from "@/api/client";
import { clientProfiles, demoProfiles } from "@/app/_mocks/domain/user";
import { AuthUser } from "@/domain/auth";
import { AppUser } from "@/domain/user";

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
