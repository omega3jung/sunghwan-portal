import { DataScope } from "@/types/user";

// user type for authorization.
// properties are required info only.
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  accessToken: string;
}

declare module "next-auth" {
  interface Session {
    user: AuthUser;
  }

  type User = AuthUser;
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name: string;
    email: string;
    dataScope: DataScope;
    accessToken: string;
  }
}
