import { DbAssignmentRule } from "@/feature/serviceDesk/assignmentRule/types";

import {
  client1PortalSystemIssueMock,
  clientAccountAccessMock,
  clientHardwareDeviceMock,
  clientHrSystemPayrollMock,
  clientNetworkConnectivityMock,
  clientPrintingOfficeEquipmentMock,
  clientSoftwareApplicationMock,
} from "./categories/client";
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
} from "./categories/internal";

export const internalAssignmentRuleSettingsMock: DbAssignmentRule[] = [
  /* Portal / System */
  {
    category_id: internalPortalSystemIssueMock.category_id,
    assignee: {
      job_field_id: [21, 22, 23],
      employee_username: ["32"],
    },
  },
  /* Account & Access */
  {
    category_id: internalAccountAccessMock.category_id,
    assignee: {
      job_field_id: [27, 28, 25],
      employee_username: [],
    },
  },
  /* Hardware & Device */
  {
    category_id: internalHardwareDeviceMock.category_id,
    assignee: {
      job_field_id: [24, 25, 26],
      employee_username: ["117"],
    },
  },
  /* Software & App */
  {
    category_id: internalSoftwareApplicationMock.category_id,
    assignee: {
      job_field_id: [20, 22, 23],
      employee_username: [],
    },
  },
  /* Network */
  {
    category_id: internalNetworkConnectivityMock.category_id,
    assignee: {
      job_field_id: [17, 19, 18],
      employee_username: [],
    },
  },
  /* Printing */
  {
    category_id: internalPrintingOfficeEquipmentMock.category_id,
    assignee: {
      job_field_id: [25, 26],
      employee_username: [],
    },
  },
  /* HR Systems */
  {
    category_id: internalHrSystemPayrollMock.category_id,
    assignee: {
      job_field_id: [3, 4, 23],
      employee_username: [],
    },
  },
  /* Data Management */
  {
    category_id: internalDataInfoManagementMock.category_id,
    assignee: {
      job_field_id: [23, 7, 4],
      employee_username: ["59", "60", "61", "123", "124"],
    },
  },
  /* Client Support */
  {
    category_id: internalClientUserSupportMock.category_id,
    assignee: {
      job_field_id: [11, 12, 23],
      employee_username: ["15"],
    },
  },
  /* Other Inquiry */
  {
    category_id: internalOtherInquiryMock.category_id,
    assignee: {
      job_field_id: [25],
      employee_username: [],
    },
  },
];

export const clientAssignmentRuleSettingsMock: DbAssignmentRule[] = [
  /* Portal / System */
  {
    category_id: client1PortalSystemIssueMock.category_id,
    assignee: {
      job_field_id: [21, 22, 23],
      employee_username: [],
    },
  },
  /* Account & Access */
  {
    category_id: clientAccountAccessMock.category_id,
    assignee: {
      job_field_id: [27, 28, 25],
      employee_username: [],
    },
  },
  /* Hardware & Device */
  {
    category_id: clientHardwareDeviceMock.category_id,
    assignee: {
      job_field_id: [24, 25, 26],
      employee_username: [],
    },
  },
  /* Software & App */
  {
    category_id: clientSoftwareApplicationMock.category_id,
    assignee: {
      job_field_id: [20, 22, 23],
      employee_username: [],
    },
  },
  /* Network */
  {
    category_id: clientNetworkConnectivityMock.category_id,
    assignee: {
      job_field_id: [17, 19, 18],
      employee_username: [],
    },
  },
  /* Printing */
  {
    category_id: clientPrintingOfficeEquipmentMock.category_id,
    assignee: {
      job_field_id: [25, 26],
      employee_username: [],
    },
  },
  /* HR Systems */
  {
    category_id: clientHrSystemPayrollMock.category_id,
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
