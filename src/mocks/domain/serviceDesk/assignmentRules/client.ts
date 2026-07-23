import type { DbAssignmentRule } from "@/feature/serviceDesk/assignmentRule/types";

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

const DEMO_CORPORATION_JOB_FIELD_ID = {
  TECHNOLOGY_DIRECTOR: 289,
  TECHNOLOGY_MANAGER: 290,
  IT_SUPPORT_MANAGER: 291,
  IT_SPECIALIST: 292,
  PEOPLE_DIRECTOR: 293,
  PEOPLE_SPECIALIST: 294,
} as const;

const DEMO_CORPORATION_EMPLOYEE_USERNAME = {
  TECHNOLOGY_DIRECTOR: "yusuf_garcia",
  TECHNOLOGY_MANAGER: "zoe_novak",
  IT_SUPPORT_MANAGER: "adrian_usman",
  IT_SPECIALIST: "bianca_clark",
  PEOPLE_DIRECTOR: "caleb_park",
} as const;

const DEMO_ENERGY_JOB_FIELD_ID = {
  ASSET_MAINTENANCE_MANAGER: 327,
  CORPORATE_SERVICES_DIRECTOR: 333,
  CORPORATE_SERVICES_SPECIALIST: 334,
  ENERGY_OPERATIONS_DIRECTOR: 321,
  ENERGY_OPERATIONS_MANAGER: 322,
  ENERGY_SYSTEMS_ENGINEER: 332,
  ENERGY_SYSTEMS_MANAGER: 331,
  MAINTENANCE_ENGINEER: 328,
  TECHNOLOGY_DIRECTOR: 329,
  TECHNOLOGY_MANAGER: 330,
} as const;

const DEMO_ENERGY_EMPLOYEE_USERNAME = {
  ASSET_MAINTENANCE_MANAGER: "william_green",
  CORPORATE_SERVICES_DIRECTOR: "caleb_smith",
  CORPORATE_SERVICES_SPECIALIST: "diana_garcia",
  ENERGY_OPERATIONS_MANAGER: "rosa_hall",
  ENERGY_SYSTEMS_MANAGER: "adrian_vega",
  TECHNOLOGY_DIRECTOR: "yusuf_hassan",
  TECHNOLOGY_MANAGER: "zoe_okafor",
} as const;

