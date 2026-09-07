import { describe, expect, it } from "vitest";

import type { TenantCategoryTree } from "@/domain/serviceDesk";

import { findTenantCategories } from "./tenantCategory";

const tenantCategoryTrees: TenantCategoryTree[] = [
  {
    id: "tenant-1",
    companyId: "company-1",
    name: { en: "Tenant" },
    color: "#2563eb",
    active: true,
    categories: [],
  },
];

describe("findTenantCategories", () => {
  it("returns an empty collection for a tenant without categories", () => {
    expect(findTenantCategories(tenantCategoryTrees, "tenant-1")).toEqual([]);
  });

  it("returns undefined when the tenant cannot be found", () => {
    expect(
      findTenantCategories(tenantCategoryTrees, "missing"),
    ).toBeUndefined();
  });
});
