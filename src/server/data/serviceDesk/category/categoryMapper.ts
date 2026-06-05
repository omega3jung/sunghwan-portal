import { CategoryDto, SubCategoryDto } from "./categoryDto";
import { CategoryRow } from "./categoryRow";

type ParentCategoryRow = CategoryRow & {
  cat_parent_id: null;
  cat_scope: NonNullable<CategoryRow["cat_scope"]>;
  cat_default_priority: NonNullable<CategoryRow["cat_default_priority"]>;
  cat_default_risk_level: NonNullable<CategoryRow["cat_default_risk_level"]>;
  cat_default_sla_days: NonNullable<CategoryRow["cat_default_sla_days"]>;
};

function assertParentCategoryRow(
  row: CategoryRow,
): asserts row is ParentCategoryRow {
  if (row.cat_parent_id !== null) {
    throw new Error(`Expected main category row: ${row.cat_id}`);
  }

  if (
    row.cat_scope === null ||
    row.cat_default_priority === null ||
    row.cat_default_risk_level === null ||
    row.cat_default_sla_days === null
  ) {
    throw new Error(`Invalid main category row: ${row.cat_id}`);
  }
}

export function mapCategoryRowToSubCategoryDto(
  row: CategoryRow,
): SubCategoryDto {
  return {
    category_id: Number(row.cat_id),
    category_name: row.cat_name,
    category_description: row.cat_description,
    category_request_template: row.cat_request_template,
    category_index: row.cat_index,
    category_active: row.cat_active,
    default_priority: row.cat_default_priority,
    default_risk_level: row.cat_default_risk_level,
    default_sla_days: row.cat_default_sla_days,
  };
}

export function mapCategoryRowToCategoryDto(row: CategoryRow): CategoryDto {
  assertParentCategoryRow(row);

  return {
    category_id: Number(row.cat_id),
    category_name: row.cat_name,
    category_description: row.cat_description,
    category_request_template: row.cat_request_template,
    category_index: row.cat_index,
    category_active: row.cat_active,
    category_scope: row.cat_scope,
    default_priority: row.cat_default_priority,
    default_risk_level: row.cat_default_risk_level,
    default_sla_days: row.cat_default_sla_days,
    sub_category: [],
  };
}

export function mapCategoryRowsToDtos(rows: CategoryRow[]): CategoryDto[] {
  const categoryMap = new Map<number, CategoryDto>();

  for (const row of rows) {
    if (row.cat_parent_id === null) {
      const category = mapCategoryRowToCategoryDto(row);
      categoryMap.set(category.category_id, category);
      continue;
    }

    const parentCategory = categoryMap.get(Number(row.cat_parent_id));

    if (!parentCategory) {
      throw new Error(
        `Parent category not found for sub category: ${row.cat_id} -> ${row.cat_parent_id}`,
      );
    }

    parentCategory.sub_category.push(mapCategoryRowToSubCategoryDto(row));
  }

  return Array.from(categoryMap.values());
}
