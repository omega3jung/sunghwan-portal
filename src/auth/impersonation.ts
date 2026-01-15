// src/auth/impersonation.ts

import axios from "axios";

import { resolveTenantAuth } from "@/domain/user";
import fetcher from "@/services/fetcher";
import { ACCESS_LEVEL, AppUser, AuthUser } from "@/types";

export async function startImpersonation({
  actor,
  subjectId,
}: {
  actor: AuthUser;
  subjectId: string;
}) {
  // 1. check permission.
  if (actor.userScope !== "INTERNAL" || actor.permission < ACCESS_LEVEL.ADMIN) {
    throw new Error("FORBIDDEN");
  }

  try {
    // 2-a. tenant demo impersonation.
    if (actor.dataScope === "LOCAL") {
      // 3-a. search subject.
      const tenantDemoAuth = resolveTenantAuth(subjectId);

      if (!tenantDemoAuth) {
        throw new Error("SUBJECT_NOT_FOUND");
      }

      // 4-a. check subject scope
      if (tenantDemoAuth.userScope !== "TENANT") {
        throw new Error("FORBIDDEN_SUBJECT");
      }

      // 5-a. allow impersonation
      console.log(tenantDemoAuth.displayName);
      return {
        actorId: actor.id,
        subjectId: tenantDemoAuth.id,
        activatedAt: Date.now(),
      };
    }

    // 2-b. real impersonation.
    console.log("real impersonation");

    // 3-b. search subject.
    const res = await fetcher.api.get<AppUser>(`/user/${subjectId}/profile`);

    if (!res.data) {
      throw new Error("SUBJECT_NOT_FOUND");
    }

    // 4-a. check subject scope
    if (res.data.userScope !== "TENANT") {
      throw new Error("FORBIDDEN_SUBJECT");
    }

    // 5-b. allow impersonation
    return {
      subjectId: subjectId,
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
