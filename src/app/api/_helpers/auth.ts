import { NextRequest } from "next/server";
import { getToken, JWT } from "next-auth/jwt";

import { ACCESS_LEVEL, AuthUser, UserScope } from "@/types";

export async function isRemoteRequest(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  return token?.dataScope === "REMOTE";
}

export async function getEffectiveUserId(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  return token?.id;
}

export async function getActorUserId(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  return token?.impersonation?.actorId;
}

export async function getSubjectUserId(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  return token?.impersonation?.subjectId;
}

export type AuthResult =
  | { ok: true; token: JWT }
  | { ok: false; status: 401 | 403 };

export function tokenToAuthUser(token: JWT): AuthUser {
  return { ...token };
}

export async function checkAdminOrSelf(
  req: NextRequest,
  targetUserId: string
): Promise<AuthResult> {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) return { ok: false, status: 401 };

  if (token.id !== targetUserId && token.permission < ACCESS_LEVEL.ADMIN) {
    return { ok: false, status: 403 };
  }

  return { ok: true, token };
}

type ImpersonationPolicy = Record<UserScope, readonly UserScope[]>;

const IMPERSONATION_POLICY: ImpersonationPolicy = {
  INTERNAL: ["TENANT"], // from INTERNAL to [].
  TENANT: [], // from TENANT to [].
} as const;

export function canImpersonate(actorScope: UserScope, subjectScope: UserScope) {
  return IMPERSONATION_POLICY[actorScope]?.includes(subjectScope);
}
