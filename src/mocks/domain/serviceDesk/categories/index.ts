import {
  DbCategory,
  DbSubCategory,
  DbTenantCategoryTree,
} from "@/feature/serviceDesk/category/";

import { clientTenantsMock, internalTenantMock } from "../tenants";
import accountAccessCategoryMock from "./accountAccess";
import clientCustomIssueSubCategoryMock from "./clientCustomIssue";
import clientPortalSystemIssueCategoryMock from "./clientPortalSystemIssue";
import clientUserSupportCategoryMock from "./clientUserSupport";
import dataInfoManagementCategoryMock from "./dataInfoManagement";
import hardwareDeviceCategoryMock from "./hardwareDevice";
import hrSystemPayrollCategoryMock from "./hrSystemPayroll";
import internalPortalSystemIssueCategoryMock from "./internalPortalSystemIssue";
import networkConnectivityCategoryMock from "./networkConnectivity";
import otherInquiryCategoryMock from "./otherInquiry";
import printingOfficeEquipmentCategoryMock from "./printingOfficeEquipment";
import softwareApplicationCategoryMock from "./softwareApplication";

const mergeClientCustomCategory = (customSubCategory: DbSubCategory[]) => {
  return {
    ...clientPortalSystemIssueCategoryMock,
    sub_category: [
      ...clientPortalSystemIssueCategoryMock.sub_category,
      ...customSubCategory,
    ],
  };
};

export const internalCategoryMock: DbCategory[] = [
  internalPortalSystemIssueCategoryMock,
  accountAccessCategoryMock,
  hardwareDeviceCategoryMock,
  softwareApplicationCategoryMock,
  networkConnectivityCategoryMock,
  printingOfficeEquipmentCategoryMock,
  hrSystemPayrollCategoryMock,
  dataInfoManagementCategoryMock,
  clientUserSupportCategoryMock,
  otherInquiryCategoryMock,
];

export const internalCategorySettingsMock: DbTenantCategoryTree[] = [
  {
    ...internalTenantMock,
    category: internalCategoryMock,
  },
  {
    ...clientTenantsMock[0],
    category: [clientPortalSystemIssueCategoryMock],
  },
  {
    ...clientTenantsMock[1],
    category: [mergeClientCustomCategory(clientCustomIssueSubCategoryMock)],
  },
];

export const clientCategorySettingsMock: DbTenantCategoryTree[] = [
  {
    ...clientTenantsMock[0],
    category: [
      clientPortalSystemIssueCategoryMock,
      accountAccessCategoryMock,
      hardwareDeviceCategoryMock,
      softwareApplicationCategoryMock,
      networkConnectivityCategoryMock,
      printingOfficeEquipmentCategoryMock,
      hrSystemPayrollCategoryMock,
    ],
  },
];
