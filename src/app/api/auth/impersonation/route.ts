import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  canImpersonate,
  getAuthToken,
  isAdmin,
  tokenToOriginalAuthUser,
} from "@/app/api/_adapters";
import { getLocalImpersonationTarget } from "@/app/api/_adapters/localDemo/user";
import { AuthUser } from "@/domain/auth";

import { authApiJson } from "@/auth/api";

const requestSchema = z.object({
  impersonatedUsername: z.string().trim().min(1),
});

export async function POST(req: NextRequest) {
  const token = await getAuthToken(req);

  // 1. check permission.
  if (!token?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAdmin(token)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const originalUser = tokenToOriginalAuthUser(token);

  try {
    const { impersonatedUsername } = requestSchema.parse(await req.json());

    // 2-a. client demo impersonation.
    if (originalUser.dataScope === "LOCAL") {
      // 3-a. search impersonated user.
      const demoAuth = getLocalImpersonationTarget(impersonatedUsername);

      // 4-a. validate and return response.
      return validateAuth(originalUser, demoAuth);
    }

    // 2-b. real impersonation.

    // 3-b. search impersonated user.
    const response = await authApiJson({
      method: "GET",
      path: `/auth/impersonation/${impersonatedUsername}`,
      errorMessage: "Failed to fetch impersonation target",
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "IMPERSONATED_USER_NOT_FOUND" },
          { status: 404 },
        );
      }

      if (response.status === 401) {
        return NextResponse.json(
          { error: "REMOTE_AUTH_UNAUTHORIZED" },
          { status: 401 },
        );
      }

      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }

    const payload = (await response.json()) as {
      data?: AuthUser | null;
    };
    const remoteAuth = payload.data ?? null;

    // 4-b. validate and return response.
    return validateAuth(originalUser, remoteAuth);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  const token = await getAuthToken(req);

  if (!token?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Stopping impersonation only requires an authenticated session.
  // The client applies the actual NextAuth session update.

  // NextAuth session update trigger
  return NextResponse.json({ impersonation: null });
}

function validateAuth(
  originalUser: AuthUser,
  targetUser: AuthUser | null,
): NextResponse {
  if (!targetUser) {
    return NextResponse.json(
      { error: "IMPERSONATED_USER_NOT_FOUND" },
      { status: 404 },
    );
  }

  if (
    originalUser.id === targetUser.id ||
    originalUser.username === targetUser.username
  ) {
    return NextResponse.json(
      { error: "CANNOT_IMPERSONATE_SELF" },
      { status: 400 },
    );
  }

  if (targetUser.permission > originalUser.permission) {
    return NextResponse.json(
      { error: "CANNOT_IMPERSONATE_EQUAL_OR_HIGHER_PERMISSION" },
      { status: 403 },
    );
  }

  if (!canImpersonate(originalUser.userScope, targetUser.userScope)) {
    return NextResponse.json(
      { error: "FORBIDDEN_IMPERSONATED_USER" },
      { status: 403 },
    );
  }

  return NextResponse.json({
    impersonation: {
      originalUser: {
        id: originalUser.id,
        username: originalUser.username,
      },
      impersonatedUser: {
        id: targetUser.id,
        username: targetUser.username,
      },
      activatedAt: Date.now(),
    },
  });
}
