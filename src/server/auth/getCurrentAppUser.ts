import { headers } from "next/headers";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth.config";
import { AppUser } from "@/domain/user";
import { portalApiJson } from "@/lib/api/portalApiJson";
import { resolveDemoProfile } from "@/mocks/domain/user";

/**
 * Resolves the current effective AppUser from session/JWT context.
 *
 * LOCAL demo users are resolved directly here.
 * REMOTE users are resolved through the portal API boundary.
 *
 * This is an auth-context resolver, not a portal API route handler.
 */

function resolveEffectiveUserId(
  sessionUserId: string,
  impersonation?: {
    impersonatedUserId: string;
  },
) {
  return impersonation?.impersonatedUserId ?? sessionUserId;
}

export async function getCurrentAppUser(
  request?: NextRequest,
): Promise<AppUser | null> {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const effectiveUserId = resolveEffectiveUserId(
    session.user.id,
    session.impersonation,
  );

  if (session.user.dataScope === "LOCAL") {
    return resolveDemoProfile(effectiveUserId);
  }

  const requestForPortalApi = request ?? createRequestFromServerHeaders();

  const response = await portalApiJson(requestForPortalApi, {
    method: "GET",
    path: `/users/${effectiveUserId}/profile`,
    errorMessage: "Failed to fetch current user profile",
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as AppUser;
  return payload;
}

function createRequestFromServerHeaders() {
  const requestHeaders = new Headers();
  const sourceHeaders = headers();

  sourceHeaders.forEach((value, key) => {
    requestHeaders.set(key, value);
  });

  const host = sourceHeaders.get("host") ?? "localhost";
  const protocol = sourceHeaders.get("x-forwarded-proto") ?? "http";

  return new NextRequest(`${protocol}://${host}/api/users/me`, {
    headers: requestHeaders,
  });
}
