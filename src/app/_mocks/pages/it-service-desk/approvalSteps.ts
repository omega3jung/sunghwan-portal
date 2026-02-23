import { ACCESS_LEVEL } from "@/domain/auth";
import { DbCategoryApprovalSettings } from "@/lib/mappers";

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

export const internalApprovalStepSettingsMock: DbCategoryApprovalSettings[] = [
  /* Portal / System */
  {
    category_id: internalPortalSystemIssueCategoryMock.category_id,
    category_index: internalPortalSystemIssueCategoryMock.category_index,
    category_agent: internalPortalSystemIssueCategoryMock.category_agent,
    category_active: internalPortalSystemIssueCategoryMock.category_active,
    category_translation:
      internalPortalSystemIssueCategoryMock.category_translation,
    approval_step: [
      {
        approval_step_id: "1",
        approval_step_index: 1,
        category_id: internalPortalSystemIssueCategoryMock.category_id,
        approval_step_assignee: {
          type: "MANAGER",
          level: 1,
        },
        skip_access_level: ACCESS_LEVEL.MANAGER,
        translation: {
          en: {
            step_name: "Upper manager's approval",
            step_description: "Check to prevent duplicate issues",
          },
        },
      },
    ],
  },
  /* Account & Access */
  {
    category_id: accountAccessCategoryMock.category_id,
    category_index: accountAccessCategoryMock.category_index,
    category_agent: accountAccessCategoryMock.category_agent,
    category_active: accountAccessCategoryMock.category_active,
    category_translation: accountAccessCategoryMock.category_translation,
    approval_step: [
      {
        approval_step_id: "2",
        approval_step_index: 1,
        category_id: accountAccessCategoryMock.category_id,
        approval_step_assignee: {
          type: "MANAGER",
          level: 1,
        },
        skip_access_level: ACCESS_LEVEL.MANAGER,
        translation: {
          en: {
            step_name: "Upper manager's approval",
            step_description: "Check to prevent duplicate issues",
          },
        },
      },
    ],
  },
  /* Hardware & Device */
  {
    category_id: hardwareDeviceCategoryMock.category_id,
    category_index: hardwareDeviceCategoryMock.category_index,
    category_agent: hardwareDeviceCategoryMock.category_agent,
    category_active: hardwareDeviceCategoryMock.category_active,
    category_translation: hardwareDeviceCategoryMock.category_translation,
    approval_step: [
      {
        approval_step_id: "3",
        approval_step_index: 1,
        category_id: hardwareDeviceCategoryMock.category_id,
        approval_step_assignee: {
          type: "MANAGER",
          level: 1,
        },
        skip_access_level: ACCESS_LEVEL.MANAGER,
        translation: {
          en: {
            step_name: "Upper manager's approval",
            step_description: "Check to prevent duplicate issues",
          },
        },
      },
    ],
  },
  /* Software & App */
  {
    category_id: softwareApplicationCategoryMock.category_id,
    category_index: softwareApplicationCategoryMock.category_index,
    category_agent: softwareApplicationCategoryMock.category_agent,
    category_active: softwareApplicationCategoryMock.category_active,
    category_translation: softwareApplicationCategoryMock.category_translation,
    approval_step: [
      {
        approval_step_id: "4",
        approval_step_index: 1,
        category_id: softwareApplicationCategoryMock.category_id,
        approval_step_assignee: {
          type: "MANAGER",
          level: 1,
        },
        skip_access_level: ACCESS_LEVEL.MANAGER,
        translation: {
          en: {
            step_name: "Upper manager's approval",
            step_description: "Check to prevent duplicate issues",
          },
        },
      },
    ],
  },
  /* Network */
  {
    category_id: networkConnectivityCategoryMock.category_id,
    category_index: networkConnectivityCategoryMock.category_index,
    category_agent: networkConnectivityCategoryMock.category_agent,
    category_active: networkConnectivityCategoryMock.category_active,
    category_translation: networkConnectivityCategoryMock.category_translation,
    approval_step: [
      {
        approval_step_id: "5",
        approval_step_index: 1,
        category_id: networkConnectivityCategoryMock.category_id,
        approval_step_assignee: {
          type: "JOB_FIELD",
          field_id: "IT Manager",
        },
        skip_access_level: ACCESS_LEVEL.MANAGER,
        translation: {
          en: {
            step_name: "Upper manager's approval",
            step_description: "Check to prevent duplicate issues",
          },
        },
      },
    ],
  },
  /* Printing */
  {
    category_id: printingOfficeEquipmentCategoryMock.category_id,
    category_index: printingOfficeEquipmentCategoryMock.category_index,
    category_agent: printingOfficeEquipmentCategoryMock.category_agent,
    category_active: printingOfficeEquipmentCategoryMock.category_active,
    category_translation:
      printingOfficeEquipmentCategoryMock.category_translation,
    approval_step: [
      {
        approval_step_id: "6",
        approval_step_index: 1,
        category_id: printingOfficeEquipmentCategoryMock.category_id,
        approval_step_assignee: {
          type: "MANAGER",
          level: 1,
        },
        skip_access_level: ACCESS_LEVEL.MANAGER,
        translation: {
          en: {
            step_name: "Upper manager's approval",
            step_description: "Check to prevent duplicate issues",
          },
        },
      },
    ],
  },
  /* HR Systems */
  {
    category_id: hrSystemPayrollCategoryMock.category_id,
    category_index: hrSystemPayrollCategoryMock.category_index,
    category_agent: hrSystemPayrollCategoryMock.category_agent,
    category_active: hrSystemPayrollCategoryMock.category_active,
    category_translation: hrSystemPayrollCategoryMock.category_translation,
    approval_step: [
      {
        approval_step_id: "7",
        approval_step_index: 1,
        category_id: hrSystemPayrollCategoryMock.category_id,
        approval_step_assignee: {
          type: "JOB_FIELD",
          field_id: "HR Manager",
        },
        skip_access_level: ACCESS_LEVEL.MANAGER,
        translation: {
          en: {
            step_name: "Upper manager's approval",
            step_description: "Check to prevent duplicate issues",
          },
        },
      },
    ],
  },
  /* Data Management */
  {
    category_id: dataInfoManagementCategoryMock.category_id,
    category_index: dataInfoManagementCategoryMock.category_index,
    category_agent: dataInfoManagementCategoryMock.category_agent,
    category_active: dataInfoManagementCategoryMock.category_active,
    category_translation: dataInfoManagementCategoryMock.category_translation,
    approval_step: [
      {
        approval_step_id: "8",
        approval_step_index: 1,
        category_id: dataInfoManagementCategoryMock.category_id,
        approval_step_assignee: {
          type: "JOB_FIELD",
          field_id: "IT Manager",
        },
        skip_access_level: ACCESS_LEVEL.MANAGER,
        translation: {
          en: {
            step_name: "Upper manager's approval",
            step_description: "Check to prevent duplicate issues",
          },
        },
      },
    ],
  },
  /* Client Support */
  {
    category_id: clientUserSupportCategoryMock.category_id,
    category_index: clientUserSupportCategoryMock.category_index,
    category_agent: clientUserSupportCategoryMock.category_agent,
    category_active: clientUserSupportCategoryMock.category_active,
    category_translation: clientUserSupportCategoryMock.category_translation,
    approval_step: [
      {
        approval_step_id: "9",
        approval_step_index: 1,
        category_id: clientUserSupportCategoryMock.category_id,
        approval_step_assignee: {
          type: "JOB_FIELD",
          field_id: "Account Manager",
        },
        skip_access_level: ACCESS_LEVEL.MANAGER,
        translation: {
          en: {
            step_name: "Upper manager's approval",
            step_description: "Check to prevent duplicate issues",
          },
        },
      },
    ],
  },
  /* Other Inquiry */
  {
    category_id: otherInquiryCategoryMock.category_id,
    category_index: otherInquiryCategoryMock.category_index,
    category_agent: otherInquiryCategoryMock.category_agent,
    category_active: otherInquiryCategoryMock.category_active,
    category_translation: otherInquiryCategoryMock.category_translation,
    approval_step: [],
  },
];

