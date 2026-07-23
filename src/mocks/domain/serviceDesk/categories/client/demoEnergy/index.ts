// src/mocks/domain/serviceDesk/categories/client/demoEnergy/index.ts

import type {
  DbCategory,
  DbTenantCategoryTree,
} from "@/feature/serviceDesk/category";

import { clientTenantsMock } from "../../../tenants";
import { clientAccountAccessMock } from "./accountAccess";
import { clientDataInfoManagementMock } from "./dataInfoManagement";
import { clientHardwareDeviceMock } from "./hardwareDevice";
import { clientHrSystemPayrollMock } from "./hrSystemPayroll";
import { clientOtherInquiryMock } from "./otherInquiry";
import { clientPortalSystemIssueMock } from "./portalSystemIssue";
import { clientSoftwareApplicationMock } from "./softwareApplication";

const clientCategories: DbCategory[] = [
  clientPortalSystemIssueMock,
  clientAccountAccessMock,
  clientHardwareDeviceMock,
  clientSoftwareApplicationMock,
  clientDataInfoManagementMock,
  clientHrSystemPayrollMock,
  clientOtherInquiryMock,
];

const DEMO_ENERGY_ID = 13;
const demoEnergyTenant = clientTenantsMock.find(
  (tenant) => tenant.tenant_id === DEMO_ENERGY_ID,
);

if (!demoEnergyTenant) {
  throw new Error(
    `[service desk category mock] Missing tenant ${DEMO_ENERGY_ID}.`,
  );
}

export const demoEnergyCategoryMock: DbTenantCategoryTree = {
  ...demoEnergyTenant,
  category: clientCategories,
};

export { clientAccountAccessMock } from "./accountAccess";
export { clientDataInfoManagementMock } from "./dataInfoManagement";
export { clientHardwareDeviceMock } from "./hardwareDevice";
export { clientHrSystemPayrollMock } from "./hrSystemPayroll";
export { clientOtherInquiryMock } from "./otherInquiry";
export { clientPortalSystemIssueMock } from "./portalSystemIssue";
export { clientSoftwareApplicationMock } from "./softwareApplication";
