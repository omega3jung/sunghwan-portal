import { NextRequest, NextResponse } from "next/server";

import { getActiveCompanies } from "@/server/data/organization/company";
import type { DepartmentDto } from "@/server/data/organization/department";
import { getActiveDepartments } from "@/server/data/organization/department";
import type { JobFieldDto } from "@/server/data/organization/jobField";
import { getActiveJobFields } from "@/server/data/organization/jobField";
import {
  applyRuleGroupFilter,
  parseRuleGroupFilter,
} from "@/server/shared/query";

import { PortalApiJsonOptions } from "../types";
import { getPortalApiQueryValue, normalizePath } from "../utils";

const COMPANIES_PATH_PATTERN = /^\/company$/;
const DEPARTMENTS_PATH_PATTERN = /^\/department$/;
const JOB_FIELDS_PATH_PATTERN = /^\/job-field$/;

export async function handleOrganizationPortalApi(
  request: NextRequest,
  options: PortalApiJsonOptions,
) {
  const path = normalizePath(options.path);
  const companiesMatch = COMPANIES_PATH_PATTERN.exec(path);
  const departmentsMatch = DEPARTMENTS_PATH_PATTERN.exec(path);
  const jobFieldsMatch = JOB_FIELDS_PATH_PATTERN.exec(path);
  const method = options.method ?? "GET";

  try {
    if (method !== "GET") {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    if (companiesMatch) {
      const items = await getActiveCompanies();

      return NextResponse.json({
        items,
        total: items.length,
      });
    }

    if (departmentsMatch) {
      const items = filterDepartmentsByQuery(
        await getActiveDepartments(),
        request,
        options,
      );

      return NextResponse.json({
        items,
        total: items.length,
      });
    }

    if (jobFieldsMatch) {
      const items = filterJobFieldsByQuery(
        await getActiveJobFields(),
        request,
        options,
      );

      return NextResponse.json({
        items,
        total: items.length,
      });
    }

    return NextResponse.json({ message: "Not found" }, { status: 404 });
  } catch {
    return NextResponse.json(
      { message: options.errorMessage },
      { status: 500 },
    );
  }
}

function filterDepartmentsByQuery(
  items: DepartmentDto[],
  request: NextRequest,
  options: Pick<PortalApiJsonOptions, "query">,
) {
  const companyId = getPortalApiQueryValue(request, options, "companyId");
  const filter = parseRuleGroupFilter(
    getPortalApiQueryValue(request, options, "filter"),
  );
  const filteredByCompany = companyId
    ? items.filter((department) => String(department.d_company_id) === companyId)
    : items;

  return applyRuleGroupFilter(
    filteredByCompany.map((department) => ({
      ...department,
      id: department.d_id,
      companyId: department.d_company_id,
      active: department.d_active,
    })),
    filter,
  ).map(({ id: _id, companyId: _companyId, active: _active, ...department }) =>
    department as DepartmentDto,
  );
}

function filterJobFieldsByQuery(
  items: JobFieldDto[],
  request: NextRequest,
  options: Pick<PortalApiJsonOptions, "query">,
) {
  const companyId = getPortalApiQueryValue(request, options, "companyId");
  const filter = parseRuleGroupFilter(
    getPortalApiQueryValue(request, options, "filter"),
  );
  const filteredByCompany = companyId
    ? items.filter((jobField) => String(jobField.jf_company_id) === companyId)
    : items;

  return applyRuleGroupFilter(
    filteredByCompany.map((jobField) => ({
      ...jobField,
      id: jobField.jf_id,
      companyId: jobField.jf_company_id,
      active: jobField.jf_active,
    })),
    filter,
  ).map(({ id: _id, companyId: _companyId, active: _active, ...jobField }) =>
    jobField as JobFieldDto,
  );
}
