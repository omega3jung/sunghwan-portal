import { NextRequest, NextResponse } from "next/server";

import { getActiveCompanies } from "@/server/data/organization/company";
import { getActiveDepartments } from "@/server/data/organization/department";
import { getActiveJobFields } from "@/server/data/organization/jobField";

import { PortalApiJsonOptions } from "../types";
import { normalizePath } from "../utils";

const COMPANIES_PATH_PATTERN = /^\/company$/;
const DEPARTMENTS_PATH_PATTERN = /^\/department$/;
const JOB_FIELDS_PATH_PATTERN = /^\/job-field$/;

export async function handleOrganizationPortalApi(
  _request: NextRequest,
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
      const items = await getActiveDepartments();

      return NextResponse.json({
        items,
        total: items.length,
      });
    }

    if (jobFieldsMatch) {
      const items = await getActiveJobFields();

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
