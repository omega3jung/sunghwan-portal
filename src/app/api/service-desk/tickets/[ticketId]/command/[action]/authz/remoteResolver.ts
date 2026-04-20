import type {
  TicketActionAuthorizationContext,
  TicketActionAuthorizationIdentity,
} from "./types";

export async function resolveRemoteActionAuthorizationContext(
  identity: TicketActionAuthorizationIdentity,
): Promise<TicketActionAuthorizationContext> {
  // TODO: hydrate departmentId from remote profile/organization API once available.
  return {
    userId: identity.userId,
    role: identity.role,
    companyId: identity.companyId,
    departmentId: null,
  };
}
