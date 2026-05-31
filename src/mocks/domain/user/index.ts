import { clientAuths, clientProfiles } from "./data.client";
import { internalAuths, internalProfiles } from "./data.internal";

export * from "./data.client";
export * from "./data.ids";
export * from "./data.internal";
export * from "./mapper";
export * from "./resolver";

export const demoAuths = [...internalAuths, ...clientAuths];
export const demoProfiles = [...internalProfiles, ...clientProfiles];

export function resolveDemoAuth(userName: string) {
  return demoAuths.find((u) => u.username === userName) ?? null;
}

export function resolveDemoProfile(userName: string) {
  return demoProfiles.find((u) => u.username === userName) ?? null;
}
