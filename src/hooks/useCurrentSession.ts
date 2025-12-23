import { useSession } from "next-auth/react";
import { useEffect, useMemo } from "react";
import { useSessionStore, SessionState } from "@/lib/sessionStore";
import { DataScope, UseCurrentSessionResult, CurrentSession } from "@/types";
import { AuthUser } from "@/types/next-auth.d";
import { useImpersonationStore } from "@/lib/impersonationStore";

/**
 * =========================================================
 * useCurrentSession Hook
 * ---------------------------------------------------------
 * 역할:
 * - next-auth 세션 + sessionStore(zustand)를 결합
 * - UI / page 에서 사용하기 좋은 형태로 가공
 *
 * 이 훅의 목적:
 * ❌ sessionStorage 직접 접근 금지
 * ❌ zustand store 직접 접근 금지
 * ✅ "세션을 어떻게 쓴다"에만 집중하게 함
 *
 * 즉, 프론트엔드용 세션 Facade (중간 계층)
 * =========================================================
 */

export const useCurrentSession = (): UseCurrentSessionResult => {
  /**
   * next-auth 세션
   * - 인증 상태 (authenticated / unauthenticated)
   * - expires
   */
  const session = useSession();

  /**
   * zustand 세션 스토어
   * - access_token
   * - userId
   */
  const store = useSessionStore();

  /**
   * zustand 대리 사용자 스토어
   * - actor
   * - subject
   */
  const impersonation = useImpersonationStore();

  /**
   * UI에서 바로 쓰기 위한 세션 데이터 가공
   *
   * 원칙:
   * - page / component 에서 계산 로직을 없앤다
   * - 세션 데이터 구조 변경 시 이 훅만 수정
   */
  const current = useMemo<CurrentSession>(() => {
    const { dataScope, user, accessToken } = store;

    // local, demo.
    if (dataScope === "LOCAL") {
      return {
        dataScope,
        user,
        accessToken,
        expires: "",
        isAdmin: true,
      };
    }

    // remote
    if (!session.data?.user) {
      return {
        dataScope: "REMOTE" as DataScope,
        user: undefined, // AuthUser.
        accessToken,
        expires: "",
        isAdmin: false,
      };
    }

    return {
      dataScope: "REMOTE" as DataScope,
      user: session.data.user as AuthUser,
      accessToken,
      expires: session.data.expires,
      isAdmin: false, // can get admin access from home.
    };
  }, [session.data, store]);

  /**
   * 세션 업데이트의 단일 진입점
   *
   * force = true:
   * - next-auth 세션을 강제로 revalidate
   * - 이후 zustand 세션 갱신
   */
  const updateSession = async (state: Partial<SessionState>, force = false) => {
    if (force) {
      await session.update();
    }
    store.setSession(state);
  };

  // seesion hydreate.
  useEffect(() => {
    store.hydrateSession();
  }, []);

  // set session when sign in.
  useEffect(() => {
    if (session.status !== "authenticated") return;
    if (!session.data?.user) return;

    store.setSession({
      dataScope: session.data.user.permission.scope, // LOCAL | REMOTE
      user: session.data.user,
      accessToken: session.data.user.accessToken,
    });

    impersonation.setActor({ ...session.data.user });
  }, [session.status, session.data?.user]);

  // clear session and impersonation when sign out.
  useEffect(() => {
    if (session.status === "unauthenticated") {
      impersonation.reset();
      store.clearSession();
    }
  }, [session.status]);

  return {
    ...session,
    current,
    updateSession,
    hydrateSession: store.hydrateSession,
    clearSession: store.clearSession,
  };
};
