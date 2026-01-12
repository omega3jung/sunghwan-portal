// enhancers/preference.ts
import { AppUserEnhancer } from "@/server/auth/appUserEnhancer";
import { getUserPreference } from "@/server/user";

export const withPreference: AppUserEnhancer = async (authUser, appUser) => {
  const preference = await getUserPreference(authUser);
  return { ...appUser, preference: preference };
};
