// src/auth/impersonation.ts

import axios from "axios";

import { ACCESS_LEVEL, AuthUser, ImpersonationInfo } from "@/domain/auth";
import { AppUser } from "@/domain/user";
import client from "@/lib/api";
import { resolveClientAuth } from "@/mocks/domain/user";

export async function startImpersonation({
  originalUser,
  impersonatedUsername,
}: {
  originalUser: AuthUser;
  impersonatedUsername: string;
}): Promise<ImpersonationInfo> {
  // 1. check permission.
  if (
    originalUser.userScope !== "INTERNAL" ||
    originalUser.permission < ACCESS_LEVEL.ADMIN
  ) {
    throw new Error("FORBIDDEN");
  }

  try {
    // 2-a. client demo impersonation.
    if (originalUser.dataScope === "LOCAL") {
      // 3-a. search impersonated user.
      const clientDemoAuth = resolveClientAuth(impersonatedUsername);

      if (!clientDemoAuth) {
        throw new Error("IMPERSONATED_USER_NOT_FOUND");
      }

      // 4-a. check impersonated user scope
      if (clientDemoAuth.userScope !== "CLIENT") {
        throw new Error("FORBIDDEN_IMPERSONATED_USER");
      }

      // 5-a. allow impersonation
      return {
        originalUser: {
          id: originalUser.id,
          username: originalUser.username,
        },
        impersonatedUser: {
          id: clientDemoAuth.id,
          username: clientDemoAuth.username,
        },
        activatedAt: Date.now(),
      };
    }

    // 2-b. real impersonation.

    // 3-b. search impersonated user.
    const res = await client.api.get<AppUser>(
      `/users/${impersonatedUsername}/profile`,
    );

    if (!res.data) {
      throw new Error("IMPERSONATED_USER_NOT_FOUND");
    }

    // 4-a. check impersonated user scope
    if (res.data.userScope !== "CLIENT") {
      throw new Error("FORBIDDEN_IMPERSONATED_USER");
    }

    // 5-b. allow impersonation
    return {
      originalUser: {
        id: originalUser.id,
        username: originalUser.username,
      },
      impersonatedUser: {
        id: res.data.id,
        username: res.data.username,
      },
      activatedAt: Date.now(),
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error("INVALID_CREDENTIALS");
      }
    }
    throw error;
  }
}

export function stopImpersonation() {
  return null;
}
