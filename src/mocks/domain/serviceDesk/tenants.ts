import type { DbTenant } from "@/feature/serviceDesk/tenant/types";

import { internalCompanyMock } from "../organization/companies";

export const internalTenantMock: DbTenant = {
  tenant_id: internalCompanyMock.company_id,
  tenant_company_id: internalCompanyMock.company_id,
  tenant_name: internalCompanyMock.company_name,
  tenant_color: "#345791", // blue
  tenant_active: true,
};

const demoCorporationTenantMock: DbTenant = {
  tenant_id: 11,
  tenant_company_id: 11,
  tenant_name: {
    en: "Client Demo Corporation",
    es: "Corporación de demostración de clientes",
    fr: "Client Demo Corporation",
    ko: "클라이언트 데모 법인",
  },
  tenant_color: "#B22222", // red
  tenant_active: true,
};

const demoEnergyTenantMock: DbTenant = {
  tenant_id: 13,
  tenant_company_id: 13,
  tenant_name: {
    en: "Client Demo Energy",
    es: "Demostración energética para clientes",
    fr: "Démonstration client énergie",
    ko: "클라이언트 데모 에너지",
  },
  tenant_color: "#006400", // green
  tenant_active: true,
};

export const clientTenantsMock: DbTenant[] = [
  demoCorporationTenantMock,
  demoEnergyTenantMock,
];
