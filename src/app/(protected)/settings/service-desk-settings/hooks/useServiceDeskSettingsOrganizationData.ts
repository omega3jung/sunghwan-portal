"use client";

import { useMemo } from "react";

import { useDepartmentListQuery } from "@/feature/organization/department/client";
import { useEmployeeListQuery } from "@/feature/organization/employee/client";
import { useJobFieldListQuery } from "@/feature/organization/jobField/client";
import type { DbParams } from "@/shared/types";
import { combineRuleGroups, createFieldFilter } from "@/shared/utils/routing";

function createActiveCompanyParams(
  companyId: string,
  activeField: string,
): DbParams {
  return {
    filter: combineRuleGroups([
      createFieldFilter({
        field: "companyId",
        value: companyId,
      }),
      createFieldFilter({
        field: activeField,
        value: true,
      }),
    ]),
  };
}

export function useServiceDeskSettingsOrganizationData({
  companyId,
  enabled,
  includeDepartments = false,
}: {
  companyId: string | null;
  enabled: boolean;
  includeDepartments?: boolean;
}) {
  const employeeParams = useMemo(
    () =>
      companyId && enabled
        ? createActiveCompanyParams(companyId, "e_active")
        : undefined,
    [companyId, enabled],
  );
  const departmentParams = useMemo(
    () =>
      companyId && enabled && includeDepartments
        ? createActiveCompanyParams(companyId, "d_active")
        : undefined,
    [companyId, enabled, includeDepartments],
  );
  const jobFieldParams = useMemo(
    () =>
      companyId && enabled
        ? createActiveCompanyParams(companyId, "jf_active")
        : undefined,
    [companyId, enabled],
  );
  const employeeQuery = useEmployeeListQuery(employeeParams);
  const departmentQuery = useDepartmentListQuery(departmentParams);
  const jobFieldQuery = useJobFieldListQuery(jobFieldParams);

  return {
    employees: employeeQuery.data,
    departments: departmentQuery.data,
    jobFields: jobFieldQuery.data,
    isLoading:
      employeeQuery.isLoading ||
      departmentQuery.isLoading ||
      jobFieldQuery.isLoading,
  };
}
