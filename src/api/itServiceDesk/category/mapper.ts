import {
  Category,
  ClientCategoryTree,
  MainCategory,
} from "@/domain/itServiceDesk";
import { ArrayMapper, LocalizedText } from "@/shared/types";

// back-end data structures.
export type DbClient = {
  client_id: string;
  client_name: string;
  client_color: string;
};

export type DbClientCategoryTree = DbClient & { category: DbMainCategory[] };

export type DbMainCategory = DbCategory & {
  sub_category: DbCategory[];
};

export interface DbCategory {
  category_id: string; // string number. can use parseInt.
  category_name: LocalizedText;
  category_description?: LocalizedText;
  category_placeholder?: LocalizedText;
  category_index: number;
  category_agent: string[];
  category_active: boolean;
}

export const camelClientCategoryTreeMapper: ArrayMapper<
  DbClientCategoryTree,
  ClientCategoryTree
> = (data) => {
  return data.map((item) => ({
    id: item.client_id,
    name: item.client_name,
    color: item.client_color,
    category: camelCategoryMapper(item.category),
  }));
};

export const camelCategoryMapper: ArrayMapper<DbMainCategory, MainCategory> = (
  data,
) => {
  return data.map((item) => ({
    id: item.category_id,
    name: item.category_name,
    description: item.category_description,
    placeholder: item.category_placeholder,
    index: item.category_index,
    agents: item.category_agent,
    active: item.category_active,
    subCategories: camelSubCategoryMapper(item.sub_category),
  }));
};

const camelSubCategoryMapper: ArrayMapper<DbCategory, Category> = (data) => {
  return data.map((item) => ({
    id: item.category_id,
    name: item.category_name,
    description: item.category_description,
    placeholder: item.category_placeholder,
    index: item.category_index,
    agents: item.category_agent,
    active: item.category_active,
  }));
};

export const snakeCategoryMapper: ArrayMapper<MainCategory, DbCategory> = (
  data,
) => {
  return data.map((item) => ({
    category_id: item.id,
    category_name: item.name,
    category_description: item.description,
    category_placeholder: item.placeholder,
    category_index: item.index,
    category_agent: item.agents,
    category_active: item.active,
    sub_category: snakeSubCategoryMapper(item.subCategories),
  }));
};

const snakeSubCategoryMapper: ArrayMapper<Category, DbCategory> = (data) => {
  return data.map((item) => ({
    category_id: item.id,
    category_name: item.name,
    category_description: item.description,
    category_placeholder: item.placeholder,
    category_index: item.index,
    category_agent: item.agents,
    category_active: item.active,
  }));
};
