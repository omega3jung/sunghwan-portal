import { DefaultSession } from "next-auth";
import { Permission } from "@/types/user";

// user type for authorization.
export interface AuthUser {
  id: string;
  name?: string | null;
  email?: string | null;
  access_token: string;
  permission: Permission;
  isSuperUser?: boolean;
}

declare module "next-auth" {
  interface Session {
    user: AuthUser;
  }

  interface User extends AuthUser {}
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email?: string;
    access_token: string;
    permission: Permission;
    isSuperUser?: boolean;
  }
}
