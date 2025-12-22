import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { loginApi } from "@/services/credentials.service";
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
      async authorize(credentials) {
        if (!credentials) return null;

        try {
          const user = await loginApi(credentials);
          if (!user) return null;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            permission: user.permission,
            access_token: user.access_token,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = {
          id: user.id,
          permission: user.permission,
        };
        token.access_token = user.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.permission = token.permission as Permission;
      (session as any).access_token = token.access_token;
      return session;
    },
  },
};
