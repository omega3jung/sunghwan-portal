import { internalAuths, internalProfiles } from "./internal";
import { tenantAuths, tenantProfiles } from "./tenant";

export * from "./enum";
export * from "./internal";
export * from "./tenant";

export const demoAuths = [...internalAuths, ...tenantAuths];
export const demoProfiles = [...internalProfiles, ...tenantProfiles];

export function resolveDemoAuth(userId: string) {
  return demoAuths.find((u) => u.id === userId) ?? null;
}

export function resolveDemoProfile(userId: string) {
  return demoProfiles.find((u) => u.id === userId) ?? null;
}
