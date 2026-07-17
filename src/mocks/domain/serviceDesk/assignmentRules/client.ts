import type { DbAssignmentRule } from "@/feature/serviceDesk/assignmentRule/types";

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

const CLIENT_1_JOB_FIELD_ID = {
  TECHNOLOGY_DIRECTOR: 289,
  TECHNOLOGY_MANAGER: 290,
  IT_SUPPORT_MANAGER: 291,
  IT_SPECIALIST: 292,
  PEOPLE_DIRECTOR: 293,
  PEOPLE_SPECIALIST: 294,
} as const;

const CLIENT_1_EMPLOYEE_USERNAME = {
  TECHNOLOGY_DIRECTOR: "yusuf_garcia",
  TECHNOLOGY_MANAGER: "zoe_novak",
  IT_SUPPORT_MANAGER: "adrian_usman",
  IT_SPECIALIST: "bianca_clark",
  PEOPLE_DIRECTOR: "caleb_park",
} as const;

const CLIENT_2_JOB_FIELD_ID = {
  TECHNOLOGY_DIRECTOR: 309,
  TECHNOLOGY_MANAGER: 310,
  SYSTEMS_MANAGER: 311,
  SYSTEMS_ENGINEER: 312,
} as const;

export const clientAssignmentRuleSettingsMock: DbAssignmentRule[] = [
  /* Portal / System */
  {
    category_id: client1PortalSystemIssueMock.category_id,
    assignee: {
      job_field_id: [
        CLIENT_1_JOB_FIELD_ID.TECHNOLOGY_DIRECTOR,
        CLIENT_1_JOB_FIELD_ID.TECHNOLOGY_MANAGER,
        CLIENT_1_JOB_FIELD_ID.IT_SUPPORT_MANAGER,
        CLIENT_1_JOB_FIELD_ID.IT_SPECIALIST,
      ],
      employee_username: [],
    },
  },
  /* Account & Access */
  {
    category_id: clientAccountAccessMock.category_id,
    assignee: {
      job_field_id: [
        CLIENT_1_JOB_FIELD_ID.TECHNOLOGY_DIRECTOR,
        CLIENT_1_JOB_FIELD_ID.TECHNOLOGY_MANAGER,
        CLIENT_1_JOB_FIELD_ID.IT_SUPPORT_MANAGER,
      ],
      employee_username: [CLIENT_1_EMPLOYEE_USERNAME.IT_SUPPORT_MANAGER],
    },
  },
  /* Hardware & Device */
  {
    category_id: clientHardwareDeviceMock.category_id,
    assignee: {
      job_field_id: [
        CLIENT_1_JOB_FIELD_ID.IT_SUPPORT_MANAGER,
        CLIENT_1_JOB_FIELD_ID.IT_SPECIALIST,
      ],
      employee_username: [CLIENT_1_EMPLOYEE_USERNAME.IT_SUPPORT_MANAGER],
    },
  },
  /* Software & App */
  {
    category_id: clientSoftwareApplicationMock.category_id,
    assignee: {
      job_field_id: [
        CLIENT_1_JOB_FIELD_ID.TECHNOLOGY_DIRECTOR,
        CLIENT_1_JOB_FIELD_ID.TECHNOLOGY_MANAGER,
        CLIENT_1_JOB_FIELD_ID.IT_SPECIALIST,
      ],
      employee_username: [CLIENT_1_EMPLOYEE_USERNAME.TECHNOLOGY_DIRECTOR],
    },
  },
  /* Network */
  {
    category_id: clientNetworkConnectivityMock.category_id,
    assignee: {
      job_field_id: [
        CLIENT_1_JOB_FIELD_ID.TECHNOLOGY_DIRECTOR,
        CLIENT_1_JOB_FIELD_ID.TECHNOLOGY_MANAGER,
        CLIENT_1_JOB_FIELD_ID.IT_SPECIALIST,
      ],
      employee_username: [CLIENT_1_EMPLOYEE_USERNAME.TECHNOLOGY_MANAGER],
    },
  },
  /* Printing */
  {
    category_id: clientPrintingOfficeEquipmentMock.category_id,
    assignee: {
      job_field_id: [
        CLIENT_1_JOB_FIELD_ID.IT_SUPPORT_MANAGER,
        CLIENT_1_JOB_FIELD_ID.IT_SPECIALIST,
      ],
      employee_username: [CLIENT_1_EMPLOYEE_USERNAME.IT_SPECIALIST],
    },
  },
  /* HR Systems */
  {
    category_id: clientHrSystemPayrollMock.category_id,
    assignee: {
      job_field_id: [
        CLIENT_1_JOB_FIELD_ID.PEOPLE_DIRECTOR,
        CLIENT_1_JOB_FIELD_ID.PEOPLE_SPECIALIST,
      ],
      employee_username: [CLIENT_1_EMPLOYEE_USERNAME.PEOPLE_DIRECTOR],
    },
  },
  /* Client 2 Portal / System */
  {
    category_id: client2PortalSystemIssueMock.category_id,
    assignee: {
      job_field_id: [
        CLIENT_2_JOB_FIELD_ID.TECHNOLOGY_DIRECTOR,
        CLIENT_2_JOB_FIELD_ID.TECHNOLOGY_MANAGER,
        CLIENT_2_JOB_FIELD_ID.SYSTEMS_MANAGER,
        CLIENT_2_JOB_FIELD_ID.SYSTEMS_ENGINEER,
      ],
      employee_username: ["gabriel_zhang"],
    },
  },
];

const client1AssignmentRuleSettingsMock =
  clientAssignmentRuleSettingsMock.filter(
    ({ category_id }) => category_id !== client2PortalSystemIssueMock.category_id,
  );
const client2AssignmentRuleSettingsMock =
  clientAssignmentRuleSettingsMock.filter(
    ({ category_id }) => category_id === client2PortalSystemIssueMock.category_id,
  );

const clientAssignmentRuleSettingsMocks: Record<string, DbAssignmentRule[]> = {
  "11": client1AssignmentRuleSettingsMock,
  "12": client2AssignmentRuleSettingsMock,
  client_1: client1AssignmentRuleSettingsMock,
  client_2: client2AssignmentRuleSettingsMock,
};

const defaultClientAssignmentRuleSettingsMock =
  client1AssignmentRuleSettingsMock;

export const getClientAssignmentRuleSettingsMock = (
  clientId: string,
): DbAssignmentRule[] => {
  return (
    clientAssignmentRuleSettingsMocks[clientId] ??
    defaultClientAssignmentRuleSettingsMock
  );
};
