import type { NextRequest } from "next/server";

import { getAuthToken } from "@/app/api/_adapters/auth/requestAuth";
import type { Role, UserScope } from "@/domain/auth";
import {
  resolveDemoAuth,
  resolveDemoProfile,
} from "@/mocks/domain/user";
import { getUserProfileDtoByUsername } from "@/server/data/users";

/** Resolves the effective user's role, including impersonation. */
export async function getCurrentUserRole(req: NextRequest): Promise<Role> {
  const token = await getAuthToken(req);
  const currentUserName =
    token?.impersonation?.impersonatedUser.username ?? token?.username;

  if (!token || !currentUserName) {
    return "NONE";
  }

  if (token.dataScope === "LOCAL") {
    return resolveDemoAuth(currentUserName)?.role ?? "NONE";
  }

  const profile = await getUserProfileDtoByUsername(currentUserName);
  return profile?.role ?? "NONE";
}

/** Resolves the effective user's canonical scope, including impersonation. */
export async function getCurrentUserScope(
  req: NextRequest,
): Promise<UserScope | null> {
  const token = await getAuthToken(req);
  const currentUserName =
    token?.impersonation?.impersonatedUser.username ?? token?.username;

  if (!token || !currentUserName) {
    return null;
  }

  if (token.dataScope === "LOCAL") {
    return resolveDemoProfile(currentUserName)?.userScope ?? null;
  }

  const profile = await getUserProfileDtoByUsername(currentUserName);
  return profile?.userScope ?? null;
}
