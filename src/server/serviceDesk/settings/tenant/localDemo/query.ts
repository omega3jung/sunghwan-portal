import { filterItemsByQuery } from "@/app/api/_helpers/filter";

import { getLocalDemoTenants } from "../../state";
import { listTenants, normalizeTenant } from "./tenantUtils";

export const localListTenants = ({
  searchParams,
}: {
  searchParams: URLSearchParams;
}) => {
  const items = filterItemsByQuery(
    searchParams,
    listTenants(getLocalDemoTenants()).map(normalizeTenant),
  );

  return {
    items,
    total: items.length,
  };
};

export const localGetTenant = ({ id }: { id: string }) => {
  const targetTenant = listTenants(getLocalDemoTenants()).find(
    (tenant) => String(tenant.tenant_id) === id,
  );

  if (!targetTenant) {
    return null;
  }

  return normalizeTenant(targetTenant);
};
