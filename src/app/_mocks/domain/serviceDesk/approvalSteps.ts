import { DbCategoryApprovalSettings } from "@/api/serviceDesk/approvalStep";
import { DbCategory } from "@/api/serviceDesk/category";
import { ACCESS_LEVEL } from "@/domain/auth";

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

const categoryApprovalSettingsHelper = (
  categoryMock: DbCategory,
): Omit<DbCategory, "sub_category"> => {
  return {
    category_id: categoryMock.category_id,
    category_name: categoryMock.category_name,
    category_description: categoryMock.category_description,
    category_request_template: categoryMock.category_request_template,
    category_index: categoryMock.category_index,
    category_active: categoryMock.category_active,
    category_scope: categoryMock.category_scope,
    default_priority: categoryMock.default_priority,
    default_risk_level: categoryMock.default_risk_level,
    default_sla_days: categoryMock.default_sla_days,
  };
};

const JOB_FIELD_ID = {
  HR_MANAGER: 3,
  ACCOUNT_MANAGER: 9,
  IT_MANAGER: 16,
} as const;

export const internalApprovalStepSettingsMock: DbCategoryApprovalSettings[] = [
  /* Portal / System */
  {
    ...categoryApprovalSettingsHelper(internalPortalSystemIssueCategoryMock),
    approval_step: [
      {
        approval_step_id: 1,
        approval_step_name: {
          en: "Upper manager's approval",
          es: "Aprobación del alto directivo",
          fr: "L'approbation de la direction",
          ko: "상급자 승인",
        },
        approval_step_description: {
          en: "Check to prevent duplicate issues",
          es: "Marcar para evitar problemas duplicados",
          fr: "Vérifiez pour éviter les problèmes de doublons",
          ko: "중복 문제를 방지하기 위한 확인",
        },
        approval_step_index: 1,
        category_id: internalPortalSystemIssueCategoryMock.category_id,
        approval_step_assignee: {
          type: "MANAGER",
          level: 1,
        },
        skip_access_level: ACCESS_LEVEL.MANAGER,
      },
    ],
  },
  /* Account & Access */
  {
    ...categoryApprovalSettingsHelper(accountAccessCategoryMock),
    approval_step: [
      {
        approval_step_id: 2,
        approval_step_name: {
          en: "Upper manager's approval",
          es: "Aprobación del alto directivo",
          fr: "L'approbation de la direction",
          ko: "상급자 승인",
        },
        approval_step_description: {
          en: "Check to prevent duplicate issues",
          es: "Marcar para evitar problemas duplicados",
          fr: "Vérifiez pour éviter les problèmes de doublons",
          ko: "중복 문제를 방지하기 위한 확인",
        },
        approval_step_index: 1,
        category_id: accountAccessCategoryMock.category_id,
        approval_step_assignee: {
          type: "MANAGER",
          level: 1,
        },
        skip_access_level: ACCESS_LEVEL.MANAGER,
      },
    ],
  },
  /* Hardware & Device */
  {
    ...categoryApprovalSettingsHelper(hardwareDeviceCategoryMock),
    approval_step: [
      {
        approval_step_id: 3,
        approval_step_name: {
          en: "Upper manager's approval",
          es: "Aprobación del alto directivo",
          fr: "L'approbation de la direction",
          ko: "상급자 승인",
        },
        approval_step_description: {
          en: "Check to prevent duplicate issues",
          es: "Marcar para evitar problemas duplicados",
          fr: "Vérifiez pour éviter les problèmes de doublons",
          ko: "중복 문제를 방지하기 위한 확인",
        },
        approval_step_index: 1,
        category_id: hardwareDeviceCategoryMock.category_id,
        approval_step_assignee: {
          type: "MANAGER",
          level: 1,
        },
        skip_access_level: ACCESS_LEVEL.MANAGER,
      },
    ],
  },
  /* Software & App */
  {
    ...categoryApprovalSettingsHelper(softwareApplicationCategoryMock),
    approval_step: [
      {
        approval_step_id: 4,
        approval_step_name: {
          en: "Upper manager's approval",
          es: "Aprobación del alto directivo",
          fr: "L'approbation de la direction",
          ko: "상급자 승인",
        },
        approval_step_description: {
          en: "Check to prevent duplicate issues",
          es: "Marcar para evitar problemas duplicados",
          fr: "Vérifiez pour éviter les problèmes de doublons",
          ko: "중복 문제를 방지하기 위한 확인",
        },
        approval_step_index: 1,
        category_id: softwareApplicationCategoryMock.category_id,
        approval_step_assignee: {
          type: "MANAGER",
          level: 1,
        },
        skip_access_level: ACCESS_LEVEL.MANAGER,
      },
    ],
  },
  /* Network */
  {
    ...categoryApprovalSettingsHelper(networkConnectivityCategoryMock),
    approval_step: [
      {
        approval_step_id: 5,
        approval_step_name: {
          en: "IT manager's approval",
          es: "Aprobación del gerente de IT",
          fr: "Approbation du responsable informatique",
          ko: "IT 관리자 승인",
        },
        approval_step_description: {
          en: "Check to network issue is related to IT",
          es: "El problema de la comprobación de red está relacionado con IT",
          fr: "Vérifiez si le problème de réseau est lié à l'informatique.",
          ko: "네트워크 문제의 IT와 관련 유무를 확인",
        },
        approval_step_index: 1,
        category_id: networkConnectivityCategoryMock.category_id,
        approval_step_assignee: {
          type: "JOB_FIELD",
          field_id: JOB_FIELD_ID.IT_MANAGER,
        },
        skip_access_level: ACCESS_LEVEL.MANAGER,
      },
    ],
  },
  /* Printing */
  {
    ...categoryApprovalSettingsHelper(printingOfficeEquipmentCategoryMock),
    approval_step: [
      {
        approval_step_id: 6,
        approval_step_name: {
          en: "Upper manager's approval",
          es: "Aprobación del alto directivo",
          fr: "L'approbation de la direction",
          ko: "상급자 승인",
        },
        approval_step_description: {
          en: "Check to prevent duplicate issues",
          es: "Marcar para evitar problemas duplicados",
          fr: "Vérifiez pour éviter les problèmes de doublons",
          ko: "중복 문제를 방지하기 위한 확인",
        },
        approval_step_index: 1,
        category_id: printingOfficeEquipmentCategoryMock.category_id,
        approval_step_assignee: {
          type: "MANAGER",
          level: 1,
        },
        skip_access_level: ACCESS_LEVEL.MANAGER,
      },
    ],
  },
  /* HR Systems */
  {
    ...categoryApprovalSettingsHelper(hrSystemPayrollCategoryMock),
    approval_step: [
      {
        approval_step_id: 7,
        approval_step_name: { en: "Upper manager's approval" },
        approval_step_description: { en: "Check to prevent duplicate issues" },
        approval_step_index: 1,
        category_id: hrSystemPayrollCategoryMock.category_id,
        approval_step_assignee: {
          type: "JOB_FIELD",
          field_id: JOB_FIELD_ID.HR_MANAGER,
        },
        skip_access_level: ACCESS_LEVEL.MANAGER,
      },
    ],
  },
  /* Data Management */
  {
    ...categoryApprovalSettingsHelper(dataInfoManagementCategoryMock),
    approval_step: [
      {
        approval_step_id: 8,
        approval_step_name: {
          en: "IT manager's approval",
          es: "Aprobación del gerente de IT",
          fr: "Approbation du responsable informatique",
          ko: "IT 관리자 승인",
        },
        approval_step_description: {
          en: "Check to network issue is related to IT",
          es: "El problema de la comprobación de red está relacionado con IT",
          fr: "Vérifiez si le problème de réseau est lié à l'informatique.",
          ko: "네트워크 문제의 IT와 관련 유무를 확인",
        },
        approval_step_index: 1,
        category_id: dataInfoManagementCategoryMock.category_id,
        approval_step_assignee: {
          type: "JOB_FIELD",
          field_id: JOB_FIELD_ID.IT_MANAGER,
        },
        skip_access_level: ACCESS_LEVEL.MANAGER,
      },
    ],
  },
  /* Client Support */
  {
    ...categoryApprovalSettingsHelper(clientUserSupportCategoryMock),
    approval_step: [
      {
        approval_step_id: 9,
        approval_step_name: {
          en: "Account manager's approval",
          es: "Aprobación del gerente de cuentas",
          fr: "Approbation du gestionnaire de compte",
          ko: "계정 관리자 승인",
        },
        approval_step_description: {
          en: "Check to if HR issue",
          es: "Comprobar si hay problemas con los clientes",
          fr: "Vérifier si les problèmes des clients",
          ko: "고객 문제 여부를 확인",
        },
        approval_step_index: 1,
        category_id: clientUserSupportCategoryMock.category_id,
        approval_step_assignee: {
          type: "JOB_FIELD",
          field_id: JOB_FIELD_ID.ACCOUNT_MANAGER,
        },
        skip_access_level: ACCESS_LEVEL.MANAGER,
      },
    ],
  },
  /* Other Inquiry */
  {
    ...categoryApprovalSettingsHelper(otherInquiryCategoryMock),
    approval_step: [],
  },
];

