import { DbAssignmentRule } from "@/api/serviceDesk/assignmentRule/mapper";

import accountAccessCategoryMock from "./categories/accountAccess";
import clientUserSupportCategoryMock from "./categories/clientUserSupport";
import dataInfoManagementCategoryMock from "./categories/dataInfoManagement";
import hardwareDeviceCategoryMock from "./categories/hardwareDevice";
import hrSystemPayrollCategoryMock from "./categories/hrSystemPayroll";
import internalPortalSystemIssueCategoryMock from "./categories/internalPortalSystemIssue";
import networkConnectivityCategoryMock from "./categories/networkConnectivity";
import otherInquiryCategoryMock from "./categories/otherInquiry";
import printingOfficeEquipmentCategoryMock from "./categories/printingOfficeEquipment";
import softwareApplicationCategoryMock from "./categories/softwareApplication";
import tenantPortalSystemIssueCategoryMock from "./categories/tenantPortalSystemIssue";

export const internalAssignmentRuleSettingsMock: DbAssignmentRule[] = [
  /* Portal / System */
  {
    category_id: internalPortalSystemIssueCategoryMock.category_id,
    assignee: {
      job_field_id: [21, 22, 23],
      employee_id: [32],
    },
  },
  /* Account & Access */
  {
    category_id: accountAccessCategoryMock.category_id,
    assignee: {
      job_field_id: [27, 28, 25],
      employee_id: [],
    },
  },
  /* Hardware & Device */
  {
    category_id: hardwareDeviceCategoryMock.category_id,
    assignee: {
      job_field_id: [24, 25, 26],
      employee_id: [117],
    },
  },
  /* Software & App */
  {
    category_id: softwareApplicationCategoryMock.category_id,
    assignee: {
      job_field_id: [20, 22, 23],
      employee_id: [],
    },
  },
  /* Network */
  {
    category_id: networkConnectivityCategoryMock.category_id,
    assignee: {
      job_field_id: [17, 19, 18],
      employee_id: [],
    },
  },
  /* Printing */
  {
    category_id: printingOfficeEquipmentCategoryMock.category_id,
    assignee: {
      job_field_id: [25, 26],
      employee_id: [],
    },
  },
  /* HR Systems */
  {
    category_id: hrSystemPayrollCategoryMock.category_id,
    assignee: {
      job_field_id: [3, 4, 23],
      employee_id: [],
    },
  },
  /* Data Management */
  {
    category_id: dataInfoManagementCategoryMock.category_id,
    assignee: {
      job_field_id: [23, 7, 4],
      employee_id: [59, 60, 61, 123, 124],
    },
  },
  /* Client Support */
  {
    category_id: clientUserSupportCategoryMock.category_id,
    assignee: {
      job_field_id: [11, 12, 23],
      employee_id: [15],
    },
  },
  /* Other Inquiry */
  {
    category_id: otherInquiryCategoryMock.category_id,
    assignee: {
      job_field_id: [25],
      employee_id: [],
    },
  },
];

export const tenantAssignmentRuleSettingsMock: DbAssignmentRule[] = [
  /* Portal / System */
  {
    category_id: tenantPortalSystemIssueCategoryMock.category_id,
    assignee: {
      job_field_id: [21, 22, 23],
      employee_id: [],
    },
  },
  /* Account & Access */
  {
    category_id: accountAccessCategoryMock.category_id,
    assignee: {
      job_field_id: [27, 28, 25],
      employee_id: [],
    },
  },
  /* Hardware & Device */
  {
    category_id: hardwareDeviceCategoryMock.category_id,
    assignee: {
      job_field_id: [24, 25, 26],
      employee_id: [],
    },
  },
  /* Software & App */
  {
    category_id: softwareApplicationCategoryMock.category_id,
    assignee: {
      job_field_id: [20, 22, 23],
      employee_id: [],
    },
  },
  /* Network */
  {
    category_id: networkConnectivityCategoryMock.category_id,
    assignee: {
      job_field_id: [17, 19, 18],
      employee_id: [],
    },
  },
  /* Printing */
  {
    category_id: printingOfficeEquipmentCategoryMock.category_id,
    assignee: {
      job_field_id: [25, 26],
      employee_id: [],
    },
  },
  /* HR Systems */
  {
    category_id: hrSystemPayrollCategoryMock.category_id,
    assignee: {
      job_field_id: [3, 4, 23],
      employee_id: [],
    },
  },
];

const tenantAssignmentRuleSettingsMocks: Record<string, DbAssignmentRule[]> = {
  tenant_1: tenantAssignmentRuleSettingsMock,
  tenant_2: tenantAssignmentRuleSettingsMock,
};

const defaultTenantAssignmentRuleSettingsMock =
  tenantAssignmentRuleSettingsMock;

export const getTenantAssignmentRuleSettingsMock = (
  tenantId: string,
): DbAssignmentRule[] => {
  return (
    tenantAssignmentRuleSettingsMocks[tenantId] ??
    defaultTenantAssignmentRuleSettingsMock
  );
};
