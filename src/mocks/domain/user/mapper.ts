import { AuthUser } from "@/domain/auth";
import { AppUser } from "@/domain/user";

export const toAuth = (
  data: AppUser &
    Pick<AuthUser, "role"> & { accessToken: string },
): AuthUser => {
  const { accessToken, email, role, ...rest } = data;

  if (!email || !role) {
    throw new Error(`[DemoAuth] AuthUser.email is required. userId=${data.id}`);
  }

  return { ...rest, email, role, accessToken, dataScope: "LOCAL" };
};

export const toProfile = (
  data: AppUser & { accessToken: string },
): AppUser => {
  const { ...profile } = data;
  return profile;
};
