import { NextRequest } from "next/server";
import { getToken, JWT } from "next-auth/jwt";

import { ACCESS_LEVEL, AuthUser, Role, UserScope } from "@/domain/auth";

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

export async function getCompanyId(req: NextRequest) {
  const token = await getAuthToken(req);

  return token ? resolveCompanyId(token) : null;
}

// UserId helpers resolve auth/account identity from JWT.
export async function getOriginalUserId(req: NextRequest) {
  const token = await getAuthToken(req);
  return token?.id ?? null;
}

export async function getImpersonatedUserId(req: NextRequest) {
  const token = await getAuthToken(req);
  return token?.impersonation?.impersonatedUserId ?? null;
}

export async function getCurrentUserId(req: NextRequest) {
  const token = await getAuthToken(req);
  return token?.impersonation?.impersonatedUserId ?? token?.id ?? null;
}

// EmployeeId helpers resolve employee domain identity from JWT.
export async function getOriginalEmployeeId(
  req: NextRequest,
): Promise<number | null> {
  const token = await getAuthToken(req);
  return resolveEmployeeId(token?.employeeId);
}

export async function getCurrentEmployeeId(
  req: NextRequest,
): Promise<number | null> {
  const token = await getAuthToken(req);
  const impersonatedEmployeeId = (
    token?.impersonation as { impersonatedEmployeeId?: unknown } | undefined
  )?.impersonatedEmployeeId;

  // Current impersonation metadata is user-id based.
  // If employee metadata is not present, fall back to the original JWT employeeId.
  return resolveEmployeeId(impersonatedEmployeeId ?? token?.employeeId);
}

export async function getUserRole(req: NextRequest): Promise<Role | null> {
  const token = await getAuthToken(req);
  return token?.role ?? null;
}

export type AuthResult =
  | { ok: true; token: JWT }
  | { ok: false; status: 401 | 403 };

export function tokenToOriginalAuthUser(token: JWT): AuthUser {
  return {
    ...token,
    employeeId: resolveEmployeeId(token.employeeId),
    email: token.email ?? "",
    companyId: resolveCompanyId(token),
  };
}

export async function checkAdminOrSelf(
  req: NextRequest,
  targetUserId: string,
): Promise<AuthResult> {
  const token = await getAuthToken(req);

  if (!token) return { ok: false, status: 401 };

  if (token.id !== targetUserId && token.permission < ACCESS_LEVEL.ADMIN) {
    return { ok: false, status: 403 };
  }

  return { ok: true, token };
}

type ImpersonationPolicy = Record<UserScope, readonly UserScope[]>;

const IMPERSONATION_POLICY: ImpersonationPolicy = {
  INTERNAL: ["CLIENT"], // from INTERNAL to [].
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

function resolveCompanyId(token: {
  companyId?: string;
  clientId?: string | null;
}) {
  return token.companyId ?? token.clientId ?? "";
}

function resolveEmployeeId(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}
