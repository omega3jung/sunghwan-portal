// src/server/auth/appUserEnhancers.ts
import { AppUser, AuthUser } from "@/types";

export type AppUserEnhancer = (
  auth: AuthUser,
  user: Readonly<AppUser>
) => Promise<Partial<AppUser>>;
