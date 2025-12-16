import { DefaultSession } from "next-auth";
import { AuthUser } from "./auth";

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
    roles: string[];
  }
}
