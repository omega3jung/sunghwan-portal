// src/mocks/domain/serviceDesk/categories/internal/index.ts

import {
  DbCategory,
  DbTenantCategoryTree,
} from "@/feature/serviceDesk/category";

import { internalTenantMock } from "../../tenants";
import { internalAccountAccessMock } from "./accountAccess";
import { internalClientUserSupportMock } from "./clientUserSupport";
import { internalDataInfoManagementMock } from "./dataInfoManagement";
import { internalHardwareDeviceMock } from "./hardwareDevice";
import { internalHrSystemPayrollMock } from "./hrSystemPayroll";
import { internalNetworkConnectivityMock } from "./networkConnectivity";
import { internalOtherInquiryMock } from "./otherInquiry";
import { internalPortalSystemIssueMock } from "./portalSystemIssue";
import { internalPrintingOfficeEquipmentMock } from "./printingOfficeEquipment";
import { internalSoftwareApplicationMock } from "./softwareApplication";

const internalCategories: DbCategory[] = [
  internalPortalSystemIssueMock,
  internalAccountAccessMock,
  internalHardwareDeviceMock,
  internalSoftwareApplicationMock,
  internalNetworkConnectivityMock,
  internalPrintingOfficeEquipmentMock,
  internalHrSystemPayrollMock,
  internalDataInfoManagementMock,
  internalClientUserSupportMock,
  internalOtherInquiryMock,
];

export const internalCategoryMock: DbTenantCategoryTree = {
  ...internalTenantMock,
  category: internalCategories,
};

export { internalAccountAccessMock } from "./accountAccess";
export { internalClientUserSupportMock } from "./clientUserSupport";
export { internalDataInfoManagementMock } from "./dataInfoManagement";
export { internalHardwareDeviceMock } from "./hardwareDevice";
export { internalHrSystemPayrollMock } from "./hrSystemPayroll";
export { internalNetworkConnectivityMock } from "./networkConnectivity";
export { internalOtherInquiryMock } from "./otherInquiry";
export { internalPortalSystemIssueMock } from "./portalSystemIssue";
export { internalPrintingOfficeEquipmentMock } from "./printingOfficeEquipment";
export { internalSoftwareApplicationMock } from "./softwareApplication";
