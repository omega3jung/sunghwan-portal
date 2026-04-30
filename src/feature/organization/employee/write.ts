import { Employee } from "@/domain/organization";
import { idToNumber } from "@/lib/api/utils/mapId";
import { undefinedToNull } from "@/shared/utils/value";

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

export type CreateEmployeeInput = EmployeeWriteFields & {
  id?: number | string;
};
export type UpdateEmployeeInput = EmployeeWriteFields & { id: number | string };

export function toEmployeeWritePayload(
  input: CreateEmployeeInput | UpdateEmployeeInput,
): DbEmployeeWriteInput {
  return {
    employee_id: resolveEmployeeId(input.id),
    employee_user_name: input.userName,
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
  id: number | string = createMockId(),
): Employee {
  const { startDate, endDate, ...rest } = input;

  return {
    ...rest,
    id: resolveEmployeeId(id) ?? createMockId(),
    startDate: toDateValue(startDate),
    ...(endDate ? { endDate: toDateValue(endDate) } : {}),
  };
}

function resolveEmployeeId(value: number | string | undefined) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    return idToNumber(value);
  }

  return null;
}

function toDateValue(value: DateInput) {
  return value instanceof Date ? value : new Date(value);
}

function createMockId() {
  return Date.now();
}
