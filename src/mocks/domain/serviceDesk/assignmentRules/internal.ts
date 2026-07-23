import type { DbAssignmentRule } from "@/feature/serviceDesk/assignmentRule/types";

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

export const internalAssignmentRuleSettingsMock: DbAssignmentRule[] = [
  /* Portal / System */
  {
    category_id: internalPortalSystemIssueMock.category_id,
    assignee: {
      job_field_id: [21, 22, 23],
      employee_username: ["olivia_park"],
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
      employee_username: ["vivian_long"],
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
      employee_username: [
        "benjamin_rodriguez",
        "isabella_martinez",
        "lucas_hernandez",
        "tyler_baker",
        "savannah_nelson",
      ],
    },
  },
  /* Client Support */
  {
    category_id: internalClientUserSupportMock.category_id,
    assignee: {
      job_field_id: [11, 12, 23],
      employee_username: ["joshua_thomas"],
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
