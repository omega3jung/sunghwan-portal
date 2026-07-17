import { ACCESS_LEVEL } from "@/domain/auth";
import type { DbCategoryApprovalSettings } from "@/feature/serviceDesk/approvalStep";

import {
  client1PortalSystemIssueMock,
  client2PortalSystemIssueMock,
  clientAccountAccessMock,
  clientHardwareDeviceMock,
  clientHrSystemPayrollMock,
  clientNetworkConnectivityMock,
  clientPrintingOfficeEquipmentMock,
  clientSoftwareApplicationMock,
} from "../categories/client";
import { categoryApprovalSettingsHelper } from "./shared";

const CLIENT_1_JOB_FIELD_ID = {
  HR_MANAGER: 293,
  IT_MANAGER: 290,
} as const;

const CLIENT_2_JOB_FIELD_ID = {
  IT_MANAGER: 310,
} as const;

export const clientApprovalStepSettingsMock: DbCategoryApprovalSettings[] = [
  /* Portal / System */
  {
    ...categoryApprovalSettingsHelper(client1PortalSystemIssueMock),
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
        category_id: client1PortalSystemIssueMock.category_id,
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
        category_id: client1PortalSystemIssueMock.category_id,
        approval_step_assignee: {
          type: "JOB_FIELD",
          field_id: CLIENT_1_JOB_FIELD_ID.IT_MANAGER,
        },
        skip_access_level: ACCESS_LEVEL.MANAGER,
      },
    ],
  },
  /* Account & Access */
  {
    ...categoryApprovalSettingsHelper(clientAccountAccessMock),
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
        category_id: clientAccountAccessMock.category_id,
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
    ...categoryApprovalSettingsHelper(clientHardwareDeviceMock),
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
        category_id: clientHardwareDeviceMock.category_id,
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
    ...categoryApprovalSettingsHelper(clientSoftwareApplicationMock),
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
        category_id: clientSoftwareApplicationMock.category_id,
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
    ...categoryApprovalSettingsHelper(clientNetworkConnectivityMock),
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
        category_id: clientNetworkConnectivityMock.category_id,
        approval_step_assignee: {
          type: "JOB_FIELD",
          field_id: CLIENT_1_JOB_FIELD_ID.IT_MANAGER,
        },
        skip_access_level: ACCESS_LEVEL.MANAGER,
      },
    ],
  },
  /* Printing */
  {
    ...categoryApprovalSettingsHelper(clientPrintingOfficeEquipmentMock),
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
        category_id: clientPrintingOfficeEquipmentMock.category_id,
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
    ...categoryApprovalSettingsHelper(clientHrSystemPayrollMock),
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
        category_id: clientHrSystemPayrollMock.category_id,
        approval_step_assignee: {
          type: "JOB_FIELD",
          field_id: CLIENT_1_JOB_FIELD_ID.HR_MANAGER,
        },
        skip_access_level: ACCESS_LEVEL.MANAGER,
      },
    ],
  },
  /* Client 2 Portal / System */
  {
    ...categoryApprovalSettingsHelper(client2PortalSystemIssueMock),
    approval_step: [
      {
        approval_step_id: 19,
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
        category_id: client2PortalSystemIssueMock.category_id,
        approval_step_assignee: {
          type: "MANAGER",
          level: 1,
        },
        skip_access_level: ACCESS_LEVEL.MANAGER,
      },
      {
        approval_step_id: 20,
        approval_step_name: {
          en: "IT manager's approval",
          es: "Aprobación del gerente de IT",
          fr: "Approbation du responsable informatique",
          ko: "IT 관리자 승인",
        },
        approval_step_description: {
          en: "Check whether the system issue is related to IT",
          es: "Comprobar si el problema del sistema está relacionado con IT",
          fr: "Vérifiez si le problème système est lié à l'informatique.",
          ko: "시스템 문제가 IT와 관련되었는지 확인",
        },
        approval_step_index: 2,
        category_id: client2PortalSystemIssueMock.category_id,
        approval_step_assignee: {
          type: "JOB_FIELD",
          field_id: CLIENT_2_JOB_FIELD_ID.IT_MANAGER,
        },
        skip_access_level: ACCESS_LEVEL.MANAGER,
      },
    ],
  },
];

const client1ApprovalStepSettingsMock =
  clientApprovalStepSettingsMock.filter(
    ({ category_id }) => category_id !== client2PortalSystemIssueMock.category_id,
  );
const client2ApprovalStepSettingsMock =
  clientApprovalStepSettingsMock.filter(
    ({ category_id }) => category_id === client2PortalSystemIssueMock.category_id,
  );

const clientApprovalStepSettingsMocks: Record<
  string,
  DbCategoryApprovalSettings[]
> = {
  "11": client1ApprovalStepSettingsMock,
  "12": client2ApprovalStepSettingsMock,
  client_1: client1ApprovalStepSettingsMock,
  client_2: client2ApprovalStepSettingsMock,
};

const defaultClientApprovalStepSettingsMock = client1ApprovalStepSettingsMock;

export const getClientApprovalStepSettingsMock = (
  clientId: string,
): DbCategoryApprovalSettings[] => {
  return (
    clientApprovalStepSettingsMocks[clientId] ??
    defaultClientApprovalStepSettingsMock
  );
};
