import { DbAssignmentRule } from "@/feature/serviceDesk/assignmentRule/mapper";

import accountAccessCategoryMock from "./categories/accountAccess";
import clientPortalSystemIssueCategoryMock from "./categories/clientPortalSystemIssue";
import clientUserSupportCategoryMock from "./categories/clientUserSupport";
import dataInfoManagementCategoryMock from "./categories/dataInfoManagement";
import hardwareDeviceCategoryMock from "./categories/hardwareDevice";
import hrSystemPayrollCategoryMock from "./categories/hrSystemPayroll";
import internalPortalSystemIssueCategoryMock from "./categories/internalPortalSystemIssue";
import networkConnectivityCategoryMock from "./categories/networkConnectivity";
import otherInquiryCategoryMock from "./categories/otherInquiry";
import printingOfficeEquipmentCategoryMock from "./categories/printingOfficeEquipment";
import softwareApplicationCategoryMock from "./categories/softwareApplication";

export const internalAssignmentRuleSettingsMock: DbAssignmentRule[] = [
  /* Portal / System */
  {
    category_id: internalPortalSystemIssueCategoryMock.category_id,
    assignee: {
      job_field_id: [21, 22, 23],
      employee_username: ["32"],
    },
  },
  /* Account & Access */
  {
    category_id: accountAccessCategoryMock.category_id,
    assignee: {
      job_field_id: [27, 28, 25],
      employee_username: [],
    },
  },
  /* Hardware & Device */
  {
    category_id: hardwareDeviceCategoryMock.category_id,
    assignee: {
      job_field_id: [24, 25, 26],
      employee_username: ["117"],
    },
  },
  /* Software & App */
  {
    category_id: softwareApplicationCategoryMock.category_id,
    assignee: {
      job_field_id: [20, 22, 23],
      employee_username: [],
    },
  },
  /* Network */
  {
    category_id: networkConnectivityCategoryMock.category_id,
    assignee: {
      job_field_id: [17, 19, 18],
      employee_username: [],
    },
  },
  /* Printing */
  {
    category_id: printingOfficeEquipmentCategoryMock.category_id,
    assignee: {
      job_field_id: [25, 26],
      employee_username: [],
    },
  },
  /* HR Systems */
  {
    category_id: hrSystemPayrollCategoryMock.category_id,
    assignee: {
      job_field_id: [3, 4, 23],
      employee_username: [],
    },
  },
  /* Data Management */
  {
    category_id: dataInfoManagementCategoryMock.category_id,
    assignee: {
      job_field_id: [23, 7, 4],
      employee_username: ["59", "60", "61", "123", "124"],
    },
  },
  /* Client Support */
  {
    category_id: clientUserSupportCategoryMock.category_id,
    assignee: {
      job_field_id: [11, 12, 23],
      employee_username: ["15"],
    },
  },
  /* Other Inquiry */
  {
    category_id: otherInquiryCategoryMock.category_id,
    assignee: {
      job_field_id: [25],
      employee_username: [],
    },
  },
];

export const clientAssignmentRuleSettingsMock: DbAssignmentRule[] = [
  /* Portal / System */
  {
    category_id: clientPortalSystemIssueCategoryMock.category_id,
    assignee: {
      job_field_id: [21, 22, 23],
      employee_username: [],
    },
  },
  /* Account & Access */
  {
    category_id: accountAccessCategoryMock.category_id,
    assignee: {
      job_field_id: [27, 28, 25],
      employee_username: [],
    },
  },
  /* Hardware & Device */
  {
    category_id: hardwareDeviceCategoryMock.category_id,
    assignee: {
      job_field_id: [24, 25, 26],
      employee_username: [],
    },
  },
  /* Software & App */
  {
    category_id: softwareApplicationCategoryMock.category_id,
    assignee: {
      job_field_id: [20, 22, 23],
      employee_username: [],
    },
  },
  /* Network */
  {
    category_id: networkConnectivityCategoryMock.category_id,
    assignee: {
      job_field_id: [17, 19, 18],
      employee_username: [],
    },
  },
  /* Printing */
  {
    category_id: printingOfficeEquipmentCategoryMock.category_id,
    assignee: {
      job_field_id: [25, 26],
      employee_username: [],
    },
  },
  /* HR Systems */
  {
    category_id: hrSystemPayrollCategoryMock.category_id,
    assignee: {
      job_field_id: [3, 4, 23],
      employee_username: [],
    },
  },
];

const clientAssignmentRuleSettingsMocks: Record<string, DbAssignmentRule[]> = {
  client_1: clientAssignmentRuleSettingsMock,
  client_2: clientAssignmentRuleSettingsMock,
};

const defaultClientAssignmentRuleSettingsMock =
  clientAssignmentRuleSettingsMock;

export const getClientAssignmentRuleSettingsMock = (
  clientId: string,
): DbAssignmentRule[] => {
  return (
    clientAssignmentRuleSettingsMocks[clientId] ??
    defaultClientAssignmentRuleSettingsMock
  );
};
