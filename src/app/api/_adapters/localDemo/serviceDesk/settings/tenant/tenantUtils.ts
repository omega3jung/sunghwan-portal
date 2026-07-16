import {
  getLocalDemoTenants,
  getMutableLocalDemoCategories,
} from "@/app/api/_adapters/localDemo/serviceDesk/settings/state";
import type { Tenant } from "@/domain/serviceDesk";
import { createIncrementalIdAssigner } from "@/lib/application/api";
import { idToNumber } from "@/lib/application/api/mapId";
import type { DbTenantCategoryTree } from "@/lib/application/contracts/serviceDesk";
import type { DbTenant } from "@/lib/application/contracts/serviceDesk";
import { camelTenantMapper } from "@/lib/application/contracts/serviceDesk";

const compareTenants = (left: DbTenant, right: DbTenant) =>
  left.tenant_id - right.tenant_id;

const compareTenantTrees = (
  left: DbTenantCategoryTree,
  right: DbTenantCategoryTree,
) => left.tenant_id - right.tenant_id;

const matchesTenant = (tenant: DbTenant, value: string) =>
  String(tenant.tenant_id) === value;

const toTenantTree = (tenant: DbTenant): DbTenantCategoryTree => ({
  tenant_id: tenant.tenant_id,
  tenant_company_id: tenant.tenant_company_id,
  tenant_name: tenant.tenant_name,
  tenant_color: tenant.tenant_color,
  tenant_active: tenant.tenant_active,
  category: [],
});

const sortTenantTreeStore = (items: DbTenantCategoryTree[]) => {
  items.sort(compareTenantTrees);
};

const upsertTenantTree = ({
  isInternal,
  tenant,
  allowInsert,
}: {
  isInternal: boolean;
  tenant: DbTenant;
  allowInsert: boolean;
}) => {
  const items = getMutableLocalDemoCategories(isInternal);
  const tenantIndex = items.findIndex(
    (item) =>
      String(item.tenant_id) === String(tenant.tenant_id) ||
      String(item.tenant_company_id) === String(tenant.tenant_company_id),
  );

  if (tenantIndex >= 0) {
    items.splice(tenantIndex, 1, {
      ...items[tenantIndex],
      tenant_id: tenant.tenant_id,
      tenant_company_id: tenant.tenant_company_id,
      tenant_name: tenant.tenant_name,
      tenant_color: tenant.tenant_color,
      tenant_active: tenant.tenant_active,
    });
    sortTenantTreeStore(items);
    return;
  }

  if (!allowInsert || tenant.tenant_active === false) {
    return;
  }

  items.push(toTenantTree(tenant));
  sortTenantTreeStore(items);
};

export const listTenants = (items = getLocalDemoTenants()) => {
  return items
    .slice()
    .sort(compareTenants);
};

export const normalizeTenant = (tenant: DbTenant): Tenant => {
  return camelTenantMapper([tenant])[0] as Tenant;
};

export const findTenantIndexById = (items: DbTenant[], id: string) => {
  return items.findIndex((tenant) => matchesTenant(tenant, id));
};

export const createTenantIdAssigner = (items: DbTenant[]) => {
  const assignNextId = createIncrementalIdAssigner(
    items.map((tenant) => tenant.tenant_id),
  );

  return (value?: string) => {
    const parsedId = value ? idToNumber(value) : null;

    if (parsedId !== null) {
      return parsedId;
    }

    return Number(assignNextId());
  };
};

export const sortTenants = (items: DbTenant[]) => {
  items.sort(compareTenants);
};

export const syncTenantAcrossSettings = (tenant: DbTenant) => {
  upsertTenantTree({
    isInternal: true,
    tenant,
    allowInsert: true,
  });
  upsertTenantTree({
    isInternal: false,
    tenant,
    allowInsert: false,
  });
};
