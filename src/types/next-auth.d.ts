import { AuthUser } from "@/types/user";

declare module "next-auth/jwt" {
  interface JWT extends AuthUser {
    impersonation?: {
      actorId: string;
      subjectId: string;
      activatedAt: number;
    };
  }
}

declare module "next-auth" {
  interface Session {
    user: Omit<AuthUser, "accessToken">;

    // impersonation
    impersonation?: {
      actorId: string;
      subjectId: string;
      activatedAt: number;
    };
  }
}
