import { NAVIGATION_KEY, NAVIGATION_LEFT_MENU_KEY } from "../../keys";

export const leftMenuQueryKeys = {
  all: [NAVIGATION_KEY, NAVIGATION_LEFT_MENU_KEY] as const,

  details: () => [...leftMenuQueryKeys.all, "detail"] as const,
  detail: () => [...leftMenuQueryKeys.details()] as const,
};
