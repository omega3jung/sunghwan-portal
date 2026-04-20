import { NextRequest } from "next/server";

import { getAuthToken } from "@/app/api/_helpers";

import { resolveLocalActionAuthorizationContext } from "./localResolver";
import { resolveRemoteActionAuthorizationContext } from "./remoteResolver";
import type {
  TicketActionAuthorizationContext,
  TicketActionAuthorizationIdentity,
} from "./types";

export async function resolveActionAuthorizationContext(
  request: NextRequest,
): Promise<TicketActionAuthorizationContext | null> {
  const token = await getAuthToken(request);

  if (!token?.id) {
    return null;
  }

  const currentUserId = token.impersonation?.impersonatedUserId ?? token.id;

  const identity: TicketActionAuthorizationIdentity = {
    userId: currentUserId,
    role: token.role ?? null,
    companyId: token.companyId ?? null,
    email: currentUserId === token.id ? token.email ?? null : null,
  };

  if (token.dataScope === "REMOTE") {
    return resolveRemoteActionAuthorizationContext(identity);
  }

  return resolveLocalActionAuthorizationContext(identity);
}
