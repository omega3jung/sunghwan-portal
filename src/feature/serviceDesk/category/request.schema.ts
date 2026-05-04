import z from "zod";

import type { LocalizedText } from "@/shared/types";

export const localizedTextSchema = z
  .object({
    en: z.string(),
  })
  .catchall(z.string());

const optionalLocalizedTextSchema = z
  .object({})
  .catchall(z.string())
  .transform<LocalizedText>((value) => {
    if (typeof value.en === "string") {
      return value as LocalizedText;
    }

    const fallback =
      Object.values(value).find((entry) => entry.trim().length > 0) ?? "";

    return {
      en: fallback,
      ...value,
    };
  });

export const subCategorySchema = z.object({
  id: z.string().optional(),
  name: localizedTextSchema,
  description: optionalLocalizedTextSchema.optional(),
  requestTemplate: optionalLocalizedTextSchema.optional(),
  index: z.number().int().nonnegative(),
  active: z.boolean(),
  defaultPriority: z.enum(["urgent", "high", "medium", "low"]).optional(),
  defaultRiskLevel: z.enum(["critical", "high", "medium", "low"]).optional(),
  defaultSlaDays: z.number().int().nonnegative().optional(),
});

export const categorySchema = z.object({
  id: z.string().optional(),
  clientId: z.string().min(1).optional(),
  name: localizedTextSchema,
  description: optionalLocalizedTextSchema.optional(),
  requestTemplate: optionalLocalizedTextSchema.optional(),
  scope: z.enum(["PORTAL", "INTERNAL"]),
  index: z.number().int().nonnegative(),
  active: z.boolean(),
  defaultPriority: z.enum(["urgent", "high", "medium", "low"]),
  defaultRiskLevel: z.enum(["critical", "high", "medium", "low"]),
  defaultSlaDays: z.number().int().nonnegative(),
  subCategories: z.array(subCategorySchema),
});

export const createCategorySchema = categorySchema.extend({
  clientId: z.string().min(1),
});

export const updateCategorySchema = z.object({
  clientId: z.string().min(1).optional(),
  name: localizedTextSchema,
  description: optionalLocalizedTextSchema.optional(),
  requestTemplate: optionalLocalizedTextSchema.optional(),
  scope: z.enum(["PORTAL", "INTERNAL"]),
  index: z.number().int().nonnegative(),
  active: z.boolean(),
  defaultPriority: z.enum(["urgent", "high", "medium", "low"]),
  defaultRiskLevel: z.enum(["critical", "high", "medium", "low"]),
  defaultSlaDays: z.number().int().nonnegative(),
  subCategories: z.array(subCategorySchema),
});

export const saveCategoryTreeSchema = z.object({
  clientId: z.string().min(1),
  categories: z.array(categorySchema.omit({ clientId: true })),
});
