import { NextRequest } from "next/server";
import { getToken, JWT } from "next-auth/jwt";

import {
  ACCESS_LEVEL,
  AccessLevel,
  AuthUser,
  Role,
  UserScope,
} from "@/domain/auth";
import { isOwnerCompany } from "@/domain/organization";

/** Reads and verifies the server session JWT carried by the request. */
export async function getAuthToken(req: NextRequest) {
  return getToken({ req, secret: process.env.NEXTAUTH_SECRET });
}

/** Loads access token through the server data boundary. */
export async function getAccessToken(req: NextRequest) {
  const token = await getAuthToken(req);
  return token?.accessToken ?? null;
}

/** Reports whether remote request meets the server-side condition. */
export async function isRemoteRequest(req: NextRequest) {
  const token = await getAuthToken(req);
  return token?.dataScope === "REMOTE";
}

/** Reports whether internal user meets the server-side condition. */
export async function isInternalUser(req: NextRequest) {
  const token = await getAuthToken(req);
  return token?.userScope === "INTERNAL";
}

/** Reports whether owner company user meets the server-side condition. */
export async function isOwnerCompanyUser(req: NextRequest): Promise<boolean> {
  const token = await getAuthToken(req);
  return isOwnerCompany(token?.companyId);
}

/** Loads user access level through the server data boundary. */
export async function getUserAccessLevel(
  req: NextRequest,
): Promise<AccessLevel> {
  const token = await getAuthToken(req);
  return token ? token.permission : 0;
}

/** Loads user role through the server data boundary. */
export async function getUserRole(req: NextRequest): Promise<Role> {
  const token = await getAuthToken(req);
  return token?.role ?? "NONE";
}

/** Loads company id through the server data boundary. */
export async function getCompanyId(req: NextRequest): Promise<number> {
  const token = await getAuthToken(req);
  return token?.companyId ?? 0;
}

// Original identity is used for audit and account ownership. Current identity
// follows impersonation and is used for acting-user projections.
export async function getOriginalUserId(req: NextRequest) {
  const token = await getAuthToken(req);
  return token?.id ?? null;
}

/** Loads current user name through the server data boundary. */
export async function getCurrentUserName(req: NextRequest) {
  const token = await getAuthToken(req);
  return (
    token?.impersonation?.impersonatedUser.username ?? token?.username ?? null
  );
}

// Employee usernames bridge auth identity to Service Desk repository records.
// The current form follows impersonation; the original form never does.
export async function getOriginalEmployeeUserName(
  req: NextRequest,
): Promise<string | null> {
  const token = await getAuthToken(req);
  return resolveEmployeeUserName(token?.username);
}

/** Loads current employee user name through the server data boundary. */
export async function getCurrentEmployeeUserName(
  req: NextRequest,
): Promise<string | null> {
  const token = await getAuthToken(req);
  const impersonatedUserName = resolveEmployeeUserName(
    token?.impersonation?.impersonatedUser.username,
  );

  if (impersonatedUserName) {
    return impersonatedUserName;
  }

  return resolveEmployeeUserName(token?.username);
}

/** Describes the auth result returned across the server boundary. */
export type AuthResult =
  | { ok: true; token: JWT }
  | { ok: false; status: 401 | 403 };

type AdminCheckUser =
  | {
      role?: Role | null;
      permission?: number | null;
    }
  | null
  | undefined;

/** Reports whether admin meets the server-side condition. */
export function isAdmin(user: AdminCheckUser): boolean {
  if (!user) {
    return false;
  }

  // A populated role is the current authority. Permission remains only as a
  // compatibility fallback for older tokens that did not carry a role.
  if (user.role) {
    return user.role === "ADMIN";
  }

  return (
    typeof user.permission === "number" && user.permission >= ACCESS_LEVEL.ADMIN
  );
}

/** Rejects the request unless admin satisfies the server policy. */
export async function checkAdmin(req: NextRequest): Promise<AuthResult> {
  const token = await getAuthToken(req);

  if (!token) return { ok: false, status: 401 };
  if (!isAdmin(token)) return { ok: false, status: 403 };

  return { ok: true, token };
}

/** Converts token to original auth user to the representation required by this server boundary. */
export function tokenToOriginalAuthUser(token: JWT): AuthUser {
  return {
    ...token,
    email: token.email ?? "",
  };
}

/** Rejects the request unless admin or self satisfies the server policy. */
export async function checkAdminOrSelf(
  req: NextRequest,
  targetUserId: string,
): Promise<AuthResult> {
  const token = await getAuthToken(req);

  if (!token) return { ok: false, status: 401 };

  // Account-self checks intentionally use the authenticated account, not an
  // impersonated identity, so impersonation cannot grant account ownership.
  if (token.id !== targetUserId && !isAdmin(token)) {
    return { ok: false, status: 403 };
  }

  return { ok: true, token };
}

type ImpersonationPolicy = Record<UserScope, readonly UserScope[]>;

const IMPERSONATION_POLICY: ImpersonationPolicy = {
  INTERNAL: ["INTERNAL", "CLIENT"],
  CLIENT: [],
} as const;

/**
 * Applies the directional impersonation policy to the original user scope.
 * Client users cannot impersonate, while internal users may act within either
 * internal or client scope; the target profile is still resolved separately.
 */
export function canImpersonate(
  originalUserScope: UserScope,
  impersonatedUserScope: UserScope,
) {
  return IMPERSONATION_POLICY[originalUserScope]?.includes(
    impersonatedUserScope,
  );
}

function resolveEmployeeUserName(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();
  return normalizedValue.length > 0 ? normalizedValue : null;
}
