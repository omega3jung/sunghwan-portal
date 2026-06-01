import { clientAuths, clientProfiles } from "./data.client";
import { internalAuths, internalProfiles } from "./data.internal";

export * from "./data.client";
export * from "./data.ids";
export * from "./data.internal";
export * from "./mapper";
export * from "./resolver";

export const demoAuths = [...internalAuths, ...clientAuths];
export const demoProfiles = [...internalProfiles, ...clientProfiles];

export function resolveDemoAuth(username: string) {
  return demoAuths.find((u) => u.username === username) ?? null;
}

export function resolveDemoProfile(username: string) {
  return demoProfiles.find((u) => u.username === username) ?? null;
}
