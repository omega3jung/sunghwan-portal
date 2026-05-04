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
    job_field_id: 0,
    job_field_name: { en: "Company" },
    job_field_description: { en: "" },
    job_field_department_id: 0,
    job_field_parent_id: null,
    job_field_active: true,
  },
  ...jobFieldsMock,
];
