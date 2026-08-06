import { createPreferenceKey } from "@/feature/user/preference/utils";
import { programModuleKeys } from "@/lib/application/navigation";

const homeKeys = {
  preference: createPreferenceKey(programModuleKeys.home, "portalPreference"),
};

const serviceDeskKeys = {
  searchCriteria: createPreferenceKey(
    programModuleKeys.serviceDesk.tickets,
    "listFilter",
  ),
  insightFilter: createPreferenceKey(
    programModuleKeys.serviceDesk.insights,
    "filter",
  ),
};

export const preferenceKeys = {
  home: homeKeys,
  serviceDesk: serviceDeskKeys,
} as const;
