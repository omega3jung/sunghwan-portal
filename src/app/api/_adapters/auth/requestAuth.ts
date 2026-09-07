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

/** Reads the server session token once so route adapters can derive effective and original identity consistently. */
export async function getAuthToken(req: NextRequest) {
  return getToken({ req, secret: process.env.NEXTAUTH_SECRET });
}

/** Returns the access token from the server-only Auth.js session token. */
export async function getAccessToken(req: NextRequest) {
  const token = await getAuthToken(req);
  return resolveNonEmptyString(token?.accessToken);
}

/** Selects the configured remote backend only when the session carries a remote access token. */
export async function isRemoteRequest(req: NextRequest) {
  const token = await getAuthToken(req);
  return token?.dataScope === "REMOTE";
}

/** Reports whether the original authenticated user belongs to the internal access scope. */
export async function isInternalUser(req: NextRequest) {
  const token = await getAuthToken(req);
  return token?.userScope === "INTERNAL";
}

/** Reports whether the original user belongs to the portal owner company. */
export async function isOwnerCompanyUser(req: NextRequest): Promise<boolean> {
  const token = await getAuthToken(req);
  return isOwnerCompany(token?.companyId);
}

/** Loads user access level through the server data boundary. */
export async function getUserAccessLevel(
  req: NextRequest,
): Promise<AccessLevel> {
  const token = await getAuthToken(req);
  const permission = token?.permission;

  return typeof permission === "number" &&
    Object.values(ACCESS_LEVEL).includes(permission as AccessLevel)
    ? (permission as AccessLevel)
    : ACCESS_LEVEL.NONE;
}

/** Loads user role through the server data boundary. */
export async function getUserRole(req: NextRequest): Promise<Role> {
  const token = await getAuthToken(req);
  const role = token?.role;

  return typeof role === "string" && role in ACCESS_LEVEL
    ? (role as Role)
    : "NONE";
}

/** Loads company id through the server data boundary. */
export async function getCompanyId(req: NextRequest): Promise<number> {
  const token = await getAuthToken(req);
  const companyId = token?.companyId;

  return typeof companyId === "number" &&
    Number.isSafeInteger(companyId) &&
    companyId > 0
    ? companyId
    : 0;
}

// UserId helpers resolve auth/account identity from JWT.
export async function getOriginalUserId(req: NextRequest) {
  const token = await getAuthToken(req);
  return resolveNonEmptyString(token?.id);
}

/** Returns the effective username, including an authorized impersonation target when present. */
export async function getCurrentUserName(req: NextRequest) {
  const token = await getAuthToken(req);
  return resolveNonEmptyString(
    token?.impersonation?.impersonatedUser.username ?? token?.username ?? null
  );
}

// Employee username helpers resolve employee app identity from JWT/session.
export async function getOriginalEmployeeUserName(
  req: NextRequest,
): Promise<string | null> {
  const token = await getAuthToken(req);
  return resolveEmployeeUserName(token?.username);
}

/** Resolves the effective employee username used by organization and ticket APIs. */
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
export type AuthFailure =
  | { ok: false; status: 401 }
  | { ok: false; status: 403 };

export type AuthResult =
  | { ok: true; token: JWT }
  | AuthFailure;

/** Describes the effective account username required by account-scoped routes. */
export type CurrentUserNameResult =
  | { ok: true; username: string }
  | Extract<AuthFailure, { status: 401 }>;

/** Requires an effective account username without coupling authentication to an HTTP response. */
export async function requireCurrentUserName(
  req: NextRequest,
): Promise<CurrentUserNameResult> {
  const username = await getCurrentUserName(req);

  return username
    ? { ok: true, username }
    : { ok: false, status: 401 };
}

type AdminCheckUser =
  | {
      role?: Role | null;
      permission?: number | null;
    }
  | null
  | undefined;

/** Checks the token role against the administrator roles accepted by route policies. */
export function isAdmin(user: AdminCheckUser): boolean {
  if (!user) {
    return false;
  }

  if (user.role) {
    return user.role === "ADMIN";
  }

  return (
    typeof user.permission === "number" && user.permission >= ACCESS_LEVEL.ADMIN
  );
}

/** Returns the authenticated administrator or a route-ready authorization response. */
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

/** Authorizes user-scoped routes only for administrators or the effective user themself. */
export async function checkAdminOrSelf(
  req: NextRequest,
  targetUserId: string,
): Promise<AuthResult> {
  const token = await getAuthToken(req);

  if (!token) return { ok: false, status: 401 };

  if (token.id !== targetUserId && !isAdmin(token)) {
    return { ok: false, status: 403 };
  }

  return { ok: true, token };
}

type ImpersonationPolicy = Record<UserScope, readonly UserScope[]>;

const IMPERSONATION_POLICY: ImpersonationPolicy = {
  INTERNAL: ["INTERNAL", "CLIENT"], // from INTERNAL to [].
  CLIENT: [], // from CLIENT to [].
} as const;

/** Applies the explicit role-pair policy that controls which accounts may impersonate another user. */
export function canImpersonate(
  originalUserScope: UserScope,
  impersonatedUserScope: UserScope,
) {
  return IMPERSONATION_POLICY[originalUserScope]?.includes(
    impersonatedUserScope,
  );
}

function resolveEmployeeUserName(value: unknown): string | null {
  return resolveNonEmptyString(value);
}

function resolveNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();
  return normalizedValue.length > 0 ? normalizedValue : null;
}
