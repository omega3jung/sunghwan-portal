import {
  DbCategory,
  DbClientCategoryTree,
} from "@/api/itServiceDesk/category/mapper";

import accountAccessCategoryMock from "./accountAccess.json";
import clientUserSupportCategoryMock from "./clientUserSupport.json";
import dataInfoManagementCategoryMock from "./dataInfoManagement.json";
import hardwareDeviceCategoryMock from "./hardwareDevice.json";
import hrSystemPayrollCategoryMock from "./hrSystemPayroll.json";
import internalPortalSystemIssueCategoryMock from "./internalPortalSystemIssue.json";
import networkConnectivityCategoryMock from "./networkConnectivity.json";
import otherInquiryCategoryMock from "./otherInquiry.json";
import printingOfficeEquipmentCategoryMock from "./printingOfficeEquipment.json";
import softwareApplicationCategoryMock from "./softwareApplication.json";
import tenantCustomIssueSubCategoryMock from "./tenantCustomIssue.json";
import tenantPortalSystemIssueCategoryMock from "./tenantPortalSystemIssue.json";

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
    client_id: "internal",
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
    client_id: "tenant_1",
    client_name: "Tenant Demo Corporation",
    client_color: "#B22222",
    category: [tenantPortalSystemIssueCategoryMock],
  },
  {
    client_id: "tenant_2",
    client_name: "Tenant Demo Industry",
    client_color: "#006400",
    category: [mergeTenantCustomCategory(tenantCustomIssueSubCategoryMock)],
  },
];

export const tenantCategorySettingsMock: DbClientCategoryTree[] = [
  {
    client_id: "tenant_1",
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
