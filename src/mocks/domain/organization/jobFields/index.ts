import { DbJobField } from "@/feature/organization/jobField";

import { internalCompanyMock } from "../companies";
import headOfficeJobFieldMock from "./headOffice.json";
import itJobFielMock from "./it.json";
import logisticsJobFielMock from "./logistics.json";
import repairCenterJobFielMock from "./repairCenter.json";

export const jobFieldsMock: DbJobField[] = [
  ...headOfficeJobFieldMock,
  ...itJobFielMock,
  ...repairCenterJobFielMock,
  ...logisticsJobFielMock,
];

export const allJobFieldsMock: DbJobField[] = [
  /*  Company  */
  {
    jf_id: 0,
    jf_name: internalCompanyMock.company_name,
    jf_description: internalCompanyMock.company_name,
    jf_department_id: 0,
    jf_parent_id: null,
    jf_active: true,
  },
  ...jobFieldsMock,
];
