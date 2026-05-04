import { getServerSession } from "next-auth";

import { authOptions } from "@/auth.config";
import { AuthUser } from "@/domain/auth";

import { withProfile } from "./enhancers";
import { mapAuthUserToAppUser } from "./mapAuthUserToAppUser";

const enhancers = [withProfile];

function resolveCurrentAuthUser(
  authUser: AuthUser,
  impersonation?: {
    impersonatedUserId: string;
  },
): AuthUser {
  if (!impersonation?.impersonatedUserId) {
    return authUser;
  }

  return {
    ...authUser,
    id: impersonation.impersonatedUserId,
  };
}

export async function getCurrentAppUser() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  // `session.user` is the original authenticated projection.
  // The current app user may switch to the impersonated user.
  const originalAuthUser = session.user as AuthUser;
  const currentAuthUser = resolveCurrentAuthUser(
    originalAuthUser,
    session.impersonation,
  );

  let user = mapAuthUserToAppUser(currentAuthUser);

  for (const enhance of enhancers) {
    const patch = await enhance(currentAuthUser, user);
    user = { ...user, ...patch };
  }

  return user;
}
