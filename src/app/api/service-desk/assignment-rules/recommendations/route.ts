import { NextRequest, NextResponse } from "next/server";

import { toApiErrorResponse } from "@/app/api/_helpers";
import { portalApiJson } from "@/app/api/_helpers/portalApiJson";
import {
  resolveServiceDeskSettingsPrincipal,
  toCurrentUsernameProxyHeaders,
  tServiceDeskApi,
} from "@/app/api/service-desk/_shared";
import type { AssignmentRecommendationInput } from "@/feature/serviceDesk/assignmentRule";
import { resolveLocalAssignmentRecommendation } from "@/server/serviceDesk/settings/assignmentRule/localDemo/recommendation";
import { isLocale } from "@/shared/utils/i18n";

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
          message: tServiceDeskApi(
            "api.assignmentRecommendations.invalidInput",
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
      errorMessage: tServiceDeskApi("api.assignmentRecommendations.fetch"),
    });
  } catch (error) {
    return toApiErrorResponse(error, {
      fallbackMessage: tServiceDeskApi("api.assignmentRecommendations.fetch"),
    });
  }
}
