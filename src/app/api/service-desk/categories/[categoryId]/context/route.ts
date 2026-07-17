import { NextRequest, NextResponse } from "next/server";

import { getAuthToken } from "@/app/api/_adapters";
import { portalApiJson } from "@/app/api/_adapters/backend";
import { RouteContext } from "@/app/api/_adapters/http";
import { getServiceDeskCategoryContext as getLocalServiceDeskCategoryContext } from "@/app/api/_adapters/localDemo/serviceDesk/eligibility";
import { resolveApiErrorMessage } from "@/lib/application/api";

type CategoryContextRouteContext = RouteContext<{ categoryId: string }>;

export async function GET(
  request: NextRequest,
  context: CategoryContextRouteContext,
) {
  const token = await getAuthToken(request);

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const categoryId = context.params.categoryId.trim();

  if (!categoryId) {
    return NextResponse.json(
      { message: "A category id is required." },
      { status: 400 },
    );
  }

  if (token.dataScope === "LOCAL") {
    const categoryContext =
      await getLocalServiceDeskCategoryContext(categoryId);

    return categoryContext
      ? NextResponse.json(categoryContext)
      : NextResponse.json({ message: "Category not found." }, { status: 404 });
  }

  return portalApiJson(request, {
    path: `/service-desk/categories/${encodeURIComponent(categoryId)}/context`,
    errorMessage: resolveApiErrorMessage("serviceDesk.categories.fetchList"),
  });
}
