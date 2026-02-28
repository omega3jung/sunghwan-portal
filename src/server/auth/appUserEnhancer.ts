// src/server/auth/appUserEnhancers.ts

import { AuthUser } from "@/domain/auth";
import { AppUser } from "@/domain/user";

export type AppUserEnhancer = (
  auth: AuthUser,
  user: Readonly<AppUser>,
) => Promise<Partial<AppUser>>;
