import { AppUser, AuthUser } from "@/types";

export const toAuth = (
  data: AppUser & { accessToken: string }
): Omit<AuthUser, "dataScope"> => {
  const { accessToken, email, role, ...rest } = data;

  if (!email || !role) {
    throw new Error(`[DemoAuth] AuthUser.email is required. userId=${data.id}`);
  }

  return { ...rest, email, role, accessToken };
};

export const toProfile = (data: AppUser & { accessToken: string }): AppUser => {
  const { ...profile } = data;
  return profile;
};
