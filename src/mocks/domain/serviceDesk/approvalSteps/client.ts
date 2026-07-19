import { ACCESS_LEVEL } from "@/domain/auth";
import type {
  DbApprovalStep,
  DbCategoryApprovalSettings,
} from "@/feature/serviceDesk/approvalStep";

import {
  clientAccountAccessMock as demoCorporationAccountAccessMock,
  clientHardwareDeviceMock as demoCorporationHardwareDeviceMock,
  clientHrSystemPayrollMock as demoCorporationHrSystemPayrollMock,
  clientNetworkConnectivityMock as demoCorporationNetworkConnectivityMock,
  clientPortalSystemIssueMock as demoCorporationPortalSystemIssueMock,
  clientPrintingOfficeEquipmentMock as demoCorporationPrintingOfficeEquipmentMock,
  clientSoftwareApplicationMock as demoCorporationSoftwareApplicationMock,
} from "../categories/client/demoCorporation";
import {
  clientAccountAccessMock as demoEnergyAccountAccessMock,
  clientDataInfoManagementMock as demoEnergyDataInfoManagementMock,
  clientHardwareDeviceMock as demoEnergyHardwareDeviceMock,
  clientHrSystemPayrollMock as demoEnergyHrSystemPayrollMock,
  clientOtherInquiryMock as demoEnergyOtherInquiryMock,
  clientPortalSystemIssueMock as demoEnergyPortalSystemIssueMock,
  clientSoftwareApplicationMock as demoEnergySoftwareApplicationMock,
} from "../categories/client/demoEnergy";
import { categoryApprovalSettingsHelper } from "./shared";

const DEMO_CORPORATION_JOB_FIELD_ID = {
  HR_MANAGER: 293,
  IT_MANAGER: 290,
} as const;

const DEMO_ENERGY_JOB_FIELD_ID = {
  CORPORATE_SERVICES_DIRECTOR: 333,
  ENERGY_SYSTEMS_MANAGER: 331,
  TECHNOLOGY_MANAGER: 330,
} as const;

const createManagerApprovalStep = (
  approvalStepId: number,
  categoryId: number,
): DbApprovalStep => ({
  approval_step_id: approvalStepId,
  approval_step_name: {
    en: "Upper manager's approval",
    es: "Aprobación del superior",
    fr: "Approbation du supérieur",
    ko: "상위 관리자 승인",
  },
  approval_step_description: {
    en: "Review the request before work begins.",
    es: "Revise la solicitud antes de comenzar el trabajo.",
    fr: "Examinez la demande avant le début du traitement.",
    ko: "작업을 시작하기 전에 요청을 검토합니다.",
  },
  approval_step_index: 1,
  category_id: categoryId,
  approval_step_assignee: {
    type: "MANAGER",
    level: 1,
  },
  skip_access_level: ACCESS_LEVEL.MANAGER,
});

const createJobFieldApprovalStep = (
  approvalStepId: number,
  categoryId: number,
  fieldId: number,
): DbApprovalStep => ({
  approval_step_id: approvalStepId,
  approval_step_name: {
    en: "Responsible manager's approval",
    es: "Aprobación del responsable",
    fr: "Approbation du responsable",
    ko: "담당 관리자 승인",
  },
  approval_step_description: {
    en: "Confirm that the responsible team can process the request.",
    es: "Confirme que el equipo responsable puede procesar la solicitud.",
    fr: "Confirmez que l'équipe responsable peut traiter la demande.",
    ko: "담당 조직에서 요청을 처리할 수 있는지 확인합니다.",
  },
  approval_step_index: 1,
  category_id: categoryId,
  approval_step_assignee: {
    type: "JOB_FIELD",
    field_id: fieldId,
  },
  skip_access_level: ACCESS_LEVEL.MANAGER,
});

