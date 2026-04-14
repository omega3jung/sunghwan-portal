import { clientAuths, clientProfiles } from "./data.client";
import { internalAuths, internalProfiles } from "./data.internal";

export * from "./data.client";
export * from "./data.ids";
export * from "./data.internal";
export * from "./mapper";
export * from "./resolver";

export const demoAuths = [...internalAuths, ...clientAuths];
export const demoProfiles = [...internalProfiles, ...clientProfiles];

export function resolveDemoAuth(userId: string) {
  return demoAuths.find((u) => u.id === userId) ?? null;
}

export function resolveDemoProfile(userId: string) {
  return demoProfiles.find((u) => u.id === userId) ?? null;
}
