import { describe, expect, it } from "vitest";

import { TenantPage } from "./components/TenantPage";
import Page from "./page";

describe("tenant settings Page", () => {
  it("returns TenantPage as the route content", () => {
    // Arrange: 이 page에는 전달할 입력값이나 준비할 상태가 없습니다.

    // Act: Next.js가 route에 진입했을 때 호출할 page 컴포넌트를 실행합니다.
    const result = Page();

    // Assert: 실제 화면의 책임을 가진 TenantPage에 화면 구성을 위임합니다.
    expect(result.type).toBe(TenantPage);
  });
});