export const clientApprovalStepSettingsMock: DbCategoryApprovalSettings[] = [
  /* Portal / System */
  {
    ...categoryApprovalSettingsHelper(demoCorporationPortalSystemIssueMock),
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
        category_id: demoCorporationPortalSystemIssueMock.category_id,
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
        category_id: demoCorporationPortalSystemIssueMock.category_id,
        approval_step_assignee: {
          type: "JOB_FIELD",
          field_id: DEMO_CORPORATION_JOB_FIELD_ID.IT_MANAGER,
        },
        skip_access_level: ACCESS_LEVEL.MANAGER,
      },
    ],
  },
  /* Account & Access */
  {
    ...categoryApprovalSettingsHelper(demoCorporationAccountAccessMock),
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
        category_id: demoCorporationAccountAccessMock.category_id,
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
    ...categoryApprovalSettingsHelper(demoCorporationHardwareDeviceMock),
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
        category_id: demoCorporationHardwareDeviceMock.category_id,
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
    ...categoryApprovalSettingsHelper(demoCorporationSoftwareApplicationMock),
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
        category_id: demoCorporationSoftwareApplicationMock.category_id,
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
    ...categoryApprovalSettingsHelper(demoCorporationNetworkConnectivityMock),
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
        category_id: demoCorporationNetworkConnectivityMock.category_id,
        approval_step_assignee: {
          type: "JOB_FIELD",
          field_id: DEMO_CORPORATION_JOB_FIELD_ID.IT_MANAGER,
        },
        skip_access_level: ACCESS_LEVEL.MANAGER,
      },
    ],
  },
  /* Printing */
  {
    ...categoryApprovalSettingsHelper(demoCorporationPrintingOfficeEquipmentMock),
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
        category_id: demoCorporationPrintingOfficeEquipmentMock.category_id,
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
    ...categoryApprovalSettingsHelper(demoCorporationHrSystemPayrollMock),
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
        category_id: demoCorporationHrSystemPayrollMock.category_id,
        approval_step_assignee: {
          type: "JOB_FIELD",
          field_id: DEMO_CORPORATION_JOB_FIELD_ID.HR_MANAGER,
        },
        skip_access_level: ACCESS_LEVEL.MANAGER,
      },
    ],
  },
  /* Demo Energy - Portal / System */
  {
    ...categoryApprovalSettingsHelper(demoEnergyPortalSystemIssueMock),
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
        category_id: demoEnergyPortalSystemIssueMock.category_id,
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
        category_id: demoEnergyPortalSystemIssueMock.category_id,
        approval_step_assignee: {
          type: "JOB_FIELD",
          field_id: DEMO_ENERGY_JOB_FIELD_ID.TECHNOLOGY_MANAGER,
        },
        skip_access_level: ACCESS_LEVEL.MANAGER,
      },
    ],
  },
  {
    ...categoryApprovalSettingsHelper(demoEnergyAccountAccessMock),
    approval_step: [
      createManagerApprovalStep(
        21,
        demoEnergyAccountAccessMock.category_id,
      ),
    ],
  },
  {
    ...categoryApprovalSettingsHelper(demoEnergyHardwareDeviceMock),
    approval_step: [
      createManagerApprovalStep(
        22,
        demoEnergyHardwareDeviceMock.category_id,
      ),
    ],
  },
  {
    ...categoryApprovalSettingsHelper(demoEnergySoftwareApplicationMock),
    approval_step: [
      createManagerApprovalStep(
        23,
        demoEnergySoftwareApplicationMock.category_id,
      ),
    ],
  },
  {
    ...categoryApprovalSettingsHelper(demoEnergyDataInfoManagementMock),
    approval_step: [
      createJobFieldApprovalStep(
        24,
        demoEnergyDataInfoManagementMock.category_id,
        DEMO_ENERGY_JOB_FIELD_ID.ENERGY_SYSTEMS_MANAGER,
      ),
    ],
  },
  {
    ...categoryApprovalSettingsHelper(demoEnergyHrSystemPayrollMock),
    approval_step: [
      createJobFieldApprovalStep(
        25,
        demoEnergyHrSystemPayrollMock.category_id,
        DEMO_ENERGY_JOB_FIELD_ID.CORPORATE_SERVICES_DIRECTOR,
      ),
    ],
  },
  {
    ...categoryApprovalSettingsHelper(demoEnergyOtherInquiryMock),
    approval_step: [],
  },
];

const demoEnergyCategoryIds = new Set(
  [
    demoEnergyPortalSystemIssueMock,
    demoEnergyAccountAccessMock,
    demoEnergyHardwareDeviceMock,
    demoEnergySoftwareApplicationMock,
    demoEnergyDataInfoManagementMock,
    demoEnergyHrSystemPayrollMock,
    demoEnergyOtherInquiryMock,
  ].map((category) => category.category_id),
);

const demoCorporationApprovalStepSettingsMock =
  clientApprovalStepSettingsMock.filter(
    ({ category_id }) => !demoEnergyCategoryIds.has(category_id),
  );
const demoEnergyApprovalStepSettingsMock =
  clientApprovalStepSettingsMock.filter(({ category_id }) =>
    demoEnergyCategoryIds.has(category_id),
  );

const clientApprovalStepSettingsMocks: Record<
  string,
  DbCategoryApprovalSettings[]
> = {
  "11": demoCorporationApprovalStepSettingsMock,
  "13": demoEnergyApprovalStepSettingsMock,
  client_1: demoCorporationApprovalStepSettingsMock,
  client_2: demoEnergyApprovalStepSettingsMock,
  demo_corporation: demoCorporationApprovalStepSettingsMock,
  demo_energy: demoEnergyApprovalStepSettingsMock,
};

export const getClientApprovalStepSettingsMock = (
  clientId: string,
): DbCategoryApprovalSettings[] => {
  return clientApprovalStepSettingsMocks[clientId] ?? [];
};
