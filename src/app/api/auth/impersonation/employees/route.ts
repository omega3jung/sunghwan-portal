import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getAuthToken, isAdmin } from "@/app/api/_adapters";
import { listLocalEligibleImpersonationEmployees } from "@/app/api/_adapters/localDemo/user";
import { authApiJson } from "@/auth/api";

const companyIdSchema = z.coerce.number().int().positive();

/** Lists active employees backed by a portal login account for impersonation. */
export async function GET(request: NextRequest) {
  const token = await getAuthToken(request);

  if (!token?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAdmin(token)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const companyIdResult = companyIdSchema.safeParse(
    request.nextUrl.searchParams.get("companyId"),
  );

  if (!companyIdResult.success) {
    return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
  }

  const companyId = companyIdResult.data;

  if (token.dataScope === "LOCAL") {
    return NextResponse.json({
      data: listLocalEligibleImpersonationEmployees(companyId),
    });
  }

  return authApiJson({
    method: "GET",
    path: `/auth/impersonation/employees/${companyId}`,
    errorMessage: "Failed to fetch impersonation employees",
  });
}
