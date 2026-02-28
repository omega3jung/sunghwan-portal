// enhancers/profile.ts
import { AppUserEnhancer } from "@/server/auth/appUserEnhancer";
import { getUserProfile } from "@/server/user";

export const withProfile: AppUserEnhancer = async (authUser, appUser) => {
  const profile = await getUserProfile(authUser);
  return { ...appUser, ...profile };
};
