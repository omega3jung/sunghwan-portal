import { NextRequest, NextResponse } from "next/server";

import { getEmployees } from "@/server/data/organization/employees";

import { PortalApiJsonOptions } from "../types";
import { normalizePath } from "../utils";

const EMPLOYEES_PATH_PATTERN = /^\/employees(?:\/([^/]+))?$/;

export async function handleEmployeesPortalApi(
  _request: NextRequest,
  options: PortalApiJsonOptions,
) {
  const path = normalizePath(options.path);
  const employeesMatch = EMPLOYEES_PATH_PATTERN.exec(path);

  const method = options.method ?? "GET";

  try {
    // api/employees/left-menu.
    if (employeesMatch) {
      // REST api GET.
      if (method === "GET") {
        const employees = await getEmployees(true);

        return NextResponse.json({ data: employees });
      }
    }
    // path not found.
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  } catch {
    return NextResponse.json(
      { message: options.errorMessage },
      { status: 500 },
    );
  }
}
