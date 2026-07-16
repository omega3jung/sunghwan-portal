import { NextRequest, NextResponse } from "next/server";

import {
  getStringRuleGroupValue,
  parseRuleGroupFilter,
} from "@/lib/application/api/query";
import {
  getEmployees,
  getEmployeesByCompanyId,
} from "@/server/data/organization/employees";
import { toApiErrorResponse } from "@/server/portalApi/http";

import type { PortalApiJsonOptions } from "../types";
import { getPortalApiQueryValue, normalizePath } from "../utils";

const EMPLOYEES_PATH_PATTERN = /^\/employees(?:\/([^/]+))?$/;

export async function handleEmployeesPortalApi(
  request: NextRequest,
  options: PortalApiJsonOptions,
) {
  const path = normalizePath(options.path);
  const employeesMatch = EMPLOYEES_PATH_PATTERN.exec(path);
  const method = options.method ?? "GET";

  try {
    if (employeesMatch && method === "GET") {
      const companyId = resolveCompanyId(request, options);
      const employees = companyId
        ? await getEmployeesByCompanyId(true, companyId)
        : await getEmployees(true);

      return NextResponse.json({ data: employees });
    }

    return NextResponse.json({ message: "Not found" }, { status: 404 });
  } catch (error) {
    return toApiErrorResponse(error, {
      fallbackMessage: options.errorMessage,
    });
  }
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
