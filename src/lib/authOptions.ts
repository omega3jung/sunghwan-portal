import { loginApi } from "@/services/credentials.service";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const user = await loginApi(credentials);

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          access_token: user.access_token,
          roles: user.roles,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email as string;
        token.access_token = user.access_token as string; // loginApi 응답 기준
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.email = token.email as string;
      session.user.access_token = token.access_token as string;
      session.user.roles = token.roles as string[];
      return session;
    },
  },
};
