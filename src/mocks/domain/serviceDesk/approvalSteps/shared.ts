import type { DbCategory } from "@/feature/serviceDesk/category";

export const categoryApprovalSettingsHelper = (
  categoryMock: DbCategory,
): Omit<DbCategory, "sub_category"> => ({
  category_id: categoryMock.category_id,
  category_name: categoryMock.category_name,
  category_description: categoryMock.category_description,
  category_request_template: categoryMock.category_request_template,
  category_index: categoryMock.category_index,
  category_active: categoryMock.category_active,
  category_scope: categoryMock.category_scope,
  default_priority: categoryMock.default_priority,
  default_risk_level: categoryMock.default_risk_level,
  default_sla_days: categoryMock.default_sla_days,
});
