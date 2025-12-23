import { create } from "zustand";
import { CurrentSession } from "@/types";

/**
 * =========================================================
 * Session Store (zustand)
 * ---------------------------------------------------------
 * 역할:
 * - 프론트엔드 "도메인 세션"의 Single Source of Truth
 * - LOCAL / REMOTE 세션을 동일한 구조로 관리
 * - sessionStorage 와 상태 동기화
 * =========================================================
 */

const STORAGE_KEYS = {
  SESSION: "sunghwan_portal_session",
} as const;

/**
 * 세션에 저장되는 최소 상태
 * - dataScope: LOCAL | REMOTE
 * - user: 유저 정보
 * - accessToken: API 호출에 사용되는 토큰
 * - isAdmin: admin 권한 여부
 */
export interface SessionState extends Omit<CurrentSession, "expires"> {}

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
 * 초기 상태
 * - 기본은 LOCAL (Try Demo 진입 가능)
 */
const initialState: SessionState = {
  dataScope: "LOCAL",
  isAdmin: false,
};

/**
 * 실제 zustand store
 */
export const useSessionStore = create<SessionState & SessionActions>()(
  (set, get) => ({
    ...initialState,

    /**
     * 앱 시작 시 호출
     * sessionStorage 에 저장된 값을 메모리로 복구
     */
    hydrateSession: () => {
      try {
        const raw = sessionStorage.getItem(STORAGE_KEYS.SESSION);
        if (!raw) return;

        const parsed = JSON.parse(raw) as SessionState;
        set(parsed);
      } catch {
        set(initialState);
      }
    },

    /**
     * 세션 정보 갱신
     * - 메모리 상태 + sessionStorage 동기화
     */
    setSession: (data) => {
      const next = { ...get(), ...data };

      sessionStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(next));

      set(next);
    },

    /**
     * 로그아웃 시 호출
     * - sessionStorage 전체 제거
     * - 메모리 상태 초기화
     */
    clearSession: () => {
      sessionStorage.removeItem(STORAGE_KEYS.SESSION);
      set(initialState);
    },
  })
);
