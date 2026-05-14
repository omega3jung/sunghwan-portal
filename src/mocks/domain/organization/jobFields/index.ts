import { DbJobField } from "@/feature/organization/jobField/mapper";

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
    jf_name: { en: "Company" },
    jf_description: { en: "" },
    jf_did: 0,
    jf_parent_id: null,
    jf_active: true,
  },
  ...jobFieldsMock,
];
