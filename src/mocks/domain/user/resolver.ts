import { AuthUser } from "@/domain/auth";
import { AppUser } from "@/domain/user";

import { clientAuths, clientProfiles } from "./data.client";
import { internalAuths, internalProfiles } from "./data.internal";

export function resolveInternalAuth(
  userKey: string,
): Omit<AuthUser, "dataScope"> | null {
  return (
    internalAuths.find((u) => u.id === userKey || u.username === userKey) ??
    null
  );
}

export function resolveInternalProfile(userKey: string): AppUser | null {
  return (
    internalProfiles.find((u) => u.id === userKey || u.username === userKey) ??
    null
  );
}

export function resolveClientAuth(
  userKey: string,
): Omit<AuthUser, "dataScope"> | null {
  return clientAuths.find((u) => u.id === userKey || u.username === userKey) ?? null;
}

export function resolveClientProfile(userKey: string): AppUser | null {
  return (
    clientProfiles.find((u) => u.id === userKey || u.username === userKey) ??
    null
  );
}
