import { getLocalDemoTenants } from "@/app/api/_adapters/localDemo/serviceDesk/settings/state";
import { filterItemsByQuery } from "@/lib/application/api/query";
import {
  getBooleanRuleGroupValue,
  parseRuleGroupFilter,
} from "@/lib/application/api/query";

import { listTenants, normalizeTenant } from "./tenantUtils";

/** Returns tenants from the server-side LOCAL settings adapter. */
export const localListTenants = ({
  searchParams,
}: {
  searchParams: URLSearchParams;
}) => {
  const filter = parseRuleGroupFilter(searchParams.get("filter"));
  const active =
    parseOptionalBoolean(searchParams.get("active")) ??
    getBooleanRuleGroupValue(filter, "active");
  const tenants = listTenants(getLocalDemoTenants())
    .map(normalizeTenant)
    .filter((tenant) => active === null || tenant.active === active);
  const items = filterItemsByQuery(
    searchParams,
    tenants,
  );

  return {
    items,
    total: items.length,
  };
};

/** Returns tenant from the server-side LOCAL settings adapter. */
export const localGetTenant = ({ id }: { id: string }) => {
  const targetTenant = listTenants(getLocalDemoTenants()).find(
    (tenant) => String(tenant.tenant_id) === id,
  );

  if (!targetTenant) {
    return null;
  }

  return normalizeTenant(targetTenant);
};

function parseOptionalBoolean(value: string | null): boolean | null {
  if (value === null) {
    return null;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return null;
}
