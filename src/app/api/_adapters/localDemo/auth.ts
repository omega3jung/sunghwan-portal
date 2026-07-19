import type { NextRequest } from "next/server";

import { getAuthToken } from "@/app/api/_adapters/auth/requestAuth";
import type { Role, UserScope } from "@/domain/auth";
import { resolveDemoAuth } from "@/mocks/domain/user";

/** Resolves the effective local demo user's role, including impersonation. */
export async function getCurrentLocalUserRole(
  request: NextRequest,
): Promise<Role> {
  return (await resolveCurrentLocalAuth(request))?.role ?? "NONE";
}

/** Resolves the effective local demo user's scope, including impersonation. */
export async function getCurrentLocalUserScope(
  request: NextRequest,
): Promise<UserScope | null> {
  return (await resolveCurrentLocalAuth(request))?.userScope ?? null;
}

/** Resolves whether the effective local demo user belongs to the internal scope. */
export async function isCurrentLocalUserInternal(
  request: NextRequest,
): Promise<boolean | null> {
  const scope = await getCurrentLocalUserScope(request);
  return scope === null ? null : scope === "INTERNAL";
}

async function resolveCurrentLocalAuth(request: NextRequest) {
  const token = await getAuthToken(request);
  const currentUserName =
    token?.impersonation?.impersonatedUser.username ?? token?.username;

  if (!token || token.dataScope !== "LOCAL" || !currentUserName) {
    return null;
  }

  return resolveDemoAuth(currentUserName);
}
