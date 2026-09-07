import { describe, expect, it } from "vitest";

import { isOwnerCompany } from "./rules";

describe("owner company identification", () => {
  it.each([
    ["the canonical string ID", "1"],
    ["the numeric representation", 1],
  ] as const)("identifies the owner company from %s", (_, companyId) => {
    expect(isOwnerCompany(companyId)).toBe(true);
  });

  it.each([
    ["a different company ID", "2"],
    ["a zero-padded ID", "01"],
    ["zero", 0],
    ["null", null],
    ["undefined", undefined],
  ] as const)("rejects %s", (_, companyId) => {
    expect(isOwnerCompany(companyId)).toBe(false);
  });
});
