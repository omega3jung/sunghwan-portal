import { LocalizedText } from "@/shared/types";

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
  name: LocalizedText;
  description?: LocalizedText;
  placeholder?: LocalizedText;
  index: number;
  active: boolean;
}
