// src/mocks/domain/user/index.ts
import { clientAuths, clientProfiles } from "./data.client";
import { internalAuths, internalProfiles } from "./data.internal";

export * from "./data.client";
export * from "./data.ids";
export * from "./data.internal";
export * from "./mapper";
export * from "./resolver";

/** Combines internal and client demo identities for credential lookup. */
export const demoAuths = [...internalAuths, ...clientAuths];
/** Combines internal and client profiles for LOCAL user projection. */
export const demoProfiles = [...internalProfiles, ...clientProfiles];

/** Resolves a demo credential identity by username without exposing fixture partitions. */
export function resolveDemoAuth(username: string) {
  return demoAuths.find((u) => u.username === username) ?? null;
}

/** Resolves a demo profile by username without exposing fixture partitions. */
export function resolveDemoProfile(username: string) {
  return demoProfiles.find((u) => u.username === username) ?? null;
}
