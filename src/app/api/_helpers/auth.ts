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
import { resolveDemoAuth, resolveDemoProfile } from "@/mocks/domain/user";
import { getUserProfileDtoByUsername } from "@/server/data/users";

export async function getAuthToken(req: NextRequest) {
  return getToken({ req, secret: process.env.NEXTAUTH_SECRET });
}

export async function getAccessToken(req: NextRequest) {
  const token = await getAuthToken(req);
  return token?.accessToken ?? null;
}

export async function isRemoteRequest(req: NextRequest) {
  const token = await getAuthToken(req);
  return token?.dataScope === "REMOTE";
}

export async function isInternalUser(req: NextRequest) {
  const token = await getAuthToken(req);
  return token?.userScope === "INTERNAL";
}

export async function isOwnerCompanyUser(req: NextRequest): Promise<boolean> {
  const token = await getAuthToken(req);
  return isOwnerCompany(token?.companyId);
}

export async function getUserAccessLevel(
  req: NextRequest,
): Promise<AccessLevel> {
  const token = await getAuthToken(req);
  return token ? token.permission : 0;
}

export async function getUserRole(req: NextRequest): Promise<Role> {
  const token = await getAuthToken(req);
  return token?.role ?? "NONE";
}

export async function getCompanyId(req: NextRequest): Promise<number> {
  const token = await getAuthToken(req);
  return token?.companyId ?? 0;
}

/**
 * Resolves the role of the user currently acting in the application.
 *
 * Unlike getUserRole, this follows the effective username during
 * impersonation and reloads its server-trusted profile. Operational
 * authorization must not inherit the original user's role.
 */
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

/** Resolves the effective user's canonical scope during impersonation. */
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

// UserId helpers resolve auth/account identity from JWT.
export async function getOriginalUserId(req: NextRequest) {
  const token = await getAuthToken(req);
  return token?.id ?? null;
}

export async function getImpersonatedUserId(req: NextRequest) {
  const token = await getAuthToken(req);
  return token?.impersonation?.impersonatedUser.id ?? null;
}

export async function getCurrentUserId(req: NextRequest) {
  const token = await getAuthToken(req);
  return token?.impersonation?.impersonatedUser.id ?? token?.id ?? null;
}

export async function getCurrentUserName(req: NextRequest) {
  const token = await getAuthToken(req);
  return (
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

export async function checkAdmin(req: NextRequest): Promise<AuthResult> {
  const token = await getAuthToken(req);

  if (!token) return { ok: false, status: 401 };
  if (!isAdmin(token)) return { ok: false, status: 403 };

  return { ok: true, token };
}

export function tokenToOriginalAuthUser(token: JWT): AuthUser {
  return {
    ...token,
    email: token.email ?? "",
  };
}

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
