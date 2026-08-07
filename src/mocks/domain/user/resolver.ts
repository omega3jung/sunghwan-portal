import { AuthUser } from "@/domain/auth";
import { AppUser } from "@/domain/user";

import { clientAuths, clientProfiles } from "./data.client";
import { internalAuths, internalProfiles } from "./data.internal";

/** Resolves an internal demo authentication record by id or username. */
export function resolveInternalAuth(
  userKey: string,
): Omit<AuthUser, "dataScope"> | null {
  return (
    internalAuths.find((u) => u.id === userKey || u.username === userKey) ??
    null
  );
}

/** Resolves an internal demo profile by id or username. */
export function resolveInternalProfile(userKey: string): AppUser | null {
  return (
    internalProfiles.find((u) => u.id === userKey || u.username === userKey) ??
    null
  );
}

/** Resolves a client-company demo authentication record by id or username. */
export function resolveClientAuth(
  userKey: string,
): Omit<AuthUser, "dataScope"> | null {
  return clientAuths.find((u) => u.id === userKey || u.username === userKey) ?? null;
}

/** Resolves a client-company demo profile by id or username. */
export function resolveClientProfile(userKey: string): AppUser | null {
  return (
    clientProfiles.find((u) => u.id === userKey || u.username === userKey) ??
    null
  );
}
