import { Session } from "next-auth";
import { JWT } from "next-auth/jwt";

export const authSession = {
  /*
   * JWT enables stateless authentication.
   * It's stored in an HTTP-only cookie, which the browser automatically passes to the server with each request.
   * The server decrypts this JWT to identify the user.
   *
   * This callback is executed upon login (if the user exists) and for every subsequent request,
   * maintaining the source of truth for authentication.
   */
  jwt: async ({ token, user }: { token: JWT; user?: any }) => {
    if (user) {
      token.id = user.id;
      token.name = user.name;
      token.email = user.email;
      token.access_token = user.access_token;
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
    session.user.id = token.id as string;
    session.user.name = token.name;
    session.user.email = token.email;
    return session;
  },
};
