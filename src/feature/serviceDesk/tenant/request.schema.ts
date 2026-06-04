import z from "zod";

export const localizedTextSchema = z
  .object({
    en: z.string(),
  })
  .catchall(z.string());

export const tenantSchema = z.object({
  id: z.string().optional(),
  companyId: z.string(),
  name: localizedTextSchema,
  color: z.string().optional(),
});

export const saveTenantListSchema = z.object({
  tenants: z.array(tenantSchema),
});
