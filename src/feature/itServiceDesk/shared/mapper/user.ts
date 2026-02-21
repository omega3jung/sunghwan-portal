import { Locale } from "@/domain/config";
import { Employee } from "@/feature/dataSetup";

import { ItServiceDeskUser } from "../types";

export const toItServiceDeskUser = (
  employee: Employee,
  locale: Locale,
): ItServiceDeskUser => {
  const name = employee.name[locale] ?? employee.name.en;

  return {
    id: employee.id,
    email: employee.email,
    imageUrl: employee.imageUrl,
    departmentId: employee.departmentId,
    clientId: employee.clientId,
    active: employee.active,
    fullName: [name.first, name.middle, name.last].filter(Boolean).join(" "),
  };
};
