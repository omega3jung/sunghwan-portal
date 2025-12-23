// src/auth.config.ts
import NextAuth, { type AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { authorize } from "@/auth";
import { ENVIRONMENT } from "@/lib/environment";
import { Permission } from "@/types";

export const authOptions: AuthOptions = {
  pages: {
    signIn: `${ENVIRONMENT.BASE_PATH}/login`,
  },
  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
  },

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { type: "text" },
        password: { type: "password" },
      },
      authorize,
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.permission = user.permission;
        token.accessToken = user.accessToken;
      }
      return token;
    },

    async session({ session, token }) {
      session.user = {
        id: token.id,
        accessToken: token.accessToken,
        permission: token.permission,
        isAdmin: false,
      };

      return session;
    },
  },
};

export default NextAuth(authOptions);
