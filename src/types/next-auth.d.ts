import type {
  AccessLevel,
  DataScope,
  ImpersonationInfo,
  Role,
  SessionUser,
  UserScope,
} from "@/domain/auth";

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    employeeId?: number | null;
    username: string;
    displayName: string;
    email: string;
    accessToken: string;

    dataScope: DataScope;
    userScope: UserScope;
    companyId: string;
    permission: AccessLevel;
    role: Role;

    impersonation?: ImpersonationInfo;
  }
}

declare module "next-auth" {
  interface Session {
    user: SessionUser;
    impersonation?: ImpersonationInfo;
  }
}
