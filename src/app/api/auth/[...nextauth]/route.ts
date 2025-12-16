import { NextApiRequest, NextApiResponse } from "next";
import NextAuth, { AuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { ENVIRONMENT } from "@/lib/environment";
import { loginApi } from "@/services/credentials.service";

export const authOptions: AuthOptions = {
  pages: {
    signIn: `${ENVIRONMENT.BASE_PATH}/login`,
    signOut: `${ENVIRONMENT.BASE_PATH}/login`,
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

        const user = await loginApi(credentials);
        if (!user) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          access_token: user.access_token,
          roles: user.roles,
        };
      },
    }),
  ],
};

// Useful documentation
// https://github.com/nextauthjs/next-auth/discussions/1728#discussioncomment-6740366
// https://next-auth.js.org/configuration/initialization#advanced-initialization
export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  return NextAuth(req, res, {
    ...authOptions,
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.roles = user.roles;
        }
        return token;
      },
      async session({ session, token }) {
        session.user.roles = token.roles as string[];
        return session;
      },
    },
  });
}
