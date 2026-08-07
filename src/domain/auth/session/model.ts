import { AppUser } from "@/domain/user";

/** Client-facing session projection combining effective user, security, and presentation flags. */
export interface CurrentSession {
  user: AppUser | null;
  expires: string;
  isDemoUser: boolean;
  isSuperUser: boolean;
  isClient: boolean;
  superUserActivated: Date | null;

  /** Security state exposed without backend credentials. */
  security: {
    loginLockedUntil: number | null;
    failedAttempts: number;
    requiresCaptcha: boolean;
  };
}
