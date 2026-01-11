// src/server/auth/appUserEnhancers.ts
import { AppUser, AuthUser } from "@/types";

export type AppUserEnhancer = (
  auth: AuthUser,
  user: AppUser
) => Promise<AppUser> | AppUser;
