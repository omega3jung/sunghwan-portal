// @vitest-environment jsdom

import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TenantPage } from "./TenantPage";

const { replaceMock, useSettingsAccessMock } = vi.hoisted(() => ({
  replaceMock: vi.fn(),
  useSettingsAccessMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

vi.mock("../../../_providers", () => ({
  useSettingsAccess: useSettingsAccessMock,
}));

describe("TenantPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.todo("shows the tenant settings when the required data has loaded");

  it("redirects to /settings when the user is not an owner admin", async () => {
    // Arrange: OWNER_ADMIN이 아닌 접근 유형을 준비합니다.
    useSettingsAccessMock.mockReturnValue({ type: "TENANT_ADMIN" });

    // Act: 접근 권한을 확인하는 TenantPage를 렌더링합니다.
    render(<TenantPage />);

    // Assert: 권한이 없는 사용자를 설정 첫 화면으로 이동시킵니다.
    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/settings");
    });
  });

  // 세션이나 조회 데이터가 로딩 중이면 로딩 화면을 표시한다.
  // 회사 또는 Tenant 조회가 실패하면 오류와 재시도 버튼을 표시한다.
  // 조회가 성공하면 회사 목록, Tenant 목록, 이동 버튼, 상세 정보 영역을 표시한다.
  // 재시도 버튼을 클릭하면 두 query의 refetch()가 호출된다.
});
