import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";

export const authSession = {
  jwt: async ({ token, user }: { token: JWT; user?: any }) => {
    if (user) {
      token.id = user.id;
      token.role = user.role;
    }
    return token;
  },

  session: async ({ session, token }: { session: Session; token: JWT }) => {
    session.user.id = token.id as string;
    session.user.role = token.role as string;
    return session;
  },
};