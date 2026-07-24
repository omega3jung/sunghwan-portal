import { NextRequest, NextResponse } from "next/server";

import {
  applyRuleGroupFilter,
  getStringRuleGroupValue,
  parseRuleGroupFilter,
} from "@/lib/application/api/query";
import { getActiveCompanies } from "@/server/data/organization/company";
import type { DepartmentDto } from "@/server/data/organization/department";
import { getActiveDepartments } from "@/server/data/organization/department";
import { getActiveDepartmentsByCompanyId } from "@/server/data/organization/department";
import type { JobFieldDto } from "@/server/data/organization/jobField";
import { getActiveJobFields } from "@/server/data/organization/jobField";
import { getActiveJobFieldsByCompanyId } from "@/server/data/organization/jobField";

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
      const companyId = resolveCompanyId(request, options);
      const items = filterDepartmentsByQuery(
        companyId
          ? await getActiveDepartmentsByCompanyId(companyId)
          : await getActiveDepartments(),
        request,
        options,
      );

      return NextResponse.json({
        items,
        total: items.length,
      });
    }

    if (jobFieldsMatch) {
      const companyId = resolveCompanyId(request, options);
      const items = filterJobFieldsByQuery(
        companyId
          ? await getActiveJobFieldsByCompanyId(companyId)
          : await getActiveJobFields(),
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
  const filter = parseRuleGroupFilter(
    getPortalApiQueryValue(request, options, "filter"),
  );

  return applyRuleGroupFilter(
    items.map((department) => ({
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
  const filter = parseRuleGroupFilter(
    getPortalApiQueryValue(request, options, "filter"),
  );

  return applyRuleGroupFilter(
    items.map((jobField) => ({
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

function resolveCompanyId(
  request: NextRequest,
  options: Pick<PortalApiJsonOptions, "query">,
): number | null {
  const filter = parseRuleGroupFilter(
    getPortalApiQueryValue(request, options, "filter"),
  );
  const value =
    getPortalApiQueryValue(request, options, "companyId") ??
    getStringRuleGroupValue(filter, "companyId");
  const companyId = Number(value);

  return Number.isSafeInteger(companyId) && companyId > 0 ? companyId : null;
}
