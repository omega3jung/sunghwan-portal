import z from "zod";

const localizedTextSchema = z
  .object({
    en: z.string(),
  })
  .catchall(z.string());

const tenantSchema = z.object({
  id: z.string().optional(),
  companyId: z.string().min(1),
  name: localizedTextSchema,
  color: z.string().optional(),
  active: z.boolean().optional(),
});

export const createTenantSchema = tenantSchema.omit({
  id: true,
});

export const updateTenantSchema = tenantSchema.omit({
  id: true,
});
