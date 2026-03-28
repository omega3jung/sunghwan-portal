import { idToNumber } from "@/api/utils/mapId";
import { Employee } from "@/domain/organization";
import { undefinedToNull } from "@/shared/utils/nullable";

import { DbEmployee } from "./mapper";

type DateInput = Date | string;

type EmployeeWriteFields = Omit<Employee, "id" | "startDate" | "endDate"> & {
  startDate: DateInput;
  endDate?: DateInput;
};

type DbEmployeeWriteInput = Omit<
  DbEmployee,
  "employee_id" | "employee_start_date" | "employee_end_date"
> & {
  employee_id?: number | null;
  employee_start_date: DateInput;
  employee_end_date: DateInput | null;
};

export type CreateEmployeeInput = EmployeeWriteFields & { id?: string };
export type UpdateEmployeeInput = EmployeeWriteFields & { id: string };

export function toEmployeeWritePayload(
  input: CreateEmployeeInput | UpdateEmployeeInput,
): DbEmployeeWriteInput {
  return {
    employee_id: idToNumber(input.id),
    employee_name: input.name,
    employee_phone: input.phone,
    employee_email: input.email,
    employee_image_url: undefinedToNull(input.imageUrl),
    employee_department_id: Number(input.departmentId),
    employee_job_field_id: Number(input.jobFieldId),
    employee_company_id: Number(input.companyId),
    employee_start_date: input.startDate,
    employee_end_date: undefinedToNull(input.endDate),
    employee_shift_id: idToNumber(input.shiftId),
    employee_active: input.active,
    employee_engineer_id: idToNumber(input.engineerId),
    employee_rf_tag_id: undefinedToNull(input.rfTagId),
    employee_hour_rate: undefinedToNull(input.hourRate),
  };
}

export function toEmployeeMockResource(
  input: CreateEmployeeInput | UpdateEmployeeInput,
  id = createMockId(),
): Employee {
  const { startDate, endDate, ...rest } = input;

  return {
    ...rest,
    id,
    startDate: toDateValue(startDate),
    ...(endDate ? { endDate: toDateValue(endDate) } : {}),
  };
}

function toDateValue(value: DateInput) {
  return value instanceof Date ? value : new Date(value);
}

function createMockId() {
  return Date.now().toString();
}
