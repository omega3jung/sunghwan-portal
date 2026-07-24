import { DbTenantCategoryTree } from "@/feature/serviceDesk/category/";

import { demoCorporationCategoryMock, demoEnergyCategoryMock } from "./client";
import { internalCategoryMock } from "./internal";

const getPortalCategory = (
  tenantCategory: DbTenantCategoryTree,
): DbTenantCategoryTree => {
  return {
    ...tenantCategory,
    category: tenantCategory.category.filter(
      (cat) => cat.category_scope === "PORTAL",
    ),
  };
};

export const internalCategorySettingsMock: DbTenantCategoryTree[] = [
  internalCategoryMock,
  getPortalCategory(demoCorporationCategoryMock),
  getPortalCategory(demoEnergyCategoryMock),
];

export const clientCategorySettingsMock: DbTenantCategoryTree[] = [
  demoCorporationCategoryMock,
  demoEnergyCategoryMock,
];
