// src/mocks/domain/serviceDesk/categories/client/demoCorporation/index.ts

import type {
  DbCategory,
  DbTenantCategoryTree,
} from "@/feature/serviceDesk/category";

import { clientTenantsMock } from "../../../tenants";
import { clientAccountAccessMock } from "./accountAccess";
import { clientHardwareDeviceMock } from "./hardwareDevice";
import { clientHrSystemPayrollMock } from "./hrSystemPayroll";
import { clientNetworkConnectivityMock } from "./networkConnectivity";
import { clientPortalSystemIssueMock } from "./portalSystemIssue";
import { clientPrintingOfficeEquipmentMock } from "./printingOfficeEquipment";
import { clientSoftwareApplicationMock } from "./softwareApplication";

const clientCategories: DbCategory[] = [
  clientPortalSystemIssueMock,
  clientAccountAccessMock,
  clientHardwareDeviceMock,
  clientSoftwareApplicationMock,
  clientNetworkConnectivityMock,
  clientPrintingOfficeEquipmentMock,
  clientHrSystemPayrollMock,
];

const DEMO_CORPORATION_ID = 11;
const demoCorporationTenant = clientTenantsMock.find(
  (tenant) => tenant.tenant_id === DEMO_CORPORATION_ID,
);

if (!demoCorporationTenant) {
  throw new Error(
    `[service desk category mock] Missing tenant ${DEMO_CORPORATION_ID}.`,
  );
}

export const demoCorporationCategoryMock: DbTenantCategoryTree = {
  ...demoCorporationTenant,
  category: clientCategories,
};

export { clientAccountAccessMock } from "./accountAccess";
export { clientHardwareDeviceMock } from "./hardwareDevice";
export { clientHrSystemPayrollMock } from "./hrSystemPayroll";
export { clientNetworkConnectivityMock } from "./networkConnectivity";
export { clientPortalSystemIssueMock } from "./portalSystemIssue";
export { clientPrintingOfficeEquipmentMock } from "./printingOfficeEquipment";
export { clientSoftwareApplicationMock } from "./softwareApplication";
