import { AuthUser } from "@/domain/auth";
import { AppUser } from "@/domain/user";

export type DemoAuthProfileSeed = AppUser &
  Pick<AuthUser, "role"> & {
    accessToken: string;
  };
