import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  canImpersonate,
  getAuthToken,
  isAdmin,
  tokenToOriginalAuthUser,
} from "@/app/api/_adapters";
import { getLocalImpersonationTarget } from "@/app/api/_adapters/localDemo/user";
import { authApiJson } from "@/auth/api";
import { AuthUser } from "@/domain/auth";

const requestSchema = z.object({
  impersonatedUsername: z.string().trim().min(1),
});

const impersonationTargetSchema = z.object({
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

const authResponseSchema = z.object({
  data: impersonationTargetSchema.nullish(),
});

type ImpersonationTarget = z.infer<typeof impersonationTargetSchema>;

/** Handles POST /api/auth/impersonation; authorization and runtime adapter selection remain at this HTTP boundary. */
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

    const parsedResponse = authResponseSchema.safeParse(await response.json());

    if (!parsedResponse.success) {
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }

    const remoteAuth = parsedResponse.data.data ?? null;

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

/** Handles DELETE /api/auth/impersonation; authorization and runtime adapter selection remain at this HTTP boundary. */
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
  targetUser: ImpersonationTarget | null,
): NextResponse {
  if (!targetUser) {
    return NextResponse.json(
      { error: "IMPERSONATED_USER_NOT_FOUND" },
      { status: 404 },
    );
  }

  if (
    normalizeUsername(originalUser.username) ===
    normalizeUsername(targetUser.username)
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
        username: targetUser.username,
      },
      activatedAt: Date.now(),
    },
  });
}

function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}
