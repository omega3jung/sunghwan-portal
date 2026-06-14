import { Employee } from "@/domain/organization";
import { idToNumber } from "@/lib/api/utils/mapId";
import { undefinedToNull } from "@/shared/utils/value";

import { DbEmployee } from "./types";

type DateInput = Date | string;

type EmployeeWriteFields = Omit<Employee, "id" | "startDate" | "endDate"> & {
  startDate: DateInput;
  endDate?: DateInput;
};

type DbEmployeeWriteInput = Omit<
  DbEmployee,
  "e_id" | "e_start_date" | "e_end_date"
> & {
  e_id?: number | null;
  e_start_date: DateInput;
  e_end_date: DateInput | null;
};

export type CreateEmployeeInput = EmployeeWriteFields & {
  id?: number | string;
};
export type UpdateEmployeeInput = EmployeeWriteFields & { id: number | string };

export function toEmployeeWritePayload(
  input: CreateEmployeeInput | UpdateEmployeeInput,
): DbEmployeeWriteInput {
  return {
    e_id: resolveEmployeeId(input.id),
    e_username: input.username,
    e_name: input.name,
    e_phone: input.phone,
    e_email: input.email,
    e_image_url: undefinedToNull(input.imageUrl),
    e_department_id: Number(input.departmentId),
    e_job_field_id: Number(input.jobFieldId),
    e_company_id: Number(input.companyId),
    e_start_date: input.startDate,
    e_end_date: undefinedToNull(input.endDate),
    e_work_shift_id: idToNumber(input.shiftId),
    e_active: input.active,
    e_engineer_id: idToNumber(input.engineerId),
    e_rf_tag_id: undefinedToNull(input.rfTagId),
    e_hour_rate: undefinedToNull(input.hourRate),
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
