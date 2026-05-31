import type {
  AccessLevel,
  DataScope,
  ImpersonationInfo,
  Role,
  SessionUser,
  UserScope,
} from "@/domain/auth";
import type { LocalizedText } from "@/shared/types";

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    displayName: LocalizedText;
    email: string;
    accessToken: string;

    dataScope: DataScope;
    userScope: UserScope;
    companyId: number;
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
