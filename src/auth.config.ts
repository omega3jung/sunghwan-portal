// src/auth.config.ts
import NextAuth, { type AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { authorize, authSession } from "@/auth";
import { ENVIRONMENT } from "@/lib/environment";

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

  callbacks: authSession,
};

export default NextAuth(authOptions);
