import { AuthUser } from "@/types/auth-user";

declare module "next-auth/jwt" {
  interface JWT {
    id: string; // effective user.
    username: string; // user account
    displayName: string; // user name
    email: string;
    accessToken: string;

    dataScope: DataScope;
    userScope: UserScope;
    tenantId: string | null;
    permission: AccessLevel;
    role: Role;

    // impersonation (server truth)
    impersonation?: {
      actorId: string; // loggin in user.
      subjectId: string; // impersonating user.
      activatedAt: number; // Date.now()
    };
  }
}

declare module "next-auth" {
  interface Session {
    user: Pick<
      AuthUser,
      "id" | "username" | "displayName" | "email" | "dataScope"
    >;

    // impersonation
    impersonation?: {
      actorId: string;
      subjectId: string;
      activatedAt: number;
    };
  }
}
