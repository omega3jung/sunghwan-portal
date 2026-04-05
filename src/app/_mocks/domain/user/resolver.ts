import { AuthUser } from "@/domain/auth";
import { AppUser } from "@/domain/user";

import { internalAuths, internalProfiles } from "./data.internal";
import { clientAuths, clientProfiles } from "./data.client";

export function resolveInternalAuth(
  id: string,
): Omit<AuthUser, "dataScope"> | null {
  return internalAuths.find((u) => u.id === id) ?? null;
}

export function resolveInternalProfile(id: string): AppUser | null {
  return internalProfiles.find((u) => u.id === id) ?? null;
}

export function resolveClientAuth(
  id: string,
): Omit<AuthUser, "dataScope"> | null {
  return clientAuths.find((u) => u.id === id) ?? null;
}

export function resolveClientProfile(id: string): AppUser | null {
  return clientProfiles.find((u) => u.id === id) ?? null;
}
