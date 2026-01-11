// src/server/auth/getAppUser.ts
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth.config";
import { AuthUser } from "@/types";

import { withPreference, withProfile } from "./enhancers";
import { mapAuthUserToAppUser } from "./mapAuthUserToAppUser";

// permission needs profile. it should be after profile.
const enhancers = [withProfile, withPreference];

export async function getAppUser() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const authUser = session.user as AuthUser;

  let user = mapAuthUserToAppUser(authUser, {});

  for (const enhance of enhancers) {
    user = await enhance(authUser, user);
  }

  return user;
}