export const clientAssignmentRuleSettingsMock: DbAssignmentRule[] = [
  /* Portal / System */
  {
    category_id: demoCorporationPortalSystemIssueMock.category_id,
    assignee: {
      job_field_id: [21, 22, 23],
      employee_username: ["olivia_park"],
    },
  },
  /* Account & Access */
  {
    category_id: demoCorporationAccountAccessMock.category_id,
    assignee: {
      job_field_id: [
        DEMO_CORPORATION_JOB_FIELD_ID.TECHNOLOGY_DIRECTOR,
        DEMO_CORPORATION_JOB_FIELD_ID.TECHNOLOGY_MANAGER,
        DEMO_CORPORATION_JOB_FIELD_ID.IT_SUPPORT_MANAGER,
      ],
      employee_username: [DEMO_CORPORATION_EMPLOYEE_USERNAME.IT_SUPPORT_MANAGER],
    },
  },
  /* Hardware & Device */
  {
    category_id: demoCorporationHardwareDeviceMock.category_id,
    assignee: {
      job_field_id: [
        DEMO_CORPORATION_JOB_FIELD_ID.IT_SUPPORT_MANAGER,
        DEMO_CORPORATION_JOB_FIELD_ID.IT_SPECIALIST,
      ],
      employee_username: [DEMO_CORPORATION_EMPLOYEE_USERNAME.IT_SUPPORT_MANAGER],
    },
  },
  /* Software & App */
  {
    category_id: demoCorporationSoftwareApplicationMock.category_id,
    assignee: {
      job_field_id: [
        DEMO_CORPORATION_JOB_FIELD_ID.TECHNOLOGY_DIRECTOR,
        DEMO_CORPORATION_JOB_FIELD_ID.TECHNOLOGY_MANAGER,
        DEMO_CORPORATION_JOB_FIELD_ID.IT_SPECIALIST,
      ],
      employee_username: [DEMO_CORPORATION_EMPLOYEE_USERNAME.TECHNOLOGY_DIRECTOR],
    },
  },
  /* Network */
  {
    category_id: demoCorporationNetworkConnectivityMock.category_id,
    assignee: {
      job_field_id: [
        DEMO_CORPORATION_JOB_FIELD_ID.TECHNOLOGY_DIRECTOR,
        DEMO_CORPORATION_JOB_FIELD_ID.TECHNOLOGY_MANAGER,
        DEMO_CORPORATION_JOB_FIELD_ID.IT_SPECIALIST,
      ],
      employee_username: [DEMO_CORPORATION_EMPLOYEE_USERNAME.TECHNOLOGY_MANAGER],
    },
  },
  /* Printing */
  {
    category_id: demoCorporationPrintingOfficeEquipmentMock.category_id,
    assignee: {
      job_field_id: [
        DEMO_CORPORATION_JOB_FIELD_ID.IT_SUPPORT_MANAGER,
        DEMO_CORPORATION_JOB_FIELD_ID.IT_SPECIALIST,
      ],
      employee_username: [DEMO_CORPORATION_EMPLOYEE_USERNAME.IT_SPECIALIST],
    },
  },
  /* HR Systems */
  {
    category_id: demoCorporationHrSystemPayrollMock.category_id,
    assignee: {
      job_field_id: [
        DEMO_CORPORATION_JOB_FIELD_ID.PEOPLE_DIRECTOR,
        DEMO_CORPORATION_JOB_FIELD_ID.PEOPLE_SPECIALIST,
      ],
      employee_username: [DEMO_CORPORATION_EMPLOYEE_USERNAME.PEOPLE_DIRECTOR],
    },
  },
  /* Demo Energy - Portal / System */
  {
    category_id: demoEnergyPortalSystemIssueMock.category_id,
    assignee: {
      job_field_id: [21, 22, 23],
      employee_username: ["olivia_park"],
    },
  },
  {
    category_id: demoEnergyAccountAccessMock.category_id,
    assignee: {
      job_field_id: [
        DEMO_ENERGY_JOB_FIELD_ID.CORPORATE_SERVICES_DIRECTOR,
        DEMO_ENERGY_JOB_FIELD_ID.CORPORATE_SERVICES_SPECIALIST,
      ],
      employee_username: [
        DEMO_ENERGY_EMPLOYEE_USERNAME.CORPORATE_SERVICES_SPECIALIST,
      ],
    },
  },
  {
    category_id: demoEnergyHardwareDeviceMock.category_id,
    assignee: {
      job_field_id: [
        DEMO_ENERGY_JOB_FIELD_ID.ASSET_MAINTENANCE_MANAGER,
        DEMO_ENERGY_JOB_FIELD_ID.MAINTENANCE_ENGINEER,
      ],
      employee_username: [
        DEMO_ENERGY_EMPLOYEE_USERNAME.ASSET_MAINTENANCE_MANAGER,
      ],
    },
  },
  {
    category_id: demoEnergySoftwareApplicationMock.category_id,
    assignee: {
      job_field_id: [
        DEMO_ENERGY_JOB_FIELD_ID.TECHNOLOGY_DIRECTOR,
        DEMO_ENERGY_JOB_FIELD_ID.TECHNOLOGY_MANAGER,
        DEMO_ENERGY_JOB_FIELD_ID.ENERGY_SYSTEMS_MANAGER,
        DEMO_ENERGY_JOB_FIELD_ID.ENERGY_SYSTEMS_ENGINEER,
      ],
      employee_username: [
        DEMO_ENERGY_EMPLOYEE_USERNAME.TECHNOLOGY_MANAGER,
      ],
    },
  },
  {
    category_id: demoEnergyDataInfoManagementMock.category_id,
    assignee: {
      job_field_id: [
        DEMO_ENERGY_JOB_FIELD_ID.ENERGY_SYSTEMS_MANAGER,
        DEMO_ENERGY_JOB_FIELD_ID.ENERGY_SYSTEMS_ENGINEER,
      ],
      employee_username: [
        DEMO_ENERGY_EMPLOYEE_USERNAME.ENERGY_SYSTEMS_MANAGER,
      ],
    },
  },
  {
    category_id: demoEnergyHrSystemPayrollMock.category_id,
    assignee: {
      job_field_id: [
        DEMO_ENERGY_JOB_FIELD_ID.CORPORATE_SERVICES_DIRECTOR,
        DEMO_ENERGY_JOB_FIELD_ID.CORPORATE_SERVICES_SPECIALIST,
      ],
      employee_username: [
        DEMO_ENERGY_EMPLOYEE_USERNAME.CORPORATE_SERVICES_DIRECTOR,
      ],
    },
  },
  {
    category_id: demoEnergyOtherInquiryMock.category_id,
    assignee: {
      job_field_id: [
        DEMO_ENERGY_JOB_FIELD_ID.ENERGY_OPERATIONS_DIRECTOR,
        DEMO_ENERGY_JOB_FIELD_ID.ENERGY_OPERATIONS_MANAGER,
      ],
      employee_username: [
        DEMO_ENERGY_EMPLOYEE_USERNAME.ENERGY_OPERATIONS_MANAGER,
      ],
    },
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

const demoCorporationAssignmentRuleSettingsMock =
  clientAssignmentRuleSettingsMock.filter(
    ({ category_id }) => !demoEnergyCategoryIds.has(category_id),
  );
const demoEnergyAssignmentRuleSettingsMock =
  clientAssignmentRuleSettingsMock.filter(({ category_id }) =>
    demoEnergyCategoryIds.has(category_id),
  );

const clientAssignmentRuleSettingsMocks: Record<string, DbAssignmentRule[]> = {
  "11": demoCorporationAssignmentRuleSettingsMock,
  "13": demoEnergyAssignmentRuleSettingsMock,
  client_1: demoCorporationAssignmentRuleSettingsMock,
  client_2: demoEnergyAssignmentRuleSettingsMock,
  demo_corporation: demoCorporationAssignmentRuleSettingsMock,
  demo_energy: demoEnergyAssignmentRuleSettingsMock,
};

export const getClientAssignmentRuleSettingsMock = (
  clientId: string,
): DbAssignmentRule[] => {
  return clientAssignmentRuleSettingsMocks[clientId] ?? [];
};
