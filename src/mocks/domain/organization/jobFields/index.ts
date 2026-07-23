import { DbJobField } from "@/feature/organization/jobField";

import { internalCompanyMock } from "../companies";
import { clientJobFieldsMock } from "./client";
import headOfficeJobFieldMock from "./portalOwner/headOffice.json";
import itJobFielMock from "./portalOwner/it.json";
import logisticsJobFielMock from "./portalOwner/logistics.json";
import repairCenterJobFielMock from "./portalOwner/repairCenter.json";

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
    jf_company_id: 1,
    jf_parent_id: null,
    jf_active: true,
  },
  ...jobFieldsMock,
  ...clientJobFieldsMock,
];
