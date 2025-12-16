import { SessionContextValue, useSession } from "next-auth/react";
import { useEffect, useMemo } from "react";
import { useSessionStore, SessionState } from "@/lib/sessionStore";
import { AuthUser } from "@/types";

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

/**
 * 프론트엔드에서 사용하는 최종 세션 타입
 *
 * 구성:
 * - next-auth SessionContextValue (data, update 제외)
 * - sessionStore 액션들 (setSession 제외)
 * - UI에서 바로 쓰는 data 구조
 * - updateSession: 세션 갱신의 단일 진입점
 */

export type CurrentSession = Omit<SessionContextValue, "data" | "update"> & {
  data: {
    expires: string;
    user?: AuthUser;
    ui: {
      isAdmin: boolean;
    };
  };
  updateSession: (
    data: Partial<SessionState>,
    force?: boolean
  ) => Promise<void>;
  hydrateSession: () => void;
  clearSession: () => void;
};

export const useCurrentSession = (): CurrentSession => {
  /**
   * next-auth 세션
   * - 인증 상태 (authenticated / unauthenticated)
   * - expires
   */
  const { data, ...session } = useSession();

  /**
   * zustand 세션 스토어
   * - access_token
   * - userId
   */
  const store = useSessionStore();

  /**
   * UI에서 바로 쓰기 위한 세션 데이터 가공
   *
   * 원칙:
   * - page / component 에서 계산 로직을 없앤다
   * - 세션 데이터 구조 변경 시 이 훅만 수정
   */
  const sessionData = useMemo(() => {
    if (!data?.user) {
      return {
        expires: "",
        ui: {
          isAdmin: false,
        },
      };
    }

    return {
      expires: data.expires,
      user: {
        ...data.user, // AuthUser.
        // 필요 시 store.userId 를 합성할 수 있음
      },
      ui: {
        // 추후 관리자 UI, IT Help Desk 설정 등에 활용 가능
        isAdmin: false,
      },
    };
  }, [data, store]);

  /**
   * 세션 업데이트의 단일 진입점
   *
   * force = true:
   * - next-auth 세션을 강제로 revalidate
   * - 이후 zustand 세션 갱신
   */
  const update = async (state: Partial<SessionState>, force = false) => {
    if (force) {
      await session.update();
    }
    store.setSession(state);
  };

  useEffect(() => {
    store.hydrateSession();
  }, []);

  return {
    ...session,
    data: sessionData,
    updateSession: update,
    hydrateSession: store.hydrateSession,
    clearSession: store.clearSession,
  };
};
