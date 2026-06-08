import type { DbTenant } from "@/feature/serviceDesk/tenant/types";

import {
  clientCompaniesMock,
  internalCompanyMock,
} from "../organization/companies";

const clientTenantColors = [
  "#B22222", // red.
  "#006400", // green.
  "#FFF4E5", // muted orange
  "#E8F7F6", // teal
  "#F2ECFF", // purple
  "#F5EFEA", // brown
  "#F9EDF5", // muted pink
  "#E9F0FF", // deep blue
  "#F3F3F3", // gray
];

const tenantCompanyIds = [11, 12];

const createClientTenantMock = (): DbTenant[] => {
  const colorCount = clientTenantColors.length;
  const clientTenants = clientCompaniesMock.filter((company) =>
    tenantCompanyIds.includes(company.company_id),
  );

  return clientTenants.map((company, idx) => {
    return {
      tenant_id: company.company_id,
      tenant_company_id: company.company_id,
      tenant_name: company.company_name,
      tenant_color: clientTenantColors[colorCount % (idx + 1)],
    };
  });
};

export const internalTenantMock: DbTenant = {
  tenant_id: internalCompanyMock.company_id,
  tenant_company_id: internalCompanyMock.company_id,
  tenant_name: internalCompanyMock.company_name,
  tenant_color: "#345791", // blue
};

export const clientTenantsMock: DbTenant[] = createClientTenantMock();
