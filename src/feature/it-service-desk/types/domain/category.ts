import { Locale } from "@/types";

import { User } from "../shared";

type Agent = User;

// back-end data structure.
export type Client = {
  client_id: string;
  client_name: string;
  client_color: string;
};

// front-end data structure.
export type FullCategories = Client & { category: MainCategory[] };

export type MainCategory = Category & {
  sub_category: Category[];
};

export interface Category {
  category_id: string; // toString(number). can use parseInt.
  category_index: number;
  category_agent: Agent[];
  category_active: boolean;
  category_translations: CategoryTranslations;
}

export interface CategoryI18n {
  category_name: string;
  category_description?: string;
  category_placeholder?: string;
}

type DefaultLocale = "en";
type OptionalLocale = Exclude<Locale, DefaultLocale>;

type CategoryTranslations = Record<DefaultLocale, CategoryI18n> &
  Partial<Record<OptionalLocale, CategoryI18n>>;
