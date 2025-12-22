import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";
import { Permission } from "@/types/user";

export const authSession = {
  jwt: async ({ token, user }: { token: JWT; user?: any }) => {
    if (user) {
      token.id = user.id;
      token.permission = user.permission;
    }
    return token;
  },

  session: async ({ session, token }: { session: Session; token: JWT }) => {
    session.user.id = token.id as string;
    session.user.permission = token.permission as Permission;
    return session;
  },
};
