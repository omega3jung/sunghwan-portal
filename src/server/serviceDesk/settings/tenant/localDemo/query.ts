import { filterItemsByQuery } from "@/app/api/_helpers/filter";
import {
  getBooleanRuleGroupValue,
  parseRuleGroupFilter,
} from "@/server/shared/query";

import { getLocalDemoTenants } from "../../state";
import { listTenants, normalizeTenant } from "./tenantUtils";

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
