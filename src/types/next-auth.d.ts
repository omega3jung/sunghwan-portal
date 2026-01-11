import { AuthUser } from "@/types/auth-user";

declare module "next-auth/jwt" {
  interface JWT {
    id: string; // effective user.
    name: string;
    email: string;
    accessToken: string;

    dataScope: DataScope;
    userScope: UserScope;
    tenantId: string | null;
    permission: AccessLevel;
    role: Role;

    impersonation?: {
      actorId: string; // loggin in user.
      subjectId: string; // impersonating user.
      activatedAt: number; // Date.now()
    };
  }
}

declare module "next-auth" {
  interface Session {
    user: Pick<AuthUser, "id" | "name" | "email" | "dataScope">;

    // impersonation
    impersonation?: { subjectId: string };
  }
}
