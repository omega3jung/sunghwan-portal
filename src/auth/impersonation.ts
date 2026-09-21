import { z } from "zod";

import type { AuthUser, ImpersonationInfo } from "@/domain/auth";
import { resolveDemoAuth } from "@/mocks/domain/user";
import { canImpersonate, isAdmin } from "@/server/portalApi/auth/requestAuth";

import { authApiJson } from "./api";

const targetSchema = z.object({
  username: z.string().trim().min(1),
  permission: z.union([
    z.literal(0),
    z.literal(1),
    z.literal(3),
    z.literal(5),
    z.literal(7),
    z.literal(9),
  ]),
  userScope: z.enum(["INTERNAL", "CLIENT"]),
});

/** Validates impersonation again at the JWT write boundary, using only trusted identities. */
export async function resolveAuthorizedImpersonation(
  originalUser: AuthUser,
  requestedUsername: unknown,
): Promise<ImpersonationInfo> {
  if (!originalUser.id) {
    throw authError("Unauthorized", 401);
  }
  if (!isAdmin(originalUser) || originalUser.userScope !== "INTERNAL") {
    throw authError("Forbidden", 403);
  }

  const username = z.string().trim().min(1).safeParse(requestedUsername);
  if (!username.success) {
    throw authError("INVALID_REQUEST", 400);
  }

  let target: z.infer<typeof targetSchema> | null;
  if (originalUser.dataScope === "LOCAL") {
    target = resolveDemoAuth(username.data);
  } else {
    const response = await authApiJson({
      method: "GET",
      path: `/auth/impersonation/${encodeURIComponent(username.data)}`,
      errorMessage: "Failed to fetch impersonation target",
    });
    if (!response.ok) {
      if (response.status === 404) {
        throw authError("IMPERSONATED_USER_NOT_FOUND", 404);
      }
      if (response.status === 401) {
        throw authError("REMOTE_AUTH_UNAUTHORIZED", 401);
      }
      throw authError("Internal Server Error", 500);
    }
    const parsed = z
      .object({ data: targetSchema.nullish() })
      .safeParse(await response.json());
    if (!parsed.success) {
      throw authError("Internal Server Error", 500);
    }
    target = parsed.data.data ?? null;
  }

  if (!target) {
    throw authError("IMPERSONATED_USER_NOT_FOUND", 404);
  }
  if (
    originalUser.username.trim().toLowerCase() ===
    target.username.trim().toLowerCase()
  ) {
    throw authError("CANNOT_IMPERSONATE_SELF", 400);
  }
  if (target.permission >= originalUser.permission) {
    throw authError("CANNOT_IMPERSONATE_EQUAL_OR_HIGHER_PERMISSION", 403);
  }
  if (!canImpersonate(originalUser.userScope, target.userScope)) {
    throw authError("FORBIDDEN_IMPERSONATED_USER", 403);
  }

  return {
    originalUser: { id: originalUser.id, username: originalUser.username },
    impersonatedUser: { username: target.username },
    activatedAt: Date.now(),
  };
}

function authError(message: string, status: number) {
  return Object.assign(new Error(message), { status });
}
