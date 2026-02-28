import { DbCategoryApprovalSettings } from "@/api/itServiceDesk/approvalStep";
import { ACCESS_LEVEL } from "@/domain/auth";

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
    category_name: internalPortalSystemIssueCategoryMock.category_name,
    category_description:
      internalPortalSystemIssueCategoryMock.category_description,
    category_index: internalPortalSystemIssueCategoryMock.category_index,
    category_active: internalPortalSystemIssueCategoryMock.category_active,
    approval_step: [
      {
        approval_step_id: "1",
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
    category_id: accountAccessCategoryMock.category_id,
    category_name: accountAccessCategoryMock.category_name,
    category_description: accountAccessCategoryMock.category_description,
    category_index: accountAccessCategoryMock.category_index,
    category_active: accountAccessCategoryMock.category_active,
    approval_step: [
      {
        approval_step_id: "2",
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
    category_id: hardwareDeviceCategoryMock.category_id,
    category_name: hardwareDeviceCategoryMock.category_name,
    category_description: hardwareDeviceCategoryMock.category_description,
    category_index: hardwareDeviceCategoryMock.category_index,
    category_active: hardwareDeviceCategoryMock.category_active,
    approval_step: [
      {
        approval_step_id: "3",
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
    category_id: softwareApplicationCategoryMock.category_id,
    category_name: softwareApplicationCategoryMock.category_name,
    category_description: softwareApplicationCategoryMock.category_description,
    category_index: softwareApplicationCategoryMock.category_index,
    category_active: softwareApplicationCategoryMock.category_active,
    approval_step: [
      {
        approval_step_id: "4",
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
    category_id: networkConnectivityCategoryMock.category_id,
    category_name: networkConnectivityCategoryMock.category_name,
    category_description: networkConnectivityCategoryMock.category_description,
    category_index: networkConnectivityCategoryMock.category_index,
    category_active: networkConnectivityCategoryMock.category_active,
    approval_step: [
      {
        approval_step_id: "5",
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
          field_id: "16",
        },
        skip_access_level: ACCESS_LEVEL.MANAGER,
      },
    ],
  },
  /* Printing */
  {
    category_id: printingOfficeEquipmentCategoryMock.category_id,
    category_name: printingOfficeEquipmentCategoryMock.category_name,
    category_description:
      printingOfficeEquipmentCategoryMock.category_description,
    category_index: printingOfficeEquipmentCategoryMock.category_index,
    category_active: printingOfficeEquipmentCategoryMock.category_active,
    approval_step: [
      {
        approval_step_id: "6",
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
    category_id: hrSystemPayrollCategoryMock.category_id,
    category_name: hrSystemPayrollCategoryMock.category_name,
    category_description: hrSystemPayrollCategoryMock.category_description,
    category_index: hrSystemPayrollCategoryMock.category_index,
    category_active: hrSystemPayrollCategoryMock.category_active,
    approval_step: [
      {
        approval_step_id: "7",
        approval_step_name: { en: "Upper manager's approval" },
        approval_step_description: { en: "Check to prevent duplicate issues" },
        approval_step_index: 1,
        category_id: hrSystemPayrollCategoryMock.category_id,
        approval_step_assignee: {
          type: "JOB_FIELD",
          field_id: "3",
        },
        skip_access_level: ACCESS_LEVEL.MANAGER,
      },
    ],
  },
  /* Data Management */
  {
    category_id: dataInfoManagementCategoryMock.category_id,
    category_name: dataInfoManagementCategoryMock.category_name,
    category_description: dataInfoManagementCategoryMock.category_description,
    category_index: dataInfoManagementCategoryMock.category_index,
    category_active: dataInfoManagementCategoryMock.category_active,
    approval_step: [
      {
        approval_step_id: "8",
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
          field_id: "16",
        },
        skip_access_level: ACCESS_LEVEL.MANAGER,
      },
    ],
  },
  /* Client Support */
  {
    category_id: clientUserSupportCategoryMock.category_id,
    category_name: clientUserSupportCategoryMock.category_name,
    category_description: clientUserSupportCategoryMock.category_description,
    category_index: clientUserSupportCategoryMock.category_index,
    category_active: clientUserSupportCategoryMock.category_active,
    approval_step: [
      {
        approval_step_id: "9",
        approval_step_name: {
          en: "IT manager's approval",
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
          field_id: "9",
        },
        skip_access_level: ACCESS_LEVEL.MANAGER,
      },
    ],
  },
  /* Other Inquiry */
  {
    category_id: otherInquiryCategoryMock.category_id,
    category_name: otherInquiryCategoryMock.category_name,
    category_description: otherInquiryCategoryMock.category_description,
    category_index: otherInquiryCategoryMock.category_index,
    category_active: otherInquiryCategoryMock.category_active,
    approval_step: [],
  },
];

export const tenantApprovalStepSettingsMock: DbCategoryApprovalSettings[] = [
  /* Portal / System */
  {
    category_id: tenantPortalSystemIssueCategoryMock.category_id,
    category_name: tenantPortalSystemIssueCategoryMock.category_name,
    category_description:
      tenantPortalSystemIssueCategoryMock.category_description,
    category_index: tenantPortalSystemIssueCategoryMock.category_index,
    category_active: tenantPortalSystemIssueCategoryMock.category_active,
    approval_step: [
      {
        approval_step_id: "11",
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
        approval_step_id: "12",
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
          field_id: "16",
        },
        skip_access_level: ACCESS_LEVEL.MANAGER,
      },
    ],
  },
  /* Account & Access */
  {
    category_id: accountAccessCategoryMock.category_id,
    category_name: accountAccessCategoryMock.category_name,
    category_description: accountAccessCategoryMock.category_description,
    category_index: accountAccessCategoryMock.category_index,
    category_active: accountAccessCategoryMock.category_active,
    approval_step: [
      {
        approval_step_id: "13",
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
    category_id: hardwareDeviceCategoryMock.category_id,
    category_name: hardwareDeviceCategoryMock.category_name,
    category_description: hardwareDeviceCategoryMock.category_description,
    category_index: hardwareDeviceCategoryMock.category_index,
    category_active: hardwareDeviceCategoryMock.category_active,
    approval_step: [
      {
        approval_step_id: "14",
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
    category_id: softwareApplicationCategoryMock.category_id,
    category_name: softwareApplicationCategoryMock.category_name,
    category_description: softwareApplicationCategoryMock.category_description,
    category_index: softwareApplicationCategoryMock.category_index,
    category_active: softwareApplicationCategoryMock.category_active,
    approval_step: [
      {
        approval_step_id: "15",
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
    category_id: networkConnectivityCategoryMock.category_id,
    category_name: networkConnectivityCategoryMock.category_name,
    category_description: networkConnectivityCategoryMock.category_description,
    category_index: networkConnectivityCategoryMock.category_index,
    category_active: networkConnectivityCategoryMock.category_active,
    approval_step: [
      {
        approval_step_id: "16",
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
          field_id: "16",
        },
        skip_access_level: ACCESS_LEVEL.MANAGER,
      },
    ],
  },
  /* Printing */
  {
    category_id: printingOfficeEquipmentCategoryMock.category_id,
    category_name: printingOfficeEquipmentCategoryMock.category_name,
    category_description:
      printingOfficeEquipmentCategoryMock.category_description,
    category_index: printingOfficeEquipmentCategoryMock.category_index,
    category_active: printingOfficeEquipmentCategoryMock.category_active,
    approval_step: [
      {
        approval_step_id: "17",
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
    category_id: hrSystemPayrollCategoryMock.category_id,
    category_name: hrSystemPayrollCategoryMock.category_name,
    category_description: hrSystemPayrollCategoryMock.category_description,
    category_index: hrSystemPayrollCategoryMock.category_index,
    category_active: hrSystemPayrollCategoryMock.category_active,
    approval_step: [
      {
        approval_step_id: "18",
        approval_step_name: {
          en: "IT manager's approval",
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
          field_id: "3",
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
