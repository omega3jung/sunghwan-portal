import { NextRequest, NextResponse } from "next/server";

import type { AssignmentRecommendationInput } from "@/api/serviceDesk/assignmentRule";
import { isInternalUser, isRemoteRequest, proxyJson } from "@/app/api/_helpers";
import { tServiceDesk } from "@/app/api/service-desk/messages";
import { isLocale } from "@/shared/utils/language";

import { resolveLocalAssignmentRecommendation } from "./localDemo";

const parseRecommendationInput = async (
  request: NextRequest,
): Promise<AssignmentRecommendationInput | null> => {
  const payload =
    (await request.json()) as Partial<AssignmentRecommendationInput>;

  if (typeof payload.categoryId !== "string") {
    return null;
  }

  if (!Array.isArray(payload.assigneeIds)) {
    return null;
  }

  const categoryId = payload.categoryId.trim();

  if (!categoryId) {
    return null;
  }

  const assigneeIds = payload.assigneeIds
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);
  const language =
    typeof payload.language === "string" && isLocale(payload.language)
      ? payload.language
      : undefined;

  return {
    categoryId,
    assigneeIds,
    ...(language ? { language } : {}),
  };
};

export async function POST(request: NextRequest) {
  const input = await parseRecommendationInput(request);

  if (!input) {
    return NextResponse.json(
      {
        message: tServiceDesk("api.assignmentRecommendations.invalidInput"),
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
    errorMessage: tServiceDesk("api.assignmentRecommendations.fetch"),
  });
}
