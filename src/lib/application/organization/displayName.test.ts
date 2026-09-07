import { describe, expect, it } from "vitest";

import type { LocalizedName } from "@/domain/organization";

import { displayNameMapper, formatDisplayName } from "./displayName";

describe("formatDisplayName", () => {
  it("combines the first, middle, and last names", () => {
    // Arrange: 테스트에 사용할 입력값을 준비합니다.
    const name = { first: "Sung", middle: "Hwan", last: "Jung" };

    // Act: 테스트할 함수를 실행합니다.
    const result = formatDisplayName(name);

    // Assert: 실제 결과가 기대한 결과와 같은지 확인합니다.
    expect(result).toBe("Sung Hwan Jung");
  });

  it("omits the optional middle name without leaving an extra space", () => {
    const name = { first: "Sung", last: "Jung" };

    const result = formatDisplayName(name);

    expect(result).toBe("Sung Jung");
  });
});

describe("displayNameMapper", () => {
  it("maps localized names to formatted localized text", () => {
    // Arrange: 테스트에 사용할 입력값을 준비합니다.
    const localeName = {
      en: { first: "Sung", middle: "Hwan", last: "Jung" },
      ko: { first: "성", middle: "환", last: "정" },
    } satisfies LocalizedName;

    // Act: 테스트할 함수를 실행합니다.
    const result = displayNameMapper(localeName);

    // Assert: 실제 결과가 기대한 결과와 같은지 확인합니다.
    expect(result).toEqual({
      en: "Sung Hwan Jung",
      ko: "성 환 정",
    });
  });
});
