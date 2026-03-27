import { internalAuths, internalProfiles } from "./data.internal";
import { tenantAuths, tenantProfiles } from "./data.tenant";

export * from "./data.ids";
export * from "./data.internal";
export * from "./data.tenant";
export * from "./mapper";
export * from "./resolver";

export const demoAuths = [...internalAuths, ...tenantAuths];
export const demoProfiles = [...internalProfiles, ...tenantProfiles];

export function resolveDemoAuth(userId: string) {
  return demoAuths.find((u) => u.id === userId) ?? null;
}

export function resolveDemoProfile(userId: string) {
  return demoProfiles.find((u) => u.id === userId) ?? null;
}
