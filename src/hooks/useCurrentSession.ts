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
   * - authorizatoin status (loading, authenticated / unauthenticated)
   * - expires
   */
  const session = useSession();

  /**
   * zustand session store.
   * - dataScope
   * - isSuperUser
   * - user: { id, name, email, dataScope }
   * - accessToken
   */
  const store = useSessionStore();

  /**
   * zustand impersonation user store.
   * - actor
   * - subject
   */
  const impersonation = useImpersonationStore();

  /**
   * 🔒 여기부터는 authenticated가 타입 레벨에서 보장됨
   * 
   * UI에서 바로 쓰기 위한 세션 데이터 가공
   *
   * 원칙:
   * - page / component 에서 계산 로직을 없앤다
   * - 세션 데이터 구조 변경 시 이 훅만 수정
   */
  const current = useMemo<CurrentSession>(() => {
    const { user, accessToken } = store;

    // local / demo
    if (user.id === "demo") {
      return {
        dataScope: "LOCAL",
        user,
        accessToken: "demo-token",
        expires: "",
        isSuperUser: false,
      };
    }

    // remote
    return {
      dataScope: "REMOTE",
      user,
      accessToken,
      expires: "",
      isSuperUser: false,
    };
  }, [store, session.data]);

  /**
   * 세션 업데이트의 단일 진입점
   *
   * force = true:
   * - next-auth 세션을 강제로 revalidate
   * - 이후 zustand 세션 갱신
   */
  const updateSession = async (
    state: Partial<SessionState>,
    force = false
  ) => {
    if (force) {
      await session.update();
    }
    store.setSession(state);
  };

  // hydrate once
  useEffect(() => {
    if (session.status === "unauthenticated") {
      store.hydrateSession();
    }
  }, []);

  // set session when sign in.
  useEffect(() => {
    if (session.status !== "authenticated") return;
    if (!session.data?.user) return;

    store.setSession({
      user: session.data.user,
    });

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