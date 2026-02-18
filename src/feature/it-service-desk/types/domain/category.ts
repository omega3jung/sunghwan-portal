import { Locale } from "@/types";

// tenant data structure.
export type Client = {
  id: string;
  name: string;
  color: string;
};

// category data structure.
export type ClientCategoryTree = Client & { category: MainCategory[] };

export type MainCategory = Category & {
  subCategories: Category[];
};

export interface Category {
  id: string; // string number. can use parseInt.
  index: number;
  agents: string[]; // string number. can use parseInt.
  active: boolean;
  translations: CategoryTranslations;
}

export interface CategoryI18n {
  name: string;
  description?: string;
  placeholder?: string;
}

type DefaultLocale = "en";
type OptionalLocale = Exclude<Locale, DefaultLocale>;

export type CategoryTranslations = Record<DefaultLocale, CategoryI18n> &
  Partial<Record<OptionalLocale, CategoryI18n>>;
