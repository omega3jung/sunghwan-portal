import { DefaultSession } from "next-auth";
import { Permission, Preference } from "@/types/user";

// user type for authorization.
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  accessToken: string;
  permission: Permission;
  preference?: Preference;
  isAdmin: boolean;
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
    name: string;
    email: string;
    accessToken: string;
    permission: Permission;
  }
}
