import { LocalizedName } from "@/domain/organization";

/** Defines the employee response dto exchanged across the server API boundary. */
export interface EmployeeResponseDto {
  employeeId: number;
  username: string;
  name: LocalizedName;
  phone: string;
  email: string;
  imageUrl: string | null;
  departmentId: number;
  jobFieldId: number;
  companyId: number;
  startDate: string;
  endDate: string | null;
  shiftId: number | null;
  active: boolean;
  engineerId: number | null;
  rfTagId: string | null;
  hourRate: number | null;
}
