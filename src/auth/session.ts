import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";
import { Permission } from "@/types";

export const authSession = {
  /*
   * JWT는 stateless 인증을 가능하게 해줌.
   * HTTP-only 쿠키에 저장돼서 브라우저가 요청마다 자동으로 서버에 전달.
   * 서버는 이 JWT를 복호화해서 사용자를 식별.
   *
   * 이 콜백은 로그인 시점(user 존재 시)과 이후 모든 요청마다 실행되며,
   * 인증의 원본(source of truth)을 유지함.
   */
  jwt: async ({ token, user }: { token: JWT; user?: any }) => {
    if (user) {
      token.id = user.id;
      token.permission = user.permission;
      token.accessToken = user.accessToken;
    }
    return token;
  },

  /*
   * 클라이언트에서는 인증된 정보를 session 형태로 가공해서 사용.
   * session은 UI에서 소비하기 위한 projection 개념.
   * NextAuth는 그 위에 session abstraction을 얹어서 React에서 쓰기 쉽게 만든 구조.
   *
   * session은 JWT로부터 파생된 view model이며, 인증 상태를 변경하지는 않음.
   */
  session: async ({ session, token }: { session: Session; token: JWT }) => {
    session.user.id = token.id as string;
    session.user.permission = token.permission as Permission;
    session.user.accessToken = token.accessToken as string;

    return session;
  },
};
