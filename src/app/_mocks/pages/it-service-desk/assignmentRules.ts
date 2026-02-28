import { DbAssignmentRule } from "@/api/itServiceDesk/assignmentRule/mapper";

import accountAccessCategoryMock from "./categories/accountAccess.json";
import clientUserSupportCategoryMock from "./categories/clientUserSupport.json";
import dataInfoManagementCategoryMock from "./categories/dataInfoManagement.json";
import hardwareDeviceCategoryMock from "./categories/hardwareDevice.json";
import hrSystemPayrollCategoryMock from "./categories/hrSystemPayroll.json";
import internalPortalSystemIssueCategoryMock from "./categories/internalPortalSystemIssue.json";
import networkConnectivityCategoryMock from "./categories/networkConnectivity.json";
import otherInquiryCategoryMock from "./categories/otherInquiry.json";
import printingOfficeEquipmentCategoryMock from "./categories/printingOfficeEquipment.json";
import softwareApplicationCategoryMock from "./categories/softwareApplication.json";
import tenantPortalSystemIssueCategoryMock from "./categories/tenantPortalSystemIssue.json";

export const internalAssignmentRuleSettingsMock: DbAssignmentRule[] = [
  /* Portal / System */
  {
    category_id: internalPortalSystemIssueCategoryMock.category_id,
    assignee: {
      job_field_id: ["21", "22", "23"],
      employee_id: ["32"],
    },
  },
  /* Account & Access */
  {
    category_id: accountAccessCategoryMock.category_id,
    assignee: {
      job_field_id: ["27", "28", "25"],
      employee_id: [],
    },
  },
  /* Hardware & Device */
  {
    category_id: hardwareDeviceCategoryMock.category_id,
    assignee: {
      job_field_id: ["24", "25", "26"],
      employee_id: ["117"],
    },
  },
  /* Software & App */
  {
    category_id: softwareApplicationCategoryMock.category_id,
    assignee: {
      job_field_id: ["20", "22", "23"],
      employee_id: [],
    },
  },
  /* Network */
  {
    category_id: networkConnectivityCategoryMock.category_id,
    assignee: {
      job_field_id: ["17", "19", "18"],
      employee_id: [],
    },
  },
  /* Printing */
  {
    category_id: printingOfficeEquipmentCategoryMock.category_id,
    assignee: {
      job_field_id: ["25", "26"],
      employee_id: [],
    },
  },
  /* HR Systems */
  {
    category_id: hrSystemPayrollCategoryMock.category_id,
    assignee: {
      job_field_id: ["3", "4", "23"],
      employee_id: [],
    },
  },
  /* Data Management */
  {
    category_id: dataInfoManagementCategoryMock.category_id,
    assignee: {
      job_field_id: ["23", "7", "4"],
      employee_id: ["59", "60", "61", "123", "124"],
    },
  },
  /* Client Support */
  {
    category_id: clientUserSupportCategoryMock.category_id,
    assignee: {
      job_field_id: ["11", "12", "23"],
      employee_id: ["15"],
    },
  },
  /* Other Inquiry */
  {
    category_id: otherInquiryCategoryMock.category_id,
    assignee: {
      job_field_id: ["25"],
      employee_id: [],
    },
  },
];

export const tenantAssignmentRuleSettingsMock: DbAssignmentRule[] = [
  /* Portal / System */
  {
    category_id: tenantPortalSystemIssueCategoryMock.category_id,
    assignee: {
      job_field_id: ["21", "22", "23"],
      employee_id: [],
    },
  },
  /* Account & Access */
  {
    category_id: accountAccessCategoryMock.category_id,
    assignee: {
      job_field_id: ["27", "28", "25"],
      employee_id: [],
    },
  },
  /* Hardware & Device */
  {
    category_id: hardwareDeviceCategoryMock.category_id,
    assignee: {
      job_field_id: ["24", "25", "26"],
      employee_id: [],
    },
  },
  /* Software & App */
  {
    category_id: softwareApplicationCategoryMock.category_id,
    assignee: {
      job_field_id: ["20", "22", "23"],
      employee_id: [],
    },
  },
  /* Network */
  {
    category_id: networkConnectivityCategoryMock.category_id,
    assignee: {
      job_field_id: ["17", "19", "18"],
      employee_id: [],
    },
  },
  /* Printing */
  {
    category_id: printingOfficeEquipmentCategoryMock.category_id,
    assignee: {
      job_field_id: ["25", "26"],
      employee_id: [],
    },
  },
  /* HR Systems */
  {
    category_id: hrSystemPayrollCategoryMock.category_id,
    assignee: {
      job_field_id: ["3", "4", "23"],
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