export const tenantApprovalStepSettingsMock: DbCategoryApprovalSettings[] = [
  /* Portal / System */
  {
    category_id: tenantPortalSystemIssueCategoryMock.category_id,
    category_index: tenantPortalSystemIssueCategoryMock.category_index,
    category_agent: tenantPortalSystemIssueCategoryMock.category_agent,
    category_active: tenantPortalSystemIssueCategoryMock.category_active,
    category_translation:
      tenantPortalSystemIssueCategoryMock.category_translation,
    approval_step: [
      {
        approval_step_id: "11",
        approval_step_index: 1,
        category_id: tenantPortalSystemIssueCategoryMock.category_id,
        approval_step_assignee: {
          type: "MANAGER",
          level: 1,
        },
        skip_access_level: ACCESS_LEVEL.MANAGER,
        translation: {
          en: {
            step_name: "Upper manager's approval",
            step_description: "Check to prevent duplicate issue",
          },
        },
      },
      {
        approval_step_id: "12",
        approval_step_index: 2,
        category_id: tenantPortalSystemIssueCategoryMock.category_id,
        approval_step_assignee: {
          type: "JOB_FIELD",
          field_id: "IT Manager",
        },
        skip_access_level: ACCESS_LEVEL.MANAGER,
        translation: {
          en: {
            step_name: "IT manager's approval",
            step_description: "Check to if internal issue",
          },
        },
      },
    ],
  },
  /* Account & Access */
  {
    category_id: accountAccessCategoryMock.category_id,
    category_index: accountAccessCategoryMock.category_index,
    category_agent: accountAccessCategoryMock.category_agent,
    category_active: accountAccessCategoryMock.category_active,
    category_translation: accountAccessCategoryMock.category_translation,
    approval_step: [
      {
        approval_step_id: "13",
        approval_step_index: 1,
        category_id: accountAccessCategoryMock.category_id,
        approval_step_assignee: {
          type: "MANAGER",
          level: 1,
        },
        skip_access_level: ACCESS_LEVEL.MANAGER,
        translation: {
          en: {
            step_name: "Upper manager's approval",
            step_description: "Check to prevent duplicate issues",
          },
        },
      },
    ],
  },
  /* Hardware & Device */
  {
    category_id: hardwareDeviceCategoryMock.category_id,
    category_index: hardwareDeviceCategoryMock.category_index,
    category_agent: hardwareDeviceCategoryMock.category_agent,
    category_active: hardwareDeviceCategoryMock.category_active,
    category_translation: hardwareDeviceCategoryMock.category_translation,
    approval_step: [
      {
        approval_step_id: "14",
        approval_step_index: 1,
        category_id: hardwareDeviceCategoryMock.category_id,
        approval_step_assignee: {
          type: "MANAGER",
          level: 1,
        },
        skip_access_level: ACCESS_LEVEL.MANAGER,
        translation: {
          en: {
            step_name: "Upper manager's approval",
            step_description: "Check to prevent duplicate issues",
          },
        },
      },
    ],
  },
  /* Software & App */
  {
    category_id: softwareApplicationCategoryMock.category_id,
    category_index: softwareApplicationCategoryMock.category_index,
    category_agent: softwareApplicationCategoryMock.category_agent,
    category_active: softwareApplicationCategoryMock.category_active,
    category_translation: softwareApplicationCategoryMock.category_translation,
    approval_step: [
      {
        approval_step_id: "15",
        approval_step_index: 1,
        category_id: softwareApplicationCategoryMock.category_id,
        approval_step_assignee: {
          type: "MANAGER",
          level: 1,
        },
        skip_access_level: ACCESS_LEVEL.MANAGER,
        translation: {
          en: {
            step_name: "Upper manager's approval",
            step_description: "Check to prevent duplicate issues",
          },
        },
      },
    ],
  },
  /* Network */
  {
    category_id: networkConnectivityCategoryMock.category_id,
    category_index: networkConnectivityCategoryMock.category_index,
    category_agent: networkConnectivityCategoryMock.category_agent,
    category_active: networkConnectivityCategoryMock.category_active,
    category_translation: networkConnectivityCategoryMock.category_translation,
    approval_step: [
      {
        approval_step_id: "16",
        approval_step_index: 1,
        category_id: networkConnectivityCategoryMock.category_id,
        approval_step_assignee: {
          type: "JOB_FIELD",
          field_id: "IT Manager",
        },
        skip_access_level: ACCESS_LEVEL.MANAGER,
        translation: {
          en: {
            step_name: "Upper manager's approval",
            step_description: "Check to prevent duplicate issues",
          },
        },
      },
    ],
  },
  /* Printing */
  {
    category_id: printingOfficeEquipmentCategoryMock.category_id,
    category_index: printingOfficeEquipmentCategoryMock.category_index,
    category_agent: printingOfficeEquipmentCategoryMock.category_agent,
    category_active: printingOfficeEquipmentCategoryMock.category_active,
    category_translation:
      printingOfficeEquipmentCategoryMock.category_translation,
    approval_step: [
      {
        approval_step_id: "17",
        approval_step_index: 1,
        category_id: printingOfficeEquipmentCategoryMock.category_id,
        approval_step_assignee: {
          type: "MANAGER",
          level: 1,
        },
        skip_access_level: ACCESS_LEVEL.MANAGER,
        translation: {
          en: {
            step_name: "Upper manager's approval",
            step_description: "Check to prevent duplicate issues",
          },
        },
      },
    ],
  },
  /* HR Systems */
  {
    category_id: hrSystemPayrollCategoryMock.category_id,
    category_index: hrSystemPayrollCategoryMock.category_index,
    category_agent: hrSystemPayrollCategoryMock.category_agent,
    category_active: hrSystemPayrollCategoryMock.category_active,
    category_translation: hrSystemPayrollCategoryMock.category_translation,
    approval_step: [
      {
        approval_step_id: "18",
        approval_step_index: 1,
        category_id: hrSystemPayrollCategoryMock.category_id,
        approval_step_assignee: {
          type: "JOB_FIELD",
          field_id: "HR Manager",
        },
        skip_access_level: ACCESS_LEVEL.MANAGER,
        translation: {
          en: {
            step_name: "Upper manager's approval",
            step_description: "Check to prevent duplicate issues",
          },
        },
      },
    ],
  },
];

const tenantApprovalStepSettingsMocks: Record<
  string,
  DbCategoryApprovalSettings[]
> = {
  tenant_1: tenantApprovalStepSettingsMock,
  tenant_2: tenantApprovalStepSettingsMock,
};

const defaultTenantApprovalStepSettingsMock = tenantApprovalStepSettingsMock;

export const getTenantApprovalStepSettingsMock = (
  tenantId: string,
): DbCategoryApprovalSettings[] => {
  return (
    tenantApprovalStepSettingsMocks[tenantId] ??
    defaultTenantApprovalStepSettingsMock
  );
};
