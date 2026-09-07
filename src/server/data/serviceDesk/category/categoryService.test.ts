import { beforeEach, describe, expect, it, vi } from "vitest";

import type { SaveServiceDeskCategoryTreePayload } from "@/lib/application/contracts/serviceDesk";

const mocks = vi.hoisted(() => ({
  getActiveTenantById: vi.fn(),
  assertCategoriesReadyForActivation: vi.fn(),
  createCategoryRow: vi.fn(),
  mapCreate: vi.fn((input) => input),
  mapSubCreate: vi.fn((_tenantId, _parentId, input) => input),
  mapRows: vi.fn(),
}));

vi.mock("../tenant", () => ({
  getActiveTenantByCompanyId: vi.fn(),
  getActiveTenantById: mocks.getActiveTenantById,
  getActiveTenants: vi.fn(),
  getServiceDeskSettingsTenantContext: vi.fn(),
}));
vi.mock("@/server/data/serviceDesk/shared", () => ({
  assertCategoriesReadyForActivation: mocks.assertCategoriesReadyForActivation,
  createServiceDeskStatusError: (message: string, status: number) =>
    Object.assign(new Error(message), { status }),
}));
vi.mock("./categoryRepository", () => ({
  createCategoryRow: mocks.createCategoryRow,
  findCategoryContextRowById: vi.fn(),
  findCategoryRowsByCompanyId: vi.fn(),
  findCategoryRowsByTenantId: vi.fn(),
  findCategoryRowsByTenantIdAndCategoryId: vi.fn(),
  updateCategoryRowById: vi.fn(),
}));
vi.mock("./categoryMapper", () => ({
  mapCategoryRowsToDtos: mocks.mapRows,
  mapCategorySubCategoryInputDtoToCreateRowInput: mocks.mapSubCreate,
  mapCategorySubCategoryInputDtoToUpdateRowInput: vi.fn(),
  mapCreateCategoryInputDtoToRowInput: mocks.mapCreate,
  mapUpdateCategoryInputDtoToRowInput: vi.fn(),
}));

import {
  assertCategoryTreeMutationAllowed,
  createCategory,
} from "./categoryService";

const principal = { permission: 9 as const, userScope: "INTERNAL" as const, companyId: 1 };
const tenant = {
  id: "7",
  companyId: 2,
  isOwnerTenant: false,
  active: true,
  operational: true,
};
const currentCategories = [
  {
    id: "10",
    scope: "PORTAL" as const,
    subCategories: [{ id: "11" }],
  },
];

describe("Category settings write service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getActiveTenantById.mockResolvedValue({ tenant_id: 7 });
  });

  it("rejects persisted categories outside the target tenant", () => {
    expect(() =>
      assertCategoryTreeMutationAllowed({
        principal,
        tenant,
        currentCategories,
        payload: createPayload({ id: "99" }),
      }),
    ).toThrow(expect.objectContaining({ status: 400 }));
  });

  it("keeps category scope immutable", () => {
    expect(() =>
      assertCategoryTreeMutationAllowed({
        principal,
        tenant,
        currentCategories,
        payload: createPayload({ id: "10", scope: "INTERNAL" }),
      }),
    ).toThrow(expect.objectContaining({ status: 400 }));
  });

  it("rejects moving a persisted subcategory to another tree", () => {
    expect(() =>
      assertCategoryTreeMutationAllowed({
        principal,
        tenant,
        currentCategories,
        payload: createPayload({ id: "10", subCategoryId: "12" }),
      }),
    ).toThrow(expect.objectContaining({ status: 400 }));
  });

  it("forces newly created main and subcategories inactive", async () => {
    mocks.createCategoryRow
      .mockResolvedValueOnce({ cat_id: 10, cat_parent_id: null })
      .mockResolvedValueOnce({ cat_id: 11, cat_parent_id: 10 });
    mocks.mapRows.mockReturnValue([{ category_id: 10 }]);

    await createCategory({
      category_tenant_id: 7,
      category_name: { en: "Main" },
      category_description: null,
      category_request_template: null,
      category_scope: "PORTAL",
      category_index: 1,
      category_active: true,
      default_priority: "medium",
      default_risk_level: "medium",
      default_sla_days: 3,
      sub_category: [
        {
          category_name: { en: "Sub" },
          category_description: null,
          category_request_template: null,
          category_index: 1,
          category_active: true,
        },
      ],
    });

    expect(mocks.mapCreate).toHaveBeenCalledWith(
      expect.objectContaining({ category_active: false }),
    );
    expect(mocks.mapSubCreate).toHaveBeenCalledWith(
      7,
      10,
      expect.objectContaining({ category_active: false }),
    );
  });
});

function createPayload({
  id,
  scope = "PORTAL",
  subCategoryId = "11",
}: {
  id: string;
  scope?: "PORTAL" | "INTERNAL";
  subCategoryId?: string;
}): SaveServiceDeskCategoryTreePayload {
  return {
    tenantId: "7",
    categories: [
      {
        id,
        name: { en: "Main" },
        index: 1,
        active: false,
        scope,
        defaultPriority: "medium",
        defaultRiskLevel: "medium",
        defaultSlaDays: 3,
        subCategories: [
          {
            id: subCategoryId,
            name: { en: "Sub" },
            index: 1,
            active: false,
          },
        ],
      },
    ],
  };
}
