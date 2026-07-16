import { NextRequest, NextResponse } from "next/server";

import { resolveLocalAssignmentRecommendation } from "@/app/api/_adapters/localDemo/serviceDesk/settings/assignmentRule/recommendation";
import {
  resolveApiErrorMessage,
  resolveServiceDeskSettingsPrincipal,
  toCurrentUsernameProxyHeaders,
} from "@/app/api/_adapters/serviceDesk";
import { toApiErrorResponse } from "@/app/api/_adapters";
import { portalApiJson } from "@/app/api/_adapters/backend";
import type { AssignmentRecommendationInput } from "@/lib/application/contracts/serviceDesk";
import { isLocale } from "@/lib/application/i18n";

const parseRecommendationInput = async (
  request: NextRequest,
): Promise<AssignmentRecommendationInput | null> => {
  const payload =
    (await request.json()) as Partial<AssignmentRecommendationInput>;

  if (typeof payload.categoryId !== "string") {
    return null;
  }

  if (!Array.isArray(payload.assigneeUsernames)) {
    return null;
  }

  const categoryId = payload.categoryId.trim();

  if (!categoryId) {
    return null;
  }

  const assigneeUsernames = payload.assigneeUsernames
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);
  const language =
    typeof payload.language === "string" && isLocale(payload.language)
      ? payload.language
      : undefined;

  return {
    categoryId,
    assigneeUsernames,
    ...(language ? { language } : {}),
  };
};

export async function POST(request: NextRequest) {
  try {
    const principalContext = await resolveServiceDeskSettingsPrincipal(request);
    const input = await parseRecommendationInput(request);

    if (!input) {
      return NextResponse.json(
        {
          message: resolveApiErrorMessage(
            "serviceDesk.assignmentRecommendations.invalidInput",
          ),
        },
        { status: 400 },
      );
    }

    if (principalContext.dataScope === "LOCAL") {
      return NextResponse.json(
        await resolveLocalAssignmentRecommendation({ input }),
      );
    }

    return portalApiJson(request, {
      method: "POST",
      path: "/service-desk/assignment-rules/recommendations",
      headers: toCurrentUsernameProxyHeaders(
        principalContext.effectiveUsername,
      ),
      body: input,
      errorMessage: resolveApiErrorMessage("serviceDesk.assignmentRecommendations.fetch"),
    });
  } catch (error) {
    return toApiErrorResponse(error, {
      fallbackMessage: resolveApiErrorMessage("serviceDesk.assignmentRecommendations.fetch"),
    });
  }
}
