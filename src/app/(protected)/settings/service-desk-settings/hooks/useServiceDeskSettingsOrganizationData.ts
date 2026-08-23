"use client";

import { useMemo } from "react";

import { useDepartmentListQuery } from "@/feature/organization/department/client";
import { useEmployeeListQuery } from "@/feature/organization/employee/client";
import { useJobFieldListQuery } from "@/feature/organization/jobField/client";
import type { DbParams } from "@/shared/types";
import { combineRuleGroups, createFieldFilter } from "@/shared/utils/routing";

function createActiveCompanyParams(
  companyIds: string[],
  activeField: string,
): DbParams {
  return {
    filter: combineRuleGroups([
      createFieldFilter({
        field: "companyId",
        operator: "in",
        value: companyIds.join(","),
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
  companyIds,
  enabled,
  includeDepartments = false,
}: {
  companyId: string | null;
  companyIds?: string[];
  enabled: boolean;
  includeDepartments?: boolean;
}) {
  const effectiveCompanyIds = useMemo(
    () => companyIds ?? (companyId ? [companyId] : []),
    [companyId, companyIds],
  );
  const employeeParams = useMemo(
    () =>
      effectiveCompanyIds.length > 0 && enabled
        ? createActiveCompanyParams(effectiveCompanyIds, "e_active")
        : undefined,
    [effectiveCompanyIds, enabled],
  );
  const departmentParams = useMemo(
    () =>
      effectiveCompanyIds.length > 0 && enabled && includeDepartments
        ? createActiveCompanyParams(effectiveCompanyIds, "d_active")
        : undefined,
    [effectiveCompanyIds, enabled, includeDepartments],
  );
  const jobFieldParams = useMemo(
    () =>
      effectiveCompanyIds.length > 0 && enabled
        ? createActiveCompanyParams(effectiveCompanyIds, "jf_active")
        : undefined,
    [effectiveCompanyIds, enabled],
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
