import {
  DbCategory,
  DbClientCategoryTree,
  DbSubCategory,
} from "@/feature/serviceDesk/category/mapper";

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

export const internalCategorySettingsMock: DbClientCategoryTree[] = [
  {
    client_id: 1,
    client_name: "Internal Demo Corporation",
    client_color: "#345791",
    category: internalCategoryMock,
  },
  {
    client_id: 11,
    client_name: "Client Demo Corporation",
    client_color: "#B22222",
    category: [clientPortalSystemIssueCategoryMock],
  },
  {
    client_id: 12,
    client_name: "Client Demo Industry",
    client_color: "#006400",
    category: [mergeClientCustomCategory(clientCustomIssueSubCategoryMock)],
  },
];

export const clientCategorySettingsMock: DbClientCategoryTree[] = [
  {
    client_id: 11,
    client_name: "Client Demo Corporation",
    client_color: "#B22222",
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
