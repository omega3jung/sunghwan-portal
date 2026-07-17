import { ACCESS_LEVEL } from "@/domain/auth";
import type { DbCategoryApprovalSettings } from "@/feature/serviceDesk/approvalStep";

import {
  internalAccountAccessMock,
  internalClientUserSupportMock,
  internalDataInfoManagementMock,
  internalHardwareDeviceMock,
  internalHrSystemPayrollMock,
  internalNetworkConnectivityMock,
  internalOtherInquiryMock,
  internalPortalSystemIssueMock,
  internalPrintingOfficeEquipmentMock,
  internalSoftwareApplicationMock,
} from "../categories/internal";
import { categoryApprovalSettingsHelper } from "./shared";

const INTERNAL_JOB_FIELD_ID = {
  HR_MANAGER: 3,
  ACCOUNT_MANAGER: 9,
  IT_MANAGER: 16,
} as const;

export const internalApprovalStepSettingsMock: DbCategoryApprovalSettings[] = [
  /* Portal / System */
  {
    ...categoryApprovalSettingsHelper(internalPortalSystemIssueMock),
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
        category_id: internalPortalSystemIssueMock.category_id,
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
    ...categoryApprovalSettingsHelper(internalAccountAccessMock),
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
        category_id: internalAccountAccessMock.category_id,
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
    ...categoryApprovalSettingsHelper(internalHardwareDeviceMock),
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
        category_id: internalHardwareDeviceMock.category_id,
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
    ...categoryApprovalSettingsHelper(internalSoftwareApplicationMock),
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
        category_id: internalSoftwareApplicationMock.category_id,
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
    ...categoryApprovalSettingsHelper(internalNetworkConnectivityMock),
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
        category_id: internalNetworkConnectivityMock.category_id,
        approval_step_assignee: {
          type: "JOB_FIELD",
          field_id: INTERNAL_JOB_FIELD_ID.IT_MANAGER,
        },
        skip_access_level: ACCESS_LEVEL.MANAGER,
      },
    ],
  },
  /* Printing */
  {
    ...categoryApprovalSettingsHelper(internalPrintingOfficeEquipmentMock),
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
        category_id: internalPrintingOfficeEquipmentMock.category_id,
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
    ...categoryApprovalSettingsHelper(internalHrSystemPayrollMock),
    approval_step: [
      {
        approval_step_id: 7,
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
        category_id: internalHrSystemPayrollMock.category_id,
        approval_step_assignee: {
          type: "JOB_FIELD",
          field_id: INTERNAL_JOB_FIELD_ID.HR_MANAGER,
        },
        skip_access_level: ACCESS_LEVEL.MANAGER,
      },
    ],
  },
  /* Data Management */
  {
    ...categoryApprovalSettingsHelper(internalDataInfoManagementMock),
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
        category_id: internalDataInfoManagementMock.category_id,
        approval_step_assignee: {
          type: "JOB_FIELD",
          field_id: INTERNAL_JOB_FIELD_ID.IT_MANAGER,
        },
        skip_access_level: ACCESS_LEVEL.MANAGER,
      },
    ],
  },
  /* Client Support */
  {
    ...categoryApprovalSettingsHelper(internalClientUserSupportMock),
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
        category_id: internalClientUserSupportMock.category_id,
        approval_step_assignee: {
          type: "JOB_FIELD",
          field_id: INTERNAL_JOB_FIELD_ID.ACCOUNT_MANAGER,
        },
        skip_access_level: ACCESS_LEVEL.MANAGER,
      },
    ],
  },
  /* Other Inquiry */
  {
    ...categoryApprovalSettingsHelper(internalOtherInquiryMock),
    approval_step: [],
  },
];
