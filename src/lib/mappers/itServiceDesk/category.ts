import {
  Category,
  CategoryTranslations,
  ClientCategoryTree,
  MainCategory,
} from "@/feature/it-service-desk/types";
import { Locale } from "@/types";

import { ArrayMapper, Mapper } from "../utils";

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
  category_index: number;
  category_agent: string[];
  category_active: boolean;
  category_translation: DbCategoryTranslations;
}

export interface DbCategoryI18n {
  category_name: string;
  category_description?: string;
  category_placeholder?: string;
}

type DefaultLocale = "en";
type OptionalLocale = Exclude<Locale, DefaultLocale>;

type DbCategoryTranslations = Record<DefaultLocale, DbCategoryI18n> &
  Partial<Record<OptionalLocale, DbCategoryI18n>>;

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
    index: item.category_index,
    agents: item.category_agent,
    active: item.category_active,
    translations: camelTranslationMapper(item.category_translation),
    subCategories: camelSubCategoryMapper(item.sub_category),
  }));
};

const camelSubCategoryMapper: ArrayMapper<DbCategory, Category> = (data) => {
  return data.map((item) => ({
    id: item.category_id,
    index: item.category_index,
    agents: item.category_agent,
    active: item.category_active,
    translations: camelTranslationMapper(item.category_translation),
  }));
};

export const camelTranslationMapper: Mapper<
  DbCategoryTranslations,
  CategoryTranslations
> = (data) => {
  return Object.fromEntries(
    Object.entries(data).map(([locale, value]) => [
      locale,
      {
        name: value.category_name,
        description: value.category_description,
        placeholder: value.category_placeholder,
      },
    ]),
  ) as CategoryTranslations;
};

export const snakeCategoryMapper: ArrayMapper<MainCategory, DbCategory> = (
  data,
) => {
  return data.map((item) => ({
    category_id: item.id,
    category_index: item.index,
    category_agent: item.agents,
    category_active: item.active,
    category_translation: snakeTranslationMapper(item.translations),
    sub_category: snakeSubCategoryMapper(item.subCategories),
  }));
};

const snakeSubCategoryMapper: ArrayMapper<Category, DbCategory> = (data) => {
  return data.map((item) => ({
    category_id: item.id,
    category_index: item.index,
    category_agent: item.agents,
    category_active: item.active,
    category_translation: snakeTranslationMapper(item.translations),
  }));
};

const snakeTranslationMapper: Mapper<
  CategoryTranslations,
  DbCategoryTranslations
> = (data) => {
  return Object.fromEntries(
    Object.entries(data).map(([locale, value]) => [
      locale,
      {
        category_name: value.name,
        category_description: value.description,
        category_placeholder: value.placeholder,
      },
    ]),
  ) as DbCategoryTranslations;
};
