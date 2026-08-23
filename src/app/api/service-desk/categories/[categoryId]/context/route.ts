import { NextRequest, NextResponse } from "next/server";

import { toApiErrorResponse } from "@/app/api/_adapters";
import { portalApiJson } from "@/app/api/_adapters/backend";
import { RouteContext } from "@/app/api/_adapters/http";
import { getServiceDeskCategoryContext as getLocalServiceDeskCategoryContext } from "@/app/api/_adapters/localDemo/serviceDesk/eligibility";
import {
  canAccessOperationalServiceDeskCategory,
  resolveServiceDeskRequestContext,
} from "@/app/api/_adapters/serviceDesk";
import { resolveApiErrorMessage } from "@/lib/application/api";

type CategoryContextRouteContext = RouteContext<{ categoryId: string }>;

/** Handles GET /api/service-desk/categories/[categoryId]/context; authorization and runtime adapter selection remain at this HTTP boundary. */
export async function GET(
  request: NextRequest,
  context: CategoryContextRouteContext,
) {
  try {
    const principalContext = await resolveServiceDeskRequestContext(request);

    const { categoryId: rawCategoryId } = await context.params;
    const categoryId = rawCategoryId.trim();

    if (!categoryId) {
      return NextResponse.json(
        { message: "A category id is required." },
        { status: 400 },
      );
    }

    if (principalContext.dataScope === "LOCAL") {
      const categoryContext =
        await getLocalServiceDeskCategoryContext(categoryId);

      return categoryContext &&
        canAccessOperationalServiceDeskCategory({
          principal: principalContext.principal,
          category: categoryContext,
        })
        ? NextResponse.json(categoryContext)
        : NextResponse.json(
            { message: "Category not found." },
            { status: 404 },
          );
    }

    return portalApiJson(request, {
      path: `/service-desk/categories/${encodeURIComponent(categoryId)}/context`,
      errorMessage: resolveApiErrorMessage("serviceDesk.categories.fetchList"),
    });
  } catch (error) {
    return toApiErrorResponse(error, {
      fallbackMessage: resolveApiErrorMessage(
        "serviceDesk.categories.fetchList",
      ),
    });
  }
}
