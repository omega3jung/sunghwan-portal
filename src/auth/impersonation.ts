// src/auth/impersonation.ts

import axios from "axios";

import { resolveTenantAuth } from "@/domain/user";
import fetcher from "@/services/fetcher";
import { ACCESS_LEVEL, AuthUser } from "@/types";

export async function startImpersonation({
  actor,
  subjectId,
}: {
  actor: AuthUser;
  subjectId: string;
}) {
  // check permission.
  if (actor.permission < ACCESS_LEVEL.ADMIN) {
    throw new Error("FORBIDDEN");
  }

  try {
    // tenant demo impersonation.
    const tenantDemoAuth = resolveTenantAuth(subjectId);

    if (tenantDemoAuth) {
      console.log(tenantDemoAuth.name);
      return {
        subjectId: subjectId,
        activatedAt: Date.now(),
      };
    }

    console.log("real impersonation");

    // real impersonation.
    await fetcher.api.post("/auth/impersonation", {
      subjectId,
    });

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
