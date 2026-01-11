import type { CallbacksOptions } from "next-auth";
import { Session } from "next-auth";
import { JWT } from "next-auth/jwt";

import { AuthUser } from "@/types";

export const authSession: Pick<CallbacksOptions, "jwt" | "session"> = {
  /*
   * JWT enables stateless authentication.
   * It's stored in an HTTP-only cookie, which the browser automatically passes to the server with each request.
   * The server decrypts this JWT to identify the user.
   *
   * This callback is executed upon login (if the user exists) and for every subsequent request,
   * maintaining the source of truth for authentication.
   */
  jwt: async ({ token, user, trigger, session }) => {
    /**
     * 1️⃣ Initial login
     * user is only defined on signIn
     */
    if (user && isAuthUser(user)) {
      token.id = user.id; // actor id (never changes)
      token.name = user.name;
      token.email = user.email;
      token.accessToken = user.accessToken;

      token.dataScope = user.dataScope;
      token.userScope = user.userScope;
      token.tenantId = user.tenantId;
      token.permission = user.permission;
      token.role = user.role;

      // no impersonation on initial login
      delete token.impersonation;
    }

    /**
     * 2️⃣ Impersonation start / stop
     * triggered by session.update()
     */
    if (trigger === "update") {
      if (session?.impersonation) {
        token.impersonation = session.impersonation;
      }

      // stop impersonation
      if (session?.impersonation === null) {
        delete token.impersonation;
      }
    }

    return token;
  },

  /*
   * The client processes the authenticated information into a session format and uses it.
   * A session is a projection concept for consumption in the UI.
   * NextAuth builds on top of this with a session abstraction, making it easier to use in React.
   *
   * A session is a view model derived from JWT and does not change the authentication status.
   */
  session: async ({ session, token }: { session: Session; token: JWT }) => {
    session.user = {
      id: token.id,
      name: token.name,
      email: token.email,
      dataScope: token.dataScope,
    };

    if (token.impersonation) {
      session.impersonation = {
        subjectId: token.impersonation.subjectId,
      };
    } else {
      delete session.impersonation;
    }

    return session;
  },
};

function isAuthUser(user: unknown): user is AuthUser {
  return (
    typeof user === "object" &&
    user !== null &&
    "accessToken" in user &&
    "userScope" in user
  );
}
