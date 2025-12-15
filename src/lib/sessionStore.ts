import { create } from "zustand";

/**
 * =========================================================
 * Session Store (zustand)
 * ---------------------------------------------------------
 * 역할:
 * - 프론트엔드 세션의 "저장소(Single Source of Truth)"
 * - access_token, userId 등 인증 관련 최소 상태를 관리
 * - sessionStorage 와 상태를 동기화
 *
 * 특징:
 * - next-auth, UI 로직과 완전히 분리됨
 * - "어디에 / 어떻게 저장하는지"만 책임짐
 * - 컴포넌트에서는 직접 접근하지 않고
 *   useCurrentSession 훅을 통해서만 사용
 * =========================================================
 */

/*
 * sessionStorage는 탭 단위라 key가 같아도 충돌은 없지만,
 * 향후 localStorage 전환이나 멀티 포털 확장을 고려해서
 * 앱 단위로 명확한 key 네이밍을 사용.
 */
const STORAGE_KEYS = {
  USER_ID: "sunghwan_portal_user_id",
  ACCESS_TOKEN: "sunghwan_portal_access_token",
} as const;

/**
 * 세션에 저장되는 최소 상태
 * - userId: 로그인된 사용자 ID 또는 '_demo'
 * - access_token: API 호출에 사용되는 토큰
 */
export interface SessionState {
  userId: string | null; // '_demo' or ID.
  accessToken: string | null;
}

/**
 * 세션 상태를 조작하는 액션들
 *
 * 네이밍 컨벤션:
 * - hydrateSession : 스토리지 → 메모리 복구
 * - setSession     : 세션 업데이트 (부분 갱신)
 * - clearSession   : 로그아웃 / 세션 초기화
 */
export interface SessionActions {
  hydrateSession: () => void; // sessionStorage → store
  setSession: (data: Partial<SessionState>) => void; // store + storage 동기화
  clearSession: () => void; // 로그아웃
}

/**
 * 실제 zustand store
 */
export const useSessionStore = create<SessionState & SessionActions>()(
  (set, get) => ({
    userId: null,
    accessToken: null,

    /**
     * 앱 시작 시 호출
     * sessionStorage 에 저장된 값을 메모리로 복구
     */
    hydrateSession: () => {
      try {
        const userId = sessionStorage.getItem(STORAGE_KEYS.USER_ID);
        const accessToken = sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

        set({
          userId: userId ? JSON.parse(userId) : null,
          accessToken: accessToken ? JSON.parse(accessToken) : null,
        });
      } catch {
        // 파싱 실패 시 안전하게 초기화
        set({ userId: null, accessToken: null });
      }
    },

    /**
     * 세션 정보 갱신
     * - 메모리 상태 + sessionStorage 동기화
     */
    setSession: (data) => {
      const current = get();
      const next = { ...current, ...data };

      if (next.userId !== undefined) {
        sessionStorage.setItem(
          STORAGE_KEYS.USER_ID,
          JSON.stringify(next.userId)
        );
      }

      if (next.accessToken !== undefined) {
        sessionStorage.setItem(
          STORAGE_KEYS.ACCESS_TOKEN,
          JSON.stringify(next.accessToken)
        );
      }

      set(next);
    },

    /**
     * 로그아웃 시 호출
     * - sessionStorage 전체 제거
     * - 메모리 상태 초기화
     */
    clearSession: () => {
      sessionStorage.removeItem(STORAGE_KEYS.USER_ID);
      sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      set({ userId: null, accessToken: null });
    },
  })
);
