// src/auth/impersonation.ts

import axios from "axios";

import client from "@/api/client";
import { resolveClientAuth } from "@/app/_mocks/domain/user";
import { ACCESS_LEVEL, AuthUser } from "@/domain/auth";
import { AppUser } from "@/domain/user";

export async function startImpersonation({
  originalUser,
  impersonatedUserId,
}: {
  originalUser: AuthUser;
  impersonatedUserId: string;
}) {
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
      const clientDemoAuth = resolveClientAuth(impersonatedUserId);

      if (!clientDemoAuth) {
        throw new Error("IMPERSONATED_USER_NOT_FOUND");
      }

      // 4-a. check impersonated user scope
      if (clientDemoAuth.userScope !== "CLIENT") {
        throw new Error("FORBIDDEN_IMPERSONATED_USER");
      }

      // 5-a. allow impersonation
      console.log(clientDemoAuth.displayName);
      return {
        originalUserId: originalUser.id,
        impersonatedUserId: clientDemoAuth.id,
        activatedAt: Date.now(),
      };
    }

    // 2-b. real impersonation.
    console.log("real impersonation");

    // 3-b. search impersonated user.
    const res = await client.api.get<AppUser>(
      `/users/${impersonatedUserId}/profile`,
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
      originalUserId: originalUser.id,
      impersonatedUserId,
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
