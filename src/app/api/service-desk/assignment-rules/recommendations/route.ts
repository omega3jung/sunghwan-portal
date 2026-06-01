import { NextRequest, NextResponse } from "next/server";

import { isInternalUser, isRemoteRequest, proxyJson } from "@/app/api/_helpers";
import { tServiceDeskApi } from "@/app/api/service-desk/_shared/messages";
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
  const input = await parseRecommendationInput(request);

  if (!input) {
    return NextResponse.json(
      {
        message: tServiceDeskApi("api.assignmentRecommendations.invalidInput"),
      },
      { status: 400 },
    );
  }

  const isRemote = await isRemoteRequest(request);

  if (!isRemote) {
    const isInternal = await isInternalUser(request);

    return NextResponse.json(
      resolveLocalAssignmentRecommendation({
        input,
        isInternal,
      }),
    );
  }

  return proxyJson(request, {
    method: "POST",
    path: "/service-desk/assignment-rules/recommendations",
    body: input,
    errorMessage: tServiceDeskApi("api.assignmentRecommendations.fetch"),
  });
}
