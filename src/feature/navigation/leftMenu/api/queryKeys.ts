import { NAVIGATION_KEY, NAVIGATION_LEFT_MENU_KEY } from "../../keys";

/** Builds stable TanStack Query keys for left menu cache entries. */
export const leftMenuQueryKeys = {
  all: [NAVIGATION_KEY, NAVIGATION_LEFT_MENU_KEY] as const,

  details: () => [...leftMenuQueryKeys.all, "detail"] as const,
  detail: () => [...leftMenuQueryKeys.details()] as const,
};
