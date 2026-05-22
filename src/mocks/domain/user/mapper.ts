import { AuthUser } from "@/domain/auth";
import { AppUser } from "@/domain/user";

export const toAuth = (
  data: AppUser &
    Pick<AuthUser, "role" | "employeeId"> & { accessToken: string },
): Omit<AuthUser, "dataScope"> => {
  const { accessToken, email, role, ...rest } = data;

  if (!email || !role) {
    throw new Error(`[DemoAuth] AuthUser.email is required. userId=${data.id}`);
  }

  return { ...rest, email, role, accessToken };
};

export const toProfile = (
  data: AppUser & Pick<AuthUser, "employeeId"> & { accessToken: string },
): AppUser => {
  const { ...profile } = data;
  return profile;
};
