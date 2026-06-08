import { filterItemsByQuery } from "@/app/api/_helpers/filter";

import { getLocalDemoTenants } from "../../state";
import { listActiveTenants, normalizeTenant } from "./tenantUtils";

export const localListTenants = ({
  searchParams,
}: {
  searchParams: URLSearchParams;
}) => {
  const items = filterItemsByQuery(
    searchParams,
    listActiveTenants(getLocalDemoTenants()).map(normalizeTenant),
  );

  return {
    items,
    total: items.length,
  };
};

export const localGetTenant = ({ id }: { id: string }) => {
  const targetTenant = listActiveTenants(getLocalDemoTenants()).find(
    (tenant) => String(tenant.tenant_id) === id,
  );

  if (!targetTenant) {
    return null;
  }

  return normalizeTenant(targetTenant);
};
