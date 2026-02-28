import { AppUser } from "@/domain/user";

export interface CurrentSession {
  user: AppUser | null;
  expires: string;
  isDemoUser: boolean;
  isSuperUser: boolean;
  superUserActivated: Date | null;

  // Security-related information for public sessions.
  security: {
    loginLockedUntil: number | null;
    failedAttempts: number;
    requiresCaptcha: boolean;
  };
}
