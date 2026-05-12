import { AuthUser } from "@/domain/auth";
import { DisplayName } from "@/domain/organization";
import { AppUser } from "@/domain/user";

export const toAuth = (
  data: AppUser & Pick<AuthUser, "employeeId"> & { accessToken: string },
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

export const displayNameMapper = (name: DisplayName) => {
  const { first, middle, last } = name;
  return [first, middle, last].filter(Boolean).join(" ");
};
