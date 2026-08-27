import { describe, expect, it, vi } from "vitest";

import type { SaveServiceDeskCategoryTreePayload } from "@/lib/application/contracts/serviceDesk";
import type { PortalApiQueryExecutor } from "@/server/shared/supabase/portalApiClient";

const categoryServices = vi.hoisted(() => ({
  createCategory: vi.fn(),
  updateCategoryById: vi.fn(),
}));

vi.mock("@/server/data/serviceDesk/category", () => ({
  ...categoryServices,
  getCategorySettingsResponseByTenantId: vi.fn(),
  getServiceDeskCategoryContext: vi.fn(),
  validateCategoryTreeMutation: vi.fn(),
}));

import { saveCategoryTreeInTransaction } from "./categoryApiHandler";

const category = (name: string) => ({
  name: { en: name },
  scope: "PORTAL" as const,
  index: 0,
  active: false,
  defaultPriority: "medium" as const,
  defaultRiskLevel: "medium" as const,
  defaultSlaDays: 1,
  subCategories: [],
});

describe("REMOTE Category tree save", () => {
  it("uses one transaction executor and propagates a middle failure", async () => {
    const query = vi.fn() as unknown as PortalApiQueryExecutor;
    const payload: SaveServiceDeskCategoryTreePayload = {
      tenantId: "2",
      categories: [category("first"), category("second")],
    };
    categoryServices.createCategory
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(new Error("middle failure"));

    await expect(saveCategoryTreeInTransaction(payload, query)).rejects.toThrow(
      "middle failure",
    );

    expect(categoryServices.createCategory).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ category_tenant_id: 2 }),
      query,
    );
    expect(categoryServices.createCategory).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ category_tenant_id: 2 }),
      query,
    );
  });
});
