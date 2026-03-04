import {
  DbCategory,
  DbClientCategoryTree,
} from "@/api/serviceDesk/category/mapper";

import accountAccessCategoryMock from "./accountAccess";
import clientUserSupportCategoryMock from "./clientUserSupport";
import dataInfoManagementCategoryMock from "./dataInfoManagement";
import hardwareDeviceCategoryMock from "./hardwareDevice";
import hrSystemPayrollCategoryMock from "./hrSystemPayroll";
import internalPortalSystemIssueCategoryMock from "./internalPortalSystemIssue";
import networkConnectivityCategoryMock from "./networkConnectivity";
import otherInquiryCategoryMock from "./otherInquiry";
import printingOfficeEquipmentCategoryMock from "./printingOfficeEquipment";
import softwareApplicationCategoryMock from "./softwareApplication";
import tenantCustomIssueSubCategoryMock from "./tenantCustomIssue";
import tenantPortalSystemIssueCategoryMock from "./tenantPortalSystemIssue";

const mergeTenantCustomCategory = (customSubCategory: DbCategory[]) => {
  return {
    ...tenantPortalSystemIssueCategoryMock,
    sub_category: [
      ...tenantPortalSystemIssueCategoryMock.sub_category,
      ...customSubCategory,
    ],
  };
};

export const internalCategorySettingsMock: DbClientCategoryTree[] = [
  {
    client_id: 1,
    client_name: "Internal Demo Corporation",
    client_color: "#345791",
    category: [
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
    ],
  },
  {
    client_id: 11,
    client_name: "Tenant Demo Corporation",
    client_color: "#B22222",
    category: [tenantPortalSystemIssueCategoryMock],
  },
  {
    client_id: 12,
    client_name: "Tenant Demo Industry",
    client_color: "#006400",
    category: [mergeTenantCustomCategory(tenantCustomIssueSubCategoryMock)],
  },
];

export const tenantCategorySettingsMock: DbClientCategoryTree[] = [
  {
    client_id: 11,
    client_name: "Tenant Demo Corporation",
    client_color: "#B22222",
    category: [
      tenantPortalSystemIssueCategoryMock,
      accountAccessCategoryMock,
      hardwareDeviceCategoryMock,
      softwareApplicationCategoryMock,
      networkConnectivityCategoryMock,
      printingOfficeEquipmentCategoryMock,
      hrSystemPayrollCategoryMock,
    ],
  },
];
