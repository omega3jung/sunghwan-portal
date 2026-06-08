import z from "zod";

export const localizedTextSchema = z
  .object({
    en: z.string(),
  })
  .catchall(z.string());

export const tenantSchema = z.object({
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

export const saveTenantListSchema = z.object({
  tenants: z.array(tenantSchema),
});