export const tenantApprovalStepSettingsMock: DbCategoryApprovalSettings[] = [
  /* Portal / System */
  {
    ...categoryApprovalSettingsHelper(tenantPortalSystemIssueCategoryMock),
    approval_step: [
      {
        approval_step_id: 11,
        approval_step_name: {
          en: "Upper manager's approval",
          es: "Aprobación del alto directivo",
          fr: "L'approbation de la direction",
          ko: "상급자 승인",
        },
        approval_step_description: {
          en: "Check to prevent duplicate issues",
          es: "Marcar para evitar problemas duplicados",
          fr: "Vérifiez pour éviter les problèmes de doublons",
          ko: "중복 문제를 방지하기 위한 확인",
        },
        approval_step_index: 1,
        category_id: tenantPortalSystemIssueCategoryMock.category_id,
        approval_step_assignee: {
          type: "MANAGER",
          level: 1,
        },
        skip_access_level: ACCESS_LEVEL.MANAGER,
      },
      {
        approval_step_id: 12,
        approval_step_name: {
          en: "IT manager's approval",
          es: "Aprobación del gerente de IT",
          fr: "Approbation du responsable informatique",
          ko: "IT 관리자 승인",
        },
        approval_step_description: {
          en: "Check to network issue is related to IT",
          es: "El problema de la comprobación de red está relacionado con IT",
          fr: "Vérifiez si le problème de réseau est lié à l'informatique.",
          ko: "네트워크 문제의 IT와 관련 유무를 확인",
        },
        approval_step_index: 2,
        category_id: tenantPortalSystemIssueCategoryMock.category_id,
        approval_step_assignee: {
          type: "JOB_FIELD",
          field_id: JOB_FIELD_ID.IT_MANAGER,
        },
        skip_access_level: ACCESS_LEVEL.MANAGER,
      },
    ],
  },
  /* Account & Access */
  {
    ...categoryApprovalSettingsHelper(accountAccessCategoryMock),
    approval_step: [
      {
        approval_step_id: 13,
        approval_step_name: {
          en: "Upper manager's approval",
          es: "Aprobación del alto directivo",
          fr: "L'approbation de la direction",
          ko: "상급자 승인",
        },
        approval_step_description: {
          en: "Check to prevent duplicate issues",
          es: "Marcar para evitar problemas duplicados",
          fr: "Vérifiez pour éviter les problèmes de doublons",
          ko: "중복 문제를 방지하기 위한 확인",
        },
        approval_step_index: 1,
        category_id: accountAccessCategoryMock.category_id,
        approval_step_assignee: {
          type: "MANAGER",
          level: 1,
        },
        skip_access_level: ACCESS_LEVEL.MANAGER,
      },
    ],
  },
  /* Hardware & Device */
  {
    ...categoryApprovalSettingsHelper(hardwareDeviceCategoryMock),
    approval_step: [
      {
        approval_step_id: 14,
        approval_step_name: {
          en: "Upper manager's approval",
          es: "Aprobación del alto directivo",
          fr: "L'approbation de la direction",
          ko: "상급자 승인",
        },
        approval_step_description: {
          en: "Check to prevent duplicate issues",
          es: "Marcar para evitar problemas duplicados",
          fr: "Vérifiez pour éviter les problèmes de doublons",
          ko: "중복 문제를 방지하기 위한 확인",
        },
        approval_step_index: 1,
        category_id: hardwareDeviceCategoryMock.category_id,
        approval_step_assignee: {
          type: "MANAGER",
          level: 1,
        },
        skip_access_level: ACCESS_LEVEL.MANAGER,
      },
    ],
  },
  /* Software & App */
  {
    ...categoryApprovalSettingsHelper(softwareApplicationCategoryMock),
    approval_step: [
      {
        approval_step_id: 15,
        approval_step_name: {
          en: "Upper manager's approval",
          es: "Aprobación del alto directivo",
          fr: "L'approbation de la direction",
          ko: "상급자 승인",
        },
        approval_step_description: {
          en: "Check to prevent duplicate issues",
          es: "Marcar para evitar problemas duplicados",
          fr: "Vérifiez pour éviter les problèmes de doublons",
          ko: "중복 문제를 방지하기 위한 확인",
        },
        approval_step_index: 1,
        category_id: softwareApplicationCategoryMock.category_id,
        approval_step_assignee: {
          type: "MANAGER",
          level: 1,
        },
        skip_access_level: ACCESS_LEVEL.MANAGER,
      },
    ],
  },
  /* Network */
  {
    ...categoryApprovalSettingsHelper(networkConnectivityCategoryMock),
    approval_step: [
      {
        approval_step_id: 16,
        approval_step_name: {
          en: "IT manager's approval",
          es: "Aprobación del gerente de IT",
          fr: "Approbation du responsable informatique",
          ko: "IT 관리자 승인",
        },
        approval_step_description: {
          en: "Check to network issue is related to IT",
          es: "El problema de la comprobación de red está relacionado con IT",
          fr: "Vérifiez si le problème de réseau est lié à l'informatique.",
          ko: "네트워크 문제의 IT와 관련 유무를 확인",
        },
        approval_step_index: 1,
        category_id: networkConnectivityCategoryMock.category_id,
        approval_step_assignee: {
          type: "JOB_FIELD",
          field_id: JOB_FIELD_ID.IT_MANAGER,
        },
        skip_access_level: ACCESS_LEVEL.MANAGER,
      },
    ],
  },
  /* Printing */
  {
    ...categoryApprovalSettingsHelper(printingOfficeEquipmentCategoryMock),
    approval_step: [
      {
        approval_step_id: 17,
        approval_step_name: {
          en: "Upper manager's approval",
          es: "Aprobación del alto directivo",
          fr: "L'approbation de la direction",
          ko: "상급자 승인",
        },
        approval_step_description: {
          en: "Check to prevent duplicate issues",
          es: "Marcar para evitar problemas duplicados",
          fr: "Vérifiez pour éviter les problèmes de doublons",
          ko: "중복 문제를 방지하기 위한 확인",
        },
        approval_step_index: 1,
        category_id: printingOfficeEquipmentCategoryMock.category_id,
        approval_step_assignee: {
          type: "MANAGER",
          level: 1,
        },
        skip_access_level: ACCESS_LEVEL.MANAGER,
      },
    ],
  },
  /* HR Systems */
  {
    ...categoryApprovalSettingsHelper(hrSystemPayrollCategoryMock),
    approval_step: [
      {
        approval_step_id: 18,
        approval_step_name: {
          en: "HR manager's approval",
          es: "Aprobación del gerente de recursos humanos",
          fr: "Approbation du responsable des ressources humaines",
          ko: "인사부장 승인",
        },
        approval_step_description: {
          en: "Check to if HR issue",
          es: "Comprobar si hay problemas de HR",
          fr: "Vérifier si le problème concerne les RH",
          ko: "인사 문제 관련 유무 확인",
        },
        approval_step_index: 1,
        category_id: hrSystemPayrollCategoryMock.category_id,
        approval_step_assignee: {
          type: "JOB_FIELD",
          field_id: JOB_FIELD_ID.HR_MANAGER,
        },
        skip_access_level: ACCESS_LEVEL.MANAGER,
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
